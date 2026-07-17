const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VersionPlugin = require('./build/version_plugin');
const AndroidIndexPlugin = require('./build/android_index_plugin');

const webJsOptions = {
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        useBuiltIns: 'entry',
        corejs: 3
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'module:nanohtml',
    ['@babel/plugin-proposal-class-properties', { loose: false }]
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
    path: require.resolve('path-browserify')
  }
};
const provideBuffer = new webpack.ProvidePlugin({
  Buffer: ['buffer', 'Buffer']
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
    // android: ['./android/android.js'],
    // ios: ['./ios/ios.js']
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
              path.resolve(
                __dirname,
                'node_modules/@dannycoates/webcrypto-liner'
              ),
              path.resolve(__dirname, 'node_modules/@fluent'),
              path.resolve(__dirname, 'node_modules/intl-pluralrules')
            ],
            options: webJsOptions
          },
          {
            // Strip asserts from our deps, mainly choojs family
            include: [path.resolve(__dirname, 'node_modules')],
            exclude: [
              path.resolve(__dirname, 'node_modules/crc'),
              path.resolve(__dirname, 'node_modules/@fluent'),
              path.resolve(__dirname, 'node_modules/@sentry'),
              path.resolve(__dirname, 'node_modules/tslib'),
              path.resolve(__dirname, 'node_modules/webcrypto-core')
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
    new AndroidIndexPlugin(),
    new WebpackManifestPlugin() // used by server side to resolve hashed assets
  ],
  devtool: 'source-map',
  devServer: {
    before:
      process.env.NODE_ENV === 'development' && require('./server/bin/dev'),
    compress: true,
    hot: false,
    host: '0.0.0.0',
    proxy: {
      '/api/ws': {
        target: 'ws://localhost:8081',
        ws: true,
        secure: false
      }
    }
  }
};

module.exports = (env, argv) => {
  const mode = argv.mode || 'production';
  // eslint-disable-next-line no-console
  console.error(`mode: ${mode}`);
  process.env.NODE_ENV = web.mode = serviceWorker.mode = mode;
  if (mode === 'development') {
    // istanbul instruments the source for code coverage
    webJsOptions.plugins.push('istanbul');
    web.entry.tests = ['./test/frontend/index.js'];
  }
  return [web, serviceWorker];
};
