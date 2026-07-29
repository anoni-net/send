import assert from 'assert';
import Zip from '../../../app/zip';

describe('Zip', function() {
  it('reports a size larger than the plaintext total', function() {
    // This inequality is why the service worker held on to key material after
    // an archive download. Progress is counted on the zip stream while the
    // entry's `size` is the plaintext sum, so a `progress === size` test never
    // became true and the entry, holding the raw secret, the plaintext password
    // and the full share URL, was never dropped.
    //
    // Zip.size is `Σ(size + 2 * (nameLength + 46)) + 22`, so the gap is
    // structural: it holds for any file list, not just large ones.
    const files = [
      { name: 'a.txt', size: 10 },
      { name: 'b.txt', size: 20 }
    ];
    const plaintextTotal = files.reduce((total, f) => total + f.size, 0);

    const zip = new Zip({ files }, null);

    assert.ok(
      zip.size > plaintextTotal,
      `zip ${zip.size} should exceed plaintext ${plaintextTotal}`
    );
  });

  it('reports a larger size even for a single small file', function() {
    const files = [{ name: 'a', size: 1 }];
    const zip = new Zip({ files }, null);
    assert.ok(zip.size > 1);
  });
});
