const express = require("express");
const router = express.Router();
const { createBulkOrders, upload } = require("../controllers/bulkOrders");
const { protect } = require("../middlewares/auth");
const roleAuth = require("../middlewares/role");

router.post(
  "/",
  protect,
  roleAuth("councellor", "operations_manager", "admin"),
  upload.single("csvFile"),
  createBulkOrders
);

module.exports = router;
