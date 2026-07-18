import assert from 'assert';
import Archive from '../../../app/archive';
import { b64ToArray } from '../../../app/utils';
import { blobStream, concatStream } from '../../../app/streams';
import { decryptStream, encryptStream } from '../../../app/ece.js';
import { encryptedSize } from '../../../app/utils';

const rs = 36;

const str = 'You are the dancing queen, young and sweet, only seventeen.';
const testSalt = 'I1BsxtFttlv3u_Oo94xnmw';
const keystr = 'yqdlZ-tYemfogSmv7Ws5PQ';

const buffer = Buffer.from(str);

async function collect(stream) {
  const reader = stream.getReader();
  let result = Buffer.from([]);
  let state = await reader.read();
  while (!state.done) {
    result = Buffer.concat([result, Buffer.from(state.value)]);
    state = await reader.read();
  }
  return result;
}

describe('Streaming', function() {
  describe('blobStream', function() {
    it('reads the entire blob', async function() {
      const len = 12345;
      const chunkSize = 1024;
      const blob = new Blob([new Uint8Array(len)]);
      const stream = blobStream(blob, chunkSize);
      const reader = stream.getReader();
      let bytes = 0;
      let data = await reader.read();
      while (!data.done) {
        bytes += data.value.byteLength;
        assert.ok(data.value.byteLength <= chunkSize, 'chunk too big');
        data = await reader.read();
      }
      assert.equal(bytes, len);
    });
  });

  describe('concatStream', function() {
    it('reads all the streams', async function() {
      const count = 5;
      const len = 12345;
      const streams = Array.from({ length: count }, () =>
        blobStream(new Blob([new Uint8Array(len)]))
      );
      const concat = concatStream(streams);
      const reader = concat.getReader();
      let bytes = 0;
      let data = await reader.read();
      while (!data.done) {
        bytes += data.value.byteLength;
        data = await reader.read();
      }
      assert.equal(bytes, len * count);
    });
  });

  // App ECE self round-trip. This previously cross-checked against http_ece,
  // which is a node library that can't run in a browser; the round-trip below
  // exercises the same app code paths (encryptStream/decryptStream) end to end.
  describe('ECE', function() {
    const key = b64ToArray(keystr);
    const salt = b64ToArray(testSalt).buffer;

    it('encrypt then decrypt recovers the original', async function() {
      const src = new Archive([new Blob([str], { type: 'text/plain' })]).stream;
      const encrypted = await collect(encryptStream(src, key, rs, salt));

      assert.notDeepEqual(encrypted, buffer);
      assert.equal(encrypted.length, encryptedSize(buffer.length, rs));

      const decrypted = await collect(
        decryptStream(new Archive([new Blob([encrypted])]).stream, key, rs)
      );
      assert.deepEqual(decrypted, buffer);
    });
  });
});
