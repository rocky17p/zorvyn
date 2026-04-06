/**
 * src/models/user.model.js — User schema with role-based access control support.
 *
 * Roles:
 *   - viewer  : can only view their own records
 *   - analyst : can view records + access dashboard analytics
 *   - admin   : full access (CRUD on records + user management)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['viewer', 'analyst', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ROLES,
        message: `Role must be one of: ${ROLES.join(', ')}`,
      },
      default: 'viewer',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Soft delete — set to a Date instead of actually removing the document
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
// Note: email index is already created by unique: true above.

userSchema.index({ deletedAt: 1 });

// Pre-save hook: hash password before storing

userSchema.pre('save', async function (next) {
  // Only re-hash if the password field was modified
  if (!this.isModified('password')) return next();

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance methods

/**
 * Compares a plain-text candidate password with the stored hashed password.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns a safe public representation of the user (no password).
 */
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = { User, ROLES };
