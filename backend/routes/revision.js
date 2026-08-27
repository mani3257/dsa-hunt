const express = require("express");
const Problem = require("../models/Problem");
const Progress = require("../models/Progress");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const dueProgress = await Progress.find({ userId: req.user._id, needsRevision: true }).sort({ lastRevisedAt: 1 });
    const validDueProgress = dueProgress.filter((p) => p.problemId);
    const ids = validDueProgress.map((p) => p.problemId);
    const problems = await Problem.find({ _id: { $in: ids } }).sort({ createdAt: 1 });
    const map = Object.fromEntries(validDueProgress.map((p) => [p.problemId.toString(), p]));
    res.json(problems.map((p) => ({ ...p.toObject(), progress: map[p._id.toString()] })));
  } catch (error) {
    console.error("Revision list error:", error);
    res.status(500).json({ error: "Unable to load your revision queue." });
  }
});

router.post("/:problemId/mark-revised", async (req, res) => {
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
