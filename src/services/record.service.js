/**
 * src/services/record.service.js — Financial record business logic.
 *
 * Ownership scope:
 *   - viewer  : can only read records they created.
 *   - analyst : can read ALL records (read-only — no create/update/delete).
 *   - admin   : full read/write access across all records.
 *
 * Soft delete:
 *   - All queries include { deletedAt: null } to exclude soft-deleted records.
 */

const { Record } = require('../models/record.model');
const ApiError = require('../utils/ApiError');

/**
 * Builds a base query filter that respects soft-delete and ownership rules.
 * @param {object} requestingUser - The authenticated user from req.user
 * @returns {object} Mongoose filter object
 */
const buildBaseFilter = (requestingUser) => {
  const filter = { deletedAt: null };

  // Viewers are scoped to their own records only.
  // Analysts can see all records — their role is data analysis across all entries.
  // Admins have unrestricted access.
  if (requestingUser.role === 'viewer') {
    filter.createdBy = requestingUser._id;
  }

  return filter;
};

/**
 * Creates a new financial record. Admin only.
 * @param {object} data       - Record fields from request body
 * @param {object} adminUser  - The authenticated admin user
 * @returns {object}
 */
const createRecord = async (data, adminUser) => {
  const record = await Record.create({
    ...data,
    createdBy: adminUser._id,
  });

  return record.populate('createdBy', 'name email role');
};

/**
 * Returns a paginated, filtered list of records.
 * Applies ownership isolation for non-admin users.
 *
 * @param {object} requestingUser
 * @param {object} queryParams - { type, category, startDate, endDate, page, limit }
 * @returns {{ records: object[], pagination: object }}
 */
const getRecords = async (requestingUser, queryParams) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = buildBaseFilter(requestingUser);

  // Optional filters
  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: 'i' };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const [records, totalRecords] = await Promise.all([
    Record.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Record.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRecords / Number(limit));

  return {
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages,
    },
  };
};

/**
 * Returns a single record by ID.
 * Applies ownership isolation for non-admin users.
 * @param {string} recordId
 * @param {object} requestingUser
 * @returns {object}
 */
const getRecordById = async (recordId, requestingUser) => {
  const filter = buildBaseFilter(requestingUser);
  filter._id = recordId;

  const record = await Record.findOne(filter).populate('createdBy', 'name email');

  if (!record) {
    throw new ApiError(404, 'Record not found.');
  }

  return record;
};

/**
 * Updates an existing record. Admin only.
 * @param {string} recordId
 * @param {object} updates
 * @returns {object}
 */
const updateRecord = async (recordId, updates) => {
  const allowedFields = ['amount', 'type', 'category', 'date', 'note'];

  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  if (Object.keys(filteredUpdates).length === 0) {
    throw new ApiError(400, 'No valid fields provided for update.');
  }

  const record = await Record.findOneAndUpdate(
    { _id: recordId, deletedAt: null },
    filteredUpdates,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  if (!record) {
    throw new ApiError(404, 'Record not found.');
  }

  return record;
};

/**
 * Soft-deletes a record. Admin only.
 * @param {string} recordId
 */
const deleteRecord = async (recordId) => {
  const record = await Record.findOneAndUpdate(
    { _id: recordId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!record) {
    throw new ApiError(404, 'Record not found.');
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
