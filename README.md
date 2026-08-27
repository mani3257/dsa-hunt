# DSA Hunt

Production-hardened DSA preparation tracker: authentication, per-user progress,
sheet-aware ordering, spaced revision tracking, saved/important collections,
per-problem notes, an interactive roadmap, and a category-accordion sheet view.

## Run it

Double-click `START-DSA-HUNT.bat`. It installs dependencies for both
`backend/` and `frontend/` (first run only — later runs are instant), seeds
MongoDB, starts the backend on port 8000, and starts the frontend on port
5173.

Your existing `backend/.env` is untouched — keep your real Mongo URI and
OAuth secrets there. `NODE_ENV=production` in that file only matters when you
actually deploy (see below); for local use, leave it as `development`.

## What changed in this rewrite

**Security / production fixes**
- `backend/.gitignore` added — `.env` and `node_modules` will no longer be
  committed if you push this to GitHub.
- Session cookies now use `SameSite=None; Secure` in production, so login
  actually persists once your frontend (Vercel) and backend (Render) live on
  different domains. Locally this still uses `SameSite=Lax` — no behavior
  change in dev.
- `helmet` for standard security headers, `express-rate-limit` on
  `/auth/login` and `/auth/register` (20 attempts / 15 min per IP), and
  `app.set("trust proxy", 1)` for correct IP detection behind Render/any
  reverse proxy.
- Error responses no longer leak raw Mongoose/internal error messages to the
  client — they're logged server-side and a clean message is returned.
- `morgan` request logging (dev-friendly locally, combined format in
  production).
- Dependency versions pinned (no `^`) so a fresh `npm install` can't
  accidentally pull in a newer, breaking release.

**The refresh/scroll-jump bug**
- `useProblems` now only shows the full-page loading spinner on the very
  first load. Every later action (checkbox, save, important, revision, note)
  updates state optimistically and syncs in the background — nothing
  unmounts, nothing scrolls to the top.

**New UI**
- Categories are now collapsible accordions (collapsed by default) instead
  of an always-expanded list, with a solved/total count and mini progress
  bar in the header.
- Status filter (Todo / Attempted / Solved) alongside the existing
  difficulty filter, on the sheet page, Saved, Important, and Revision
  pages.
- Per-problem notes now have a real editor (click the note icon on any
  row).
- "Random problem" button jumps to a random unsolved problem and expands
  its category.
- Easy/Medium/Hard breakdown stats on the sheet page.
- Home page redesigned as a sheet library grid, with room for SQL / System
  Design sheets later without restructuring anything.
- New Roadmap page (`/roadmap`) — an interactive, gamified path through
  each sheet's categories. Categories unlock in order as you finish the one
  before; clicking a category jumps straight into that accordion on the
  sheet page.
- Removed the old pattern sidebar entirely (dead code deleted along with
  it: PatternSidebar, GlobalPatternSidebar, PatternGroup, TopicSection, and
  two unused stub pages, SavedPage/ImportantPage, that weren't even wired
  into routing).

## Deploying (Vercel + Render, or similar)

1. Backend (Render): set `NODE_ENV=production`, `MONGO_URI`,
   `SESSION_SECRET`, `FRONTEND_ORIGIN` (your exact Vercel URL, no trailing
   slash), and your OAuth credentials as environment variables in Render's
   dashboard — never commit `.env`.
2. Frontend (Vercel): set `VITE_API_URL` to your Render backend URL
   (`https://your-app.onrender.com/api`) in Vercel's project settings.
3. Push to GitHub as normal now that `backend/.gitignore` exists.

## Authentication

### Email/password
Manual email/password accounts intentionally accept only `@gmail.com`.
Enforced on both frontend and backend.

### GitHub
Homepage URL: `http://localhost:5173`
Callback URL: `http://localhost:8000/api/auth/github/callback`
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### Google
Redirect URI: `http://localhost:8000/api/auth/google/callback`
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
