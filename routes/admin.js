const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// CREATE product
router.post("/product", isAuth, adminController.postAddProduct);

// READ ALL with filters products
router.get("/products", isAuth, adminController.getProducts);

// single product by id
router.get("/product/:productId", isAuth, adminController.getProduct);

// UPDATE product
router.put("/product/:productId", isAuth, adminController.postEditProduct);

// DELETE product
router.delete("/product/:productId", isAuth, adminController.postDeleteProduct);

module.exports = router;
