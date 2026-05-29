'use strict';

const AppError = require('../utils/AppError');
const { sendError } = require('../utils/response');
const logger = require('../utils/logger');

// ─── 404 handler ──────────────────────────────────────────────────────────────
const notFound = (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};

// ─── Prisma / JWT error translators ───────────────────────────────────────────
function translateError(err) {
  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} already in use`, 409);
  }
  // Prisma record not found
  if (err.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  // Prisma foreign key constraint
  if (err.code === 'P2003') {
    return new AppError('Related record not found', 400);
  }
  // Prisma value too long
  if (err.code === 'P2000') {
    return new AppError('Input value exceeds maximum length', 400);
  }
  return err;
}

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  const translated = translateError(err);

  const statusCode = translated.statusCode || 500;
  const message    = translated.isOperational
    ? translated.message
    : 'Something went wrong';

  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.originalUrl}]`, err);
  } else {
    logger.warn(`[${req.method} ${req.originalUrl}] ${statusCode}: ${translated.message}`);
  }

  sendError(res, {
    statusCode,
    message,
    ...(process.env.NODE_ENV !== 'production' && !translated.isOperational
      ? { stack: err.stack }
      : {}),
    ...(translated.errors ? { errors: translated.errors } : {}),
  });
};

module.exports = { notFound, globalErrorHandler };
