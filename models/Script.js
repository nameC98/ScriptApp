import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.isAdmin;
      },
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    niche: { type: String, required: true },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prompt",
      },
    ],
    style: {
      type: String,
      required: function () {
        return !this.isAdmin;
      },
    },
    snippet: { type: String },
    status: {
      type: String,
      enum: ["used", "unused", "published"],
      default: "unused",
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Script = mongoose.model("Script", scriptSchema);
export default Script;
