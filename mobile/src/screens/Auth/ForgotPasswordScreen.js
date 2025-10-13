import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Input from '../../components/Input';
import Button from '../../components/Button';

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

/**
 * Forgot password screen for password reset
 */
const ForgotPasswordScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Handle password reset request
   * @param {Object} values - Form values
   */
  const handleResetPassword = async (values) => {
    try {
      setLoading(true);

      // TODO: Call password reset API
      // await authService.forgotPassword(values.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setEmailSent(true);

      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email address.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {emailSent
              ? 'Check your email for reset instructions'
              : 'No worries, we\'ll send you reset instructions'}
          </Text>
        </View>

        {!emailSent ? (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <Input
                  label="Email"
                  placeholder="Enter your email address"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoFocus
                />

                <Button
                  title="Reset Password"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.resetButton}
                />

                <TouchableOpacity
                  onPress={handleBackToLogin}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>

            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>
              We've sent password reset instructions to your email address.
              Please check your inbox and follow the link to reset your password.
            </Text>

            <Button
              title="Back to Login"
              onPress={handleBackToLogin}
              style={styles.backToLoginButton}
            />

            <TouchableOpacity
              onPress={() => setEmailSent(false)}
              style={styles.resendButton}
            >
              <Text style={styles.resendText}>Didn't receive the email? Resend</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            Having trouble? <Text style={styles.helpLink}>Contact Support</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SIZES.xxl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
  },
  form: {
    marginBottom: SIZES.xl,
  },
  resetButton: {
    marginTop: SIZES.md,
    marginBottom: SIZES.lg,
  },
  backButton: {
    alignItems: 'center',
    padding: SIZES.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  successIconText: {
    fontSize: 40,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.sm,
  },
  successText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SIZES.xl,
    paddingHorizontal: SIZES.md,
    lineHeight: 24,
  },
  backToLoginButton: {
    width: '100%',
    marginBottom: SIZES.lg,
  },
  resendButton: {
    padding: SIZES.sm,
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: SIZES.xxl,
    alignItems: 'center',
  },
  helpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  helpLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
