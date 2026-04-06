/**
 * src/utils/ApiResponse.js — Standardized success response builder.
 *
 * Usage:
 *   return res.status(200).json(new ApiResponse(200, data, 'Fetched successfully'));
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*}      data       - Response payload
   * @param {string} message    - Human-readable success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
