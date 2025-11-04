const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve Stripe module to empty module on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@stripe/stripe-react-native') {
    return {
      type: 'empty',
    };
  }

  // Use default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// Performance optimizations for web
if (process.env.NODE_ENV === 'production') {
  // Enable minification
  config.transformer = {
    ...config.transformer,
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        keep_classnames: false,
        keep_fnames: false,
      },
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 3,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
  };

  // Optimize code splitting
  config.serializer = {
    ...config.serializer,
    // Create separate bundles for better caching
    createModuleIdFactory: () => {
      return (path) => {
        // Use hashed IDs for better long-term caching
        const crypto = require('crypto');
        return crypto.createHash('md5').update(path).digest('hex').substring(0, 8);
      };
    },
  };
}

module.exports = config;