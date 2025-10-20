import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES, API_URL } from '../config/constants';
import { formatters } from '../utils/formatters';

/**
 * User avatar component
 * @param {Object} props - Component props
 * @param {string} props.uri - Avatar image URI
 * @param {string} props.firstName - User first name
 * @param {string} props.lastName - User last name
 * @param {number} props.size - Avatar size
 * @param {boolean} props.showOnline - Show online indicator
 * @param {boolean} props.isOnline - Online status
 */
const UserAvatar = ({
  uri,
  firstName = '',
  lastName = '',
  size = 40,
  showOnline = false,
  isOnline = false,
  style,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const initials = formatters.getInitials(firstName, lastName);

  // Convert relative paths to full URLs for locally uploaded images
  const imageUri = React.useMemo(() => {
    if (!uri) return null;

    // If it's a base64 image (starts with data:), use it directly
    if (uri.startsWith('data:')) {
      return uri;
    }

    // If it's a relative path (starts with /uploads), convert to full URL
    if (uri.startsWith('/uploads')) {
      // For web, use window.location.origin to get the correct protocol and host
      // For mobile, use API_URL
      const baseUrl = typeof window !== 'undefined' && window.location
        ? window.location.origin.replace(':8081', ':3001') // Web: use current origin but port 3001
        : API_URL.replace('/api', ''); // Mobile: use API_URL
      const fullUrl = `${baseUrl}${uri}`;
      return fullUrl;
    }

    // Otherwise use the URI as-is (for Google images, etc.)
    return uri;
  }, [uri]);

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const initialsStyle = {
    fontSize: size * 0.4,
  };

  const onlineIndicatorStyle = {
    width: size * 0.25,
    height: size * 0.25,
    borderRadius: size * 0.125,
    borderWidth: size * 0.05,
  };

  // Reset error state when URI changes
  React.useEffect(() => {
    setImageError(false);
  }, [imageUri]);

  return (
    <View style={[styles.container, avatarStyle, style]}>
      {imageUri && !imageError ? (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, avatarStyle]}
          onError={(error) => {
            setImageError(true);
          }}
        />
      ) : (
        <View style={[styles.placeholder, avatarStyle]}>
          <Text style={[styles.initials, initialsStyle]}>{initials}</Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            onlineIndicatorStyle,
            isOnline ? styles.online : styles.offline,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: COLORS.white,
  },
  online: {
    backgroundColor: COLORS.success,
  },
  offline: {
    backgroundColor: COLORS.gray[400],
  },
});

export default UserAvatar;
