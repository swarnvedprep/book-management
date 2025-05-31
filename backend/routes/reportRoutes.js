const express = require('express');
const router = express.Router();
const {
  getStockReport,
  getFinancialReport,
  getOrderStatusReport,
  incrementStock,
  deleteStock
} = require('../controllers/reportController');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');

router.get('/stock', protect, roleAuth('admin'), getStockReport);
router.get('/financial', protect, roleAuth('admin'), getFinancialReport);
router.get('/order-status', protect, roleAuth('admin'), getOrderStatusReport);
router.put('/stock/increment/:id', protect, roleAuth('admin'), incrementStock);
router.delete('/stock/:id', protect, roleAuth('admin'), deleteStock);
module.exports = router;