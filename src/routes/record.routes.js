/**
 * src/routes/record.routes.js — Financial record routes.
 *
 * Access Control:
 *   GET    /api/records       → viewer, analyst, admin
 *   GET    /api/records/:id   → viewer, analyst, admin
 *   POST   /api/records       → admin only
 *   PUT    /api/records/:id   → admin only
 *   DELETE /api/records/:id   → admin only
 *
 * Non-admin users (viewer/analyst) only see their own records
 * (enforced in the service layer via ownership isolation).
 *
 * Query params for GET /api/records:
 *   type       — 'income' | 'expense'
 *   category   — string (partial match, case-insensitive)
 *   startDate  — ISO date string
 *   endDate    — ISO date string
 *   page       — number (default 1)
 *   limit      — number (default 10)
 */

const express = require('express');
const { body, param, query } = require('express-validator');

const recordController = require('../controllers/record.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { RECORD_TYPES } = require('../models/record.model');

const router = express.Router();

// All record routes require authentication
router.use(authenticate);

// Validation rules

const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid record ID format'),
];

const createRecordValidation = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}`),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
];

const updateRecordValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

  body('type')
    .optional()
    .isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}`),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Category cannot exceed 50 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters'),
];

const listQueryValidation = [
  query('type')
    .optional()
    .isIn(RECORD_TYPES).withMessage(`Type filter must be one of: ${RECORD_TYPES.join(', ')}`),

  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Routes

// Read — available to all authenticated roles
router.get('/', listQueryValidation, validate, recordController.getRecords);
router.get('/:id', mongoIdValidation, validate, recordController.getRecordById);

// Write — admin only
router.post(
  '/',
  requireRole('admin'),
  createRecordValidation,
  validate,
  recordController.createRecord
);

router.put(
  '/:id',
  requireRole('admin'),
  [...mongoIdValidation, ...updateRecordValidation],
  validate,
  recordController.updateRecord
);

router.delete(
  '/:id',
  requireRole('admin'),
  mongoIdValidation,
  validate,
  recordController.deleteRecord
);

module.exports = router;
