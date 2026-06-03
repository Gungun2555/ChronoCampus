import { Router } from "express";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { sendNotificationEmails } from "../utils/mailer.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

// ─── RBAC helpers ────────────────────────────────────────────────────────────

/**
 * Returns the roles a sender is allowed to target.
 * super_admin → everyone, admin, teacher, student
 * admin       → teacher, student
 * teacher     → student
 * student     → (none — cannot send)
 */
function allowedTargets(senderRole) {
  switch (senderRole) {
    case "super_admin": return ["everyone", "admin", "teacher", "student"];
    case "admin":       return ["teacher", "student"];
    case "teacher":     return ["student"];
    default:            return [];
  }
}

/**
 * Maps a targetRole to the actual DB roles that should receive the notification.
 * "everyone" expands to all roles.
 */
function targetRolesToQuery(targetRole) {
  if (targetRole === "everyone") return ["super_admin", "admin", "teacher", "student"];
  return [targetRole];
}

// ─── GET /api/notifications ───────────────────────────────────────────────────
// Each user only sees notifications addressed to them (or everyone).
notificationsRouter.get("/", async (req, res) => {
  try {
    const role = req.user.role;

    // Build the filter: notification targets this role or "everyone"
    let roleFilter;
    if (role === "super_admin") {
      roleFilter = { targetRole: { $in: ["everyone", "super_admin", "admin", "teacher", "student"] } };
    } else if (role === "admin") {
      roleFilter = { targetRole: { $in: ["everyone", "admin"] } };
    } else if (role === "teacher") {
      roleFilter = { targetRole: { $in: ["everyone", "teacher"] } };
    } else {
      roleFilter = { targetRole: { $in: ["everyone", "student"] } };
    }

    const notifications = await Notification.find(roleFilter).sort({ createdAt: -1 });

    // Attach per-user isRead flag
    const userId = req.user._id.toString();
    const result = notifications.map((n) => ({
      ...n.toObject(),
      isRead: n.readBy.some((id) => id.toString() === userId),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ─── POST /api/notifications ──────────────────────────────────────────────────
// super_admin, admin, teacher can send; students cannot.
notificationsRouter.post(
  "/",
  authorize("super_admin", "admin", "teacher"),
  async (req, res) => {
    try {
      const { title, message, type, priority, targetRole } = req.body;
      const senderRole = req.user.role;
      const allowed = allowedTargets(senderRole);

      if (!allowed.includes(targetRole)) {
        return res.status(403).json({
          error: `Your role (${senderRole}) cannot send notifications to "${targetRole}".`,
        });
      }

      const notification = new Notification({
        title,
        message,
        type,
        priority,
        targetRole,
        createdBy: {
          _id: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
      });

      await notification.save();

      // ── Send emails in the background ──────────────────────────────────────
      const recipientRoles = targetRolesToQuery(targetRole);
      User.find({ role: { $in: recipientRoles }, isActive: true })
        .select("email")
        .lean()
        .then((users) => {
          const emails = users.map((u) => u.email).filter(Boolean);
          return sendNotificationEmails(emails, {
            title,
            message,
            type,
            priority,
            senderName: req.user.name,
          });
        })
        .catch((err) => console.error("Email send error:", err));

      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  }
);

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
notificationsRouter.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      notification: {
        ...notification.toObject(),
        isRead: true,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
// super_admin can delete any; admin/teacher can only delete their own.
notificationsRouter.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const role = req.user.role;
    const isOwner = notification.createdBy?._id?.toString() === req.user._id.toString();

    if (role !== "super_admin" && !isOwner) {
      return res.status(403).json({ error: "You can only delete your own notifications." });
    }

    await notification.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// ─── GET /api/notifications/allowed-targets ───────────────────────────────────
// Returns the targetRole options available to the current user.
notificationsRouter.get("/allowed-targets", (req, res) => {
  res.json({ targets: allowedTargets(req.user.role) });
});
