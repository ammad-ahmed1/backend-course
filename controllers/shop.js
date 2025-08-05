const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "shop.html"));
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      activePage: "shop",
      extraCss: ["/css/product.css"],
      docTitle: "Shop",
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/cart", {
      pageTitle: "Your Cart",
      path: "/cart",
      extraCss: ["/css/cart.css"],
    });
  });
};
exports.getCheckout = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/checkout", {
      pageTitle: "Checkout",
      path: "/checkout",
      extraCss: ["/css/checkout.css"],
    });
  });
};
exports.getOrders = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/orders", {
      pageTitle: "Your Orders",
      path: "/orders",
      extraCss: ["/css/orders.css"],
    });
  });
};
