import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { SIZES, FONT_SIZES } from '../config/constants';
import { useTheme } from '../context/ThemeContext';
import { GoogleIcon, AppleIcon } from './BrandIcons';

/**
 * Reusable button component
 * @param {Object} props - Component props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Press handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.variant - Button variant (primary, outline, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {string} props.icon - Icon name (optional)
 * @param {Object} props.style - Custom style
 */
const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = getStyles(colors);

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    switch (variant) {
      case 'outline':
        baseStyle.push(dynamicStyles.buttonOutline);
        break;
      case 'text':
        baseStyle.push(styles.buttonText);
        break;
      default:
        baseStyle.push(dynamicStyles.buttonPrimary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonTitle, styles[`buttonTitle_${size}`]];

    switch (variant) {
      case 'outline':
        baseStyle.push(dynamicStyles.buttonTitleOutline);
        break;
      case 'text':
        baseStyle.push(dynamicStyles.buttonTitleText);
        break;
      default:
        baseStyle.push(dynamicStyles.buttonTitlePrimary);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonTitleDisabled);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <View style={styles.iconContainer}>
              {icon === 'google' ? (
                <GoogleIcon size={20} />
              ) : icon === 'apple' ? (
                <AppleIcon size={20} color={variant === 'primary' ? colors.white : colors.text} />
              ) : (
                <Text style={[...getTextStyle(), styles.icon]}>{icon}</Text>
              )}
            </View>
          )}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Static styles (not dependent on theme)
const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    minHeight: 36,
  },
  button_medium: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    minHeight: 48,
  },
  button_large: {
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    minHeight: 56,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SIZES.sm,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
  },
  buttonTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTitle_small: {
    fontSize: FONT_SIZES.sm,
  },
  buttonTitle_medium: {
    fontSize: FONT_SIZES.md,
  },
  buttonTitle_large: {
    fontSize: FONT_SIZES.lg,
  },
  buttonTitleDisabled: {
    opacity: 1,
  },
});

// Dynamic styles (dependent on theme colors)
const getStyles = (colors) => StyleSheet.create({
  buttonPrimary: {
    backgroundColor: colors.accent || colors.primary, // Use accent (pink) for buttons
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent || colors.primary, // Use accent (pink) for outlines
  },
  buttonTitlePrimary: {
    color: colors.white,
  },
  buttonTitleOutline: {
    color: colors.accent || colors.primary, // Use accent (pink) for text
  },
  buttonTitleText: {
    color: colors.accent || colors.primary, // Use accent (pink) for text
  },
});

export default Button;
