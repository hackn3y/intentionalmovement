# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Intentional Movement Corp is a mobile-first platform combining social community features with program sales for fitness and wellness. The platform embraces the philosophy of "Planted Mind, Moving Body" and focuses on intentional living, personal development, and holistic lifestyle improvement.

**Brand Identity**:
- Tagline: "Planted Mind, Moving Body"
- Primary color: Hot Pink (#ec4899)
- Background: Light Pink (#fdf2f8)
- Voice: Inspirational, sophisticated, aspirational
- Messaging: "Elevate Your LifeStyle" - Creating a life of achievement, success, class, health, and elevation

The app enables users to connect, share their movement journey, and purchase fitness/wellness programs.

## Repository Structure

This is a monorepo with three main workspaces:
- **mobile/**: React Native (Expo) mobile application
- **backend/**: Node.js/Express REST API with Socket.io
- **admin-dashboard/**: React web admin panel

## Common Commands

### Initial Setup
```bash
npm run install:all          # Install all dependencies for all workspaces
npm run install:mobile       # Install mobile dependencies only
npm run install:backend      # Install backend dependencies only
npm run install:admin        # Install admin dependencies only
```

### Development
```bash
npm run dev                  # Run backend + admin concurrently
npm run dev:mobile           # Start Expo development server
npm run dev:backend          # Start backend with nodemon
npm run dev:admin            # Start admin dashboard (uses react-scripts start)

# Mobile specific
cd mobile && npm start       # Start Expo development server
cd mobile && npm run ios     # Run on iOS simulator
cd mobile && npm run android # Run on Android emulator
cd mobile && npm run web     # Run in web browser
```

### Testing & Linting
```bash
npm test                     # Run all tests (backend + mobile)
npm run test:backend         # Run backend tests with Jest
npm run test:mobile          # Run mobile tests with Jest
npm run lint                 # Lint all workspaces
npm run lint:backend         # Lint backend code
npm run lint:mobile          # Lint mobile code
npm run lint:admin           # Lint admin code

# Run specific test files
cd backend && npx jest path/to/test.spec.js  # Run specific backend test
cd mobile && npx jest path/to/test.spec.js   # Run specific mobile test

# Run tests in watch mode
cd backend && npx jest --watch               # Watch mode for backend
cd mobile && npx jest --watch                # Watch mode for mobile
```

### Backend Database
```bash
cd backend
npm run migrate              # Run database migrations
npm run seed                 # Seed database with sample data
```

### Building
```bash
npm run build:admin          # Build admin dashboard for production
npm run build:mobile:ios     # Build mobile app for iOS
npm run build:mobile:android # Build mobile app for Android
```

## Architecture

### Backend (Node.js/Express + SQLite/PostgreSQL)

**Entry Point**: `backend/src/server.js`

**Key Architecture Decisions**:
- Uses Sequelize ORM with **SQLite for development** (database.sqlite) and **PostgreSQL for production**
- Socket.io attached to HTTP server for real-time features (messaging, notifications)
- All models defined in `backend/src/models/` with associations in `models/index.js`
- Rate limiting applied to all `/api/*` routes (100 requests per 15 minutes)
- Winston logger used throughout for structured logging
- In development mode, database uses `sequelize.sync({ force: false })`; production should use migrations
- Health check endpoint available at `GET /health`

**Directory Structure**:
- `config/`: Database configuration
- `controllers/`: Request handlers for each resource (auth, posts, programs, etc.)
- `middleware/`: Auth middleware, error handlers, validators
- `models/`: Sequelize models and associations
- `routes/`: Express route definitions (organized by resource)
- `services/`: Business logic (Stripe, AWS S3, Firebase, Vimeo integrations)
- `socket/`: Socket.io event handlers for real-time features
- `utils/`: Logger, validators, helpers

**Database Models** (defined in `models/index.js`):
- Core: User, Post, Comment, Like, Follow, Message
- Commerce: Program, Purchase, Subscription, Progress
- Gamification: Achievement, UserAchievement, Challenge, ChallengeParticipant
- Moderation: Report

**Model Associations**:
- User ↔ Post (one-to-many)
- User ↔ User (self-referential many-to-many through Follow for followers/following)
- User ↔ Message (one-to-many for sent/received)
- User ↔ Program (many-to-many through Purchase)
- User ↔ Achievement (many-to-many through UserAchievement)
- User ↔ Challenge (many-to-many through ChallengeParticipant)
- All associations defined in `backend/src/models/index.js:31-109`

### Mobile (React Native/Expo)

**Entry Point**: `mobile/App.js`

**Key Architecture Decisions**:
- Built with Expo (SDK ~50.0.0) for cross-platform development
- Redux Toolkit for state management with organized slices
- React Navigation v6 for navigation (stack, tab, and native-stack navigators)
- Stripe React Native SDK for payment processing
- Socket.io client for real-time updates
- Push notifications configured via Expo Notifications
- Hot pink (#ec4899) primary color theme with light pink (#fdf2f8) backgrounds
- Brand logo displayed using image assets (mobile/assets/logo.png)

**Branding Implementation**:
- Logo Component (`mobile/src/components/Logo.js`): Displays brand logo image instead of text
- Welcome Screen (`mobile/src/screens/Auth/WelcomeScreen.js`): Modern gradient design with brand messaging
  - Hot pink gradient hero section
  - "Elevate Your LifeStyle" main tagline
  - "Embrace the Power of Intentional Living" subtitle
  - Feature cards showcasing wellness programs, personal development, community, and progress tracking
  - Scrollable layout optimized for mobile web browsers
- Color constants defined in `mobile/src/config/constants.js`

**Directory Structure**:
- `src/components/`: Reusable UI components (Button, Input, PostCard, ProgramCard, etc.)
- `src/screens/`: Screen components for each view
- `src/navigation/`: Navigation configuration (RootNavigator)
- `src/store/`: Redux store and slices
- `src/services/`: API clients and external service integrations
- `src/utils/`: Helper functions and utilities
- `src/config/`: Configuration and constants

**Redux Slices** (in `store/slices/`):
- `authSlice.js`: Authentication state and actions
- `userSlice.js`: User profile and settings
- `postsSlice.js`: Social feed and post management
- `messagesSlice.js`: Direct messaging
- `programsSlice.js`: Program catalog and purchases
- `achievementsSlice.js`: Achievement tracking
- `challengesSlice.js`: Challenge participation

**Key Libraries**:
- `@react-navigation/*`: Navigation
- `@reduxjs/toolkit` + `react-redux`: State management
- `@stripe/stripe-react-native`: Payment processing
- `expo-av`: Video playback
- `expo-notifications`: Push notifications
- `socket.io-client`: Real-time communication
- `formik` + `yup`: Form handling and validation
- `axios`: HTTP requests

### Admin Dashboard (React)

**Entry Point**: `admin-dashboard/src/App.js`

**Key Technologies**:
- React 18 with React Router v6
- Tailwind CSS for styling (with dark mode support via `darkMode: 'class'`)
- Recharts for analytics visualization
- React Hot Toast for notifications

**Directory Structure**:
- `src/components/`: Reusable dashboard components (Card, StatCard, Layout)
- `src/pages/`: Page components for each admin view (Dashboard, Users, Programs, Posts, Analytics)
- `src/context/`: React Context providers (AuthContext, DarkModeContext)
- `src/services/`: API clients (authService, adminService)
- `src/utils/`: Helper functions

**Important Context Providers**:
- `AuthContext`: Manages authentication state, stored in localStorage, provides `login()`, `logout()`, `user` state
- `DarkModeContext`: Manages dark mode preference, persisted to localStorage, detects system preference on first load

**Design System**:
- Primary colors: Burgundy/maroon (`primary-600: #9d3333`)
- Accent colors: Cream/tan (`#d4a373` for analytics charts)
- Pink accents in dark mode (`pink-300` for branding and active states)
- Typography: Cinzel (headings), Arimo (body) loaded from Google Fonts
- Dark mode toggle available in sidebar with localStorage persistence

## Environment Variables

Copy `.env.example` to `.env` in the backend directory and configure:

**Required for Development**:
- `DATABASE_URL` or individual DB connection vars (DB_HOST, DB_PORT, etc.)
- `JWT_SECRET`: Secret key for JWT token signing
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLIC_KEY`: Stripe API keys

**Optional (for full feature set)**:
- Firebase config (for authentication and push notifications)
- AWS S3 credentials (for file storage)
- Vimeo API credentials (for video hosting)
- SendGrid/Mailgun (for email)
- Mixpanel (for analytics)

## API Endpoints

The backend provides RESTful endpoints organized by resource:

- `/api/auth` - Authentication (login, register, forgot-password, reset-password)
- `/api/users` - User profiles, followers, following, user search
- `/api/posts` - Social posts CRUD, feed, likes, comments
- `/api/messages` - Direct messaging, conversations, message history
- `/api/programs` - Program catalog, details, enrollment
- `/api/purchases` - Purchase history, payment processing
- `/api/subscriptions` - Subscription management
- `/api/achievements` - User achievements, badges, progress
- `/api/challenges` - Challenge participation, leaderboards
- `/api/admin` - Admin-only operations (user management, analytics, moderation)

All routes are defined in `backend/src/routes/` with corresponding controllers in `backend/src/controllers/`.

## Real-time Features

Socket.io is used for real-time updates:
- **Backend**: Socket handlers in `backend/src/socket/index.js`
- **Mobile**: Socket client connected via `socket.io-client`
- Real-time messaging, notifications, and live activity updates

## Payment Flow

1. Mobile app uses Stripe React Native SDK for payment UI
2. Backend creates payment intents via Stripe API (`backend/src/services/`)
3. Webhook handlers in backend process Stripe events
4. Purchase records created in database upon successful payment

## Development Notes

### Windows-Specific Considerations
- On Windows, use `npm` instead of Unix-specific commands
- If encountering EACCES or permission errors, run terminal as Administrator
- For Expo on Windows, ensure Windows Firewall allows Node.js connections
- Mobile development may require Android Studio for Android emulation

### Port Configuration
- Backend runs on port 3001 by default
- Admin dashboard runs on port 3000
- Mobile Expo dev server typically uses port 8081 (Metro Bundler)
- CORS is configured to allow requests from:
  - localhost:3000 (admin dashboard)
  - localhost:8081 (Expo Metro Bundler)
  - localhost:8091, localhost:8092 (alternative Expo ports)
  - localhost:19006 (Expo web)
- CORS settings defined in `backend/.env` (CORS_ORIGIN) and `backend/src/server.js`
- Rate limiting is enabled on all `/api/*` routes in backend (100 requests per 15 minutes)

### Important Workspace Notes
- **Admin dashboard is NOT in npm workspaces** (intentionally removed from root package.json)
- **Mobile app is also NOT in npm workspaces** to avoid React version conflicts
- This prevents React version conflicts between mobile (React Native) and admin (React 18)
- Always use `npm run install:admin` or `cd admin-dashboard && npm install` for admin dependencies
- Always use `npm run install:mobile` or `cd mobile && npm install` for mobile dependencies
- Admin and mobile dependencies are managed independently from the root workspace

### Database Development
- SQLite is used in development (stored in `backend/database.sqlite`)
- PostgreSQL is required for production
- Run `npm run migrate` and `npm run seed` from the backend directory for initial setup
- Database syncs automatically in development mode with `sequelize.sync({ force: false })`

### Admin Dashboard Styling
- Dark mode implemented with Tailwind's class-based dark mode
- Brand colors: Burgundy (#9d3333) for primary, light pink (#fca5a5) for accents
- In dark mode: pink-300 used for branding and active menu states
- Analytics charts use cream/tan color (#d4a373) for visual consistency

## Common Development Tasks

### Starting Fresh Development Environment
```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up database (backend directory)
cd backend
npm run migrate
npm run seed

# 3. Start services (from root)
cd ..
npm run dev          # Backend + Admin
# In another terminal:
npm run dev:mobile   # Mobile app
```

### Troubleshooting

**Port already in use:**
```bash
# Windows: Find and kill process using port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change the port in backend/.env
PORT=3002
```

**Database connection issues:**
- Ensure SQLite file exists: `backend/database.sqlite`
- For production, verify PostgreSQL is running and credentials are correct
- Run migrations: `cd backend && npm run migrate`

**Expo connection issues:**
- Clear Expo cache: `cd mobile && npx expo start -c`
- Ensure firewall allows Node.js connections
- Try using tunnel mode: `npx expo start --tunnel`

**Module resolution errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm run install:all`
- Ensure you're using Node.js v16 or higher
- Check that workspaces are correctly configured

**CORS errors on mobile app:**
- Ensure port 8081 is included in CORS_ORIGIN in `backend/.env`
- After updating .env, kill all node processes and restart servers
- Verify CORS configuration in server logs on startup

## Git and GitHub

**Repository**: https://github.com/hackn3y/intentionalmovement

### Git Configuration
- Main branch: `master`
- Remote: `origin` pointing to GitHub repository
- .gitignore configured to exclude:
  - node_modules, .env files, build outputs
  - Database files (*.db, *.sqlite, *.sqlite3)
  - Uploads and temp directories
  - OS files, IDE files, cache directories
  - Windows reserved filenames (nul)

### Common Git Commands
```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin master

# Pull latest changes
git pull origin master

# Create a new branch
git checkout -b feature/your-feature-name

# View remote
git remote -v
```

### Best Practices
- Always test changes locally before committing
- Write clear, descriptive commit messages
- Keep commits focused on a single feature or fix
- Never commit .env files or sensitive credentials
- Pull latest changes before starting new work
