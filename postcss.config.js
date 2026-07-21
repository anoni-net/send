// Tailwind 3's JIT engine scans the `content` globs in tailwind.config.js and
// generates only the classes actually used, which is what the separate
// @fullhuman/postcss-purgecss step used to do. The custom TailwindExtractor
// that handled `/` in class names (w-1/2) is no longer needed either: Tailwind's
// own extractor covers it.
const options = {
  plugins: [
    require('tailwindcss')('./tailwind.config.js'),
    require('postcss-preset-env')
  ]
};

if (process.env.NODE_ENV === 'development') {
  options.map = { inline: true };
} else {
  options.plugins.push(
    require('cssnano')({
      preset: 'default'
    })
  );
}

module.exports = options;
