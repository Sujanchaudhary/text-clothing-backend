const { Inventory, Product, Unit } = require("../models");

// Create Inventory
exports.createInventory = async (req, res) => {
  try {
    const { productId, quantity, unitId, alert_quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const unit = await Unit.findByPk(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    const inventory = await Inventory.create({
      quantity,
      UnitId: unit.id,
      alert_quantity
    });

    await product.setInventory(inventory);
    return res.status(201).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByPk(req.params.id);
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });

    const { quantity, unitId, alert_quantity } = req.body;
    const unit = await Unit.findByPk(unitId);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    inventory.quantity = quantity || inventory.quantity;
    inventory.alert_quantity = alert_quantity || inventory.alert_quantity;
    inventory.UnitId = unit.id;

    await inventory.save();
    return res.status(200).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findAll({
      include: [{ model: Product }, { model: Unit }]
    });
    return res.status(200).json(inventory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
