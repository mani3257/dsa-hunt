const express = require("express");
const Progress = require("../models/Progress");
const Problem = require("../models/Problem");
const Activity = require("../models/Activity");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { problemId, status, saved, important, needsRevision, notes } = req.body;
    if (!problemId) return res.status(400).json({ error: "problemId is required" });

    const exists = await Problem.exists({ _id: problemId });
    if (!exists) return res.status(404).json({ error: "Problem not found" });

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (saved !== undefined) updates.saved = Boolean(saved);
    if (important !== undefined) updates.important = Boolean(important);
    if (needsRevision !== undefined) updates.needsRevision = Boolean(needsRevision);
    if (notes !== undefined) updates.notes = String(notes).slice(0, 5000);

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId },
      { $set: updates, $setOnInsert: { userId: req.user._id, problemId } },
      { new: true, upsert: true, runValidators: true }
    );

    if (status === "solved") {
      const today = new Date().toISOString().slice(0, 10);
      await Activity.findOneAndUpdate(
        { userId: req.user._id, date: today },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    }

    res.json(progress);
  } catch (error) {
    console.error("Progress update error:", error);
    res.status(400).json({ error: "Unable to save progress. Check the fields you sent." });
  }
});

router.get("/", async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(progress);
  } catch (error) {
    console.error("Progress fetch error:", error);
    res.status(500).json({ error: "Unable to load progress." });
  }
});

router.get("/:problemId", async (req, res) => {
  const progress = await Progress.findOne({ userId: req.user._id, problemId: req.params.problemId });
  if (!progress) return res.status(404).json({ error: "Progress not found" });
  res.json(progress);
});

router.patch("/:problemId/revised", async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, problemId: req.params.problemId },
      {
        $set: { lastRevisedAt: new Date(), needsRevision: false },
        $inc: { revisionCount: 1 },
        $setOnInsert: { userId: req.user._id, problemId: req.params.problemId },
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(progress);
  } catch (error) {
    console.error("Mark revised error:", error);
    res.status(400).json({ error: "Unable to update revision status." });
  }
});

module.exports = router;
