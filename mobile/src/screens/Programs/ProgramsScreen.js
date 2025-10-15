import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPrograms, clearPrograms } from '../../store/slices/programsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

/**
 * Programs marketplace screen with filters
 */
const ProgramsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { programs, loading, page, hasMore } = useSelector((state) => state.programs);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'insurance', 'real-estate', 'personal-development'];
  const styles = getStyles(colors);

  const loadPrograms = useCallback(() => {
    dispatch(clearPrograms());
    dispatch(fetchPrograms({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: search.trim() || undefined,
      page: 1
    }));
  }, [dispatch, selectedCategory, search]);

  // Initial load only (once when component mounts)
  useEffect(() => {
    if (programs.length === 0 && !loading) {
      loadPrograms();
    }
  }, []); // Empty dependency array = runs once on mount

  // Load programs when search or category changes (debounced for search)
  useEffect(() => {
    // Skip if it's the initial render (handled by the above useEffect)
    if (programs.length === 0 && !loading && !search && selectedCategory === 'all') {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadPrograms();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPrograms();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadPrograms]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(fetchPrograms({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        page: page + 1
      }));
    }
  }, [dispatch, loading, hasMore, page, selectedCategory, search]);

  const handleProgramPress = (program) => {
    navigation.navigate('ProgramDetail', { programId: program.id || program._id });
  };

  const renderProgram = ({ item }) => (
    <TouchableOpacity style={styles.programCard} onPress={() => handleProgramPress(item)}>
      {item.coverImage ? (
        <Image
          source={{ uri: item.coverImage }}
          style={styles.programImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.programImage}>
          <Text style={styles.programImagePlaceholder}>📚</Text>
        </View>
      )}
      <View style={styles.programInfo}>
        <Text style={styles.programTitle}>{item.title}</Text>
        <Text style={styles.programInstructor}>by {item.instructorName || 'Intentional Movement'}</Text>
        <Text style={styles.programDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        <View style={styles.programMeta}>
          {item.price !== undefined && item.price !== null && (
            <Text style={styles.programPrice}>${parseFloat(item.price).toFixed(2)}</Text>
          )}
          <View style={styles.programRating}>
            <Text style={styles.ratingIcon}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating ? parseFloat(item.rating).toFixed(1) : 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryButton, selectedCategory === item && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>
                {item === 'real-estate' ? 'Real Estate' : item === 'personal-development' ? 'Personal Development' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Programs List */}
      <FlatList
        data={programs}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id || item._id}
        ListEmptyComponent={
          loading && page === 1 ? (
            <LoadingSpinner text="Loading programs..." />
          ) : (
            <EmptyState icon="📚" title="No Programs" message="No programs available" />
          )
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={programs.length === 0 && styles.emptyContainer}
      />
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchInput: {
    backgroundColor: colors.gray[50],
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: FONT_SIZES.md,
    color: colors.dark,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  categoriesList: {
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  categoryButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.sm,
    backgroundColor: colors.gray[100],
    marginRight: SIZES.sm,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: colors.gray[600],
  },
  categoryTextActive: {
    color: colors.white,
  },
  programCard: {
    flexDirection: 'row',
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  programImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.sm,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  programImagePlaceholder: {
    fontSize: 40,
  },
  programInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  programTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: colors.dark,
  },
  programInstructor: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  programDescription: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[700],
    marginTop: SIZES.xs,
  },
  programMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  programPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  programRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SIZES.xs,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
  },
  footer: {
    paddingVertical: SIZES.lg,
  },
  emptyContainer: {
    flex: 1,
  },
});

export default ProgramsScreen;
