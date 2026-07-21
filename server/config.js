const convict = require('convict');
const convict_format_with_validator = require('convict-format-with-validator');
const { tmpdir } = require('os');
const path = require('path');
const { randomBytes } = require('crypto');

convict.addFormats(convict_format_with_validator);

convict.addFormat({
  name: 'positive-int-array',
  coerce: ints => {
    // can take: int[] | string[] | string (csv), returns -> int[]
    const ints_arr = Array.isArray(ints) ? ints : ints.trim().split(',');
    return ints_arr.map(int =>
      typeof int === 'number'
        ? int
        : parseInt(int.replace(/['"]+/g, '').trim(), 10)
    );
  },
  validate: ints => {
    // takes: int[], errors if any NaNs, negatives, or floats present
    for (const int of ints) {
      if (typeof int !== 'number' || isNaN(int) || int < 0 || int % 1 > 0)
        throw new Error('must be a comma-separated list of positive integers');
    }
  }
});

const conf = convict({
  s3_bucket: {
    format: String,
    default: '',
    env: 'S3_BUCKET'
  },
  s3_endpoint: {
    format: String,
    default: '',
    env: 'S3_ENDPOINT'
  },
  s3_use_path_style_endpoint: {
    format: Boolean,
    default: false,
    env: 'S3_USE_PATH_STYLE_ENDPOINT'
  },
  gcs_bucket: {
    format: String,
    default: '',
    env: 'GCS_BUCKET'
  },
  expire_times_seconds: {
    format: 'positive-int-array',
    default: [300, 3600, 86400, 604800],
    env: 'EXPIRE_TIMES_SECONDS'
  },
  default_expire_seconds: {
    format: Number,
    default: 86400,
    env: 'DEFAULT_EXPIRE_SECONDS'
  },
  max_expire_seconds: {
    format: Number,
    default: 86400 * 7,
    env: 'MAX_EXPIRE_SECONDS'
  },
  download_counts: {
    format: 'positive-int-array',
    default: [1, 2, 3, 4, 5, 20, 50, 100],
    env: 'DOWNLOAD_COUNTS'
  },
  default_downloads: {
    format: Number,
    default: 1,
    env: 'DEFAULT_DOWNLOADS'
  },
  max_downloads: {
    format: Number,
    default: 100,
    env: 'MAX_DOWNLOADS'
  },
  max_files_per_archive: {
    format: Number,
    default: 64,
    env: 'MAX_FILES_PER_ARCHIVE'
  },
  max_archives_per_user: {
    format: Number,
    default: 16,
    env: 'MAX_ARCHIVES_PER_USER'
  },
  redis_host: {
    format: String,
    default: 'localhost',
    env: 'REDIS_HOST'
  },
  redis_port: {
    format: Number,
    default: 6379,
    env: 'REDIS_PORT'
  },
  redis_user: {
    format: String,
    default: '',
    env: 'REDIS_USER'
  },
  redis_password: {
    format: String,
    default: '',
    env: 'REDIS_PASSWORD'
  },
  redis_db: {
    format: String,
    default: '',
    env: 'REDIS_DB'
  },
  redis_retry_time: {
    format: Number,
    default: 10000,
    env: 'REDIS_RETRY_TIME'
  },
  redis_retry_delay: {
    format: Number,
    default: 500,
    env: 'REDIS_RETRY_DELAY'
  },
  listen_address: {
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'IP_ADDRESS'
  },
  // Number of reverse proxies in front of Send, passed to express's
  // `trust proxy`. req.ip (the rate-limit key) is only correct when this matches
  // the deployment: too high lets a client spoof its IP via X-Forwarded-For, too
  // low makes everyone behind the proxy share one IP. `0`/`false` = no proxy;
  // `1` = one reverse proxy (the setup in docs/deployment.md); `2` = e.g.
  // Cloudflare in front of a local proxy. A comma-separated list of trusted IPs
  // or subnets also works. Parsed in server/routes/index.js.
  trust_proxy: {
    format: String,
    default: '1',
    env: 'TRUST_PROXY'
  },
  // Per-IP rate limits (fixed window). The general limit covers the HTTP API
  // (download, metadata, exists, delete, ...); the upload limit covers the
  // WebSocket upload, which is the expensive disk-writing path. Set a max to 0
  // to disable that limiter.
  rate_limit_window_seconds: {
    format: Number,
    default: 60,
    env: 'RATE_LIMIT_WINDOW_SECONDS'
  },
  rate_limit_max: {
    format: Number,
    default: 100,
    env: 'RATE_LIMIT_MAX'
  },
  upload_rate_limit_max: {
    format: Number,
    default: 20,
    env: 'UPLOAD_RATE_LIMIT_MAX'
  },
  listen_port: {
    format: 'port',
    default: 1443,
    arg: 'port',
    env: 'PORT'
  },
  env: {
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  // The encrypted file metadata (name, type, size, and the manifest for a
  // multi-file archive) is stored in redis as-is. It was previously unbounded:
  // ws only caps a message at its 100 MiB default, so one request could write
  // 100 MiB into redis, and nothing rate-limits how often.
  //
  // Measured worst legitimate case: 64 files (MAX_FILES_PER_ARCHIVE) with
  // 255-character names comes to roughly 27 KB, extrapolated from 550 bytes for
  // 2 files and 1799 bytes for 8. 64 KiB leaves that 2.4x of headroom.
  max_metadata_size: {
    format: Number,
    default: 64 * 1024,
    env: 'MAX_METADATA_SIZE'
  },
  max_file_size: {
    format: Number,
    default: 1024 * 1024 * 1024 * 2.5,
    env: 'MAX_FILE_SIZE'
  },
  // redis holds the only expiry TTL. When it fires the metadata hash vanishes,
  // but nothing in the download or delete paths removes the file it pointed at,
  // so an uploaded-but-never-downloaded file would sit on disk forever. A
  // periodic sweep (filesystem backend only) deletes files whose redis record
  // is gone. Set the interval to 0 to disable it, e.g. when an external
  // mechanism handles cleanup. S3/GCS deployments use bucket lifecycle rules.
  reap_interval_seconds: {
    format: Number,
    default: 900,
    env: 'REAP_INTERVAL_SECONDS'
  },
  // A file is written before its redis key, so a just-finished upload can
  // momentarily have no key. Only files older than this grace window are
  // considered orphaned, which keeps the sweep from deleting a live upload.
  reap_grace_seconds: {
    format: Number,
    default: 900,
    env: 'REAP_GRACE_SECONDS'
  },
  l10n_dev: {
    format: Boolean,
    default: false,
    env: 'L10N_DEV'
  },
  base_url: {
    format: 'url',
    default: 'https://send.example.com',
    env: 'BASE_URL'
  },
  custom_title: {
    format: String,
    default: 'Send',
    env: 'CUSTOM_TITLE'
  },
  custom_description: {
    format: String,
    default:
      'Encrypt and send files with a link that automatically expires to ensure your important documents don’t stay online forever.',
    env: 'CUSTOM_DESCRIPTION'
  },
  detect_base_url: {
    format: Boolean,
    default: false,
    env: 'DETECT_BASE_URL'
  },
  file_dir: {
    format: 'String',
    default: `${tmpdir()}${path.sep}send-${randomBytes(4).toString('hex')}`,
    env: 'FILE_DIR'
  },
  footer_donate_url: {
    format: String,
    default: '',
    env: 'SEND_FOOTER_DONATE_URL'
  },
  footer_cli_url: {
    format: String,
    default: 'https://github.com/timvisee/ffsend',
    env: 'SEND_FOOTER_CLI_URL'
  },
  footer_dmca_url: {
    format: String,
    default: '',
    env: 'SEND_FOOTER_DMCA_URL'
  },
  footer_source_url: {
    format: String,
    // Points at the source this build was made from, which is what a visitor
    // auditing the page is actually running. Operators serving a modified
    // build should override this with their own repository.
    default: 'https://github.com/anoni-net/send',
    env: 'SEND_FOOTER_SOURCE_URL'
  },
  custom_footer_text: {
    format: String,
    default: '',
    env: 'CUSTOM_FOOTER_TEXT'
  },
  custom_footer_url: {
    format: String,
    default: '',
    env: 'CUSTOM_FOOTER_URL'
  },
  main_notice_html: {
    format: String,
    default: '',
    env: 'SEND_MAIN_NOTICE_HTML'
  },
  upload_area_notice_html: {
    format: String,
    default: '',
    env: 'SEND_UPLOAD_AREA_NOTICE_HTML'
  },
  uploads_list_notice_html: {
    format: String,
    default: '',
    env: 'SEND_UPLOADS_LIST_NOTICE_HTML'
  },
  download_notice_html: {
    format: String,
    default: '',
    env: 'SEND_DOWNLOAD_NOTICE_HTML'
  },
  ui_color_primary: {
    format: String,
    default: '#0a84ff',
    env: 'UI_COLOR_PRIMARY'
  },
  ui_color_accent: {
    format: String,
    default: '#003eaa',
    env: 'UI_COLOR_ACCENT'
  },
  custom_locale: {
    format: String,
    default: '',
    env: 'CUSTOM_LOCALE'
  },
  ui_custom_assets: {
    android_chrome_192px: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_ANDROID_CHROME_192PX'
    },
    android_chrome_512px: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_ANDROID_CHROME_512PX'
    },
    apple_touch_icon: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_APPLE_TOUCH_ICON'
    },
    favicon_16px: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_FAVICON_16PX'
    },
    favicon_32px: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_FAVICON_32PX'
    },
    icon: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_ICON'
    },
    safari_pinned_tab: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_SAFARI_PINNED_TAB'
    },
    facebook: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_FACEBOOK'
    },
    twitter: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_TWITTER'
    },
    wordmark: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_ASSETS_WORDMARK'
    },
    custom_css: {
      format: String,
      default: '',
      env: 'UI_CUSTOM_CSS'
    }
  }
});

// Perform validation
conf.validate({ allowed: 'strict' });

const props = conf.getProperties();

const deriveBaseUrl = req => {
  if (!props.detect_base_url) {
    return props.base_url;
  }

  const protocol = req.secure ? 'https://' : 'http://';
  return `${protocol}${req.headers.host}`;
};

module.exports = {
  ...props,
  deriveBaseUrl
};
