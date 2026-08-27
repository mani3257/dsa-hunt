const express = require("express");
const Activity = require("../models/Activity");

const router = express.Router();
const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function computeStreaks(dateKeys) {
  const sorted = [...dateKeys].sort();
  if (!sorted.length) return { currentStreak: 0, longestStreak: 0 };

  const dateSet = new Set(sorted);
  let longestStreak = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00Z");
    const curr = new Date(sorted[i] + "T00:00:00Z");
    const diffDays = Math.round((curr - prev) / DAY_MS);

    run = diffDays === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  // Current streak: walk back from today (or yesterday, so a streak
  // doesn't visually "break" before the user has had a chance to solve
  // anything today).
  const today = new Date();
  let cursor = toDateKey(today);
  if (!dateSet.has(cursor)) {
    cursor = toDateKey(new Date(today.getTime() - DAY_MS));
  }

  let currentStreak = 0;
  while (dateSet.has(cursor)) {
    currentStreak++;
    cursor = toDateKey(new Date(new Date(cursor + "T00:00:00Z").getTime() - DAY_MS));
  }

  return { currentStreak, longestStreak };
}

// GET /api/activity?days=140 — heatmap cells for the last N days plus streaks.
router.get("/", async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 140, 7), 371);
    const since = toDateKey(new Date(Date.now() - days * DAY_MS));

    const records = await Activity.find({
      userId: req.user._id,
      date: { $gte: since },
    })
      .sort({ date: 1 })
      .lean();

    const { currentStreak, longestStreak } = computeStreaks(records.map((r) => r.date));

    res.json({
      days: records.map((r) => ({ date: r.date, count: r.count })),
      currentStreak,
      longestStreak,
      totalActiveDays: records.length,
    });
  } catch (error) {
    console.error("Activity fetch error:", error);
    res.status(500).json({ error: "Unable to load your activity." });
  }
});

module.exports = router;
