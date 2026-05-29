'use strict';

const prisma = require('./prisma');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
