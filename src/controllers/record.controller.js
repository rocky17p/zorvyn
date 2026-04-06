/**
 * src/controllers/record.controller.js — Financial records HTTP layer.
 *
 * Access Control (enforced in routes via middleware):
 *   - GET    : viewer, analyst, admin (own records only for viewer/analyst)
 *   - POST   : admin only
 *   - PUT    : admin only
 *   - DELETE : admin only
 */

const recordService = require('../services/record.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/records
 * Creates a new financial record. Admin only.
 */
const createRecord = asyncHandler(async (req, res) => {
  const record = await recordService.createRecord(req.body, req.user);

  return res
    .status(201)
    .json(new ApiResponse(201, { record }, 'Record created successfully.'));
});

/**
 * GET /api/records
 * Returns a paginated, filtered list of records.
 * Non-admin users only see their own records.
 */
const getRecords = asyncHandler(async (req, res) => {
  const result = await recordService.getRecords(req.user, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Records fetched successfully.'));
});

/**
 * GET /api/records/:id
 * Returns a single record by ID.
 * Non-admin users can only fetch their own records.
 */
const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id, req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, { record }, 'Record fetched successfully.'));
});

/**
 * PUT /api/records/:id
 * Updates a financial record. Admin only.
 */
const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, { record }, 'Record updated successfully.'));
});

/**
 * DELETE /api/records/:id
 * Soft-deletes a financial record. Admin only.
 */
const deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Record deleted successfully.'));
});

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };
