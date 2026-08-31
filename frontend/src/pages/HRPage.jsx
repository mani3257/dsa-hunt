import { useMemo, useState } from "react";
import { Users, Search } from "lucide-react";

const HR_QA = [
  { id:1, cat:"Personal", q:"Tell me about yourself.",
    a:"Structure: Present → Past → Future\n\nTemplate: 'I am [name], a B.Tech CSE graduate from [college] with [CGPA]. I have experience in [tech stack] and recently built [key project]. I've been preparing for SDE roles targeting [companies]. I'm passionate about [area] and looking to join a team where I can contribute and grow as a developer.'\n\nTip: Keep it under 2 minutes. Don't read your resume — tell your story." },
  { id:2, cat:"Personal", q:"Walk me through your resume.",
    a:"Go section by section: education → projects → skills → internship.\n\nFor each project: What it does → Tech stack used → Your specific contribution → One technical challenge you solved.\n\nTip: The interviewer wants to know what YOU built, not just what the project does." },
  { id:3, cat:"Personal", q:"What are your strengths?",
    a:"Pick 2–3 relevant to the role. Back each with evidence.\n\nGood strengths for SDE: Problem-solving, attention to detail, ability to learn quickly, ownership mindset.\n\nTemplate: 'One of my strengths is problem-solving — when building [project], I faced [issue] and resolved it by [solution]. I also [strength 2] as demonstrated by [example].'" },
  { id:4, cat:"Personal", q:"What are your weaknesses?",
    a:"Be honest — pick a real weakness, but show you're working on it.\n\nGood examples:\n• 'I sometimes over-engineer solutions — I've been working on shipping simpler versions first.'\n• 'I used to hesitate asking for help — I now proactively discuss blockers earlier.'\n\nAvoid: 'I work too hard', 'I'm a perfectionist' — interviewers see through these." },
  { id:5, cat:"Motivation", q:"Why do you want to join our company?",
    a:"Research the company beforehand. Mention: their products/tech stack, culture, growth.\n\nTemplate: 'I admire [company]'s work in [area]. The tech stack aligns with my skills in [X]. I'd love to contribute to [specific product/team] and grow in an environment that values [quality/innovation].'\n\nAvoid: 'Good salary', 'Big brand name' — be specific." },
  { id:6, cat:"Motivation", q:"Why should we hire you?",
    a:"Connect your skills directly to their requirements.\n\nTemplate: 'I bring [specific skill], proven through [project]. I've worked with [tech stack they use], I'm a quick learner, and I'm committed to quality and ownership. I believe I can add value from day one while continuing to grow.'\n\nTip: Be confident, not arrogant. Back every claim with evidence." },
  { id:7, cat:"Motivation", q:"Why did you choose your engineering branch?",
    a:"Be genuine.\n\nIf CSE: 'I've always been curious about how software works — I enjoyed programming early on and CSE aligned perfectly with my interest in building products that solve real problems.'\n\nIf another branch: 'My branch gave me strong fundamentals in [area]. I discovered my passion for software during [event/course] and have been actively building my CS skills since then.'" },
  { id:8, cat:"Motivation", q:"What motivates you?",
    a:"Be genuine. Good answers for SDE freshers:\n\n'I'm motivated by building things that solve real problems. When I see a feature I built working correctly — especially something complex — that's genuinely satisfying. I'm also motivated by learning — every project teaches me something new, and that growth keeps me energized.'" },
  { id:9, cat:"Motivation", q:"Why should we select you over other candidates?",
    a:"'I've gone beyond coursework — I've built real projects using production-level patterns: JWT auth, optimistic UI, atomic DB operations, and streak tracking. I understand the full stack, I take ownership, and I'm genuinely interested in [their domain]. I won't just execute tasks — I'll think about the problems behind them.'" },
  { id:10, cat:"Goals", q:"Where do you see yourself in 5 years?",
    a:"Show ambition + stability + relevance to the role.\n\nTemplate: 'In 5 years, I see myself as a proficient software engineer who has contributed to real-world systems at scale. I'd like to deepen my expertise in [backend/distributed systems] and eventually take on more responsibility — perhaps technical leadership. I'm focused on growing within the company and making meaningful impact.'" },
  { id:11, cat:"Goals", q:"What are your short-term career goals?",
    a:"'In the short term (1–2 years), my goal is to become a proficient contributor — write production-quality code, understand the codebase deeply, and take ownership of features end-to-end. I want to close the gap between academic knowledge and real-world engineering practices.'" },
  { id:12, cat:"Goals", q:"What are your long-term career goals?",
    a:"'Long-term, I want to grow into a senior engineer who can design systems, mentor juniors, and drive technical decisions. Eventually, I'd like to work on large-scale, high-impact systems. I want to be known for the quality of my work and my ability to solve hard problems.'" },
  { id:13, cat:"Projects", q:"Tell me about your most important project.",
    a:"Structure: Problem → Solution → Tech Stack → Your Role → Impact/Learning\n\nExample: 'I built DSA Hunt — a personal MERN stack problem tracker. I was struggling to track my prep across multiple sheets, so I built a full-stack app with JWT auth, optimistic UI updates, a streak/heatmap system, and 5 problem sheets. The biggest challenge was a search refresh bug caused by accordion remounting — I fixed it using CSS display instead of conditional rendering.'\n\nAlways end with what you learned." },
  { id:14, cat:"Projects", q:"What challenges did you face while building your project?",
    a:"Pick a real, technical challenge. Show your problem-solving process.\n\nExample: 'In my IT Helpdesk project, I had to implement SLA deadline computation with cron jobs. The challenge was handling timezones and preventing duplicate alerts. I solved it by storing deadlines in UTC and using a processed flag on each ticket.'\n\nStructure: What was the challenge → What you tried → How you solved it." },
  { id:15, cat:"Projects", q:"What was your specific contribution to the project?",
    a:"Be precise — pick the hardest parts you owned.\n\nExample: 'I designed the entire backend architecture — the JWT auth middleware, role-based access control, and the SLA scheduler. On the frontend, I built the ticket lifecycle state machine and optimistic UI updates.'\n\nTip: Interviewers probe 'what did YOU specifically do' to verify you actually built it." },
  { id:16, cat:"Behavioral", q:"Tell me about a time you solved a difficult problem.",
    a:"Use STAR: Situation → Task → Action → Result\n\nExample: 'While building my Inventory system, I found a race condition in the stock receive-order flow — two requests could simultaneously read and decrement the same quantity. I fixed it by making the operation atomic using MongoDB's findOneAndUpdate with a conditional filter, ensuring only one transaction could proceed at a time.'" },
  { id:17, cat:"Behavioral", q:"Tell me about a failure and what you learned.",
    a:"Pick a genuine failure. Show maturity and learning.\n\nTemplate: '[Situation] — I [what I did wrong]. The result was [consequence]. I learned [lesson] and since then [what changed].'\n\nAvoid catastrophic failures — pick something medium-stakes. Focus more on the learning than the failure itself." },
  { id:18, cat:"Behavioral", q:"How do you handle pressure and deadlines?",
    a:"Show a system, not just willpower.\n\n'I break large tasks into smaller milestones with time buffers. When pressure builds, I prioritize ruthlessly — I identify what's on the critical path and what can be deferred. I also communicate proactively if a deadline is at risk rather than hiding it until the last moment.'" },
  { id:19, cat:"Behavioral", q:"How do you handle conflicts within a team?",
    a:"Show maturity and communication.\n\n'I address conflicts directly but respectfully — I try to understand the other person's perspective first. I focus on the problem, not the person. If we can't resolve it ourselves, I involve a senior to mediate. Most conflicts come from miscommunication, so I try to over-communicate my intent.'" },
  { id:20, cat:"Situational", q:"Are you comfortable working in a team?",
    a:"Yes — back it with an example.\n\n'Absolutely. I've used Git for version control, written documentation so others can understand my code, and in my internship I collaborated with a team on [work]. I believe good teamwork is built on clear communication and mutual accountability.'" },
  { id:21, cat:"Situational", q:"Are you comfortable relocating?",
    a:"Be honest.\n\nIf yes: 'Yes, I'm open to relocating for the right opportunity.'\n\nIf conditional: 'I'm primarily looking at [city] roles but open to relocation for the right role and company.'\n\nAvoid a flat no unless you have strong reasons." },
  { id:22, cat:"Situational", q:"Are you comfortable working in shifts if required?",
    a:"'Yes, I understand that enterprise software often requires support across time zones. I'm flexible with shift timings, especially in the initial phase of my career where learning is the priority.'" },
  { id:23, cat:"Company", q:"What do you know about our company?",
    a:"Always research before the interview:\n• What does the company do (product/service)?\n• Key clients or products\n• Recent news or milestones\n• Their tech stack (if public)\n• Company culture / values\n\nTemplate: '[Company] is a [description]. They are known for [product/achievement]. I admire [specific thing]. I'm particularly interested in [team/product].'\n\nTip: Check LinkedIn, Glassdoor, their engineering blog." },
  { id:24, cat:"Situational", q:"What are your salary expectations?",
    a:"Research the band first (Glassdoor, Levels.fyi, AmbitionBox).\n\n'Based on my research, the range for this role at [company] is [X–Y LPA]. Given my skills and projects, I'm targeting [specific number]. However, I'm flexible — I'm more focused on the role, growth, and learning at this stage.'\n\nAvoid quoting too low (undervalues you) or too high without basis." },
  { id:25, cat:"Closing", q:"Do you have any questions for us?",
    a:"Always ask 1–2 questions — it shows genuine interest.\n\nGood questions:\n• 'What does the onboarding process look like for a new engineer?'\n• 'What does the tech stack look like on the team I'd be joining?'\n• 'What does success look like in the first 6 months in this role?'\n• 'What are the biggest technical challenges the team is working on?'\n\nAvoid: 'What's the salary?' (already discussed), 'When will I get promoted?'" },
];

const CATS = ["All","Personal","Motivation","Goals","Projects","Behavioral","Situational","Company","Closing"];

const CAT_COLORS = {
  Personal:"#58a6ff", Motivation:"#3fb950", Goals:"#f59e0b",
  Projects:"#a78bfa", Behavioral:"#f87171", Situational:"#8b949e",
  Company:"#58a6ff", Closing:"#3fb950",
};

const STORAGE_KEY = "hr_mastered";

function QACard({ item }) {
  const [open, setOpen] = useState(false);
  const [mastered, setMastered] = useState(
    () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").includes(item.id)
  );

  function toggleMastered(e) {
    e.stopPropagation();
    setMastered(prev => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const next = prev ? stored.filter(x => x !== item.id) : [...stored, item.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return !prev;
    });
  }

  return (
    <div className="corecs-card" style={{ borderLeft: mastered ? "2px solid var(--success)" : undefined }}>
      <button className="corecs-card-header" onClick={() => setOpen(v => !v)}>
        <span className="corecs-card-num">{String(item.id).padStart(2, "0")}</span>
        <span className="corecs-card-q">{item.q}</span>
        <span
          className="corecs-cat-badge"
          style={{ color: CAT_COLORS[item.cat] || "#8b949e", borderColor: (CAT_COLORS[item.cat] || "#8b949e") + "44" }}
        >
          {item.cat}
        </span>
        <button
          className={`corecs-mastered-btn${mastered ? " on" : ""}`}
          onClick={toggleMastered}
          title={mastered ? "Unmark" : "Mark mastered"}
        >✓</button>
        <span className="corecs-chevron" style={{ transform: open ? "rotate(180deg)" : undefined }}>▾</span>
      </button>

      <div className="corecs-card-body" style={{ display: open ? "block" : "none" }}>
        <p className="corecs-answer-label">Answer</p>
        <p className="corecs-answer-text">
          {item.a.split("\n\n").map((para, i, arr) => (
            <span key={i}>
              {para.split("\n").map((line, j, lines) => (
                <span key={j}>{line}{j < lines.length - 1 && <br />}</span>
              ))}
              {i < arr.length - 1 && <><br /><br /></>}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function HRPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount / HR_QA.length) * 100);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HR_QA.filter(item => {
      if (cat !== "All" && item.cat !== cat) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [cat, search]);

  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">INTERVIEW PREP</p>
          <h1>HR & Behavioral Questions</h1>
          <p>25 most asked HR questions with structured answer templates.</p>
        </div>
        <Users size={24} />
      </div>

      {/* Stats */}
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{HR_QA.length}</strong><span>Total</span></div>
        <div className="corecs-stat"><strong style={{ color:"var(--success)" }}>{masteredCount}</strong><span>Mastered</span></div>
        <div className="corecs-stat"><strong style={{ color:"var(--accent)" }}>{pct}%</strong><span>Progress</span></div>
        <div className="corecs-progress-track">
          <div className="corecs-progress-fill" style={{ width:`${pct}%` }} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="sheet-toolbar">
        <div className="inline-search">
          <Search size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions or answers…"
          />
        </div>
        <select className="filter-select" value={cat} onChange={e => setCat(e.target.value)}>
          {CATS.map(c => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="corecs-list">
          {filtered.map(item => <QACard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="corecs-empty">
          <Search size={32} style={{ color:"var(--muted)", marginBottom:12 }} />
          <p>No questions match your search.</p>
        </div>
      )}
    </div>
  );
}
