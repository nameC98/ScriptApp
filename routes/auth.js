import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Ensure file extension is included

const router = express.Router(); // Declare router first

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

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Assume token payload contains the user id as `id`
      next();
    } catch (err) {
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ error: "No token provided" });
  }
};

// GET /api/users/me - Get current user details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Use req.user.userId from the token payload
    const user = await User.findById(req.user.userId).select("+admin");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      tokens: user.tokens,
      subscriptionStatus: user.subscriptionStatus, // Added this field
      admin: user.admin,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Forgot Password – generate a reset token and (in production) email it to the user
// POST: Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, you might return a generic message.
      return res.status(404).json({ error: "No user found with that email" });
    }
    // Generate a reset token valid for 15 minutes
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    // In production, send resetToken via email.
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
// POST: Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }
    // Verify the token; note that the payload contains { userId: ... }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update password (the pre-save hook will hash it)
    user.passwordHash = newPassword;
    await user.save();
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
