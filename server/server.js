const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourfacebookclone.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
const db = require('./models');

// Test database connection
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
  });

// Sync database models
if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync()
    .then(() => {
      console.log('✅ Database models synchronized');
    })
    .catch(err => {
      console.error('❌ Database sync error:', err);
    });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/friendships', require('./routes/friendships'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/saved-posts', require('./routes/saved-posts'));
app.use('/api/privacy', require('./routes/privacy'));
app.use('/api/blocked-users', require('./routes/blocked-users'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/events', require('./routes/events'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/post-shares', require('./routes/post-shares'));




// Test route
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 Facebook Clone API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const http = require('http');
const { initSocket } = require('./utils/socket');
const server = http.createServer(app);
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  db.sequelize.close()
    .then(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error closing database:', err);
      process.exit(1);
    });
});

module.exports = app; 