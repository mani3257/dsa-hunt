import { useMemo, useState } from "react";
import { Layers, Search } from "lucide-react";

const OOP_QA = [
  { id:1, cat:"Basics", q:"What is a Class and an Object?",
    a:"Class: a blueprint/template that defines attributes (fields) and behaviors (methods).\n\nObject: an instance of a class — actual entity created in memory using 'new'.\n\nAnalogy: Class = cookie cutter, Object = the cookie.",
    code:{ java:"class Dog {\n  String name;\n  int age;\n\n  void bark() {\n    System.out.println(name + \" says Woof!\");\n  }\n}\n\nDog d = new Dog();\nd.name = \"Bruno\";\nd.bark();", python:"class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def bark(self):\n        print(f'{self.name} says Woof!')\n\nd = Dog('Bruno', 3)\nd.bark()" } },
  { id:2, cat:"Pillars", q:"What is Encapsulation?",
    a:"Encapsulation bundles data (fields) and methods into a single unit (class), and restricts direct access to internal data using access modifiers.\n\nAchieved via private fields + public getters/setters.\n\nBenefit: hides implementation, prevents invalid state, improves maintainability.",
    code:{ java:"class BankAccount {\n  private double balance;\n\n  public double getBalance() { return balance; }\n\n  public void deposit(double amount) {\n    if (amount > 0) balance += amount;\n  }\n}", python:"class BankAccount:\n    def __init__(self):\n        self.__balance = 0  # private\n\n    def get_balance(self):\n        return self.__balance\n\n    def deposit(self, amount):\n        if amount > 0:\n            self.__balance += amount" } },
  { id:3, cat:"Pillars", q:"What is Abstraction?",
    a:"Abstraction hides complex implementation details and exposes only what's necessary.\n\nAchieved via: abstract classes (partial implementation) and interfaces (contract only).\n\nDifference from Encapsulation: Encapsulation hides data, Abstraction hides complexity.",
    code:{ java:"abstract class Shape {\n  abstract double area();\n  void print() {\n    System.out.println(\"Area: \" + area());\n  }\n}\n\nclass Circle extends Shape {\n  double r;\n  Circle(double r) { this.r = r; }\n  double area() { return Math.PI * r * r; }\n}", python:"from abc import ABC, abstractmethod\n\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): pass\n\n    def print_area(self):\n        print(f'Area: {self.area()}')\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return 3.14 * self.r ** 2" } },
  { id:4, cat:"Pillars", q:"What is Inheritance?",
    a:"Inheritance allows a child class to acquire properties and behaviors of a parent class.\n\nTypes: Single, Multilevel, Hierarchical, Multiple (via interfaces in Java).\n\nBenefit: code reuse, IS-A relationship.",
    code:{ java:"class Animal {\n  String name;\n  void eat() { System.out.println(name + \" eats\"); }\n}\n\nclass Dog extends Animal {\n  void bark() { System.out.println(name + \" barks\"); }\n}\n\nDog d = new Dog();\nd.name = \"Rex\";\nd.eat();   // inherited\nd.bark();  // own", python:"class Animal:\n    def __init__(self, name):\n        self.name = name\n    def eat(self):\n        print(f'{self.name} eats')\n\nclass Dog(Animal):\n    def bark(self):\n        print(f'{self.name} barks')\n\nd = Dog('Rex')\nd.eat()   # inherited\nd.bark()" } },
  { id:5, cat:"Pillars", q:"What is Polymorphism?",
    a:"Polymorphism means 'many forms' — same method name behaves differently based on context.\n\nCompile-time (Static): Method Overloading — same name, different parameters.\nRuntime (Dynamic): Method Overriding — subclass redefines parent method, resolved at runtime.",
    code:{ java:"// Overloading (compile-time)\nclass Calc {\n  int add(int a, int b) { return a+b; }\n  double add(double a, double b) { return a+b; }\n}\n\n// Overriding (runtime)\nclass Animal { void sound() { System.out.println(\"...\"); } }\nclass Cat extends Animal {\n  @Override\n  void sound() { System.out.println(\"Meow\"); }\n}\n\nAnimal a = new Cat();\na.sound(); // \"Meow\"", python:"class Animal:\n    def sound(self): print('...')\n\nclass Cat(Animal):\n    def sound(self): print('Meow')  # overriding\n\na = Cat()\na.sound()  # 'Meow'" } },
  { id:6, cat:"Pillars", q:"What is Method Overloading vs Method Overriding?",
    a:"Method Overloading: same method name, different parameter list, in the same class. Resolved at compile time.\n\nMethod Overriding: subclass redefines a parent method with same signature. Resolved at runtime.",
    table:[["","Overloading","Overriding"],["Location","Same class","Child overrides parent"],["Parameters","Must differ","Must be same"],["Return type","Can differ","Must be same (or covariant)"],["Binding","Compile-time","Runtime"],["Polymorphism","Static","Dynamic"]] },
  { id:7, cat:"Concepts", q:"What is a Constructor? What is a Destructor?",
    a:"Constructor: special method called automatically when an object is created. Same name as class, no return type.\n\nTypes: default, parameterized, copy constructor.\n\nDestructor: called when object is destroyed. In Java: GC handles it (finalize() deprecated). Python: __del__().",
    code:{ java:"class Person {\n  String name;\n  int age;\n\n  Person() { this.name = \"Unknown\"; }  // default\n\n  Person(String name, int age) {  // parameterized\n    this.name = name;\n    this.age = age;\n  }\n\n  Person(Person p) {  // copy\n    this.name = p.name;\n    this.age = p.age;\n  }\n}", python:"class Person:\n    def __init__(self, name='Unknown', age=0):\n        self.name = name\n        self.age = age\n\n    def __del__(self):\n        print(f'{self.name} object destroyed')\n\np = Person('Mani', 22)" } },
  { id:8, cat:"Concepts", q:"What is an Interface? What is an Abstract Class?",
    a:"Interface: a pure contract — only abstract methods (Java 8+ allows default/static). A class can implement multiple interfaces.\n\nAbstract Class: can have both abstract and concrete methods, instance variables, constructors. Single inheritance only.\n\nWhen to use: Interface for capability (Flyable, Serializable). Abstract class for IS-A with shared code.",
    table:[["","Interface","Abstract Class"],["Methods","Abstract (+ default/static)","Both abstract & concrete"],["Variables","Only public static final","Any"],["Multiple","Yes (multiple implements)","No (single extends)"],["Constructor","No","Yes"]],
    code:{ java:"interface Flyable {\n  void fly();\n  default void glide() { System.out.println(\"Gliding\"); }\n}\n\nabstract class Bird {\n  String name;\n  abstract void sound();\n  void breathe() { System.out.println(\"Breathing\"); }\n}\n\nclass Eagle extends Bird implements Flyable {\n  void sound() { System.out.println(\"Screech\"); }\n  public void fly() { System.out.println(\"Eagle flying\"); }\n}", python:"from abc import ABC, abstractmethod\n\nclass Flyable(ABC):\n    @abstractmethod\n    def fly(self): pass\n\nclass Bird(ABC):\n    @abstractmethod\n    def sound(self): pass\n    def breathe(self): print('Breathing')\n\nclass Eagle(Bird, Flyable):\n    def sound(self): print('Screech')\n    def fly(self): print('Eagle flying')" } },
  { id:9, cat:"Concepts", q:"What are Access Modifiers?",
    a:"Access modifiers control the visibility of classes, methods, and variables.",
    table:[["Modifier","Same Class","Same Package","Subclass","Outside"],["private","✓","✗","✗","✗"],["default","✓","✓","✗","✗"],["protected","✓","✓","✓","✗"],["public","✓","✓","✓","✓"]],
    code:{ java:"class Example {\n  private int secret = 1;    // only this class\n  int packageVal = 2;        // this + same package\n  protected int subVal = 3; // this + subclasses\n  public int open = 4;      // everywhere\n}", python:"class Example:\n    def __init__(self):\n        self.public = 1       # anywhere\n        self._protected = 2   # convention: internal\n        self.__private = 3    # name mangled" } },
  { id:10, cat:"Concepts", q:"What are Static Members?",
    a:"Static members belong to the class, not to any specific object — shared across all instances.\n\nStatic variable: one copy shared by all objects.\nStatic method: can be called without creating an object.",
    code:{ java:"class Counter {\n  static int count = 0;\n  String name;\n\n  Counter(String name) {\n    this.name = name;\n    count++;\n  }\n\n  static int getCount() { return count; }\n}\n\nCounter c1 = new Counter(\"A\");\nCounter c2 = new Counter(\"B\");\nSystem.out.println(Counter.getCount()); // 2", python:"class Counter:\n    count = 0  # class variable\n\n    def __init__(self, name):\n        self.name = name\n        Counter.count += 1\n\n    @staticmethod\n    def get_count():\n        return Counter.count\n\nCounter('A'); Counter('B')\nprint(Counter.get_count())  # 2" } },
  { id:11, cat:"Concepts", q:"Composition vs Inheritance — when to use which?",
    a:"Inheritance (IS-A): use when the child truly is a type of parent. Dog IS-A Animal. Tight coupling.\n\nComposition (HAS-A): use when a class uses another class as a part. Car HAS-A Engine. More flexible, preferred in modern design.\n\nRule: 'Favor composition over inheritance' (Effective Java).",
    code:{ java:"// Inheritance\nclass Animal { void eat() {} }\nclass Dog extends Animal { void bark() {} }\n\n// Composition (preferred)\nclass Engine {\n  void start() { System.out.println(\"Vroom\"); }\n}\n\nclass Car {\n  private Engine engine = new Engine(); // HAS-A\n  void drive() { engine.start(); }\n}", python:"# Inheritance\nclass Animal:\n    def eat(self): pass\nclass Dog(Animal):\n    def bark(self): pass\n\n# Composition\nclass Engine:\n    def start(self): print('Vroom')\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()  # HAS-A\n    def drive(self):\n        self.engine.start()" } },
];

const CATS = ["All","Basics","Pillars","Concepts"];
const CAT_COLORS = { Basics:"#58a6ff", Pillars:"#3fb950", Concepts:"#a78bfa" };
const STORAGE_KEY = "oop_mastered";

function QACard({ item }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("java");
  const [mastered, setMastered] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]").includes(item.id));

  function toggleMastered(e) {
    e.stopPropagation();
    setMastered(prev => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
      const next = prev ? stored.filter(x=>x!==item.id) : [...stored, item.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return !prev;
    });
  }

  const hasCode = item.code && typeof item.code === "object";
  const codeSnippet = hasCode ? item.code[lang] : null;

  return (
    <div className="corecs-card" style={{ borderLeft: mastered?"2px solid var(--success)":undefined }}>
      <button className="corecs-card-header" onClick={()=>setOpen(v=>!v)}>
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
        {hasCode && (
          <>
            <div className="corecs-lang-toggle" style={{marginTop:10}}>
              {["java","python"].map(l=>(
                <button key={l} className={`corecs-lang-btn${lang===l?" active":""}`} onClick={e=>{e.stopPropagation();setLang(l);}}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {codeSnippet && <pre className="corecs-code">{codeSnippet}</pre>}
          </>
        )}
      </div>
    </div>
  );
}

export default function OOPPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount/OOP_QA.length)*100);
  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return OOP_QA.filter(item=>{
      if(cat!=="All"&&item.cat!==cat) return false;
      if(!q) return true;
      return item.q.toLowerCase().includes(q)||item.a.toLowerCase().includes(q);
    });
  },[cat,search]);
  return (
    <div className="container collection">
      <div className="page-title">
        <div><p className="eyebrow">CORE CS · OOP</p><h1>Object-Oriented Programming</h1><p>Pillars, Inheritance, Polymorphism, Design — {OOP_QA.length} questions. Toggle Java/Python per question.</p></div>
        <Layers size={24}/>
      </div>
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{OOP_QA.length}</strong><span>Total</span></div>
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
