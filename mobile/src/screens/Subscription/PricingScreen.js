import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useStripe } from '@stripe/stripe-react-native';
import WebScrollView from '../../components/WebScrollView';
import api from '../../services/api';

const COLORS = {
  primary: '#ec4899',
  light: '#fdf2f8',
  white: '#ffffff',
  dark: '#1f2937',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
};

const SIZES = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const PricingScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!plan.priceId) {
      Alert.alert('Coming Soon', 'Subscription payments will be available soon!');
      return;
    }

    setProcessingPlan(plan.id);

    try {
      // Create checkout session
      const response = await api.post('/subscriptions/create-checkout', {
        priceId: plan.priceId,
        tier: plan.tier,
      });

      if (response.data.clientSecret) {
        // Initialize payment sheet
        const { error: initError } = await initPaymentSheet({
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
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
          Alert.alert('Payment Cancelled', presentError.message);
        } else {
          Alert.alert(
            'Success!',
            'Your subscription has been activated. Enjoy your premium features!',
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
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to process subscription'
      );
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
                color={isPremium ? COLORS.primary : COLORS.success}
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
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.selectButtonText}>
                  {plan.tier === 'basic' && user?.subscriptionTier === 'free'
                    ? 'Get Started'
                    : 'Upgrade Now'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
          trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
          thumbColor={COLORS.white}
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
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>Browse community posts</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>50 likes per day</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.featureText}>50 comments per day</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
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
            Yes! You can cancel your subscription at any time. You'll still have access until the
            end of your billing period.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What's included in the free trial?</Text>
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
      <TouchableOpacity style={styles.supportButton}>
        <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.supportText}>Need help? Contact support</Text>
      </TouchableOpacity>
    </WebScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
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
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeToggleLabel: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  savingsBanner: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  savingsBannerText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  freePlanCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumCard: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  popularText: {
    color: COLORS.white,
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
    color: COLORS.dark,
    marginBottom: SIZES.sm,
  },
  premiumText: {
    color: COLORS.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  priceInterval: {
    fontSize: 16,
    color: COLORS.gray,
    marginLeft: SIZES.xs,
  },
  premiumTextLight: {
    color: COLORS.primary,
    opacity: 0.7,
  },
  savingsBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
    marginTop: SIZES.sm,
  },
  savingsText: {
    color: COLORS.white,
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
    color: COLORS.dark,
  },
  selectButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  premiumButton: {
    backgroundColor: COLORS.primary,
  },
  processingButton: {
    opacity: 0.7,
  },
  selectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlanButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: SIZES.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanText: {
    color: COLORS.gray,
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
    color: COLORS.dark,
    marginBottom: SIZES.lg,
  },
  faqItem: {
    marginBottom: SIZES.lg,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.gray,
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
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PricingScreen;
