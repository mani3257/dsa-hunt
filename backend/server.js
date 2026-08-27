require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { requireAuth } = require("./middleware/auth");
const Problem = require("./models/Problem");
const Progress = require("./models/Progress");
const User = require("./models/User");
const Session = require("./models/Session");
const Activity = require("./models/Activity");
const GoalPlan = require("./models/GoalPlan");

const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";

// In production this is a single fixed origin. In dev, also accept
// localhost:5173 alongside FRONTEND_ORIGIN so you can keep using
// localhost on your PC while a LAN IP (for phone testing) also works,
// without editing .env every time you switch devices.
const ALLOWED_ORIGINS = isProduction
  ? [FRONTEND_ORIGIN]
  : [...new Set([FRONTEND_ORIGIN, "http://localhost:5173"])];

// Render/other hosts sit behind a reverse proxy — trust the first hop so
// secure cookies and req.ip resolve correctly.
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (e.g. curl, health checks) — allow.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(morgan(isProduction ? "combined" : "dev"));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "dsa-hunt-api" })
);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/problems", requireAuth, require("./routes/problems"));
app.use("/api/progress", requireAuth, require("./routes/progress"));
app.use("/api/stats", requireAuth, require("./routes/stats"));
app.use("/api/revision", requireAuth, require("./routes/revision"));
app.use("/api/activity", requireAuth, require("./routes/activity"));
app.use("/api/goal", requireAuth, require("./routes/goal"));

app.use((req, res) =>
  res.status(404).json({ error: "Route not found" })
);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = status < 500 && err.message ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

async function repairLegacyIndexes() {
  // Older versions of DSA Hunt created expiresAt_1 without TTL options.
  // Drop that legacy index so the current Session schema can recreate it correctly.
  try {
    await Session.collection.dropIndex("expiresAt_1");
    console.log("Removed legacy Session expiresAt index");
  } catch (error) {
    if (error.codeName !== "IndexNotFound" && error.code !== 27) {
      throw error;
    }
  }
}

async function repairOrphanedProgress() {
  // Progress documents from an earlier schema/version can be missing
  // problemId. They can never match a real problem, so they're dead
  // weight — remove them rather than crashing every route that reads them.
  const result = await Progress.deleteMany({
    $or: [{ problemId: { $exists: false } }, { problemId: null }],
  });
  if (result.deletedCount > 0) {
    console.log(`Removed ${result.deletedCount} orphaned Progress document(s) with no problemId`);
  }
}

async function startServer() {
  try {
    await connectDB();

    await repairLegacyIndexes();
    await repairOrphanedProgress();

    await Promise.all([
      Problem.syncIndexes(),
      Progress.syncIndexes(),
      User.syncIndexes(),
      Session.syncIndexes(),
      Activity.syncIndexes(),
      GoalPlan.syncIndexes(),
    ]);

    app.listen(PORT, () => {
      console.log(`DSA Hunt API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
