/**
 * src/app.js — Express application setup.
 *
 * Responsibilities:
 *   - Configure middleware (security, CORS, logging, body parsing)
 *   - Mount the API router
 *   - Handle 404 (unknown routes)
 *   - Centralized error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const apiRouter = require('./routes/index');
const ApiError = require('./utils/ApiError');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});
app.use('/api', limiter);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use((_req, _res, next) => {
  next(new ApiError(404, 'The requested route does not exist.'));
});

// Centralized error handler
// Must have exactly 4 parameters for Express to recognize it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Invalid ID format: ${err.value}`,
      errors: [],
    });
  }

  // Handle Mongoose duplicate key error (e.g., unique email constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `A record with this ${field} already exists.`,
      errors: [],
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(422).json({
      success: false,
      statusCode: 422,
      message: 'Validation failed',
      errors,
    });
  }

  // Handle known operational errors (ApiError instances)
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'An unexpected error occurred.';

  if (!err.isOperational) {
    console.error('Unexpected error:', err);
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});

module.exports = app;
