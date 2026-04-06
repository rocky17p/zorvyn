/**
 * src/controllers/dashboard.controller.js — Dashboard analytics HTTP layer.
 *
 * Access: Analyst and Admin only (viewer is excluded).
 *
 * Admins see data across all records.
 * Analysts see data scoped to their own records.
 */

const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard
 * Returns the full combined dashboard response in a single request.
 * Runs all sub-aggregations in parallel for performance.
 */
const getFullDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getFullDashboard(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Dashboard data fetched successfully.'));
});

/**
 * GET /api/dashboard/summary
 * Returns total income, total expense, and net balance.
 */
const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Summary fetched successfully.'));
});

/**
 * GET /api/dashboard/categories
 * Returns totals broken down by category and type.
 */
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryBreakdown(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, { categoryBreakdown: data }, 'Category breakdown fetched successfully.'));
});

/**
 * GET /api/dashboard/recent
 * Returns the most recent transactions (default: 10).
 */
const getRecentTransactions = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;
  const data = await dashboardService.getRecentTransactions(req.user, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, { recentTransactions: data }, 'Recent transactions fetched successfully.'));
});

/**
 * GET /api/dashboard/trends
 * Returns monthly income and expense totals for trend analysis.
 */
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getMonthlyTrends(req.user);

  return res
    .status(200)
    .json(new ApiResponse(200, { monthlyTrends: data }, 'Monthly trends fetched successfully.'));
});

module.exports = {
  getFullDashboard,
  getSummary,
  getCategoryBreakdown,
  getRecentTransactions,
  getMonthlyTrends,
};
