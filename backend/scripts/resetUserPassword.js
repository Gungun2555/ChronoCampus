import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

// ---- CHANGE THESE ----
const email = "anishagrover2@gmail.com";
const newPassword = "teacher123";
// ----------------------

await mongoose.connect(process.env.MONGO_URI);

const hashed = await bcrypt.hash(newPassword, 10);
const result = await User.updateOne({ email }, { $set: { password: hashed, isActive: true } });

if (result.matchedCount === 0) {
  console.log(`No user found with email: ${email}`);
} else {
  console.log(`Password reset for ${email} → new password: ${newPassword}`);
}

await mongoose.disconnect();
process.exit(0);
