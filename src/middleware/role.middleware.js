/**
 * src/middleware/role.middleware.js — Role-based access control (RBAC) middleware.
 *
 * Usage:
 *   router.get('/admin-only', authenticate, requireRole('admin'), handler);
 *   router.get('/insights', authenticate, requireRole('analyst', 'admin'), handler);
 *
 * Role Hierarchy:
 *   viewer  → read own records only
 *   analyst → read own records + dashboard insights
 *   admin   → full access (CRUD on records + user management)
 */

const ApiError = require('../utils/ApiError');

/**
 * Factory function that returns middleware restricting access to specific roles.
 * @param {...string} allowedRoles - One or more role strings that are permitted.
 */
const requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. This route requires one of the following roles: ${allowedRoles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { requireRole };
