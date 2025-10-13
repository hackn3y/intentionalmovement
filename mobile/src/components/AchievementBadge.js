import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * Achievement badge component with icon and rarity
 * @param {Object} props - Component props
 * @param {Object} props.achievement - Achievement data
 * @param {string} props.size - Badge size (small, medium, large)
 */
const AchievementBadge = ({ achievement, size = 'medium' }) => {
  const rarityColors = {
    common: COLORS.gray[400],
    rare: COLORS.info,
    epic: COLORS.secondary,
    legendary: COLORS.warning,
  };

  const sizes = {
    small: { badge: 60, icon: 30, title: FONT_SIZES.xs },
    medium: { badge: 80, icon: 40, title: FONT_SIZES.sm },
    large: { badge: 100, icon: 50, title: FONT_SIZES.md },
  };

  const badgeSize = sizes[size];
  const badgeColor = rarityColors[achievement.rarity] || COLORS.gray[400];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: badgeSize.badge,
            height: badgeSize.badge,
            borderRadius: badgeSize.badge / 2,
            backgroundColor: badgeColor + '20',
            borderColor: badgeColor,
          },
        ]}
      >
        <Text style={[styles.icon, { fontSize: badgeSize.icon }]}>
          {achievement.icon}
        </Text>
      </View>

      <Text
        style={[styles.title, { fontSize: badgeSize.title }]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>

      {achievement.unlocked && (
        <Text style={styles.unlocked}>✓</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SIZES.sm,
  },
  icon: {
    textAlign: 'center',
  },
  title: {
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
  },
  unlocked: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
  },
});

export default AchievementBadge;
