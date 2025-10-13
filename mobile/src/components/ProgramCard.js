import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';
import { formatters } from '../utils/formatters';

/**
 * Program card component for marketplace
 * @param {Object} props - Component props
 * @param {Object} props.program - Program data
 * @param {Function} props.onPress - Press handler
 */
const ProgramCard = ({ program, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>📚</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {program.title}
        </Text>

        <Text style={styles.instructor}>by {program.instructor?.name}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {program.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.rating}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>
              {program.rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>

          <Text style={styles.price}>
            {formatters.formatCurrency(program.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: SIZES.sm,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  instructor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginTop: SIZES.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SIZES.xs,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default ProgramCard;
