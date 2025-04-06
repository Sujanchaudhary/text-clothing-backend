const db = require("../models");
const Unit = db.Unit;

// Create a new Unit
exports.createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    const unit = await Unit.create({ name });
    res.status(201).json({ unit });
  } catch (err) {
    res.status(500).json({ message: "Error creating unit", error: err });
  }
};

// Get all Units
exports.getUnits = async (req, res) => {
  try {
    const units = await Unit.findAll();
    res.status(200).json({ units });
  } catch (err) {
    res.status(500).json({ message: "Error fetching units", error: err });
  }
};

// Get a Unit by ID
exports.getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ unit });
  } catch (err) {
    res.status(500).json({ message: "Error fetching unit", error: err });
  }
};

// Update a Unit
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    unit.name = name;
    await unit.save();
    res.status(200).json({ unit });
  } catch (err) {
    res.status(500).json({ message: "Error updating unit", error: err });
  }
};

// Delete a Unit
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    await unit.destroy();
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting unit", error: err });
  }
};
