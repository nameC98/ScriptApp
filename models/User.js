// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    admin: { type: Boolean, default: false, select: false },
    subscriptionStatus: { type: String, default: "inactive" }, // active/inactive
    tokens: { type: Number, default: 100 },
    usedScripts: { type: [String], default: [] },
    // New fields to track plan activation and deactivation dates:
    planActivatedAt: { type: Date, default: null },
    planDeactivatedAt: { type: Date, default: null },
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", userSchema);
export default User;
