import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { formatters } from '../utils/formatters';

/**
 * Challenge card component
 * @param {Object} props - Component props
 * @param {Object} props.challenge - Challenge data
 * @param {Function} props.onPress - Press handler
 */
const ChallengeCard = ({ challenge, onPress }) => {
  const getStatusColor = () => {
    switch (challenge.status) {
      case 'active':
        return COLORS.success;
      case 'upcoming':
        return COLORS.info;
      case 'completed':
        return COLORS.gray[500];
      default:
        return COLORS.gray[500];
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🏆</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {challenge.title}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{challenge.category}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {challenge.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.participants}>
          <Text style={styles.participantsIcon}>👥</Text>
          <Text style={styles.participantsText}>
            {formatters.formatCompactNumber(challenge.participantsCount || 0)} joined
          </Text>
        </View>

        <Text style={styles.endDate}>
          Ends {formatters.formatDate(challenge.endDate)}
        </Text>
      </View>

      {challenge.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{challenge.progress}% Complete</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  icon: {
    fontSize: 30,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: SIZES.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  category: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.xs,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SIZES.xs,
  },
  participantsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  endDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  progressContainer: {
    marginTop: SIZES.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray[200],
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    marginTop: SIZES.xs,
  },
});

export default ChallengeCard;
