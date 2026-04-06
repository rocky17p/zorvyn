/**
 * src/controllers/user.controller.js — User management HTTP layer. (Admin only)
 *
 * Delegates all business logic to user.service.
 */

const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/users
 * Returns a paginated list of all users.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await userService.getAllUsers({
    page: Number(page),
    limit: Number(limit),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Users fetched successfully.'));
});

/**
 * GET /api/users/:id
 * Returns a single user by ID.
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'User fetched successfully.'));
});

/**
 * PATCH /api/users/:id
 * Updates user fields (name, role, isActive).
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'User updated successfully.'));
});

/**
 * DELETE /api/users/:id
 * Soft-deletes a user.
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'User deleted successfully.'));
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
