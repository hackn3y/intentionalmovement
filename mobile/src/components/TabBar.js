import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

/**
 * Custom tab bar for bottom navigation
 * @param {Object} props - Component props
 */
const TabBar = ({ state, descriptors, navigation }) => {
  const iconMap = {
    Home: '🏠',
    Programs: '📚',
    Messages: '💬',
    Profile: '👤',
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <Text style={styles.icon}>
              {iconMap[route.name] || '•'}
            </Text>
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingBottom: SIZES.sm,
    paddingTop: SIZES.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default TabBar;
