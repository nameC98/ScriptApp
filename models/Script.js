import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // Only require userId if not an admin post
        return !this.isAdmin;
      },
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    niche: { type: String, required: true },
    style: {
      type: String,
      required: function () {
        return !this.isAdmin;
      },
    },
    snippet: { type: String }, // Optional: add snippet if desired
    status: {
      type: String,
      enum: ["used", "unused", "published"], // Add "published" if needed
      default: "unused",
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Script = mongoose.model("Script", scriptSchema);
export default Script;
