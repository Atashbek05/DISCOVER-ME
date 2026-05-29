'use strict';

const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    skip: () => process.env.NODE_ENV === 'test',
  });

/** Strict limiter for login/register — prevents brute-force */
const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many auth attempts — try again in 15 minutes',
});

/** Moderate limiter for all other auth routes */
const generalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many requests — try again in 15 minutes',
});

module.exports = { authLimiter, generalLimiter };
