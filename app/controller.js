import FileReceiver from './fileReceiver';
import FileSender from './fileSender';
import copyDialog from './ui/copyDialog';
import faviconProgressbar from './ui/faviconProgressbar';
import okDialog from './ui/okDialog';
import shareDialog from './ui/shareDialog';
import { bytes } from './utils';
import { copyToClipboard, delay, openLinksInNewTab, percent } from './utils';

export default function(state, emitter) {
  let lastRender = 0;
  let updateTitle = false;

  function render() {
    emitter.emit('render');
  }

  async function checkFiles() {
    const changes = await state.storage.merge();
    const rerender = changes.incoming || changes.downloadCount;
    if (rerender) {
      render();
    }
  }

  function updateProgress() {
    if (updateTitle) {
      emitter.emit('DOMTitleChange', percent(state.transfer.progressRatio));
    }
    faviconProgressbar.updateFavicon(state.transfer.progressRatio);
    render();
  }

  emitter.on('DOMContentLoaded', () => {
    document.addEventListener('blur', () => (updateTitle = true));
    document.addEventListener('focus', () => {
      updateTitle = false;
      emitter.emit('DOMTitleChange', 'Send');
      faviconProgressbar.updateFavicon(0);
    });
    checkFiles();
  });

  emitter.on('render', () => {
    lastRender = Date.now();
  });

  emitter.on('removeUpload', file => {
    state.archive.remove(file);
    if (state.archive.numFiles === 0) {
      state.archive.clear();
    }
    render();
  });

  emitter.on('delete', async ownedFile => {
    try {
      state.storage.remove(ownedFile.id);
      await ownedFile.del();
    } catch (e) {
      console.error('delete failed', e);
    }
    render();
  });

  emitter.on('cancel', () => {
    state.transfer.cancel();
    faviconProgressbar.updateFavicon(0);
  });

  emitter.on('addFiles', async ({ files }) => {
    if (files.length < 1) {
      return;
    }
    const maxSize = state.LIMITS.MAX_FILE_SIZE;
    try {
      state.archive.addFiles(
        files,
        maxSize,
        state.LIMITS.MAX_FILES_PER_ARCHIVE
      );
    } catch (e) {
      state.modal = okDialog(
        state.translate(e.message, {
          size: bytes(maxSize),
          count: state.LIMITS.MAX_FILES_PER_ARCHIVE
        })
      );
    }
    render();
  });

  emitter.on('upload', async () => {
    if (state.storage.files.length >= state.LIMITS.MAX_ARCHIVES_PER_USER) {
      state.modal = okDialog(
        state.translate('tooManyArchives', {
          count: state.LIMITS.MAX_ARCHIVES_PER_USER
        })
      );
      return render();
    }
    const archive = state.archive;
    const sender = new FileSender();

    sender.on('progress', updateProgress);
    sender.on('encrypting', render);
    sender.on('complete', render);
    state.transfer = sender;
    state.uploading = true;
    render();

    const links = openLinksInNewTab();
    await delay(200);
    try {
      const ownedFile = await sender.upload(archive);
      faviconProgressbar.updateFavicon(0);

      state.storage.addFile(ownedFile);
      // TODO integrate password into /upload request
      if (archive.password) {
        emitter.emit('password', {
          password: archive.password,
          file: ownedFile
        });
      }
      state.modal = state.capabilities.share
        ? shareDialog(ownedFile.name, ownedFile.url)
        : copyDialog(ownedFile.name, ownedFile.url);
    } catch (err) {
      if (err.message === '0') {
        //cancelled. do nothing
        render();
      } else {
        console.error('upload failed', {
          error: err,
          duration: err.duration,
          size: err.size
        });
        emitter.emit('pushState', '/error');
      }
    } finally {
      openLinksInNewTab(links, false);
      archive.clear();
      /* eslint-disable-next-line require-atomic-updates --
         the upload tile replaces the upload button while this runs, so a second
         upload cannot start. */
      state.uploading = false;
      /* eslint-disable-next-line require-atomic-updates --
         not a false positive. state.transfer is shared with the download flow,
         and following a /download/:id link while an upload is still in flight
         lets this null out the receiver set below. The download UI reads that as
         "no transfer" rather than throwing, so it degrades instead of breaking.
         Left as-is: the fix is scoping transfer per flow, a behaviour change
         rather than a warning cleanup. */
      state.transfer = null;
      await state.storage.merge();
      render();
    }
  });

  emitter.on('password', async ({ password, file }) => {
    try {
      state.settingPassword = true;
      render();
      await file.setPassword(password);
      state.storage.writeFile(file);
      await delay(1000);
    } catch (err) {
      console.error('setting password failed', err);
    } finally {
      /* eslint-disable-next-line require-atomic-updates --
         the password field is disabled while the request is in flight. */
      state.settingPassword = false;
    }
    render();
  });

  emitter.on('getMetadata', async () => {
    const file = state.fileInfo;

    const receiver = new FileReceiver(file);
    try {
      await receiver.getMetadata();

      /* eslint-disable-next-line require-atomic-updates --
         see the note on the upload path above; this is the write that can be
         clobbered. */
      state.transfer = receiver;
    } catch (e) {
      if (e.message === '401' || e.message === '404') {
        file.password = null;
        if (!file.requiresPassword) {
          return emitter.emit('pushState', '/404');
        }
      } else {
        console.error(e);
        return emitter.emit('pushState', '/error');
      }
    }

    render();
  });

  emitter.on('download', async () => {
    state.transfer.on('progress', updateProgress);
    state.transfer.on('decrypting', render);
    state.transfer.on('complete', render);
    const links = openLinksInNewTab();
    try {
      const dl = state.transfer.download({
        stream: state.capabilities.streamDownload
      });
      render();
      await dl;
      faviconProgressbar.updateFavicon(0);
    } catch (err) {
      if (err.message === '0') {
        // download cancelled
        state.transfer.reset();
        render();
      } else {
        /* eslint-disable-next-line require-atomic-updates --
           same shared state.transfer as the upload path above. This branch is
           already navigating away to /error or /404, so a concurrent flow
           losing its receiver here changes nothing it was going to render. */
        state.transfer = null;
        const location = err.message === '404' ? '/404' : '/error';
        if (location === '/error') {
          console.error('download failed', {
            error: err,
            duration: err.duration,
            size: err.size,
            progress: err.progress
          });
        }
        emitter.emit('pushState', location);
      }
    } finally {
      openLinksInNewTab(links, false);
    }
  });

  emitter.on('copy', ({ url }) => {
    copyToClipboard(url);
  });

  emitter.on('closeModal', () => {
    state.modal = null;
    render();
  });

  setInterval(() => {
    // poll for updates of the upload list
    if (!state.modal && state.route === '/') {
      checkFiles();
    }
  }, 2 * 60 * 1000);

  setInterval(() => {
    // poll for rerendering the file list countdown timers
    if (
      !state.modal &&
      state.route === '/' &&
      state.storage.files.length > 0 &&
      Date.now() - lastRender > 30000
    ) {
      render();
    }
  }, 60000);
}
