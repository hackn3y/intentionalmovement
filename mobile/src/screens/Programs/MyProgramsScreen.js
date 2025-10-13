import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyPrograms } from '../../store/slices/programsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const MyProgramsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { myPrograms, loading } = useSelector((state) => state.programs);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyPrograms());
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchMyPrograms());
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const renderProgram = ({ item }) => (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => navigation.navigate('ProgramDetail', { programId: item._id })}
    >
      <View style={styles.programImage}>
        <Text style={styles.imagePlaceholder}>📚</Text>
      </View>
      <View style={styles.programInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.instructor}>by {item.instructor?.name}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
          </View>
          <Text style={styles.progressText}>{item.progress || 0}% Complete</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && myPrograms.length === 0) {
    return <LoadingSpinner text="Loading programs..." />;
  }

  return (
    <FlatList
      data={myPrograms}
      renderItem={renderProgram}
      keyExtractor={(item) => item._id || item.id || String(Math.random())}
      ListEmptyComponent={<EmptyState icon="📚" title="No Programs" message="Purchase programs to get started" />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      contentContainerStyle={myPrograms.length === 0 && styles.emptyContainer}
    />
  );
};

const styles = StyleSheet.create({
  programCard: { flexDirection: 'row', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray[200] },
  programImage: { width: 80, height: 80, borderRadius: SIZES.sm, backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { fontSize: 40 },
  programInfo: { flex: 1, marginLeft: SIZES.md, justifyContent: 'space-between' },
  title: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.dark },
  instructor: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600] },
  progressContainer: { marginTop: SIZES.sm },
  progressBar: { height: 6, backgroundColor: COLORS.gray[200], borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  progressText: { fontSize: FONT_SIZES.xs, color: COLORS.gray[600], marginTop: SIZES.xs },
  emptyContainer: { flex: 1 },
});

export default MyProgramsScreen;
