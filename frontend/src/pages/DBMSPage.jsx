import { useMemo, useRef, useState } from "react";
import { Database, Search, Copy, Check } from "lucide-react";

const DBMS_QA = [
  { id:1, cat:"Keys", q:"What is DBMS? What is RDBMS? What's the difference?",
    a:"DBMS stores data as files with no relationships and no ACID. Examples: XML, file system.\n\nRDBMS stores data in structured tables, supports relationships via keys, and enforces ACID. Examples: MySQL, PostgreSQL, Oracle.",
    table:[["Feature","DBMS","RDBMS"],["Storage","Files","Tables"],["Relationships","None","Via keys"],["ACID","No","Yes"],["Example","XML, File System","MySQL, PostgreSQL"]] },
  { id:2, cat:"Keys", q:"What is a Primary Key?",
    a:"A Primary Key uniquely identifies each row in a table.\n\nRules: cannot be NULL, must be unique, only one per table.\n\nExample: student_id in a Students table." },
  { id:3, cat:"Keys", q:"What is a Foreign Key?",
    a:"A Foreign Key references the Primary Key of another table and enforces referential integrity.",
    code:"CREATE TABLE Orders (\n  order_id    INT PRIMARY KEY,\n  customer_id INT,\n  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)\n);" },
  { id:4, cat:"Keys", q:"What is a Candidate Key?",
    a:"A Candidate Key is the minimal set of columns that uniquely identifies a row — remove any column and uniqueness breaks.\n\nExample: {email} and {phone} are both candidate keys in a Students table." },
  { id:5, cat:"Keys", q:"What is a Super Key?",
    a:"A Super Key is any combination of columns that uniquely identifies a row — may have redundant columns. A Candidate Key is a minimal Super Key.\n\nExample: {email}, {phone}, {email, name} are all super keys." },
  { id:6, cat:"Normalization", q:"What is Normalization?",
    a:"Normalization organizes a database to reduce data redundancy and improve integrity.\n\nNormal forms: 1NF → 2NF → 3NF → BCNF." },
  { id:7, cat:"Normalization", q:"What is 1NF?",
    a:"Each column has atomic (indivisible) values. No repeating groups or multi-valued columns.\n\nBAD: Student(id, name, subjects='Math,Sci')\nGOOD: One row per subject." },
  { id:8, cat:"Normalization", q:"What is 2NF?",
    a:"1NF + No partial dependency — every non-key column depends on the full composite primary key.\n\nBAD: Order(order_id, product_id, product_name) — product_name depends only on product_id.\nGOOD: Split into Orders + Products tables." },
  { id:9, cat:"Normalization", q:"What is 3NF?",
    a:"2NF + No transitive dependency — no non-key column depends on another non-key column.\n\nBAD: Employee(emp_id, dept_id, dept_name) — dept_name depends on dept_id.\nGOOD: Split into Employee + Department tables." },
  { id:10, cat:"Normalization", q:"What is a partial dependency?",
    a:"A non-key column depends on part of a composite PK, not the full key. Violates 2NF.\n\nExample: In Order(order_id, product_id, product_name), product_name depends only on product_id." },
  { id:11, cat:"Normalization", q:"What is a transitive dependency?",
    a:"A non-key column depends on another non-key column. Violates 3NF.\n\nExample: Employee(emp_id, dept_id, dept_name) — dept_name depends on dept_id, not emp_id." },
  { id:12, cat:"SQL", q:"What is a SQL query? Write basic CRUD queries.",
    a:"SQL (Structured Query Language) is used to communicate with relational databases.",
    code:"-- Select\nSELECT * FROM Students WHERE age > 20;\nSELECT DISTINCT city FROM Customers;\n\n-- Insert\nINSERT INTO Students VALUES (1, 'Mani', 22);\n\n-- Update\nUPDATE Students SET age = 23 WHERE id = 1;\n\n-- Delete\nDELETE FROM Students WHERE id = 1;\n\n-- Order & Limit\nSELECT * FROM Students ORDER BY age DESC LIMIT 5;" },
  { id:13, cat:"SQL", q:"What is the difference between WHERE and HAVING?",
    a:"WHERE filters rows before grouping — cannot use aggregate functions.\n\nHAVING filters groups after GROUP BY — can use aggregate functions.",
    code:"-- WHERE: filters rows before grouping\nSELECT dept, COUNT(*) FROM Employees\nWHERE salary > 30000\nGROUP BY dept;\n\n-- HAVING: filters groups after aggregation\nSELECT dept, COUNT(*) FROM Employees\nGROUP BY dept\nHAVING COUNT(*) > 5;" },
  { id:14, cat:"SQL", q:"What is GROUP BY?",
    a:"GROUP BY groups rows with the same values into summary rows. Always used with aggregate functions.",
    code:"SELECT dept, COUNT(*) AS total\nFROM Employees\nGROUP BY dept;" },
  { id:15, cat:"SQL", q:"What are Joins? Explain all types.",
    a:"A JOIN combines rows from two tables based on a related column.",
    table:[["Join","Returns"],["INNER JOIN","Matching rows only"],["LEFT JOIN","All left + matched right (NULL if no match)"],["RIGHT JOIN","All right + matched left (NULL if no match)"],["FULL OUTER JOIN","All rows from both (NULLs where no match)"]],
    code:"-- INNER: only students who have orders\nSELECT s.name, o.order_id\nFROM Students s\nINNER JOIN Orders o ON s.id = o.student_id;\n\n-- LEFT: all students including those with no orders\nSELECT s.name, o.order_id\nFROM Students s\nLEFT JOIN Orders o ON s.id = o.student_id;\n\n-- RIGHT JOIN and FULL OUTER JOIN work similarly" },
  { id:16, cat:"SQL", q:"What is a Subquery?",
    a:"A subquery is a query nested inside another. Executes first, result used by outer query.",
    code:"-- Student with highest marks\nSELECT name FROM Students\nWHERE marks = (SELECT MAX(marks) FROM Students);\n\n-- IN subquery\nSELECT name FROM Students\nWHERE dept_id IN (\n  SELECT id FROM Departments WHERE location = 'Hyd'\n);" },
  { id:17, cat:"SQL", q:"What are Aggregate Functions?",
    a:"Aggregate functions compute a value from a set of rows and return one result.",
    code:"COUNT(*)   -- number of rows\nSUM(col)   -- total\nAVG(col)   -- average\nMAX(col)   -- maximum\nMIN(col)   -- minimum\n\n-- Examples\nSELECT COUNT(*) FROM Students;\nSELECT AVG(salary) FROM Employees WHERE dept = 'IT';\nSELECT MAX(marks), MIN(marks) FROM Students;" },
  { id:18, cat:"SQL", q:"What is Indexing?",
    a:"An index speeds up SELECT queries by letting the DB jump directly to data instead of full scan.\n\nTrade-off: faster reads, slower writes.\nTypes: Primary, Secondary, Clustered, Non-Clustered.",
    code:"-- Create index\nCREATE INDEX idx_name ON Students(name);\n\n-- Composite index\nCREATE INDEX idx_dept_name ON Employees(dept, name);\n\n-- Drop index\nDROP INDEX idx_name ON Students;" },
  { id:19, cat:"ACID/Tx", q:"What is a Transaction?",
    a:"A transaction is a group of SQL operations treated as one unit — either all succeed (COMMIT) or all rollback (ROLLBACK).",
    code:"BEGIN;\n  UPDATE Accounts SET balance = balance - 500 WHERE id = 1;\n  UPDATE Accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;\n\n-- On error\nROLLBACK;" },
  { id:20, cat:"ACID/Tx", q:"What are ACID Properties?",
    a:"ACID ensures reliable transactions.",
    table:[["Property","Meaning"],["Atomicity","All or nothing"],["Consistency","DB stays valid before and after"],["Isolation","Concurrent transactions don't interfere"],["Durability","Committed data survives crashes"]] },
  { id:21, cat:"ACID/Tx", q:"Explain each ACID property.",
    a:"Atomicity: all steps complete or none do.\n\nConsistency: all constraints (PK, FK, unique) hold before and after.\n\nIsolation: transactions run independently. Levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE.\n\nDurability: committed data persists even after crash — achieved via write-ahead logs (WAL)." },
  { id:22, cat:"Misc", q:"DELETE vs DROP vs TRUNCATE?",
    a:"All three remove data but at different levels.",
    table:[["","DELETE","TRUNCATE","DROP"],["Removes","Specific rows","All rows","Entire table"],["WHERE","Yes","No","No"],["Rollback","Yes (DML)","No (DDL)","No (DDL)"],["Structure","Kept","Kept","Gone"]],
    code:"-- DELETE: remove specific rows (rollback possible)\nDELETE FROM Students WHERE id = 1;\n\n-- TRUNCATE: remove all rows fast (no rollback)\nTRUNCATE TABLE Students;\n\n-- DROP: remove entire table\nDROP TABLE Students;" },
  { id:23, cat:"Misc", q:"What is a View?",
    a:"A View is a virtual table based on a query — stores no data itself.\n\nUse for: simplifying complex queries, restricting column access, security.",
    code:"CREATE VIEW TopStudents AS\nSELECT name, marks FROM Students WHERE marks > 90;\n\n-- Use like a table\nSELECT * FROM TopStudents;\n\n-- Drop view\nDROP VIEW TopStudents;" },
  { id:24, cat:"Misc", q:"What is a Stored Procedure?",
    a:"A precompiled block of SQL stored in the DB, called by name with parameters.\n\nAdvantages: reusability, performance, security, reduces network traffic.",
    code:"CREATE PROCEDURE GetStudent(IN sid INT)\nBEGIN\n  SELECT * FROM Students WHERE id = sid;\nEND;\n\n-- Call it\nCALL GetStudent(1);" },
  { id:25, cat:"Misc", q:"What are the types of Database Relationships?",
    a:"Three types exist between entities.",
    table:[["Type","Example","Implementation"],["One-to-One (1:1)","Person ↔ Passport","FK + UNIQUE constraint"],["One-to-Many (1:N)","Customer → Orders","FK in the 'many' table"],["Many-to-Many (M:N)","Students ↔ Courses","Junction table"]] },
];

const CATS = ["All","Keys","Normalization","SQL","ACID/Tx","Misc"];
const CAT_COLORS = { Keys:"#58a6ff", Normalization:"#a78bfa", SQL:"#3fb950", "ACID/Tx":"#f59e0b", Misc:"#8b949e" };
const STORAGE_KEY = "dbms_mastered";
const CODE_KEY = "dbms_code_edits";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="code-copy-btn" onClick={() => {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
    }}>
      {copied ? <Check size={13}/> : <Copy size={13}/>}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function QACard({ item }) {
  const [open, setOpen] = useState(false);
  const [mastered, setMastered] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]").includes(item.id));
  const taRef = useRef(null);
  const editKey = `${CODE_KEY}_${item.id}`;
  const [code, setCode] = useState(() => localStorage.getItem(editKey) ?? (item.code || ""));

  function toggleMastered(e) {
    e.stopPropagation();
    setMastered(prev => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
      const next = prev ? stored.filter(x=>x!==item.id) : [...stored, item.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return !prev;
    });
  }

  function handleCodeChange(e) {
    const val = e.target.value;
    setCode(val);
    localStorage.setItem(editKey, val);
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  }

  return (
    <div className="corecs-card" style={{ borderLeft: mastered?"2px solid var(--success)":undefined }}>
      <button className="corecs-card-header" onClick={() => setOpen(v => !v)}>
        <span className="corecs-card-num">{String(item.id).padStart(2,"0")}</span>
        <span className="corecs-card-q">{item.q}</span>
        <span className="corecs-cat-badge" style={{color:CAT_COLORS[item.cat]||"#8b949e",borderColor:(CAT_COLORS[item.cat]||"#8b949e")+"44"}}>{item.cat}</span>
        <button className={`corecs-mastered-btn${mastered?" on":""}`} onClick={toggleMastered}>✓</button>
        <span className="corecs-chevron" style={{transform:open?"rotate(180deg)":undefined}}>▾</span>
      </button>
      <div className="corecs-card-body" style={{display:open?"block":"none"}}>
        <p className="corecs-answer-label">Answer</p>
        <p className="corecs-answer-text">
          {item.a.split("\n\n").map((para,i,arr)=>(
            <span key={i}>{para.split("\n").map((line,j,lines)=>(<span key={j}>{line}{j<lines.length-1&&<br/>}</span>))}{i<arr.length-1&&<><br/><br/></>}</span>
          ))}
        </p>
        {item.table && (<div style={{overflowX:"auto"}}><table className="corecs-table"><thead><tr>{item.table[0].map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{item.table.slice(1).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>)}
        {item.code !== undefined && (
          <>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 6px"}}>
              <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--accent)"}}>SQL</span>
              <CopyBtn text={code}/>
            </div>
            <div className="code-editor-wrap">
              <textarea ref={taRef} className="code-editor-ta" value={code}
                onChange={handleCodeChange} spellCheck={false}
                rows={code.split("\n").length}/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DBMSPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount/DBMS_QA.length)*100);
  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return DBMS_QA.filter(item=>{
      if(cat!=="All"&&item.cat!==cat) return false;
      if(!q) return true;
      return item.q.toLowerCase().includes(q)||item.a.toLowerCase().includes(q);
    });
  },[cat,search]);
  return (
    <div className="container collection">
      <div className="page-title">
        <div><p className="eyebrow">CORE CS · DBMS</p><h1>Database Management Systems</h1><p>Keys, Normalization, SQL, ACID — {DBMS_QA.length} questions. SQL code is editable.</p></div>
        <Database size={24}/>
      </div>
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{DBMS_QA.length}</strong><span>Total</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--success)"}}>{masteredCount}</strong><span>Mastered</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--accent)"}}>{pct}%</strong><span>Progress</span></div>
        <div className="corecs-progress-track"><div className="corecs-progress-fill" style={{width:`${pct}%`}}/></div>
      </div>
      <div className="sheet-toolbar">
        <div className="inline-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions or answers…"/></div>
        <select className="filter-select" value={cat} onChange={e=>setCat(e.target.value)}>{CATS.map(c=><option key={c} value={c}>{c==="All"?"All categories":c}</option>)}</select>
      </div>
      {filtered.length ? <div className="corecs-list">{filtered.map(item=><QACard key={item.id} item={item}/>)}</div>
        : <div className="corecs-empty"><Search size={32} style={{color:"var(--muted)",marginBottom:12}}/><p>No questions match.</p></div>}
    </div>
  );
}
