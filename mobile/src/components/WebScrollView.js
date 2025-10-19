import React from 'react';
import { ScrollView, Platform } from 'react-native';

/**
 * Custom ScrollView component that handles web scrolling properly
 * Fixes scroll issues on mobile web browsers
 */
const WebScrollView = ({ children, style, contentContainerStyle, ...props }) => {
  // Unified ScrollView for all platforms with platform-specific adjustments
  return (
    <ScrollView
      style={[
        { flex: 1 },
        Platform.OS === 'web' && {
          height: '100vh',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch',
        },
        style,
      ]}
      contentContainerStyle={[
        Platform.OS === 'web' && {
          minHeight: '100%',
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={true}
      bounces={Platform.OS !== 'web'}
      nestedScrollEnabled={true}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default WebScrollView;