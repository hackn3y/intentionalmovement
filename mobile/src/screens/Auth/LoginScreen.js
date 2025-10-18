import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { login, clearError, loginWithFirebase } from '../../store/slices/authSlice';
import { loginSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { useEnterToSubmit } from '../../hooks/useKeyboardShortcuts';
import { useGoogleAuth, getFirebaseAuthData } from '../../utils/googleAuth';

/**
 * Login screen component
 */
const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth
  const { request, response, promptAsync } = useGoogleAuth();

  /**
   * Handle login submit
   * @param {Object} values - Form values
   */
  const handleLogin = async (values) => {
    try {
      // If the email field contains @, it's an email, otherwise it's a username
      const credentials = values.email.includes('@')
        ? { email: values.email, password: values.password }
        : { username: values.email, password: values.password };

      console.log('Attempting login with:', { ...credentials, password: '***' });
      await dispatch(login(credentials)).unwrap();
      // Navigation is handled by RootNavigator
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    }
  };

  /**
   * Navigate to register screen
   */
  const handleRegister = () => {
    dispatch(clearError());
    navigation.navigate('Register');
  };

  /**
   * Navigate to forgot password screen
   */
  const handleForgotPassword = () => {
    dispatch(clearError());
    navigation.navigate('ForgotPassword');
  };

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    try {
      if (!request) {
        Alert.alert(
          'Configuration Required',
          'Google Sign-In is not configured. Please contact support.'
        );
        return;
      }

      setGoogleLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Google auth response
   */
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        try {
          const authData = await getFirebaseAuthData(response.authentication);
          await dispatch(loginWithFirebase(authData)).unwrap();
          // Navigation is handled by RootNavigator
        } catch (error) {
          console.error('Google authentication failed:', error);
          Alert.alert('Error', 'Failed to authenticate with Google');
        } finally {
          setGoogleLoading(false);
        }
      } else if (response?.type === 'error' || response?.type === 'dismiss') {
        setGoogleLoading(false);
      }
    };

    handleGoogleResponse();
  }, [response, dispatch]);

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
          <Logo size={Platform.OS === 'web' ? 400 : 300} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
            // Enable Enter key to submit
            useEnterToSubmit(handleSubmit, loading);

            return (
            <View style={styles.form}>
              <Input
                label="Email or Username"
                placeholder="Enter your email or username"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
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

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Button
                title="Sign In"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Sign in with Google"
                variant="outline"
                onPress={handleGoogleSignIn}
                loading={googleLoading}
                disabled={googleLoading || loading || !request}
                icon="google"
                style={styles.socialButton}
              />

              {Platform.OS === 'ios' && (
                <Button
                  title="Sign in with Apple"
                  variant="outline"
                  onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In will be available soon')}
                  icon="apple"
                  style={styles.socialButton}
                />
              )}
            </View>
          );
        }}
        </Formik>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
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
    padding: SIZES.lg,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xxl * 3,
  },
  header: {
    marginBottom: SIZES.lg,
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
    marginBottom: SIZES.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
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
  loginButton: {
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
});

export default LoginScreen;
