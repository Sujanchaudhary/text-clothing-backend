const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unit");

// Create a new unit
router.post("/units", unitController.createUnit);

// Get all units
router.get("/units", unitController.getUnits);

// Get a unit by ID
router.get("/units/:id", unitController.getUnitById);

// Update a unit by ID
router.put("/units/:id", unitController.updateUnit);

// Delete a unit by ID
router.delete("/units/:id", unitController.deleteUnit);

module.exports = router;
