import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';
import WebScrollView from '../../components/WebScrollView';
import api from '../../services/api';

const FreeContentScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [content, setContent] = useState([]);

  const fetchFreeContent = async () => {
    try {
      // This would fetch free content from the API
      // For now, using placeholder data
      const placeholderContent = [
        {
          id: 1,
          type: 'article',
          title: 'The Power of Intentional Movement',
          description: 'Discover how small, intentional actions create lasting change in your life.',
          icon: 'book-outline',
          color: '#ec4899',
          available: true,
        },
        {
          id: 2,
          type: 'video',
          title: '5-Minute Morning Routine',
          description: 'Start your day with purpose and energy using this simple routine.',
          icon: 'play-circle-outline',
          color: '#10b981',
          available: true,
        },
        {
          id: 3,
          type: 'audio',
          title: 'Planted Mind Meditation',
          description: 'A guided meditation to center your mind and cultivate intention.',
          icon: 'headset-outline',
          color: '#8b5cf6',
          available: true,
        },
        {
          id: 4,
          type: 'article',
          title: 'Building Your Movement Practice',
          description: 'Tips and strategies for creating a sustainable movement practice.',
          icon: 'book-outline',
          color: '#f59e0b',
          available: true,
        },
        {
          id: 5,
          type: 'challenge',
          title: '7-Day Gratitude Challenge',
          description: 'Transform your mindset with daily gratitude practices.',
          icon: 'trophy-outline',
          color: '#3b82f6',
          available: true,
        },
      ];

      setContent(placeholderContent);
    } catch (error) {
      console.error('Failed to fetch free content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFreeContent();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFreeContent();
  };

  const handleContentPress = (item) => {
    // Navigate to content detail or show preview
    console.log('Content pressed:', item.title);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'article':
        return 'Read';
      case 'video':
        return 'Watch';
      case 'audio':
        return 'Listen';
      case 'challenge':
        return 'Start';
      default:
        return 'View';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <WebScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="gift" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Free Content</Text>
        <Text style={styles.subtitle}>
          Complimentary resources to support your journey
        </Text>
      </View>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome to Free Resources!</Text>
        <Text style={styles.welcomeText}>
          Explore articles, videos, meditations, and challenges designed to help you
          cultivate intentional living and elevate your lifestyle - completely free.
        </Text>
      </View>

      {/* Content Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Browse by Type</Text>
        <View style={styles.categoriesRow}>
          <TouchableOpacity style={styles.categoryChip}>
            <Ionicons name="book-outline" size={16} color={colors.primary} />
            <Text style={styles.categoryText}>Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Ionicons name="play-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.categoryText}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Ionicons name="headset-outline" size={16} color={colors.primary} />
            <Text style={styles.categoryText}>Audio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content List */}
      <View style={styles.contentList}>
        <Text style={styles.sectionTitle}>All Content</Text>
        {content.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contentCard}
            onPress={() => handleContentPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.contentIcon, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={32} color={item.color} />
            </View>

            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{item.title}</Text>
              <Text style={styles.contentDescription}>{item.description}</Text>

              <View style={styles.contentFooter}>
                <View style={[styles.typeBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
                <View style={styles.actionContainer}>
                  <Text style={[styles.actionText, { color: item.color }]}>
                    {getTypeLabel(item.type)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={item.color} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Premium CTA */}
      <View style={styles.premiumCard}>
        <View style={styles.premiumIcon}>
          <Ionicons name="star" size={32} color="#f59e0b" />
        </View>
        <Text style={styles.premiumTitle}>Want More?</Text>
        <Text style={styles.premiumText}>
          Upgrade to Premium for unlimited access to exclusive programs, live sessions,
          and personalized coaching.
        </Text>
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}
        >
          <Text style={styles.premiumButtonText}>View Plans</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          New free content added weekly. Check back often!
        </Text>
      </View>
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
  headerIcon: {
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
    lineHeight: 20,
  },
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.sm,
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: colors.gray[600],
    lineHeight: 22,
  },
  categoriesContainer: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: 20,
    gap: SIZES.xs,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  contentList: {
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  contentCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.xs,
  },
  contentDescription: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    lineHeight: 18,
    marginBottom: SIZES.sm,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: FONT_SIZES.xs,
    color: colors.white,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: SIZES.xl,
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  premiumIcon: {
    marginBottom: SIZES.md,
  },
  premiumTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: SIZES.sm,
  },
  premiumText: {
    fontSize: FONT_SIZES.md,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.lg,
  },
  premiumButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: 8,
    alignItems: 'center',
    gap: SIZES.sm,
  },
  premiumButtonText: {
    color: colors.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FreeContentScreen;
