/**
 * src/services/dashboard.service.js — Analytics and aggregation logic.
 *
 * All aggregations use MongoDB's aggregation pipeline for efficiency.
 * Soft-deleted records ({ deletedAt: null }) are always excluded.
 *
 * Ownership scope:
 *   - analyst : sees analytics across ALL records (their purpose is system-wide insight).
 *   - admin   : sees analytics across all records.
 */

const { Record } = require('../models/record.model');

/**
 * Returns the base $match stage used across all aggregations.
 * Excludes soft-deleted records and applies ownership scope if needed.
 * @param {object} user
 * @returns {object} MongoDB $match expression
 */
const buildMatchStage = (user) => {
  const match = { deletedAt: null };

  // Only viewers are scoped to their own records.
  // Analysts need system-wide data to perform meaningful analysis.
  // This condition is here for completeness — dashboard routes
  // already restrict access to analyst and admin only.
  if (user.role === 'viewer') {
    match.createdBy = user._id;
  }

  return match;
};

/**
 * Returns total income, total expenses, and net balance.
 * @param {object} user
 * @returns {{ totalIncome: number, totalExpense: number, netBalance: number }}
 */
const getSummary = async (user) => {
  const match = buildMatchStage(user);

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totals = { income: 0, expense: 0 };
  result.forEach((item) => {
    totals[item._id] = item.total;
  });

  return {
    totalIncome: totals.income,
    totalExpense: totals.expense,
    netBalance: totals.income - totals.expense,
  };
};

/**
 * Returns totals broken down by category (income and expense separately).
 * @param {object} user
 * @returns {Array<{ category: string, type: string, total: number }>}
 */
const getCategoryBreakdown = async (user) => {
  const match = buildMatchStage(user);

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  return result;
};

/**
 * Returns the N most recent non-deleted records.
 * @param {object} user
 * @param {number} limit - Number of recent records to return (default 10)
 * @returns {Array<object>}
 */
const getRecentTransactions = async (user, limit = 10) => {
  const match = buildMatchStage(user);

  const records = await Record.find(match)
    .populate('createdBy', 'name email')
    .sort({ date: -1 })
    .limit(Number(limit));

  return records;
};

/**
 * Returns monthly income and expense totals for trend analysis.
 *
 * Groups by { year, month, type } — produces one row per month per type.
 * Sorted chronologically (oldest first) for easy chart consumption.
 *
 * @param {object} user
 * @returns {Array<{ year: number, month: number, type: string, total: number }>}
 */
const getMonthlyTrends = async (user) => {
  const match = buildMatchStage(user);

  const result = await Record.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { year: 1, month: 1, type: 1 } },
  ]);

  return result;
};

/**
 * Combined dashboard — runs all aggregations in parallel and
 * returns a single unified response payload.
 * @param {object} user
 * @returns {object}
 */
const getFullDashboard = async (user) => {
  const [summary, categoryBreakdown, recentTransactions, monthlyTrends] = await Promise.all([
    getSummary(user),
    getCategoryBreakdown(user),
    getRecentTransactions(user, 10),
    getMonthlyTrends(user),
  ]);

  return {
    ...summary,
    categoryBreakdown,
    recentTransactions,
    monthlyTrends,
  };
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getRecentTransactions,
  getMonthlyTrends,
  getFullDashboard,
};
