import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProgramById } from '../../store/slices/programsSlice';
import { SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import { formatters } from '../../utils/formatters';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProgramDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { programId } = route.params;
  const { currentProgram, loading, purchaseLoading } = useSelector((state) => state.programs);
  const { myPrograms } = useSelector((state) => state.programs);
  const isPurchased = myPrograms.some(p => (p.id || p._id) === programId);
  const styles = getStyles(colors);

  useEffect(() => {
    dispatch(fetchProgramById(programId));
  }, [programId]);

  const handlePurchase = () => {
    navigation.navigate('Checkout', { programId, price: currentProgram.price });
  };

  const handleStartProgram = () => {
    const firstLesson = currentProgram.lessons[0];
    navigation.navigate('VideoPlayer', { programId, lessonId: firstLesson?.id || firstLesson?._id });
  };

  if (loading && !currentProgram) {
    return <LoadingSpinner text="Loading program..." />;
  }

  if (!currentProgram) return null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          {currentProgram.coverImage ? (
            <Image
              source={{ uri: currentProgram.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageContainer}>
              <Text style={styles.imagePlaceholder}>📚</Text>
            </View>
          )}
          <Text style={styles.title}>{currentProgram.title || 'Untitled Program'}</Text>
          <Text style={styles.instructor}>by {currentProgram.instructorName || 'Intentional Movement'}</Text>
          {currentProgram.price !== undefined && currentProgram.price !== null && (
            <Text style={styles.price}>${parseFloat(currentProgram.price).toFixed(2)}</Text>
          )}
        </View>

        {(currentProgram.description || currentProgram.longDescription) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              {currentProgram.longDescription || currentProgram.description || 'No description available'}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lessons ({currentProgram.lessons?.length || 0})</Text>
          {currentProgram.lessons?.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id || lesson._id}
              style={styles.lessonItem}
              onPress={() => isPurchased && navigation.navigate('VideoPlayer', { programId, lessonId: lesson.id || lesson._id })}
              disabled={!isPurchased}
            >
              <View style={styles.lessonIcon}>
                <Text>{isPurchased ? '▶️' : '🔒'}</Text>
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDuration}>{formatters.formatDuration(lesson.duration)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isPurchased ? (
          <Button title="Start Program" onPress={handleStartProgram} />
        ) : (
          <Button title="Purchase Now" onPress={handlePurchase} loading={purchaseLoading} />
        )}
      </View>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: SIZES.lg, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  coverImage: { width: '100%', height: 200, borderRadius: SIZES.md, marginBottom: SIZES.md },
  imageContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.isDark ? colors.gray[800] : colors.gray[100], justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  imagePlaceholder: { fontSize: 60 },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  instructor: { fontSize: FONT_SIZES.md, color: colors.gray[600], marginTop: SIZES.xs },
  price: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: colors.primary, marginTop: SIZES.sm },
  section: { padding: SIZES.lg, backgroundColor: colors.background },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: colors.text, marginBottom: SIZES.md },
  description: { fontSize: FONT_SIZES.md, color: colors.isDark ? colors.gray[400] : colors.gray[700], lineHeight: 24 },
  lessonItem: { flexDirection: 'row', padding: SIZES.md, backgroundColor: colors.isDark ? colors.gray[800] : colors.gray[50], borderRadius: SIZES.sm, marginBottom: SIZES.sm },
  lessonIcon: { width: 40, justifyContent: 'center', alignItems: 'center' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.text },
  lessonDuration: { fontSize: FONT_SIZES.sm, color: colors.gray[600], marginTop: 2 },
  footer: { padding: SIZES.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
});

export default ProgramDetailScreen;
