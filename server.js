/**
 * server.js — Application entry point
 * Loads environment variables, connects to DB, and starts the HTTP server.
 */

require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Finance Dashboard API running on port ${PORT}`);
      console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`Base URL    : http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
