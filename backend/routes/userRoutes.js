const express = require('express');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');
const { updateUser, deleteUser, getAllUsers, register, getUserById } = require('../controllers/userController');
const router = express.Router();

router.route('/').get(protect, roleAuth('admin'), getAllUsers)
router.route('/:id').get(protect,roleAuth('admin'), getUserById).put(protect,roleAuth('admin'), updateUser)
.delete(protect,roleAuth('admin'), deleteUser)
router.post('/register', protect, roleAuth('admin'), register);
module.exports = router