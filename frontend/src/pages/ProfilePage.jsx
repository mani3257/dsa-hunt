import { useEffect, useRef, useState } from "react";
import { Award, Bookmark, Check, ChevronRight, Flame, LogOut, Mail, Pencil, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStats } from "../api/stats";
import { getActivity } from "../api/activity";
import StreakCalendar from "../components/StreakCalendar";
import ProgressRing from "../components/ProgressRing";
import { SHEETS } from "../utils/sheets";

const BADGE_THRESHOLDS = [
  { days: 7, label: "7 day streak" },
  { days: 21, label: "21 day streak" },
  { days: 50, label: "50 day streak" },
  { days: 100, label: "100 day streak" },
];

function GithubMiniIcon(){return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.043-1.61-4.043-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.49 11.49 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.244 2.873.12 3.176.77.84 1.232 1.91 1.232 3.22 0 4.61-2.807 5.623-5.48 5.92.43.372.815 1.102.815 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.696.825.578C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z"/></svg>;}

function ProviderBadge({ provider }) {
  if (provider === "github") {
    return (
      <span className="profile-provider github">
        <GithubMiniIcon /> GitHub
      </span>
    );
  }

  if (provider === "google") {
    return (
      <span className="profile-provider google">
        <span className="provider-g">G</span> Google
      </span>
    );
  }

  return (
    <span className="profile-provider email">
      <Mail size={14} /> Email & password
    </span>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  // Keep preview in sync if user context updates (e.g. after reload)
  useEffect(() => {
    if (user?.avatarUrl) setAvatarPreview(user.avatarUrl);
  }, [user?.avatarUrl]);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getActivity(140).then(setActivity).catch(() => {});
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB."); return; }

    setAvatarUploading(true);
    setError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      try {
        await updateProfile({ name: (user?.name || "").trim(), avatarUrl: dataUrl });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to upload avatar.");
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile(event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2 || trimmed.length > 80) {
      setError("Name must be between 2 and 80 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setSaved(false);

    try {
      await updateProfile({ name: trimmed });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update profile.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  const joined = user?.createdAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "—";

  return (
    <div className="profile-page container">
      <div className="profile-head">
        <div>
          <p className="eyebrow">ACCOUNT</p>
          <h1>Profile</h1>
          <p>Manage your DSA Hunt identity and account details.</p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card profile-identity">
          <div className="profile-avatar-wrap" style={{ position: "relative", display: "inline-block" }}>
            {(avatarPreview || user?.avatarUrl) ? (
              <img src={avatarPreview || user.avatarUrl} alt="Profile" className="profile-avatar-image" />
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}
            {/* Edit avatar button */}
            <button
              className="profile-avatar-edit-btn"
              onClick={() => avatarInputRef.current?.click()}
              title="Change profile photo"
              disabled={avatarUploading}
            >
              {avatarUploading ? "…" : <Pencil size={11} />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <ProviderBadge provider={user?.provider} />

          <div className="profile-divider" />

          <div className="profile-security-note">
            <ShieldCheck size={17} />
            <div>
              <strong>Account secured</strong>
              <span>Your session is protected with an HttpOnly authentication cookie.</span>
            </div>
          </div>
        </section>

        <section className="profile-card profile-details">
          <div className="profile-card-head">
            <div>
              <h2>Personal details</h2>
              <p>Keep your account information up to date.</p>
            </div>

            {!editing && (
              <button className="secondary-button" onClick={() => setEditing(true)}>
                <Pencil size={14} /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <form className="profile-form" onSubmit={saveProfile}>
              <label>
                <span>Name</span>
                <div className="input-wrap">
                  <UserRound size={16} />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    autoFocus
                    required
                  />
                </div>
              </label>

              <label>
                <span>Email</span>
                <div className="input-wrap profile-readonly">
                  <Mail size={16} />
                  <input value={user?.email || ""} readOnly />
                </div>
                <small>Email cannot be changed because it is the identity linked to your account.</small>
              </label>

              {error && <div className="form-error">{error}</div>}

              <div className="profile-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditing(false);
                    setName(user?.name || "");
                    setError("");
                  }}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={busy}>
                  <Check size={15} /> {busy ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-fields">
              <div className="profile-field">
                <span>Name</span>
                <strong>{user?.name}</strong>
              </div>

              <div className="profile-field">
                <span>Email</span>
                <strong>{user?.email}</strong>
              </div>

              <div className="profile-field">
                <span>Sign-in method</span>
                <strong><ProviderBadge provider={user?.provider} /></strong>
              </div>

              <div className="profile-field">
                <span>Member since</span>
                <strong>{joined}</strong>
              </div>
            </div>
          )}
        </section>
      </div>

      {stats && (
        <section className="profile-progress-bento">
          <div className="bento-card bento-ring">
            <ProgressRing
              percentage={stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}
              size={128}
              stroke={10}
              label={`${stats.solved}/${stats.total}`}
              sublabel="solved"
              color="var(--accent)"
            />
            <div className="bento-ring-legend">
              <span className="dot easy" /> {stats.sheets?.neetcode150?.byDifficulty?.Easy?.solved ?? 0} Easy
              <span className="dot medium" /> {stats.sheets?.neetcode150?.byDifficulty?.Medium?.solved ?? 0} Medium
              <span className="dot hard" /> {stats.sheets?.neetcode150?.byDifficulty?.Hard?.solved ?? 0} Hard
            </div>
          </div>

          <div className="bento-card bento-streak">
            <Flame size={28} />
            <strong>{activity?.currentStreak ?? 0}</strong>
            <span>day streak</span>
            <small>Best: {activity?.longestStreak ?? 0} days</small>
          </div>

          <div className="bento-card bento-badges">
            <div className="bento-card-title"><Sparkles size={15} /> Consistency badges</div>
            <div className="medal-row">
              {BADGE_THRESHOLDS.map((badge) => {
                const earned = (activity?.longestStreak ?? 0) >= badge.days;
                return (
                  <div key={badge.days} className={`medal ${earned ? "earned" : ""}`} title={badge.label}>
                    <div className="medal-icon"><Flame size={16} /></div>
                    <span>{badge.days}d</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bento-card bento-sheets">
            <div className="bento-card-title">Sheet progress</div>
            <div className="profile-sheet-list">
              {SHEETS.map((sheetMeta) => {
                const sheetStats = stats.sheets?.[sheetMeta.value] || { total: 0, solved: 0 };
                const percentage = sheetStats.total ? Math.round((sheetStats.solved / sheetStats.total) * 100) : 0;
                return (
                  <div className="profile-sheet-row" key={sheetMeta.value}>
                    <span>{sheetMeta.label}</span>
                    <div className="bar"><span style={{ width: `${percentage}%` }} /></div>
                    <small>{sheetStats.solved}/{sheetStats.total}</small>
                  </div>
                );
              })}
            </div>
          </div>

          {activity && (
            <div className="bento-card bento-heatmap">
              <div className="bento-card-title-row">
                <div className="bento-card-title">All activity</div>
                <span className="profile-streak-badge"><Award size={14} /> {activity.currentStreak} day streak</span>
              </div>
              <StreakCalendar days={activity.days} rangeDays={365} />
            </div>
          )}
        </section>
      )}

      <section className="profile-card profile-quicklinks">
        <div className="profile-card-head">
          <div>
            <h2>Quick links</h2>
            <p>Collections that don't live in the main navigation on smaller screens.</p>
          </div>
        </div>

        <div className="quicklink-row">
          <Link to="/saved" className="quicklink">
            <span className="quicklink-icon teal"><Bookmark size={16} /></span>
            <span>Saved problems</span>
            <ChevronRight size={16} />
          </Link>
          <Link to="/important" className="quicklink">
            <span className="quicklink-icon amber"><Star size={16} /></span>
            <span>Important problems</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section className="profile-card profile-danger">
        <div>
          <h2>Session</h2>
          <p>Sign out of DSA Hunt on this device.</p>
        </div>
        <button className="secondary-button danger-button" onClick={signOut}>
          <LogOut size={15} /> Sign out
        </button>
      </section>

      {saved && <div className="profile-toast"><Check size={15} /> Profile updated</div>}
    </div>
  );
}
