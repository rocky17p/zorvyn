/**
 * src/controllers/auth.controller.js — Handles authentication HTTP layer.
 *
 * Delegates all business logic to auth.service.
 * Controllers are intentionally thin — they only deal with HTTP concerns.
 */

const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/register
 * Registers a new user.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const { user, token } = await authService.registerUser({ name, email, password, role });

  return res
    .status(201)
    .json(new ApiResponse(201, { user, token }, 'Account created successfully.'));
});

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.loginUser(email, password);

  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, 'Login successful.'));
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMyProfile(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Profile fetched successfully.'));
});

module.exports = { register, login, getMe };
