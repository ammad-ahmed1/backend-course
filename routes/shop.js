const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");

const isAuth = require("../middleware/is-auth");

const cleanStripeKey = process.env.STRIPE_PVT_KEY.trim();
const stripe = require("stripe")(cleanStripeKey);

// router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
// router.get("/products/delete", shopController.deleteProduct);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postDeleteCart);
router.get("/checkout", isAuth, shopController.getCheckout);
router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);
router.get("/checkout/cancel", isAuth, shopController.getCheckoutCancel);
router.get("/test-stripe", async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ success: true, balance: balance });
  } catch (error) {
    console.error("Stripe test error:", error);
    res.json({ success: false, error: error.message });
  }
});
router.get("/stripe-key-check", (req, res) => {
  const stripeKey = process.env.STRIPE_PVT_KEY;

  res.json({
    keyExists: !!stripeKey,
    keyLength: stripeKey ? stripeKey.length : 0,
    keyPrefix: stripeKey ? stripeKey.substring(0, 8) : "none",
    keyEndsWith: stripeKey ? stripeKey.substring(stripeKey.length - 4) : "none",
    nodeEnv: process.env.NODE_ENV,
  });
});

router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders", isAuth, shopController.getOrders);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
