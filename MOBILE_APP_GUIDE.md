# Mobile App Setup & Running Guide

## ✅ Fixed Issues
- [x] Removed asset dependencies from app.json
- [x] Created assets folder structure
- [x] Simplified configuration for development

---

## 🚀 Option 1: Run on Web (EASIEST - No Device Needed)

This is the simplest way to test the mobile app without needing a physical device or emulator.

```bash
cd mobile
npx expo start --web
```

This will open the app in your web browser at `http://localhost:19006`

**Pros:**
- No device or emulator needed
- Fastest startup
- Easy debugging with browser dev tools

**Cons:**
- Some mobile-specific features won't work (camera, push notifications)
- Layout might differ slightly from real mobile

---

## 🎯 Option 2: Use Expo Go App (Physical Device)

### For Android:
1. Install **Expo Go** from Google Play Store
2. Make sure your phone and computer are on the same Wi-Fi
3. Start the app:
   ```bash
   cd mobile
   npx expo start
   ```
4. Scan the QR code with the Expo Go app

### For iOS:
1. Install **Expo Go** from App Store
2. Make sure your iPhone and computer are on the same Wi-Fi
3. Start the app:
   ```bash
   cd mobile
   npx expo start
   ```
4. Scan the QR code with your iPhone camera (it will suggest opening Expo Go)

### SDK Version Note:
Your project is on Expo SDK 50. If Expo Go asks you to upgrade:
- **Option A:** Download Expo Go for SDK 50 (link will be shown in error)
- **Option B:** Upgrade project to SDK 54 (see upgrade section below)

---

## 💻 Option 3: Use Simulators/Emulators

### iOS Simulator (Mac Only)
1. Install Xcode from App Store (this is what failed earlier)
2. Install iOS Simulator via Xcode
3. Run:
   ```bash
   cd mobile
   npx expo start
   press 'i' for iOS simulator
   ```

### Android Emulator (Windows/Mac/Linux)
1. Install Android Studio: https://developer.android.com/studio
2. Set up Android SDK:
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install Android SDK (API 33 or higher)
3. Set environment variable:
   ```powershell
   # Windows PowerShell
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\PC\AppData\Local\Android\Sdk', 'User')
   ```
4. Create virtual device:
   - Tools → Device Manager
   - Create Device → Choose a phone model
   - Select system image (API 33)
5. Run:
   ```bash
   cd mobile
   npx expo start
   press 'a' for Android
   ```

---

## 🆙 Upgrading to Expo SDK 54 (Optional)

If you want to use the latest Expo Go without compatibility issues:

```bash
cd mobile

# Upgrade Expo SDK
npx expo install expo@~54.0.0 --fix

# Update dependencies
npx expo install --fix

# Clear cache and restart
npx expo start --clear
```

---

## 🐛 Troubleshooting

### Issue: "Unable to resolve ../../App"
**Fixed!** We removed problematic asset dependencies from app.json

### Issue: "SDK Version Mismatch"
**Solutions:**
1. Use web version (doesn't need SDK match)
2. Download older Expo Go for SDK 50
3. Upgrade project to SDK 54

### Issue: "Android SDK not found"
**Solution:** Either:
- Use web version (no Android SDK needed)
- Install Android Studio and set ANDROID_HOME
- Use physical device with Expo Go instead

### Issue: "Xcode not installed"
**Solution:** Either:
- Use web version
- Use Android instead
- Use physical iOS device with Expo Go
- Install Xcode (large download, Mac only)

### Issue: "API_URL connection failed"
**For Web:** Use `http://localhost:3001/api` in .env
**For Physical Device:**
1. Find your computer's IP:
   ```bash
   ipconfig  # Windows
   # Look for IPv4 Address under your Wi-Fi adapter
   ```
2. Update `mobile/.env`:
   ```
   API_URL=http://YOUR_COMPUTER_IP:3001/api
   # Example: API_URL=http://192.168.1.100:3001/api
   ```

---

## 📱 Recommended Development Setup

**For Quick Testing:**
```bash
cd mobile
npx expo start --web
```
Open browser to http://localhost:19006

**For Full Testing:**
1. Use **Expo Go app** on your physical phone
2. Connect to same Wi-Fi
3. Scan QR code

**For Production-like Testing:**
1. Set up Android Studio emulator
2. Test all features including camera, notifications
3. Build native apps for final testing

---

## 🎨 Adding App Icons & Splash Screen (Later)

When you're ready to add branding:

1. Create or design:
   - `icon.png` - 1024x1024px (app icon)
   - `splash.png` - 1284x2778px (loading screen)
   - `adaptive-icon.png` - 1024x1024px (Android)

2. Place in `mobile/assets/` folder

3. Update `mobile/app.json`:
   ```json
   {
     "expo": {
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#8B1538"
       },
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#8B1538"
         }
       }
     }
   }
   ```

Use brand colors: Burgundy (#8B1538) as background

---

## ✅ Quick Start Command

**Run this right now to test the app:**

```bash
cd C:\Users\PC\Documents\intentionalmovementcorp\mobile
npx expo start --web
```

This will open in your web browser - no device needed!

---

## 📚 Resources

- **Expo Documentation:** https://docs.expo.dev
- **Expo Go App:** https://expo.dev/go
- **Troubleshooting:** https://docs.expo.dev/troubleshooting/overview/
- **SDK Upgrade Guide:** https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/

---

**Last Updated:** October 11, 2025
