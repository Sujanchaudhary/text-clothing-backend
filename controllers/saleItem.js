const db = require("../models");
const SaleItem = db.SaleItem;

// Create a new sale item
exports.createSaleItem = async (req, res) => {
  try {
    const { saleId, productId, quantity, price } = req.body;

    const saleItem = await SaleItem.create({
      saleId,
      productId,
      quantity,
      price,
    });

    res.status(201).json({ message: "Sale item created successfully", saleItem });
  } catch (error) {
    res.status(500).json({ message: "Error creating sale item", error });
  }
};

// Get all sale items
exports.getSaleItems = async (req, res) => {
  try {
    const saleItems = await SaleItem.findAll();
    res.status(200).json(saleItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sale items", error });
  }
};

// Get sale item by ID
exports.getSaleItem = async (req, res) => {
  const { id } = req.params;
  try {
    const saleItem = await SaleItem.findOne({
      where: { id },
    });

    if (!saleItem) {
      return res.status(404).json({ message: "Sale item not found" });
    }

    res.status(200).json(saleItem);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sale item", error });
  }
};

// Update sale item
exports.updateSaleItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, price } = req.body;

  try {
    const saleItem = await SaleItem.findByPk(id);

    if (!saleItem) {
      return res.status(404).json({ message: "Sale item not found" });
    }

    saleItem.quantity = quantity;
    saleItem.price = price;

    await saleItem.save();

    res.status(200).json({ message: "Sale item updated successfully", saleItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating sale item", error });
  }
};

// Delete sale item
exports.deleteSaleItem = async (req, res) => {
  const { id } = req.params;
  try {
    const saleItem = await SaleItem.findByPk(id);

    if (!saleItem) {
      return res.status(404).json({ message: "Sale item not found" });
    }

    await saleItem.destroy();

    res.status(200).json({ message: "Sale item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting sale item", error });
  }
};
