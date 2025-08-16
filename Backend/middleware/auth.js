// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { colors } from '../constants/colors.js';

// --- LOGGING DECORATOR ---
function logFunctionHit(filename, fnName) {
  return function (originalFn) {
    return async function (...args) {
      console.log(`${colors.cyan}[MIDDLEWARE]${colors.reset} ${colors.yellow}${filename}${colors.reset}/${colors.magenta}${fnName}${colors.reset} ${colors.green}HIT${colors.reset}`);
      return originalFn.apply(this, args);
    };
  };
}

export const authMiddleware = logFunctionHit('auth.js', 'authMiddleware')(async (req, res, next) => {
  try {
    // Log the incoming request for debugging
    console.log(`${colors.cyan}[AUTH DEBUG]${colors.reset} Request URL: ${colors.magenta}${req.originalUrl}${colors.reset}`);
    console.log(`${colors.cyan}[AUTH DEBUG]${colors.reset} Headers: ${colors.dim}x-auth-token: ${req.header('x-auth-token') ? 'present' : 'missing'}${colors.reset}`);
    console.log(`${colors.cyan}[AUTH DEBUG]${colors.reset} Authorization: ${colors.dim}${req.headers['authorization'] ? 'present' : 'missing'}${colors.reset}`);
    
    // Try to get token from header or cookie
    let token = req.header('x-auth-token') || req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) token = token.slice(7);
    if (!token && req.cookies) token = req.cookies['token'];

    if (!token) {
      console.log(`${colors.yellow}[AUTH FAILED]${colors.reset} No token provided for ${colors.magenta}${req.originalUrl}${colors.reset}`);
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided. Access denied.',
        debug: {
          url: req.originalUrl,
          headers: {
            'x-auth-token': !!req.header('x-auth-token'),
            'authorization': !!req.headers['authorization'],
            'cookie': !!req.cookies
          }
        }
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'whiplash_jwt_secret_key_2024');
      console.log(`${colors.green}[AUTH SUCCESS]${colors.reset} Token verified for user: ${colors.cyan}${decoded.id}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}[AUTH FAILED]${colors.reset} Invalid token: ${colors.yellow}${err.message}${colors.reset}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
        debug: {
          error: err.message,
          tokenProvided: !!token
        }
      });
    }

    // Attach user
    const user = await User.findById(decoded.id).select('_id email role');
    if (!user) {
      console.log(`${colors.red}[AUTH FAILED]${colors.reset} User not found: ${colors.yellow}${decoded.id}${colors.reset}`);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Access denied.',
        debug: {
          userId: decoded.id
        }
      });
    }
    
    console.log(`${colors.green}[AUTH SUCCESS]${colors.reset} User authenticated: ${colors.cyan}${user.email}${colors.reset} (${colors.yellow}${user.role}${colors.reset})`);
    
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    console.error(`${colors.red}[AUTH ERROR]${colors.reset} Unexpected error in auth middleware:`, error.message);
    console.error(`${colors.red}[AUTH ERROR]${colors.reset} Stack trace:`, error.stack);
    
    return res.status(401).json({ 
      success: false, 
      message: 'Token is not valid or user not found.',
      debug: {
        error: error.message,
        url: req.originalUrl
      }
    });
  }
});

// Role-based middleware
export const authorizeRoles = logFunctionHit('auth.js', 'authorizeRoles')(function (...roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed to access this resource`
      });
    }
    next();
  };
});