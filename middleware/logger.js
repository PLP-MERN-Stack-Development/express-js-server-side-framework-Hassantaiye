// middleware/logger.js
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  // Log request details
  console.log(`📨 [${timestamp}] ${method} ${url}`);
  console.log(`   IP: ${ip} | User-Agent: ${userAgent}`);
  
  // Store start time for response time calculation
  const startTime = Date.now();
  
  // Listen for when the response is finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || 0;
    
    // Color code status codes for better readability
    let statusEmoji = '⚡';
    if (statusCode >= 200 && statusCode < 300) {
      statusEmoji = '✅';
    } else if (statusCode >= 300 && statusCode < 400) {
      statusEmoji = '🔄';
    } else if (statusCode >= 400 && statusCode < 500) {
      statusEmoji = '❌';
    } else if (statusCode >= 500) {
      statusEmoji = '💥';
    }
    
    console.log(`   ${statusEmoji} ${statusCode} | ${responseTime}ms | ${contentLength}b`);
  });
  
  next();
};

// Development logger with more detailed output
const detailedLogger = (req, res, next) => {
  const timestamp = new Date().toLocaleString();
  
  console.log('\n' + '='.repeat(60));
  console.log(`🕒 ${timestamp}`);
  console.log(`🌐 ${req.method} ${req.originalUrl}`);
  console.log(`📡 IP: ${req.ip} | Host: ${req.get('host')}`);
  console.log(`🔍 User-Agent: ${req.get('User-Agent')}`);
  
  // Log request body (except for sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('❓ Query Params:', req.query);
  }
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('='.repeat(60) + '\n');
  });
  
  next();
};

module.exports = {
  logger,
  detailedLogger
};