import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DEPARTMENTS = [
  "AIDS", "AIML", "IT", "Mechanical", "Textile", "Cybersecurity", "CSE Core", "CSE AI & DS"
];

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "teacher", "student"],
      required: true,
    },
    // For admin/teacher/student — which department they belong to
    department: {
      type: String,
      enum: [...DEPARTMENTS, null],
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
export { DEPARTMENTS };
