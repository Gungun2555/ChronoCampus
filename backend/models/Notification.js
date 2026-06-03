import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    // Who sent this notification
    createdBy: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      role: String,
    },
    // Target audience: "everyone" | "admin" | "teacher" | "student"
    targetRole: {
      type: String,
      enum: ["everyone", "admin", "teacher", "student"],
      default: "everyone",
    },
    // Per-user read tracking
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Virtual: is this notification read by a given userId?
NotificationSchema.methods.isReadByUser = function (userId) {
  return this.readBy.some((id) => id.toString() === userId.toString());
};

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
