# Feature Roadmap - Intentional Movement Corp

## Comparison with Amanda Frances Money Queen App

### ✅ Features Already Implemented

| Feature | Implementation | Status |
|---------|---------------|--------|
| Social Community | Posts, Comments, Likes, Follow system | ✅ Complete |
| Digital Programs | Program catalog with Stripe purchases | ✅ Complete |
| Direct Messaging | Real-time chat via Socket.io | ✅ Complete |
| User Profiles | Display name, bio, avatar | ✅ Complete |
| Progress Tracking | Program progress, achievements, challenges | ✅ Complete |
| Video Content | Video player (expo-av, Vimeo) | ✅ Complete |
| Payment Processing | Stripe integration | ✅ Complete |
| Push Notifications | Expo Notifications | ✅ Complete |
| Admin Dashboard | Full-featured React dashboard | ✅ Complete |

---

## 🎯 Missing Features to Implement

### Phase 1: Engagement Boosters (Weeks 1-2)

#### 1. Daily Content/Check-ins 📅
**Priority:** HIGH
**Effort:** Medium (3-5 days)
**Value:** Drives daily engagement and user retention

**Features:**
- Daily motivational content delivery
- Push notifications for daily check-ins
- Streak tracking system
- Calendar view of past content
- Different content types (quotes, tips, challenges)

**Technical Implementation:**
- New `DailyContent` model
- Scheduled job for content publishing
- Push notification service integration
- Streak calculation logic
- Calendar UI component

**Database Schema:**
```javascript
DailyContent {
  id, date, contentType, title, message,
  mediaUrl, category, isActive, createdAt
}

UserStreak {
  userId, currentStreak, longestStreak,
  lastCheckIn, totalCheckIns
}
```

---

#### 2. Podcast Integration 🎙️
**Priority:** HIGH
**Effort:** Medium (3-5 days)
**Value:** Additional content format for on-the-go learning

**Features:**
- Podcast episode library
- Audio streaming with controls (play, pause, skip)
- Background audio playback
- Download for offline listening
- Progress tracking per episode
- Episode notes and show notes

**Technical Implementation:**
- New `Podcast` model
- Audio player using `expo-av` Audio API
- Download manager for offline content
- Background task for audio playback
- Episode progress persistence

**Database Schema:**
```javascript
Podcast {
  id, title, description, audioUrl,
  duration, episodeNumber, season,
  publishDate, thumbnailUrl, category
}

PodcastProgress {
  userId, podcastId, currentPosition,
  completed, lastListened
}
```

---

#### 3. Enhanced Subscription Tiers 💳
**Priority:** HIGH
**Effort:** Medium (4-5 days)
**Value:** Recurring revenue model with tiered access

**Features:**
- Multiple subscription tiers (Basic, Premium, VIP)
- Tier-based content access control
- Trial period support (7-day, 14-day)
- Subscription management (upgrade, downgrade, cancel)
- Billing history and invoices
- Proration handling

**Technical Implementation:**
- Expand existing `Subscription` model
- Stripe subscription management
- Content access middleware
- Trial period logic
- Subscription tier badges

**Database Schema:**
```javascript
SubscriptionTier {
  id, name, price, billingPeriod,
  features, contentAccess, isActive
}

Subscription {
  // Enhanced existing model
  tierId, trialEndDate, cancelAtPeriodEnd,
  currentPeriodStart, currentPeriodEnd
}
```

---

### Phase 2: Content Expansion (Weeks 3-4)

#### 4. Meditation/Visualization Library 🧘
**Priority:** MEDIUM
**Effort:** Medium (3-4 days)
**Value:** Aligns with "Planted Mind" branding

**Features:**
- Guided meditation audio library
- Duration filters (5, 10, 15, 20, 30 minutes)
- Categories (sleep, stress relief, focus, energy)
- Background ambient sounds
- Meditation timer
- Favorites and history

**Technical Implementation:**
- Meditation content management
- Audio player with timer
- Background sound mixer
- Favorite system
- Usage analytics

---

#### 5. Content Bundles 📦
**Priority:** MEDIUM
**Effort:** Low-Medium (2-3 days)
**Value:** Increases average order value

**Features:**
- Group multiple programs into bundles
- Bundle discount pricing
- Bundle progress overview
- "Complete the bundle" promotions
- Bundle recommendations

**Technical Implementation:**
- New `ProgramBundle` model
- Bundle purchase flow
- Bundle progress aggregation
- Discount calculation logic

**Database Schema:**
```javascript
ProgramBundle {
  id, title, description, programIds,
  originalPrice, bundlePrice, discount,
  isActive, thumbnailUrl
}
```

---

#### 6. Bookmark/Favorites System ⭐
**Priority:** LOW
**Effort:** Low (1-2 days)
**Value:** Quality of life improvement

**Features:**
- Bookmark posts and programs
- "Saved" tab in profile
- Quick access to saved content
- Bookmark counts and trending

**Technical Implementation:**
- New `Bookmark` model
- Bookmark button on content
- Saved content feed
- Bookmark management

**Database Schema:**
```javascript
Bookmark {
  id, userId, contentType, contentId,
  createdAt
}
```

---

### Phase 3: Community Features (Weeks 5-6)

#### 7. In-App Community Events 🎉
**Priority:** MEDIUM
**Effort:** High (5-7 days)
**Value:** Community building and engagement

**Features:**
- Event creation and management
- Event calendar view
- RSVP system with capacity limits
- Event notifications and reminders
- Virtual event rooms (optional)
- Event photos and recaps

**Technical Implementation:**
- New `Event` model
- Calendar UI component
- RSVP management
- Event notification system
- Event media gallery

**Database Schema:**
```javascript
Event {
  id, title, description, eventDate,
  duration, capacity, location, isVirtual,
  coverImage, hostId, createdAt
}

EventRSVP {
  userId, eventId, status, createdAt
}
```

---

#### 8. Personalized Recommendations 🎯
**Priority:** LOW-MEDIUM
**Effort:** Medium (3-4 days)
**Value:** Improves content discovery

**Features:**
- Algorithm-based program suggestions
- "Recommended for You" section
- Based on: viewing history, purchases, progress
- Similar programs suggestions
- Trending content

**Technical Implementation:**
- User behavior tracking
- Recommendation algorithm
- Recommendation API endpoint
- Personalized home feed

---

## 🚀 Quick Wins (1-2 days each)

1. **Program Ratings & Reviews** ⭐
   - Users rate completed programs (1-5 stars)
   - Written reviews
   - Average rating display

2. **Share Features** 📱
   - Share programs to social media
   - Share achievements
   - Referral links

3. **Content Categories/Tags** 🏷️
   - Better program organization
   - Filter by category
   - Search by tags

4. **Dark Mode Improvements** 🌙
   - Ensure all screens support dark mode
   - Theme customization options

---

## Implementation Timeline

### Week 1-2: Phase 1 (Engagement Boosters)
- [ ] Daily Content/Check-ins system
- [ ] Podcast integration
- [ ] Enhanced subscription tiers

### Week 3-4: Phase 2 (Content Expansion)
- [ ] Meditation library
- [ ] Content bundles
- [ ] Bookmark system

### Week 5-6: Phase 3 (Community Features)
- [ ] In-app events
- [ ] Personalized recommendations

### Ongoing: Quick Wins
- [ ] Program ratings
- [ ] Share features
- [ ] Content categories
- [ ] Dark mode polish

---

## Success Metrics

**Engagement:**
- Daily active users (DAU)
- Average session duration
- Daily check-in completion rate
- Content consumption rate

**Revenue:**
- Subscription conversion rate
- Average revenue per user (ARPU)
- Bundle purchase rate
- Churn rate

**Community:**
- Event attendance rate
- Social interactions (posts, comments, likes)
- User retention (7-day, 30-day)

---

## Notes

- All features should align with "Planted Mind, Moving Body" brand philosophy
- Focus on intentional living, personal development, and holistic improvement
- Maintain hot pink (#ec4899) and light pink (#fdf2f8) brand colors
- Prioritize mobile-first experience
- Ensure all features work on both iOS and Android

---

**Last Updated:** 2025-10-15
**Current Phase:** Phase 1 - Starting Implementation
