const Product = require("../models/product");

// GET /products
exports.getProducts = (req, res, next) => {
  Product.find()
    .populate("userId", "name")
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
  Product.find()
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

//GET /cart

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        extraCss: ["/css/cart.css"],
      });
    })
    .catch((err) => console.log(err));
};

//POST /cart

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/shop/cart");
    })
    .catch((err) => console.log(err));
};

//DELETE cart

exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteFromCart(prodId)
    .then((result) => {
      res.redirect("/shop/cart");
    })
    .catch((err) => console.log(err));
};

// GET /orders
exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
    extraCss: ["/css/orders.css"], // CSS added here
  });
};

// POST orders
exports.postOrder = (req, res, next) => {};
