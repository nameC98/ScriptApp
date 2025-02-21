import express from "express";
import User from "../models/User.js"; // Ensure file extension is included

const router = express.Router(); // Declare router first

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
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
