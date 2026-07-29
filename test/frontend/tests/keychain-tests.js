import assert from 'assert';
import Keychain from '../../../app/keychain';

describe('Keychain', function() {
  describe('construction', function() {
    it('refuses to invent a key when it is given none', function() {
      // The receiving paths share this constructor. Manufacturing 16 random
      // bytes for a link whose #fragment had been stripped meant a junk HMAC, a
      // 401, and a recipient told the file had expired when it was sitting
      // there. Creating a key is the sender's job and is asked for by name.
      assert.throws(() => new Keychain());
      assert.throws(() => new Keychain(''));
    });

    it('generate() produces a usable keychain', async function() {
      const k = Keychain.generate();
      assert.ok(k.rawSecret instanceof Uint8Array);
      assert.equal(k.rawSecret.length, 16);
      assert.ok(await k.authKeyB64());
    });

    it('two generated keychains do not share a secret', function() {
      assert.notDeepEqual(
        Keychain.generate().rawSecret,
        Keychain.generate().rawSecret
      );
    });
  });

  describe('setPassword', function() {
    it('changes the authKey', async function() {
      const k = Keychain.generate();
      const original = await k.authKeyB64();
      k.setPassword('foo', 'some://url');
      const pwd = await k.authKeyB64();
      assert.notEqual(pwd, original);
    });
  });

  describe('encrypt / decrypt metadata', function() {
    it('can decrypt metadata it encrypts', async function() {
      const k = Keychain.generate();
      const meta = {
        name: 'foo',
        type: 'bar/baz'
      };
      const ciphertext = await k.encryptMetadata(meta);
      const result = await k.decryptMetadata(ciphertext);
      assert.equal(result.name, meta.name);
      assert.equal(result.type, meta.type);
    });
  });
});
