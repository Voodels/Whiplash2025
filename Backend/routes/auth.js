// routes/auth.js
import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  validateApiKey, 
  updateApiConfig 
} from '../controllers/authController.js';
import {authMiddleware} from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/users/signup (alias)
 * @desc    Register a new user (alias to avoid client blockers on 
 *          certain path names during development)
 * @access  Public
 */
router.post('/signup', registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @route   POST /api/auth/validate-api-key
 * @desc    Validate user's AI service API key
 * @access  Private (requires authentication)
 */
router.post('/validate-api-key', authMiddleware, validateApiKey);

/**
 * @route   PUT /api/auth/api-config
 * @desc    Update user's API configuration
 * @access  Private (requires authentication)
 */
router.put('/api-config', authMiddleware, updateApiConfig);

export default router;