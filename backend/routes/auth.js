const express = require("express");
const crypto = require("crypto");
const https = require("https");
const User = require("../models/User");
const Session = require("../models/Session");
const { requireAuth, getToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const SESSION_DAYS = 30;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BACKEND_ORIGIN =
  process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 5001}`;

const isProduction = process.env.NODE_ENV === "production";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isGmail(email) {
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(email);
}

function validatePassword(password) {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

function safeUser(user) {
  let provider = "email";

  if (user.githubId) provider = "github";
  else if (user.googleId) provider = "google";

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    provider,
    createdAt: user.createdAt,
  };
}

function getCookieConfig(maxAgeMs) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: maxAgeMs,
    path: "/",
  };
}

async function createSession(userId, res) {
  const rawToken = crypto.randomBytes(48).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);

  await Session.create({ tokenHash, userId, expiresAt });

  res.cookie("dsa_session", rawToken, getCookieConfig(SESSION_DAYS * 86400 * 1000));
}

function setOAuthState(res, provider, state) {
  res.cookie(`oauth_state_${provider}`, state, getCookieConfig(600 * 1000));
}

function clearOAuthState(res, provider) {
  res.clearCookie(`oauth_state_${provider}`, getCookieConfig(0));
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function createState() {
  return crypto.randomBytes(32).toString("base64url");
}

function redirectWithError(res, message) {
  const params = new URLSearchParams({ error: message });
  res.redirect(`${FRONTEND_ORIGIN}/login?${params.toString()}`);
}

function requestJson(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = https.request(
      target,
      {
        method: options.method || "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "DSA-Hunt/1.0",
          ...(options.headers || {}),
        },
      },
      (response) => {
        let raw = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => (raw += chunk));
        response.on("end", () => {
          let data;
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            return reject(new Error("OAuth provider returned invalid JSON"));
          }

          if (response.statusCode < 200 || response.statusCode >= 300) {
            const error = new Error(
              data.error_description ||
                data.message ||
                data.error ||
                "OAuth request failed"
            );
            error.statusCode = response.statusCode;
            return reject(error);
          }

          resolve(data);
        });
      }
    );

    request.on("error", reject);
    request.setTimeout(10000, () => {
      request.destroy(new Error("OAuth provider request timed out"));
    });

    if (body) request.write(body);
    request.end();
  });
}

// ---------------- Local email/password ----------------

router.post("/register", authLimiter, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ error: "Name must be between 2 and 80 characters" });
    }

    if (!isGmail(email)) {
      return res.status(400).json({ error: "Please use a valid @gmail.com address" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be 8-128 characters" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        error: "An account already exists for this email",
      });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await hashPassword(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      passwordSalt: salt,
    });

    await createSession(user._id, res);

    res.status(201).json({ user: safeUser(user) });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Unable to create account" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isGmail(email)) {
      return res.status(400).json({ error: "Please use a valid @gmail.com address" });
    }

    if (!validatePassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const hash = await hashPassword(password, user.passwordSalt);

    const valid = crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(user.passwordHash, "hex")
    );

    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    await createSession(user._id, res);

    res.json({ user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to sign in" });
  }
});

// ---------------- Profile ----------------

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        error: "Name must be between 2 and 80 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name;
    await user.save();

    res.json({ user: safeUser(user) });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Unable to update profile" });
  }
});

// ---------------- GitHub OAuth ----------------

router.get("/github", (req, res) => {
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return redirectWithError(res, "GitHub authentication is not configured yet");
  }

  const state = createState();
  setOAuthState(res, "github", state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${BACKEND_ORIGIN}/api/auth/github/callback`,
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get("/github/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const expectedState = getCookie(req, "oauth_state_github");

    if (!code || !state || !expectedState || state !== expectedState) {
      clearOAuthState(res, "github");
      return redirectWithError(res, "GitHub sign-in could not be verified");
    }

    const tokenBody = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: String(code),
      redirect_uri: `${BACKEND_ORIGIN}/api/auth/github/callback`,
    }).toString();

    const token = await requestJson(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      tokenBody
    );

    const profile = await requestJson(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    const emails = await requestJson("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const verifiedEmail =
      emails.find((item) => item.primary && item.verified)?.email ||
      emails.find((item) => item.verified)?.email;

    if (!verifiedEmail) {
      clearOAuthState(res, "github");
      return redirectWithError(res, "Your GitHub account has no verified email address");
    }

    const email = normalizeEmail(verifiedEmail);

    let user = await User.findOne({ githubId: String(profile.id) });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.githubId = String(profile.id);
        user.avatarUrl = profile.avatar_url || user.avatarUrl || "";
        await user.save();
      } else {
        user = await User.create({
          name: profile.name || profile.login || "GitHub User",
          email,
          githubId: String(profile.id),
          avatarUrl: profile.avatar_url || "",
        });
      }
    }

    clearOAuthState(res, "github");
    await createSession(user._id, res);

    res.redirect(FRONTEND_ORIGIN);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    clearOAuthState(res, "github");
    redirectWithError(res, "GitHub sign-in failed. Please try again.");
  }
});

// ---------------- Google OAuth ----------------

router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return redirectWithError(res, "Google authentication is not configured yet");
  }

  const state = createState();
  setOAuthState(res, "google", state);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BACKEND_ORIGIN}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const expectedState = getCookie(req, "oauth_state_google");

    if (!code || !state || !expectedState || state !== expectedState) {
      clearOAuthState(res, "google");
      return redirectWithError(res, "Google sign-in could not be verified");
    }

    const tokenBody = new URLSearchParams({
      code: String(code),
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${BACKEND_ORIGIN}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }).toString();

    const token = await requestJson(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      tokenBody
    );

    const profile = await requestJson(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (!profile.email || profile.email_verified !== true) {
      clearOAuthState(res, "google");
      return redirectWithError(res, "Google did not provide a verified email");
    }

    const email = normalizeEmail(profile.email);

    let user = await User.findOne({ googleId: String(profile.sub) });

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.googleId = String(profile.sub);
        user.avatarUrl = profile.picture || user.avatarUrl || "";
        await user.save();
      } else {
        user = await User.create({
          name: profile.name || profile.email.split("@")[0],
          email,
          googleId: String(profile.sub),
          avatarUrl: profile.picture || "",
        });
      }
    }

    clearOAuthState(res, "google");
    await createSession(user._id, res);

    res.redirect(FRONTEND_ORIGIN);
  } catch (error) {
    console.error("Google OAuth error:", error);
    clearOAuthState(res, "google");
    redirectWithError(res, "Google sign-in failed. Please try again.");
  }
});

// ---------------- Session ----------------

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", async (req, res) => {
  try {
    const token = getToken(req);

    if (token) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await Session.deleteOne({ tokenHash });
    }

    res.clearCookie("dsa_session", getCookieConfig(0));
    res.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Unable to sign out" });
  }
});

module.exports = router;