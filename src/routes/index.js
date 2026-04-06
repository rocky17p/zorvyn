/**
 * src/routes/index.js — Root router.
 *
 * Mounts all sub-routers under /api prefix.
 * Also provides a health check endpoint.
 */

const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const recordRoutes = require('./record.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = express.Router();

// Health check — useful for deployment monitoring (e.g., Render, Railway)
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/records', recordRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
