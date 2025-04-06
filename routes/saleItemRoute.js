const express = require("express");
const router = express.Router();
const saleItemController = require("../controllers/saleItem");

// Routes for Sale Item
router.post("/", saleItemController.createSaleItem); // Create sale item
router.get("/", saleItemController.getSaleItems); // Get all sale items
router.get("/:id", saleItemController.getSaleItem); // Get sale item by ID
router.put("/:id", saleItemController.updateSaleItem); // Update sale item
router.delete("/:id", saleItemController.deleteSaleItem); // Delete sale item

module.exports = router;
