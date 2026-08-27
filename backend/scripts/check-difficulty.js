// One-off diagnostic: checks what difficulty values are ACTUALLY stored in
// your MongoDB for neetcode150, so we know for certain whether this is a
// data problem or a query problem. Safe — read-only, changes nothing.
//
// Run from the backend folder:  node scripts/check-difficulty.js

require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  const total = await Problem.countDocuments({
    placements: { $elemMatch: { sheet: "neetcode150" } },
  });
  console.log(`Problems placed in neetcode150: ${total}`);

  const byDifficulty = await Problem.aggregate([
    { $match: { placements: { $elemMatch: { sheet: "neetcode150" } } } },
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
  ]);
  console.log("\nBreakdown by stored `difficulty` value:");
  console.table(byDifficulty);

  const sample = await Problem.findOne({
    placements: { $elemMatch: { sheet: "neetcode150" } },
    difficulty: "Easy",
  }).lean();
  console.log("\nDirect query for one Easy problem in neetcode150:");
  console.log(sample ? { title: sample.title, difficulty: sample.difficulty } : "NONE FOUND");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Diagnostic failed:", err);
  process.exit(1);
});
