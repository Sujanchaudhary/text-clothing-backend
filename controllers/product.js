const { Product, Category, Inventory, Unit } = require("../models");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      color,
      size,
      cost_price,
      mrp,
      categoryId,
      inventoryData,
    } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const product = await Product.create({
      name,
      sku,
      color,
      size,
      cost_price,
      mrp,
      CategoryId: category.id,
    });

    const inventory = await Inventory.create(inventoryData);
    await product.setInventory(inventory); // Link product with inventory
    const productWithInventory = {
      ...product.get(), // Get the product data
      inventoryData: inventory.get(), // Add inventory data inside product object
    };

    return res.status(201).json(productWithInventory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category },
        {
          model: Inventory,
          include: {
            model: Unit,
          },
        },
      ],
    });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get Product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Inventory }],
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      color,
      size,
      cost_price,
      mrp,
      categoryId,
      inventoryData,
    } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.color = color || product.color;
    product.size = size || product.size;
    product.cost_price = cost_price || product.cost_price;
    product.mrp = mrp || product.mrp;

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
      product.CategoryId = category.id;
    }

    await product.save();

    if (inventoryData) {
      const inventory = await Inventory.findByPk(product.InventoryId);
      inventory.update(inventoryData);
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Product along with its Inventory
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: Inventory, // include Inventory relation
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If product has associated inventory, delete it
    if (product.Inventory) {
      await product.Inventory.destroy();
    }

    // Delete the product
    await product.destroy();

    return res
      .status(200)
      .json({ message: "Product and its inventory deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
