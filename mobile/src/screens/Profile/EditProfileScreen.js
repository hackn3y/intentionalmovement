import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { profileSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import UserAvatar from '../../components/UserAvatar';

/**
 * Edit profile screen with image upload and form
 */
const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { user, loading } = useSelector((state) => state.auth);
  const [selectedImage, setSelectedImage] = useState(null);
  const styles = getStyles(colors);

  /**
   * Handle image picker
   */
  const handleSelectImage = async () => {
    try {
      // Request permission (required for mobile, not for web)
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  /**
   * Handle profile update
   * @param {Object} values - Form values
   */
  const handleUpdateProfile = async (values) => {
    try {
      const updateData = { ...values };

      // Upload image first if one was selected
      if (selectedImage) {
        try {
          // Create FormData with the image file
          const formData = new FormData();

          // Extract filename from URI or generate one
          const filename = selectedImage.split('/').pop() || 'profile-image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          // Append the image file to FormData
          formData.append('image', {
            uri: selectedImage,
            name: filename,
            type: type,
          });

          // Upload the image to the server
          const uploadResponse = await userService.uploadProfilePicture(user.id, formData);

          // Get the uploaded image URL from response
          if (uploadResponse.data && uploadResponse.data.profileImage) {
            updateData.profileImage = uploadResponse.data.profileImage;
          }
        } catch (imageError) {
          if (__DEV__) {
            console.error('Image upload error:', imageError);
          }
          Alert.alert('Error', 'Failed to upload image. Please try again.');
          return; // Stop execution if image upload fails
        }
      }

      const result = await dispatch(updateProfile(updateData)).unwrap();

      // Navigate back with refresh parameter to reload profile
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.navigate('Profile', {
          userId: user.id,
          _forceRefresh: Date.now(), // Force refresh by changing this value
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('updateProfile error:', error);
      }
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <UserAvatar
            uri={selectedImage || user.profileImage || user.profilePicture}
            firstName={user.displayName?.split(' ')[0] || user.username}
            lastName={user.displayName?.split(' ')[1]}
            size={100}
          />
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleSelectImage}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Formik
          initialValues={{
            displayName: user.displayName || '',
            username: user.username || '',
            bio: user.bio || '',
          }}
          validationSchema={profileSchema}
          onSubmit={handleUpdateProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <Input
                label="Display Name"
                placeholder="Enter your full name"
                value={values.displayName}
                onChangeText={handleChange('displayName')}
                onBlur={handleBlur('displayName')}
                error={touched.displayName && errors.displayName}
                autoCapitalize="words"
              />

              <Input
                label="Username"
                placeholder="Enter username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                error={touched.username && errors.username}
                autoCapitalize="none"
              />

              <Input
                label="Bio"
                placeholder="Tell us about yourself"
                value={values.bio}
                onChangeText={handleChange('bio')}
                onBlur={handleBlur('bio')}
                error={touched.bio && errors.bio}
                multiline
                numberOfLines={4}
              />

              <View style={styles.buttonContainer}>
                <Button
                  title="Save Changes"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                />

                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelButton}
                />
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: SIZES.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  changePhotoButton: {
    marginTop: SIZES.md,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.lg,
  },
  changePhotoText: {
    fontSize: FONT_SIZES.md,
    color: colors.primary,
    fontWeight: '600',
  },
  form: {
    marginBottom: SIZES.lg,
  },
  buttonContainer: {
    marginTop: SIZES.lg,
    gap: SIZES.md,
  },
  cancelButton: {
    marginTop: 0,
  },
});

export default EditProfileScreen;
