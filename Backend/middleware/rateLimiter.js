// middleware/rateLimiter.js

import rateLimit from 'express-rate-limit';
import { colors } from '../constants/colors.js';

// In-memory storage for API usage tracking (in production, use Redis or database)
const apiUsageStore = new Map();

/**
 * Rate limiter factory function for API usage
 * Creates rate limiter with specified limits
 * @param {number} maxRequests - Maximum requests per window (default: 100)
 * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
 */
export const apiUsageRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      error: 'Too many requests from this user, please try again later.',
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req, res) => {
      // Use user ID if authenticated, otherwise use default IP key generator
      if (req.user?.id) {
        return req.user.id;
      }
      // Let express-rate-limit handle IP address properly for IPv6
      return undefined; // This will use the default IP key generator
    },
    handler: (req, res) => {
      const userId = req.user?.id || 'anonymous';
      console.log(`${colors.red}[RATE LIMIT]${colors.reset} Too many requests from ${userId}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path.includes('/health');
    }
  });
};

/**
 * Track API usage for analytics and billing
 * @param {Object} req - Express request object
 * @param {string} service - Service name (e.g., 'gemini', 'youtube')
 * @param {string} operation - Operation type (e.g., 'generate', 'search')
 * @param {number} cost - Cost units for this operation
 */
export const updateApiUsage = (req, service, operation, cost = 1) => {
  try {
    const userId = req.user?.id || 'anonymous';
    const timestamp = new Date().toISOString();
    const usageKey = `${userId}:${service}`;
    
    // Get or create usage record
    let usage = apiUsageStore.get(usageKey) || {
      userId,
      service,
      totalRequests: 0,
      totalCost: 0,
      dailyUsage: {},
      lastRequest: null
    };
    
    // Update usage statistics
    usage.totalRequests += 1;
    usage.totalCost += cost;
    usage.lastRequest = timestamp;
    
    // Track daily usage
    const today = new Date().toISOString().split('T')[0];
    if (!usage.dailyUsage[today]) {
      usage.dailyUsage[today] = { requests: 0, cost: 0 };
    }
    usage.dailyUsage[today].requests += 1;
    usage.dailyUsage[today].cost += cost;
    
    // Store updated usage
    apiUsageStore.set(usageKey, usage);
    
    // Log usage for monitoring
    console.log(`${colors.cyan}[API USAGE]${colors.reset} User: ${userId}, Service: ${service}, Operation: ${operation}, Cost: ${cost}`);
    
    // Clean up old daily usage (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    Object.keys(usage.dailyUsage).forEach(date => {
      if (date < cutoffDate) {
        delete usage.dailyUsage[date];
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}[API USAGE ERROR]${colors.reset} Failed to update usage:`, error.message);
  }
};

/**
 * Get API usage statistics for a user
 * @param {string} userId - User ID
 * @param {string} service - Service name (optional)
 * @returns {Object} Usage statistics
 */
export const getApiUsage = (userId, service = null) => {
  try {
    if (service) {
      const usageKey = `${userId}:${service}`;
      return apiUsageStore.get(usageKey) || null;
    } else {
      // Get usage for all services for this user
      const userUsage = {};
      for (const [key, usage] of apiUsageStore.entries()) {
        if (key.startsWith(userId + ':')) {
          const serviceName = key.split(':')[1];
          userUsage[serviceName] = usage;
        }
      }
      return userUsage;
    }
  } catch (error) {
    console.error(`${colors.red}[API USAGE ERROR]${colors.reset} Failed to get usage:`, error.message);
    return null;
  }
};

/**
 * Check if user has exceeded their quota
 * @param {string} userId - User ID
 * @param {string} service - Service name
 * @param {number} dailyLimit - Daily request limit
 * @returns {boolean} True if quota is exceeded
 */
export const checkQuotaExceeded = (userId, service, dailyLimit = 1000) => {
  try {
    const usage = getApiUsage(userId, service);
    if (!usage) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = usage.dailyUsage[today];
    
    return todayUsage && todayUsage.requests >= dailyLimit;
  } catch (error) {
    console.error(`${colors.red}[QUOTA CHECK ERROR]${colors.reset} Failed to check quota:`, error.message);
    return false; // Allow request if check fails
  }
};

/**
 * Middleware to check daily quota before processing request
 * @param {number} dailyLimit - Daily request limit
 */
export const quotaMiddleware = (dailyLimit = 1000) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.id || req.ip;
      const service = req.route?.path?.includes('material') ? 'material' : 
                     req.route?.path?.includes('quiz') ? 'quiz' : 
                     req.route?.path?.includes('video') ? 'video' : 'unknown';
      
      if (checkQuotaExceeded(userId, service, dailyLimit)) {
        console.log(`${colors.yellow}[QUOTA EXCEEDED]${colors.reset} User ${userId} exceeded daily limit for ${service}`);
        return res.status(429).json({
          error: 'Daily quota exceeded',
          message: `You have exceeded your daily limit of ${dailyLimit} requests for ${service} service.`,
          resetTime: 'Quota resets at midnight UTC'
        });
      }
      
      next();
    } catch (error) {
      console.error(`${colors.red}[QUOTA MIDDLEWARE ERROR]${colors.reset}`, error.message);
      next(); // Continue on error
    }
  };
};

export default {
  apiUsageRateLimit,
  updateApiUsage,
  getApiUsage,
  checkQuotaExceeded,
  quotaMiddleware
};
