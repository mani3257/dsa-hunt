const mongoose = require("mongoose");

// One active study plan per user. Distributes a sheet's (or selected
// categories') problems evenly across a chosen number of days, starting
// from a chosen date — similar to Apna College's goal calendar.
const goalPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    sheet: { type: String, required: true },
    // Empty array = every category in the sheet.
    categories: { type: [String], default: [] },
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    totalDays: { type: Number, required: true, min: 7, max: 365 },
    level: { type: String, enum: ["Beginner", "Pro"], default: "Beginner" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoalPlan", goalPlanSchema);
