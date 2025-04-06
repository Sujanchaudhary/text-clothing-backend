const express = require("express");
const router = express.Router();
const saleController = require("../controllers/sale");
const { authenticate } = require("../middleware/authMiddleware");

// Routes for Sale
router.post("/sales", authenticate(["admin", "member"]), saleController.createSale); // Create sale
router.get("/sales", saleController.getSales); // Get all sales
router.get("/sales/:id", saleController.getSale); // Get sale by ID
router.put("/sales/:id", saleController.updateSale); // Update sale
router.delete("/sales/:id", saleController.deleteSale); // Delete sale

module.exports = router;
