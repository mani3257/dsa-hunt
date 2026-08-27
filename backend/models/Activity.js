const mongoose = require("mongoose");

// One document per (user, calendar day) where the user solved at least one
// problem. Kept deliberately separate from Progress so streak/heatmap reads
// stay cheap regardless of how many problems exist.
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // "YYYY-MM-DD", UTC-based for consistency across a single deployment.
    date: { type: String, required: true },
    count: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Activity", activitySchema);
