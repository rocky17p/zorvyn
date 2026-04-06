/**
 * src/middleware/validate.middleware.js — Express-validator integration.
 *
 * Runs accumulated validation rules and short-circuits the request
 * with a 422 Unprocessable Entity response if any rule fails.
 *
 * Usage:
 *   router.post('/', [...validationRules], validate, handler);
 */

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  // Extract human-readable error messages from the validation result
  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(new ApiError(422, 'Validation failed', errors));
};

module.exports = { validate };
