import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import api from '../../services/api';

const PrivacySettingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState('public'); // public, followers, private
  const [showEmail, setShowEmail] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [allowFollowRequests, setAllowFollowRequests] = useState(true);
  const [allowMessages, setAllowMessages] = useState('everyone'); // everyone, followers, none
  const [showActivity, setShowActivity] = useState(true);
  const [showPurchases, setShowPurchases] = useState(false);
  const [allowTagging, setAllowTagging] = useState(true);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/privacy-settings');
      const settings = response.data.settings;

      setProfileVisibility(settings.profileVisibility || 'public');
      setShowEmail(settings.showEmail || false);
      setShowPhoneNumber(settings.showPhoneNumber || false);
      setAllowFollowRequests(settings.allowFollowRequests !== false);
      setAllowMessages(settings.allowMessages || 'everyone');
      setShowActivity(settings.showActivity !== false);
      setShowPurchases(settings.showPurchases || false);
      setAllowTagging(settings.allowTagging !== false);
    } catch (error) {
      console.log('Error loading privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setSaving(true);
    try {
      await api.put('/users/privacy-settings', {
        profileVisibility,
        showEmail,
        showPhoneNumber,
        allowFollowRequests,
        allowMessages,
        showActivity,
        showPurchases,
        allowTagging,
      });

      if (Platform.OS === 'web') {
        window.alert('Privacy settings saved successfully!');
      } else {
        Alert.alert('Success', 'Privacy settings saved successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save privacy settings';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setSaving(false);
    }
  };

  const SettingRow = ({ title, subtitle, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary }}
        />
      )}
    </View>
  );

  const OptionButton = ({ title, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Privacy Settings</Text>
        <Text style={styles.description}>
          Control who can see your information and activity
        </Text>

        {/* Profile Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Visibility</Text>
          <Text style={styles.sectionSubtitle}>Who can see your profile</Text>
          <View style={styles.optionsContainer}>
            <OptionButton
              title="Public"
              selected={profileVisibility === 'public'}
              onPress={() => setProfileVisibility('public')}
            />
            <OptionButton
              title="Followers"
              selected={profileVisibility === 'followers'}
              onPress={() => setProfileVisibility('followers')}
            />
            <OptionButton
              title="Private"
              selected={profileVisibility === 'private'}
              onPress={() => setProfileVisibility('private')}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <SettingRow
            title="Show Email Address"
            subtitle="Let others see your email address"
            value={showEmail}
            onValueChange={setShowEmail}
          />
          <SettingRow
            title="Show Phone Number"
            subtitle="Let others see your phone number"
            value={showPhoneNumber}
            onValueChange={setShowPhoneNumber}
          />
        </View>

        {/* Interactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interactions</Text>
          <SettingRow
            title="Allow Follow Requests"
            subtitle="Let others send you follow requests"
            value={allowFollowRequests}
            onValueChange={setAllowFollowRequests}
          />
          <SettingRow
            title="Allow Tagging"
            subtitle="Let others tag you in posts"
            value={allowTagging}
            onValueChange={setAllowTagging}
          />
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who Can Message You</Text>
          <View style={styles.optionsContainer}>
            <OptionButton
              title="Everyone"
              selected={allowMessages === 'everyone'}
              onPress={() => setAllowMessages('everyone')}
            />
            <OptionButton
              title="Followers"
              selected={allowMessages === 'followers'}
              onPress={() => setAllowMessages('followers')}
            />
            <OptionButton
              title="No One"
              selected={allowMessages === 'none'}
              onPress={() => setAllowMessages('none')}
            />
          </View>
        </View>

        {/* Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity & Content</Text>
          <SettingRow
            title="Show Activity Status"
            subtitle="Let others see when you're active"
            value={showActivity}
            onValueChange={setShowActivity}
          />
          <SettingRow
            title="Show Purchased Programs"
            subtitle="Display programs you've purchased on your profile"
            value={showPurchases}
            onValueChange={setShowPurchases}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={savePrivacySettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.gray[50],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.gray[50],
    },
    content: {
      padding: SIZES.lg,
    },
    header: {
      fontSize: FONT_SIZES.xxl,
      fontWeight: '700',
      color: colors.dark,
      marginBottom: SIZES.sm,
    },
    description: {
      fontSize: FONT_SIZES.md,
      color: colors.gray[600],
      marginBottom: SIZES.xl,
    },
    section: {
      backgroundColor: colors.white,
      borderRadius: SIZES.sm,
      padding: SIZES.md,
      marginBottom: SIZES.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: '600',
      color: colors.dark,
      marginBottom: SIZES.xs,
    },
    sectionSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginBottom: SIZES.md,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[200],
    },
    settingInfo: {
      flex: 1,
      marginRight: SIZES.md,
    },
    settingTitle: {
      fontSize: FONT_SIZES.md,
      fontWeight: '500',
      color: colors.dark,
    },
    settingSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginTop: 2,
    },
    optionsContainer: {
      flexDirection: 'row',
      gap: SIZES.sm,
      marginTop: SIZES.sm,
    },
    optionButton: {
      flex: 1,
      paddingVertical: SIZES.sm,
      paddingHorizontal: SIZES.md,
      borderRadius: SIZES.sm,
      borderWidth: 1,
      borderColor: colors.gray[300],
      backgroundColor: colors.white,
      alignItems: 'center',
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: '600',
      color: colors.gray[700],
    },
    optionTextSelected: {
      color: colors.white,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: SIZES.md,
      borderRadius: SIZES.sm,
      alignItems: 'center',
      marginTop: SIZES.lg,
      marginBottom: SIZES.xxl,
    },
    saveButtonText: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.white,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });

export default PrivacySettingsScreen;
