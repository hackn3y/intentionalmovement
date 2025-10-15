import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SIZES, FONT_SIZES } from '../config/constants';

/**
 * Install PWA Prompt Component
 * Shows a banner prompting users to install the app (Web only)
 */
const InstallPWA = () => {
  const { colors } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web') return;

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show custom install banner
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for 7 days
    if (typeof window !== 'undefined' && window.localStorage) {
      const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      localStorage.setItem('pwa-dismiss-until', dismissUntil.toString());
    }
  };

  // Check if dismissed recently
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const dismissUntil = localStorage.getItem('pwa-dismiss-until');
      if (dismissUntil && Date.now() < parseInt(dismissUntil, 10)) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || Platform.OS !== 'web') return null;

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📱</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Install Intentional Movement</Text>
          <Text style={styles.message}>
            Install our app for a better experience, offline access, and quick access from your home screen!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.installButton}
            onPress={handleInstall}
            activeOpacity={0.8}
          >
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.closeIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    gap: SIZES.md,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
  },
  textContainer: {
    flex: 1,
    gap: SIZES.xs,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: SIZES.sm,
  },
  installButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    backgroundColor: colors.primary,
    borderRadius: SIZES.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  installButtonText: {
    color: colors.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    backgroundColor: 'transparent',
    borderRadius: SIZES.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    minWidth: 100,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: colors.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 32,
    color: colors.gray[400],
    lineHeight: 32,
  },
});

export default InstallPWA;
