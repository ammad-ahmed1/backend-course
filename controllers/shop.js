const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const cleanStripeKey = process.env.STRIPE_PVT_KEY.trim();
const stripe = require("stripe")(cleanStripeKey);
const ITEMS_PER_PAGE = 2;
// GET /products
exports.getProducts = (req, res, next) => {
  const page = Number(req.query.page) || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.status(200).render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        extraCss: ["/css/product.css"],
        totalProducts: totalItems,
        page: page,
        hasPreviousPage: page > 1 ? true : false,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        previousPage: page - 1,
        nextPage: page ? page + 1 : 2,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    // .skip((page - 1) * ITEMS_PER_PAGE)
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
  const page = Number(req.query.page) || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.status(200).render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        extraCss: ["/css/product.css"],
        totalProducts: totalItems,
        page: page,
        hasPreviousPage: page > 1 ? true : false,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        previousPage: page - 1,
        nextPage: page ? page + 1 : 2,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  if (!req.user) {
    return res.redirect("/login"); // agar user session expire ho gaya ho
  }

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }

      // filter: agar product delete ho gaya ho DB se to skip kar do
      const products = user.cart.items.filter((item) => item.productId);

      // calculate total
      const totalPrice = products.reduce((sum, item) => {
        return sum + item.quantity * item.productId.price;
      }, 0);

      res.status(200).render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        totalPrice: totalPrice,
        extraCss: ["/css/cart.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error("Error fetching cart:", err);
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
  const page = Number(req.query.page) || 1;
  const ITEMS_PER_PAGE = 5; // ya jo tum chaho
  let totalItems;

  Order.find({ "user.userId": req.session.user._id })
    .countDocuments()
    .then((numOrders) => {
      totalItems = numOrders;
      return Order.find({ "user.userId": req.session.user._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((orders) => {
      res.status(200).render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

exports.getCheckoutSuccess = (req, res, next) => {
  
  res.status(200).render("shop/checkout-success", {
    path: "/checkout/success",
    pageTitle: "Payment Successful",
    // extraCss: ["/css/checkout-success.css"],
    isAuthenticated: req.session.isLoggedIn,
  });
};

// Checkout Cancel
exports.getCheckoutCancel = (req, res, next) => {
  res.status(200).render("shop/checkout-cancel", {
    path: "/checkout/cancel",
    pageTitle: "Payment Failed",
    // extraCss: ["/css/checkout-cancel.css"],
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }

      const products = user.cart.items.filter((item) => item.productId);

      // calculate total
      const totalPrice = products.reduce((sum, item) => {
        return sum + item.quantity * item.productId.price;
      }, 0);
      return stripe.checkout.sessions
        .create({
          payment_method_types: ["card"],
          line_items: products.map((p) => {
            return {
              price_data: {
                currency: "usd",
                product_data: {
                  name: p.productId.title,
                  description: p.productId.description,
                },
                unit_amount: p.productId.price * 100, // amount in cents
              },
              quantity: p.quantity,
            };
          }),
          mode: "payment",
          success_url:
            req.protocol + "://" + req.get("host") + "/shop/checkout/success",
          cancel_url:
            req.protocol + "://" + req.get("host") + "/shop/checkout/cancel",
        })
        .catch((err) => {
          console.error("Stripe session creation failed:", err);
          throw err; // rethrow so outer catch still works
        });
    })
    .then((session) => {
      res.status(200).render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: req.user.cart.items.filter((item) => item.productId), // re-use products
        totalPrice: req.user.cart.items.reduce(
          (sum, item) => sum + item.quantity * (item.productId?.price || 0),
          0
        ),
        extraCss: ["/css/checkout.css"],
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
        isAuthenticated: req.session.isLoggedIn,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.error("Error fetching cart:", err);
      res.status(500).redirect("/500");
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument({ margin: 50 });

      // 👉 Open inline (browser new tab) OR change to "attachment" for direct download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoiceName}"`
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      // ---- HEADER ----
      pdfDoc
        .fontSize(24)
        .fillColor("#333333")
        .text("🧾 Order Invoice", { align: "center" });
      pdfDoc.moveDown(0.5);
      pdfDoc
        .fontSize(12)
        .fillColor("#666666")
        .text("Invoice ID: " + orderId, { align: "center" });
      pdfDoc.text("Date: " + new Date().toLocaleDateString(), {
        align: "center",
      });
      pdfDoc.moveDown(2);

      // ---- CUSTOMER INFO ----
      pdfDoc
        .fontSize(14)
        .fillColor("#000000")
        .text("Customer Information", { underline: true });
      pdfDoc.moveDown(0.5);

      pdfDoc.fontSize(12).text(`Name: ${order.user.name}`);
      pdfDoc.text(`Email: ${order.user.email}`);
      pdfDoc.moveDown(2);

      // ---- ORDER DETAILS ----
      pdfDoc
        .fontSize(14)
        .fillColor("#000000")
        .text("Order Details", { underline: true });
      pdfDoc.moveDown(1);

      // Table-like header
      pdfDoc
        .fontSize(12)
        .fillColor("#444444")
        .text("Product", 50, pdfDoc.y, { continued: true })
        .text("Qty", 250, pdfDoc.y, { continued: true })
        .text("Price", 300, pdfDoc.y, { continued: true })
        .text("Total", 400, pdfDoc.y);

      pdfDoc.moveDown(0.5);
      pdfDoc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, pdfDoc.y)
        .lineTo(550, pdfDoc.y)
        .stroke();

      let totalPrice = 0;
      pdfDoc.moveDown(0.5);

      order.products.forEach((prod) => {
        const productTotal = prod.quantity * prod.product.price;
        totalPrice += productTotal;

        pdfDoc
          .fontSize(12)
          .fillColor("#000000")
          .text(prod.product.title, 50, pdfDoc.y, { continued: true })
          .text(prod.quantity.toString(), 250, pdfDoc.y, { continued: true })
          .text(`$${prod.product.price.toFixed(2)}`, 300, pdfDoc.y, {
            continued: true,
          })
          .text(`$${productTotal.toFixed(2)}`, 400, pdfDoc.y);

        pdfDoc.moveDown(0.5);
      });

      // ---- TOTAL ----
      pdfDoc.moveDown(1);
      pdfDoc
        .strokeColor("#000000")
        .lineWidth(1)
        .moveTo(50, pdfDoc.y)
        .lineTo(550, pdfDoc.y)
        .stroke();

      pdfDoc
        .fontSize(14)
        .fillColor("#000000")
        .text("Grand Total: $" + totalPrice.toFixed(2), 400, pdfDoc.y + 10);

      // ---- FOOTER ----
      pdfDoc.moveDown(4);
      pdfDoc
        .fontSize(10)
        .fillColor("#666666")
        .text("Thank you for your purchase!", { align: "center" });

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
