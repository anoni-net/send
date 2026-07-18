import { browserName, locale } from './utils';

async function checkCrypto() {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 128
      },
      true,
      ['encrypt', 'decrypt']
    );
    await crypto.subtle.exportKey('raw', key);
    await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(12)),
        tagLength: 128
      },
      key,
      new ArrayBuffer(8)
    );
    await crypto.subtle.importKey(
      'raw',
      crypto.getRandomValues(new Uint8Array(16)),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    await crypto.subtle.importKey(
      'raw',
      crypto.getRandomValues(new Uint8Array(16)),
      'HKDF',
      false,
      ['deriveKey']
    );
    await crypto.subtle.generateKey(
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      true,
      ['deriveBits']
    );
    return true;
  } catch (err) {
    // No fallback on purpose. This used to load asmcrypto.js plus a WebCrypto
    // shim so that browsers without native WebCrypto could still encrypt. That
    // meant some visitors had their files encrypted by a JavaScript
    // reimplementation of the primitives, which cannot offer the side-channel
    // properties of a native one, and no visitor could tell which they got.
    //
    // Every browser this app targets has had WebCrypto for years. A browser
    // without it now goes to /unsupported/crypto instead, so encryption here is
    // always the browser's own.
    return false;
  }
}

function checkStreams() {
  try {
    new ReadableStream({
      pull() {}
    });
    return true;
  } catch (e) {
    return false;
  }
}

async function polyfillStreams() {
  try {
    await import('@mattiasbuelens/web-streams-polyfill');
    return true;
  } catch (e) {
    return false;
  }
}

export default async function getCapabilities() {
  const browser = browserName();
  const isMobile = /mobi|android/i.test(navigator.userAgent);
  const serviceWorker = 'serviceWorker' in navigator && browser !== 'edge';
  let crypto = await checkCrypto();
  const nativeStreams = checkStreams();
  let polyStreams = false;
  if (!nativeStreams) {
    polyStreams = await polyfillStreams();
  }
  const share =
    isMobile &&
    typeof navigator.share === 'function' &&
    locale().startsWith('en'); // en until strings merge

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone;

  const mobileFirefox = browser === 'firefox' && isMobile;

  return {
    crypto,
    serviceWorker,
    streamUpload: nativeStreams || polyStreams,
    streamDownload:
      nativeStreams && serviceWorker && browser !== 'safari' && !mobileFirefox,
    multifile: nativeStreams || polyStreams,
    share,
    standalone
  };
}
