/**
 * src/models/record.model.js — Financial record schema.
 *
 * Ownership:
 *   - Every record stores `createdBy` (ref to User).
 *   - Non-admin users are restricted to querying only their own records in the service layer.
 *
 * Soft Delete:
 *   - Physical deletion is never used; `deletedAt` is populated instead.
 *   - All queries must include { deletedAt: null } to exclude deleted records.
 */

const mongoose = require('mongoose');

const RECORD_TYPES = ['income', 'expense'];

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: RECORD_TYPES,
        message: `Type must be one of: ${RECORD_TYPES.join(', ')}`,
      },
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: function (value) {
          // Date must not be in the future
          return value <= new Date();
        },
        message: 'Date cannot be in the future',
      },
    },

    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
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

// Compound indexes for query performance

// Used when non-admin users query their own records sorted by date
recordSchema.index({ createdBy: 1, date: -1 });

// Used for filtering by type and category simultaneously
recordSchema.index({ type: 1, category: 1 });

// Used to efficiently exclude soft-deleted documents
recordSchema.index({ deletedAt: 1 });

const Record = mongoose.model('Record', recordSchema);

module.exports = { Record, RECORD_TYPES };
