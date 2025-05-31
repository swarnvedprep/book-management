const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {    
    const token = req.cookies.token;    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Get user (without password and _id)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 4. Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }

    res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = { protect };
