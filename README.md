# Intentional Movement Corp

A mobile-first platform combining social community features with program sales for fitness and wellness.

## Project Structure

```
intentionalmovementcorp/
├── mobile/              # React Native (Expo) mobile app
├── backend/             # Node.js/Express API server
├── admin-dashboard/     # React admin web panel
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd intentionalmovementcorp
```

2. **Install dependencies for all workspaces**
```bash
npm run install:all
```

Or install individually:
```bash
npm run install:backend
npm run install:mobile
npm run install:admin
```

3. **Set up environment variables**

Copy `.env.example` to `.env` in the backend directory:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure your database and API keys.

Create `.env` files for mobile and admin (already done):
- `mobile/.env` - Configure API_URL
- `admin-dashboard/.env` - Configure REACT_APP_API_URL

4. **Set up the database**

Create PostgreSQL database:
```bash
createdb intentional_movement
```

Run migrations:
```bash
cd backend
npm run migrate
```

Seed sample data (optional):
```bash
npm run seed
```

### Development

**Run backend + admin dashboard concurrently:**
```bash
npm run dev
```

**Run mobile app:**
```bash
npm run dev:mobile
```

Or run individually:
```bash
npm run dev:backend   # Backend on http://localhost:3001
npm run dev:admin     # Admin on http://localhost:3000
npm run dev:mobile    # Mobile on Expo
```

**Mobile development options:**
```bash
cd mobile
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run web          # Run in web browser
```

### Testing

```bash
npm test                 # Run all tests
npm run test:backend     # Backend tests only
npm run test:mobile      # Mobile tests only
```

### Linting

```bash
npm run lint             # Lint all workspaces
npm run lint:backend     # Backend only
npm run lint:mobile      # Mobile only
npm run lint:admin       # Admin only
```

## Tech Stack

### Mobile App
- React Native with Expo SDK ~50.0.0
- Redux Toolkit for state management
- React Navigation v6
- Stripe React Native for payments
- Socket.io client for real-time features
- Expo AV for video playback
- Formik + Yup for form validation

### Backend
- Node.js with Express
- PostgreSQL with Sequelize ORM
- Socket.io for real-time communication
- JWT authentication
- Stripe for payments
- AWS S3 for file storage
- Firebase for push notifications

### Admin Dashboard
- React 18
- React Router v6
- Tailwind CSS
- Recharts for analytics
- TanStack Table for data tables

## Key Features

- **Social Community**: User profiles, posts, likes, comments, follows
- **Messaging**: Real-time direct messaging
- **Programs**: Browse, purchase, and access fitness programs
- **Achievements**: Gamification with badges and milestones
- **Challenges**: Community challenges with leaderboards
- **Payments**: Stripe integration for purchases and subscriptions
- **Admin Dashboard**: User management, analytics, content moderation

## API Documentation

Backend API runs on `http://localhost:3001`

Key endpoints:
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/posts` - Social posts
- `/api/programs` - Program catalog
- `/api/messages` - Messaging
- `/api/challenges` - Challenges
- `/api/admin` - Admin operations

## Database Schema

Main models:
- User, Post, Comment, Like, Follow
- Program, Purchase, Subscription, Progress
- Achievement, UserAchievement
- Challenge, ChallengeParticipant
- Message, Report

See `backend/src/models/index.js` for full schema and associations.

## Deployment

### Backend
- Set NODE_ENV=production
- Use proper database migrations (not sync)
- Configure production environment variables
- Deploy to AWS, Google Cloud, or Heroku

### Mobile
```bash
cd mobile
npm run build:mobile:ios      # Build for iOS
npm run build:mobile:android  # Build for Android
```

### Admin Dashboard
```bash
npm run build:admin
```
Deploy the `admin-dashboard/build` directory to your hosting provider.

## Default Credentials

After seeding the database:
- **Admin**: admin@intentionalmovement.com / Admin123!
- **Test Users**: john@example.com, jane@example.com / Password123!

## Environment Variables

### Backend (.env)
- Database configuration
- JWT secret
- Third-party API keys (Stripe, Firebase, AWS, etc.)

### Mobile (.env)
- API_URL
- STRIPE_PUBLISHABLE_KEY

### Admin (.env)
- REACT_APP_API_URL

## Support

For issues or questions, please check the documentation in `CLAUDE.md` or create an issue in the repository.

## License

Proprietary - All rights reserved
