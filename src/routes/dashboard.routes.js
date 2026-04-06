/**
 * src/routes/dashboard.routes.js — Dashboard analytics routes.
 *
 * Access: Analyst and Admin only.
 * Viewers are explicitly excluded from all dashboard endpoints.
 *
 *   GET /api/dashboard             → Combined full dashboard (all in one)
 *   GET /api/dashboard/summary     → Total income / expense / balance
 *   GET /api/dashboard/categories  → Category-wise breakdown
 *   GET /api/dashboard/recent      → Recent transactions (?limit=10)
 *   GET /api/dashboard/trends      → Monthly trend data
 */

const express = require('express');

const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

// All dashboard routes require authentication + at least analyst role
router.use(authenticate, requireRole('analyst', 'admin'));

router.get('/', dashboardController.getFullDashboard);
router.get('/summary', dashboardController.getSummary);
router.get('/categories', dashboardController.getCategoryBreakdown);
router.get('/recent', dashboardController.getRecentTransactions);
router.get('/trends', dashboardController.getMonthlyTrends);

module.exports = router;
