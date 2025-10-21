import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievements } from '../../store/slices/achievementsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const AchievementBadge = ({ achievement, colors }) => {
  const rarityColors = {
    common: colors.gray[400],
    rare: colors.info,
    epic: colors.secondary,
    legendary: colors.warning
  };

  const styles = getStyles(colors);

  // Safe fallback for rarity
  const rarity = achievement.rarity || 'common';
  const rarityColor = rarityColors[rarity] || colors.gray[400];

  return (
    <View style={styles.badgeContainer}>
      <View style={[styles.badge, { backgroundColor: rarityColor + '20' }]}>
        <Text style={styles.badgeIcon}>{achievement.icon || '🏆'}</Text>
      </View>
      <Text style={styles.badgeTitle}>{achievement.title || 'Achievement'}</Text>
      <Text style={styles.badgeDescription}>{achievement.description || 'No description'}</Text>
      {achievement.unlockedAt ? (
        <Text style={styles.unlockedDate}>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</Text>
      ) : null}
    </View>
  );
};

const AchievementsScreen = () => {
  const dispatch = useDispatch();
  const { achievements = [], loading } = useSelector((state) => state.achievements);
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(fetchAchievements());
  }, []);

  const styles = getStyles(colors);

  if (loading && achievements.length === 0) {
    return <LoadingSpinner text="Loading achievements..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Achievements</Text>
        <Text style={styles.subtitle}>{achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked</Text>
      </View>

      <FlatList
        data={achievements}
        renderItem={({ item }) => <AchievementBadge achievement={item} colors={colors} />}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        numColumns={2}
        ListEmptyComponent={<EmptyState icon="🏆" title="No Achievements" message="Complete challenges to earn achievements" />}
        contentContainerStyle={achievements.length === 0 && styles.emptyContainer}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: { padding: SIZES.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.gray[200], backgroundColor: colors.white },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: FONT_SIZES.md, color: colors.gray[600], marginTop: SIZES.xs },
  badgeContainer: { flex: 1, alignItems: 'center', padding: SIZES.md, margin: SIZES.sm },
  badge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm },
  badgeIcon: { fontSize: 40 },
  badgeTitle: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: colors.dark, textAlign: 'center' },
  badgeDescription: { fontSize: FONT_SIZES.xs, color: colors.gray[600], textAlign: 'center', marginTop: SIZES.xs },
  unlockedDate: { fontSize: FONT_SIZES.xs, color: colors.success, marginTop: SIZES.xs },
  emptyContainer: { flex: 1 },
});

export default AchievementsScreen;
