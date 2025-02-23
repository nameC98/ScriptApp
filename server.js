import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import subscriptionRoutes from "./routes/scription.js";
import scriptRoutes from "./routes/script.js";
import tokenRoutes from "./routes/token.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// Enable CORS for frontend (http://localhost:5173)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ----------------------
// Register Webhook Route First!
// ----------------------
// This ensures that for requests to /api/subscription/webhook,
// the body is NOT pre-parsed by express.json()
app.post(
  "/api/subscription/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    // Delegate handling to the subscription router's webhook route.
    // Assuming your subscription router defines a route for /webhook,
    // we can let it handle the request.
    subscriptionRoutes.handle(req, res, next);
  }
);

// ----------------------
// Now apply JSON parser for all other routes
// ----------------------
app.use(express.json());

// Use other routes
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
