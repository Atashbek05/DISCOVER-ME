'use strict';

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const { withProtect, passwordChangedAfter } = require('../services/user.service');

const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('No token provided — please log in', 401);
  }
  const token = authHeader.split(' ')[1];

  const decoded = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where:  { id: decoded.id },
    select: withProtect,
  });

  if (!user)           throw new AppError('User no longer exists', 401);
  if (!user.isActive)  throw new AppError('Account has been deactivated', 401);

  if (passwordChangedAfter(user, decoded.iat)) {
    throw new AppError('Password recently changed — please log in again', 401);
  }

  req.user = user;
  next();
});

const restrict = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };

module.exports = { protect, restrict };
