const express = require("express");

const path = require("path");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/delete-product", adminController.postDeleteProduct);
router.get("/edit-product", adminController.getAddProduct);
router.post("/edit-product", adminController.postEditProduct);
router.post("/add-product", adminController.postAddProduct);

router.get("/products", adminController.getProducts);

module.exports = router;
