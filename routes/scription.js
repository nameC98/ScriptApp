import express from "express";
import User from "../models/User.js"; // Ensure file extension is included
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router(); // Declare router first
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});
console.log("BASE_URL:", process.env.BASE_URL);

// Activate subscription: sets status to active and resets tokens
router.post("/start", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.subscriptionStatus = "active";
    user.tokens = 100; // Reset tokens for the month
    await user.save();
    res.json({ message: "Subscription activated", tokens: user.tokens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Check subscription status and token balance
// router.get("/status", async (req, res) => {
//   const { userId } = req.query;
//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({
//       subscriptionStatus: user.subscriptionStatus,
//       tokens: user.tokens,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.post("/create-checkout-session", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1Qv47FPuR3eEqU54EmiHznxe", // Replace with your Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
      customer_email: user.email,
    });

    console.log("Created checkout session:", session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});
/**
 * NEW ENDPOINT:
 * Create a one-time payment session to boost tokens (only for active subscribers).
 */
router.post("/boost-tokens", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure user is on an active subscription before boosting tokens
    if (user.subscriptionStatus !== "active") {
      return res
        .status(400)
        .json({ error: "Subscription not active. Cannot boost tokens." });
    }

    // Create a one-time payment session for token boost
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          // Replace with your actual Stripe Price ID for the token boost
          price: "price_1Qv6JTPuR3eEqU54WWrRz9mp",
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5173",
      cancel_url: `${process.env.CLIENT_URL}/boost-cancel`,
      customer_email: user.email,
    });

    console.log("Created boost tokens checkout session:", session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating boost tokens session:", error);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

/**
 * Webhook endpoint to listen for Stripe events.
 * This example handles the successful checkout session event.
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("Received Stripe event:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Find the user by email
      const user = await User.findOne({ email: session.customer_email });
      if (!user) {
        console.warn(`No user found with email: ${session.customer_email}`);
        return res.json({ received: true });
      }

      // Check if this was a subscription or a one-time payment
      if (session.mode === "subscription") {
        // This is the monthly subscription
        user.subscriptionStatus = "active";
        user.tokens = 100;
        await user.save();
        console.log(`Subscription activated for user: ${user.email}`);
      } else if (session.mode === "payment") {
        // This is a one-time token boost
        // You can decide how many tokens to add per boost
        const BOOST_AMOUNT = 50;
        user.tokens += BOOST_AMOUNT;
        await user.save();
        console.log(`Boosted tokens for user: ${user.email}`);
      }
    } else if (event.type === "invoice.payment_failed") {
      console.log("Payment failed for an invoice.");
      // Optionally update user subscription status here.
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Check subscription status and token balance
router.get("/status", async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      subscriptionStatus: user.subscriptionStatus,
      tokens: user.tokens,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * Endpoint to check subscription status and token balance.
 */
router.get("/status", async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      subscriptionStatus: user.subscriptionStatus,
      tokens: user.tokens,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
