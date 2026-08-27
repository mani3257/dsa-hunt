const express = require("express");
const GoalPlan = require("../models/GoalPlan");
const Problem = require("../models/Problem");
const Progress = require("../models/Progress");

const router = express.Router();
const DAY_MS = 24 * 60 * 60 * 1000;

function matchFor(sheet, categories) {
  return categories.length
    ? { placements: { $elemMatch: { sheet, category: { $in: categories } } } }
    : { placements: { $elemMatch: { sheet } } };
}

async function buildResponse(plan, userId) {
  if (!plan) return { plan: null, days: [], currentDay: 0 };

  const match = matchFor(plan.sheet, plan.categories);

  const [problems, progressList] = await Promise.all([
    Problem.find(match).lean(),
    Progress.find({ userId }).lean(),
  ]);

  problems.sort((a, b) => {
    const pa = a.placements.find((p) => p.sheet === plan.sheet)?.order ?? 0;
    const pb = b.placements.find((p) => p.sheet === plan.sheet)?.order ?? 0;
    return pa - pb;
  });

  const progressMap = new Map(
    progressList.filter((p) => p.problemId).map((p) => [p.problemId.toString(), p])
  );

  const total = problems.length;
  const totalDays = plan.totalDays;
  const base = Math.floor(total / totalDays);
  let remainder = total % totalDays;
  let idx = 0;

  const start = new Date(plan.startDate + "T00:00:00Z");
  const days = [];

  for (let d = 0; d < totalDays; d++) {
    let count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    const dayProblems = problems.slice(idx, idx + count);
    idx += count;

    const date = new Date(start.getTime() + d * DAY_MS);
    const enriched = dayProblems.map((p) => {
      const progress = progressMap.get(p._id.toString());
      const category = p.placements.find((pl) => pl.sheet === plan.sheet)?.category;
      return {
        _id: p._id,
        title: p.title,
        link: p.link,
        difficulty: p.difficulty,
        category,
        status: progress?.status || "todo",
      };
    });

    days.push({
      dayNumber: d + 1,
      date: date.toISOString().slice(0, 10),
      topic: enriched[0]?.category || null,
      problems: enriched,
      solved: enriched.filter((p) => p.status === "solved").length,
      total: enriched.length,
    });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const currentDay = Math.min(
    Math.max(Math.floor((today - start) / DAY_MS) + 1, 0),
    totalDays
  );

  return { plan, days, currentDay };
}

router.get("/", async (req, res) => {
  try {
    const plan = await GoalPlan.findOne({ userId: req.user._id }).lean();
    res.json(await buildResponse(plan, req.user._id));
  } catch (error) {
    console.error("Goal fetch error:", error);
    res.status(500).json({ error: "Unable to load your goal plan." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { sheet, categories, startDate, totalDays, problemsPerDay, level } = req.body;
    const categoryList = Array.isArray(categories) ? categories : [];

    if (!sheet || !startDate) {
      return res.status(400).json({ error: "sheet and startDate are required." });
    }
    if (!totalDays && !problemsPerDay) {
      return res.status(400).json({ error: "Provide either totalDays or problemsPerDay." });
    }

    let days;
    if (problemsPerDay) {
      const perDay = Number(problemsPerDay);
      if (!Number.isFinite(perDay) || perDay < 1) {
        return res.status(400).json({ error: "problemsPerDay must be at least 1." });
      }
      const total = await Problem.countDocuments(matchFor(sheet, categoryList));
      days = Math.ceil(total / perDay) || 1;
    } else {
      days = Number(totalDays);
    }

    if (!Number.isFinite(days) || days < 7 || days > 365) {
      return res.status(400).json({
        error: problemsPerDay
          ? "That pace works out to a plan outside the 7–365 day range — try a different number of problems per day."
          : "totalDays must be between 7 and 365.",
      });
    }

    const plan = await GoalPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          sheet,
          categories: categoryList,
          startDate,
          totalDays: days,
          level: level === "Pro" ? "Pro" : "Beginner",
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json(await buildResponse(plan, req.user._id));
  } catch (error) {
    console.error("Goal save error:", error);
    res.status(400).json({ error: "Unable to save your goal plan." });
  }
});

router.delete("/", async (req, res) => {
  try {
    await GoalPlan.deleteOne({ userId: req.user._id });
    res.json({ plan: null, days: [], currentDay: 0 });
  } catch (error) {
    console.error("Goal delete error:", error);
    res.status(500).json({ error: "Unable to remove your goal plan." });
  }
});

module.exports = router;
