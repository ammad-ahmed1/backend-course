const Product = require("../models/product");
const Order = require("../models/order");

// GET /products
exports.getProducts = (req, res, next) => {
  Product.find()
    .populate("userId", "name")
    .then((products) => {
      res.status(200).render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        extraCss: ["/css/product.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// GET /products/:productId
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).redirect("/products"); // Not Found
      }
      res.status(200).render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        extraCss: ["/css/product-details.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// GET /
exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.status(200).render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        extraCss: ["/css/index.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// GET /cart
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      res.status(200).render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        extraCss: ["/css/cart.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// POST /cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).redirect("/products");
      }
      return req.user.addToCart(product);
    })
    .then(() => {
      res.status(201).redirect("/shop/cart"); // Created
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// DELETE /cart
exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      res.status(200).redirect("/shop/cart");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// GET /orders
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.status(200).render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        extraCss: ["/css/orders.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).redirect("/500");
    });
};

// POST /orders
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      if (!user.cart.items.length) {
        return res.status(400).redirect("/cart"); // Bad Request if cart is empty
      }

      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });

      const order = new Order({
        user: {
          name: req.session.user.name,
          userId: req.user,
        },
        products: products,
      });

      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => {
      console.log("Order placed successfully!");
      res.status(201).redirect("/shop/orders"); // Created
    })
    .catch((err) => {
      console.error("Error placing order:", err);
      res.status(500).redirect("/500");
    });
};
