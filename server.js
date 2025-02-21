import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS

import authRoutes from "./routes/auth.js";
import subscriptionRoutes from "./routes/scription.js";
import scriptRoutes from "./routes/script.js";
import tokenRoutes from "./routes/token.js";

dotenv.config();

const app = express();
app.use(express.json()); // Parse JSON bodies
// ✅ Enable CORS for frontend (http://localhost:5173)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/scripts", scriptRoutes);
app.use("/api/tokens", tokenRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
