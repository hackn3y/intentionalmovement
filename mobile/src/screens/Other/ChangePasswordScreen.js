import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import api from '../../services/api';

const ChangePasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePasswords = () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (Platform.OS === 'web') {
        window.alert('Password changed successfully!');
      } else {
        Alert.alert('Success', 'Password changed successfully!');
      }

      navigation.goBack();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Change Password</Text>
        <Text style={styles.description}>
          Choose a strong password to keep your account secure
        </Text>

        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Text style={styles.eyeText}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={styles.eyeText}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Must be at least 8 characters long</Text>
        </View>

        {/* Confirm New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsBox}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirement}>• At least 8 characters</Text>
          <Text style={styles.requirement}>• Different from current password</Text>
          <Text style={styles.requirement}>• Recommended: Include numbers and special characters</Text>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.changeButton, loading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.changeButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.gray[50],
    },
    content: {
      padding: SIZES.lg,
    },
    header: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700',
      color: colors.dark,
      marginBottom: SIZES.sm,
    },
    description: {
      fontSize: FONT_SIZES.md,
      color: colors.gray[600],
      marginBottom: SIZES.xl,
    },
    inputGroup: {
      marginBottom: SIZES.lg,
    },
    label: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.dark,
      marginBottom: SIZES.sm,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: SIZES.sm,
      borderWidth: 1,
      borderColor: colors.gray[300],
    },
    input: {
      flex: 1,
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.md,
      fontSize: FONT_SIZES.md,
      color: colors.dark,
    },
    eyeButton: {
      padding: SIZES.md,
    },
    eyeText: {
      fontSize: FONT_SIZES.lg,
    },
    hint: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[500],
      marginTop: SIZES.xs,
    },
    requirementsBox: {
      backgroundColor: colors.gray[100],
      padding: SIZES.md,
      borderRadius: SIZES.sm,
      marginBottom: SIZES.xl,
    },
    requirementsTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.dark,
      marginBottom: SIZES.xs,
    },
    requirement: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginTop: SIZES.xs,
    },
    changeButton: {
      backgroundColor: colors.primary,
      paddingVertical: SIZES.md,
      borderRadius: SIZES.sm,
      alignItems: 'center',
      marginBottom: SIZES.md,
    },
    changeButtonText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    cancelButton: {
      paddingVertical: SIZES.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.gray[600],
    },
  });

export default ChangePasswordScreen;
