import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

const email = "admin@piet.com";
const newPassword = "admin123";  // <-- change this to whatever you want
const name = "Center Head";

await mongoose.connect(process.env.MONGO_URI);

// Hash the password manually to bypass any pre-save hook issues
const hashedPassword = await bcrypt.hash(newPassword, 10);

const existing = await User.findOne({ email });
if (existing) {
  console.log("User found. Force-updating password...");
  await User.updateOne(
    { email },
    {
      $set: {
        password: hashedPassword,
        role: "super_admin",
        department: null,
        isActive: true,
        name,
      }
    }
  );
  console.log(`Done. Password reset for ${email}`);
} else {
  const user = new User({ name, email, password: newPassword, role: "super_admin", department: null });
  await user.save();
  console.log("Super admin created successfully.");
}

await mongoose.disconnect();
process.exit(0);
