/**
 * src/utils/asyncHandler.js — Wraps async route handlers to automatically
 * forward any thrown errors to Express's centralized error middleware.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
