const { StockHistory, Product, Inventory, Users } = require("../models");

exports.createStockHistory = async (req, res) => {
  const transaction = await StockHistory.sequelize.transaction();

  try {
    const { ProductId, type, quantity, reason } = req.body;

    if (!ProductId || !type || !quantity) {
      return res
        .status(400)
        .json({ message: "ProductId, type, and quantity are required" });
    }

    // Check if Inventory exists for product
    let inventory = await Inventory.findOne({ where: { ProductId } });

    if (!inventory) {
      inventory = await Inventory.create(
        { ProductId, quantity: 0, alert_quantity: 5 },
        { transaction }
      );
    }

    // Adjust inventory based on type
    if (type === "in") {
      inventory.quantity += quantity;
    } else if (type === "out") {
      if (inventory.quantity < quantity) {
        return res.status(400).json({ message: "Not enough stock to remove" });
      }
      inventory.quantity -= quantity;
    } else if (type === "adjust") {
      inventory.quantity = quantity;
    }

    // Save updated inventory
    await inventory.save({ transaction });

    // Create stock history record
    const entry = await StockHistory.create(
      { ProductId, type, quantity, reason },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      message: "Stock history created and inventory updated",
      entry,
      inventory,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Failed to create stock history",
      error: error.message,
    });
  }
};

const logStockChange = async (ProductId, quantity, changeType, userId) => {
  const transaction = await StockHistory.sequelize.transaction();

  try {
    // Ensure valid changeType (in, out, adjust)
    if (!["in", "out", "adjust"].includes(changeType)) {
      throw new Error(
        "Invalid changeType. It must be 'in', 'out', or 'adjust'."
      );
    }

    // Retrieve the product and user
    const product = await Product.findByPk(ProductId);
    if (!product) throw new Error("Product not found");

    const user = await Users.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Retrieve or create Inventory record
    let inventory = await Inventory.findOne({ where: { ProductId } });

    if (!inventory) {
      inventory = await Inventory.create(
        { ProductId, quantity: 0, alert_quantity: 5 },
        { transaction }
      );
    }

    // Handle inventory changes based on changeType
    if (changeType === "in") {
      inventory.quantity += quantity; // Adding stock (restock)
    } else if (changeType === "out") {
      if (inventory.quantity < quantity) {
        throw new Error("Not enough stock to remove");
      }
      inventory.quantity -= quantity; // Removing stock (sale)
    } else if (changeType === "adjust") {
      inventory.quantity = quantity; // Adjust stock to a specific value
    }

    // Save the updated inventory record
    await inventory.save({ transaction });

    // Log the stock change in the StockHistory table
    await StockHistory.create(
      {
        ProductId,
        UserId: user.id,
        quantity,
        type: changeType, // 'in', 'out', or 'adjust'
        reason: changeType, // Can be expanded with custom reason
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();
    console.log("Stock change logged successfully");
  } catch (error) {
    // Rollback transaction if any error occurs
    await transaction.rollback();
    console.error("Error logging stock change:", error.message);
    throw error;
  }
};

// Create or Update Stock (POST /update)
exports.updateStock = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity, type } = req.body;

  try {
    // Validate input
    if (!productId || !quantity || !type || !userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Log the stock change
    await logStockChange(productId, quantity, type, userId);

    res.status(200).json({ message: "Stock updated and logged successfully" });
  } catch (error) {
    res.status(500).json({ message: `Error updating stock: ${error.message}` });
  }
};

// Get Stock History (GET /history)
exports.getStockHistory = async (req, res) => {
  try {
    const stockHistory = await StockHistory.findAll({
      include: [
        { model: Product, attributes: ["name", "sku"] },
        { model: Users, attributes: ["email"] },
      ],
    });
    res.status(200).json(stockHistory);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching stock history: ${error.message}` });
  }
};
