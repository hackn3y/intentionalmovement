import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import dailyContentService from '../../services/dailyContentService';
import { COLORS } from '../../config/constants';
import { formatters } from '../../utils/formatters';

function ContentDetailScreen({ route, navigation }) {
  const { contentId, date } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, [contentId, date]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (date) {
        // Format the date properly for the API (YYYY-MM-DD)
        const formattedDate = new Date(date).toISOString().split('T')[0];
        data = await dailyContentService.getContentByDate(formattedDate);
      } else {
        // If no date is provided, fall back to today's content
        data = await dailyContentService.getTodayContent();
      }

      setContent(data.content);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      quote: '#3b82f6',
      tip: '#10b981',
      challenge: '#8b5cf6',
      affirmation: COLORS.primary,
      reflection: '#f59e0b'
    };
    return colors[type] || colors.quote;
  };

  const getTypeLabel = (type) => {
    if (!type || typeof type !== 'string' || type.trim() === '') {
      return 'Content';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Content not found'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getTypeColor(content.contentType) + '20' }
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: getTypeColor(content.contentType) }
              ]}
            >
              {getTypeLabel(content.contentType)}
            </Text>
          </View>
          <Text style={styles.contentDate}>
            {formatters.formatDateString(content.date, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        {content.category && typeof content.category === 'string' && content.category.trim() !== '' ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{content.category}</Text>
          </View>
        ) : null}

        <Text style={styles.contentTitle}>{String(content.title || 'Daily Content')}</Text>

        {content.mediaUrl && typeof content.mediaUrl === 'string' && content.mediaUrl.trim() !== '' ? (
          <Image
            source={{ uri: content.mediaUrl }}
            style={styles.contentImage}
            resizeMode="cover"
          />
        ) : null}

        <Text style={styles.contentMessage}>{String(content.message || 'No message available.')}</Text>
      </View>

      <TouchableOpacity
        style={styles.backToCalendarButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backToCalendarText}>← Back to Calendar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f8'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    padding: 20
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
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
    color: '#666'
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12
  },
  categoryText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase'
  },
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    lineHeight: 36
  },
  contentImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 20
  },
  contentMessage: {
    fontSize: 17,
    lineHeight: 28,
    color: '#444'
  },
  backToCalendarButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  backToCalendarText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600'
  }
});

export default ContentDetailScreen;
