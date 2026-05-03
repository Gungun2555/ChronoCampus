import { Router } from "express";
import Course from "../models/course.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const coursesRouter = Router();

// All routes require authentication
coursesRouter.use(authenticate);


// GET — all roles can read
coursesRouter.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});


coursesRouter.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});


// Write operations — super_admin and admin only
coursesRouter.post("/", authorize("super_admin", "admin"), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save(); 
    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course" });
  }
});


coursesRouter.put("/:id", authorize("super_admin", "admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
});


coursesRouter.delete("/:id", authorize("super_admin", "admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
});
