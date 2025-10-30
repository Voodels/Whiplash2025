import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/WhipLash');
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'student@test.com' });
    
    if (existingUser) {
      console.log('\n✅ Test user already exists!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:    student@test.com');
      console.log('🔑 Password: Student@123');
      console.log('👤 Name:     ', existingUser.name);
      console.log('🎭 Role:     ', existingUser.role);
      console.log('═══════════════════════════════════════\n');
      console.log('🌐 Login at: http://localhost:5173/');
      console.log('═══════════════════════════════════════\n');
    } else {
      // Create new test user
      const testUser = await User.create({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'Student@123', // Will be hashed by pre-save middleware
        role: 'student',
        aiConfig: {
          apiKey: 'test-api-key-placeholder',
          provider: 'gemini'
        },
        profile: {
          bio: 'I am a test student exploring the WhipLash Learning Platform',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestStudent',
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: true,
              deadlineReminders: true,
              courseUpdates: true
            }
          }
        },
        learningStats: {
          totalStudyTime: 0,
          coursesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date()
        }
      });

      console.log('\n🎉 Test user created successfully!');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:    student@test.com');
      console.log('🔑 Password: Student@123');
      console.log('👤 Name:     ', testUser.name);
      console.log('🎭 Role:     ', testUser.role);
      console.log('🆔 User ID:  ', testUser._id);
      console.log('═══════════════════════════════════════\n');
      console.log('🌐 Login at: http://localhost:5173/');
      console.log('═══════════════════════════════════════\n');
    }

    // Also show admin credentials
    const adminUser = await User.findOne({ email: 'admin@whiplash.edu' });
    if (adminUser) {
      console.log('🔐 Admin Credentials (for reference):');
      console.log('═══════════════════════════════════════');
      console.log('📧 Email:    admin@whiplash.edu');
      console.log('🔑 Password: admin123');
      console.log('═══════════════════════════════════════\n');
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
};

createTestUser();
