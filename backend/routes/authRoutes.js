const express = require('express');
const router = express.Router();
const { login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/login', login);

router.post('/me', protect,getMe);
router.get('/logout',logout)
module.exports = router;