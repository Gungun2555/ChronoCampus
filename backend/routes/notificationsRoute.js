import { Router } from "express";
import Notification from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find(); 
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});


// Create — super_admin and admin
notificationsRouter.post("/", authorize("super_admin", "admin"), async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save(); 
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});


notificationsRouter.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});


// Delete — super_admin and admin
notificationsRouter.delete("/:id", authorize("super_admin", "admin"), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});