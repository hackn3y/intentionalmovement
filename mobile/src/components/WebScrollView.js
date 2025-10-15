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
        Platform.OS === 'web' && {
          flex: 1,
          height: '100%',
        },
        style,
      ]}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={true}
      bounces={Platform.OS !== 'web'}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default WebScrollView;