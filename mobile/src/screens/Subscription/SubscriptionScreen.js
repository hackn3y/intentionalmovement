import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
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

const SubscriptionScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      Alert.alert('Error', 'Failed to load subscription details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscription();
  };

  const handleUpgrade = () => {
    navigation.navigate('Pricing');
  };

  const handleManageSubscription = async () => {
    // For now, show options
    Alert.alert(
      'Manage Subscription',
      'Choose an action',
      [
        {
          text: 'Change Plan',
          onPress: () => navigation.navigate('Pricing'),
        },
        {
          text: 'Cancel Subscription',
          onPress: () => handleCancelSubscription(),
          style: 'destructive',
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel? You will still have access until the end of your billing period.',
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              await api.post('/subscriptions/cancel', { immediately: false });
              Alert.alert('Success', 'Your subscription has been cancelled. You will have access until the end of your billing period.');
              fetchSubscription();
            } catch (error) {
              console.error('Failed to cancel subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium':
        return COLORS.primary;
      case 'basic':
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium':
        return 'trophy';
      case 'basic':
        return 'star';
      default:
        return 'person';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray} />
        <Text style={styles.errorText}>Unable to load subscription</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSubscription}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <WebScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Current Plan Card */}
      <View style={styles.planCard}>
        <View style={[styles.planBadge, { backgroundColor: getTierColor(subscription.tier) }]}>
          <Ionicons name={getTierIcon(subscription.tier)} size={24} color={COLORS.white} />
        </View>
        <Text style={styles.planTitle}>
          {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
        </Text>
        <Text style={styles.planStatus}>
          {subscription.isOnTrial ? '🎉 Free Trial Active' : subscription.status.toUpperCase()}
        </Text>

        {subscription.isOnTrial && (
          <View style={styles.trialBanner}>
            <Ionicons name="time-outline" size={16} color={COLORS.warning} />
            <Text style={styles.trialText}>
              Trial ends {formatDate(subscription.trialEndsAt)}
            </Text>
          </View>
        )}

        {subscription.cancelAtPeriodEnd && (
          <View style={styles.cancelBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={COLORS.warning} />
            <Text style={styles.cancelText}>
              Cancels on {formatDate(subscription.subscriptionEndDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Subscription Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Subscription Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: subscription.isActive ? COLORS.success : COLORS.gray
          }]}>
            <Text style={styles.statusText}>
              {subscription.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {subscription.subscriptionStartDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.subscriptionStartDate)}</Text>
          </View>
        )}

        {subscription.subscriptionEndDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Renews</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.subscriptionEndDate)}</Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>Your Features</Text>

        <View style={styles.featureRow}>
          <Ionicons
            name={subscription.features.canCreatePosts ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={subscription.features.canCreatePosts ? COLORS.success : COLORS.gray}
          />
          <Text style={styles.featureText}>Create Posts</Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons
            name={subscription.features.canSendMessages ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={subscription.features.canSendMessages ? COLORS.success : COLORS.gray}
          />
          <Text style={styles.featureText}>Direct Messaging</Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons
            name={subscription.features.canPurchasePrograms ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={subscription.features.canPurchasePrograms ? COLORS.success : COLORS.gray}
          />
          <Text style={styles.featureText}>Purchase Programs</Text>
        </View>

        {subscription.tier === 'free' && (
          <View style={styles.limitInfo}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
            <Text style={styles.limitText}>
              Free tier includes 50 likes and 50 comments per day
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {subscription.tier === 'free' && (
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={COLORS.white} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      {subscription.tier !== 'free' && !subscription.cancelAtPeriodEnd && (
        <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      )}

      {subscription.tier !== 'free' && subscription.cancelAtPeriodEnd && (
        <TouchableOpacity
          style={styles.reactivateButton}
          onPress={async () => {
            try {
              await api.post('/subscriptions/reactivate');
              Alert.alert('Success', 'Your subscription has been reactivated!');
              fetchSubscription();
            } catch (error) {
              Alert.alert('Error', 'Failed to reactivate subscription');
            }
          }}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
          <Text style={styles.reactivateButtonText}>Reactivate Subscription</Text>
        </TouchableOpacity>
      )}

      {subscription.tier === 'basic' && (
        <TouchableOpacity
          style={[styles.manageButton, { marginTop: SIZES.md }]}
          onPress={() => navigation.navigate('Pricing')}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.manageButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    padding: SIZES.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.xl,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  planStatus: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
    marginTop: SIZES.md,
    gap: SIZES.xs,
  },
  trialText: {
    fontSize: 14,
    color: COLORS.warning,
    fontWeight: '500',
  },
  cancelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 8,
    marginTop: SIZES.md,
    gap: SIZES.xs,
  },
  cancelText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.md,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.dark,
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: SIZES.md,
    borderRadius: 8,
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  limitText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.warning,
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  manageButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactivateButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reactivateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
