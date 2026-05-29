'use strict';

const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

const ACCESS_SECRET  = () => process.env.JWT_ACCESS_SECRET  || (() => { throw new Error('JWT_ACCESS_SECRET not set'); })();
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || (() => { throw new Error('JWT_REFRESH_SECRET not set'); })();

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '1h';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET());
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Access token expired', 401);
    throw new AppError('Invalid access token', 401);
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET());
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Refresh token expired — please log in again', 401);
    throw new AppError('Invalid refresh token', 401);
  }
}

/**
 * Set the refresh token as an httpOnly cookie (web clients).
 * Mobile clients read it from the response body instead.
 */
function setRefreshCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};
