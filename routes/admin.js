// routes/admin.js
import express from "express";
import User from "../models/User.js";
import Script from "../models/Script.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET: Overview stats
router.get("/overview", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({
      subscriptionStatus: "active",
    });
    const totalScripts = await Script.countDocuments({});
    const recentSignups = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    res.json({
      totalUsers,
      activeUsers,
      totalScripts,
      recentSignups,
    });
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    res.status(500).json({ error: "Error fetching overview stats" });
  }
});

// GET: Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// PATCH: Reset tokens for a user
router.patch("/users/:id/reset-tokens", async (req, res) => {
  const { id } = req.params;
  try {
    // Set tokens to a default value (e.g., 100)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { tokens: 100 },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Tokens reset successfully", user: updatedUser });
  } catch (error) {
    console.error("Error resetting tokens:", error);
    res.status(500).json({ error: "Error resetting tokens" });
  }
});

// PATCH: Update a user's status (activate/deactivate)
// In your data model, you're using `subscriptionStatus` ("active" or "inactive")
router.patch("/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // expected "active" or "inactive"
  if (!status || (status !== "active" && status !== "inactive")) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { subscriptionStatus: status },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Error updating user status" });
  }
});

// GET: Get detailed information about a user (including related scripts)
router.get("/users/:id/details", async (req, res) => {
  const { id } = req.params;
  try {
    // Exclude sensitive fields like passwordHash
    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Optionally, fetch scripts associated with the user
    const scripts = await Script.find({ userId: id });
    res.json({ user, scripts });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Error fetching user details" });
  }
});

router.post("/users", async (req, res) => {
  const { name, email, password, subscriptionStatus, tokens } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with that email already exists" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      passwordHash,
      subscriptionStatus: subscriptionStatus || "active",
      tokens: tokens || 100,
    });
    await newUser.save();
    res.json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }
});

// DELETE: Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// PATCH: Update tokens for a user (edit tokens count)
router.patch("/users/:id/tokens", async (req, res) => {
  const { id } = req.params;
  const { tokens } = req.body;
  if (tokens === undefined) {
    return res.status(400).json({ error: "Tokens value is required" });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { tokens },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Tokens updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating tokens:", error);
    res.status(500).json({ error: "Error updating tokens" });
  }
});
// PATCH: Update user's subscription plan status
router.patch("/users/:id/plan", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || (status !== "active" && status !== "inactive")) {
    return res.status(400).json({ error: "Invalid status value" });
  }
  try {
    const updateData = { subscriptionStatus: status };
    if (status === "active") {
      updateData.planActivatedAt = new Date();
      updateData.planDeactivatedAt = null;
    } else {
      updateData.planDeactivatedAt = new Date();
    }
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User plan updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user plan:", error);
    res.status(500).json({ error: "Error updating user plan" });
  }
});

export default router;
