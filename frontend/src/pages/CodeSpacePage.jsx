import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCode2,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import DifficultyBadge from "../components/DifficultyBadge";
import { getProblemById } from "../api/problems";

const STARTER_CODE = `class Solution {
    public void solve() {
        // Write your approach here

    }
}`;

export default function CodeSpacePage() {
  const { problemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(location.state?.problem || null);
  const [loading, setLoading] = useState(!location.state?.problem);
  const [error, setError] = useState("");
  const storageKey = useMemo(() => `dsa-hunt-code-${problemId}`, [problemId]);
  const [code, setCode] = useState(() => localStorage.getItem(`dsa-hunt-code-${problemId}`) || STARTER_CODE);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    if (problem) return;
    let active = true;
    getProblemById(problemId, new URLSearchParams(location.search).get("sheet") || "neetcode150")
      .then((data) => active && setProblem(data))
      .catch(() => active && setError("We couldn't load this problem."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [problem, problemId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, code);
      setSavedAt("Saved automatically");
    }, 500);
    return () => clearTimeout(timer);
  }, [code, storageKey]);

  function resetCode() {
    setCode(STARTER_CODE);
    localStorage.removeItem(storageKey);
    setSavedAt("Reset to starter code");
  }

  function saveNow() {
    localStorage.setItem(storageKey, code);
    setSavedAt("Saved to this browser");
  }

  if (loading) return <div className="content-loader"><div className="spinner" />Loading Code Space…</div>;
  if (error || !problem) return <div className="container"><div className="error-card">{error || "Problem not found."}</div></div>;

  return (
    <div className="code-space-page">
      <div className="code-space-topbar">
        <button className="code-back" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back</button>
        <div className="code-problem-title">
          <span className="code-kicker"><Code2 size={14} /> DSA HUNT CODE SPACE</span>
          <h1>{problem.title}</h1>
        </div>
        <div className="code-top-actions">
          <DifficultyBadge difficulty={problem.difficulty} />
          <a href={problem.link} target="_blank" rel="noreferrer" className="leetcode-button">
            Solve on LeetCode <ExternalLink size={15} />
          </a>
        </div>
      </div>

      <main className="code-space-grid">
        <aside className="code-info-panel">
          <div className="code-info-scroll">
            <div className="code-info-header">
              <span>Problem Workspace</span>
              <Sparkles size={16} />
            </div>
            <h2>{problem.title}</h2>
            <p className="code-muted">Use this space to think through your approach before submitting on LeetCode.</p>

            <div className="code-meta">
              <div><span>Category</span><strong>{problem.category || "Practice"}</strong></div>
              <div><span>Pattern</span><strong>{problem.pattern || "—"}</strong></div>
              <div><span>Status</span><strong className="code-status">{problem.progress?.status || "todo"}</strong></div>
            </div>

            <section className="code-workflow-card">
              <div className="workflow-icon"><FileCode2 size={18} /></div>
              <div>
                <h3>Your workflow</h3>
                <ol>
                  <li>Understand the problem on LeetCode.</li>
                  <li>Draft and refine your solution here.</li>
                  <li>Open LeetCode to run and submit it.</li>
                </ol>
              </div>
            </section>

            <section className="code-tip-card">
              <CheckCircle2 size={17} />
              <div><strong>Tip</strong><p>Your code is automatically saved in this browser for this problem.</p></div>
            </section>
          </div>
          <Link to={`/sheet`} className="code-return-sheet">Browse all problems</Link>
        </aside>

        <section className="editor-panel">
          <div className="editor-toolbar">
            <div className="editor-language"><span className="language-dot" /> Java <span className="editor-muted">Practice editor</span></div>
            <div className="editor-actions">
              <span className="autosave-label">{savedAt}</span>
              <button onClick={saveNow}><Save size={15} /> Save</button>
              <button onClick={resetCode}><RotateCcw size={15} /> Reset</button>
            </div>
          </div>
          <div className="editor-shell">
            <div className="editor-gutter" aria-hidden="true">{code.split("\n").map((_, i) => <span key={i}>{i + 1}</span>)}</div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              spellCheck="false"
              aria-label="Java code editor"
            />
          </div>
          <div className="editor-footer">
            <span>Code Space is for drafting and practicing.</span>
            <a href={problem.link} target="_blank" rel="noreferrer">Open LeetCode to execute <ExternalLink size={14} /></a>
          </div>
        </section>
      </main>
    </div>
  );
}
