import { useMemo, useState } from "react";
import { Database, Search } from "lucide-react";

const DBMS_QA = [
  { id:1, cat:"Keys", q:"What is DBMS? What is RDBMS? What's the difference?",
    a:"DBMS stores data as files with no relationships and no ACID. Examples: XML, file system.\n\nRDBMS stores data in structured tables, supports relationships via keys, and enforces ACID. Examples: MySQL, PostgreSQL, Oracle.",
    table:[["Feature","DBMS","RDBMS"],["Storage","Files","Tables"],["Relationships","None","Via keys"],["ACID","No","Yes"],["Example","XML, File System","MySQL, PostgreSQL"]] },
  { id:2, cat:"Keys", q:"What is a Primary Key?",
    a:"A Primary Key uniquely identifies each row in a table.\n\nRules: cannot be NULL, must be unique, only one per table.\n\nExample: student_id in a Students table." },
  { id:3, cat:"Keys", q:"What is a Foreign Key?",
    a:"A Foreign Key references the Primary Key of another table and enforces referential integrity — you can't have a FK value that doesn't exist in the referenced table.",
    code:"CREATE TABLE Orders (\n  order_id    INT PRIMARY KEY,\n  customer_id INT,\n  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)\n);" },
  { id:4, cat:"Keys", q:"What is a Candidate Key?",
    a:"A Candidate Key is the minimal set of columns that uniquely identifies a row — remove any column and uniqueness breaks.\n\nMultiple candidate keys can exist; one is chosen as Primary Key, rest are alternate keys.\n\nExample: {email} and {phone} are both candidate keys in a Students table." },
  { id:5, cat:"Keys", q:"What is a Super Key?",
    a:"A Super Key is any combination of columns that uniquely identifies a row — may have redundant columns. A Candidate Key is a minimal Super Key.\n\nExample: {email}, {phone}, {email, name} are all super keys. Only {email} and {phone} alone are candidate keys." },
  { id:6, cat:"Normalization", q:"What is Normalization?",
    a:"Normalization organizes a database to reduce data redundancy and improve integrity by decomposing tables into smaller well-structured ones.\n\nNormal forms: 1NF → 2NF → 3NF → BCNF." },
  { id:7, cat:"Normalization", q:"What is 1NF?",
    a:"Each column has atomic (indivisible) values. No repeating groups or multi-valued columns.\n\nBAD: Student(id, name, subjects='Math,Sci')\nGOOD: One row per subject." },
  { id:8, cat:"Normalization", q:"What is 2NF?",
    a:"1NF + No partial dependency — every non-key column depends on the full composite primary key, not just part of it.\n\nBAD: Order(order_id, product_id, product_name) — product_name depends only on product_id.\nGOOD: Split into Orders + Products tables." },
  { id:9, cat:"Normalization", q:"What is 3NF?",
    a:"2NF + No transitive dependency — no non-key column depends on another non-key column.\n\nBAD: Employee(emp_id, dept_id, dept_name) — dept_name depends on dept_id.\nGOOD: Split into Employee + Department tables." },
  { id:10, cat:"Normalization", q:"What is a partial dependency?",
    a:"A non-key column depends on part of a composite PK, not the full key. Violates 2NF.\n\nExample: In Order(order_id, product_id, product_name), product_name depends only on product_id, not the full (order_id, product_id) PK." },
  { id:11, cat:"Normalization", q:"What is a transitive dependency?",
    a:"A non-key column depends on another non-key column (indirectly on PK). Violates 3NF.\n\nExample: Employee(emp_id, dept_id, dept_name) — dept_name depends on dept_id, not emp_id." },
  { id:12, cat:"SQL", q:"What is a SQL query? Write a basic SELECT query.",
    a:"SQL (Structured Query Language) is used to communicate with relational databases.",
    code:"-- Select\nSELECT * FROM Students WHERE age > 20;\n-- Insert\nINSERT INTO Students VALUES (1, 'Mani', 22);\n-- Update\nUPDATE Students SET age = 23 WHERE id = 1;\n-- Delete\nDELETE FROM Students WHERE id = 1;" },
  { id:13, cat:"SQL", q:"What is DISTINCT in SQL?",
    a:"DISTINCT removes duplicate values from the result set.",
    code:"SELECT DISTINCT city FROM Customers;" },
  { id:14, cat:"SQL", q:"What is the difference between WHERE and HAVING?",
    a:"WHERE filters rows before grouping — cannot use aggregate functions.\n\nHAVING filters groups after GROUP BY — can use aggregate functions.",
    code:"SELECT dept, COUNT(*) FROM Employees\nWHERE salary > 30000\nGROUP BY dept\nHAVING COUNT(*) > 5;" },
  { id:15, cat:"SQL", q:"What is GROUP BY?",
    a:"GROUP BY groups rows with the same values into summary rows. Always used with aggregate functions.",
    code:"SELECT dept, COUNT(*) AS total\nFROM Employees\nGROUP BY dept;" },
  { id:16, cat:"SQL", q:"What are Joins? Explain all types.",
    a:"A JOIN combines rows from two tables based on a related column.",
    table:[["Join","Returns"],["INNER JOIN","Matching rows only"],["LEFT JOIN","All left + matched right (NULL if no match)"],["RIGHT JOIN","All right + matched left (NULL if no match)"],["FULL OUTER JOIN","All rows from both (NULLs where no match)"]],
    code:"-- INNER: only students who have orders\nSELECT s.name, o.order_id\nFROM Students s\nINNER JOIN Orders o ON s.id = o.student_id;\n\n-- LEFT: all students, even those with no orders\nSELECT s.name, o.order_id\nFROM Students s\nLEFT JOIN Orders o ON s.id = o.student_id;" },
  { id:17, cat:"SQL", q:"What is a Subquery?",
    a:"A subquery is a query nested inside another. Executes first, result used by outer query.",
    code:"SELECT name FROM Students\nWHERE marks = (SELECT MAX(marks) FROM Students);\n\nSELECT name FROM Students\nWHERE dept_id IN (\n  SELECT id FROM Departments WHERE location = 'Hyd'\n);" },
  { id:18, cat:"SQL", q:"What are Aggregate Functions?",
    a:"Aggregate functions compute a value from a set of rows and return one result.",
    code:"COUNT(*)   -- number of rows\nSUM(col)   -- total\nAVG(col)   -- average\nMAX(col)   -- maximum\nMIN(col)   -- minimum\n\nSELECT AVG(salary) FROM Employees WHERE dept = 'IT';" },
  { id:19, cat:"SQL", q:"What is Indexing?",
    a:"An index speeds up SELECT queries by letting the DB jump directly to data instead of full scan — like a book index.\n\nTrade-off: faster reads, slower writes.\n\nTypes: Primary, Secondary, Clustered, Non-Clustered.",
    code:"CREATE INDEX idx_name ON Students(name);" },
  { id:20, cat:"ACID/Tx", q:"What is a Transaction?",
    a:"A transaction is a group of SQL operations treated as one unit — either all succeed (COMMIT) or all rollback (ROLLBACK).",
    code:"BEGIN;\n  UPDATE Accounts SET balance = balance - 500 WHERE id = 1;\n  UPDATE Accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;" },
  { id:21, cat:"ACID/Tx", q:"What are ACID Properties?",
    a:"ACID ensures reliable transactions.",
    table:[["Property","Meaning"],["Atomicity","All or nothing"],["Consistency","DB stays valid before and after"],["Isolation","Concurrent transactions don't interfere"],["Durability","Committed data survives crashes"]] },
  { id:22, cat:"ACID/Tx", q:"Explain each ACID property.",
    a:"Atomicity: all steps complete or none do.\n\nConsistency: all constraints (PK, FK, unique) hold before and after.\n\nIsolation: transactions run independently — no dirty reads, phantom reads. Levels: READ UNCOMMITTED → SERIALIZABLE.\n\nDurability: committed data persists even after crash — achieved via write-ahead logs (WAL)." },
  { id:23, cat:"Misc", q:"DELETE vs DROP vs TRUNCATE?",
    a:"All three remove data but at different levels.",
    table:[["","DELETE","TRUNCATE","DROP"],["Removes","Specific rows","All rows","Entire table"],["WHERE","Yes","No","No"],["Rollback","Yes (DML)","No (DDL)","No (DDL)"],["Structure","Kept","Kept","Gone"]] },
  { id:24, cat:"Misc", q:"What is a View?",
    a:"A View is a virtual table based on a query — stores no data itself, just the query definition.\n\nUse for: simplifying complex queries, restricting column access, presenting data differently.",
    code:"CREATE VIEW TopStudents AS\nSELECT name, marks FROM Students WHERE marks > 90;\n\nSELECT * FROM TopStudents;" },
  { id:25, cat:"Misc", q:"What is a Stored Procedure?",
    a:"A precompiled block of SQL stored in the DB, called by name with parameters.\n\nAdvantages: reusability, performance (precompiled), security, reduces network traffic.",
    code:"CREATE PROCEDURE GetStudent(IN sid INT)\nBEGIN\n  SELECT * FROM Students WHERE id = sid;\nEND;\n\nCALL GetStudent(1);" },
  { id:26, cat:"Misc", q:"What are the types of Database Relationships?",
    a:"Three types exist between entities.",
    table:[["Type","Example"],["One-to-One (1:1)","Person ↔ Passport"],["One-to-Many (1:N)","Customer → Orders"],["Many-to-Many (M:N)","Students ↔ Courses (junction table)"]] },
];

const CATS = ["All","Keys","Normalization","SQL","ACID/Tx","Misc"];
const CAT_COLORS = { Keys:"#58a6ff", Normalization:"#a78bfa", SQL:"#3fb950", "ACID/Tx":"#f59e0b", Misc:"#8b949e" };
const STORAGE_KEY = "dbms_mastered";

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
        <span className="corecs-card-num">{String(item.id).padStart(2,"0")}</span>
        <span className="corecs-card-q">{item.q}</span>
        <span className="corecs-cat-badge" style={{ color: CAT_COLORS[item.cat]||"#8b949e", borderColor:(CAT_COLORS[item.cat]||"#8b949e")+"44" }}>{item.cat}</span>
        <button className={`corecs-mastered-btn${mastered?" on":""}`} onClick={toggleMastered}>✓</button>
        <span className="corecs-chevron" style={{ transform: open?"rotate(180deg)":undefined }}>▾</span>
      </button>
      <div className="corecs-card-body" style={{ display: open?"block":"none" }}>
        <p className="corecs-answer-label">Answer</p>
        <p className="corecs-answer-text">
          {item.a.split("\n\n").map((para,i,arr)=>(
            <span key={i}>{para.split("\n").map((line,j,lines)=>(<span key={j}>{line}{j<lines.length-1&&<br/>}</span>))}{i<arr.length-1&&<><br/><br/></>}</span>
          ))}
        </p>
        {item.code && <pre className="corecs-code">{item.code}</pre>}
        {item.table && (
          <div style={{overflowX:"auto"}}>
            <table className="corecs-table">
              <thead><tr>{item.table[0].map((h,i)=><th key={i}>{h}</th>)}</tr></thead>
              <tbody>{item.table.slice(1).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DBMSPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount / DBMS_QA.length) * 100);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DBMS_QA.filter(item => {
      if (cat !== "All" && item.cat !== cat) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [cat, search]);
  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">CORE CS · DBMS</p>
          <h1>Database Management Systems</h1>
          <p>Keys, Normalization, SQL, ACID, Transactions — {DBMS_QA.length} questions.</p>
        </div>
        <Database size={24} />
      </div>
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{DBMS_QA.length}</strong><span>Total</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--success)"}}>{masteredCount}</strong><span>Mastered</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--accent)"}}>{pct}%</strong><span>Progress</span></div>
        <div className="corecs-progress-track"><div className="corecs-progress-fill" style={{width:`${pct}%`}}/></div>
      </div>
      <div className="sheet-toolbar">
        <div className="inline-search">
          <Search size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions or answers…"/>
        </div>
        <select className="filter-select" value={cat} onChange={e=>setCat(e.target.value)}>
          {CATS.map(c=><option key={c} value={c}>{c==="All"?"All categories":c}</option>)}
        </select>
      </div>
      {filtered.length ? (
        <div className="corecs-list">{filtered.map(item=><QACard key={item.id} item={item}/>)}</div>
      ) : (
        <div className="corecs-empty"><Search size={32} style={{color:"var(--muted)",marginBottom:12}}/><p>No questions match.</p></div>
      )}
    </div>
  );
}
