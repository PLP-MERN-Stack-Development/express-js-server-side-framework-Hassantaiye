// middleware/auth.js
const { v4: uuidv4 } = require('uuid');

// In-memory storage for API keys (in production, use a database)
const validApiKeys = new Map();

// Generate some initial API keys for testing
const generateInitialApiKeys = () => {
  const keys = [
    'prod_key_abc123def456',
    'prod_key_ghi789jkl012',
    'dev_key_mno345pqr678',
    'test_key_stu901vwx234'
  ];
  
  keys.forEach(key => {
    validApiKeys.set(key, {
      key: key,
      type: key.startsWith('prod') ? 'production' : 
            key.startsWith('dev') ? 'development' : 'testing',
      createdAt: new Date().toISOString(),
      lastUsed: null
    });
  });
};

// Initialize API keys
generateInitialApiKeys();

const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  // Check if API key is provided
  if (!apiKey) {
    console.warn('🔐 Authentication failed: No API key provided');
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'Missing API key. Please provide x-api-key in headers or Authorization header'
    });
  }
  
  // Extract key from Bearer token if provided
  const actualKey = apiKey.startsWith('Bearer ') ? apiKey.slice(7) : apiKey;
  
  // Validate API key
  const keyInfo = validApiKeys.get(actualKey);
  
  if (!keyInfo) {
    console.warn(`🔐 Authentication failed: Invalid API key provided: ${actualKey.substring(0, 8)}...`);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'Invalid API key'
    });
  }
  
  // Update last used timestamp
  keyInfo.lastUsed = new Date().toISOString();
  validApiKeys.set(actualKey, keyInfo);
  
  // Add API key info to request object for use in routes
  req.apiKeyInfo = {
    key: actualKey,
    type: keyInfo.type
  };
  
  console.log(`🔐 Authenticated request with ${keyInfo.type} API key`);
  next();
};

// Optional: Middleware to require specific key types (e.g., only production keys)
const requireProductionKey = (req, res, next) => {
  if (req.apiKeyInfo.type !== 'production') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      error: 'Production API key required for this operation'
    });
  }
  next();
};

// Generate new API key (for admin purposes)
const generateApiKey = (type = 'development') => {
  const newKey = `key_${uuidv4().replace(/-/g, '')}`;
  validApiKeys.set(newKey, {
    key: newKey,
    type: type,
    createdAt: new Date().toISOString(),
    lastUsed: null
  });
  return newKey;
};

// Get all API keys (admin function)
const getApiKeys = () => {
  return Array.from(validApiKeys.values());
};

module.exports = {
  authenticate,
  requireProductionKey,
  generateApiKey,
  getApiKeys
};