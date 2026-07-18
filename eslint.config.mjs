// Flat config (ESLint 9+). Replaces the former .eslintrc.yml files that lived
// at the repo root and in app/, test/, test/frontend/, scripts/ and android/.
//
// Two things to know when editing:
//   - Order matters. Later objects override earlier ones, so the shared
//     `js/n/security/prettier` presets come first and our overrides last.
//   - Flat config defaults `.js` to ESM. Most of this repo is CommonJS, so the
//     base block pins `sourceType: 'commonjs'` and the browser-side directories
//     opt back into modules.
import js from '@eslint/js';
import globals from 'globals';
import n from 'eslint-plugin-n';
import security from 'eslint-plugin-security';
import mocha from 'eslint-plugin-mocha';
import prettier from 'eslint-config-prettier';

const browserDirs = ['app/**/*.js', 'test/frontend/**/*.js', 'android/**/*.js'];

export default [
  {
    // Was .eslintignore.
    ignores: [
      'dist/',
      'assets/',
      'firefox/',
      'coverage/',
      'android/app/build/',
      'app/locale.js',
      'app/capabilities.js',
      'app/qrcode.js',

      // Dead webdriverio integration harness inherited from upstream, where it
      // was already stubbed out ("webdriverio tests need to be updated to node
      // 12"). It requires packages we no longer install, and Playwright
      // replaced it. Left in place rather than deleted; see issue backlog.
      'test/testServer.js',
      'test/wdio.*.conf.js',
      'test/wdio.*.config.js',
      'test/integration/'
    ]
  },

  js.configs.recommended,
  n.configs['flat/recommended'],
  security.configs.recommended,
  // Turns off the stylistic rules Prettier owns. Must stay last of the presets.
  prettier,

  {
    // Base: the CommonJS, Node-side majority (server/, build/, common/, config).
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node }
    },
    rules: {
      // The `n` plugin succeeds the deprecated `node` plugin; these were off
      // under the old config for the same reasons and stay off.
      'n/no-deprecated-api': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-unpublished-require': 'off',
      'n/no-unpublished-import': 'off',

      // Both are too noisy to be useful here: the paths are ours, and the
      // "object injection" heuristic fires on every dynamic property read.
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_|err|event|next|reject',
          // ESLint 9 flipped this default from 'none' to 'all', which flags
          // every `catch (e)` that ignores the error. This codebase does that
          // deliberately in a lot of places, so keep the previous behaviour
          // rather than change lint policy during a config migration.
          caughtErrors: 'none'
        }
      ],
      'require-atomic-updates': 'warn',

      // Both rules arrived with ESLint 9/10 and fire on long-standing patterns
      // rather than on anything newly written. Kept visible as warnings, to be
      // cleared in a dedicated pass:
      //   no-useless-assignment  - dead initialisers such as `let x = ''` that
      //     every branch overwrites. Dropping the initialiser turns an unread
      //     value into `undefined`, which is how the missing-logo bug rendered,
      //     so each one wants checking rather than a blanket rewrite.
      //   preserve-caught-error  - wants `{ cause }` on rethrows. Two of the
      //     three sites are the download-cancel path, where the thrown
      //     `Error(0)` is matched by message downstream.
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn'
    }
  },

  {
    // ESM-only files: our own tooling scripts and this config.
    files: ['**/*.mjs'],
    languageOptions: { sourceType: 'module' }
  },

  {
    // CI helpers. Browser globals because the bodies of Playwright's
    // page.evaluate() callbacks are serialized and run in the page.
    files: ['.github/scripts/**/*.mjs', '.github/scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'n/no-process-exit': 'off', 'no-console': 'off' }
  },

  {
    // Browser-side code: ES modules, DOM globals.
    files: browserDirs,
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    }
  },

  {
    ...mocha.configs.recommended,
    files: ['test/**/*.js'],
    languageOptions: {
      ...mocha.configs.recommended.languageOptions,
      globals: { ...globals.node, ...globals.mocha }
    },
    rules: {
      ...mocha.configs.recommended.rules,
      'n/no-unpublished-require': 'off',

      'mocha/handle-done-callback': 'error',
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-identical-title': 'warn',
      'mocha/no-mocha-arrows': 'error',
      'mocha/no-nested-tests': 'error',
      'mocha/no-pending-tests': 'error',
      'mocha/no-return-and-callback': 'warn',
      // `no-skipped-tests` was removed in eslint-plugin-mocha v11; the skipped
      // case is covered by `no-pending-tests` above.
      'mocha/no-setup-in-describe': 'off',
      'mocha/no-hooks-for-single-case': 'off',

      'no-console': 'off'
    }
  },

  {
    // These require build output (dist/manifest.json, dist/version.json) that
    // does not exist in a clean checkout. Handled here rather than with inline
    // disable comments on purpose: with dist/ present the comments become
    // "unused directives" and lint fails, so the result would depend on
    // whether you had run a build. `eslint --fix` deletes them in that state,
    // which is exactly how they went missing in the first place.
    files: ['common/assets.js', 'server/initScript.js', 'server/routes/index.js'],
    rules: { 'n/no-missing-require': 'off' }
  },

  {
    // Command-line tooling: exiting with a status code and printing is the job.
    files: ['scripts/**/*.js', 'test/frontend/runner.js'],
    rules: {
      'n/hashbang': 'off',
      'n/no-process-exit': 'off',
      'security/detect-child-process': 'off',
      'no-console': 'off',
      'no-process-exit': 'off'
    }
  }
];
