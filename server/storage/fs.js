const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const { pipeline } = require('stream');

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

  // pipeline rather than pipe, for the same reason download.js uses it: one
  // completion callback covering success, abort and error alike.
  //
  // The abort case is what pipe() got wrong here. routes/ws.js destroys the
  // source stream whenever the socket closes with anything but 1000, and
  // destroy() with no argument emits 'close', not 'error'. pipe() neither ends
  // nor destroys its destination on that, so this promise resolved on 'finish'
  // and rejected on the write stream's 'error' and hit neither: it never
  // settled, the write stream was orphaned with its fd still open, and because
  // the fd was held the reaper's unlink freed the name but none of the disk
  // blocks. Closing a tab mid-upload produces close code 1006, so it needed no
  // authentication and no crafted input to reach, and disk use grew
  // monotonically until a restart. pipeline watches both ends for premature
  // close, destroys the whole chain and calls back with
  // ERR_STREAM_PREMATURE_CLOSE.
  //
  // unlink is the async form and deliberately ignores its own error. This
  // callback runs outside any promise executor, so a throw from it is uncaught
  // and ends the process, which is exactly what unlinkSync did whenever the
  // write stream failed at open and left no file to remove: ENOENT. The default
  // file_dir lives under the OS temp directory and is created once in the
  // constructor, so a /tmp sweeper removing it under a running server turned
  // every subsequent upload into a crash.
  set(id, file) {
    const filepath = path.join(this.dir, id);
    return new Promise((resolve, reject) => {
      pipeline(file, fs.createWriteStream(filepath), err => {
        if (!err) {
          return resolve();
        }
        // storage/index.js writes the redis record only after this resolves, so
        // a failure here leaves a file no metadata points at. Remove it now
        // rather than waiting for the reaper's grace period.
        fs.unlink(filepath, () => reject(err));
      });
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
