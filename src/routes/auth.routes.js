/**
 * src/routes/auth.routes.js — Authentication routes.
 *
 * Public:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *
 * Protected:
 *   GET  /api/auth/me
 */

const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../models/user.model');

const router = express.Router();

// Validation rules

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Routes

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
