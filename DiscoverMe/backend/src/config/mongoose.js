'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/discover_me';

  try {
    await mongoose.connect(uri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

module.exports = connectMongoDB;
