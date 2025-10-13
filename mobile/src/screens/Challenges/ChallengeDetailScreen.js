import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallengeById, joinChallenge } from '../../store/slices/challengesSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { formatters } from '../../utils/formatters';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import UserAvatar from '../../components/UserAvatar';

const LeaderboardItem = ({ entry, rank }) => (
  <View style={styles.leaderboardItem}>
    <Text style={styles.rank}>#{rank}</Text>
    <UserAvatar uri={entry.user?.profilePicture} firstName={entry.user?.firstName} lastName={entry.user?.lastName} size={40} />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{entry.user?.firstName} {entry.user?.lastName}</Text>
      <Text style={styles.userScore}>{entry.score} points</Text>
    </View>
  </View>
);

const ChallengeDetailScreen = ({ route }) => {
  const dispatch = useDispatch();
  const { challengeId } = route.params;
  const { currentChallenge, loading, joinLoading } = useSelector((state) => state.challenges);

  useEffect(() => {
    dispatch(fetchChallengeById(challengeId));
  }, [challengeId]);

  const handleJoin = async () => {
    try {
      await dispatch(joinChallenge(challengeId)).unwrap();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  if (loading && !currentChallenge) {
    return <LoadingSpinner text="Loading challenge..." />;
  }

  if (!currentChallenge) return null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.icon}>🏆</Text>
          <Text style={styles.title}>{currentChallenge.title}</Text>
          <Text style={styles.category}>{currentChallenge.category}</Text>
          <Text style={styles.description}>{currentChallenge.description}</Text>
          <View style={styles.dates}>
            <Text style={styles.dateText}>Start: {formatters.formatDate(currentChallenge.startDate)}</Text>
            <Text style={styles.dateText}>End: {formatters.formatDate(currentChallenge.endDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          <FlatList
            data={currentChallenge.leaderboard || []}
            renderItem={({ item, index }) => <LeaderboardItem entry={item} rank={index + 1} />}
            keyExtractor={(item) => item._id || item.id || String(Math.random())}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {!currentChallenge.hasJoined && (
        <View style={styles.footer}>
          <Button title="Join Challenge" onPress={handleJoin} loading={joinLoading} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { padding: SIZES.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  icon: { fontSize: 60, marginBottom: SIZES.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.dark, textAlign: 'center' },
  category: { fontSize: FONT_SIZES.md, color: COLORS.primary, marginTop: SIZES.xs },
  description: { fontSize: FONT_SIZES.md, color: COLORS.gray[700], textAlign: 'center', marginTop: SIZES.md, lineHeight: 24 },
  dates: { marginTop: SIZES.md, gap: SIZES.xs },
  dateText: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600] },
  section: { padding: SIZES.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.dark, marginBottom: SIZES.md },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, backgroundColor: COLORS.gray[50], borderRadius: SIZES.sm, marginBottom: SIZES.sm },
  rank: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary, width: 40 },
  userInfo: { flex: 1, marginLeft: SIZES.md },
  userName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.dark },
  userScore: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600], marginTop: 2 },
  footer: { padding: SIZES.lg, borderTopWidth: 1, borderTopColor: COLORS.gray[200] },
});

export default ChallengeDetailScreen;
