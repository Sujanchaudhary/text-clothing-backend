const db = require("../models");
const Expense = db.Expense;

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, description, date } = req.body;

    const expense = await Expense.create({
      UserId: userId,
      title,
      amount,
      description,
      date,
    });

    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// Get expense by ID
exports.getExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findOne({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { title, amount, description, date } = req.body;

  try {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.title = title;
    expense.amount = amount;
    expense.description = description;
    expense.date = date;

    await expense.save();

    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.destroy();

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error });
  }
};
