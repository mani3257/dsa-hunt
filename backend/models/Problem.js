const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema(
  {
    sheet: {
      type: String,
      enum: ["neetcode150", "blind75", "neetcode250", "striverA2Z", "striver79"],
      required: true,
    },
    category: { type: String, required: true, trim: true },
    pattern: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    canonicalKey: { type: String, required: true, unique: true, trim: true },
    link: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Unknown"],
      required: true,
    },

    // One canonical problem can occur in multiple sheets/categories.
    // Every occurrence is represented by one placement.
    placements: {
      type: [placementSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "A problem must have at least one sheet placement",
      },
    },

    // Kept for compatibility with older code. The first placement is used.
    category: { type: String, required: true, trim: true },
    pattern: { type: String, required: true, trim: true },
    sheets: {
      type: [String],
      enum: ["neetcode150", "blind75", "neetcode250", "striverA2Z", "striver79"],
      required: true,
    },
  },
  { timestamps: true }
);

problemSchema.index({ "placements.sheet": 1, "placements.category": 1, "placements.order": 1 });
problemSchema.index({ title: "text", canonicalKey: "text" });

module.exports = mongoose.model("Problem", problemSchema);
