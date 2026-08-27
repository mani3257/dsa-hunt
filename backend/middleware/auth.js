const crypto = require("crypto");
const Session = require("../models/Session");
const User = require("../models/User");

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();

  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/(?:^|;\s*)dsa_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ error: "Authentication required" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await Session.findOne({ tokenHash }).lean();

    if (!session || session.expiresAt <= new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const user = await User.findById(session.userId).select("_id name email avatarUrl githubId googleId createdAt").lean();
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    req.sessionId = session._id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid session" });
  }
}

module.exports = { requireAuth, getToken };
