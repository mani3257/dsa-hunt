const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "attempted", "solved"],
      default: "todo",
    },
    saved: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
    needsRevision: { type: Boolean, default: false },
    lastRevisedAt: { type: Date, default: null },
    revisionCount: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: "", trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
progressSchema.index({ userId: 1, status: 1 });
progressSchema.index({ userId: 1, needsRevision: 1 });
progressSchema.index({ userId: 1, saved: 1 });
progressSchema.index({ userId: 1, important: 1 });

module.exports = mongoose.model("Progress", progressSchema);
