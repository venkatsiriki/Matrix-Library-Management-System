const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@matrix.com' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const testUser = new User({
      email: 'admin@matrix.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Matrix Admin'
    });

    await testUser.save();
    console.log('Test user created successfully:');
    console.log('Email: admin@matrix.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
