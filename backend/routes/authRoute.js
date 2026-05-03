import { Router } from "express";
import User from "../models/User.js";
import { generateToken, authenticate, authorize } from "../middleware/auth.js";
import { DEPARTMENTS } from "../models/User.js";

export const authRouter = Router();

// POST /api/auth/register  (super_admin only after first setup)
authRouter.post("/register", authenticate, authorize("super_admin"), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, role are required" });
    }
    // admin/teacher/student must have a department
    if (role !== "super_admin" && !department) {
      return res.status(400).json({ error: "department is required for this role" });
    }
    const user = new User({ name, email, password, role, department: department || null });
    await user.save();
    res.status(201).json({ message: "User created", user: { _id: user._id, name, email, role, department } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (!user.isActive) return res.status(403).json({ error: "Account disabled" });
    const token = generateToken(user);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
authRouter.get("/me", authenticate, (req, res) => {
  res.json(req.user);
});

// GET /api/auth/users  (super_admin only)
authRouter.get("/users", authenticate, authorize("super_admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id  (super_admin only)
authRouter.put("/users/:id", authenticate, authorize("super_admin"), async (req, res) => {
  try {
    const { name, role, department, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, department, isActive },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id  (super_admin only)
authRouter.delete("/users/:id", authenticate, authorize("super_admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/seed  — creates the first super_admin (only works if no users exist)
authRouter.post("/seed", async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) return res.status(400).json({ error: "Users already exist. Use /register." });
    const { name, email, password } = req.body;
    const user = new User({ name, email, password, role: "super_admin", department: null });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ message: "Super admin created", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { DEPARTMENTS };
