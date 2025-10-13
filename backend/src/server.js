require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const { sequelize } = require('./models');
const routes = require('./routes');
const { initializeSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8091', 'http://localhost:8092', 'http://localhost:19006'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware

app.use(compression());

// CORS configuration - must come before helmet to ensure headers are set correctly
// Ports 8081, 8091, 8092 are used for Expo web/Metro bundler on this machine
// Updated to include port 8081 for Expo Metro bundler
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:8091', 'http://localhost:8092', 'http://localhost:19006'];
logger.info(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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

    // Sync database (in production, use migrations)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false });
      logger.info('Database synchronized.');
    }

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
