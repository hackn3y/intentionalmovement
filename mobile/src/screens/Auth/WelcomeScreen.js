import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Button from '../../components/Button';

const { width, height } = Dimensions.get('window');

/**
 * Welcome/Onboarding screen with app introduction
 */
const WelcomeScreen = ({ navigation }) => {
  console.log('WelcomeScreen: Component is rendering');

  /**
   * Navigate to login screen
   */
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  /**
   * Navigate to register screen
   */
  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={Platform.OS !== 'web'}
    >
        {/* Hero Section with Gradient */}
        {Platform.OS === 'web' ? (
          <View style={[styles.heroGradient, { backgroundColor: '#10b981' }]}>
            <View style={styles.heroSection}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.mainTagline}>
                Elevate Your LifeStyle
              </Text>
              <Text style={styles.subtitle}>
                Embrace the Power of Intentional Living
              </Text>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={styles.heroGradient}
          >
            <View style={styles.heroSection}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.mainTagline}>
                Elevate Your LifeStyle
              </Text>
              <Text style={styles.subtitle}>
                Embrace the Power of Intentional Living
              </Text>
            </View>
          </LinearGradient>
        )}

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <Text style={styles.valueTitle}>
            Create a life of achievement, success, class, health, and elevation
          </Text>
          <Text style={styles.valueDescription}>
            Through intentional decisions, the possibilities are endless.
            We provide personalized guidance to help you break down barriers
            and achieve your personal and professional goals.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💪</Text>
            </View>
            <Text style={styles.featureTitle}>Wellness Programs</Text>
            <Text style={styles.featureDescription}>
              Expert-led fitness and wellness programs tailored to your goals
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎯</Text>
            </View>
            <Text style={styles.featureTitle}>Personal Development</Text>
            <Text style={styles.featureDescription}>
              Holistic approach to lifestyle improvement and personal growth
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🌟</Text>
            </View>
            <Text style={styles.featureTitle}>Community Support</Text>
            <Text style={styles.featureDescription}>
              Connect with like-minded individuals on their transformation journey
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🏆</Text>
            </View>
            <Text style={styles.featureTitle}>Track Progress</Text>
            <Text style={styles.featureDescription}>
              Achievements, challenges, and milestones to celebrate your growth
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Begin Your Journey"
            onPress={handleRegister}
            style={styles.primaryButton}
          />

          <Button
            title="Sign In"
            variant="outline"
            onPress={handleLogin}
            style={styles.secondaryButton}
          />

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SIZES.xxl * 2,
  },
  heroGradient: {
    width: '100%',
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xxl,
    minHeight: Platform.OS === 'web' ? 300 : 250,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  logoContainer: {
    marginBottom: SIZES.sm,
  },
  logo: {
    width: width * 0.5,
    height: 60,
  },
  logoImage: {
    width: Platform.OS === 'web' ? 400 : width * 0.8,
    height: Platform.OS === 'web' ? 150 : 100,
    marginBottom: SIZES.lg,
  },
  logoBox: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.xs,
    marginBottom: SIZES.lg,
    alignItems: 'center',
  },
  logoBoxText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  logoText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: SIZES.sm,
  },
  mainTagline: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SIZES.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  valueSection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.light,
    minHeight: 150,
  },
  valueTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#ec4899',
    textAlign: 'center',
    marginBottom: SIZES.md,
    lineHeight: FONT_SIZES.lg * 1.4,
  },
  valueDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    textAlign: 'center',
    lineHeight: FONT_SIZES.sm * 1.6,
    fontWeight: '400',
  },
  featuresSection: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.light,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    minHeight: 200,
  },
  featureCard: {
    width: (width - SIZES.md * 3) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.sm,
    padding: SIZES.sm,
    marginBottom: SIZES.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#ec4899',
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * 1.4,
  },
  actionsSection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.light,
    minHeight: 150,
  },
  primaryButton: {
    marginBottom: SIZES.md,
    backgroundColor: '#ec4899',
  },
  secondaryButton: {
    marginBottom: SIZES.lg,
    borderColor: '#ec4899',
  },
  disclaimer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * 1.5,
  },
});

export default WelcomeScreen;