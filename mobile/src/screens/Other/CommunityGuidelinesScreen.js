import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';
import WebScrollView from '../../components/WebScrollView';

const CommunityGuidelinesScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const guidelines = [
    {
      icon: 'heart',
      color: '#ec4899',
      title: 'Be Kind & Respectful',
      description: 'Treat everyone with kindness, empathy, and respect. We celebrate diversity and encourage supportive interactions.',
    },
    {
      icon: 'shield-checkmark',
      color: '#10b981',
      title: 'Keep it Safe',
      description: 'No harassment, hate speech, bullying, or threatening behavior. Report any content that makes you feel unsafe.',
    },
    {
      icon: 'chatbubbles',
      color: '#3b82f6',
      title: 'Meaningful Conversations',
      description: 'Share thoughtfully and authentically. Avoid spam, excessive self-promotion, or misleading information.',
    },
    {
      icon: 'leaf',
      color: '#8b5cf6',
      title: 'Honor the Journey',
      description: 'Respect others\' wellness journeys. What works for you may not work for everyone. Share experiences, not prescriptions.',
    },
    {
      icon: 'eye-off',
      color: '#f59e0b',
      title: 'Privacy Matters',
      description: 'Don\'t share others\' private information without consent. Respect boundaries and personal space.',
    },
    {
      icon: 'flag',
      color: '#ef4444',
      title: 'Report Issues',
      description: 'Help us maintain a positive space. Report content or behavior that violates these guidelines.',
    },
    {
      icon: 'sparkles',
      color: '#ec4899',
      title: 'Inspire & Elevate',
      description: 'Focus on growth, positivity, and intentional living. Your words have power - use them to uplift.',
    },
  ];

  return (
    <WebScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="people-circle" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Community Guidelines</Text>
        <Text style={styles.subtitle}>
          Building a space for intentional growth, connection, and elevation
        </Text>
      </View>

      {/* Introduction */}
      <View style={styles.introCard}>
        <Text style={styles.introText}>
          Welcome to the Intentional Movement community! These guidelines help us create
          a safe, supportive, and inspiring environment where everyone can thrive.
        </Text>
      </View>

      {/* Guidelines List */}
      <View style={styles.guidelinesList}>
        {guidelines.map((guideline, index) => (
          <View key={index} style={styles.guidelineCard}>
            <View style={[styles.guidelineIcon, { backgroundColor: guideline.color + '15' }]}>
              <Ionicons name={guideline.icon} size={28} color={guideline.color} />
            </View>
            <View style={styles.guidelineContent}>
              <Text style={styles.guidelineTitle}>{guideline.title}</Text>
              <Text style={styles.guidelineDescription}>{guideline.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Core Values */}
      <View style={styles.valuesCard}>
        <Text style={styles.valuesTitle}>Our Core Values</Text>
        <View style={styles.valuesList}>
          <View style={styles.valueItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.valueText}>Planted Mind - Mindfulness & Intention</Text>
          </View>
          <View style={styles.valueItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.valueText}>Moving Body - Action & Progress</Text>
          </View>
          <View style={styles.valueItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.valueText}>Elevated Lifestyle - Growth & Excellence</Text>
          </View>
          <View style={styles.valueItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={styles.valueText}>Community Support - Together We Rise</Text>
          </View>
        </View>
      </View>

      {/* Consequences */}
      <View style={styles.consequencesCard}>
        <Text style={styles.consequencesTitle}>Guideline Violations</Text>
        <Text style={styles.consequencesText}>
          Violations of these guidelines may result in content removal, temporary suspension,
          or permanent account termination, depending on severity and frequency.
        </Text>
        <Text style={styles.consequencesText}>
          We believe in second chances and growth. Most issues can be resolved through
          conversation and education.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for helping us create a community that inspires intentional living
          and elevated lifestyles. Together, we grow stronger.
        </Text>
        <Text style={styles.footerSignature}>- The Intentional Movement Team</Text>
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
  introCard: {
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
  introText: {
    fontSize: FONT_SIZES.md,
    color: colors.text,
    lineHeight: 22,
  },
  guidelinesList: {
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  guidelineCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  guidelineIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  guidelineContent: {
    flex: 1,
  },
  guidelineTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.xs,
  },
  guidelineDescription: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  valuesCard: {
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
  valuesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: SIZES.md,
  },
  valuesList: {
    gap: SIZES.sm,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  valueText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: colors.text,
  },
  consequencesCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
  },
  consequencesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: SIZES.sm,
  },
  consequencesText: {
    fontSize: FONT_SIZES.sm,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  footer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: SIZES.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.md,
  },
  footerSignature: {
    fontSize: FONT_SIZES.sm,
    color: colors.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default CommunityGuidelinesScreen;
