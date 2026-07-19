const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

class FSStorage {
  constructor(config, log) {
    this.log = log;
    this.dir = config.file_dir;
    fs.mkdirSync(this.dir, {
      recursive: true
    });
  }

  async length(id) {
    const result = await stat(path.join(this.dir, id));
    return result.size;
  }

  getStream(id) {
    return fs.createReadStream(path.join(this.dir, id));
  }

  set(id, file) {
    return new Promise((resolve, reject) => {
      const filepath = path.join(this.dir, id);
      const fstream = fs.createWriteStream(filepath);
      file.pipe(fstream);
      file.on('error', err => {
        fstream.destroy(err);
      });
      fstream.on('error', err => {
        fs.unlinkSync(filepath);
        reject(err);
      });
      fstream.on('finish', resolve);
    });
  }

  del(id) {
    return Promise.resolve(fs.unlinkSync(path.join(this.dir, id)));
  }

  // Names and mtimes of the stored files, so the reaper can find ones whose
  // redis record has expired. Its presence is what marks a backend as
  // cheaply sweepable; S3/GCS omit it and rely on bucket lifecycle rules.
  async list() {
    const names = await readdir(this.dir);
    const entries = [];
    for (const name of names) {
      try {
        const s = await stat(path.join(this.dir, name));
        if (s.isFile()) {
          entries.push({ name, mtimeMs: s.mtimeMs });
        }
      } catch (e) {
        // Vanished between readdir and stat (e.g. a concurrent download hit its
        // limit and deleted it): nothing to reap, skip it.
      }
    }
    return entries;
  }

  ping() {
    return Promise.resolve();
  }
}

module.exports = FSStorage;
