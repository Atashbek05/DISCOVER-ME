'use strict';

const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after express-validator check() chains.
 * If there are errors, returns 422 with structured error array.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Reusable field validators ────────────────────────────────────────────────

const emailField = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Must be a valid email address')
  .normalizeEmail();

const passwordField = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number');

const usernameField = body('username')
  .trim()
  .notEmpty().withMessage('Username is required')
  .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
  .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers and underscores');

// ─── Validation rule sets ─────────────────────────────────────────────────────

const registerRules = [usernameField, emailField, passwordField()];

const loginRules = [
  emailField,
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshRules = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const updateProfileRules = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username may only contain letters, numbers and underscores'),
  body('avatar')
    .optional()
    .trim()
    .isURL().withMessage('Avatar must be a valid URL'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordField('newPassword'),
  body('confirmPassword')
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),
];

module.exports = {
  handleValidationErrors,
  registerRules,
  loginRules,
  refreshRules,
  updateProfileRules,
  changePasswordRules,
};
