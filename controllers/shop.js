const Product = require("../models/product");

// GET /products
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        extraCss: ["/css/product.css"], // CSS added here
      });
    })
    .catch((err) => console.log(err));
};

// GET /products/:productId
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/products");
      }
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        extraCss: ["/css/product-details.css"], // CSS added here
      });
    })
    .catch((err) => console.log(err));
};

// GET /
exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        extraCss: ["/css/index.css"], // CSS added here
      });
    })
    .catch((err) => console.log(err));
};

// GET /checkout
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
    extraCss: ["/css/checkout.css", "/css/forms.css"], // CSS added here
  });
};

// GET /orders
exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
    extraCss: ["/css/orders.css"], // CSS added here
  });
};
