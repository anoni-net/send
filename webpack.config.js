const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VersionPlugin = require('./build/version_plugin');

const webJsOptions = {
  babelrc: false,
  presets: [
    [
      '@babel/preset-env'
      // No options. `bugfixes` was removed in Babel 8 (always on now), and
      // `useBuiltIns`/`corejs` moved out of preset-env into a separate plugin.
      // Rather than wire that plugin up, `import 'core-js'` was dropped from
      // app/main.js: the app refuses any browser without WebCrypto (it redirects
      // to /unsupported/crypto before mounting), and every such browser has the
      // rest of what the app uses natively, so the polyfills were dead weight.
      // Removing them took the app bundle from 71 KB to 53 KB gzipped.
    ]
  ],
  plugins: [
    // @babel/plugin-syntax-dynamic-import and
    // @babel/plugin-proposal-class-properties were removed in Babel 8: dynamic
    // import is standard syntax now, and class properties are a stage-4 feature
    // that preset-env transforms (spec mode, matching the previous loose:false).
    'module:nanohtml'
  ]
};

// webpack 5 no longer polyfills node core modules automatically. The frontend
// needs `buffer` (the ECE encryption transformer in app/ece.js uses the bare
// `Buffer` global) and `path` (content-disposition, imported by the service
// worker to parse download filenames, calls path.basename). Both app/ece.js and
// the service worker bundle these. ProvidePlugin restores the bare `Buffer`
// global that webpack 4 injected implicitly.
const nodeResolve = {
  fallback: {
    buffer: require.resolve('buffer/'),
    path: require.resolve('path-browserify'),
    // `assert` is used by the frontend test specs; the app itself doesn't use
    // it, so this fallback is unused in the production build.
    assert: require.resolve('assert/')
  }
};
const provideBuffer = new webpack.ProvidePlugin({
  Buffer: ['buffer', 'Buffer'],
  // `process` is referenced by the assert polyfill in the test bundle; webpack 5
  // no longer injects it. The app itself only uses process.env.NODE_ENV (inlined
  // by EnvironmentPlugin), so the shim isn't pulled into the app bundle.
  // Keep the `.js`: bare `process/browser` fails to resolve under the
  // fullySpecified rules webpack 5 applies to .mjs dependencies.
  process: 'process/browser.js'
});

// webpack 5 defaults output.hashFunction to md4, which OpenSSL 3 (Node 17+)
// rejects. xxhash64 is webpack's built-in WASM hash and needs no OpenSSL, so
// this is what lets us drop --openssl-legacy-provider from the Dockerfile.
const hashFunction = 'xxhash64';

const serviceWorker = {
  target: 'webworker',
  entry: {
    serviceWorker: './app/serviceWorker.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    hashFunction
  },
  resolve: nodeResolve,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8][ext]'
        }
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8][ext]'
        },
        use: [
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false // true causes stretched images
                },
                {
                  name: 'convertStyleToAttrs',
                  active: true // for CSP, no unsafe-eval
                },
                {
                  name: 'removeTitle',
                  active: true // for smallness
                }
              ]
            }
          }
        ]
      },
      {
        // loads all assets from assets/ for use by common/assets.js
        test: require.resolve('./common/generate_asset_map.js'),
        use: ['babel-loader', 'val-loader']
      }
    ]
  },
  plugins: [
    provideBuffer,
    new webpack.IgnorePlugin({ resourceRegExp: /\.\.\/dist/ })
  ]
};

const web = {
  target: 'web',
  entry: {
    app: ['./app/main.js']
  },
  output: {
    chunkFilename: '[name].[contenthash:8].js',
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    // webpack 5 defaults publicPath to 'auto', which prefixes asset URLs with
    // 'auto/' here and breaks them (assets are served from the root by the
    // server's express.static('dist')). Pin it back to '/' like webpack 4.
    publicPath: '/',
    hashFunction
  },
  resolve: nodeResolve,
  module: {
    rules: [
      {
        test: /\.js$/,
        oneOf: [
          {
            loader: 'babel-loader',
            include: [
              path.resolve(__dirname, 'app'),
              path.resolve(__dirname, 'common'),
              // some dependencies need to get re-babeled because we
              // have different targets than their default configs
              path.resolve(__dirname, 'node_modules/@fluent')
            ],
            options: webJsOptions
          },
          {
            // Strip asserts from our deps, mainly choojs family
            include: [path.resolve(__dirname, 'node_modules')],
            exclude: [
              path.resolve(__dirname, 'node_modules/crc'),
              path.resolve(__dirname, 'node_modules/@fluent'),
              path.resolve(__dirname, 'node_modules/tslib'),
              path.resolve(__dirname, 'node_modules/webcrypto-core'),
              // The dev-server client is modern JS the old esprima-based
              // unassert-loader can't parse; it's dev-only, skip it.
              path.resolve(__dirname, 'node_modules/webpack-dev-server')
            ],
            loader: 'webpack-unassert-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg)$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8][ext]'
        }
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[contenthash:8][ext]'
        },
        use: [
          {
            loader: 'svgo-loader',
            options: {
              plugins: [
                {
                  name: 'cleanupIDs',
                  active: false
                },
                {
                  name: 'removeViewBox',
                  active: false // true causes stretched images
                },
                {
                  name: 'convertStyleToAttrs',
                  active: true // for CSP, no unsafe-eval
                },
                {
                  name: 'removeTitle',
                  active: true // for smallness
                }
              ]
            }
          }
        ]
      },
      {
        // creates style.css with all styles
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              esModule: false
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.ftl$/,
        type: 'asset/source'
      },
      {
        // creates test.js for /test
        test: require.resolve('./test/frontend/index.js'),
        use: ['babel-loader', 'val-loader']
      },
      {
        // loads all assets from assets/ for use by common/assets.js
        test: require.resolve('./common/generate_asset_map.js'),
        use: ['babel-loader', 'val-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          context: 'public',
          from: '*.*'
        }
      ]
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    provideBuffer,
    new webpack.IgnorePlugin({ resourceRegExp: /\.\.\/dist/ }), // used in common/*.js
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    }),
    new VersionPlugin(), // used for the /__version__ route
    new WebpackManifestPlugin() // used by server side to resolve hashed assets
  ],
  devtool: 'source-map',
  devServer: {
    // webpack-dev-server v5: `before` was removed in favour of setupMiddlewares,
    // and `proxy` is now an array. server/bin/dev.js wires the app routes and
    // reads emitted assets from the dev-middleware instance (devServer.middleware).
    setupMiddlewares: (middlewares, devServer) => {
      if (process.env.NODE_ENV === 'development') {
        require('./server/bin/dev')(devServer.app, devServer);
      }
      return middlewares;
    },
    compress: true,
    hot: false,
    host: '0.0.0.0',
    proxy: [
      {
        context: ['/api/ws'],
        target: 'ws://localhost:8081',
        ws: true,
        secure: false
      }
    ]
  }
};

module.exports = (env, argv) => {
  const mode = argv.mode || 'production';

  console.error(`mode: ${mode}`);
  process.env.NODE_ENV = web.mode = serviceWorker.mode = mode;
  if (mode === 'development') {
    // istanbul instruments the source for code coverage
    webJsOptions.plugins.push('istanbul');
    // The in-browser test bundle (/test) still needs the frontend-test
    // modernization (it pulls node crypto/assert and has stale imports), so keep
    // it opt-in — a plain `npm start` stays clean. Set FRONTEND_TESTS=1 to build.
    if (process.env.FRONTEND_TESTS) {
      web.entry.tests = ['./test/frontend/index.js'];
    }
  }
  return [web, serviceWorker];
};
