const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");

// Create a new product
router.post("/products", productController.createProduct);

// Get all products
router.get("/products", productController.getProducts);

// Get product by SKU (barcode)
// router.get("/products/sku/:sku", productController.getProductBySku);

// Update product
router.put("/products/:id", productController.updateProduct);

// Delete product
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
