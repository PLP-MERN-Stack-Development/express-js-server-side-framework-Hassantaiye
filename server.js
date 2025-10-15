// server.js
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Defensive middleware loading to avoid "app.use() requires a middleware function"
let logger = (req, res, next) => next();
let detailedLogger;
let handleJsonErrors = (err, req, res, next) => next(err);
let ValidationError = class ValidationError extends Error {};

try {
  const loggerMod = require('./middleware/logger');
  // module may export function directly or an object with named exports
  logger = typeof loggerMod === 'function' ? loggerMod : (loggerMod.logger || loggerMod.default || logger);
  detailedLogger = loggerMod.detailedLogger || loggerMod.defaultDetailedLogger;
} catch (e) {
  console.warn('⚠️  middleware/logger not found or invalid. Using noop logger.');
}

try {
  // try to locate bodyparser file without hardcoding case variants (avoids duplicate import diagnostics on case-insensitive file systems)
  const fs = require('fs');
  const path = require('path');
  let bp = null;
  try {
    const middlewareDir = path.join(__dirname, 'middleware');
    const files = fs.existsSync(middlewareDir) ? fs.readdirSync(middlewareDir) : [];
    // find a file named bodyparser with any casing (with or without .js)
    const candidate = files.find(f => f.toLowerCase() === 'bodyparser' || f.toLowerCase() === 'bodyparser.js');
    if (candidate) {
      bp = require(path.join(middlewareDir, candidate));
    } else {
      // as a last resort, attempt canonical name once (no second literal variant to avoid case conflicts)
      try {
        bp = require(path.join(middlewareDir, 'bodyParser'));
      } catch (e) {
        bp = null;
      }
    }

    handleJsonErrors = bp && (bp.handleJsonErrors || bp.handleJSONErrors || bp.default || bp);
    if (typeof handleJsonErrors !== 'function') {
      // if bp itself is a middleware function (not error handler), ignore and keep noop error handler
      if (typeof bp === 'function') handleJsonErrors = bp;
      else handleJsonErrors = (err, req, res, next) => next(err);
    }
  } catch (e) {
    // propagate to outer catch which logs a friendly warning
    throw e;
  }
} catch (e) {
  console.warn('⚠️  middleware/bodyParser(bodyparser) not found or invalid. Using noop JSON error handler.');
}

try {
  const valMod = require('./middleware/validation');
  ValidationError = valMod.ValidationError || valMod.default || ValidationError;
} catch (e) {
  console.warn('⚠️  middleware/validation not found. Using fallback ValidationError class.');
}

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security + CORS
app.use(helmet());
app.use(cors());

// Middleware - Order matters!
// Only use logger if it's a function
if (typeof logger === 'function') {
  app.use(logger); // Log all requests
} else {
  console.warn('⚠️  logger is not a function; skipping request logging middleware.');
}

if (NODE_ENV === 'development' && typeof detailedLogger === 'function') {
  app.use(detailedLogger);
}
app.use(express.json({ limit: '10mb' })); // JSON parsing

// Use JSON error handler only if it's an error-handling middleware (4 args) or function
if (typeof handleJsonErrors === 'function') {
  // quick check: error handler functions typically have 4 parameters
  if (handleJsonErrors.length >= 4) {
    app.use(handleJsonErrors);
  } else {
    // if it's not an error handler, skip and warn
    console.warn('⚠️  handleJsonErrors is not an error-handling middleware (expected 4 args). Skipping.');
  }
} else {
  console.warn('⚠️  handleJsonErrors is not a function; skipping JSON error handler.');
}

// Import routes
const productsRouter = require('./routes/products');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World! 🌍',
    service: 'Express Products API with Middleware',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      root: '/',
      health: '/health',
      products: '/api/products'
    },
    features: [
      'Custom logging middleware',
      'JSON body parsing',
      'API key authentication',
      'Request validation',
      'Error handling'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API key information endpoint (for testing)
app.get('/api/keys-info', (req, res) => {
  res.json({
    message: 'For testing, use one of these API keys in x-api-key header:',
    testKeys: [
      'prod_key_abc123def456',
      'prod_key_ghi789jkl012',
      'dev_key_mno345pqr678',
      'test_key_stu901vwx234'
    ],
    header: 'x-api-key: YOUR_API_KEY'
  });
});

// Products routes
app.use('/api/products', productsRouter);

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error);

  // Handle validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors,
      timestamp: new Date().toISOString()
    });
  }

  // Handle authentication errors
  if (error.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /health',
      keysInfo: 'GET /api/keys-info',
      getAllProducts: 'GET /api/products',
      getProduct: 'GET /api/products/:id',
      createProduct: 'POST /api/products',
      updateProduct: 'PUT /api/products/:id',
      deleteProduct: 'DELETE /api/products/:id'
    }
  });
});

// Optional MongoDB connection (uses MONGO_URI in .env)
const connectToMongo = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️  No MONGO_URI provided; skipping MongoDB connection.');
    return;
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // If DB is required, exit process; otherwise continue running in-memory mode
    if (process.env.DB_REQUIRED === 'true') process.exit(1);
  }
};

// Start server after optional DB connect
const startServer = async () => {
  await connectToMongo();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (env: ${NODE_ENV})`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
    });
    try {
      await mongoose.connection.close(false);
      console.log('MongoDB connection closed.');
    } catch (e) {
      console.warn('No MongoDB connection to close or error closing.', e);
    }
    setTimeout(() => {
      console.log('Forcing shutdown.');
      process.exit(0);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Expose server for tests
  app.server = server;
  return server;
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Export app for testing/imports (server available at app.server)
module.exports = app;