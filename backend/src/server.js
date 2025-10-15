require('dotenv').config();

// Wrap everything in try-catch to see errors
try {
  console.log('Starting server...');

  // Validate environment variables before starting the server
  // Temporarily disabled to see actual startup errors
  // const validateEnv = require('./utils/validateEnv');
  // validateEnv();

  const express = require('express');
  const http = require('http');
  const socketIo = require('socket.io');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const compression = require('compression');
  const rateLimit = require('express-rate-limit');
  const path = require('path');

  console.log('Basic dependencies loaded');

  const logger = require('./utils/logger');
  console.log('Logger loaded');

  const { sequelize } = require('./models');
  console.log('Models loaded');

  const routes = require('./routes');
  console.log('Routes loaded');

  const { initializeSocket } = require('./socket');
  console.log('Socket loaded');

  const errorHandler = require('./middleware/errorHandler');
  const requestLogger = require('./middleware/requestLogger');
  const requestIdMiddleware = require('./middleware/requestId');
  console.log('Middleware loaded');

  console.log('Creating Express app...');
  const app = express();
  console.log('Creating HTTP server...');
  const server = http.createServer(app);

  // Middleware

  console.log('Configuring middleware...');
  // Trust proxy - required for Railway/Heroku/any reverse proxy
  console.log('Setting trust proxy...');
  app.set('trust proxy', 1);

console.log('Adding compression...');
app.use(compression());

// CORS configuration - must come before helmet to ensure headers are set correctly
// Supports wildcards for Vercel deployments
console.log('Configuring CORS...');
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8091', 'http://localhost:8092', 'http://localhost:19006'];
console.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);
logger.info(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);

// CORS origin checker with wildcard support
console.log('Creating CORS origin checker...');
const corsOriginChecker = (origin, callback) => {
  console.log('CORS check for origin:', origin);

  // Allow requests with no origin (like mobile apps or Postman)
  if (!origin) {
    console.log('No origin provided, allowing request');
    return callback(null, true);
  }

  // Check if origin matches any allowed origins (including wildcards)
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin.includes('*')) {
      // Convert wildcard to regex: https://*.vercel.app -> https://.*\.vercel\.app
      const pattern = allowedOrigin
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      const matches = regex.test(origin);
      console.log(`Testing ${origin} against wildcard ${allowedOrigin}: ${matches}`);
      return matches;
    }
    const matches = allowedOrigin === origin;
    console.log(`Testing ${origin} against ${allowedOrigin}: ${matches}`);
    return matches;
  });

  if (isAllowed) {
    console.log(`CORS allowed for origin: ${origin}`);
    callback(null, true);
  } else {
    console.error(`CORS BLOCKED origin: ${origin}`);
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
};

  console.log('Creating Socket.IO...');
  const io = socketIo(server, {
    cors: {
      origin: corsOriginChecker,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  console.log('Socket.IO created');

console.log('Creating CORS options...');
const corsOptions = {
  origin: corsOriginChecker,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

console.log('Applying CORS middleware...');
app.use(cors(corsOptions));

// Enhanced security headers with Helmet
console.log('Applying Helmet security headers...');
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:', 'http:'],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));
console.log('Applying Morgan logger...');
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Stripe webhook - must be before express.json() to receive raw body
console.log('Setting up Stripe webhook...');
try {
  const purchaseController = require('./controllers/purchaseController');
  console.log('Purchase controller loaded');
  app.post('/api/purchases/webhook', express.raw({ type: 'application/json' }), purchaseController.handleWebhook);
  console.log('Webhook route configured');
} catch (error) {
  console.error('Error loading purchase controller:', error);
  throw error;
}

console.log('Setting up body parsers...');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('Body parsers configured');

// Request ID tracking middleware (must come before requestLogger)
console.log('Applying request ID middleware...');
app.use(requestIdMiddleware);

// Request logging middleware
console.log('Applying request logger...');
app.use(requestLogger);

// Rate limiting - more permissive in development
console.log('Configuring rate limiter...');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // 1000 for dev, 100 for production
});
app.use('/api/', limiter);
console.log('Rate limiter applied');

// Serve static uploaded files
console.log('Setting up static file serving...');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.IO initialization
console.log('Initializing Socket.IO...');
initializeSocket(io);
app.set('io', io);
console.log('Socket.IO initialized');

// Health check
console.log('Setting up health check route...');
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
console.log('Loading API routes...');
app.use('/api', routes);
console.log('API routes loaded');

// Error handling
console.log('Applying error handler...');
app.use(errorHandler);
console.log('Error handler applied');

// Database connection and server start
const PORT = process.env.PORT || 3001;

console.log('Preparing to start server...');
const startServer = async () => {
  try {
    console.log('Testing database connection...');
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected!');
    logger.info('Database connection established successfully.');

    // In production, skip sync if it fails (database already exists)
    // Use migrations instead of sync for production databases
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Skipping database sync (use migrations instead)');
      logger.info('Production mode: Database sync skipped, assuming migrations are handled separately');
    } else {
      console.log('Syncing database...');
      try {
        await sequelize.sync({ force: false });
        console.log('Database synced!');
        logger.info('Database synchronized.');
      } catch (syncError) {
        console.warn('Database sync failed (this is normal if database already exists):', syncError.message);
        logger.warn('Database sync failed, continuing with existing schema:', syncError.message);
      }
    }

    console.log(`Starting server on port ${PORT}...`);
    server.listen(PORT, () => {
      console.log(`✓ Server successfully started on port ${PORT}`);
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('FATAL: Unable to start server:', error);
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

console.log('Calling startServer()...');
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    sequelize.close();
    process.exit(0);
  });
});

module.exports = { app, server, io };

} catch (error) {
  console.error('FATAL ERROR during server initialization:');
  console.error(error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
 
