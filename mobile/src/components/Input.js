import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable input component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {boolean} props.secureTextEntry - Password input
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.rightIcon - Right icon name
 * @param {Function} props.onRightIconPress - Right icon press handler
 * @param {boolean} props.multiline - Multiline input
 * @param {number} props.numberOfLines - Number of lines for multiline
 * @param {Object} props.style - Custom style
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  ...rest
}) => {
  const { colors, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = getStyles(colors, isDarkMode);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon} size={20} color={colors.gray[500]} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          // Remove default outline on web
          outlineStyle="none"
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: SIZES.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.sm,
    paddingHorizontal: SIZES.md,
    minHeight: 48,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: colors.accent || colors.primary,
    backgroundColor: colors.card,
  },
  inputContainerError: {
    borderColor: colors.danger || COLORS.danger,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: colors.text,
    paddingVertical: SIZES.sm,
    borderWidth: 0,
    outlineWidth: 0,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: SIZES.md,
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.xs,
  },
  inputWithRightIcon: {
    paddingRight: SIZES.xs,
  },
  leftIconContainer: {
    marginRight: SIZES.sm,
  },
  rightIconContainer: {
    marginLeft: SIZES.sm,
    padding: SIZES.xs,
  },
  icon: {
    fontSize: FONT_SIZES.lg,
    color: colors.gray[500],
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: colors.danger || COLORS.danger,
    marginTop: SIZES.xs,
  },
});

export default Input;
