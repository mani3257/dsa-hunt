import { useEffect, useState } from "react";
import { Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { startGithubLogin, startGoogleLogin } from "../api/auth";

const GMAIL_PATTERN =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;
function GithubIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.043-1.61-4.043-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.49 11.49 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.655 1.653.244 2.873.12 3.176.77.84 1.232 1.91 1.232 3.22 0 4.61-2.807 5.623-5.48 5.92.43.372.815 1.102.815 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.696.825.578C20.565 21.796 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
    </svg>
  );
}


export default function AuthPage({ mode }) {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === "login";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get("error");

    if (oauthError) {
      // Surface an OAuth redirect error, then clean the URL.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(oauthError);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location.pathname, location.search]);

  if (user) return <Navigate to="/" replace />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateGmail() {
    if (!GMAIL_PATTERN.test(form.email.trim().toLowerCase())) {
      setError("Please use a valid @gmail.com address.");
      return false;
    }
    return true;
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!validateGmail()) return;

    setBusy(true);

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }

      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark">D</span>
          DSA<span>Hunt</span>
        </div>

        <div>
          <p className="eyebrow">INTERVIEW PREPARATION OS</p>
          <h1>
            Turn practice into
            <br />
            <span>interview confidence.</span>
          </h1>
          <p>
            Track every problem, every revision, and every pattern without
            losing the thread.
          </p>
        </div>

        <div className="auth-points">
          <span>01 · Pattern-first learning</span>
          <span>02 · Personal progress</span>
          <span>03 · Revision that sticks</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-box">
          <p className="eyebrow">{isLogin ? "WELCOME BACK" : "GET STARTED"}</p>
          <h2>{isLogin ? "Sign in to DSA Hunt" : "Create your workspace"}</h2>
          <p className="auth-muted">
            {isLogin
              ? "Continue your interview preparation."
              : "Build your personal DSA preparation system."}
          </p>

          <div className="oauth-grid">
            <button type="button" className="oauth-button" onClick={startGoogleLogin}>
              <span className="google-icon">G</span>
              Continue with Google
            </button>
            <button type="button" className="oauth-button" onClick={startGithubLogin}>
              <GithubIcon size={18} />
              Continue with GitHub
            </button>
          </div>

          <div className="auth-divider">
            <span /><em>OR</em><span />
          </div>

          <form onSubmit={submit} className="auth-form">
            {!isLogin && (
              <label>
                <span>Name</span>
                <div className="input-wrap">
                  <UserRound size={17} />
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>
            )}

            <label>
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
              <small className="field-hint">
                Email/password accounts require a Gmail address.
              </small>
            </label>

            <label>
              <span>Password</span>
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  maxLength={128}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
              </div>
            </label>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button className="primary-button auth-submit" disabled={busy}>
              {busy ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "New to DSA Hunt?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Create account" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
