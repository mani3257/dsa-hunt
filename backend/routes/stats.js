const express = require("express");
const Problem = require("../models/Problem");
const Progress = require("../models/Progress");

const router = express.Router();
const SHEETS = ["neetcode150", "blind75", "neetcode250", "striverA2Z", "striver79"];

router.get("/", async (req, res) => {
  try {
    const [problems, progressList] = await Promise.all([
      Problem.find().lean(),
      Progress.find({ userId: req.user._id }).lean(),
    ]);

    const progressMap = new Map(
      progressList
        .filter((p) => p.problemId)
        .map((p) => [p.problemId.toString(), p])
    );

    const sheets = {};
    const categories = {};

    for (const sheet of SHEETS) {
      const placements = [];

      for (const problem of problems) {
        for (const placement of problem.placements || []) {
          if (placement.sheet === sheet) {
            placements.push({ problem, placement });
          }
        }
      }

      let solved = 0;
      let attempted = 0;
      const categoryMap = {};
      const byDifficulty = {
        Easy: { total: 0, solved: 0 },
        Medium: { total: 0, solved: 0 },
        Hard: { total: 0, solved: 0 },
      };

      for (const { problem, placement } of placements) {
        const progress = progressMap.get(problem._id.toString());
        const isSolved = progress?.status === "solved";

        if (isSolved) solved++;
        if (progress?.status === "attempted") attempted++;

        const key = placement.category;
        if (!categoryMap[key]) {
          categoryMap[key] = {
            total: 0,
            solved: 0,
            attempted: 0,
          };
        }

        categoryMap[key].total++;
        if (isSolved) categoryMap[key].solved++;
        if (progress?.status === "attempted") categoryMap[key].attempted++;

        const diff = byDifficulty[problem.difficulty];
        if (diff) {
          diff.total++;
          if (isSolved) diff.solved++;
        }
      }

      sheets[sheet] = {
        total: placements.length,
        solved,
        attempted,
        todo: placements.length - solved - attempted,
        byDifficulty,
      };

      categories[sheet] = categoryMap;
    }

    res.json({
      total: problems.length,
      solved: progressList.filter((p) => p.status === "solved").length,
      attempted: progressList.filter((p) => p.status === "attempted").length,
      todo:
        problems.length -
        progressList.filter((p) => p.status === "solved").length -
        progressList.filter((p) => p.status === "attempted").length,
      saved: progressList.filter((p) => p.saved).length,
      important: progressList.filter((p) => p.important).length,
      needsRevision: progressList.filter((p) => p.needsRevision).length,
      sheets,
      categories,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Unable to fetch statistics" });
  }
});

module.exports = router;
