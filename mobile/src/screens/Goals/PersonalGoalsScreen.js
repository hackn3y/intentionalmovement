import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@personal_goals_levels';

const PersonalGoalsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [categories, setCategories] = useState([
    {
      id: 1,
      title: 'Relationships & Involvement',
      subtitle: 'Family, Friends, Hobbies & Events',
      icon: 'people',
      color: '#ec4899', // Hot pink
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
    {
      id: 2,
      title: 'Physical Environment',
      subtitle: 'Home, Workplace, Surrounding Energy',
      icon: 'home',
      color: '#10b981', // Green
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
    {
      id: 3,
      title: 'Financial Health',
      subtitle: 'Savings, Investments, Travel, Daily Needs',
      icon: 'cash',
      color: '#f59e0b', // Amber
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
    {
      id: 4,
      title: 'Purpose Experienced',
      subtitle: 'Career, Family, Creation, Spirituality, Giving',
      icon: 'compass',
      color: '#8b5cf6', // Purple
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
    {
      id: 5,
      title: 'Health & Wellness',
      subtitle: 'Mental, Emotional, Physical, Energetic',
      icon: 'fitness',
      color: '#06b6d4', // Cyan
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
    {
      id: 6,
      title: 'Personal Endeavors & Improvement',
      subtitle: 'Hobbies, Personal Development, Creative Freedom',
      icon: 'bulb',
      color: '#6366f1', // Indigo
      level: 1,
      progress: 0,
      maxLevel: 10,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setCategories((prev) =>
          prev.map((cat) => {
            const saved = parsed.find((s) => s.id === cat.id);
            return saved ? { ...cat, level: saved.level, progress: saved.progress } : cat;
          })
        );
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const saveProgress = async (updatedCategories) => {
    try {
      const dataToSave = updatedCategories.map((cat) => ({
        id: cat.id,
        level: cat.level,
        progress: cat.progress,
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const increaseProgress = (amount) => {
    if (!selectedCategory) return;

    const updated = categories.map((cat) => {
      if (cat.id === selectedCategory.id) {
        let newProgress = cat.progress + amount;
        let newLevel = cat.level;

        // Level up when progress reaches 100
        if (newProgress >= 100 && cat.level < cat.maxLevel) {
          newLevel = cat.level + 1;
          newProgress = 0;
          Alert.alert(
            '🎉 Level Up!',
            `Congratulations! You've reached Level ${newLevel} in ${cat.title}!`,
            [{ text: 'Amazing!', style: 'default' }]
          );
        } else if (newProgress >= 100 && cat.level === cat.maxLevel) {
          newProgress = 100; // Max level reached
        }

        return { ...cat, progress: newProgress, level: newLevel };
      }
      return cat;
    });

    setCategories(updated);
    saveProgress(updated);
    setSelectedCategory(updated.find((c) => c.id === selectedCategory.id));
  };

  const decreaseProgress = (amount) => {
    if (!selectedCategory) return;

    const updated = categories.map((cat) => {
      if (cat.id === selectedCategory.id) {
        let newProgress = Math.max(0, cat.progress - amount);
        return { ...cat, progress: newProgress };
      }
      return cat;
    });

    setCategories(updated);
    saveProgress(updated);
    setSelectedCategory(updated.find((c) => c.id === selectedCategory.id));
  };

  const calculateOverallLevel = () => {
    const totalLevels = categories.reduce((sum, cat) => sum + cat.level, 0);
    const averageLevel = totalLevels / categories.length;
    return averageLevel.toFixed(1);
  };

  const calculateOverallProgress = () => {
    const totalProgress = categories.reduce((sum, cat) => {
      const levelProgress = ((cat.level - 1) / (cat.maxLevel - 1)) * 100;
      const currentLevelProgress = (cat.progress / 100) * (100 / (cat.maxLevel - 1));
      return sum + levelProgress + currentLevelProgress;
    }, 0);
    return Math.min(100, totalProgress / categories.length);
  };

  const renderProgressBar = (category) => {
    const progressPercent = category.progress;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: category.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>
    );
  };

  const renderCategoryCard = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { borderLeftColor: category.color }]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
        <Ionicons name={category.icon} size={32} color={category.color} />
      </View>

      <View style={styles.categoryContent}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={[styles.levelBadge, { backgroundColor: category.color }]}>
            <Text style={styles.levelText}>Level {category.level}</Text>
          </View>
        </View>

        <Text style={styles.categorySubtitle}>{category.subtitle}</Text>

        {renderProgressBar(category)}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="trophy" size={48} color={colors.primary} />
          <Text style={styles.title}>Personal Goals</Text>
          <Text style={styles.subtitle}>
            Six categories of lifestyle that upgrade your overall satisfaction & fulfillment
          </Text>
        </View>

        {/* Overall Progress Card */}
        <View style={styles.overallCard}>
          <Text style={styles.overallTitle}>Overall Lifestyle Level</Text>
          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>{calculateOverallLevel()}</Text>
              <Text style={styles.overallStatLabel}>Average Level</Text>
            </View>
            <View style={styles.overallDivider} />
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatValue}>{calculateOverallProgress().toFixed(0)}%</Text>
              <Text style={styles.overallStatLabel}>Overall Progress</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Tap any category to track your progress. Increase by 1%, 5%, or 10% increments.
            Each level requires 100% progress. Make 1% daily improvements!
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Your Life Categories</Text>
          {categories.map(renderCategoryCard)}
        </View>

        {/* Motivation Footer */}
        <View style={styles.motivationCard}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
          <Text style={styles.motivationText}>
            "Finding the perfect balance that fulfills you" - Focus on 10% improvement per
            category, 1% changes made per day, leaving 0% room for giving up.
          </Text>
        </View>
      </ScrollView>

      {/* Progress Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCategory && (
              <>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalIcon,
                      { backgroundColor: selectedCategory.color + '15' },
                    ]}
                  >
                    <Ionicons
                      name={selectedCategory.icon}
                      size={40}
                      color={selectedCategory.color}
                    />
                  </View>
                  <Text style={styles.modalTitle}>{selectedCategory.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedCategory.subtitle}</Text>
                </View>

                <View style={styles.modalLevelInfo}>
                  <Text style={styles.modalLevelText}>
                    Level {selectedCategory.level} / {selectedCategory.maxLevel}
                  </Text>
                  <Text style={styles.modalProgressText}>
                    {selectedCategory.progress}% to next level
                  </Text>
                </View>

                <View style={styles.modalProgressBarContainer}>
                  <View style={styles.modalProgressBar}>
                    <View
                      style={[
                        styles.modalProgressFill,
                        {
                          width: `${selectedCategory.progress}%`,
                          backgroundColor: selectedCategory.color,
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.buttonSectionTitle}>Increase Progress</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.smallButton,
                      { backgroundColor: selectedCategory.color },
                    ]}
                    onPress={() => increaseProgress(1)}
                  >
                    <Text style={styles.modalButtonText}>+1%</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.mediumButton,
                      { backgroundColor: selectedCategory.color },
                    ]}
                    onPress={() => increaseProgress(5)}
                  >
                    <Text style={styles.modalButtonText}>+5%</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.largeButton,
                      { backgroundColor: selectedCategory.color },
                    ]}
                    onPress={() => increaseProgress(10)}
                  >
                    <Text style={styles.modalButtonText}>+10%</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.buttonSectionTitle}>Decrease Progress</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.smallButton, styles.decreaseButton]}
                    onPress={() => decreaseProgress(1)}
                  >
                    <Text style={styles.modalButtonText}>-1%</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.mediumButton, styles.decreaseButton]}
                    onPress={() => decreaseProgress(5)}
                  >
                    <Text style={styles.modalButtonText}>-5%</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.largeButton, styles.decreaseButton]}
                    onPress={() => decreaseProgress(10)}
                  >
                    <Text style={styles.modalButtonText}>-10%</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: SIZES.lg,
      paddingBottom: SIZES.xxl * 3,
    },
    header: {
      alignItems: 'center',
      marginBottom: SIZES.xl,
      paddingVertical: SIZES.lg,
    },
    title: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: SIZES.md,
      marginBottom: SIZES.xs,
    },
    subtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      textAlign: 'center',
      paddingHorizontal: SIZES.lg,
      lineHeight: 20,
    },
    overallCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: SIZES.lg,
      marginBottom: SIZES.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    overallTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SIZES.md,
      textAlign: 'center',
    },
    overallStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    overallStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    overallDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: SIZES.md,
    },
    overallStatValue: {
      fontSize: FONT_SIZES.xxl + 4,
      fontWeight: 'bold',
      color: colors.primary,
    },
    overallStatLabel: {
      fontSize: FONT_SIZES.xs,
      color: colors.gray[600],
      marginTop: SIZES.xs,
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: colors.primary + '10',
      borderRadius: 12,
      padding: SIZES.md,
      marginBottom: SIZES.xl,
      gap: SIZES.sm,
    },
    infoText: {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      lineHeight: 20,
    },
    categoriesContainer: {
      marginBottom: SIZES.xl,
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SIZES.md,
    },
    categoryCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SIZES.md,
      marginBottom: SIZES.md,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    categoryIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SIZES.md,
    },
    categoryContent: {
      flex: 1,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SIZES.xs,
    },
    categoryTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    levelBadge: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: SIZES.sm,
    },
    levelText: {
      fontSize: FONT_SIZES.xs,
      color: colors.white,
      fontWeight: '600',
    },
    categorySubtitle: {
      fontSize: FONT_SIZES.xs,
      color: colors.gray[600],
      marginBottom: SIZES.sm,
    },
    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SIZES.sm,
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: colors.gray[200],
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      fontSize: FONT_SIZES.xs,
      color: colors.gray[600],
      fontWeight: '600',
      minWidth: 40,
      textAlign: 'right',
    },
    motivationCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: SIZES.lg,
      gap: SIZES.sm,
      alignItems: 'flex-start',
    },
    motivationText: {
      flex: 1,
      fontSize: FONT_SIZES.sm,
      color: colors.text,
      fontStyle: 'italic',
      lineHeight: 20,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SIZES.lg,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: SIZES.xl,
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: SIZES.lg,
    },
    modalIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.md,
    },
    modalTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: SIZES.xs,
    },
    modalSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      textAlign: 'center',
    },
    modalLevelInfo: {
      alignItems: 'center',
      marginBottom: SIZES.lg,
    },
    modalLevelText: {
      fontSize: FONT_SIZES.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: SIZES.xs,
    },
    modalProgressText: {
      fontSize: FONT_SIZES.md,
      color: colors.gray[600],
    },
    modalProgressBarContainer: {
      marginBottom: SIZES.xl,
    },
    modalProgressBar: {
      height: 16,
      backgroundColor: colors.gray[200],
      borderRadius: 8,
      overflow: 'hidden',
    },
    modalProgressFill: {
      height: '100%',
      borderRadius: 8,
    },
    buttonSectionTitle: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SIZES.sm,
      marginTop: SIZES.xs,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: SIZES.sm,
      marginBottom: SIZES.md,
    },
    modalButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SIZES.sm + 2,
      borderRadius: 10,
    },
    smallButton: {
      // Smallest button for 1%
    },
    mediumButton: {
      // Medium button for 5%
    },
    largeButton: {
      // Largest button for 10%
    },
    decreaseButton: {
      backgroundColor: colors.gray[400],
    },
    increaseButton: {
      // Color set dynamically
    },
    modalButtonText: {
      color: colors.white,
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
    },
    closeButton: {
      alignItems: 'center',
      paddingVertical: SIZES.sm,
    },
    closeButtonText: {
      fontSize: FONT_SIZES.md,
      color: colors.gray[600],
      fontWeight: '600',
    },
  });

export default PersonalGoalsScreen;
