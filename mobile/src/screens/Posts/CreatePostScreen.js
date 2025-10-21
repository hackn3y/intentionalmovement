import React, { useState, useRef, useCallback } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { createPost } from '../../store/slices/postsSlice';
import { postSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import UserAvatar from '../../components/UserAvatar';
import UpgradePrompt from '../../components/UpgradePrompt';
import { useEnterToSubmit, useEscapeToClose } from '../../hooks/useKeyboardShortcuts';
import api from '../../services/api';

/**
 * Form content component that properly uses keyboard shortcuts
 */
const CreatePostForm = ({ handleChange, handleBlur, handleSubmit, values, errors, touched, createLoading, styles, selectedMedia, mediaType, handleSelectMedia, handleRemoveMedia, editPost, navigation }) => {
  // Enable Ctrl+Enter to submit (multiline) and Escape to cancel
  const isDisabled = createLoading || !values.content.trim();
  useEnterToSubmit(handleSubmit, isDisabled, true);

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
          {mediaType === 'image' && selectedMedia.uri ? (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.imagePreviewImg}
              resizeMode="cover"
            />
          ) : mediaType === 'video' && selectedMedia.uri ? (
            <View style={styles.videoPreview}>
              <Text style={styles.mediaPlaceholder}>🎥 Video</Text>
              <Text style={styles.videoFilename}>
                {selectedMedia.uri.split('/').pop()}
              </Text>
            </View>
          ) : (
            <View style={styles.imagePreview}>
              <Text style={styles.mediaPlaceholder}>📷 Image Selected</Text>
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
};

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
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const styles = getStyles(colors, isDarkMode);

  const editPost = route.params?.post;

  // Check if user can create posts
  const canCreatePosts = user?.subscriptionTier !== 'free';

  // Enable Escape to cancel
  useEscapeToClose(() => navigation.goBack());

  /**
   * Handle media picker
   */
  const handleSelectMedia = async (type) => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'image' ? [4, 3] : [16, 9],
        quality: type === 'image' ? 0.8 : 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0]);
        setMediaType(type);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
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
    // Check if user has permission
    if (!canCreatePosts) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      const postData = { ...values };

      // Upload media if selected
      if (selectedMedia && selectedMedia.uri) {
        const formData = new FormData();
        formData.append('content', values.content);

        // Prepare image file for upload
        const imageUri = selectedMedia.uri;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: filename,
          type,
        });

        // Upload post with image using multipart form data
        const response = await api.post('/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Navigate back immediately - post will appear in feed
        navigation.goBack();
        return;
      }

      // Create post without media
      await dispatch(createPost(postData)).unwrap();

      // Navigate back immediately - post will appear in feed due to Redux state update
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      // Check if error is subscription-related
      if (error?.message?.includes?.('Subscription') || error?.message?.includes?.('subscription')) {
        setShowUpgradePrompt(true);
      } else {
        Alert.alert('Error', error?.message || 'Failed to create post');
      }
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
          {(formikProps) => (
            <CreatePostForm
              {...formikProps}
              createLoading={createLoading}
              styles={styles}
              selectedMedia={selectedMedia}
              mediaType={mediaType}
              handleSelectMedia={handleSelectMedia}
              handleRemoveMedia={handleRemoveMedia}
              editPost={editPost}
              navigation={navigation}
            />
          )}
        </Formik>
      </ScrollView>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="Creating posts"
        requiredTier="basic"
      />
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
  imagePreviewImg: {
    width: '100%',
    height: 200,
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
  videoFilename: {
    fontSize: FONT_SIZES.sm,
    color: isDarkMode ? colors.gray[600] : colors.gray[600],
    marginTop: SIZES.sm,
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
