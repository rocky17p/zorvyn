/**
 * src/services/user.service.js — User management logic (Admin only).
 *
 * Provides:
 *   - Paginated list of all users
 *   - Fetch user by ID
 *   - Update user fields (role, isActive, name)
 *   - Soft-delete a user
 */

const { User } = require('../models/user.model');
const ApiError = require('../utils/ApiError');

/**
 * Returns a paginated list of active (non-deleted) users.
 * @param {number} page
 * @param {number} limit
 * @returns {{ users: object[], pagination: object }}
 */
const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [users, totalRecords] = await Promise.all([
    User.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ deletedAt: null }),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    users: users.map((u) => u.toPublicJSON()),
    pagination: { page, limit, totalRecords, totalPages },
  };
};

/**
 * Returns a single user by ID (must not be soft-deleted).
 * @param {string} userId
 * @returns {object}
 */
const getUserById = async (userId) => {
  const user = await User.findOne({ _id: userId, deletedAt: null });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user.toPublicJSON();
};

/**
 * Updates allowed fields on a user document.
 * Allowed updates: name, role, isActive.
 * @param {string} userId
 * @param {object} updates
 * @returns {object}
 */
const updateUser = async (userId, updates) => {
  const allowedFields = ['name', 'role', 'isActive'];

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update.');
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user.toPublicJSON();
};

/**
 * Soft-deletes a user by setting deletedAt to now.
 * Admins cannot delete themselves.
 * @param {string} targetUserId
 * @param {string} requestingUserId
 */
const deleteUser = async (targetUserId, requestingUserId) => {
  if (targetUserId.toString() === requestingUserId.toString()) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }

  const user = await User.findOneAndUpdate(
    { _id: targetUserId, deletedAt: null },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
