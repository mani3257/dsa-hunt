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
const isProduction = process.env.NODE_ENV === "production";

// Trust Render's reverse proxy for secure cookies and client IP resolution
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Dynamic origin validator: allows configured FRONTEND_ORIGIN, localhost, and any Vercel preview URLs
const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow curl, health checks, postman
  const configuredOrigin = process.env.FRONTEND_ORIGIN;
  if (configuredOrigin && origin === configuredOrigin) return true;
  if (origin === "http://localhost:5173" || origin === "http://localhost:3000") return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
  const status = err.status || (err.message.includes("CORS") ? 403 : 500);
  const message = status < 500 && err.message ? err.message : "Internal server error";
  res.status(status).json({ error: message });
});

async function repairLegacyIndexes() {
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