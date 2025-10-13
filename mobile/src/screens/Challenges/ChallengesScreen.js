import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallenges } from '../../store/slices/challengesSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { formatters } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ChallengeCard = ({ challenge, onPress }) => (
  <TouchableOpacity style={styles.challengeCard} onPress={onPress}>
    <View style={styles.challengeHeader}>
      <Text style={styles.challengeIcon}>🏆</Text>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeCategory}>{challenge.category}</Text>
      </View>
    </View>
    <Text style={styles.challengeDescription} numberOfLines={2}>{challenge.description}</Text>
    <View style={styles.challengeMeta}>
      <Text style={styles.participants}>👥 {challenge.participantsCount} joined</Text>
      <Text style={styles.endDate}>Ends {formatters.formatDate(challenge.endDate)}</Text>
    </View>
  </TouchableOpacity>
);

const ChallengesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { challenges, loading } = useSelector((state) => state.challenges);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    dispatch(fetchChallenges({ status: filter }));
  }, [filter]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchChallenges({ status: filter }));
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch, filter]);

  if (loading && challenges.length === 0) {
    return <LoadingSpinner text="Loading challenges..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['active', 'upcoming', 'completed'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={challenges}
        renderItem={({ item }) => <ChallengeCard challenge={item} onPress={() => navigation.navigate('ChallengeDetail', { challengeId: item._id })} />}
        keyExtractor={(item) => item._id || item.id || String(Math.random())}
        ListEmptyComponent={<EmptyState icon="🏆" title="No Challenges" message="Check back later for new challenges" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
        contentContainerStyle={challenges.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  filterContainer: { flexDirection: 'row', padding: SIZES.md, gap: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  filterButton: { paddingVertical: SIZES.sm, paddingHorizontal: SIZES.md, borderRadius: SIZES.sm, backgroundColor: COLORS.gray[100] },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.gray[600] },
  filterTextActive: { color: COLORS.white },
  challengeCard: { padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  challengeIcon: { fontSize: 40, marginRight: SIZES.md },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.dark },
  challengeCategory: { fontSize: FONT_SIZES.sm, color: COLORS.primary, marginTop: 2 },
  challengeDescription: { fontSize: FONT_SIZES.sm, color: COLORS.gray[700], marginBottom: SIZES.sm },
  challengeMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  participants: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600] },
  endDate: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600] },
  emptyContainer: { flex: 1 },
});

export default ChallengesScreen;
