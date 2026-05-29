'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// Fields safe to expose to the client
const PUBLIC_SELECT = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  favorites: true,
  createdAt: true,
};

// Extend PUBLIC_SELECT with sensitive fields for specific operations
const withPassword    = { ...PUBLIC_SELECT, password: true };
const withRefresh     = { ...PUBLIC_SELECT, refreshToken: true, isActive: true };
const withProtect     = { ...PUBLIC_SELECT, passwordChangedAt: true, isActive: true };

function toPublicJSON(user) {
  return {
    id:            user.id,
    username:      user.username,
    email:         user.email,
    avatar:        user.avatar ?? null,
    role:          user.role,
    favorites:     user.favorites,
    favoriteCount: user.favorites.length,
    createdAt:     user.createdAt,
  };
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

function passwordChangedAfter(user, jwtIat) {
  if (!user.passwordChangedAt) return false;
  return Math.floor(user.passwordChangedAt.getTime() / 1000) > jwtIat;
}

module.exports = {
  PUBLIC_SELECT,
  withPassword,
  withRefresh,
  withProtect,
  toPublicJSON,
  hashPassword,
  comparePassword,
  passwordChangedAfter,
};
