const TailwindExtractor = content => {
  return content.match(/[A-Za-z0-9-_:/]+/g) || [];
};

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
    require('@fullhuman/postcss-purgecss')({
      // Anything rendering markup has to be listed here, or purgecss strips the
      // Tailwind classes it uses and the page renders unstyled. This is a silent
      // failure: the build succeeds, lint passes and the tests pass.
      //
      // These globs used to be one level deep, so moving a component into
      // app/ui/archiveTile/ was enough to lose its styles. `**` now covers any
      // depth. The android/ entries went with the directory in #38.
      content: ['./app/**/*.js'],
      extractors: [
        {
          extractor: TailwindExtractor,
          extensions: ['js']
        }
      ]
    })
  );
  options.plugins.push(
    require('cssnano')({
      preset: 'default'
    })
  );
}

module.exports = options;
