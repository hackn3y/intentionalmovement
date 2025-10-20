import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayContent,
  fetchStreak,
  checkInToday,
  clearError
} from '../../store/slices/dailyContentSlice';
import { useTheme } from '../../context/ThemeContext';
import { formatters } from '../../utils/formatters';

function DailyContentScreen({ navigation }) {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { todayContent, hasCheckedIn, streak, loading, error, checkInLoading } = useSelector(
    (state) => state.dailyContent
  );
  const styles = getStyles(colors);

  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [error]);

  const loadContent = () => {
    dispatch(fetchTodayContent());
    dispatch(fetchStreak());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchTodayContent()),
      dispatch(fetchStreak())
    ]);
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    try {
      await dispatch(checkInToday({ notes, completed })).unwrap();
      setShowCheckInForm(false);
      setNotes('');
      setCompleted(false);
      loadContent();
    } catch (err) {
      console.error('Check-in failed:', err);
    }
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

  if (loading && !todayContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!todayContent) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No content available</Text>
          <Text style={styles.emptyText}>
            Check back tomorrow for new daily content!
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Render the content card separately as a component to avoid && pitfalls
  const renderContentCard = () => {
    if (!todayContent || !todayContent.title) {
      return null;
    }

    const title = String(todayContent.title || 'Daily Content');
    const message = String(todayContent.message || 'No message available.');
    const contentType = todayContent.contentType || 'quote';
    const hasMedia = todayContent.mediaUrl && typeof todayContent.mediaUrl === 'string' && todayContent.mediaUrl.trim().length > 0;
    const hasCategory = todayContent.category && typeof todayContent.category === 'string' && todayContent.category.trim().length > 0;

    return (
      <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getTypeColor(contentType) + '20' }
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: getTypeColor(contentType) }
              ]}
            >
              {getTypeLabel(contentType)}
            </Text>
          </View>
          <Text style={styles.contentDate}>
            {todayContent.date
              ? formatters.formatDateString(todayContent.date, 'EEEE, MMMM d')
              : 'Today'}
          </Text>
        </View>

        {hasCategory ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{todayContent.category}</Text>
          </View>
        ) : null}

        <Text style={styles.contentTitle}>{title}</Text>

        {hasMedia ? (
          <Image
            source={{ uri: todayContent.mediaUrl }}
            style={styles.contentImage}
            resizeMode="cover"
          />
        ) : null}

        <Text style={styles.contentMessage}>{message}</Text>

        {!hasCheckedIn && !showCheckInForm ? (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => setShowCheckInForm(true)}
          >
            <Text style={styles.checkInButtonText}>✓ Check In</Text>
          </TouchableOpacity>
        ) : null}

        {hasCheckedIn && !showCheckInForm ? (
          <View style={styles.checkedInBadge}>
            <Text style={styles.checkedInText}>✓ Checked in today!</Text>
          </View>
        ) : null}

        {showCheckInForm ? (
          <View style={styles.checkInForm}>
            <Text style={styles.formLabel}>How did it go?</Text>

            <TouchableOpacity
              style={styles.completedToggle}
              onPress={() => setCompleted(!completed)}
            >
              <View style={[styles.checkbox, completed ? styles.checkboxChecked : null]}>
                {completed ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.completedLabel}>I completed this</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.notesInput}
              placeholder="Add notes (optional)"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCheckInForm(false);
                  setNotes('');
                  setCompleted(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCheckIn}
                disabled={checkInLoading}
              >
                {checkInLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {streak ? (
        <View style={styles.streakContainer}>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakNumber}>{streak.currentStreak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak.longestStreak}</Text>
              <Text style={styles.statLabel}>Longest</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak.totalCheckIns}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      ) : null}

      {renderContentCard()}

      <TouchableOpacity
        style={styles.calendarLink}
        onPress={() => navigation.navigate('ContentCalendar')}
      >
        <Text style={styles.calendarLinkText}>📅 View Calendar</Text>
      </TouchableOpacity>
    </ScrollView>
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
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 16,
    borderRadius: 8
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14
  },
  streakContainer: {
    margin: 16,
    marginBottom: 8
  },
  streakCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16
  },
  streakInfo: {
    alignItems: 'center'
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary
  },
  streakLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4
  },
  streakStats: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  contentDate: {
    fontSize: 12,
    color: colors.gray[600]
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12
  },
  categoryText: {
    fontSize: 11,
    color: colors.gray[600],
    textTransform: 'uppercase'
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16
  },
  contentMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray[700],
    marginBottom: 20
  },
  checkInButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  checkedInBadge: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  checkedInText: {
    color: '#065f46',
    fontSize: 16,
    fontWeight: '600'
  },
  checkInForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  completedLabel: {
    fontSize: 15,
    color: colors.text
  },
  notesInput: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    marginBottom: 16
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: colors.gray[600],
    fontSize: 15,
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  calendarLink: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  calendarLinkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default DailyContentScreen;
