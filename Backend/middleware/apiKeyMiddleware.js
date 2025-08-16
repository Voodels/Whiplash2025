// middleware/apiKeyMiddleware.js

import User from '../models/User.js';
import { colors } from '../constants/colors.js';

/**
 * Middleware to extract user's API key and add to request
 * This allows microservices to use the user's own API key
 */
export const extractApiKey = async (req, res, next) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Fetch user's API configuration
    const user = await User.findById(userId).select('aiConfig');
    
    if (!user || !user.aiConfig?.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'No API key configured. Please add your AI service API key in settings.'
      });
    }

    // Check if API key is validated
    if (!user.aiConfig.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'API key not validated. Please validate your API key first.',
        requiresValidation: true
      });
    }

    // Add API config to request for microservices
    req.userApiConfig = {
      provider: user.aiConfig.provider || 'default',
      apiKey: user.aiConfig.apiKey,
      model: user.aiConfig.model,
      userId: userId,
      // Include any additional provider-specific configuration
      ...(user.aiConfig.config || {})
    };

    console.log(`${colors.green}[API-KEY]${colors.reset} Using ${user.aiConfig.provider || 'default'} provider with model: ${user.aiConfig.model || 'default'}`);
    
    next();
  } catch (error) {
    console.error('API key extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving API configuration'
    });
  }
};

/**
 * Middleware to update API usage statistics
 */
export const updateApiUsage = (tokensUsed = 0, estimatedCost = 0) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (userId && tokensUsed > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: {
            'aiConfig.usage.totalTokens': tokensUsed,
            'aiConfig.usage.totalCost': estimatedCost
          },
          $set: {
            'aiConfig.usage.lastUsed': new Date()
          }
        });

        console.log(`${colors.blue}[USAGE]${colors.reset} User ${userId}: +${tokensUsed} tokens, +$${estimatedCost.toFixed(4)}`);
      }
      
      next();
    } catch (error) {
      console.error('Error updating API usage:', error);
      // Don't block the request, just log the error
      next();
    }
  };
};

/**
 * Middleware to forward requests to microservices with user's API key
 */
export const forwardToMicroservice = (serviceUrl) => {
  return async (req, res, next) => {
    try {
      const apiConfig = req.userApiConfig;
      
      if (!apiConfig) {
        return res.status(400).json({
          success: false,
          message: 'No API configuration available'
        });
      }

      // Add API config to request body for microservice
      req.body.userApiConfig = {
        provider: apiConfig.provider,
        apiKey: apiConfig.apiKey,
        model: apiConfig.model,
        userId: apiConfig.userId
      };

      // Set target microservice URL
      req.microserviceUrl = serviceUrl;
      
      next();
    } catch (error) {
      console.error('Microservice forwarding error:', error);
      res.status(500).json({
        success: false,
        message: 'Error preparing microservice request'
      });
    }
  };
};

/**
 * Rate limiting based on user's API usage
 */
export const apiUsageRateLimit = (maxTokensPerHour = 10000) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return next();
      }

      const user = await User.findById(userId).select('aiConfig.usage');
      const lastHour = new Date(Date.now() - 60 * 60 * 1000);
      
      // For now, we'll implement a simple check
      // In production, you'd want a more sophisticated rate limiting mechanism
      if (user?.aiConfig?.usage?.lastUsed && 
          user.aiConfig.usage.lastUsed > lastHour && 
          user.aiConfig.usage.totalTokens > maxTokensPerHour) {
        
        return res.status(429).json({
          success: false,
          message: 'API usage limit exceeded for this hour. Please try again later.',
          retryAfter: Math.ceil((60 * 60 * 1000 - (Date.now() - user.aiConfig.usage.lastUsed)) / 1000)
        });
      }
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't block request on rate limiting errors
      next();
    }
  };
};

export default {
  extractApiKey,
  updateApiUsage,
  forwardToMicroservice,
  apiUsageRateLimit
};
