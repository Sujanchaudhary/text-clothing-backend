// backend/controllers/saleController.js

const {
  Sale,
  SaleItem,
  Inventory,
  StockHistory,
  Category,
  Product,
} = require("../models");

exports.createSale = async (req, res) => {
  const t = await Sale.sequelize.transaction(); // Start transaction

  try {
    const userId = req.user.id; // Assuming user is authenticated
    const { items, total, payment_type } = req.body;

    if (!total || !payment_type || !items || !items.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Create Sale
    const sale = await Sale.create(
      {
        UserId: userId,
        total,
        payment_type,
      },
      { transaction: t }
    );

    // 2. Create SaleItems and Deduct Inventory
    const saleItems = await Promise.all(
      items.map(async (item) => {
        // Create SaleItem
        const saleItem = await SaleItem.create(
          {
            SaleId: sale.id,
            ProductId: item.ProductId,
            quantity: item.quantity,
            selling_price: item.selling_price,
            total: item.quantity * item.selling_price,
          },
          { transaction: t }
        );

        // Deduct inventory
        const inventory = await Inventory.findOne(
          { where: { ProductId: item.ProductId } },
          { transaction: t }
        );

        if (!inventory) {
          throw new Error(
            `No inventory found for Product ID ${item.ProductId}`
          );
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(`Not enough stock for Product ID ${item.ProductId}`);
        }

        // Update inventory quantity
        inventory.quantity -= item.quantity;
        await inventory.save({ transaction: t });

        // Log stock history
        await StockHistory.create(
          {
            UserId: userId,
            ProductId: item.ProductId,
            type: "out",
            quantity: item.quantity,
            reason: "sale",
          },
          { transaction: t }
        );

        return saleItem;
      })
    );

    await t.commit();

    res.status(201).json({
      message: "Sale created successfully",
      sale,
      items: saleItems,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating sale", error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [
        {
          model: SaleItem,
          as: "items",
          include: {
            model: Product,
            include: {
              model: Category,
            },
          },
        },
      ],
    });
    res.status(200).json(sales);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sales", error: error.message });
  }
};

exports.getSale = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findOne({
      where: { id },
      include: [{ model: SaleItem, as: "items" }],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.status(200).json(sale);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sale", error: error.message });
  }
};

exports.updateSale = async (req, res) => {
  const { id } = req.params;
  const { total, overall_discount, payment_type } = req.body;

  try {
    const sale = await Sale.findByPk(id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    sale.total = total !== undefined ? total : sale.total;
    sale.overall_discount =
      overall_discount !== undefined ? overall_discount : sale.overall_discount;
    sale.payment_type = payment_type || sale.payment_type;

    await sale.save();

    res.status(200).json({ message: "Sale updated successfully", sale });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating sale", error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  const { id } = req.params;
  try {
    const sale = await Sale.findByPk(id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // This will cascade delete SaleItems if configured in Sequelize
    await sale.destroy();

    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting sale", error: error.message });
  }
};
