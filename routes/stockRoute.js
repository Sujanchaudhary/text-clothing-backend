const express = require("express");
const router = express.Router();
const stockHistoryController = require("../controllers/stock");
const { authenticate } = require("../middleware/authMiddleware");

// Routes for Stock History
router.post(
  "/stock",
  authenticate(["admin", "member"]),
  stockHistoryController.createStockHistory
); // Create stock history
router.post(
  "/stock/update",
  authenticate(["admin", "member"]),
  stockHistoryController.updateStock
);
router.get(
  "/stock/history",
  authenticate(["admin", "member"]),
  stockHistoryController.getStockHistory
); // Get all stock histories

module.exports = router;
