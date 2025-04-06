const db = require("../models");
const Category = db.Category;

// Create a new Category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: "Error creating category", error: err });
  }
};

// Get all Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories", error: err });
  }
};

// Get a Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ message: "Error fetching category", error: err });
  }
};

// Update a Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    await category.save();
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ message: "Error updating category", error: err });
  }
};

// Delete a Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting category", error: err });
  }
};
