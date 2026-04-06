/**
 * src/routes/user.routes.js — User management routes. (Admin only)
 *
 * All routes require authentication + admin role.
 *
 *   GET    /api/users
 *   GET    /api/users/:id
 *   PATCH  /api/users/:id
 *   DELETE /api/users/:id
 */

const express = require('express');
const { body, param } = require('express-validator');

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { ROLES } = require('../models/user.model');

const router = express.Router();

// All user management routes require authentication and admin role
router.use(authenticate, requireRole('admin'));

// Validation rules

const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid user ID format'),
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('role')
    .optional()
    .isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// Routes

router.get('/', userController.getAllUsers);
router.get('/:id', mongoIdValidation, validate, userController.getUserById);
router.patch('/:id', [...mongoIdValidation, ...updateUserValidation], validate, userController.updateUser);
router.delete('/:id', mongoIdValidation, validate, userController.deleteUser);

module.exports = router;
