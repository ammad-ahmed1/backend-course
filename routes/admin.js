// admin.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

// Add Product form
router.get("/edit-product", adminController.getAddProduct);

// Edit Product form
router.get("/edit-product/:productId", adminController.getEditProduct);

// Handle Add Product
router.post("/add-product", adminController.postAddProduct);

// Handle Edit Product
router.post("/edit-product", adminController.postEditProduct);

// Delete Product
router.post("/delete-product", adminController.postDeleteProduct);

// Admin Products list
router.get("/products", adminController.getProducts);

module.exports = router;
