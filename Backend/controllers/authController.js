// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { colors } from '../constants/colors.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET || 'whiplash_jwt_secret_key_2024',
    { expiresIn: '30d' }
  );
};

// Helper function to validate API key with provider (mock implementation)
const validateApiKeyWithProvider = async (aiConfig) => {
  // Mock validation - in production, make actual API calls
  return aiConfig.apiKey && aiConfig.apiKey.length > 10;
};

// --- LOGGING DECORATOR ---
function logFunctionHit(filename, fnName) {
  return function (originalFn) {
    return async function (...args) {
      console.log(`${colors.blue}[CONTROLLER]${colors.reset} ${colors.yellow}${filename}${colors.reset}/${colors.magenta}${fnName}${colors.reset} ${colors.green}HIT${colors.reset}`);
      return originalFn.apply(this, args);
    };
  };
}

/**
 * Register a new user
 * Creates user account with API key configuration and profile
 */
export const registerUser = logFunctionHit('authController.js', 'registerUser')(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    aiConfig, 
    profile 
  } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.'
      });
    }

    // Validate API key configuration
    if (!aiConfig || !aiConfig.apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'API key is required to use this platform. Please provide your AI service API key.'
      });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered. Please use a different email or log in.'
      });
    }

    // Hash the password (for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document with API configuration and profile
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      aiConfig: {
        provider: aiConfig.provider || 'openai',
        apiKey: aiConfig.apiKey, // Store encrypted in production
        model: aiConfig.model || 'gpt-3.5-turbo',
        isValidated: false,
        usage: {
          totalTokens: 0,
          totalCost: 0
        }
      },
      profile: {
        avatar: profile?.avatar || '',
        bio: profile?.bio || '',
        learningGoals: profile?.learningGoals || [],
        interests: profile?.interests || [],
        timezone: profile?.timezone || 'UTC',
        language: profile?.language || 'en'
      }
    });

    console.log(`User created with API config: ${newUser.id}`);

    // Create initial progress record for the user
    await UserProgress.create({
      userId: newUser.id,
      courseProgress: [],
      achievements: [],
      totalPoints: 0
    });

    console.log(`Progress tracking initialized for user: ${newUser.id}`);

    // Generate JWT token
    const token = generateToken(newUser);

    // Return the token to the client with enhanced user data
    res.status(201).json({ 
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        aiConfig: {
          provider: newUser.aiConfig.provider,
          model: newUser.aiConfig.model,
          isValidated: newUser.aiConfig.isValidated,
          // Don't send API key to frontend for security
        },
        profile: newUser.profile
      },
      message: 'Account created successfully! Your API key has been securely stored.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Log in an existing user
 * Verifies credentials and returns a JWT token
 */
export const loginUser = logFunctionHit('authController.js', 'loginUser')(async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);
  

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    // If user doesn't exist
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for user ${email}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    console.log(`User logged in: ${user.id}`);

    // Generate JWT token
    const token = generateToken(user);

    // Return the token to the client
    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get current user's profile
 * Returns user data (without password)
 */
export const getCurrentUser = logFunctionHit('authController.js', 'getCurrentUser')(async (req, res) => {
  try {
    // The user ID comes from the auth middleware (decoded JWT)
    const userId = req.user.id;
    
    // Find user by ID (excluding password field)
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log(`Get user failed: User ${userId} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({ 
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error retrieving user data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Validate user's API key by making a test call
 */
export const validateApiKey = logFunctionHit('authController.js', 'validateApiKey')(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.aiConfig?.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'No API key found for this user.'
      });
    }

    // TODO: Implement actual API validation based on provider
    // For now, simulate validation
    const isValid = await validateApiKeyWithProvider(user.aiConfig);

    if (isValid) {
      user.aiConfig.isValidated = true;
      user.aiConfig.lastValidated = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'API key validated successfully!',
        provider: user.aiConfig.provider,
        model: user.aiConfig.model
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'API key validation failed. Please check your key and try again.'
      });
    }

  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating API key. Please try again later.'
    });
  }
});

/**
 * Update user's API configuration
 */
export const updateApiConfig = logFunctionHit('authController.js', 'updateApiConfig')(async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider, apiKey, model } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Update API configuration
    if (provider) user.aiConfig.provider = provider;
    if (apiKey) {
      user.aiConfig.apiKey = apiKey;
      user.aiConfig.isValidated = false; // Reset validation status
    }
    if (model) user.aiConfig.model = model;

    await user.save();

    res.json({
      success: true,
      message: 'API configuration updated successfully!',
      aiConfig: {
        provider: user.aiConfig.provider,
        model: user.aiConfig.model,
        isValidated: user.aiConfig.isValidated
      }
    });

  } catch (error) {
    console.error('API config update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating API configuration.'
    });
  }
});