# Mixpanel Analytics Setup Guide

This guide explains how to set up and use Mixpanel analytics in the Intentional Movement platform.

## What is Mixpanel?

Mixpanel is a product analytics platform that helps you understand user behavior by tracking events and actions within your application. It provides:

- **Event Tracking**: Track user actions (signups, logins, purchases, etc.)
- **User Profiles**: Build comprehensive profiles with user properties
- **Funnels**: Analyze conversion rates through multi-step processes
- **Cohort Analysis**: Group users based on behaviors or attributes
- **Retention Reports**: Measure how often users return to your app
- **A/B Testing**: Test different features and measure impact

## Setup Instructions

### 1. Create a Mixpanel Account

1. Go to [mixpanel.com](https://mixpanel.com)
2. Sign up for a free account (free tier includes 100K events/month)
3. Create a new project for your app

### 2. Get Your Project Token

1. In your Mixpanel dashboard, go to **Settings** → **Project Settings**
2. Copy your **Project Token**
3. You'll need this token for both backend and mobile configuration

### 3. Configure Backend

Add your Mixpanel token to `backend/.env`:

```bash
# Analytics (Optional)
MIXPANEL_TOKEN=your_actual_mixpanel_token_here
```

The backend service is already configured in `backend/src/services/mixpanelService.js` and will:
- Automatically initialize when the server starts
- Track server-side events (signups, purchases, etc.)
- Handle user identification and property updates

### 4. Configure Mobile App

Add your Mixpanel token to `mobile/.env`:

```bash
# Analytics (Optional)
EXPO_PUBLIC_MIXPANEL_TOKEN=your_actual_mixpanel_token_here
```

The mobile analytics service is already configured in `mobile/src/services/analyticsService.js` and will:
- Initialize when the app starts
- Track client-side events (screen views, interactions, etc.)
- Sync with backend tracking for complete user journey

### 5. Restart Your Servers

After updating the `.env` files, restart all servers:

```bash
# Kill existing processes
# Windows: Use Task Manager or taskkill
# Mac/Linux: Use killall node

# Restart servers
npm run dev:backend
npm run dev:mobile
npm run dev:admin  # (admin doesn't use Mixpanel yet)
```

## Events Being Tracked

### Backend Events

The backend automatically tracks:

| Event | Description | Properties |
|-------|-------------|------------|
| `User Signup` | New user registration | username, email, signupMethod |
| `User Login` | User authentication | username, email |
| `Post Created` | New social post | postId, hasMedia, contentLength |
| `Program Purchased` | Program purchase completed | programId, programName, category, price, revenue |
| `Program Progress Updated` | User progress in program | programId, programName, progress |
| `Achievement Unlocked` | User unlocked achievement | achievementId, achievementName, points |
| `Challenge Joined` | User joined challenge | challengeId, challengeName, duration |

### Mobile Events

The mobile app tracks:

| Event | Description | Properties |
|-------|-------------|------------|
| `Screen View` | User navigated to screen | screenName |
| `User Signup` | Registration completed | username, method (email/google/apple) |
| `User Login` | Login completed | username |
| `Post Created` | User created post | postId, hasMedia, contentLength |
| `Post Liked/Commented/Shared` | Social interactions | postId |
| `Program Viewed` | User viewed program details | programId, programName, category, price |
| `Purchase Initiated` | User started purchase flow | programId, programName, price |
| `Purchase Completed` | Purchase finalized | programId, programName, price, revenue |
| `Lesson Completed` | User finished lesson | programId, lessonId, progress |
| `Achievement Unlocked` | Achievement earned | achievementId, achievementName, points |
| `Challenge Joined` | Challenge participation | challengeId, challengeName |
| `Message Sent` | Direct message sent | receiverId |
| `Search` | User performed search | query, type, resultsCount |

## Using Analytics in Your Code

### Backend Example

```javascript
const mixpanel = require('../services/mixpanelService');

// Track an event
mixpanel.track(userId, 'Custom Event', {
  customProperty: 'value',
  anotherProperty: 123
});

// Update user properties
mixpanel.identify(userId, {
  $email: user.email,
  $name: user.displayName,
  customUserProp: 'value'
});

// Increment a counter
mixpanel.increment(userId, 'custom_action_count', 1);
```

### Mobile Example

```javascript
import analyticsService from '../../services/analyticsService';

// Track an event
analyticsService.track('Custom Event', {
  customProperty: 'value',
  anotherProperty: 123
});

// Track screen view
analyticsService.trackScreenView('Settings Screen');

// Set user properties
analyticsService.setUserProperties({
  favoriteCategory: 'Fitness',
  isPremium: true
});

// Increment a counter
analyticsService.increment('custom_action_count', 1);
```

## Adding New Event Tracking

### Backend

1. Open `backend/src/services/mixpanelService.js`
2. Add a new method for your event:

```javascript
/**
 * Track custom event
 * @param {object} user - User object
 * @param {object} data - Event data
 */
trackCustomEvent(user, data) {
  this.track(user.id, 'Custom Event Name', {
    property1: data.property1,
    property2: data.property2,
  });

  // Optionally increment a counter
  this.increment(user.id, 'custom_events_count');
}
```

3. Call it from your controller:

```javascript
const mixpanel = require('../services/mixpanelService');

// In your controller method
mixpanel.trackCustomEvent(req.user, { property1: 'value' });
```

### Mobile

1. Open `mobile/src/services/analyticsService.js`
2. Add a new method:

```javascript
/**
 * Track custom event
 * @param {object} data - Event data
 */
trackCustomEvent(data) {
  this.track('Custom Event Name', {
    property1: data.property1,
    property2: data.property2,
  });
  this.increment('custom_events_count');
}
```

3. Call it from your component:

```javascript
import analyticsService from '../../services/analyticsService';

// In your component
analyticsService.trackCustomEvent({ property1: 'value' });
```

## Viewing Analytics

### In Mixpanel Dashboard

1. Go to your Mixpanel project dashboard
2. Navigate to different sections:
   - **Events**: View all tracked events and their frequency
   - **Users**: Browse user profiles and their properties
   - **Insights**: Create custom reports and visualizations
   - **Funnels**: Analyze conversion rates
   - **Retention**: See how often users return

### Useful Reports to Create

1. **Signup Funnel**:
   - Events: Screen View (Welcome) → User Signup → First Post
   - Measures: How many users complete onboarding

2. **Purchase Funnel**:
   - Events: Program Viewed → Purchase Initiated → Purchase Completed
   - Measures: Conversion rate for program sales

3. **Engagement Metrics**:
   - Daily Active Users (DAU)
   - Posts created per user
   - Average session duration

4. **Revenue Analytics**:
   - Total revenue from program purchases
   - Revenue by program category
   - Lifetime value per user

## Best Practices

### Event Naming
- Use Title Case for event names: "User Signup" not "user_signup"
- Be consistent and descriptive
- Use present tense: "Post Created" not "Post Creation"

### Properties
- Use camelCase for property names: `programId` not `program_id`
- Include relevant context (IDs, names, categories)
- Add timestamps for time-based analysis

### User Properties
- Use Mixpanel's special properties (prefixed with `$`):
  - `$email`: User email
  - `$name`: User full name
  - `$created`: Account creation date
- Add custom properties for segmentation:
  - `favoriteCategory`
  - `totalPurchases`
  - `membershipTier`

### Privacy Considerations
- Never track sensitive data (passwords, payment details)
- Follow GDPR/privacy regulations
- Provide opt-out options for users
- Use hashed/anonymized IDs when appropriate

## Troubleshooting

### Events Not Showing Up

1. **Check token configuration**:
   ```bash
   # Verify token is set in .env (not the example value)
   cat backend/.env | grep MIXPANEL_TOKEN
   cat mobile/.env | grep EXPO_PUBLIC_MIXPANEL_TOKEN
   ```

2. **Check initialization**:
   - Backend: Look for "Mixpanel analytics initialized" in server logs
   - Mobile: Look for "Mixpanel analytics initialized" in console

3. **Verify network requests**:
   - Open browser DevTools → Network tab
   - Look for requests to `api.mixpanel.com`
   - Check for errors or 4xx/5xx responses

4. **Check Mixpanel dashboard**:
   - Events can take a few minutes to appear
   - Use "Live View" for real-time event stream
   - Verify project token matches your configuration

### Analytics Disabled

If you see "Mixpanel token not configured" messages, either:
- You haven't set the token in `.env` files
- You're using the example value `your_mixpanel_token`

This is normal for development if you haven't set up Mixpanel yet. The app will work fine without analytics.

## Cost Considerations

Mixpanel's free tier includes:
- 100,000 events per month
- 1,000 tracked users
- 90 days of data history

For production with higher volumes:
- Growth plan: $25/month for 10M events
- Enterprise: Custom pricing for unlimited events

Monitor your event volume in Mixpanel dashboard under **Usage & Billing**.

## Additional Resources

- [Mixpanel Documentation](https://docs.mixpanel.com/)
- [Mixpanel React Native SDK](https://github.com/mixpanel/mixpanel-react-native)
- [Mixpanel Node.js SDK](https://github.com/mixpanel/mixpanel-node)
- [Event Tracking Best Practices](https://mixpanel.com/blog/event-tracking-best-practices/)

## Support

If you encounter issues with Mixpanel integration:
1. Check the troubleshooting section above
2. Review the Mixpanel documentation
3. Check implementation in the service files:
   - Backend: `backend/src/services/mixpanelService.js`
   - Mobile: `mobile/src/services/analyticsService.js`
