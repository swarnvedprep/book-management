const express = require('express');
const router = express.Router();
const {
  getAllBundles,
  createBundle,
  updateBundle,
  deleteBundle
} = require('../controllers/bundleController');
const { protect } = require('../middlewares/auth');
const roleAuth = require('../middlewares/role');

router.route('/')
  .get(protect, getAllBundles)
  .post(protect, roleAuth('admin'), createBundle);

router.route('/:id')
  .put(protect, roleAuth('admin'), updateBundle)
  .delete(protect, roleAuth('admin'), deleteBundle);

module.exports = router;
