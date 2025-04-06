const express = require("express");
const router = express.Router();
const ReportsController = require("../controllers/report");

router.get("/reports/sales", ReportsController.generateSalesReport);
router.get("/reports/inventory", ReportsController.generateInventoryReport);
router.get("/reports/expenses", ReportsController.generateExpenseReport);
router.get("/reports/profit", ReportsController.generateProfitReport);
router.get("/reports/stock-history", ReportsController.generateStockHistoryReport);

module.exports = router;
