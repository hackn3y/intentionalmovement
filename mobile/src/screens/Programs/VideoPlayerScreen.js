import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateLessonProgress } from '../../store/slices/programsSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import Button from '../../components/Button';

const VideoPlayerScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { programId, lessonId } = route.params;
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleProgressUpdate = async (newProgress) => {
    setProgress(newProgress);
    if (newProgress >= 95) {
      await dispatch(updateLessonProgress({ programId, lessonId, progress: 100, completed: true }));
    } else {
      await dispatch(updateLessonProgress({ programId, lessonId, progress: newProgress, completed: false }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Text style={styles.videoPlaceholder}>🎥 Video Player</Text>
        <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(!isPlaying)}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}% Complete</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Lesson Title</Text>
        <Text style={styles.description}>
          This is a placeholder for the video lesson. The actual implementation would use
          expo-av or react-native-video for video playback with progress tracking.
        </Text>

        <View style={styles.controls}>
          <Button title="Mark as Complete" onPress={() => handleProgressUpdate(100)} />
          <Button title="Next Lesson" variant="outline" onPress={() => {}} style={styles.nextButton} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  videoContainer: { height: 250, backgroundColor: COLORS.gray[900], justifyContent: 'center', alignItems: 'center' },
  videoPlaceholder: { fontSize: FONT_SIZES.xxl, color: COLORS.white },
  playButton: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  playIcon: { fontSize: 30 },
  progressContainer: { padding: SIZES.md, backgroundColor: COLORS.white },
  progressBar: { height: 8, backgroundColor: COLORS.gray[200], borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { fontSize: FONT_SIZES.sm, color: COLORS.gray[600], marginTop: SIZES.xs, textAlign: 'center' },
  content: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.lg },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.dark, marginBottom: SIZES.md },
  description: { fontSize: FONT_SIZES.md, color: COLORS.gray[700], lineHeight: 24, marginBottom: SIZES.xl },
  controls: { gap: SIZES.md },
  nextButton: { marginTop: 0 },
});

export default VideoPlayerScreen;
