// The staging screen: files chosen, not yet uploaded. The password field lives
// here because this is the only screen that renders it.
const html = require('choo/html');
const assets = require('../../../common/assets');
const { bytes, list } = require('../../utils');
const expiryOptions = require('../expiryOptions');
const { fileInfo } = require('./shared');

function password(state) {
  const MAX_LENGTH = 4096;

  return html`
    <div class="mb-2 px-1">
      <input
        id="autocomplete-decoy"
        class="hidden"
        type="password"
        value="lol"
      />
      <div class="checkbox inline-block mr-3">
        <input
          id="add-password"
          type="checkbox"
          ${state.archive.password ? 'checked' : ''}
          autocomplete="off"
          onchange="${togglePasswordInput}"
        />
        <label for="add-password">
          ${state.translate('addPassword')}
        </label>
      </div>
      <div class="relative inline-block my-1">
        <input
          id="password-input"
          class="${state.archive.password
            ? ''
            : 'invisible'} border-default rounded-default focus:border-primary leading-normal my-1 py-1 px-2 h-8 dark:bg-grey-80"
          autocomplete="off"
          maxlength="${MAX_LENGTH}"
          type="password"
          oninput="${inputChanged}"
          onfocus="${focused}"
          placeholder="${state.translate('unlockInputPlaceholder')}"
          value="${state.archive.password || ''}"
        />
        <button
          id="password-preview-button"
          type="button"
          class="${state.archive.password
            ? ''
            : 'invisible'} absolute top-0 right-0 w-8 h-8"
          onclick="${onPasswordPreviewButtonclicked}"
        >
          <img
            src="${assets.get('eye.svg')}"
            width="22"
            height="22"
            class="m-auto mt-2"
          />
        </button>
      </div>
      <label
        id="password-msg"
        for="password-input"
        class="block text-xs text-grey-70"
      ></label>
    </div>
  `;

  function onPasswordPreviewButtonclicked(event) {
    event.preventDefault();
    const input = document.getElementById('password-input');
    const eyeIcon = event.currentTarget.querySelector('img');

    if (input.type === 'password') {
      input.type = 'text';
      eyeIcon.src = assets.get('eye-off.svg');
    } else {
      input.type = 'password';
      eyeIcon.src = assets.get('eye.svg');
    }

    input.focus();
  }

  function togglePasswordInput(event) {
    event.stopPropagation();
    const checked = event.target.checked;
    const input = document.getElementById('password-input');
    const passwordPreviewButton = document.getElementById(
      'password-preview-button'
    );
    if (checked) {
      input.classList.remove('invisible');
      passwordPreviewButton.classList.remove('invisible');
      input.focus();
    } else {
      input.classList.add('invisible');
      passwordPreviewButton.classList.add('invisible');
      input.value = '';
      document.getElementById('password-msg').textContent = '';
      state.archive.password = null;
    }
  }

  function inputChanged() {
    const passwordInput = document.getElementById('password-input');
    const pwdmsg = document.getElementById('password-msg');
    const password = passwordInput.value;
    const length = password.length;

    if (length === MAX_LENGTH) {
      pwdmsg.textContent = state.translate('maxPasswordLength', {
        length: MAX_LENGTH
      });
    } else {
      pwdmsg.textContent = '';
    }
    state.archive.password = password;
  }

  function focused(event) {
    event.preventDefault();
    const el = document.getElementById('password-input');
    if (el.placeholder !== state.translate('unlockInputPlaceholder')) {
      el.placeholder = '';
    }
  }
}

module.exports = function(state, emit) {
  return html`
    <send-upload-area
      class="flex flex-col bg-white h-full w-full dark:bg-grey-90"
      id="wip"
    >
      ${list(
        Array.from(state.archive.files)
          .reverse()
          .map(f =>
            fileInfo(f, remove(f, state.translate('deleteButtonHover')))
          ),
        'flex-shrink bg-grey-10 rounded-t overflow-y-auto px-6 py-4 md:h-full md:max-h-half-screen dark:bg-black',
        'bg-white px-2 my-2 shadow-light rounded-default dark:bg-grey-90 dark:border-default dark:border-grey-80'
      )}
      <div
        class="flex-shrink-0 flex-grow flex items-end p-4 bg-grey-10 rounded-b mb-1 font-medium dark:bg-grey-90"
      >
        <input
          id="file-upload"
          class="opacity-0 w-0 h-0 appearance-none absolute overflow-hidden"
          type="file"
          multiple
          onfocus="${focus}"
          onblur="${blur}"
          onchange="${add}"
        />
        <div
          for="file-upload"
          class="flex flex-row items-center justify-between w-full p-2"
        >
          <label
            for="file-upload"
            class="flex items-center cursor-pointer"
            title="${state.translate('addFilesButton')}"
          >
            <svg class="w-6 h-6 mr-2 link-primary">
              <use xlink:href="${assets.get('addfiles.svg')}#plus" />
            </svg>
            ${state.translate('addFilesButton')}
          </label>
          <div class="font-normal text-sm text-grey-70 dark:text-grey-40">
            ${state.translate('totalSize', {
              size: bytes(state.archive.size)
            })}
          </div>
        </div>
      </div>
      ${expiryOptions(state, emit)} ${password(state, emit)}
      <button
        id="upload-btn"
        class="btn rounded-lg flex-shrink-0 focus:outline"
        title="${state.translate('uploadButton')}"
        onclick="${upload}"
      >
        ${state.translate('uploadButton')}
      </button>
    </send-upload-area>
  `;

  function focus(event) {
    event.target.nextElementSibling.firstElementChild.classList.add('outline');
  }

  function blur(event) {
    event.target.nextElementSibling.firstElementChild.classList.remove(
      'outline'
    );
  }

  function upload(event) {
    window.scrollTo(0, 0);
    event.preventDefault();
    event.target.disabled = true;
    if (!state.uploading) {
      emit('upload');
    }
  }

  function add(event) {
    event.preventDefault();
    const newFiles = Array.from(event.target.files);

    emit('addFiles', { files: newFiles });
    setTimeout(() => {
      document
        .querySelector('#wip > ul > li:first-child')
        .scrollIntoView({ block: 'center' });
    });
  }

  function remove(file, desc) {
    return html`
      <input
        type="image"
        class="self-center text-white ml-4 h-4 hover:opacity-75 focus:outline"
        alt="${desc}"
        title="${desc}"
        src="${assets.get('close-16.svg')}"
        onclick="${del}"
      />
    `;
    function del(event) {
      event.stopPropagation();
      emit('removeUpload', file);
    }
  }
};
