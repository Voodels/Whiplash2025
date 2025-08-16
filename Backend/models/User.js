// models/User.js
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'student',
    enum: ['student', 'admin', 'instructor']
  },
  // API Key Configuration for self-hosted AI services
  aiConfig: {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'gemini', 'ollama', 'custom'],
      default: 'openai'
    },
    apiKey: {
      type: String,
      required: true // Users must bring their own API key
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo' // Default model, user can change
    },
    isValidated: {
      type: Boolean,
      default: false // Will be validated on first use
    },
    lastValidated: {
      type: Date
    },
    usage: {
      totalTokens: {
        type: Number,
        default: 0
      },
      totalCost: {
        type: Number,
        default: 0
      },
      lastUsed: {
        type: Date
      }
    }
  },
  // User Profile Information
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    learningGoals: [{
      type: String
    }],
    interests: [{
      type: String
    }],
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', UserSchema);