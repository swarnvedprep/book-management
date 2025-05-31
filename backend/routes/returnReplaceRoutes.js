const express = require('express');
const router = express.Router();
const {
  createReturnReplace,
  getAllRequests,
  getRequestById,
  processRequest,
  deleteRequest,
  getStats
} = require('../controllers/returnReplaceController');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');

router.get('/stats', 
  protect, 
  roleAuth('admin', 'operations_manager'), 
  getStats
);

router.put('/:id/process', 
  protect, 
  roleAuth('executive', 'councellor', 'operations_manager', 'admin'), 
  processRequest
);

router.route('/')
  .get(protect, getAllRequests)
  .post(protect, roleAuth('executive', 'councellor', 'operations_manager', 'admin'), createReturnReplace);

router.route('/:id')
  .get(protect, getRequestById)
  .delete(protect, roleAuth('operations_manager', 'admin'), deleteRequest);

module.exports = router;