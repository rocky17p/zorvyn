/**
 * src/utils/ApiError.js — Custom error class for structured API errors.
 *
 * Usage:
 *   throw new ApiError(404, 'User not found');
 *   throw new ApiError(422, 'Validation failed', ['amount must be > 0']);
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {Array}  errors     - Optional list of validation/field errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = true; // distinguishes known errors from unexpected crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
