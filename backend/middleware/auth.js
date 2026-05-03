import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "chrono_campus_secret_key";

// Attach user to req if token is valid
export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Role-based guard — pass allowed roles
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// Department guard — admin can only touch their own department's data
// super_admin bypasses this check
export function ownDepartment(req, res, next) {
  if (req.user.role === "super_admin") return next();
  const dept =
    req.body.department ||
    req.query.department ||
    req.params.department;
  if (dept && req.user.department !== dept) {
    return res.status(403).json({ error: "Access denied for this department" });
  }
  next();
}

export function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, department: user.department },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
