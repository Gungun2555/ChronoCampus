import mongoose from "mongoose";
import dotenv from "dotenv";
import Timetable from "../models/Timetable.js";
import dbConnect from "../utils/dbConnect.js";

dotenv.config({ quiet: true });

async function publishTimetables() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Find all draft timetables
    const draftTimetables = await Timetable.find({ status: "draft" });
    console.log(`Found ${draftTimetables.length} draft timetables`);

    if (draftTimetables.length === 0) {
      console.log("No draft timetables to publish");
      process.exit(0);
    }

    // Update all draft timetables to published
    const result = await Timetable.updateMany(
      { status: "draft" },
      { status: "published" }
    );

    console.log(`✓ Published ${result.modifiedCount} timetables`);
    console.log("Timetables are now visible to students");

    process.exit(0);
  } catch (error) {
    console.error("Error publishing timetables:", error);
    process.exit(1);
  }
}

publishTimetables();
