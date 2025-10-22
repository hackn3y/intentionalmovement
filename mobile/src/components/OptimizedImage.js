import React, { useState } from 'react';
import { Image, View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Optimized Image component with lazy loading and placeholder
 * Improves Lighthouse performance scores
 */
const OptimizedImage = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  placeholder = true,
  ...props 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {loading && placeholder && (
        <View style={[styles.placeholder, style]}>
          <ActivityIndicator size="small" color="#ec4899" />
        </View>
      )}
      <Image
        source={source}
        style={[style, { opacity: loading ? 0 : 1 }]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

export default OptimizedImage;
