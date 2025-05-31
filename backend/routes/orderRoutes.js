const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updatePrintingStatus,
  updateDispatchStatus,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');

router.route('/')
  .get(protect, getAllOrders)
  .post(protect,roleAuth('executive', 'councellor', 'operations_manager', 'admin'),createOrder);

router.route('/:id')
  .get(protect, getOrderById)
    .put(protect, updateOrder)
  .delete(protect, roleAuth('executive', 'councellor', 'operations_manager', 'admin'), deleteOrder);

router.route('/:id/printing')
  .patch(protect, roleAuth('executive', 'councellor', 'operations_manager', 'admin'), updatePrintingStatus);

router.route('/:id/dispatch')
  .patch(protect, roleAuth('executive', 'councellor', 'operations_manager', 'admin'), updateDispatchStatus);

module.exports = router;