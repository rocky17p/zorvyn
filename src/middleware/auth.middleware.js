/**
 * src/middleware/auth.middleware.js — JWT verification middleware.
 *
 * Reads the token from the Authorization header (Bearer scheme),
 * verifies it, loads the user from the database, and attaches
 * the user document to req.user for downstream handlers.
 *
 * Also enforces that the user account is active and not soft-deleted.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. Please provide a valid Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid token. Please log in again.');
  }

  // Load the user and verify they are still active and not deleted
  const user = await User.findOne({
    _id: decoded.userId,
    isActive: true,
    deletedAt: null,
  });

  if (!user) {
    throw new ApiError(401, 'User account not found or has been deactivated.');
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
