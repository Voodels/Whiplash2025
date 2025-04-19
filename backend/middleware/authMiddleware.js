// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Get token from header or cookie
  const token = req.header('x-auth-token') || req.cookies.token;
  
  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the entire decoded payload
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};