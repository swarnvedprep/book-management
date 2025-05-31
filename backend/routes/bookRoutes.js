const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  createBook,
  updateBook,
  getBookById,
  deleteBookById
} = require('../controllers/bookController');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');

router.route('/')
  .get(protect, getAllBooks)
  .post(protect, roleAuth('councellor', 'operations_manager', 'admin'), createBook);

router.route('/:id')
  .get(protect, getBookById)
  .put(protect, roleAuth('councellor', 'operations_manager', 'admin'), updateBook)
  .delete(protect,roleAuth('councellor', 'operations_manager', 'admin'),deleteBookById)

module.exports = router;