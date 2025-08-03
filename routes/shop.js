const express = require("express");

const path = require("path");

const router = express.Router();

const rootDir = require("../utils/path");
const adminData = require("./admin");

router.get("/", (req, res, next) => {
  console.log(adminData?.products, "products");
  // res.sendFile(path.join(rootDir, "views", "shop.html"));
  const products = adminData?.products;
  res.render("shop", {
    pageTitle: "Shop",
    activePage: "shop",
    extraCss: ["/css/product.css"],
    prods: products,
    docTitle: "Shop",
  });
});

module.exports = router;
