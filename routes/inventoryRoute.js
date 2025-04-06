const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory");

// Routes for Inventory
router.post("/inventory", inventoryController.createInventory); // Create inventory
router.put("/inventory/:id", inventoryController.updateInventory); // Update inventory
router.get("/inventory", inventoryController.getInventory); // Get all inventories

module.exports = router;
