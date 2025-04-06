const {
  Sale,
  SaleItem,
  Expense,
  Inventory,
  Product,
  Sequelize,
  StockHistory,
  Users,
} = require("../models");
const { Op, fn, col, literal } = Sequelize;

// Generate Sales Report
const generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const salesData = await Sale.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: SaleItem,
          as: "items", // Make sure the alias matches your association
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
      attributes: [
        "id",
        "total",
        "createdAt",
        [
          fn("SUM", literal("items.quantity * items.selling_price")),
          "totalSales",
        ],
        [fn("SUM", col("items.quantity")), "totalQuantity"],
      ],
      group: ["Sale.id"],
      order: [["createdAt", "DESC"]],
      // raw: true,
    });

    return res.json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Generate Inventory Report
const generateInventoryReport = async (req, res) => {
  try {
    const inventoryData = await Inventory.findAll({
      include: [
        {
          model: Product,
        },
      ],
    });

    return res.json({
      success: true,
      data: inventoryData,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Generate Expense Report
const generateExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const expenseData = await Expense.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return res.json({
      success: true,
      data: expenseData,
    });
  } catch (error) {
    console.error("Error generating expense report:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Generate Profit Report

const generateProfitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Input validation
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required parameters",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD",
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be earlier than or equal to end date",
      });
    }

    // Fetch profit data with additional metrics
    const profitData = await SaleItem.findAll({
      where: {
        createdAt: {
          [Op.between]: [start, end],
        },
      },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "sku", "cost_price", "mrp"],
          required: true,
        },
      ],
      attributes: [
        "ProductId",
        [fn("SUM", col("quantity")), "totalQuantity"],
        [fn("SUM", literal("quantity * selling_price")), "totalSales"],
        [
          fn("SUM", literal("quantity * (selling_price - Product.cost_price)")),
          "totalProfit",
        ],
        [fn("AVG", col("selling_price")), "avgSellingPrice"],
      ],
      group: [
        "ProductId",
        "Product.id",
        "Product.name",
        "Product.sku",
        "Product.cost_price",
        "Product.mrp",
      ],
      raw: true,
      nest: true,
    });

    // Format and enrich the data
    const formattedData = profitData.map((item) => {
      const totalSales = parseFloat(item.totalSales) || 0;
      const totalProfit = parseFloat(item.totalProfit) || 0;
      const totalQuantity = parseFloat(item.totalQuantity) || 0;
      const avgSellingPrice = parseFloat(item.avgSellingPrice) || 0;
      const profitMargin =
        totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      return {
        productId: item.ProductId,
        productName: item.Product.name,
        productSku: item.Product.sku,
        totalQuantity,
        totalSales,
        totalProfit,
        avgSellingPrice,
        profitMargin,
        costPrice: item.Product.cost_price,
        mrp: item.Product.mrp,
        avgProfitPerUnit: totalQuantity > 0 ? totalProfit / totalQuantity : 0,
      };
    });

    // Calculate overall summary
    const summary = {
      totalSales: formattedData.reduce((sum, item) => sum + item.totalSales, 0),
      totalProfit: formattedData.reduce(
        (sum, item) => sum + item.totalProfit,
        0
      ),
      totalItemsSold: formattedData.reduce(
        (sum, item) => sum + item.totalQuantity,
        0
      ),
      averageProfitMargin:
        (formattedData.reduce((sum, item) => sum + item.totalProfit, 0) /
          formattedData.reduce((sum, item) => sum + item.totalSales, 0)) *
          100 || 0,
    };

    return res.json({
      success: true,
      data: formattedData,
      summary,
      metadata: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        totalRecords: formattedData.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating profit report:", error);
    if (error.name === "SequelizeDatabaseError") {
      return res.status(500).json({
        success: false,
        message: "Database error occurred while generating report",
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while generating profit report",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Generate Stock History Report
const generateStockHistoryReport = async (req, res) => {
  try {
    const stockHistoryData = await StockHistory.findAll({
      include: [
        {
          model: Product,
        },
        {
          model: Users,
        },
      ],
    });

    return res.json({
      success: true,
      data: stockHistoryData,
    });
  } catch (error) {
    console.error("Error generating stock history report:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  generateSalesReport,
  generateInventoryReport,
  generateExpenseReport,
  generateProfitReport,
  generateStockHistoryReport,
};
