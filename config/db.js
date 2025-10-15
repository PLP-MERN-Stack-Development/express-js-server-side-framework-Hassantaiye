const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn('No MongoDB URI provided. Skipping connection.');
    return;
  }

  try {
    // modern mongoose (v6+) no longer needs useNewUrlParser/useUnifiedTopology
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
