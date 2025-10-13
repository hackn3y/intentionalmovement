import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
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
  const initials = formatters.getInitials(firstName, lastName);

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

  return (
    <View style={[styles.container, avatarStyle, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, avatarStyle]} />
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
