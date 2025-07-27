import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: './config.env' });

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'your_email@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'your_email@gmail.com',
      password: await bcrypt.hash('test123', 10),
      isAdmin: false
    });
    
    await testUser.save();
    console.log('✅ Created test user:', testUser.email);
    console.log('📋 Test user credentials: your_email@gmail.com / test123');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestUser(); 