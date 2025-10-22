import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { SIZES } from '../../config/constants';
import WebScrollView from '../../components/WebScrollView';
import api from '../../services/api';

// Conditionally import Stripe hook
let useStripe;
if (Platform.OS !== 'web') {
  try {
    const stripeModule = require('@stripe/stripe-react-native');
    useStripe = stripeModule.useStripe;
  } catch (e) {
    // Stripe not available
    useStripe = () => null;
  }
} else {
  // On web, provide a no-op hook
  useStripe = () => null;
}

const PricingScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { colors } = useTheme();
  // Call useStripe hook (which is either the real hook or a no-op depending on platform)
  const stripe = useStripe();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();

    // Handle Stripe Checkout redirect success/cancel (web only)
    if (Platform.OS === 'web') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        window.alert('Success! Your subscription has been activated. Welcome to the community!');
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      } else if (urlParams.get('canceled') === 'true') {
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to load subscription plans');
      } else {
        Alert.alert('Error', 'Failed to load subscription plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!plan.priceId) {
      if (Platform.OS === 'web') {
        window.alert('Membership payments will be available soon!');
      } else {
        Alert.alert('Coming Soon', 'Membership payments will be available soon!');
      }
      return;
    }

    setProcessingPlan(plan.id);

    try {
      // On web, use Stripe Checkout (redirect-based flow)
      if (Platform.OS === 'web') {
        // Get the current URL without hash/query params
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');

        const response = await api.post('/subscriptions/create-checkout-session', {
          priceId: plan.priceId,
          tier: plan.tier,
          successUrl: `${baseUrl}?success=true`,
          cancelUrl: `${baseUrl}?canceled=true`,
        });

        if (response.data.url) {
          // Redirect to Stripe Checkout
          window.location.href = response.data.url;
        }
        return;
      }

      // On mobile, use Payment Sheet (modal flow)
      const response = await api.post('/subscriptions/create-checkout', {
        priceId: plan.priceId,
        tier: plan.tier,
      });

      if (response.data.clientSecret && stripe) {
        // Initialize payment sheet
        const { error: initError } = await stripe.initPaymentSheet({
          merchantDisplayName: 'Intentional Movement',
          paymentIntentClientSecret: response.data.clientSecret,
          defaultBillingDetails: {
            email: user?.email,
          },
        });

        if (initError) {
          Alert.alert('Error', initError.message);
          return;
        }

        // Present payment sheet
        const { error: presentError } = await stripe.presentPaymentSheet();

        if (presentError) {
          Alert.alert('Payment Cancelled', presentError.message);
        } else {
          Alert.alert(
            'Success!',
            'Your membership has been activated. Enjoy your premium features!',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      if (Platform.OS === 'web') {
        window.alert(error.response?.data?.message || 'Failed to process membership');
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to process membership'
        );
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  const getDisplayedPlans = () => {
    return plans.filter((plan) =>
      isYearly ? plan.interval === 'year' : plan.interval === 'month'
    );
  };

  const renderPlanCard = (plan) => {
    const isCurrentTier = user?.subscriptionTier === plan.tier;
    const isPremium = plan.tier === 'premium';
    const isProcessing = processingPlan === plan.id;

    return (
      <View
        key={plan.id}
        style={[
          styles.planCard,
          isPremium && styles.premiumCard,
        ]}
      >
        {isPremium && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={[styles.planName, isPremium && styles.premiumText]}>
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, isPremium && styles.premiumText]}>
              ${plan.price}
            </Text>
            <Text style={[styles.priceInterval, isPremium && styles.premiumTextLight]}>
              /{plan.interval === 'year' ? 'year' : 'month'}
            </Text>
          </View>

          {plan.savings && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save ${plan.savings}</Text>
            </View>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={isPremium ? colors.primary : colors.success}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isCurrentTier ? (
          <View style={styles.currentPlanButton}>
            <Text style={styles.currentPlanText}>Current Plan</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.selectButton,
              isPremium && styles.premiumButton,
              isProcessing && styles.processingButton,
            ]}
            onPress={() => handleSubscribe(plan)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.selectButtonText}>
                  {plan.tier === 'basic' && user?.subscriptionTier === 'free'
                    ? 'Get Started'
                    : 'Upgrade Now'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayedPlans = getDisplayedPlans();

  return (
    <WebScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Start with a 14-day free trial. Cancel anytime.
        </Text>
      </View>

      {/* Billing Toggle */}
      <View style={styles.billingToggle}>
        <Text style={[styles.toggleLabel, !isYearly && styles.activeToggleLabel]}>
          Monthly
        </Text>
        <Switch
          value={isYearly}
          onValueChange={setIsYearly}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.white}
        />
        <Text style={[styles.toggleLabel, isYearly && styles.activeToggleLabel]}>
          Yearly
        </Text>
        <View style={styles.savingsBanner}>
          <Text style={styles.savingsBannerText}>Save 17%</Text>
        </View>
      </View>

      {/* Free Plan */}
      <View style={styles.freePlanCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>Free</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$0</Text>
            <Text style={styles.priceInterval}>/forever</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>Browse community posts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>50 likes per day</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>50 comments per day</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.featureText}>Follow up to 100 users</Text>
          </View>
        </View>

        {user?.subscriptionTier === 'free' && (
          <View style={styles.currentPlanButton}>
            <Text style={styles.currentPlanText}>Current Plan</Text>
          </View>
        )}
      </View>

      {/* Paid Plans */}
      {displayedPlans.map((plan) => renderPlanCard(plan))}

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
          <Text style={styles.faqAnswer}>
            Yes! You can cancel your membership at any time. You&apos;ll still have access until the
            end of your billing period.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What&apos;s included in the free trial?</Text>
          <Text style={styles.faqAnswer}>
            All paid plans include a 14-day free trial with full access to all features. No credit
            card required to start.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>Can I switch plans later?</Text>
          <Text style={styles.faqAnswer}>
            Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at
            the start of your next billing cycle.
          </Text>
        </View>
      </View>

      {/* Contact Support */}
      <TouchableOpacity
        style={styles.supportButton}
        onPress={() => {
          const email = 'support@intentionalmovementcorporation.com';
          const subject = 'Membership Support Request';
          const body = 'Hi, I need help with my membership.';
          const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

          Linking.openURL(mailtoUrl).catch((err) => {
            console.error('Failed to open email client:', err);
            if (Platform.OS === 'web') {
              window.alert('Please contact us at: support@intentionalmovementcorporation.com');
            } else {
              Alert.alert('Contact Support', 'Please email us at: support@intentionalmovementcorporation.com');
            }
          });
        }}
      >
        <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.supportText}>Need help? Contact support</Text>
      </TouchableOpacity>
    </WebScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  billingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
    gap: SIZES.md,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeToggleLabel: {
    color: colors.text,
    fontWeight: 'bold',
  },
  savingsBanner: {
    backgroundColor: colors.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  savingsBannerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  freePlanCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCard: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  popularText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: SIZES.lg,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.sm,
  },
  premiumText: {
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceInterval: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: SIZES.xs,
  },
  premiumTextLight: {
    color: colors.primary,
    opacity: 0.7,
  },
  savingsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
    marginTop: SIZES.sm,
  },
  savingsText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: SIZES.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    gap: SIZES.md,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  selectButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  premiumButton: {
    backgroundColor: colors.primary,
  },
  processingButton: {
    opacity: 0.7,
  },
  selectButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlanButton: {
    backgroundColor: colors.border,
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqSection: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.lg,
  },
  faqItem: {
    marginBottom: SIZES.lg,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.xs,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    padding: SIZES.lg,
  },
  supportText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default PricingScreen;
