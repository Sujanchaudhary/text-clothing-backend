const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense");
const { authenticate } = require("../middleware/authMiddleware");

// Routes for Expense
router.post(
  "/expenses",
  authenticate(["admin", "member"]),
  expenseController.createExpense
); // Create expense
router.get("/expenses/all", expenseController.getExpenses); // Get all expenses
router.get("/expenses/:id", expenseController.getExpense); // Get expense by ID
router.put("/expenses/:id", expenseController.updateExpense); // Update expense
router.delete("/expenses/:id", expenseController.deleteExpense); // Delete expense

module.exports = router;
