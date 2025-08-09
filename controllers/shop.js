const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        prods: rows,
        pageTitle: "Shop",
        path: "/",
        extraCss: ["/css/product.css"],
      });
    })
    .catch((err) => console.log(err));
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(([product]) => {
      res.render("shop/product-details", {
        product: product[0],
        pageTitle: "Shop",
        path: "/products",
        extraCss: ["/css/product-details.css"],
      });
    })
    .catch((err) => {
      console.log(err);
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
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartItems = [];

      for (const cartProd of cart.products) {
        const product = products.find((prod) => prod.id === cartProd.id);
        if (product) {
          cartItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.imageUrl,
            quantity: cartProd.qty,
          });
        }
      }

      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        cartItems,
        cartTotal: total.toFixed(2),
        extraCss: ["/css/cart.css"],
      });
    });
  });
};
exports.postCart = (req, res, next) => {
  console.log("I am called");
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/shop/cart");
};
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/shop/cart");
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
