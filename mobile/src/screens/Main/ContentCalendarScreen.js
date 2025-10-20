import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContentCalendar, clearError } from '../../store/slices/dailyContentSlice';
import { useTheme } from '../../context/ThemeContext';
import { formatters } from '../../utils/formatters';

function ContentCalendarScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { calendar, loading, error } = useSelector((state) => state.dailyContent);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const styles = getStyles(colors);

  useEffect(() => {
    loadCalendar();
  }, [selectedDays]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [error]);

  const loadCalendar = () => {
    dispatch(fetchContentCalendar(selectedDays));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchContentCalendar(selectedDays));
    setRefreshing(false);
  };

  const getTypeColor = (type) => {
    const typeColors = {
      quote: '#3b82f6',
      tip: '#10b981',
      challenge: '#8b5cf6',
      affirmation: colors.primary,
      reflection: '#f59e0b'
    };
    return typeColors[type] || typeColors.quote;
  };

  const getTypeLabel = (type) => {
    if (!type || typeof type !== 'string' || type.trim() === '') {
      return 'Content';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (loading && calendar.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedDays === 7 && styles.filterButtonActive]}
          onPress={() => setSelectedDays(7)}
        >
          <Text style={[styles.filterText, selectedDays === 7 && styles.filterTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedDays === 30 && styles.filterButtonActive]}
          onPress={() => setSelectedDays(30)}
        >
          <Text style={[styles.filterText, selectedDays === 30 && styles.filterTextActive]}>
            30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedDays === 90 && styles.filterButtonActive]}
          onPress={() => setSelectedDays(90)}
        >
          <Text style={[styles.filterText, selectedDays === 90 && styles.filterTextActive]}>
            90 Days
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {calendar.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No content yet</Text>
            <Text style={styles.emptyText}>
              Content will appear here as it's published.
            </Text>
          </View>
        ) : (
          <View style={styles.contentList}>
            {calendar.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.calendarCard, isToday(item.date) && styles.todayCard]}
                onPress={() => navigation.navigate('ContentDetail', {
                  contentId: item.id,
                  date: item.date
                })}
              >
                {isToday(item.date) ? (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>TODAY</Text>
                  </View>
                ) : null}

                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(item.contentType) + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: getTypeColor(item.contentType) }
                      ]}
                    >
                      {getTypeLabel(item.contentType)}
                    </Text>
                  </View>

                  <Text style={styles.date}>
                    {formatters.formatDateString(item.date, 'MMM d, yyyy')}
                  </Text>
                </View>

                {item.category && typeof item.category === 'string' && item.category.trim() !== '' ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                ) : null}

                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.message} numberOfLines={3}>
                  {item.message}
                </Text>

                {item.hasCheckedIn ? (
                  <View style={styles.checkedInIndicator}>
                    <Text style={styles.checkedInText}>✓ Checked In</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: colors.primary
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600]
  },
  filterTextActive: {
    color: '#fff'
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14
  },
  scrollView: {
    flex: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center'
  },
  contentList: {
    padding: 16,
    paddingTop: 8
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.primary
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  date: {
    fontSize: 12,
    color: colors.gray[600]
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8
  },
  categoryText: {
    fontSize: 10,
    color: colors.gray[600],
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.gray[600]
  },
  checkedInIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  checkedInText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600'
  }
});

export default ContentCalendarScreen;
