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
exports.getProduct = (req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "shop.html"));
  console.log("I am called.........1", req.params);
  const prodId = req.params.productId;
  console.log(prodId);
  Product.findById(prodId, (product) => {
    console.log(product);
    res.render("shop/product-details", {
      product: product,
      pageTitle: "Product Detail",
      path: "/",
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/product-details", {
      prods: products,
      pageTitle: "Shop",
      path: "/products",
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
      extraCss: ["/css/checkout.css", "/css/forms.css"],
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
