# React Native Mobile App - Complete Implementation Plan

## Intentional Movement Corp Mobile App

This document outlines all files created and those that need to be implemented for the complete React Native mobile application.

---

## FILES CREATED

### Redux Slices (mobile/src/store/slices/) - COMPLETED ✓
1. **authSlice.js** - Authentication state management
   - login, register, logout, loadUser, updateProfile actions
   - User authentication state and token management
   - Firebase authentication support

2. **userSlice.js** - User profile management
   - fetchUserProfile, followUser, unfollowUser actions
   - User search, followers, following, stats
   - Profile data caching

3. **postsSlice.js** - Social feed management
   - fetchPosts, createPost, updatePost, deletePost actions
   - Like/unlike, comments management
   - Pagination and infinite scroll support

4. **messagesSlice.js** - Direct messaging
   - fetchConversations, fetchMessages, sendMessage actions
   - Real-time message support with Socket.io
   - Unread count tracking

5. **programsSlice.js** - Program marketplace
   - fetchPrograms, purchaseProgram, fetchProgramProgress actions
   - Lesson progress tracking
   - Program ratings and reviews

6. **achievementsSlice.js** - Achievements system
   - fetchAchievements, claimAchievement, fetchLeaderboard actions
   - Achievement progress tracking
   - Leaderboard management

7. **challengesSlice.js** - Challenge system
   - fetchChallenges, joinChallenge, updateProgress actions
   - Challenge leaderboards and feeds
   - Challenge creation and management

### API Services (mobile/src/services/) - COMPLETED ✓
1. **api.js** - Axios instance with interceptors
   - Auth token injection
   - Error handling and retry logic
   - File upload helper

2. **authService.js** - Authentication API
   - Login, register, logout endpoints
   - Firebase authentication
   - Password reset and email verification

3. **userService.js** - User API
   - Profile CRUD operations
   - Follow/unfollow functionality
   - User search and stats

4. **postService.js** - Posts API
   - Post CRUD operations
   - Like, comment functionality
   - Media upload

5. **messageService.js** - Messaging API
   - Conversation management
   - Message CRUD operations
   - Read receipts

6. **programService.js** - Programs API
   - Program listing and details
   - Purchase and progress tracking
   - Ratings and reviews

7. **achievementService.js** - Achievements API
   - Achievement tracking
   - Leaderboard fetching
   - Progress tracking

8. **challengeService.js** - Challenges API
   - Challenge CRUD operations
   - Participation and progress
   - Leaderboards

9. **socketService.js** - Socket.io service
   - Real-time messaging
   - Notifications
   - Achievement unlocks

### Utilities (mobile/src/utils/) - COMPLETED ✓
1. **storage.js** - AsyncStorage wrapper
   - Get, set, remove operations
   - Multi-get/set support
   - Object serialization

2. **notifications.js** - Push notifications
   - Registration and permissions
   - Local notifications
   - Notification handlers

3. **validation.js** - Form validation
   - Yup validation schemas
   - Custom validators
   - Password strength checker

4. **formatters.js** - Data formatters
   - Date/time formatting
   - Number formatting
   - Duration and currency formatting

5. **imageHelpers.js** - Image handling
   - Image picker (camera/library)
   - Image compression
   - FormData creation

---

## FILES TO IMPLEMENT

### Auth Screens (mobile/src/screens/Auth/)

#### LoginScreen.js - CREATED ✓
- Email/password login form
- Social login buttons (Google/Apple)
- Form validation with Formik
- Error handling

#### RegisterScreen.js - TO CREATE
```javascript
// Key features:
// - Multi-step registration form
// - Email, password, name, username fields
// - Password strength indicator
// - Terms and conditions checkbox
// - Social registration options
```

#### WelcomeScreen.js - TO CREATE
```javascript
// Key features:
// - Onboarding carousel
// - App feature highlights
// - Get Started / Sign In buttons
// - Skip onboarding option
```

#### ForgotPasswordScreen.js - TO CREATE
```javascript
// Key features:
// - Email input for password reset
// - Reset link confirmation
// - Return to login option
```

### Main Screens (mobile/src/screens/Main/)

#### HomeScreen.js - TO CREATE
```javascript
// Key features:
// - Infinite scroll feed
// - Pull-to-refresh
// - Post cards with like/comment
// - Create post FAB
// - Filter options (Following/Everyone)
```

#### ProfileScreen.js - TO CREATE
```javascript
// Key features:
// - User info header
// - Stats (followers, following, posts)
// - Posts grid/list toggle
// - Follow/unfollow button
// - Edit profile button (own profile)
// - Achievements preview
```

#### EditProfileScreen.js - TO CREATE
```javascript
// Key features:
// - Profile picture upload
// - Edit name, username, bio
// - Edit website and location
// - Save/cancel actions
// - Form validation
```

#### CreatePostScreen.js - TO CREATE
```javascript
// Key features:
// - Text input with character count
// - Image/video picker
// - Media preview
// - Post button with loading state
// - Workout tagging option
```

#### PostDetailScreen.js - TO CREATE
```javascript
// Key features:
// - Full post display
// - Comments list
// - Add comment input
// - Like/unlike functionality
// - Delete/edit (own posts)
```

### Program Screens (mobile/src/screens/Programs/)

#### ProgramsScreen.js - TO CREATE
```javascript
// Key features:
// - Featured programs carousel
// - Category filters
// - Search functionality
// - Program cards with pricing
// - Infinite scroll pagination
```

#### ProgramDetailScreen.js - TO CREATE
```javascript
// Key features:
// - Program info (title, description, price)
// - Instructor info
// - Lessons list with lock icons
// - Reviews and ratings
// - Purchase button / Continue learning
```

#### MyProgramsScreen.js - TO CREATE
```javascript
// Key features:
// - Purchased programs list
// - Progress indicators
// - Continue watching section
// - Download for offline option
```

#### VideoPlayerScreen.js - TO CREATE
```javascript
// Key features:
// - Video player with controls
// - Progress tracking
// - Next/previous lesson buttons
// - Playback speed control
// - Picture-in-picture support
// - Mark as complete option
```

### Message Screens (mobile/src/screens/Messages/)

#### ConversationsScreen.js - TO CREATE
```javascript
// Key features:
// - Conversations list
// - Unread indicators
// - Last message preview
// - Pull-to-refresh
// - Search conversations
// - Swipe to delete
```

#### ChatScreen.js - TO CREATE
```javascript
// Key features:
// - Message bubbles (sent/received)
// - Real-time updates via Socket.io
// - Image/video sharing
// - Typing indicator
// - Message timestamps
// - Load more messages (pagination)
```

### Other Screens (mobile/src/screens/Other/)

#### AchievementsScreen.js - TO CREATE
```javascript
// Key features:
// - User rank and points
// - Achievements grid
// - Locked/unlocked states
// - Claim achievement button
// - Progress bars for in-progress achievements
```

#### ChallengesScreen.js - TO CREATE
```javascript
// Key features:
// - Active challenges list
// - Featured challenges
// - Filter by category
// - Join/leave challenge buttons
// - Progress indicators
```

#### ChallengeDetailScreen.js - TO CREATE
```javascript
// Key features:
// - Challenge info and rules
// - Leaderboard
// - Your progress
// - Activity feed
// - Join/leave button
// - Update progress button
```

#### SettingsScreen.js - TO CREATE
```javascript
// Key features:
// - Account settings
// - Notification preferences
// - Privacy settings
// - App preferences
// - Logout button
```

#### CheckoutScreen.js - TO CREATE
```javascript
// Key features:
// - Program purchase summary
// - Stripe payment integration
// - Payment method selection
// - Purchase confirmation
// - Error handling
```

---

## Navigation (mobile/src/navigation/)

### RootNavigator.js - TO CREATE
```javascript
// Key features:
// - Auth state check
// - Conditional rendering (Auth/Main)
// - Deep linking setup
// - Notification handling
```

### AuthNavigator.js - TO CREATE
```javascript
// Key features:
// - Stack navigator for auth screens
// - Welcome -> Login -> Register flow
// - Forgot password flow
```

### MainNavigator.js - TO CREATE
```javascript
// Key features:
// - Bottom tab navigator
// - Tabs: Home, Programs, Messages, Profile
// - Tab icons and badges
// - Custom tab bar styling
```

### HomeStack.js - TO CREATE
```javascript
// Key features:
// - Stack navigator for Home tab
// - Home -> PostDetail -> Profile flow
// - CreatePost modal
```

### ProfileStack.js - TO CREATE
```javascript
// Key features:
// - Stack navigator for Profile tab
// - Profile -> EditProfile flow
// - Settings screen
```

### ProgramStack.js - TO CREATE
```javascript
// Key features:
// - Stack navigator for Programs tab
// - Programs -> ProgramDetail -> VideoPlayer flow
// - MyPrograms screen
```

### MessageStack.js - TO CREATE
```javascript
// Key features:
// - Stack navigator for Messages tab
// - Conversations -> Chat flow
```

---

## Shared Components (mobile/src/components/)

### PostCard.js - TO CREATE
```javascript
// Key features:
// - User avatar and name
// - Post content with read more
// - Media display (image/video)
// - Like, comment, share buttons
// - Timestamp
// - Menu for delete/edit
```

### UserAvatar.js - TO CREATE
```javascript
// Key features:
// - Circular avatar with image
// - Fallback to initials
// - Custom size prop
// - Online status indicator (optional)
```

### Button.js - TO CREATE
```javascript
// Key features:
// - Multiple variants (primary, outline, text)
// - Loading state
// - Disabled state
// - Icon support
// - Custom styling props
```

### Input.js - TO CREATE
```javascript
// Key features:
// - Label and error message
// - Multiple types (text, email, password)
// - Left/right icons
// - Custom styling props
// - Validation support
```

### LoadingSpinner.js - TO CREATE
```javascript
// Key features:
// - ActivityIndicator wrapper
// - Custom size and color
// - Overlay mode
// - Text label (optional)
```

### EmptyState.js - TO CREATE
```javascript
// Key features:
// - Icon/illustration
// - Title and message
// - Action button (optional)
// - Custom styling
```

### ProgramCard.js - TO CREATE
```javascript
// Key features:
// - Program thumbnail
// - Title and instructor
// - Price or "Purchased" badge
// - Rating stars
// - Duration info
```

### AchievementBadge.js - TO CREATE
```javascript
// Key features:
// - Badge icon/image
// - Title and description
// - Points value
// - Locked/unlocked state
// - Progress bar (for in-progress)
```

### MessageBubble.js - TO CREATE
```javascript
// Key features:
// - Different styles for sent/received
// - Message text
// - Timestamp
// - Read receipt
// - Media support
```

---

## App Entry Point Updates

### App.js - TO UPDATE
```javascript
// Add:
// - Redux Provider
// - Navigation Container
// - Socket.io connection
// - Notification listeners
// - Theme provider
// - Font loading
```

---

## Environment Configuration

### .env - TO CREATE
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## Summary

### Completed Files: 22
- 7 Redux slices
- 9 API services
- 5 Utility modules
- 1 Auth screen (LoginScreen)

### Remaining Files: ~35
- 10 Auth/Main screens
- 4 Program screens
- 2 Message screens
- 4 Other screens
- 7 Navigation files
- 9 Shared components

### Total Project Files: ~57

---

## Next Steps

1. **Create remaining screen components** following the LoginScreen pattern
2. **Implement navigation structure** with React Navigation
3. **Build reusable UI components** (Button, Input, etc.)
4. **Update App.js** with providers and initialization
5. **Test complete user flows** (auth, posting, messaging, programs)
6. **Add offline support** for downloaded programs
7. **Implement deep linking** for notifications
8. **Performance optimization** and testing

---

## Key Technologies Used

- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **Forms**: Formik + Yup
- **API**: Axios
- **Real-time**: Socket.io
- **Payments**: Stripe
- **Notifications**: Expo Notifications
- **Media**: Expo Image Picker, Expo AV
- **Storage**: AsyncStorage
- **Date**: date-fns

---

## Architecture Patterns

1. **Feature-based folder structure**
2. **Redux for global state**
3. **Service layer for API calls**
4. **Utility functions for reusable logic**
5. **Component composition**
6. **Container/Presentational pattern**
7. **Error boundaries**
8. **Offline-first approach**
