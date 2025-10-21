import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPrograms, clearPrograms, fetchMyPrograms } from '../../store/slices/programsSlice';
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
  const { programs, loading, page, hasMore, myPrograms } = useSelector((state) => state.programs);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'real-estate', 'personal-development'];
  const styles = getStyles(colors);

  // Refresh programs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Always refresh programs when tab is focused to get latest data
      dispatch(clearPrograms());
      dispatch(fetchPrograms({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        page: 1
      }));
      // Also fetch user's purchased programs
      dispatch(fetchMyPrograms());
    }, [dispatch, selectedCategory, search])
  );

  // Load programs when category changes (immediate) or search changes (debounced)
  useEffect(() => {
    dispatch(clearPrograms());

    // For category changes, fetch immediately
    // For search changes, debounce 500ms
    const debounceTime = search ? 500 : 0;

    const timeoutId = setTimeout(() => {
      dispatch(fetchPrograms({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        page: 1
      }));
    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, dispatch]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(clearPrograms());
    dispatch(fetchPrograms({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: search.trim() || undefined,
      page: 1
    }));
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch, selectedCategory, search]);

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

  const renderProgram = ({ item }) => {
    // Check if program is purchased
    const isPurchased = myPrograms.some(p => (p.id || p._id) === (item.id || item._id));

    return (
      <TouchableOpacity style={styles.programCard} onPress={() => handleProgramPress(item)}>
        {item.coverImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.coverImage }}
              style={styles.programImage}
              resizeMode="cover"
            />
            {isPurchased && (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAID</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <View style={styles.programImage}>
              <Text style={styles.programImagePlaceholder}>📚</Text>
            </View>
            {isPurchased && (
              <View style={styles.paidBadge}>
                <Text style={styles.paidBadgeText}>PAID</Text>
              </View>
            )}
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
  };

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // Create sections: My Programs at top, then Available Programs
  const sections = [];

  // Add My Programs section if user has purchased programs
  if (myPrograms && myPrograms.length > 0) {
    sections.push({
      title: 'My Programs',
      data: myPrograms,
    });
  }

  // Filter out purchased programs from available programs to avoid duplicates
  const purchasedProgramIds = myPrograms.map(p => p.id || p._id);
  const availablePrograms = programs.filter(p => !purchasedProgramIds.includes(p.id || p._id));

  // Add Available Programs section
  sections.push({
    title: 'Available Programs',
    data: availablePrograms,
  });

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
          color={colors.text}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesList}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'real-estate' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('real-estate')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'real-estate' && styles.categoryTextActive]}>
              Real Estate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'personal-development' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('personal-development')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'personal-development' && styles.categoryTextActive]}>
              Personal Development
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Programs List with Sections */}
      <SectionList
        sections={sections}
        renderItem={renderProgram}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => `${item.id || item._id}-${item.price}-${item.updatedAt || Date.now()}`}
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
        contentContainerStyle={sections.every(s => s.data.length === 0) && styles.emptyContainer}
        stickySectionHeadersEnabled={false}
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
    flexDirection: 'row',
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  categoryButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.sm,
    backgroundColor: colors.gray[100],
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
  imageContainer: {
    position: 'relative',
    marginRight: SIZES.md,
  },
  programImage: {
    width: 100,
    height: 100,
    borderRadius: SIZES.sm,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  programImagePlaceholder: {
    fontSize: 40,
  },
  paidBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.success,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidBadgeText: {
    color: colors.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
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
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default ProgramsScreen;
