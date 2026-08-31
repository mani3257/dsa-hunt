import { useMemo, useState } from "react";
import { BookOpen, Search, Code2 } from "lucide-react";

// ─── DBMS ─────────────────────────────────────────────────────────────────────
const DBMS_QA = [
  { id:1, cat:"Keys", q:"What is DBMS? What is RDBMS? What's the difference?",
    a:"DBMS stores data as files with no relationships and no ACID. Examples: XML, file system.\n\nRDBMS stores data in structured tables, supports relationships via keys, and enforces ACID. Examples: MySQL, PostgreSQL, Oracle.",
    table:[["Feature","DBMS","RDBMS"],["Storage","Files","Tables"],["Relationships","None","Via keys"],["ACID","No","Yes"],["Example","XML, File System","MySQL, PostgreSQL"]] },
  { id:2, cat:"Keys", q:"What is a Primary Key?",
    a:"A Primary Key uniquely identifies each row in a table.\n\nRules: cannot be NULL, must be unique, only one per table.\n\nExample: student_id in a Students table." },
  { id:3, cat:"Keys", q:"What is a Foreign Key?",
    a:"A Foreign Key references the Primary Key of another table and enforces referential integrity — you can't have a FK value that doesn't exist in the referenced table.",
    code:{ java:"// JPA example\n@Entity\nclass Order {\n  @Id int orderId;\n  @ManyToOne\n  @JoinColumn(name=\"customer_id\")\n  Customer customer;\n}", sql:"CREATE TABLE Orders (\n  order_id    INT PRIMARY KEY,\n  customer_id INT,\n  FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)\n);" } },
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
    code:{ java:"// JDBC example\nConnection conn = DriverManager.getConnection(url, user, pass);\nPreparedStatement ps = conn.prepareStatement(\n  \"SELECT * FROM Students WHERE age > ?\"\n);\nps.setInt(1, 20);\nResultSet rs = ps.executeQuery();", sql:"-- Select\nSELECT * FROM Students WHERE age > 20;\n-- Insert\nINSERT INTO Students VALUES (1, 'Mani', 22);\n-- Update\nUPDATE Students SET age = 23 WHERE id = 1;\n-- Delete\nDELETE FROM Students WHERE id = 1;" } },
  { id:13, cat:"SQL", q:"What is DISTINCT in SQL?",
    a:"DISTINCT removes duplicate values from the result set.",
    code:{ sql:"SELECT DISTINCT city FROM Customers;" } },
  { id:14, cat:"SQL", q:"What is the difference between WHERE and HAVING?",
    a:"WHERE filters rows before grouping — cannot use aggregate functions.\n\nHAVING filters groups after GROUP BY — can use aggregate functions.",
    code:{ sql:"SELECT dept, COUNT(*) FROM Employees\nWHERE salary > 30000\nGROUP BY dept\nHAVING COUNT(*) > 5;" } },
  { id:15, cat:"SQL", q:"What is GROUP BY?",
    a:"GROUP BY groups rows with the same values into summary rows. Always used with aggregate functions.",
    code:{ sql:"SELECT dept, COUNT(*) AS total\nFROM Employees\nGROUP BY dept;" } },
  { id:16, cat:"SQL", q:"What are Joins? Explain all types.",
    a:"A JOIN combines rows from two tables based on a related column.",
    table:[["Join","Returns"],["INNER JOIN","Matching rows only"],["LEFT JOIN","All left + matched right (NULL if no match)"],["RIGHT JOIN","All right + matched left (NULL if no match)"],["FULL OUTER JOIN","All rows from both (NULLs where no match)"]],
    code:{ sql:"-- INNER: only students who have orders\nSELECT s.name, o.order_id\nFROM Students s\nINNER JOIN Orders o ON s.id = o.student_id;\n\n-- LEFT: all students, even those with no orders\nSELECT s.name, o.order_id\nFROM Students s\nLEFT JOIN Orders o ON s.id = o.student_id;" } },
  { id:17, cat:"SQL", q:"What is a Subquery?",
    a:"A subquery is a query nested inside another. Executes first, result used by outer query.",
    code:{ sql:"-- Student with highest marks\nSELECT name FROM Students\nWHERE marks = (SELECT MAX(marks) FROM Students);\n\n-- IN subquery\nSELECT name FROM Students\nWHERE dept_id IN (\n  SELECT id FROM Departments WHERE location = 'Hyd'\n);" } },
  { id:18, cat:"SQL", q:"What are Aggregate Functions?",
    a:"Aggregate functions compute a value from a set of rows and return one result.",
    code:{ sql:"COUNT(*)   -- number of rows\nSUM(col)   -- total\nAVG(col)   -- average\nMAX(col)   -- maximum\nMIN(col)   -- minimum\n\nSELECT AVG(salary) FROM Employees WHERE dept = 'IT';" } },
  { id:19, cat:"SQL", q:"What is Indexing?",
    a:"An index speeds up SELECT queries by letting the DB jump directly to data instead of full scan — like a book index.\n\nTrade-off: faster reads, slower writes (index must update on INSERT/UPDATE/DELETE).\n\nTypes: Primary, Secondary, Clustered, Non-Clustered.",
    code:{ sql:"CREATE INDEX idx_name ON Students(name);" } },
  { id:20, cat:"ACID/Tx", q:"What is a Transaction?",
    a:"A transaction is a group of SQL operations treated as one unit — either all succeed (COMMIT) or all rollback (ROLLBACK).",
    code:{ sql:"BEGIN;\n  UPDATE Accounts SET balance = balance - 500 WHERE id = 1;\n  UPDATE Accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;" } },
  { id:21, cat:"ACID/Tx", q:"What are ACID Properties?",
    a:"ACID ensures reliable transactions.",
    table:[["Property","Meaning"],["Atomicity","All or nothing"],["Consistency","DB stays valid before and after"],["Isolation","Concurrent transactions don't interfere"],["Durability","Committed data survives crashes"]] },
  { id:22, cat:"ACID/Tx", q:"Explain each ACID property.",
    a:"Atomicity: all steps complete or none do.\n\nConsistency: all constraints (PK, FK, unique) hold before and after.\n\nIsolation: transactions run independently — no dirty reads, phantom reads, or non-repeatable reads. Levels: READ UNCOMMITTED → SERIALIZABLE.\n\nDurability: committed data persists even after crash — achieved via write-ahead logs (WAL)." },
  { id:23, cat:"Misc", q:"DELETE vs DROP vs TRUNCATE?",
    a:"All three remove data but at different levels.",
    table:[["","DELETE","TRUNCATE","DROP"],["Removes","Specific rows","All rows","Entire table"],["WHERE","Yes","No","No"],["Rollback","Yes (DML)","No (DDL)","No (DDL)"],["Structure","Kept","Kept","Gone"]] },
  { id:24, cat:"Misc", q:"What is a View?",
    a:"A View is a virtual table based on a query — stores no data itself, just the query definition.\n\nUse for: simplifying complex queries, restricting column access, presenting data differently.",
    code:{ sql:"CREATE VIEW TopStudents AS\nSELECT name, marks FROM Students WHERE marks > 90;\n\nSELECT * FROM TopStudents;" } },
  { id:25, cat:"Misc", q:"What is a Stored Procedure?",
    a:"A precompiled block of SQL stored in the DB, called by name with parameters.\n\nAdvantages: reusability, performance (precompiled), security, reduces network traffic.",
    code:{ sql:"CREATE PROCEDURE GetStudent(IN sid INT)\nBEGIN\n  SELECT * FROM Students WHERE id = sid;\nEND;\n\nCALL GetStudent(1);" } },
  { id:26, cat:"Misc", q:"What are the types of Database Relationships?",
    a:"Three types exist between entities.",
    table:[["Type","Example"],["One-to-One (1:1)","Person ↔ Passport"],["One-to-Many (1:N)","Customer → Orders"],["Many-to-Many (M:N)","Students ↔ Courses (junction table)"]] },
];

// ─── OS ───────────────────────────────────────────────────────────────────────
const OS_QA = [
  { id:1, cat:"Processes", q:"What is a Process? What is a Thread? What's the difference?",
    a:"Process: an independent program in execution with its own memory space (code, data, heap, stack).\n\nThread: a lightweight unit of execution within a process — shares the process's memory space.\n\nKey difference: processes are isolated; threads share memory and are faster to create/switch.",
    table:[["","Process","Thread"],["Memory","Own address space","Shared with process"],["Creation","Slower (OS call)","Faster"],["Communication","IPC (pipes, sockets)","Shared memory"],["Crash impact","Isolated","Can crash whole process"]],
    code:{ java:"// Creating a thread in Java\nclass MyThread extends Thread {\n  public void run() {\n    System.out.println(\"Thread running\");\n  }\n}\nnew MyThread().start();\n\n// OR using Runnable\nThread t = new Thread(() -> System.out.println(\"Lambda thread\"));\nt.start();", python:"import threading\n\ndef task():\n    print('Thread running')\n\nt = threading.Thread(target=task)\nt.start()\nt.join()" } },
  { id:2, cat:"Processes", q:"What is Process Scheduling?",
    a:"Process scheduling is how the OS decides which process gets CPU time and when.\n\nTypes:\n• Long-term scheduler: controls degree of multiprogramming (new → ready)\n• Short-term scheduler (CPU scheduler): picks which ready process runs next\n• Medium-term scheduler: swaps processes in/out of memory" },
  { id:3, cat:"Scheduling", q:"Explain CPU Scheduling Algorithms.",
    a:"FCFS (First Come First Served): simplest, non-preemptive, convoy effect problem.\n\nSJF (Shortest Job First): picks process with least burst time, optimal average wait time, starvation possible.\n\nRound Robin: each process gets a time quantum in rotation — best for time-sharing, depends on quantum size.\n\nPriority Scheduling: highest priority runs first — starvation solved by aging (gradually increase priority of waiting processes).",
    table:[["Algorithm","Preemptive","Starvation","Best For"],["FCFS","No","No","Simple batch"],["SJF","Optional","Yes","Min avg wait"],["Round Robin","Yes","No","Time-sharing"],["Priority","Optional","Yes","Real-time"]] },
  { id:4, cat:"Processes", q:"What is Context Switching?",
    a:"Context switching is saving the state (registers, PC, stack pointer) of a running process/thread and loading the state of the next one.\n\nState saved in PCB (Process Control Block).\n\nOverhead: pure CPU wasted time — no useful work during a context switch." },
  { id:5, cat:"Deadlock", q:"What is Deadlock? What are the four conditions?",
    a:"Deadlock is a situation where two or more processes are blocked forever, each waiting for a resource held by another.\n\nFour necessary conditions (all must hold simultaneously):\n1. Mutual Exclusion — resource held by one process at a time\n2. Hold and Wait — process holds one resource while waiting for another\n3. No Preemption — resource can't be forcibly taken away\n4. Circular Wait — P1 waits for P2, P2 waits for P3, P3 waits for P1",
    code:{ java:"// Classic deadlock scenario\nObject lock1 = new Object(), lock2 = new Object();\n\nThread t1 = new Thread(() -> {\n  synchronized(lock1) {\n    synchronized(lock2) { /* work */ }\n  }\n});\n\nThread t2 = new Thread(() -> {\n  synchronized(lock2) {  // reverses order → deadlock\n    synchronized(lock1) { /* work */ }\n  }\n});\nt1.start(); t2.start();", python:"import threading\n\nlock1 = threading.Lock()\nlock2 = threading.Lock()\n\ndef t1():\n    with lock1:\n        with lock2: pass  # deadlock if t2 reverses order\n\ndef t2():\n    with lock2:\n        with lock1: pass" } },
  { id:6, cat:"Deadlock", q:"How is Deadlock handled?",
    a:"Prevention: eliminate one of the four conditions (e.g., request all resources at once to break Hold & Wait).\n\nAvoidance: Banker's Algorithm — check if granting a resource keeps the system in a safe state.\n\nDetection & Recovery: allow deadlock, detect via resource allocation graph, then recover by killing a process or preempting resources.\n\nIgnore: Ostrich algorithm — used in most OSes (rare deadlocks, just reboot)." },
  { id:7, cat:"Synchronization", q:"What are Semaphores and Mutex?",
    a:"Mutex (Mutual Exclusion Lock): binary lock — only the thread that locked it can unlock it. Used for critical section protection.\n\nSemaphore: a counter-based signaling mechanism. Binary semaphore = mutex. Counting semaphore controls access to a pool of N resources.\n\nKey difference: mutex has ownership (only locker unlocks), semaphore has no ownership (any thread can signal).",
    code:{ java:"// Mutex using synchronized\nsynchronized(this) {\n  // critical section\n}\n\n// Semaphore (allow 3 concurrent)\nSemaphore sem = new Semaphore(3);\nsem.acquire(); // wait\n// critical section\nsem.release(); // signal", python:"import threading\n\n# Mutex\nlock = threading.Lock()\nwith lock:\n    pass  # critical section\n\n# Semaphore (allow 3 concurrent)\nsem = threading.Semaphore(3)\nwith sem:\n    pass  # critical section" } },
  { id:8, cat:"Synchronization", q:"What is Synchronization? What problems does it solve?",
    a:"Synchronization coordinates threads accessing shared resources to prevent race conditions.\n\nClassic problems:\n• Race Condition: two threads read-modify-write same var — result depends on order\n• Producer-Consumer: producer adds to buffer, consumer removes — need to coordinate\n• Readers-Writers: multiple readers OK, writer needs exclusive access\n• Dining Philosophers: classic deadlock/starvation illustration" },
  { id:9, cat:"Memory", q:"What is Paging and Segmentation?",
    a:"Paging: physical memory divided into fixed-size frames; logical memory into same-size pages. OS maintains a page table to map page→frame. Eliminates external fragmentation but causes internal fragmentation.\n\nSegmentation: memory divided into variable-size segments (code, stack, heap, data). Each segment has a base+limit. Eliminates internal fragmentation but causes external fragmentation.",
    table:[["","Paging","Segmentation"],["Size","Fixed","Variable"],["External fragmentation","No","Yes"],["Internal fragmentation","Yes","No"],["User view","Hidden","Visible (logical)"]] },
  { id:10, cat:"Memory", q:"What is Virtual Memory?",
    a:"Virtual memory allows a process to use more memory than physically available by storing parts of it on disk (swap space).\n\nOnly the active portion (working set) stays in RAM. Inactive pages are swapped out.\n\nBenefits: run large programs, memory isolation between processes, efficient memory use." },
  { id:11, cat:"Memory", q:"What are Page Replacement Algorithms?",
    a:"When RAM is full and a new page is needed, the OS evicts an existing page using a replacement algorithm.\n\nFIFO: evict oldest page — simple but suffers Belady's anomaly.\nLRU (Least Recently Used): evict page not used for longest time — good in practice, costly to implement exactly.\nOptimal: evict page that won't be used for longest future time — theoretical best, not practical.",
    table:[["Algorithm","Idea","Issue"],["FIFO","Evict oldest","Belady's anomaly"],["LRU","Evict least recently used","Implementation cost"],["Optimal","Evict furthest future use","Needs future knowledge"]] },
];

// ─── OOP ──────────────────────────────────────────────────────────────────────
const OOP_QA = [
  { id:1, cat:"Basics", q:"What is a Class and an Object?",
    a:"Class: a blueprint/template that defines attributes (fields) and behaviors (methods).\n\nObject: an instance of a class — actual entity created in memory using 'new'.\n\nAnalogy: Class = cookie cutter, Object = the cookie.",
    code:{ java:"class Dog {\n  String name;\n  int age;\n\n  void bark() {\n    System.out.println(name + \" says Woof!\");\n  }\n}\n\nDog d = new Dog();\nd.name = \"Bruno\";\nd.bark();", python:"class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def bark(self):\n        print(f'{self.name} says Woof!')\n\nd = Dog('Bruno', 3)\nd.bark()" } },
  { id:2, cat:"Pillars", q:"What is Encapsulation?",
    a:"Encapsulation bundles data (fields) and methods that operate on them into a single unit (class), and restricts direct access to internal data using access modifiers.\n\nAchieved via private fields + public getters/setters.\n\nBenefit: hides implementation, prevents invalid state, improves maintainability.",
    code:{ java:"class BankAccount {\n  private double balance; // hidden\n\n  public double getBalance() { return balance; }\n\n  public void deposit(double amount) {\n    if (amount > 0) balance += amount; // validation\n  }\n}", python:"class BankAccount:\n    def __init__(self):\n        self.__balance = 0  # private (name mangling)\n\n    def get_balance(self):\n        return self.__balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount" } },
  { id:3, cat:"Pillars", q:"What is Abstraction?",
    a:"Abstraction hides complex implementation details and exposes only what's necessary.\n\nAchieved via: abstract classes (partial implementation) and interfaces (contract only).\n\nDifference from Encapsulation: Encapsulation hides data, Abstraction hides complexity.",
    code:{ java:"abstract class Shape {\n  abstract double area(); // must implement\n  void print() {\n    System.out.println(\"Area: \" + area());\n  }\n}\n\nclass Circle extends Shape {\n  double r;\n  Circle(double r) { this.r = r; }\n  double area() { return Math.PI * r * r; }\n}", python:"from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): pass\n\n    def print_area(self):\n        print(f'Area: {self.area()}')\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14 * self.r ** 2" } },
  { id:4, cat:"Pillars", q:"What is Inheritance?",
    a:"Inheritance allows a class (child/subclass) to acquire properties and behaviors of another class (parent/superclass).\n\nTypes: Single, Multilevel, Hierarchical, Multiple (via interfaces in Java).\n\nBenefit: code reuse, IS-A relationship.",
    code:{ java:"class Animal {\n  String name;\n  void eat() { System.out.println(name + \" eats\"); }\n}\n\nclass Dog extends Animal {\n  void bark() { System.out.println(name + \" barks\"); }\n}\n\nDog d = new Dog();\nd.name = \"Rex\";\nd.eat();   // inherited\nd.bark();  // own", python:"class Animal:\n    def __init__(self, name):\n        self.name = name\n    def eat(self):\n        print(f'{self.name} eats')\n\nclass Dog(Animal):\n    def bark(self):\n        print(f'{self.name} barks')\n\nd = Dog('Rex')\nd.eat()   # inherited\nd.bark()" } },
  { id:5, cat:"Pillars", q:"What is Polymorphism?",
    a:"Polymorphism means 'many forms' — same method name behaves differently based on context.\n\nCompile-time (Static): Method Overloading — same name, different parameters.\nRuntime (Dynamic): Method Overriding — subclass redefines parent method, resolved at runtime via dynamic dispatch.",
    code:{ java:"// Overloading (compile-time)\nclass Calc {\n  int add(int a, int b) { return a+b; }\n  double add(double a, double b) { return a+b; }\n}\n\n// Overriding (runtime)\nclass Animal { void sound() { System.out.println(\"...\"); } }\nclass Cat extends Animal {\n  @Override\n  void sound() { System.out.println(\"Meow\"); }\n}\n\nAnimal a = new Cat();\na.sound(); // \"Meow\" — runtime polymorphism", python:"# Python uses duck typing — no overloading needed\nclass Animal:\n    def sound(self): print('...')\n\nclass Cat(Animal):\n    def sound(self): print('Meow')  # overriding\n\na = Cat()\na.sound()  # 'Meow'" } },
  { id:6, cat:"Pillars", q:"What is Method Overloading vs Method Overriding?",
    a:"Method Overloading: same method name, different parameter list (type/count), in the same class. Resolved at compile time.\n\nMethod Overriding: subclass redefines a parent method with same signature. Resolved at runtime.",
    table:[["","Overloading","Overriding"],["Location","Same class","Child overrides parent"],["Parameters","Must differ","Must be same"],["Return type","Can differ","Must be same (or covariant)"],["Binding","Compile-time","Runtime"],["Polymorphism","Static","Dynamic"]] },
  { id:7, cat:"OOP Concepts", q:"What is a Constructor? What is a Destructor?",
    a:"Constructor: special method called automatically when an object is created. Same name as class, no return type. Used to initialize fields.\n\nTypes: default, parameterized, copy constructor.\n\nDestructor: called automatically when an object is destroyed/goes out of scope. Frees resources. In Java: no explicit destructor, GC handles it (finalize() deprecated). Python: __del__().",
    code:{ java:"class Person {\n  String name;\n  int age;\n\n  // Default constructor\n  Person() { this.name = \"Unknown\"; }\n\n  // Parameterized constructor\n  Person(String name, int age) {\n    this.name = name;\n    this.age = age;\n  }\n\n  // Copy constructor\n  Person(Person p) {\n    this.name = p.name;\n    this.age = p.age;\n  }\n}", python:"class Person:\n    def __init__(self, name='Unknown', age=0):\n        self.name = name\n        self.age = age\n\n    def __del__(self):\n        print(f'{self.name} object destroyed')\n\np = Person('Mani', 22)" } },
  { id:8, cat:"OOP Concepts", q:"What is an Interface? What is an Abstract Class?",
    a:"Interface: a pure contract — only abstract methods (Java 8+ allows default/static). A class can implement multiple interfaces.\n\nAbstract Class: can have both abstract and concrete methods, instance variables, constructors. A class can extend only one abstract class.\n\nWhen to use: Interface for capability (Flyable, Serializable). Abstract class for IS-A with shared code.",
    table:[["","Interface","Abstract Class"],["Methods","Abstract (+ default/static)","Both abstract & concrete"],["Variables","Only public static final","Any"],["Multiple","Yes (multiple implements)","No (single extends)"],["Constructor","No","Yes"]],
    code:{ java:"interface Flyable {\n  void fly(); // abstract by default\n  default void glide() { System.out.println(\"Gliding\"); }\n}\n\nabstract class Bird {\n  String name;\n  abstract void sound();\n  void breathe() { System.out.println(\"Breathing\"); }\n}\n\nclass Eagle extends Bird implements Flyable {\n  void sound() { System.out.println(\"Screech\"); }\n  public void fly() { System.out.println(\"Eagle flying\"); }\n}", python:"from abc import ABC, abstractmethod\n\nclass Flyable(ABC):\n    @abstractmethod\n    def fly(self): pass\n\nclass Bird(ABC):\n    @abstractmethod\n    def sound(self): pass\n    def breathe(self): print('Breathing')\n\nclass Eagle(Bird, Flyable):\n    def sound(self): print('Screech')\n    def fly(self): print('Eagle flying')" } },
  { id:9, cat:"OOP Concepts", q:"What are Access Modifiers?",
    a:"Access modifiers control the visibility of classes, methods, and variables.",
    table:[["Modifier","Same Class","Same Package","Subclass","Outside"],["private","✓","✗","✗","✗"],["default","✓","✓","✗","✗"],["protected","✓","✓","✓","✗"],["public","✓","✓","✓","✓"]],
    code:{ java:"class Example {\n  private int secret = 1;      // only this class\n  int packageVal = 2;          // this + same package\n  protected int subVal = 3;   // this + subclasses\n  public int open = 4;        // everywhere\n}", python:"class Example:\n    def __init__(self):\n        self.public = 1       # accessible anywhere\n        self._protected = 2   # convention: internal use\n        self.__private = 3    # name mangled: _Example__private" } },
  { id:10, cat:"OOP Concepts", q:"What are Static Members?",
    a:"Static members belong to the class, not to any specific object — shared across all instances.\n\nStatic variable: one copy shared by all objects.\nStatic method: can be called without creating an object, cannot access non-static members.",
    code:{ java:"class Counter {\n  static int count = 0; // shared\n  String name;\n\n  Counter(String name) {\n    this.name = name;\n    count++; // increments for all instances\n  }\n\n  static int getCount() { return count; } // static method\n}\n\nCounter c1 = new Counter(\"A\");\nCounter c2 = new Counter(\"B\");\nSystem.out.println(Counter.getCount()); // 2", python:"class Counter:\n    count = 0  # class variable (shared)\n\n    def __init__(self, name):\n        self.name = name\n        Counter.count += 1\n\n    @staticmethod\n    def get_count():\n        return Counter.count\n\nCounter('A'); Counter('B')\nprint(Counter.get_count())  # 2" } },
  { id:11, cat:"OOP Concepts", q:"Composition vs Inheritance — when to use which?",
    a:"Inheritance (IS-A): use when the child truly is a type of parent. Dog IS-A Animal. Tight coupling — changes in parent affect child.\n\nComposition (HAS-A): use when a class uses another class as a part. Car HAS-A Engine. More flexible, preferred in modern design.\n\nRule: 'Favor composition over inheritance' (Effective Java). Inheritance for clear IS-A; composition for everything else.",
    code:{ java:"// Inheritance\nclass Animal { void eat() {} }\nclass Dog extends Animal { void bark() {} }\n\n// Composition (preferred)\nclass Engine {\n  void start() { System.out.println(\"Vroom\"); }\n}\n\nclass Car {\n  private Engine engine = new Engine(); // HAS-A\n  void drive() { engine.start(); }\n}", python:"# Inheritance\nclass Animal:\n    def eat(self): pass\nclass Dog(Animal):\n    def bark(self): pass\n\n# Composition\nclass Engine:\n    def start(self): print('Vroom')\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()  # HAS-A\n    def drive(self):\n        self.engine.start()" } },
];

// ─── CN ───────────────────────────────────────────────────────────────────────
const CN_QA = [
  { id:1, cat:"Models", q:"What is the OSI Model? Explain all 7 layers.",
    a:"The OSI (Open Systems Interconnection) Model is a conceptual framework that standardizes how different network systems communicate in 7 layers.",
    table:[["Layer","Name","Function","Example"],["7","Application","User interface to network","HTTP, FTP, DNS"],["6","Presentation","Data format, encryption, compression","SSL/TLS, JPEG"],["5","Session","Manages sessions between apps","NetBIOS, RPC"],["4","Transport","End-to-end delivery, flow control","TCP, UDP"],["3","Network","Routing, logical addressing","IP, ICMP, Routers"],["2","Data Link","Physical addressing, error detection","MAC, Ethernet, Switches"],["1","Physical","Bits over medium (cable/wireless)","Cables, Hubs, Wi-Fi"]] },
  { id:2, cat:"Models", q:"What is the TCP/IP Model?",
    a:"TCP/IP is a 4-layer practical model used in real networks (unlike OSI which is conceptual).",
    table:[["TCP/IP Layer","OSI Equivalent","Protocols"],["Application","Layers 5-7","HTTP, FTP, DNS, SMTP"],["Transport","Layer 4","TCP, UDP"],["Internet","Layer 3","IP, ICMP, ARP"],["Network Access","Layers 1-2","Ethernet, Wi-Fi, MAC"]] },
  { id:3, cat:"Addressing", q:"What is an IP Address? IPv4 vs IPv6?",
    a:"IP Address: a logical address assigned to each device on a network for identification and routing.\n\nIPv4: 32-bit, dotted decimal (192.168.1.1), ~4.3 billion addresses.\nIPv6: 128-bit, hex colon notation (2001:0db8::1), virtually unlimited addresses.",
    table:[["","IPv4","IPv6"],["Bits","32","128"],["Notation","192.168.1.1","2001:0db8::1"],["Addresses","~4.3 billion","~3.4×10³⁸"],["Header size","20 bytes","40 bytes (simpler)"],["NAT needed","Yes","No"]] },
  { id:4, cat:"Addressing", q:"What is MAC Address?",
    a:"MAC (Media Access Control) Address is a hardware address burned into a NIC (Network Interface Card) — uniquely identifies a device at the Data Link layer.\n\n48-bit, written as 6 hex pairs: AA:BB:CC:DD:EE:FF\nFirst 3 pairs = OUI (manufacturer), last 3 = device ID.\n\nIP = logical (can change). MAC = physical (permanent)." },
  { id:5, cat:"Protocols", q:"What is DNS?",
    a:"DNS (Domain Name System) translates human-readable domain names to IP addresses.\n\nProcess: Browser → Local Cache → Recursive Resolver → Root DNS → TLD Server (.com) → Authoritative DNS → returns IP.\n\nExample: google.com → 142.250.194.78\n\nRuns on UDP port 53 (TCP for large responses)." },
  { id:6, cat:"Protocols", q:"What is DHCP?",
    a:"DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and network config (subnet mask, gateway, DNS) to devices when they join a network.\n\nProcess (DORA): Discover → Offer → Request → Acknowledge\n\nRuns on UDP port 67 (server) / 68 (client).\n\nWithout DHCP, every device needs manual IP configuration." },
  { id:7, cat:"Protocols", q:"What is ARP?",
    a:"ARP (Address Resolution Protocol) resolves an IP address to a MAC address within a local network.\n\nProcess: Device broadcasts 'Who has IP 192.168.1.5?' → Device with that IP replies with its MAC address → MAC stored in ARP cache.\n\nOperates at Layer 2 (Data Link) / Layer 3 boundary." },
  { id:8, cat:"Network Devices", q:"What is the difference between Routing and Switching?",
    a:"Switching: operates at Layer 2 (Data Link). Uses MAC addresses to forward frames within the same network (LAN). Device: Switch.\n\nRouting: operates at Layer 3 (Network). Uses IP addresses to forward packets between different networks. Device: Router.",
    table:[["","Switching","Routing"],["Layer","Layer 2 (Data Link)","Layer 3 (Network)"],["Address used","MAC","IP"],["Scope","Within LAN","Between networks"],["Device","Switch","Router"]] },
  { id:9, cat:"Network Types", q:"What is LAN, MAN, WAN?",
    a:"LAN (Local Area Network): small area — home, office, school. High speed, low cost, privately owned.\n\nMAN (Metropolitan Area Network): city-wide network. Connects multiple LANs in a city. Example: cable TV networks.\n\nWAN (Wide Area Network): country/global scale. Low speed relative to LAN, high latency. Example: the Internet, MPLS.",
    table:[["","LAN","MAN","WAN"],["Area","Room/Building","City","Country/Global"],["Speed","1 Gbps+","100 Mbps","10-100 Mbps"],["Ownership","Private","Public/Private","Public/Private"],["Example","Office Wi-Fi","Cable TV","Internet"]] },
  { id:10, cat:"Protocols", q:"What are HTTP Methods?",
    a:"HTTP methods define the action to be performed on a resource.",
    table:[["Method","Purpose","Idempotent","Safe"],["GET","Retrieve resource","Yes","Yes"],["POST","Create resource","No","No"],["PUT","Replace resource","Yes","No"],["PATCH","Partial update","No","No"],["DELETE","Remove resource","Yes","No"],["HEAD","Like GET, no body","Yes","Yes"]],
    code:{ java:"// HttpURLConnection example\nURL url = new URL(\"https://api.example.com/users\");\nHttpURLConnection conn = (HttpURLConnection) url.openConnection();\nconn.setRequestMethod(\"GET\");\nint status = conn.getResponseCode();", python:"import requests\n\n# GET\nresponse = requests.get('https://api.example.com/users')\nprint(response.json())\n\n# POST\nresponse = requests.post(\n  'https://api.example.com/users',\n  json={'name': 'Mani'}\n)" } },
  { id:11, cat:"Protocols", q:"What is the Three-Way Handshake?",
    a:"TCP's Three-Way Handshake establishes a reliable connection before data transfer:\n\n1. SYN — Client sends SYN (synchronize) with initial sequence number\n2. SYN-ACK — Server responds with SYN-ACK (acknowledges client's SYN, sends its own SYN)\n3. ACK — Client sends ACK, connection established\n\nFor closing: FIN → FIN-ACK → FIN → ACK (Four-way termination)." },
  { id:12, cat:"Security", q:"What is a Firewall?",
    a:"A Firewall monitors and controls incoming/outgoing network traffic based on predefined security rules.\n\nTypes:\n• Packet filtering: checks IP/port — fastest, least secure\n• Stateful inspection: tracks connection state — common in routers\n• Application layer (proxy): deep packet inspection — slowest, most secure\n\nCan be hardware, software, or both." },
  { id:13, cat:"Network Devices", q:"What are Network Topologies?",
    a:"Network topology describes the physical/logical arrangement of nodes in a network.",
    table:[["Topology","Description","Advantage","Disadvantage"],["Bus","All devices on one cable","Simple, cheap","One break = whole network down"],["Star","All devices connected to central hub/switch","Easy to manage","Hub failure = all down"],["Ring","Devices in a loop","Equal access","One failure breaks ring"],["Mesh","Every device connected to every other","Highly reliable","Expensive, complex"],["Tree","Hierarchical star","Scalable","Root failure = major issue"]] },
];


// ─── Config ───────────────────────────────────────────────────────────────────
const TABS = [
  { key:"DBMS", data:DBMS_QA, cats:["All","Keys","Normalization","SQL","ACID/Tx","Misc"], storageKey:"dbms_mastered" },
  { key:"OS",   data:OS_QA,   cats:["All","Processes","Scheduling","Deadlock","Synchronization","Memory"], storageKey:"os_mastered" },
  { key:"OOP",  data:OOP_QA,  cats:["All","Basics","Pillars","OOP Concepts"], storageKey:"oop_mastered" },
  { key:"CN",   data:CN_QA,   cats:["All","Models","Addressing","Protocols","Network Devices","Network Types","Security"], storageKey:"cn_mastered" },
];

const CAT_COLORS = {
  // DBMS
  Keys:"#58a6ff", Normalization:"#a78bfa", SQL:"#3fb950", "ACID/Tx":"#f59e0b", Misc:"#8b949e",
  // OS
  Processes:"#58a6ff", Scheduling:"#3fb950", Deadlock:"#f87171", Synchronization:"#f59e0b", Memory:"#a78bfa",
  // OOP
  Basics:"#58a6ff", Pillars:"#3fb950", "OOP Concepts":"#a78bfa",
  // CN
  Models:"#58a6ff", Addressing:"#3fb950", Protocols:"#f59e0b", "Network Devices":"#a78bfa", "Network Types":"#8b949e", Security:"#f87171",
};

// ─── QACard ──────────────────────────────────────────────────────────────────
function QACard({ item, storageKey, lang, forceOpen }) {
  const [open, setOpen] = useState(false);
  const [mastered, setMastered] = useState(
    () => JSON.parse(localStorage.getItem(storageKey) || "[]").includes(item.id)
  );

  const isOpen = open || forceOpen;

  function toggleMastered(e) {
    e.stopPropagation();
    setMastered(prev => {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const next = prev ? stored.filter(x => x !== item.id) : [...stored, item.id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return !prev;
    });
  }

  // pick code snippet: if item.code is an object with java/python/sql keys use lang
  const codeSnippet = item.code
    ? (typeof item.code === "string" ? item.code : (item.code[lang] || item.code.sql || item.code.java || ""))
    : null;

  return (
    <div
      className="corecs-card"
      style={{ borderLeft: mastered ? "2px solid var(--success)" : undefined }}
    >
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
        <span className="corecs-chevron" style={{ transform: isOpen ? "rotate(180deg)" : undefined }}>▾</span>
      </button>

      <div className="corecs-card-body" style={{ display: isOpen ? "block" : "none" }}>
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
        {codeSnippet && <pre className="corecs-code">{codeSnippet}</pre>}
        {item.table && (
          <div style={{ overflowX: "auto" }}>
            <table className="corecs-table">
              <thead><tr>{item.table[0].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
              <tbody>
                {item.table.slice(1).map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SubjectPanel ─────────────────────────────────────────────────────────────
function SubjectPanel({ tab, lang }) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const masteredIds = JSON.parse(localStorage.getItem(tab.storageKey) || "[]");
  const masteredCount = masteredIds.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tab.data.filter(item => {
      if (cat !== "All" && item.cat !== cat) return false;
      if (!q) return true;
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [cat, search, tab]);

  const pct = Math.round((masteredCount / tab.data.length) * 100);

  return (
    <>
      {/* Stats */}
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{tab.data.length}</strong><span>Total</span></div>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions or answers…" />
        </div>
        <select className="filter-select" value={cat} onChange={e => setCat(e.target.value)}>
          {tab.cats.map(c => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length ? (
        <div className="corecs-list">
          {filtered.map(item => (
            <QACard
              key={item.id}
              item={item}
              storageKey={tab.storageKey}
              lang={lang}
              forceOpen={Boolean(search.trim())}
            />
          ))}
        </div>
      ) : (
        <div className="corecs-empty">
          <Search size={32} style={{ color:"var(--muted)", marginBottom:12 }} />
          <p>No questions match your search.</p>
        </div>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoreCSPage() {
  const [activeTab, setActiveTab] = useState("DBMS");
  const [lang, setLang] = useState("java");

  const tab = TABS.find(t => t.key === activeTab);
  const hasCode = ["DBMS","OS","OOP","CN"].includes(activeTab);

  return (
    <div className="container collection">
      {/* Header */}
      <div className="page-title">
        <div>
          <p className="eyebrow">CORE CS SUBJECTS</p>
          <h1>Theory & Interview Q&A</h1>
          <p>DBMS · OS · OOP · CN — all topics from the sheet.</p>
        </div>
        <BookOpen size={24} />
      </div>

      {/* Tabs + Language toggle */}
      <div className="corecs-topbar">
        <div className="corecs-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`corecs-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.key}
              <span className="corecs-tab-count">{t.data.length}</span>
            </button>
          ))}
        </div>

        {hasCode && (
          <div className="corecs-lang-toggle">
            <Code2 size={13} />
            {["java","python","sql"].map(l => (
              <button
                key={l}
                className={`corecs-lang-btn${lang === l ? " active" : ""}`}
                onClick={() => setLang(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      <SubjectPanel key={activeTab} tab={tab} lang={lang} />
    </div>
  );
}
