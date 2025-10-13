import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { createPost } from '../../store/slices/postsSlice';
import { postSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import UserAvatar from '../../components/UserAvatar';
import { useEnterToSubmit, useEscapeToClose } from '../../hooks/useKeyboardShortcuts';

/**
 * Create/edit post screen with media picker
 */
const CreatePostScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { createLoading } = useSelector((state) => state.posts);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const styles = getStyles(colors, isDarkMode);

  const editPost = route.params?.post;

  /**
   * Handle media picker
   */
  const handleSelectMedia = async (type) => {
    // TODO: Implement image/video picker with expo-image-picker
    Alert.alert('Media Picker', `${type} picker will be implemented`);
    // For now, just set a placeholder
    setMediaType(type);
    setSelectedMedia('placeholder');
  };

  /**
   * Remove selected media
   */
  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  /**
   * Handle post creation
   * @param {Object} values - Form values
   */
  const handleCreatePost = async (values) => {
    try {
      const postData = { ...values };

      if (selectedMedia && selectedMedia !== 'placeholder') {
        // TODO: Upload media and get URL
        // postData.mediaUrl = uploadedUrl;
        // postData.mediaType = mediaType;
      }

      await dispatch(createPost(postData)).unwrap();

      // Navigate back immediately - post will appear in feed due to Redux state update
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error || 'Failed to create post');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <UserAvatar
            uri={user?.profileImage || user?.profilePicture}
            firstName={user?.displayName?.split(' ')[0] || user?.username}
            lastName={user?.displayName?.split(' ')[1]}
            size={40}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || user?.username}
            </Text>
            <Text style={styles.username}>@{user?.username}</Text>
          </View>
        </View>

        {/* Form */}
        <Formik
          initialValues={{
            content: editPost?.content || '',
          }}
          validationSchema={postSchema}
          onSubmit={handleCreatePost}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => {
            // Enable Ctrl+Enter to submit (multiline) and Escape to cancel
            const isDisabled = createLoading || !values.content.trim();
            useEnterToSubmit(handleSubmit, isDisabled, true);
            useEscapeToClose(() => navigation.goBack());

            return (
            <View style={styles.form}>
              <Input
                placeholder="What's on your mind?"
                value={values.content}
                onChangeText={handleChange('content')}
                onBlur={handleBlur('content')}
                error={touched.content && errors.content}
                multiline
                numberOfLines={8}
                style={styles.contentInput}
                inputStyle={styles.contentInputField}
              />

              {/* Media Preview */}
              {selectedMedia && (
                <View style={styles.mediaPreview}>
                  {mediaType === 'image' ? (
                    <View style={styles.imagePreview}>
                      <Text style={styles.mediaPlaceholder}>📷 Image Selected</Text>
                    </View>
                  ) : (
                    <View style={styles.videoPreview}>
                      <Text style={styles.mediaPlaceholder}>🎥 Video Selected</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaButton}
                    onPress={handleRemoveMedia}
                  >
                    <Text style={styles.removeMediaIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Media Buttons */}
              <View style={styles.mediaButtons}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleSelectMedia('image')}
                >
                  <Text style={styles.mediaButtonIcon}>📷</Text>
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={() => handleSelectMedia('video')}
                >
                  <Text style={styles.mediaButtonIcon}>🎥</Text>
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title={editPost ? 'Update Post' : 'Post'}
                  onPress={handleSubmit}
                  loading={createLoading}
                  disabled={createLoading || !values.content.trim()}
                />

                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                />
              </View>
            </View>
          );
        }}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: SIZES.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  userInfo: {
    marginLeft: SIZES.md,
  },
  userName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  username: {
    fontSize: FONT_SIZES.sm,
    color: isDarkMode ? colors.gray[400] : colors.gray[600],
    marginTop: 2,
  },
  form: {
    flex: 1,
  },
  contentInput: {
    marginBottom: SIZES.lg,
  },
  contentInputField: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  mediaPreview: {
    marginBottom: SIZES.lg,
    borderRadius: SIZES.sm,
    overflow: 'hidden',
    backgroundColor: isDarkMode ? colors.gray[200] : colors.gray[100],
    position: 'relative',
  },
  imagePreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    fontSize: FONT_SIZES.xl,
    color: isDarkMode ? colors.gray[500] : colors.gray[500],
  },
  removeMediaButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: (isDarkMode ? colors.gray[800] : COLORS.dark) + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDarkMode ? colors.gray[100] : colors.gray[50],
  },
  mediaButtonIcon: {
    fontSize: FONT_SIZES.xl,
    marginRight: SIZES.sm,
  },
  mediaButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    gap: SIZES.md,
  },
  cancelButton: {
    marginTop: 0,
  },
});

export default CreatePostScreen;
