// admin.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// CREATE product
router.post("/products", isAuth, adminController.postAddProduct);

// READ all products
router.get("/products", isAuth, adminController.getProducts);

// READ single product
router.get("/products/:productId", isAuth, adminController.getProduct);

// UPDATE product
router.put("/products/:productId", isAuth, adminController.postEditProduct);

// DELETE product
router.delete(
  "/products/:productId",
  isAuth,
  adminController.postDeleteProduct
);

module.exports = router;
