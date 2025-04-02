// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const user = new User({ name, email, passwordHash: password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    // Return token and userId (you may include more if needed)
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Registration failed. Email might already be in use." });
  }
});

// Login user
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

    // Return both token and userId
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Authentication middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Payload contains { userId: ... }
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "No token provided" });
  }
};

// GET /me - Get current user details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("+admin");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      tokens: user.tokens,
      subscriptionStatus: user.subscriptionStatus,
      admin: user.admin,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ADMIN ROUTE: GET /admin/dashboard - Only accessible by admin users
router.get("/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  // Admin-specific logic here
  res.json({ message: "Welcome to the admin dashboard" });
});

// POST: Forgot Password – generate a reset token and (in production) email it to the user
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user found with that email" });
    }
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    res.json({
      message: "A reset link has been sent to your email.",
      resetToken,
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Reset Password – verify token and update the user's password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
