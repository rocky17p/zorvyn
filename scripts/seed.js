/**
 * scripts/seed.js — Database seeder script.
 *
 * Creates:
 *   - 1 Admin user
 *   - 1 Analyst user
 *   - 1 Viewer user
 *   - 20 sample financial records (owned by admin)
 *
 * Usage:
 *   npm run seed
 *
 * WARNING: This script clears all existing users and records before seeding.
 *          Do NOT run this in production.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const { User } = require('../src/models/user.model');
const { Record } = require('../src/models/record.model');

// Seed data

const seedUsers = [
  {
    name: 'Alex Admin',
    email: 'admin@finance.dev',
    password: 'Admin@1234',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Sara Analyst',
    email: 'analyst@finance.dev',
    password: 'Analyst@1234',
    role: 'analyst',
    isActive: true,
  },
  {
    name: 'Victor Viewer',
    email: 'viewer@finance.dev',
    password: 'Viewer@1234',
    role: 'viewer',
    isActive: true,
  },
];

const generateRecords = (adminId) => [
  // Income records
  { amount: 85000, type: 'income', category: 'Salary',       date: new Date('2025-01-05'), note: 'January salary',          createdBy: adminId },
  { amount: 12000, type: 'income', category: 'Freelance',    date: new Date('2025-01-18'), note: 'Website design project',  createdBy: adminId },
  { amount: 85000, type: 'income', category: 'Salary',       date: new Date('2025-02-05'), note: 'February salary',         createdBy: adminId },
  { amount: 5000,  type: 'income', category: 'Investments',  date: new Date('2025-02-20'), note: 'Dividend payout',         createdBy: adminId },
  { amount: 85000, type: 'income', category: 'Salary',       date: new Date('2025-03-05'), note: 'March salary',            createdBy: adminId },
  { amount: 8500,  type: 'income', category: 'Freelance',    date: new Date('2025-03-14'), note: 'Mobile app consulting',   createdBy: adminId },
  { amount: 85000, type: 'income', category: 'Salary',       date: new Date('2025-04-05'), note: 'April salary',            createdBy: adminId },

  // Expense records
  { amount: 18000, type: 'expense', category: 'Rent',         date: new Date('2025-01-02'), note: 'Monthly rent',            createdBy: adminId },
  { amount: 4500,  type: 'expense', category: 'Groceries',    date: new Date('2025-01-10'), note: 'Weekly grocery run',      createdBy: adminId },
  { amount: 1200,  type: 'expense', category: 'Utilities',    date: new Date('2025-01-15'), note: 'Electricity bill',        createdBy: adminId },
  { amount: 2500,  type: 'expense', category: 'Dining',       date: new Date('2025-01-22'), note: 'Dinner with team',        createdBy: adminId },
  { amount: 18000, type: 'expense', category: 'Rent',         date: new Date('2025-02-02'), note: 'Monthly rent',            createdBy: adminId },
  { amount: 9800,  type: 'expense', category: 'Travel',       date: new Date('2025-02-14'), note: 'Conference trip flights', createdBy: adminId },
  { amount: 3200,  type: 'expense', category: 'Groceries',    date: new Date('2025-02-18'), note: 'Bi-weekly groceries',     createdBy: adminId },
  { amount: 18000, type: 'expense', category: 'Rent',         date: new Date('2025-03-02'), note: 'Monthly rent',            createdBy: adminId },
  { amount: 6400,  type: 'expense', category: 'Electronics',  date: new Date('2025-03-20'), note: 'New mechanical keyboard', createdBy: adminId },
  { amount: 1800,  type: 'expense', category: 'Utilities',    date: new Date('2025-03-25'), note: 'Internet + electricity',  createdBy: adminId },
  { amount: 18000, type: 'expense', category: 'Rent',         date: new Date('2025-04-02'), note: 'Monthly rent',            createdBy: adminId },
  { amount: 5500,  type: 'expense', category: 'Dining',       date: new Date('2025-04-03'), note: 'Client entertainment',   createdBy: adminId },
  { amount: 3000,  type: 'expense', category: 'Subscriptions',date: new Date('2025-04-04'), note: 'Annual SaaS renewals',   createdBy: adminId },
];

// Seeder

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Record.deleteMany({}),
    ]);
    console.log('Cleared existing users and records');

    // Create users using save() individually to trigger the bcrypt pre-save hook.
    // insertMany() bypasses pre-save middleware, so we must save each user separately.
    const finalUsers = await Promise.all(
      seedUsers.map((userData) => new User(userData).save())
    );

    const admin = finalUsers.find((u) => u.role === 'admin');
    console.log(`Created ${finalUsers.length} users`);

    // Create records owned by admin
    const records = generateRecords(admin._id);
    await Record.insertMany(records);
    console.log(`Created ${records.length} financial records`);

    console.log('\nSeed completed successfully!');
    console.log('\nTest credentials:');
    console.log('  admin    | admin@finance.dev    | Admin@1234');
    console.log('  analyst  | analyst@finance.dev  | Analyst@1234');
    console.log('  viewer   | viewer@finance.dev   | Viewer@1234');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
