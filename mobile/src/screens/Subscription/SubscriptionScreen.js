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
import { useTheme } from '../../context/ThemeContext';
import { SIZES } from '../../config/constants';
import WebScrollView from '../../components/WebScrollView';
import api from '../../services/api';

const SubscriptionScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { colors } = useTheme();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Don't show alert if user just doesn't have a subscription yet
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Failed to load subscription details');
      }
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
        return colors.primary;
      case 'basic':
        return colors.success;
      case 'free':
      default:
        return colors.gray[500];
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'premium':
        return 'trophy';
      case 'basic':
        return 'star';
      case 'free':
      default:
        return 'person';
    }
  };

  const styles = getStyles(colors);

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Add safe defaults for subscription data
  const subscriptionData = subscription || {};
  const tier = subscriptionData.tier || 'free';
  const status = subscriptionData.status || 'active';
  const isActive = subscriptionData.isActive !== undefined ? subscriptionData.isActive : true;
  const isOnTrial = subscriptionData.isOnTrial || false;
  const cancelAtPeriodEnd = subscriptionData.cancelAtPeriodEnd || false;
  const features = subscriptionData.features || {
    canCreatePosts: true,
    canSendMessages: true,
    canPurchasePrograms: true,
  };

  return (
    <WebScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Current Plan Card */}
      <View style={styles.planCard}>
        <View style={[styles.planBadge, { backgroundColor: getTierColor(tier) }]}>
          <Ionicons name={getTierIcon(tier)} size={24} color={colors.white} />
        </View>
        <Text style={styles.planTitle}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
        </Text>
        <Text style={styles.planStatus}>
          {isOnTrial ? '🎉 Free Trial Active' : status.toUpperCase()}
        </Text>

        {isOnTrial && (
          <View style={styles.trialBanner}>
            <Ionicons name="time-outline" size={16} color={colors.warning} />
            <Text style={styles.trialText}>
              Trial ends {formatDate(subscriptionData.trialEndsAt)}
            </Text>
          </View>
        )}

        {cancelAtPeriodEnd && (
          <View style={styles.cancelBanner}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.cancelText}>
              Cancels on {formatDate(subscriptionData.subscriptionEndDate)}
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
            backgroundColor: isActive ? colors.success : colors.gray[500]
          }]}>
            <Text style={styles.statusText}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {subscriptionData.subscriptionStartDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatDate(subscriptionData.subscriptionStartDate)}</Text>
          </View>
        )}

        {subscriptionData.subscriptionEndDate && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Renews</Text>
            <Text style={styles.detailValue}>{formatDate(subscriptionData.subscriptionEndDate)}</Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>Your Features</Text>

        <View style={styles.featureRow}>
          <Ionicons
            name={features.canCreatePosts ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={features.canCreatePosts ? colors.success : colors.gray[500]}
          />
          <Text style={styles.featureText}>Create Posts</Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons
            name={features.canSendMessages ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={features.canSendMessages ? colors.success : colors.gray[500]}
          />
          <Text style={styles.featureText}>Direct Messaging</Text>
        </View>

        <View style={styles.featureRow}>
          <Ionicons
            name={features.canPurchasePrograms ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={features.canPurchasePrograms ? colors.success : colors.gray[500]}
          />
          <Text style={styles.featureText}>Purchase Programs</Text>
        </View>

        {tier === 'free' && (
          <View style={styles.limitInfo}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.limitText}>
              Free tier includes 50 likes and 50 comments per day
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {tier === 'free' && (
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
          <Ionicons name="arrow-up-circle-outline" size={20} color={colors.white} />
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      {tier !== 'free' && !cancelAtPeriodEnd && (
        <TouchableOpacity style={styles.manageButton} onPress={handleManageSubscription}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      )}

      {tier !== 'free' && cancelAtPeriodEnd && (
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
          <Ionicons name="refresh-outline" size={20} color={colors.white} />
          <Text style={styles.reactivateButtonText}>Reactivate Subscription</Text>
        </TouchableOpacity>
      )}

      {tier === 'basic' && (
        <TouchableOpacity
          style={[styles.manageButton, { marginTop: SIZES.md }]}
          onPress={() => navigation.navigate('Pricing')}
        >
          <Ionicons name="arrow-up-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.manageButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}
    </WebScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: SIZES.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: colors.white,
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
    color: colors.dark,
    marginBottom: SIZES.xs,
  },
  planStatus: {
    fontSize: 14,
    color: colors.gray[500],
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
    color: colors.warning,
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
    backgroundColor: colors.white,
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
    color: colors.dark,
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailLabel: {
    fontSize: 16,
    color: colors.gray[500],
  },
  detailValue: {
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: colors.white,
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
    color: colors.dark,
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
    color: colors.warning,
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  manageButton: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reactivateButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;
