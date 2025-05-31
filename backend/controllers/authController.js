const jwt = require('jsonwebtoken');
const User = require('../models/User');


// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
// backend/controllers/authController.js

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        name: user.name,
        email: user.email,
        role: user.role,
      });
      
    } else {
         console.log("Hello");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  res.json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  })
}

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(0) 
  });

  res.status(200).json({ message: 'Logged out successfully' });
};


module.exports = { login, getMe,logout };