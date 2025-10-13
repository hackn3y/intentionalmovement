import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
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

  const handleLogout = () => {
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
  };

  const styles = getStyles(colors);

  return (
    <ScrollView style={styles.container}>
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
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
          onPress={() => Alert.alert('Change Password', 'Password change screen will be implemented')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Privacy Settings"
          subtitle="Manage your privacy preferences"
          onPress={() => Alert.alert('Privacy Settings', 'Privacy settings will be implemented')}
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
          onPress={() => Alert.alert('Help Center', 'Help center will open')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Terms of Service"
          subtitle="Read our terms"
          onPress={() => Alert.alert('Terms', 'Terms of service will open')}
          rightElement={<Text style={styles.arrow}>›</Text>}
          colors={colors}
        />
        <SettingItem
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          onPress={() => Alert.alert('Privacy', 'Privacy policy will open')}
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
  logoutSection: { paddingVertical: SIZES.xxl, paddingHorizontal: SIZES.lg },
  logoutButton: { paddingVertical: SIZES.lg, backgroundColor: colors.primary, borderRadius: SIZES.sm, alignItems: 'center' },
  logoutText: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.white },
  footer: { paddingHorizontal: SIZES.xl, paddingBottom: SIZES.xxl, paddingTop: SIZES.md, alignItems: 'center' },
  footerText: { fontSize: FONT_SIZES.sm, color: colors.gray[500] },
});

export default SettingsScreen;
