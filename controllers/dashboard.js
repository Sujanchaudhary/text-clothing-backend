const { Sale, SaleItem, Expense, Inventory, Product, Sequelize } = require("../models");
const { Op, fn, col, literal } = Sequelize;

const getDashboardData = async (req, res) => {
  try {
    // Total Sales & Orders
    const salesSummary = await Sale.findOne({
      attributes: [
        [fn("SUM", col("total")), "totalSales"],
        [fn("COUNT", col("id")), "totalOrders"],
      ],
      raw: true,
    });

    // Total Expenses
    const expenseSummary = await Expense.findOne({
      attributes: [
        [fn("SUM", col("amount")), "totalExpenses"],
        [fn("COUNT", col("id")), "totalExpenseCount"],
      ],
      raw: true,
    });

    // Inventory Summary
    const inventorySummary = await Inventory.findOne({
      attributes: [
        [fn("SUM", col("quantity")), "totalInventoryQuantity"],
      ],
      raw: true,
    });

    // Total Products
    const totalProducts = await Product.count();

    // Low Stock Products (quantity < alert_quantity)
    const lowStock = await Inventory.findAll({
      where: {
        quantity: {
          [Op.lt]: col("alert_quantity"),
        },
      },
      include: {
        model: Product,
        attributes: ["name", "image", "sku"],
      },
    });

    // Top Selling Products
    const topSellingRaw = await SaleItem.findAll({
      attributes: [
        "ProductId",
        [fn("SUM", col("quantity")), "totalSold"],
        [fn("SUM", Sequelize.literal("quantity * selling_price")), "totalRevenue"], // Calculate total revenue
      ],
      group: ["ProductId"],
      order: [[literal("totalSold"), "DESC"]],
      limit: 5,
      raw: true,
    });

    // Enrich with Product Info and Calculate Profit
    const topSellingProducts = await Promise.all(
      topSellingRaw.map(async (item) => {
        const product = await Product.findByPk(item.ProductId, {
          attributes: ["name", "image", "sku", "cost_price"], // Make sure to include cost_price here
        });

        const totalRevenue = Number(item.totalRevenue);
        const totalCost = product ? product.cost_price * item.totalSold : 0;
        const profit = totalRevenue - totalCost; // Profit = Revenue - Cost

        return {
          productId: item.ProductId,
          name: product?.name || "Unknown",
          sku: product?.sku || "-",
          sold: Number(item.totalSold),
          image: product?.image || null,
          revenue: totalRevenue,
          cost: totalCost,
          profit,
        };
      })
    );

    // Monthly Revenue Chart
    const monthlySales = await Sale.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("SUM", col("total")), "total"],
      ],
      group: ["month"],
      order: [[literal("month"), "ASC"]],
      raw: true,
    });

    const revenueChart = {
      labels: monthlySales.map((m) => m.month),
      data: monthlySales.map((m) => Number(m.total)),
    };

    // Calculate total profit from all sales
    const totalProfit = await SaleItem.findAll({
      attributes: [
        [fn("SUM", Sequelize.literal("quantity * (selling_price - Product.cost_price)")), "totalProfit"]
      ],
      include: [
        {
          model: Product,
          attributes: ["cost_price"], // Make sure to include cost_price here
        },
      ],
      raw: true,
    });
    console.log(totalProfit)

    return res.json({
      success: true,
      data: {
        sales: {
          totalSales: Number(salesSummary.totalSales || 0),
          totalOrders: Number(salesSummary.totalOrders || 0),
        },
        expenses: {
          totalExpenses: Number(expenseSummary.totalExpenses || 0),
          totalExpenseCount: Number(expenseSummary.totalExpenseCount || 0),
        },
        inventory: {
          totalQuantity: Number(inventorySummary.totalInventoryQuantity || 0),
          totalProducts,
          lowStock,
        },
        topSellingProducts,
        revenueChart,
        totalProfit: totalProfit[0]?.totalProfit || 0, // Total profit from all sales
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getDashboardData,
};
