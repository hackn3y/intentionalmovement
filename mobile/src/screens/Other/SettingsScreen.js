import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, Share } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';

const SettingItem = ({ title, subtitle, onPress, rightElement, showBorder = true, colors }) => {
  const styles = getStyles(colors);
  return (
    <TouchableOpacity style={[styles.settingItem, !showBorder && styles.noBorder]} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );
};

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleInviteFriends = async () => {
    try {
      const message = 'Join me on Intentional Movement Corp - Elevate Your LifeStyle through intentional living and personal development!';
      const url = 'https://intentionalmovementcorp.com'; // Update with actual app URL/store links

      if (Platform.OS === 'web') {
        // For web, use native share if available, otherwise copy to clipboard
        if (navigator.share) {
          await navigator.share({
            title: 'Join Intentional Movement Corp',
            text: message,
            url: url,
          });
        } else {
          // Fallback for web browsers without Share API
          await navigator.clipboard.writeText(`${message}\n\n${url}`);
          Alert.alert('Copied!', 'Invite link copied to clipboard');
        }
      } else {
        // For mobile, use React Native Share
        const result = await Share.share({
          message: `${message}\n\n${url}`,
          title: 'Join Intentional Movement Corp',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        dispatch(logout());
      }
    } else {
      // Use Alert.alert for native platforms
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => dispatch(logout()),
          },
        ]
      );
    }
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          title="Subscription"
          subtitle={`${user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1) || 'Free'} Plan`}
          onPress={() => navigation.navigate('Subscription')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Edit Profile"
          subtitle="Update your profile information"
          onPress={() => navigation.navigate('EditProfile')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Change Password"
          subtitle="Update your password"
          onPress={() => navigation.navigate('ChangePassword')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Privacy Settings"
          subtitle="Manage your privacy preferences"
          onPress={() => navigation.navigate('PrivacySettings')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          showBorder={false}
          colors={colors}
        />
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          title="Push Notifications"
          subtitle="Receive push notifications"
          rightElement={<Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.primary }} />}
          colors={colors}
        />
        <SettingItem
          title="Dark Mode"
          subtitle="Enable dark theme"
          rightElement={<Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ true: colors.primary }} />}
          showBorder={false}
          colors={colors}
        />
      </View>

      {/* Content Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content</Text>
        <SettingItem
          title="My Programs"
          subtitle="View purchased programs"
          onPress={() => navigation.navigate('MyPrograms')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Achievements"
          subtitle="View your achievements"
          onPress={() => navigation.navigate('Achievements')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          showBorder={false}
          colors={colors}
        />
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => navigation.navigate('HelpCenter')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Terms of Service"
          subtitle="Read our terms"
          onPress={() => navigation.navigate('TermsOfService')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          showBorder={false}
          colors={colors}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem title="Version" subtitle="1.0.0" showBorder={false} colors={colors} />
      </View>

      {/* Invite Friends Button */}
      <View style={styles.inviteSection}>
        <TouchableOpacity style={styles.inviteButton} onPress={handleInviteFriends}>
          <Text style={styles.inviteButtonText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Logged in as {user?.email}</Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  section: { marginTop: SIZES.lg, backgroundColor: colors.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray[200] },
  sectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: colors.gray[600], paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: SIZES.sm },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  noBorder: { borderBottomWidth: 0 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: FONT_SIZES.md, fontWeight: '500', color: colors.dark },
  settingSubtitle: { fontSize: FONT_SIZES.sm, color: colors.gray[600], marginTop: 2 },
  arrow: { fontSize: FONT_SIZES.xxl, color: colors.gray[400], fontWeight: '300' },
  inviteSection: { paddingVertical: SIZES.md, paddingHorizontal: SIZES.lg },
  inviteButton: { paddingVertical: SIZES.md, backgroundColor: colors.success, borderRadius: SIZES.sm, alignItems: 'center' },
  inviteButtonText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.white },
  logoutSection: { paddingVertical: SIZES.md, paddingHorizontal: SIZES.lg },
  logoutButton: { paddingVertical: SIZES.lg, backgroundColor: colors.primary, borderRadius: SIZES.sm, alignItems: 'center' },
  logoutText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.white },
  footer: { paddingHorizontal: SIZES.xl, paddingBottom: SIZES.xxl, paddingTop: SIZES.md, alignItems: 'center' },
  footerText: { fontSize: FONT_SIZES.sm, color: colors.gray[500] },
});

export default SettingsScreen;
