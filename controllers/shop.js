const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_PVT_KEY.trim());

const ITEMS_PER_PAGE = 10;

// ---------------- Products ----------------

// GET /api/products?page=1&title=phone&minPrice=100&maxPrice=500
exports.getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const { title, minPrice, maxPrice } = req.query;

    let filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const totalItems = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/products/:productId
exports.getProduct = async (req, res) => {
  console.log(req.params.productId);
  try {
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Not Found" });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------- Cart ----------------

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.filter((item) => item.productId);

    const totalPrice = products.reduce(
      (sum, item) => sum + item.quantity * item.productId.price,
      0
    );

    res.status(200).json({ success: true, products, totalPrice });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    await req.user.addToCart(product);
    res.status(201).json({ success: true, message: "Added to cart" });
  } catch (err) {
    // console.error("Error adding to cart:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// PUT /api/cart/:itemId (update quantity)
// exports.updateCartItem = async (req, res) => {
//   try {
//     const { quantity } = req.body;
//     await req.user.updateCartItem(req.params.itemId, quantity);
//     res.status(200).json({ success: true, message: "Cart updated" });
//   } catch (err) {
//     console.error("Error updating cart item:", err);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// DELETE /api/cart/:itemId
exports.deleteCartItem = async (req, res) => {
  try {
    await req.user.removeFromCart(req.params.itemId);
    res.status(200).json({ success: true, message: "Item removed" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---------------- Orders ----------------

// GET /api/orders?page=1
exports.getOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const ITEMS_PER_PAGE = 5;

    const totalItems = await Order.countDocuments({
      "user.userId": req.userId,
    });
    const orders = await Order.find({ "user.userId": req.userId })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    if (!user.cart.items.length)
      return res.status(400).json({ success: false, message: "Cart empty" });

    const products = user.cart.items.map((i) => ({
      quantity: i.quantity,
      product: { ...i.productId._doc },
    }));

    const order = new Order({
      user: { name: req.user.name, userId: req.userId },
      products,
    });

    await order.save();
    await req.user.clearCart();

    res.status(201).json({ success: true, message: "Order created", order });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/orders/:orderId/invoice
exports.getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "No order found" });
    if (order.user.userId.toString() !== req.userId.toString())
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const invoiceName = `invoice-${order._id}.pdf`;
    const invoicePath = path.join("data", "invoices", invoiceName);

    const pdfDoc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text("Invoice", { align: "center" });
    pdfDoc.text(`Order ID: ${order._id}`);
    pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`);
    pdfDoc.moveDown();

    let totalPrice = 0;
    order.products.forEach((prod) => {
      const productTotal = prod.quantity * prod.product.price;
      totalPrice += productTotal;
      pdfDoc.text(
        `${prod.product.title} - ${prod.quantity} x $${prod.product.price} = $${productTotal}`
      );
    });

    pdfDoc.text(`\nTotal Price: $${totalPrice}`);
    pdfDoc.end();
  } catch (err) {
    console.error("Error generating invoice:", err);
    next(err);
  }
};

// ---------------- Checkout (Stripe) ----------------

// POST /api/checkout
exports.createCheckoutSession = async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.filter((item) => item.productId);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((p) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: p.productId.title,
            description: p.productId.description,
          },
          unit_amount: p.productId.price * 100,
        },
        quantity: p.quantity,
      })),
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/api/checkout/success`,
      cancel_url: `${req.protocol}://${req.get("host")}/api/checkout/cancel`,
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/checkout/success
exports.getCheckoutSuccess = (req, res) => {
  res.status(200).json({ success: true, message: "Payment Successful" });
};

// GET /api/checkout/cancel
exports.getCheckoutCancel = (req, res) => {
  res.status(200).json({ success: false, message: "Payment Cancelled" });
};
