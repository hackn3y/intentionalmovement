module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', {
        // Use modern JavaScript for web builds
        web: {
          useTransformReactJSXExperimental: true,
        },
      }],
    ],
    // Target modern browsers to reduce polyfills
    env: {
      production: {
        presets: [
          ['@babel/preset-env', {
            targets: {
              // Target browsers that support ES2015+ (removes most polyfills)
              browsers: [
                'last 2 Chrome versions',
                'last 2 Firefox versions',
                'last 2 Safari versions',
                'last 2 Edge versions',
              ],
            },
            // Don't transform modules (let bundler handle it)
            modules: false,
            // Only include polyfills that are actually used
            useBuiltIns: 'usage',
            corejs: 3,
          }],
        ],
      },
    },
  };
};
