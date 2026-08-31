import { useMemo, useState } from "react";
import { Cpu, Search } from "lucide-react";

const OS_QA = [
  { id:1, cat:"Processes", q:"What is a Process? What is a Thread? What's the difference?",
    a:"Process: an independent program in execution with its own memory space (code, data, heap, stack).\n\nThread: a lightweight unit of execution within a process — shares the process's memory space.\n\nKey difference: processes are isolated; threads share memory and are faster to create/switch.",
    table:[["","Process","Thread"],["Memory","Own address space","Shared with process"],["Creation","Slower (OS call)","Faster"],["Communication","IPC (pipes, sockets)","Shared memory"],["Crash impact","Isolated","Can crash whole process"]] },
  { id:2, cat:"Processes", q:"What is Process Scheduling?",
    a:"Process scheduling is how the OS decides which process gets CPU time and when.\n\nTypes:\n• Long-term scheduler: controls degree of multiprogramming (new → ready)\n• Short-term scheduler (CPU scheduler): picks which ready process runs next\n• Medium-term scheduler: swaps processes in/out of memory" },
  { id:3, cat:"Scheduling", q:"Explain CPU Scheduling Algorithms.",
    a:"FCFS (First Come First Served): simplest, non-preemptive, convoy effect problem.\n\nSJF (Shortest Job First): picks process with least burst time, optimal average wait time, starvation possible.\n\nRound Robin: each process gets a time quantum in rotation — best for time-sharing.\n\nPriority Scheduling: highest priority runs first — starvation solved by aging.",
    table:[["Algorithm","Preemptive","Starvation","Best For"],["FCFS","No","No","Simple batch"],["SJF","Optional","Yes","Min avg wait"],["Round Robin","Yes","No","Time-sharing"],["Priority","Optional","Yes","Real-time"]] },
  { id:4, cat:"Processes", q:"What is Context Switching?",
    a:"Context switching is saving the state (registers, PC, stack pointer) of a running process/thread and loading the state of the next one.\n\nState saved in PCB (Process Control Block).\n\nOverhead: pure CPU wasted time — no useful work during a context switch." },
  { id:5, cat:"Deadlock", q:"What is Deadlock? What are the four conditions?",
    a:"Deadlock is a situation where two or more processes are blocked forever, each waiting for a resource held by another.\n\nFour necessary conditions (all must hold simultaneously):\n1. Mutual Exclusion — resource held by one process at a time\n2. Hold and Wait — process holds one resource while waiting for another\n3. No Preemption — resource can't be forcibly taken away\n4. Circular Wait — P1 waits for P2, P2 waits for P3, P3 waits for P1" },
  { id:6, cat:"Deadlock", q:"How is Deadlock handled?",
    a:"Prevention: eliminate one of the four conditions (e.g., request all resources at once to break Hold & Wait).\n\nAvoidance: Banker's Algorithm — check if granting a resource keeps the system in a safe state.\n\nDetection & Recovery: allow deadlock, detect via resource allocation graph, recover by killing a process.\n\nIgnore: Ostrich algorithm — used in most OSes (rare deadlocks, just reboot)." },
  { id:7, cat:"Synchronization", q:"What are Semaphores and Mutex?",
    a:"Mutex (Mutual Exclusion Lock): binary lock — only the thread that locked it can unlock it. Used for critical section protection.\n\nSemaphore: a counter-based signaling mechanism. Binary semaphore = mutex. Counting semaphore controls access to a pool of N resources.\n\nKey difference: mutex has ownership (only locker unlocks), semaphore has no ownership (any thread can signal)." },
  { id:8, cat:"Synchronization", q:"What is Synchronization? What problems does it solve?",
    a:"Synchronization coordinates threads accessing shared resources to prevent race conditions.\n\nClassic problems:\n• Race Condition: two threads read-modify-write same var — result depends on order\n• Producer-Consumer: producer adds to buffer, consumer removes — need to coordinate\n• Readers-Writers: multiple readers OK, writer needs exclusive access\n• Dining Philosophers: classic deadlock/starvation illustration" },
  { id:9, cat:"Memory", q:"What is Paging and Segmentation?",
    a:"Paging: physical memory divided into fixed-size frames; logical memory into same-size pages. OS maintains a page table to map page→frame. Eliminates external fragmentation, causes internal fragmentation.\n\nSegmentation: memory divided into variable-size segments (code, stack, heap, data). Each segment has base+limit. Eliminates internal fragmentation, causes external fragmentation.",
    table:[["","Paging","Segmentation"],["Size","Fixed","Variable"],["External fragmentation","No","Yes"],["Internal fragmentation","Yes","No"],["User view","Hidden","Visible (logical)"]] },
  { id:10, cat:"Memory", q:"What is Virtual Memory?",
    a:"Virtual memory allows a process to use more memory than physically available by storing parts of it on disk (swap space).\n\nOnly the active portion (working set) stays in RAM. Inactive pages are swapped out.\n\nBenefits: run large programs, memory isolation between processes, efficient memory use." },
  { id:11, cat:"Memory", q:"What are Page Replacement Algorithms?",
    a:"When RAM is full and a new page is needed, the OS evicts an existing page.\n\nFIFO: evict oldest page — simple but suffers Belady's anomaly.\nLRU (Least Recently Used): evict page not used for longest time — good in practice.\nOptimal: evict page that won't be used for longest future time — theoretical best, not practical.",
    table:[["Algorithm","Idea","Issue"],["FIFO","Evict oldest","Belady's anomaly"],["LRU","Evict least recently used","Implementation cost"],["Optimal","Evict furthest future use","Needs future knowledge"]] },
];

const CATS = ["All","Processes","Scheduling","Deadlock","Synchronization","Memory"];
const CAT_COLORS = { Processes:"#58a6ff", Scheduling:"#3fb950", Deadlock:"#f87171", Synchronization:"#f59e0b", Memory:"#a78bfa" };
const STORAGE_KEY = "os_mastered";

function QACard({ item }) {
  const [open, setOpen] = useState(false);
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
      </div>
    </div>
  );
}

export default function OSPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount/OS_QA.length)*100);
  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return OS_QA.filter(item=>{
      if(cat!=="All"&&item.cat!==cat) return false;
      if(!q) return true;
      return item.q.toLowerCase().includes(q)||item.a.toLowerCase().includes(q);
    });
  },[cat,search]);
  return (
    <div className="container collection">
      <div className="page-title">
        <div><p className="eyebrow">CORE CS · OS</p><h1>Operating Systems</h1><p>Processes, Scheduling, Deadlock, Memory — {OS_QA.length} questions.</p></div>
        <Cpu size={24}/>
      </div>
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{OS_QA.length}</strong><span>Total</span></div>
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
