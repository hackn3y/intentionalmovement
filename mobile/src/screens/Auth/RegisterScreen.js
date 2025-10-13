import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { register, clearError } from '../../store/slices/authSlice';
import { registerSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { useEnterToSubmit } from '../../hooks/useKeyboardShortcuts';

/**
 * Register screen component with email/password registration
 */
const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handle registration submit
   * @param {Object} values - Form values
   */
  const handleRegister = async (values) => {
    try {
      const { firstName, lastName, confirmPassword, ...rest } = values;
      const userData = {
        ...rest,
        displayName: `${firstName} ${lastName}`.trim(),
      };
      await dispatch(register(userData)).unwrap();
      // Navigation is handled by RootNavigator
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  /**
   * Navigate to login screen
   */
  const handleLogin = () => {
    dispatch(clearError());
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
          <Logo size={60} style={styles.logo} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
            // Enable Enter key to submit
            useEnterToSubmit(handleSubmit, loading);

            return (
            <View style={styles.form}>
              <View style={styles.row}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName && errors.firstName}
                  autoCapitalize="words"
                  style={styles.halfInput}
                />

                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName && errors.lastName}
                  autoCapitalize="words"
                  style={styles.halfInput}
                />
              </View>

              <Input
                label="Username"
                placeholder="Choose a username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                error={touched.username && errors.username}
                autoCapitalize="none"
                autoComplete="username"
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title="Create Account"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Sign up with Google"
                variant="outline"
                onPress={() => {}}
                icon="google"
                style={styles.socialButton}
              />

              <Button
                title="Sign up with Apple"
                variant="outline"
                onPress={() => {}}
                icon="apple"
              />
            </View>
          );
        }}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
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
    marginBottom: SIZES.xl,
    alignItems: 'center',
  },
  logo: {
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[500],
  },
  form: {
    marginBottom: SIZES.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  halfInput: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: COLORS.danger + '20',
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginBottom: SIZES.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    textAlign: 'center',
  },
  registerButton: {
    marginBottom: SIZES.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    marginHorizontal: SIZES.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[500],
  },
  socialButton: {
    marginBottom: SIZES.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  footerLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  terms: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SIZES.md,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
