# Quick Start Guide - Intentional Movement Mobile App

## For Developers Continuing This Project

This guide will help you quickly understand the project structure and continue development.

---

## What's Already Built (40% Complete)

### Complete & Production-Ready:
1. **All Redux State Management** (7 slices)
2. **All API Services** (9 services + Socket.io)
3. **All Utility Functions** (5 modules)
4. **Base UI Components** (6 components)
5. **Navigation Framework** (4 navigators)
6. **Example Screens** (Login, Home feed)

### What You Need to Build:
- Remaining screens (~15 screens)
- Additional components (3 components)
- Complete navigation stacks (3 stacks)

---

## Project Structure Quick Reference

```
mobile/src/
├── components/       # ✓ Base components done (Button, Input, etc.)
├── navigation/       # ✓ Framework done, need 3 more stacks
├── screens/
│   ├── Auth/        # ✓ LoginScreen done, need 3 more
│   ├── Main/        # ✓ HomeScreen done, need 3 more
│   ├── Programs/    # ⚠ Need all 4 screens
│   ├── Messages/    # ⚠ Need all 2 screens
│   └── Other/       # ⚠ Need all 5 screens
├── services/        # ✓ All API services complete
├── store/slices/    # ✓ All Redux slices complete
└── utils/          # ✓ All utilities complete
```

---

## How to Continue Development

### Step 1: Clone Existing Patterns

All new screens should follow the LoginScreen and HomeScreen patterns:

**Screen Template:**
```javascript
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, SIZES } from '../../config/constants';

const YourScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.yourSlice);

  useEffect(() => {
    // Load data
  }, []);

  return (
    <View style={styles.container}>
      {/* Your UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

export default YourScreen;
```

### Step 2: Use Existing Components

Don't recreate - reuse:
```javascript
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import UserAvatar from '../../components/UserAvatar';
import PostCard from '../../components/PostCard';
```

### Step 3: Use Existing Redux Actions

All state management is ready:
```javascript
// Posts
import { fetchPosts, createPost, likePost } from '../../store/slices/postsSlice';

// Users
import { fetchUserProfile, followUser } from '../../store/slices/userSlice';

// Programs
import { fetchPrograms, purchaseProgram } from '../../store/slices/programsSlice';

// Messages
import { fetchConversations, sendMessage } from '../../store/slices/messagesSlice';

// Achievements
import { fetchAchievements, claimAchievement } from '../../store/slices/achievementsSlice';

// Challenges
import { fetchChallenges, joinChallenge } from '../../store/slices/challengesSlice';
```

### Step 4: Use Existing API Services

All API calls are ready:
```javascript
import { postService } from '../../services/postService';
import { programService } from '../../services/programService';
import { messageService } from '../../services/messageService';
// etc.
```

### Step 5: Use Existing Utilities

```javascript
// Storage
import { storage } from '../../utils/storage';
await storage.set('key', 'value');

// Formatters
import { formatters } from '../../utils/formatters';
formatters.formatRelativeTime(date);
formatters.formatCurrency(amount);

// Image Helpers
import { imageHelpers } from '../../utils/imageHelpers';
const image = await imageHelpers.pickImage();

// Validation
import { loginSchema, registerSchema } from '../../utils/validation';
```

---

## Priority Implementation Order

### Week 1: Auth Screens
1. **RegisterScreen.js**
   - Copy LoginScreen.js
   - Add more fields (firstName, lastName, username)
   - Use registerSchema validation
   - Call dispatch(register(values))

2. **WelcomeScreen.js**
   - Create simple onboarding carousel
   - Add "Get Started" button
   - Navigate to Login or Register

3. **ForgotPasswordScreen.js**
   - Email input only
   - Use authService.forgotPassword()

### Week 2: Main Screens
1. **ProfileScreen.js**
   - Show user info with UserAvatar
   - Display stats (followers, following, posts)
   - Grid of user posts
   - Follow/unfollow button

2. **CreatePostScreen.js**
   - Text input with Formik
   - Image picker button
   - Use dispatch(createPost(data))

3. **PostDetailScreen.js**
   - Show single post
   - Comments list
   - Add comment input

4. **EditProfileScreen.js**
   - Form with current user data
   - Profile picture upload
   - Save button

### Week 3: Program Screens
1. **ProgramsScreen.js**
   - FlatList with ProgramCard (needs creation)
   - Search and filters
   - Use fetchPrograms action

2. **ProgramDetailScreen.js**
   - Program info display
   - Lessons list
   - Purchase button with Stripe

3. **MyProgramsScreen.js**
   - List of purchased programs
   - Progress indicators

4. **VideoPlayerScreen.js**
   - Use Expo AV Video component
   - Track progress with updateLessonProgress

### Week 4: Messaging & Other
1. **ConversationsScreen.js**
   - FlatList of conversations
   - Unread badges

2. **ChatScreen.js**
   - FlatList of messages (inverted)
   - TextInput for new messages
   - Socket.io integration for real-time

3. **AchievementsScreen.js**
   - Grid of achievement badges
   - Claim buttons

4. **ChallengesScreen.js**
   - List of challenges
   - Join/leave functionality

5. **SettingsScreen.js**
   - Account settings
   - Logout button

---

## Common Patterns

### Infinite Scroll Pattern
```javascript
const handleLoadMore = () => {
  if (!loading && hasMore) {
    dispatch(fetchData({ page: page + 1 }));
  }
};

<FlatList
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
/>
```

### Pull-to-Refresh Pattern
```javascript
const handleRefresh = () => {
  dispatch(setRefreshing(true));
  dispatch(clearData());
  dispatch(fetchData({ page: 1 }));
};

<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  }
/>
```

### Form Pattern
```javascript
<Formik
  initialValues={{ field: '' }}
  validationSchema={yourSchema}
  onSubmit={handleSubmit}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
    <View>
      <Input
        value={values.field}
        onChangeText={handleChange('field')}
        onBlur={handleBlur('field')}
        error={touched.field && errors.field}
      />
      <Button onPress={handleSubmit} />
    </View>
  )}
</Formik>
```

### Loading State Pattern
```javascript
if (loading && !data.length) {
  return <LoadingSpinner />;
}

if (!loading && !data.length) {
  return <EmptyState />;
}

return <FlatList data={data} />;
```

---

## Navigation Patterns

### Navigate to Screen
```javascript
navigation.navigate('ScreenName', { param: value });
```

### Get Route Params
```javascript
const { param } = route.params;
```

### Go Back
```javascript
navigation.goBack();
```

### Navigate to Different Tab
```javascript
navigation.navigate('TabName', {
  screen: 'ScreenName',
  params: { param: value }
});
```

---

## Styling Conventions

### Use Design Tokens
```javascript
import { COLORS, SIZES, FONT_SIZES } from '../config/constants';

const styles = StyleSheet.create({
  container: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
  },
  text: {
    fontSize: FONT_SIZES.md,
    color: COLORS.dark,
  },
});
```

### Common Spacing
- `SIZES.xs` - 4px (minimal spacing)
- `SIZES.sm` - 8px (small spacing)
- `SIZES.md` - 16px (default spacing)
- `SIZES.lg` - 24px (large spacing)
- `SIZES.xl` - 32px (extra large)
- `SIZES.xxl` - 48px (section spacing)

---

## Testing Checklist

### For Each Screen:
- [ ] Loading state displays correctly
- [ ] Error handling works
- [ ] Empty state shows when no data
- [ ] Pull-to-refresh works
- [ ] Infinite scroll works (if applicable)
- [ ] Navigation works correctly
- [ ] Back button works
- [ ] Form validation works (if applicable)
- [ ] API calls succeed
- [ ] Redux state updates correctly

---

## Common Issues & Solutions

### Issue: "Can't find variable: dispatch"
**Solution:** Import useDispatch
```javascript
import { useDispatch } from 'react-redux';
const dispatch = useDispatch();
```

### Issue: "Can't find variable: navigation"
**Solution:** Accept navigation prop
```javascript
const YourScreen = ({ navigation, route }) => {
```

### Issue: Redux state not updating
**Solution:** Check you're using .unwrap() on thunks
```javascript
await dispatch(yourAction()).unwrap();
```

### Issue: Image not displaying
**Solution:** Check URI is valid and use source prop
```javascript
<Image source={{ uri: imageUrl }} />
```

---

## Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)
- [Formik](https://formik.org/)

### Component Examples
- See `LoginScreen.js` for form patterns
- See `HomeScreen.js` for list patterns
- See `PostCard.js` for card components

### Need Help?
- Check IMPLEMENTATION_PLAN.md for detailed feature specs
- Check PROJECT_SUMMARY.md for architecture overview
- Look at existing similar screens for patterns

---

## Quick Commands

```bash
# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Lint code
npm run lint

# Install new package
npm install package-name

# Clear cache
expo start -c
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/screen-name

# Commit changes
git add .
git commit -m "Add ScreenName with feature X"

# Push branch
git push origin feature/screen-name
```

---

## Final Notes

- **Don't reinvent the wheel** - use existing patterns
- **Copy-paste is OK** - then customize
- **Test as you go** - don't wait until the end
- **Use TypeScript-style comments** - helps with IntelliSense
- **Keep components small** - easier to maintain
- **Reuse, reuse, reuse** - components, styles, utilities

**You've got this!** The hard parts (Redux, API, utilities) are done. Now it's just building UI screens using the existing infrastructure.
