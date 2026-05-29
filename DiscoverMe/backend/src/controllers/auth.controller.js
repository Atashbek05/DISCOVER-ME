'use strict';

const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/jwt');
const {
  PUBLIC_SELECT,
  withPassword,
  withRefresh,
  toPublicJSON,
  hashPassword,
  comparePassword,
} = require('../services/user.service');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createTokenPair(userId) {
  const payload = { id: userId };
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function issueTokens(res, userId) {
  const tokens = createTokenPair(userId);
  await prisma.user.update({
    where: { id: userId },
    data:  { refreshToken: tokens.refreshToken },
  });
  setRefreshCookie(res, tokens.refreshToken);
  return tokens;
}

// ─── POST /auth/register ──────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Email is already registered', 409);

  const hashed = await hashPassword(password);
  const user   = await prisma.user.create({
    data:   { username, email, password: hashed },
    select: PUBLIC_SELECT,
  });

  const { accessToken, refreshToken } = await issueTokens(res, user.id);

  sendSuccess(res, {
    statusCode: 201,
    message:    'Account created successfully',
    data:       { user: toPublicJSON(user), accessToken, refreshToken },
  });
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where:  { email },
    select: { ...withPassword, isActive: true },
  });

  if (!user || !user.isActive) throw new AppError('Invalid email or password', 401);

  const match = await comparePassword(password, user.password);
  if (!match) throw new AppError('Invalid email or password', 401);

  const { accessToken, refreshToken } = await issueTokens(res, user.id);

  sendSuccess(res, {
    message: 'Logged in successfully',
    data:    { user: toPublicJSON(user), accessToken, refreshToken },
  });
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data:  { refreshToken: null },
  });
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Logged out successfully' });
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new AppError('Refresh token is required', 401);

  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where:  { id: decoded.id },
    select: withRefresh,
  });

  if (!user || !user.isActive)        throw new AppError('User not found', 401);
  if (user.refreshToken !== token)    throw new AppError('Refresh token reuse detected — please log in again', 401);

  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(res, user.id);

  sendSuccess(res, {
    message: 'Token refreshed',
    data:    { accessToken, refreshToken: newRefreshToken },
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'User retrieved',
    data:    { user: toPublicJSON(req.user) },
  });
});

// ─── PUT /auth/profile ────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { username, avatar } = req.body;
  const data = {};
  if (username !== undefined) data.username = username;
  if (avatar   !== undefined) data.avatar   = avatar;

  if (Object.keys(data).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }

  const updated = await prisma.user.update({
    where:  { id: req.user.id },
    data,
    select: PUBLIC_SELECT,
  });

  sendSuccess(res, {
    message: 'Profile updated',
    data:    { user: toPublicJSON(updated) },
  });
});

// ─── PUT /auth/password ───────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where:  { id: req.user.id },
    select: { id: true, password: true },
  });

  const match = await comparePassword(currentPassword, user.password);
  if (!match) throw new AppError('Current password is incorrect', 401);

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data:  {
      password:          hashed,
      passwordChangedAt: new Date(Date.now() - 1000),
    },
  });

  const { accessToken, refreshToken: newRefresh } = await issueTokens(res, user.id);

  sendSuccess(res, {
    message: 'Password changed successfully',
    data:    { accessToken, refreshToken: newRefresh },
  });
});

// ─── GET /auth/favorites ─────────────────────────────────────────────────────
const getFavorites = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: 'Favorites retrieved',
    data:    { favorites: req.user.favorites },
  });
});

// ─── POST /auth/favorites/:placeId ───────────────────────────────────────────
const addFavorite = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  if (req.user.favorites.includes(placeId)) {
    return sendSuccess(res, {
      message: 'Already in favorites',
      data:    { favorites: req.user.favorites },
    });
  }

  const updated = await prisma.user.update({
    where:  { id: req.user.id },
    data:   { favorites: { push: placeId } },
    select: { favorites: true },
  });

  sendSuccess(res, {
    message: 'Added to favorites',
    data:    { favorites: updated.favorites },
  });
});

// ─── DELETE /auth/favorites/:placeId ─────────────────────────────────────────
const removeFavorite = asyncHandler(async (req, res) => {
  const { placeId } = req.params;
  const newFavorites = req.user.favorites.filter((id) => id !== placeId);

  await prisma.user.update({
    where: { id: req.user.id },
    data:  { favorites: newFavorites },
  });

  sendSuccess(res, {
    message: 'Removed from favorites',
    data:    { favorites: newFavorites },
  });
});

// ─── DELETE /auth/account ─────────────────────────────────────────────────────
const deleteAccount = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data:  { isActive: false, refreshToken: null },
  });
  clearRefreshCookie(res);
  sendSuccess(res, { message: 'Account deactivated successfully' });
});

module.exports = {
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
};
