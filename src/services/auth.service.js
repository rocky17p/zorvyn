/**
 * src/services/auth.service.js — Authentication business logic.
 *
 * Responsibilities:
 *   - Register new users (with duplicate email check)
 *   - Authenticate users and return a signed JWT
 *   - Retrieve the current authenticated user's profile
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

/**
 * Generates a signed JWT for the given user ID.
 * @param {string} userId
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Registers a new user. Throws if the email already exists.
 * @param {object} userData - { name, email, password, role }
 * @returns {{ user: object, token: string }}
 */
const registerUser = async ({ name, email, password, role }) => {
  // Check for existing active user with the same email
  const existingUser = await User.findOne({ email, deletedAt: null });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user: user.toPublicJSON(), token };
};

/**
 * Authenticates a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, token: string }}
 */
const loginUser = async (email, password) => {
  // Explicitly select password since it is excluded by default (select: false)
  const user = await User.findOne({ email, isActive: true, deletedAt: null }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user._id);

  return { user: user.toPublicJSON(), token };
};

/**
 * Returns the public profile of the currently authenticated user.
 * @param {string} userId
 * @returns {object}
 */
const getMyProfile = async (userId) => {
  const user = await User.findOne({ _id: userId, deletedAt: null });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user.toPublicJSON();
};

module.exports = { registerUser, loginUser, getMyProfile };
