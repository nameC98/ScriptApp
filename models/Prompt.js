import mongoose from "mongoose";

const promptSchema = new mongoose.Schema(
  {
    niche: { type: String, required: true },
    style: { type: String, required: true },
    promptTemplate: { type: String, required: true },
    is_admin: { type: Boolean, default: false },
    favoriteUsers: { type: [String], default: [] },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Prompt = mongoose.model("Prompt", promptSchema);
export default Prompt;
