// admin.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// Add Product form
router.get("/edit-product", isAuth, adminController.getAddProduct);

// Edit Product form
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// Handle Add Product
router.post("/add-product", isAuth, adminController.postAddProduct);

// Handle Edit Product
router.post("/edit-product", isAuth, adminController.postEditProduct);

// Delete Product
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

// Admin Products list
router.get("/products", isAuth, adminController.getProducts);

module.exports = router;
