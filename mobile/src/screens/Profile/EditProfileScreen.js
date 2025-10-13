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
import { updateProfile } from '../../store/slices/authSlice';
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
    // TODO: Implement image picker
    Alert.alert('Image Picker', 'Image picker will be implemented with expo-image-picker');
  };

  /**
   * Handle profile update
   * @param {Object} values - Form values
   */
  const handleUpdateProfile = async (values) => {
    try {
      console.log('handleUpdateProfile called with:', values);
      const updateData = { ...values };

      if (selectedImage) {
        // TODO: Upload image and get URL
        // updateData.profilePicture = imageUrl;
      }

      console.log('Dispatching updateProfile with:', updateData);
      const result = await dispatch(updateProfile(updateData)).unwrap();
      console.log('updateProfile result:', result);

      // Navigate back immediately - profile will update on ProfileScreen
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('updateProfile error:', error);
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
            movementGoals: user.movementGoals || '',
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

              <Input
                label="Movement Goals"
                placeholder="What are your fitness goals?"
                value={values.movementGoals}
                onChangeText={handleChange('movementGoals')}
                onBlur={handleBlur('movementGoals')}
                error={touched.movementGoals && errors.movementGoals}
                multiline
                numberOfLines={3}
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
