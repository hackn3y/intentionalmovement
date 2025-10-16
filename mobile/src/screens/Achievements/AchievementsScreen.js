import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAchievements } from '../../store/slices/achievementsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const AchievementBadge = ({ achievement }) => {
  const rarityColors = { common: COLORS.gray[400], rare: COLORS.info, epic: COLORS.secondary, legendary: COLORS.warning };

  return (
    <View style={styles.badgeContainer}>
      <View style={[styles.badge, { backgroundColor: rarityColors[achievement.rarity] + '20' }]}>
        <Text style={styles.badgeIcon}>{achievement.icon}</Text>
      </View>
      <Text style={styles.badgeTitle}>{achievement.title}</Text>
      <Text style={styles.badgeDescription}>{achievement.description}</Text>
      {achievement.unlockedAt ? (
        <Text style={styles.unlockedDate}>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</Text>
      ) : null}
    </View>
  );
};

const AchievementsScreen = () => {
  const dispatch = useDispatch();
  const { achievements, loading } = useSelector((state) => state.achievements);

  useEffect(() => {
    dispatch(fetchAchievements());
  }, []);

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
        renderItem={({ item }) => <AchievementBadge achievement={item} />}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        numColumns={2}
        ListEmptyComponent={<EmptyState icon="🏆" title="No Achievements" message="Complete challenges to earn achievements" />}
        contentContainerStyle={achievements.length === 0 && styles.emptyContainer}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { padding: SIZES.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.dark },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.gray[600], marginTop: SIZES.xs },
  badgeContainer: { flex: 1, alignItems: 'center', padding: SIZES.md, margin: SIZES.sm },
  badge: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm },
  badgeIcon: { fontSize: 40 },
  badgeTitle: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.dark, textAlign: 'center' },
  badgeDescription: { fontSize: FONT_SIZES.xs, color: COLORS.gray[600], textAlign: 'center', marginTop: SIZES.xs },
  unlockedDate: { fontSize: FONT_SIZES.xs, color: COLORS.success, marginTop: SIZES.xs },
  emptyContainer: { flex: 1 },
});

export default AchievementsScreen;
