import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";

// ─── DBMS Q&A data ────────────────────────────────────────────────────────────
const DBMS_QA = [
  // Keys
  {
    id: 1, cat: "Keys",
    q: "What is DBMS? What is RDBMS? What's the difference?",
    a: "DBMS (Database Management System) is software that stores, manages, and retrieves data — stored as files, no relationships, no ACID. Examples: XML, file system.\n\nRDBMS stores data in structured tables with rows and columns. Supports relationships via keys and enforces ACID. Examples: MySQL, PostgreSQL, Oracle.",
    table: [
      ["Feature", "DBMS", "RDBMS"],
      ["Storage", "Files", "Tables"],
      ["Relationships", "None", "Via keys"],
      ["ACID", "No", "Yes"],
      ["Example", "XML, File System", "MySQL, PostgreSQL"],
    ],
  },
  {
    id: 2, cat: "Keys",
    q: "What is a Primary Key?",
    a: "A Primary Key uniquely identifies each row in a table. Rules: cannot be NULL, must be unique, only one per table.\n\nExample: student_id in a Students table.",
  },
  {
    id: 3, cat: "Keys",
    q: "What is a Foreign Key?",
    a: "A Foreign Key is a column in one table that references the Primary Key of another table. It enforces referential integrity — you can't have a value in the FK column that doesn't exist in the referenced table.",
    code: `CREATE TABLE Orders (\n  order_id    INT PRIMARY KEY,\n  customer_id INT,\n  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)\n);`,
  },
  {
    id: 4, cat: "Keys",
    q: "What is a Candidate Key?",
    a: "A Candidate Key is a minimal set of columns that can uniquely identify a row — no column can be removed and still maintain uniqueness.\n\nMultiple candidate keys can exist. One is chosen as Primary Key, others are alternate keys.\n\nExample: {email} and {phone} are both candidate keys in a Students table.",
  },
  {
    id: 5, cat: "Keys",
    q: "What is a Super Key?",
    a: "A Super Key is any combination of columns that uniquely identifies a row — may have redundant columns. A Candidate Key is a minimal Super Key.\n\nExample: {email}, {phone}, {email, name} are all super keys. Only {email} and {phone} alone are candidate keys.",
  },
  // Normalization
  {
    id: 6, cat: "Normalization",
    q: "What is Normalization?",
    a: "Normalization is the process of organizing a database to reduce data redundancy and improve data integrity.\n\nDone by decomposing tables into smaller, well-structured tables and defining relationships.\n\nAchieved through normal forms: 1NF → 2NF → 3NF → BCNF.",
  },
  {
    id: 7, cat: "Normalization",
    q: "What is 1NF (First Normal Form)?",
    a: "A table is in 1NF if each column has atomic (indivisible) values and there are no repeating groups or arrays in a column.\n\nBAD: Student(id, name, subjects='Math,Sci')\nGOOD: One row per subject — atomic values.",
  },
  {
    id: 8, cat: "Normalization",
    q: "What is 2NF (Second Normal Form)?",
    a: "A table is in 2NF if it's in 1NF and has no partial dependency — every non-key column depends on the full primary key, not just part of it. Applicable only when PK is composite.\n\nBAD: Order(order_id, product_id, product_name) — product_name depends only on product_id.\nGOOD: Split into Orders + Products table.",
  },
  {
    id: 9, cat: "Normalization",
    q: "What is 3NF (Third Normal Form)?",
    a: "A table is in 3NF if it's in 2NF and has no transitive dependency — no non-key column depends on another non-key column.\n\nBAD: Employee(emp_id, dept_id, dept_name) — dept_name depends on dept_id, not emp_id.\nGOOD: Split into Employee + Department table.",
  },
  {
    id: 10, cat: "Normalization",
    q: "What is a partial dependency?",
    a: "A partial dependency occurs when a non-key column depends on part of a composite primary key, not the full key. Violates 2NF.\n\nExample: In Order(order_id, product_id, product_name), PK is (order_id, product_id) but product_name depends only on product_id.",
  },
  {
    id: 11, cat: "Normalization",
    q: "What is a transitive dependency?",
    a: "A transitive dependency occurs when a non-key column depends on another non-key column. Violates 3NF.\n\nExample: In Employee(emp_id, dept_id, dept_name), dept_name depends on dept_id, not on emp_id (the PK). dept_name is transitively dependent on emp_id.",
  },
  // SQL
  {
    id: 12, cat: "SQL",
    q: "What is a SQL query? Write a basic SELECT query.",
    a: "SQL (Structured Query Language) is used to communicate with relational databases — querying, inserting, updating, and deleting data.",
    code: `-- Fetch all students older than 20\nSELECT * FROM Students WHERE age > 20;\n\n-- Insert\nINSERT INTO Students VALUES (1, 'Mani', 22);\n\n-- Update\nUPDATE Students SET age = 23 WHERE id = 1;\n\n-- Delete\nDELETE FROM Students WHERE id = 1;`,
  },
  {
    id: 13, cat: "SQL",
    q: "What is DISTINCT in SQL?",
    a: "DISTINCT removes duplicate values from the result set — returns only unique values.",
    code: `SELECT DISTINCT city FROM Customers;\n-- Returns each city only once`,
  },
  {
    id: 14, cat: "SQL",
    q: "What is the difference between WHERE and HAVING?",
    a: "Both filter rows, but at different stages.\n\nWHERE — filters rows before grouping. Cannot use aggregate functions.\nHAVING — filters groups after GROUP BY. Can use aggregate functions.",
    code: `-- WHERE: filters rows before grouping\nSELECT dept, COUNT(*) FROM Employees\nWHERE salary > 30000\nGROUP BY dept;\n\n-- HAVING: filters after aggregation\nSELECT dept, COUNT(*) FROM Employees\nGROUP BY dept\nHAVING COUNT(*) > 5;`,
  },
  {
    id: 15, cat: "SQL",
    q: "What is GROUP BY?",
    a: "GROUP BY groups rows that have the same values in specified columns into summary rows. Always used with aggregate functions like COUNT, SUM, AVG, MAX, MIN.",
    code: `SELECT dept, COUNT(*) AS total\nFROM Employees\nGROUP BY dept;`,
  },
  {
    id: 16, cat: "SQL",
    q: "What are Joins in SQL?",
    a: "A JOIN combines rows from two or more tables based on a related column (usually a key).\n\nTypes: INNER, LEFT, RIGHT, FULL OUTER.",
    table: [
      ["Join", "Returns"],
      ["INNER JOIN", "Only rows with matches in both tables"],
      ["LEFT JOIN", "All rows from left + matched from right (NULL if no match)"],
      ["RIGHT JOIN", "All rows from right + matched from left (NULL if no match)"],
      ["FULL OUTER JOIN", "All rows from both tables (NULLs where no match)"],
    ],
  },
  {
    id: 17, cat: "SQL",
    q: "What is INNER JOIN?",
    a: "Returns only the rows where there is a matching value in both tables. Non-matching rows from either table are excluded.",
    code: `SELECT s.name, o.order_id\nFROM Students s\nINNER JOIN Orders o ON s.id = o.student_id;\n-- Only students who have orders`,
  },
  {
    id: 18, cat: "SQL",
    q: "What is LEFT JOIN?",
    a: "Returns all rows from the left table, and the matched rows from the right table. If no match, right side columns are NULL.",
    code: `SELECT s.name, o.order_id\nFROM Students s\nLEFT JOIN Orders o ON s.id = o.student_id;\n-- All students, even those with no orders`,
  },
  {
    id: 19, cat: "SQL",
    q: "What is RIGHT JOIN?",
    a: "Returns all rows from the right table, and matched rows from the left table. If no match, left side columns are NULL.",
    code: `SELECT s.name, o.order_id\nFROM Students s\nRIGHT JOIN Orders o ON s.id = o.student_id;\n-- All orders, even those not linked to a student`,
  },
  {
    id: 20, cat: "SQL",
    q: "What is FULL OUTER JOIN?",
    a: "Returns all rows from both tables. Where there's no match on either side, NULL fills the gaps.",
    code: `SELECT s.name, o.order_id\nFROM Students s\nFULL OUTER JOIN Orders o ON s.id = o.student_id;\n-- All students + all orders, NULLs where no match`,
  },
  {
    id: 21, cat: "SQL",
    q: "What is a Subquery?",
    a: "A subquery is a query nested inside another query. Executes first, and its result is used by the outer query.",
    code: `-- Find student(s) with highest marks\nSELECT name FROM Students\nWHERE marks = (SELECT MAX(marks) FROM Students);\n\n-- IN subquery\nSELECT name FROM Students\nWHERE dept_id IN (\n  SELECT id FROM Departments WHERE location = 'Hyd'\n);`,
  },
  {
    id: 22, cat: "SQL",
    q: "What are Aggregate Functions? Name them.",
    a: "Aggregate functions perform a calculation on a set of rows and return a single value.",
    code: `COUNT(*)   -- number of rows\nSUM(col)   -- total of values\nAVG(col)   -- average\nMAX(col)   -- maximum value\nMIN(col)   -- minimum value\n\nSELECT AVG(salary) FROM Employees WHERE dept = 'IT';`,
  },
  {
    id: 23, cat: "SQL",
    q: "What is Indexing? Why is it used?",
    a: "An index is a data structure that speeds up SELECT queries by allowing the DB to jump directly to data instead of scanning every row — like a book's index.\n\nTrade-off: speeds up reads, slows down writes (INSERT/UPDATE/DELETE also update the index).\n\nTypes: Primary, Secondary, Clustered, Non-Clustered.",
    code: `CREATE INDEX idx_name ON Students(name);\n-- Now SELECT WHERE name = '...' is much faster`,
  },
  // ACID / Transactions
  {
    id: 24, cat: "ACID / Tx",
    q: "What is a Transaction?",
    a: "A transaction is a group of SQL operations treated as a single unit. Either all succeed (COMMIT) or all fail and rollback (ROLLBACK).\n\nClassic example: bank transfer — debit one account and credit another must both succeed or both fail.",
    code: `BEGIN;\n  UPDATE Accounts SET balance = balance - 500 WHERE id = 1;\n  UPDATE Accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT; -- or ROLLBACK if error`,
  },
  {
    id: 25, cat: "ACID / Tx",
    q: "What are ACID Properties?",
    a: "ACID ensures reliable database transactions.",
    table: [
      ["Property", "Meaning"],
      ["Atomicity", "All or nothing — full transaction or none"],
      ["Consistency", "DB stays valid before and after transaction"],
      ["Isolation", "Concurrent transactions don't interfere with each other"],
      ["Durability", "Committed data persists even after a crash"],
    ],
  },
  {
    id: 26, cat: "ACID / Tx",
    q: "What is Atomicity?",
    a: "Atomicity means a transaction is treated as a single unit — either all operations complete, or none do.\n\nIf any step fails, the entire transaction is rolled back.\n\nExample: In a bank transfer, if debit succeeds but credit fails, the debit is rolled back.",
  },
  {
    id: 27, cat: "ACID / Tx",
    q: "What is Consistency?",
    a: "Consistency means the database must be in a valid state before and after a transaction — all integrity constraints (PK, FK, unique) must hold.\n\nA transaction must bring the DB from one valid state to another valid state.",
  },
  {
    id: 28, cat: "ACID / Tx",
    q: "What is Isolation?",
    a: "Isolation means concurrent transactions execute independently — one transaction's intermediate state is not visible to others.\n\nPrevents: dirty reads, phantom reads, non-repeatable reads.\n\nControlled via isolation levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE.",
  },
  {
    id: 29, cat: "ACID / Tx",
    q: "What is Durability?",
    a: "Durability means once a transaction is committed, changes persist permanently — even if the system crashes immediately after.\n\nAchieved through write-ahead logs (WAL) and database recovery mechanisms.",
  },
  // Misc
  {
    id: 30, cat: "Misc",
    q: "What is the difference between DELETE, DROP, and TRUNCATE?",
    a: "All three remove data but at different levels.",
    table: [
      ["", "DELETE", "TRUNCATE", "DROP"],
      ["What it does", "Removes specific rows", "Removes all rows", "Removes entire table"],
      ["WHERE clause", "Yes", "No", "No"],
      ["Rollback", "Yes (DML)", "No (DDL)", "No (DDL)"],
      ["Structure kept", "Yes", "Yes", "No"],
      ["Trigger fired", "Yes", "No", "No"],
    ],
  },
  {
    id: 31, cat: "Misc",
    q: "What is a View? Why is it used?",
    a: "A View is a virtual table based on the result of a SQL query. It doesn't store data itself — just saves the query definition.\n\nWhy use it: simplify complex queries, restrict data access (security), present data differently without changing the actual table.",
    code: `CREATE VIEW TopStudents AS\nSELECT name, marks FROM Students WHERE marks > 90;\n\nSELECT * FROM TopStudents; -- use like a regular table`,
  },
  {
    id: 32, cat: "Misc",
    q: "What is a Stored Procedure?",
    a: "A Stored Procedure is a precompiled block of SQL stored in the database that can be called with a name and parameters.\n\nAdvantages: reusability, better performance (precompiled), security, reduce network traffic.",
    code: `CREATE PROCEDURE GetStudent(IN sid INT)\nBEGIN\n  SELECT * FROM Students WHERE id = sid;\nEND;\n\nCALL GetStudent(1);`,
  },
  {
    id: 33, cat: "Misc",
    q: "What are the types of Database Relationships?",
    a: "Three types of relationships between entities.",
    table: [
      ["Type", "Example"],
      ["One-to-One (1:1)", "Person ↔ Passport"],
      ["One-to-Many (1:N)", "Customer → Orders"],
      ["Many-to-Many (M:N)", "Students ↔ Courses (via junction table)"],
    ],
  },
  {
    id: 34, cat: "Misc",
    q: "What is a One-to-One relationship? Give an example.",
    a: "In a One-to-One (1:1) relationship, one record in table A corresponds to exactly one record in table B and vice versa.\n\nExample: Person ↔ Passport — one person has exactly one passport. Implemented with a FK + UNIQUE constraint.",
  },
  {
    id: 35, cat: "Misc",
    q: "What is a One-to-Many relationship? Give an example.",
    a: "In a One-to-Many (1:N) relationship, one record in table A can be associated with many records in table B, but each record in B belongs to only one in A.\n\nExample: Customer → Orders — one customer places many orders, but each order belongs to one customer. Implemented with a FK in the 'many' table.",
  },
  {
    id: 36, cat: "Misc",
    q: "What is a Many-to-Many relationship? Give an example.",
    a: "In a Many-to-Many (M:N) relationship, records in table A can relate to multiple records in table B and vice versa.\n\nExample: Students ↔ Courses — a student can enroll in many courses, a course can have many students.\n\nImplemented using a junction table: Enrollments(student_id, course_id).",
  },
];

const CATEGORIES = ["All", "Keys", "Normalization", "SQL", "ACID / Tx", "Misc"];

const CAT_COLORS = {
  Keys: "var(--accent)",
  Normalization: "#a78bfa",
  SQL: "var(--success)",
  "ACID / Tx": "#f59e0b",
  Misc: "var(--muted)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function QACard({ item, localSearch }) {
  const [open, setOpen] = useState(false);
  const [mastered, setMastered] = useState(
    () => JSON.parse(localStorage.getItem("dbms_mastered") || "[]").includes(item.id)
  );

  function toggleMastered(e) {
    e.stopPropagation();
    setMastered((prev) => {
      const stored = JSON.parse(localStorage.getItem("dbms_mastered") || "[]");
      const next = prev
        ? stored.filter((x) => x !== item.id)
        : [...stored, item.id];
      localStorage.setItem("dbms_mastered", JSON.stringify(next));
      return !prev;
    });
  }

  // Auto-open when searching
  const forceOpen = Boolean(localSearch.trim()) && !open;
  const isOpen = open || (Boolean(localSearch.trim()) && !open === false) || (Boolean(localSearch.trim()));

  return (
    <div
      className="corecs-card"
      style={{ borderLeft: mastered ? "2px solid var(--success)" : undefined }}
    >
      <button className="corecs-card-header" onClick={() => setOpen((v) => !v)}>
        <span className="corecs-card-num">{String(item.id).padStart(2, "0")}</span>
        <span className="corecs-card-q">{item.q}</span>
        <span
          className="corecs-cat-badge"
          style={{ color: CAT_COLORS[item.cat], borderColor: CAT_COLORS[item.cat] + "44" }}
        >
          {item.cat}
        </span>
        <button
          className={`corecs-mastered-btn${mastered ? " on" : ""}`}
          onClick={toggleMastered}
          title={mastered ? "Unmark mastered" : "Mark mastered"}
        >
          ✓
        </button>
        <span className="corecs-chevron" style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="corecs-card-body">
          <p className="corecs-answer-label">Answer</p>
          <p className="corecs-answer-text">
            {item.a.split("\n\n").map((para, i) => (
              <span key={i}>
                {para.split("\n").map((line, j) => (
                  <span key={j}>{line}{j < para.split("\n").length - 1 && <br />}</span>
                ))}
                {i < item.a.split("\n\n").length - 1 && <><br /><br /></>}
              </span>
            ))}
          </p>
          {item.code && (
            <pre className="corecs-code">{item.code}</pre>
          )}
          {item.table && (
            <table className="corecs-table">
              <thead>
                <tr>{item.table[0].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {item.table.slice(1).map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoreCSPage() {
  const [activeTab, setActiveTab] = useState("DBMS");
  const [activeCategory, setActiveCategory] = useState("All");
  const [localSearch, setLocalSearch] = useState("");

  // Mastered count from localStorage (recalculated on render)
  const masteredIds = JSON.parse(localStorage.getItem("dbms_mastered") || "[]");
  const masteredCount = masteredIds.length;

  const filtered = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return DBMS_QA.filter((item) => {
      if (activeCategory !== "All" && item.cat !== activeCategory) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [activeCategory, localSearch]);

  return (
    <div className="container collection">
      {/* Page header */}
      <div className="page-title">
        <div>
          <p className="eyebrow">CORE CS SUBJECTS</p>
          <h1>Theory & Interview Q&A</h1>
          <p>DBMS, OS, OOP, CN — all topics from the sheet.</p>
        </div>
        <BookOpen size={24} />
      </div>

      {/* Subject tabs */}
      <div className="corecs-tabs">
        {["DBMS", "OS", "OOP", "CN"].map((tab) => (
          <button
            key={tab}
            className={`corecs-tab${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "DBMS" && (
              <span className="corecs-tab-count">{DBMS_QA.length}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "DBMS" ? (
        <>
          {/* Stats strip */}
          <div className="corecs-stats">
            <div className="corecs-stat">
              <strong>{DBMS_QA.length}</strong>
              <span>Total</span>
            </div>
            <div className="corecs-stat">
              <strong style={{ color: "var(--success)" }}>{masteredCount}</strong>
              <span>Mastered</span>
            </div>
            <div className="corecs-stat">
              <strong style={{ color: "var(--accent)" }}>
                {Math.round((masteredCount / DBMS_QA.length) * 100)}%
              </strong>
              <span>Progress</span>
            </div>
            <div className="corecs-progress-track">
              <div
                className="corecs-progress-fill"
                style={{ width: `${(masteredCount / DBMS_QA.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="sheet-toolbar">
            <div className="inline-search">
              <Search size={15} />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search questions or answers…"
              />
            </div>
            <select
              className="filter-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
              ))}
            </select>
          </div>

          {/* Q&A list */}
          {filtered.length ? (
            <div className="corecs-list">
              {filtered.map((item) => (
                <QACard key={item.id} item={item} localSearch={localSearch} />
              ))}
            </div>
          ) : (
            <div className="corecs-empty">
              <Search size={32} style={{ color: "var(--muted)", marginBottom: 12 }} />
              <p>No questions match your search.</p>
            </div>
          )}
        </>
      ) : (
        <div className="corecs-coming-soon">
          <BookOpen size={40} style={{ color: "var(--muted)", marginBottom: 16 }} />
          <h2>{activeTab} Q&A</h2>
          <p>Coming soon — content for this subject will appear here.</p>
        </div>
      )}
    </div>
  );
}
