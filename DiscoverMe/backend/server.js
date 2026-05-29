'use strict';

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const connectMongoDB = require('./src/config/mongoose');
const prisma = require('./src/config/prisma');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await connectMongoDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', async (err) => {
    logger.error('Unhandled rejection:', err.message);
    await prisma.$disconnect();
    server.close(() => process.exit(1));
  });
})();
