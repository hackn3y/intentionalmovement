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
  console.log('Creating Socket.IO...');
  const io = socketIo(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8091', 'http://localhost:8092', 'http://localhost:19006'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  console.log('Socket.IO created');

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
  // Allow requests with no origin (like mobile apps or Postman)
  if (!origin) return callback(null, true);

  // Check if origin matches any allowed origins (including wildcards)
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin.includes('*')) {
      // Convert wildcard to regex: https://*.vercel.app -> https://.*\.vercel\.app
      const pattern = allowedOrigin
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    return allowedOrigin === origin;
  });

  if (isAllowed) {
    callback(null, true);
  } else {
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
};

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
app.post('/api/purchases/webhook', express.raw({ type: 'application/json' }), require('./controllers/purchaseController').handleWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID tracking middleware (must come before requestLogger)
app.use(requestIdMiddleware);

// Request logging middleware
app.use(requestLogger);

// Rate limiting - more permissive in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // 1000 for dev, 100 for production
});
app.use('/api/', limiter);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Socket.IO initialization
initializeSocket(io);
app.set('io', io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync database
    await sequelize.sync({ force: false });
    logger.info('Database synchronized.');

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

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
 
