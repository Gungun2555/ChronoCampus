import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

const db = mongoose.connection.db;

// Collections to fix and the replacements to make
const replacements = [
  { from: "CSE AI & DS", to: "AIDS" },
  { from: "CSE AI&DS",   to: "AIDS" },
  { from: "cse aids",    to: "AIDS" },
  { from: "CSE AIDS",    to: "AIDS" },
];

const collections = ["courses", "faculties", "users", "timetables"];

for (const col of collections) {
  for (const { from, to } of replacements) {
    const result = await db.collection(col).updateMany(
      { department: from },
      { $set: { department: to } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[${col}] "${from}" → "${to}" : ${result.modifiedCount} updated`);
    }
  }
}

// Also fix timetable.schedule entries (department is on the timetable doc itself, already covered above)
// Fix timetable name field if it contains old dept name
for (const { from, to } of replacements) {
  const result = await db.collection("timetables").updateMany(
    { name: { $regex: from, $options: "i" } },
    [{ $set: { name: { $replaceAll: { input: "$name", find: from, replacement: to } } } }]
  );
  if (result.modifiedCount > 0) {
    console.log(`[timetables.name] "${from}" → "${to}" : ${result.modifiedCount} updated`);
  }
}

console.log("Done.");
await mongoose.disconnect();
process.exit(0);
