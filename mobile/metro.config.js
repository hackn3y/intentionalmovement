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

module.exports = config;