import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';

/**
 * Image picker and manipulation helpers
 */
export const imageHelpers = {
  /**
   * Request camera permissions
   * @returns {Promise<boolean>} Permission granted
   */
  requestCameraPermissions: async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take photos.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  },

  /**
   * Request media library permissions
   * @returns {Promise<boolean>} Permission granted
   */
  requestMediaLibraryPermissions: async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library permissions to select images.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  },

  /**
   * Pick image from camera
   * @param {Object} options - Image picker options
   * @returns {Promise<Object|null>} Selected image or null
   */
  takePhoto: async (options = {}) => {
    try {
      const hasPermission = await imageHelpers.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== false,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  },

  /**
   * Pick image from library
   * @param {Object} options - Image picker options
   * @returns {Promise<Object|null>} Selected image or null
   */
  pickImage: async (options = {}) => {
    try {
      const hasPermission = await imageHelpers.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== false,
        aspect: options.aspect || [1, 1],
        quality: options.quality || 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection || false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return options.allowsMultipleSelection ? result.assets : result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      return null;
    }
  },

  /**
   * Pick video from library
   * @param {Object} options - Video picker options
   * @returns {Promise<Object|null>} Selected video or null
   */
  pickVideo: async (options = {}) => {
    try {
      const hasPermission = await imageHelpers.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing !== false,
        quality: options.quality || 0.8,
        videoMaxDuration: options.maxDuration || 60, // 60 seconds default
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
      return null;
    }
  },

  /**
   * Show image picker options (camera or library)
   * @param {Object} options - Picker options
   * @returns {Promise<Object|null>} Selected image or null
   */
  showImagePickerOptions: (options = {}) => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const result = await imageHelpers.takePhoto(options);
              resolve(result);
            },
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              const result = await imageHelpers.pickImage(options);
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  },

  /**
   * Create FormData for image upload
   * @param {Object} image - Image object from picker
   * @param {string} fieldName - Field name for FormData
   * @returns {FormData} FormData object
   */
  createImageFormData: (image, fieldName = 'image') => {
    const formData = new FormData();

    // Get file extension
    const uriParts = image.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append(fieldName, {
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    return formData;
  },

  /**
   * Get file info
   * @param {string} uri - File URI
   * @returns {Promise<Object>} File info
   */
  getFileInfo: async (uri) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  },

  /**
   * Compress image
   * @param {string} uri - Image URI
   * @param {number} quality - Compression quality (0-1)
   * @returns {Promise<string>} Compressed image URI
   */
  compressImage: async (uri, quality = 0.8) => {
    try {
      const manipResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
      });

      if (!manipResult.canceled && manipResult.assets && manipResult.assets.length > 0) {
        return manipResult.assets[0].uri;
      }

      return uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  },

  /**
   * Validate image size
   * @param {Object} image - Image object
   * @param {number} maxSizeMB - Maximum size in MB
   * @returns {boolean} Is valid
   */
  validateImageSize: (image, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (image.fileSize && image.fileSize > maxSizeBytes) {
      Alert.alert(
        'File Too Large',
        `Image must be smaller than ${maxSizeMB}MB. Please select a smaller image.`
      );
      return false;
    }

    return true;
  },

  /**
   * Validate image dimensions
   * @param {Object} image - Image object
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {boolean} Is valid
   */
  validateImageDimensions: (image, maxWidth = 4096, maxHeight = 4096) => {
    if ((image.width && image.width > maxWidth) || (image.height && image.height > maxHeight)) {
      Alert.alert(
        'Image Too Large',
        `Image dimensions must be smaller than ${maxWidth}x${maxHeight}px.`
      );
      return false;
    }

    return true;
  },

  /**
   * Get image dimensions
   * @param {string} uri - Image URI
   * @returns {Promise<Object>} Image dimensions
   */
  getImageDimensions: (uri) => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = uri;
      } else {
        ImagePicker.getPendingResultAsync()
          .then(result => {
            if (result && result.length > 0) {
              const { width, height } = result[0];
              resolve({ width, height });
            } else {
              reject(new Error('No dimensions available'));
            }
          })
          .catch(reject);
      }
    });
  },

  /**
   * Delete cached image
   * @param {string} uri - Image URI
   * @returns {Promise<boolean>} Success status
   */
  deleteCachedImage: async (uri) => {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch (error) {
      console.error('Error deleting cached image:', error);
      return false;
    }
  },
};
