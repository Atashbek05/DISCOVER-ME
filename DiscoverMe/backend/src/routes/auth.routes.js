'use strict';

const { Router } = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  getFavorites,
  addFavorite,
  removeFavorite,
  deleteAccount,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter, generalLimiter } = require('../middleware/rateLimiter.middleware');
const {
  handleValidationErrors,
  registerRules,
  loginRules,
  refreshRules,
  updateProfileRules,
  changePasswordRules,
} = require('../middleware/validate.middleware');

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

/** @route  POST /api/v1/auth/register */
router.post(
  '/register',
  authLimiter,
  registerRules,
  handleValidationErrors,
  register
);

/** @route  POST /api/v1/auth/login */
router.post(
  '/login',
  authLimiter,
  loginRules,
  handleValidationErrors,
  login
);

/** @route  POST /api/v1/auth/refresh */
router.post(
  '/refresh',
  generalLimiter,
  refreshRules,
  handleValidationErrors,
  refreshToken
);

// ─── Protected (require valid access token) ───────────────────────────────────

/** @route  POST /api/v1/auth/logout */
router.post('/logout', protect, logout);

/** @route  GET /api/v1/auth/me */
router.get('/me', protect, getMe);

/** @route  PUT /api/v1/auth/profile */
router.put(
  '/profile',
  protect,
  updateProfileRules,
  handleValidationErrors,
  updateProfile
);

/** @route  PUT /api/v1/auth/password */
router.put(
  '/password',
  protect,
  authLimiter,
  changePasswordRules,
  handleValidationErrors,
  changePassword
);

/** @route  GET /api/v1/auth/favorites */
router.get('/favorites', protect, getFavorites);

/** @route  POST /api/v1/auth/favorites/:placeId */
router.post('/favorites/:placeId', protect, addFavorite);

/** @route  DELETE /api/v1/auth/favorites/:placeId */
router.delete('/favorites/:placeId', protect, removeFavorite);

/** @route  DELETE /api/v1/auth/account */
router.delete('/account', protect, deleteAccount);

module.exports = router;
