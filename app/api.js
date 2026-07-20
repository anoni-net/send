import { arrayToB64, b64ToArray, delay } from './utils';
import { ECE_RECORD_SIZE } from './ece';

export class ConnectionError extends Error {
  constructor(cancelled, duration, size) {
    super(cancelled ? '0' : 'connection closed');
    this.cancelled = cancelled;
    this.duration = duration;
    this.size = size;
  }
}

// A connection that never opened, as distinct from one that opened and then
// dropped. The distinction is the point: a refused or filtered connect is
// almost always something in front of the user rather than the server, and
// saying so is actionable where "something went wrong" is not.
export class ConnectFailedError extends Error {
  constructor() {
    super('connect-failed');
    this.cancelled = false;
  }
}

// Every failing request is reported to the UI as an Error whose message is the
// status, which is what the callers switch on. A 429 also carries Retry-After,
// and nothing read it, so the only thing the interface could say was "later".
// Carrying it here lets the message say how long instead.
export function statusError(status, headers) {
  const err = new Error(status);
  const value = headers && headers.get && Number(headers.get('Retry-After'));
  if (Number.isInteger(value) && value > 0) {
    err.retryAfter = value;
  }
  return err;
}

let apiUrlPrefix = '';
export function getApiUrl(path) {
  return apiUrlPrefix + path;
}

export function setApiUrlPrefix(prefix) {
  apiUrlPrefix = prefix;
}

function post(obj, bearerToken) {
  const h = {
    'Content-Type': 'application/json'
  };
  if (bearerToken) {
    h['Authorization'] = `Bearer ${bearerToken}`;
  }
  return {
    method: 'POST',
    headers: new Headers(h),
    body: JSON.stringify(obj)
  };
}

export function parseNonce(header) {
  header = header || '';
  return header.split(' ')[1];
}

async function fetchWithAuth(url, params, keychain) {
  const result = {};
  params = params || {};
  const h = await keychain.authHeader();

  // literal from the caller, not shared with anything else.
  /* eslint-disable-next-line require-atomic-updates --
     `params` is an object literal from the caller, not shared with anything. */
  params.headers = new Headers({
    Authorization: h,
    'Content-Type': 'application/json'
  });
  const response = await fetch(url, params);
  result.response = response;
  result.ok = response.ok;
  const nonce = parseNonce(response.headers.get('WWW-Authenticate'));
  result.shouldRetry = response.status === 401 && nonce !== keychain.nonce;

  // requests sharing a keychain can both read nonce N and both write back. The
  // consequence is a 401, which is exactly what shouldRetry above handles, and
  // fetchWithAuthAndRetry exists for it. Locking the keychain would buy nothing.
  /* eslint-disable-next-line require-atomic-updates --
     this one is real: two requests sharing a keychain can both read nonce N and
     both write back. The consequence is a 401, which is exactly what shouldRetry
     above handles and what fetchWithAuthAndRetry exists for. */
  keychain.nonce = nonce;
  return result;
}

async function fetchWithAuthAndRetry(url, params, keychain) {
  const result = await fetchWithAuth(url, params, keychain);
  if (result.shouldRetry) {
    return fetchWithAuth(url, params, keychain);
  }
  return result;
}

export async function del(id, owner_token) {
  const response = await fetch(
    getApiUrl(`/api/delete/${id}`),
    post({ owner_token })
  );
  return response.ok;
}

export async function setParams(id, owner_token, bearerToken, params) {
  const response = await fetch(
    getApiUrl(`/api/params/${id}`),
    post(
      {
        owner_token,
        dlimit: params.dlimit
      },
      bearerToken
    )
  );
  return response.ok;
}

export async function fileInfo(id, owner_token) {
  const response = await fetch(
    getApiUrl(`/api/info/${id}`),
    post({ owner_token })
  );

  if (response.ok) {
    const obj = await response.json();
    return obj;
  }

  throw new Error(response.status);
}

export async function metadata(id, keychain) {
  const result = await fetchWithAuthAndRetry(
    getApiUrl(`/api/metadata/${id}`),
    { method: 'GET' },
    keychain
  );
  if (result.ok) {
    const data = await result.response.json();
    const meta = await keychain.decryptMetadata(b64ToArray(data.metadata));
    return {
      size: meta.size,
      ttl: data.ttl,
      iv: meta.iv,
      name: meta.name,
      type: meta.type,
      manifest: meta.manifest
    };
  }
  throw statusError(result.response.status, result.response.headers);
}

export async function setPassword(id, owner_token, keychain) {
  const auth = await keychain.authKeyB64();
  const response = await fetch(
    getApiUrl(`/api/password/${id}`),
    post({ owner_token, auth })
  );
  return response.ok;
}

// Long enough that a slow mobile connection is not called a failure, short
// enough that a swallowed connect does not look like a hung app. A connect is
// a handshake, not a transfer, so it does not scale with the file.
const WS_CONNECT_TIMEOUT = 30000;
const CANCEL_POLL_INTERVAL = 250;

// This used to listen for 'open' and nothing else. `new WebSocket()` does not
// throw when a connection is refused or filtered: it fires 'error', then
// 'close'. So the promise never settled, upload() stayed awaiting it, and the
// upload tile sat at 0% with a Cancel button that could not help, because the
// cancel flag is only read further down the upload loop. Nothing short of a
// reload recovered.
//
// There are now four ways out: it opens, it fails, the user cancels, or it
// takes so long that something is almost certainly swallowing it.
export function asyncInitWebSocket(server, canceller = { cancelled: false }) {
  return new Promise((resolve, reject) => {
    let ws;
    let settled = false;
    let timer;
    let poll;

    // Returns true to the first caller only, so a socket that errors and then
    // closes settles once.
    function claim() {
      if (settled) {
        return false;
      }
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      return true;
    }

    function closeSocket() {
      if (ws && ![WebSocket.CLOSED, WebSocket.CLOSING].includes(ws.readyState)) {
        ws.close();
      }
    }

    function fail() {
      if (!claim()) {
        return;
      }
      closeSocket();
      reject(new ConnectFailedError());
    }

    timer = setTimeout(fail, WS_CONNECT_TIMEOUT);
    // cancel() only sets a flag, and while we are waiting on the socket nothing
    // else is reading it, so without this the button does nothing until the
    // connection resolves on its own.
    poll = setInterval(() => {
      if (!canceller.cancelled || !claim()) {
        return;
      }
      closeSocket();
      reject(new ConnectionError(true));
    }, CANCEL_POLL_INTERVAL);

    try {
      ws = new WebSocket(server);
    } catch (e) {
      return fail();
    }
    ws.addEventListener(
      'open',
      () => {
        if (claim()) {
          resolve(ws);
        }
      },
      { once: true }
    );
    ws.addEventListener('error', fail, { once: true });
    ws.addEventListener('close', fail, { once: true });
  });
}

function listenForResponse(ws, canceller) {
  return new Promise((resolve, reject) => {
    function handleClose(event) {
      // a 'close' event before a 'message' event means the request failed
      ws.removeEventListener('message', handleMessage);
      reject(new ConnectionError(canceller.cancelled));
    }
    function handleMessage(msg) {
      ws.removeEventListener('close', handleClose);
      try {
        const response = JSON.parse(msg.data);
        if (response.error) {
          throw new Error(response.error);
        } else {
          resolve(response);
        }
      } catch (e) {
        reject(e);
      }
    }
    ws.addEventListener('message', handleMessage, { once: true });
    ws.addEventListener('close', handleClose, { once: true });
  });
}

async function upload(
  stream,
  metadata,
  verifierB64,
  timeLimit,
  dlimit,
  bearerToken,
  onprogress,
  canceller
) {
  let size = 0;
  const start = Date.now();
  const host = window.location.hostname;
  const port = window.location.port;
  // A page opened from disk has no origin to derive an upload endpoint from.
  // This used to fall back to a hardcoded wss://send.firefox.com/api/ws, set at
  // a time when Mozilla ran that service; it has been shut down for years, so
  // the fallback pointed encrypted uploads at a host this project does not
  // control and could not reach. The only caller was the Android WebView, whose
  // build target no longer exists. Refusing is the honest answer: an upload from
  // file:// cannot work without a server either way.
  if (window.location.protocol === 'file:') {
    throw new Error(
      'Send cannot upload from a page opened directly from disk. Serve it over http(s).'
    );
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const endpoint = `${protocol}//${host}${port ? ':' : ''}${port}/api/ws`;

  const ws = await asyncInitWebSocket(endpoint, canceller);

  try {
    const metadataHeader = arrayToB64(new Uint8Array(metadata));
    const fileMeta = {
      fileMetadata: metadataHeader,
      authorization: `send-v1 ${verifierB64}`,
      bearer: bearerToken,
      timeLimit,
      dlimit
    };
    const uploadInfoResponse = listenForResponse(ws, canceller);
    ws.send(JSON.stringify(fileMeta));
    const uploadInfo = await uploadInfoResponse;

    const completedResponse = listenForResponse(ws, canceller);

    const reader = stream.getReader();
    let state = await reader.read();
    while (!state.done) {
      if (canceller.cancelled) {
        ws.close();
      }
      if (ws.readyState !== WebSocket.OPEN) {
        break;
      }
      const buf = state.value;
      ws.send(buf);
      onprogress(size);
      size += buf.length;
      state = await reader.read();
      while (
        ws.bufferedAmount > ECE_RECORD_SIZE * 2 &&
        ws.readyState === WebSocket.OPEN &&
        !canceller.cancelled
      ) {
        await delay();
      }
    }
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(new Uint8Array([0])); //EOF
    }

    await completedResponse;
    uploadInfo.duration = Date.now() - start;
    return uploadInfo;
  } catch (e) {
    e.size = size;
    e.duration = Date.now() - start;
    throw e;
  } finally {
    if (![WebSocket.CLOSED, WebSocket.CLOSING].includes(ws.readyState)) {
      ws.close();
    }
  }
}

export function uploadWs(
  encrypted,
  metadata,
  verifierB64,
  timeLimit,
  dlimit,
  bearerToken,
  onprogress
) {
  const canceller = { cancelled: false };

  return {
    cancel: function() {
      canceller.cancelled = true;
    },

    result: upload(
      encrypted,
      metadata,
      verifierB64,
      timeLimit,
      dlimit,
      bearerToken,
      onprogress,
      canceller
    )
  };
}

////////////////////////

async function downloadS(id, keychain, signal) {
  const auth = await keychain.authHeader();

  const response = await fetch(getApiUrl(`/api/download/${id}`), {
    signal: signal,
    method: 'GET',
    headers: { Authorization: auth }
  });

  const authHeader = response.headers.get('WWW-Authenticate');
  if (authHeader) {
    /* eslint-disable-next-line require-atomic-updates --
       as above: a stale nonce costs a retry, not access. */
    keychain.nonce = parseNonce(authHeader);
  }

  if (response.status !== 200) {
    throw statusError(response.status, response.headers);
  }

  return response.body;
}

async function tryDownloadStream(id, keychain, signal, tries = 2) {
  try {
    const result = await downloadS(id, keychain, signal);
    return result;
  } catch (e) {
    if (e.message === '401' && --tries > 0) {
      return tryDownloadStream(id, keychain, signal, tries);
    }
    if (e.name === 'AbortError') {
      throw new Error('0', { cause: e });
    }
    throw e;
  }
}

export function downloadStream(id, keychain) {
  const controller = new AbortController();
  function cancel() {
    controller.abort();
  }
  return {
    cancel,
    result: tryDownloadStream(id, keychain, controller.signal)
  };
}

//////////////////

async function download(id, keychain, onprogress, canceller) {
  const auth = await keychain.authHeader();
  const xhr = new XMLHttpRequest();
  canceller.oncancel = function() {
    xhr.abort();
  };
  return new Promise(function(resolve, reject) {
    xhr.addEventListener('loadend', function() {
      canceller.oncancel = function() {};
      const authHeader = xhr.getResponseHeader('WWW-Authenticate');
      if (authHeader) {
        keychain.nonce = parseNonce(authHeader);
      }
      if (xhr.status !== 200) {
        return reject(
          statusError(xhr.status, {
            get: name => xhr.getResponseHeader(name)
          })
        );
      }

      const blob = new Blob([xhr.response]);
      resolve(blob);
    });

    xhr.addEventListener('progress', function(event) {
      if (event.target.status === 200) {
        onprogress(event.loaded);
      }
    });
    xhr.open('get', getApiUrl(`/api/download/blob/${id}`));
    xhr.setRequestHeader('Authorization', auth);
    xhr.responseType = 'blob';
    xhr.send();
    onprogress(0);
  });
}

async function tryDownload(id, keychain, onprogress, canceller, tries = 2) {
  try {
    const result = await download(id, keychain, onprogress, canceller);
    return result;
  } catch (e) {
    if (e.message === '401' && --tries > 0) {
      return tryDownload(id, keychain, onprogress, canceller, tries);
    }
    throw e;
  }
}

export function downloadFile(id, keychain, onprogress) {
  const canceller = {
    oncancel: function() {} // download() sets this
  };
  function cancel() {
    canceller.oncancel();
  }
  return {
    cancel,
    result: tryDownload(id, keychain, onprogress, canceller)
  };
}

export async function getFileList(bearerToken, kid) {
  const headers = new Headers({ Authorization: `Bearer ${bearerToken}` });
  const response = await fetch(getApiUrl(`/api/filelist/${kid}`), { headers });
  if (response.ok) {
    const encrypted = await response.blob();
    return encrypted;
  }
  throw new Error(response.status);
}

export async function setFileList(bearerToken, kid, data) {
  const headers = new Headers({ Authorization: `Bearer ${bearerToken}` });
  const response = await fetch(getApiUrl(`/api/filelist/${kid}`), {
    headers,
    method: 'POST',
    body: data
  });
  return response.ok;
}

export async function getConstants() {
  const response = await fetch(getApiUrl('/config'));

  if (response.ok) {
    const obj = await response.json();
    return obj;
  }

  throw new Error(response.status);
}
