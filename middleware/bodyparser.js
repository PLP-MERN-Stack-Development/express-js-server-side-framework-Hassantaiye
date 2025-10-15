// middleware/bodyParser.js
const express = require('express');

// Enhanced JSON parser with error handling
const jsonParser = express.json({
  limit: '10mb', // Limit payload size
  strict: true,  // Only accept arrays and objects
  type: 'application/json'
});

// Custom error handling for JSON parsing
const handleJsonErrors = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: 'Malformed JSON in request body'
    });
  }
  next();
};

module.exports = {
  jsonParser,
  handleJsonErrors
};