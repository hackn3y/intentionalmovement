import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { register, clearError, loginWithFirebase } from '../../store/slices/authSlice';
import { registerSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { useEnterToSubmit } from '../../hooks/useKeyboardShortcuts';
import { useGoogleAuth, getFirebaseAuthData } from '../../utils/googleAuth';
import { isAppleAuthAvailable, signInWithApple, getFirebaseAuthDataFromApple } from '../../utils/appleAuth';
import WebScrollView from '../../components/WebScrollView';

/**
 * Register screen component with email/password registration
 */
const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Initialize Google Auth
  const { request, response, promptAsync } = useGoogleAuth();

  // Check Apple auth availability
  useEffect(() => {
    checkAppleAuth();
  }, []);

  const checkAppleAuth = async () => {
    const available = await isAppleAuthAvailable();
    setAppleAvailable(available);
  };

  /**
   * Handle Google authentication response
   */
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      Alert.alert('Authentication Error', 'Failed to sign in with Google. Please try again.');
      setGoogleLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setGoogleLoading(false);
    }
  }, [response]);

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
   * Handle Google Sign In
   * @param {Object} authentication - Google authentication data
   */
  const handleGoogleSignIn = async (authentication) => {
    try {
      setGoogleLoading(true);
      const firebaseData = await getFirebaseAuthData(authentication);
      await dispatch(loginWithFirebase(firebaseData)).unwrap();
      // Navigation is handled by RootNavigator
    } catch (err) {
      console.error('Google sign-in failed:', err);
      Alert.alert('Sign In Failed', err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Initiate Google Sign In flow
   */
  const handleGooglePress = async () => {
    try {
      if (!request) {
        Alert.alert(
          'Configuration Required',
          'Google Sign-In is not configured. Please add your Google Web Client ID to the mobile app .env file.'
        );
        return;
      }
      setGoogleLoading(true);
      await promptAsync();
    } catch (err) {
      console.error('Error starting Google sign-in:', err);
      Alert.alert('Error', 'Failed to start Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Apple Sign In
   */
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      const appleAuth = await signInWithApple();
      const firebaseData = getFirebaseAuthDataFromApple(appleAuth);
      await dispatch(loginWithFirebase(firebaseData)).unwrap();
      // Navigation is handled by RootNavigator
    } catch (err) {
      console.error('Apple sign-in failed:', err);
      if (err.message !== 'Apple sign-in was canceled') {
        Alert.alert('Sign In Failed', err.message || 'Failed to sign in with Apple. Please try again.');
      }
    } finally {
      setAppleLoading(false);
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
    <View style={styles.container}>
      <WebScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size={Platform.OS === 'web' ? 400 : 300} style={styles.logo} />
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
                onPress={handleGooglePress}
                loading={googleLoading}
                disabled={googleLoading || loading}
                icon="google"
                style={styles.socialButton}
              />

              {appleAvailable && (
                <Button
                  title="Sign up with Apple"
                  variant="outline"
                  onPress={handleAppleSignIn}
                  loading={appleLoading}
                  disabled={appleLoading || loading || googleLoading}
                  icon="apple"
                />
              )}
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
      </WebScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 3,
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
    color: COLORS.accent,
    fontWeight: '600',
  },
  terms: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SIZES.md,
  },
  termsLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },
});

export default RegisterScreen;
