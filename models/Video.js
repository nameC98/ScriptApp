import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    views: { type: Number, required: true },
    likes: { type: Number, required: true },
    uploadDate: { type: Date, required: true },
    channelSubscribers: { type: Number, required: true },
    niche: { type: String, required: true },
    rank: { type: String, enum: ["Excellent", "Very Good", "Good"] },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Video = mongoose.model("Video", videoSchema);

export default Video;
