import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure file extension is included

const router = express.Router(); // Declare router first

// Register new user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, passwordHash: password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Registration failed. Email might already be in use." });
  }
});

router.post("/logout", (req, res) => {
  // On the client side, you'll remove the token.
  res.json({ message: "Logged out successfully" });
});

// Login user
// In your login endpoint (routes/auth.js)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log(user);

    // Return both token and userId
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
