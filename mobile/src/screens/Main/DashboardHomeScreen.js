import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';

/**
 * Dashboard Home Screen - Main navigation hub
 * Similar to Amanda Frances Money Queen app style
 */
const DashboardHomeScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Navigation cards configuration - Prioritized by money-making and frequent access
  const navigationCards = [
    // MONEY-MAKING & SUBSCRIPTION (Priority 1)
    {
      id: 'programs',
      title: 'Programs',
      subtitle: 'Invest & Elevate 💰',
      icon: 'book',
      color: '#8b5cf6', // Purple
      gradient: ['#8b5cf6', '#a78bfa'],
      onPress: () => navigation.navigate('Programs'),
    },
    {
      id: 'subscription',
      title: 'Membership',
      subtitle: 'Upgrade Your Access 💎',
      icon: 'star',
      color: '#ef4444', // Red
      gradient: ['#ef4444', '#f87171'],
      onPress: () => navigation.navigate('ProfileTab', {
        screen: 'Subscription',
      }),
    },
    // CORE JOURNEY (Priority 2)
    {
      id: 'pmmb',
      title: 'Planted Mind\nMoving Body',
      subtitle: 'Your Core Journey',
      icon: 'leaf',
      color: '#10b981', // Green
      gradient: ['#10b981', '#34d399'],
      onPress: () => navigation.navigate('PlantedMind'),
    },
    {
      id: 'personal-goals',
      title: 'Personal Goals',
      subtitle: '6 Life Categories',
      icon: 'flag',
      color: '#eab308', // Yellow/Gold
      gradient: ['#eab308', '#facc15'],
      onPress: () => navigation.navigate('PersonalGoals'),
    },
    // DAILY ENGAGEMENT (Priority 3)
    {
      id: 'daily',
      title: 'Daily Content',
      subtitle: 'Fresh Insights Daily',
      icon: 'calendar',
      color: '#f59e0b', // Amber
      gradient: ['#f59e0b', '#fbbf24'],
      onPress: () => navigation.navigate('DailyContent'),
    },
    {
      id: 'community',
      title: 'Community',
      subtitle: 'Connect & Share',
      icon: 'people',
      color: '#ec4899', // Hot pink
      gradient: ['#ec4899', '#f472b6'],
      onPress: () => navigation.navigate('Feed'),
    },
    {
      id: 'messages',
      title: 'Messages',
      subtitle: 'Chat & Connect',
      icon: 'chatbubbles',
      color: '#3b82f6', // Blue
      gradient: ['#3b82f6', '#60a5fa'],
      onPress: () => navigation.navigate('MessagesTab'),
    },
    // PERSONAL (Priority 4)
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'View & Edit Profile',
      icon: 'person-circle',
      color: '#6366f1', // Indigo
      gradient: ['#6366f1', '#818cf8'],
      onPress: () => navigation.navigate('ProfileTab', {
        screen: 'Profile',
        params: { userId: null },
      }),
    },
    {
      id: 'achievements',
      title: 'Achievements',
      subtitle: 'Track Your Progress',
      icon: 'trophy',
      color: '#eab308', // Yellow
      gradient: ['#eab308', '#facc15'],
      onPress: () => navigation.navigate('ProfileTab', {
        screen: 'Achievements',
      }),
    },
    // FREE RESOURCES (Priority 5)
    {
      id: 'free-content',
      title: 'Free Content',
      subtitle: 'Resources & More',
      icon: 'gift',
      color: '#a855f7', // Purple
      gradient: ['#a855f7', '#c084fc'],
      onPress: () => navigation.navigate('FreeContent'),
    },
    // INFO & EXTERNAL (Priority 6)
    {
      id: 'guidelines',
      title: 'Community Guidelines',
      subtitle: 'Our Values',
      icon: 'shield-checkmark',
      color: '#14b8a6', // Teal
      gradient: ['#14b8a6', '#2dd4bf'],
      onPress: () => navigation.navigate('CommunityGuidelines'),
    },
    {
      id: 'website',
      title: 'Visit Website',
      subtitle: 'Learn More',
      icon: 'globe',
      color: '#06b6d4', // Cyan
      gradient: ['#06b6d4', '#22d3ee'],
      onPress: () => Linking.openURL('https://intentionalmovementcorporation.com/'),
    },
  ];

  const renderCard = (card) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.card, { borderLeftColor: card.color }]}
      onPress={card.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIcon, { backgroundColor: card.color }]}>
        <Ionicons name={card.icon} size={24} color="#ffffff" />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{card.title}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{card.subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.displayName || user?.username || 'Friend'}!</Text>
        <Text style={styles.tagline}>Elevate Your LifeStyle</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={24} color={colors.primary} />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trending-up" size={24} color={colors.success} />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color={colors.warning} />
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      {/* Navigation Cards List */}
      <View style={styles.list}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        {navigationCards.map(renderCard)}
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteContainer}>
        <Ionicons name="sparkles" size={20} color={colors.primary} />
        <Text style={styles.quote}>
          "Your intentional movement creates your elevated lifestyle."
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl * 2,
  },
  header: {
    marginBottom: SIZES.xl,
    paddingVertical: SIZES.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: colors.gray[600],
    fontWeight: '500',
  },
  userName: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: SIZES.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: SIZES.xs,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: SIZES.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: colors.gray[600],
    marginTop: 2,
  },
  list: {
    gap: SIZES.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: colors.gray[600],
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.lg,
    marginTop: SIZES.xl,
    gap: SIZES.sm,
  },
  quote: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default DashboardHomeScreen;
