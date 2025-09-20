const express = require("express");
const router = express.Router();

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const stripe = require("stripe")(process.env.STRIPE_PVT_KEY.trim());

// ---------------- Products ----------------
router.get("/products", shopController.getProducts);        // Get all products
router.get("/products/:productId", shopController.getProduct); // Get single product

// ---------------- Cart ----------------
router.get("/cart", isAuth, shopController.getCart);        // Get cart
router.post("/cart", isAuth, shopController.addToCart);     // Add to cart
router.put("/cart/:itemId", isAuth, shopController.updateCartItem); // Update item qty
router.delete("/cart/:itemId", isAuth, shopController.deleteCartItem); // Remove item

// ---------------- Checkout ----------------
router.post("/checkout", isAuth, shopController.createCheckoutSession); 
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckoutCancel);

// ---------------- Stripe Utils ----------------
router.get("/stripe/balance", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, balance });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.get("/stripe/key", (req, res) => {
  const stripeKey = process.env.STRIPE_PVT_KEY;
  res.json({
    keyExists: !!stripeKey,
    keyLength: stripeKey ? stripeKey.length : 0,
    keyPrefix: stripeKey ? stripeKey.substring(0, 8) : "none",
    keyEndsWith: stripeKey ? stripeKey.substring(stripeKey.length - 4) : "none",
    nodeEnv: process.env.NODE_ENV,
  });
});

// ---------------- Orders ----------------
router.post("/orders", isAuth, shopController.createOrder); // Create new order
router.get("/orders", isAuth, shopController.getOrders);    // Get all orders
// router.get("/orders/:orderId", isAuth, shopController.getOrder); // Get order by ID (invoice, details)

module.exports = router;
