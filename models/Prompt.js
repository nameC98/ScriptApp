import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
  niche: { type: String, required: true },
  style: { type: String, required: true },
  promptTemplate: { type: String, required: true },
});

const Prompt = mongoose.model("Prompt", promptSchema);
export default Prompt;
