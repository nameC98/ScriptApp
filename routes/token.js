import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Purchase additional tokens (simulate a token purchase)
router.post("/purchase", async (req, res) => {
  const { userId, tokensToAdd } = req.body;

  if (!userId || !tokensToAdd) {
    return res.status(400).json({ error: "Missing userId or tokensToAdd" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Add tokens and save
    user.tokens += tokensToAdd;
    await user.save();

    res.json({ message: "Tokens purchased successfully", tokens: user.tokens });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error purchasing tokens" });
  }
});

export default router;
