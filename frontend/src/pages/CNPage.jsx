import { useMemo, useState } from "react";
import { Network, Search } from "lucide-react";

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
    a:"DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses and network config to devices when they join a network.\n\nProcess (DORA): Discover → Offer → Request → Acknowledge\n\nRuns on UDP port 67 (server) / 68 (client)." },
  { id:7, cat:"Protocols", q:"What is ARP?",
    a:"ARP (Address Resolution Protocol) resolves an IP address to a MAC address within a local network.\n\nProcess: Device broadcasts 'Who has IP 192.168.1.5?' → Device with that IP replies with its MAC → MAC stored in ARP cache.\n\nOperates at Layer 2 / Layer 3 boundary." },
  { id:8, cat:"Devices", q:"What is the difference between Routing and Switching?",
    a:"Switching: operates at Layer 2 (Data Link). Uses MAC addresses to forward frames within the same LAN. Device: Switch.\n\nRouting: operates at Layer 3 (Network). Uses IP addresses to forward packets between different networks. Device: Router.",
    table:[["","Switching","Routing"],["Layer","Layer 2 (Data Link)","Layer 3 (Network)"],["Address used","MAC","IP"],["Scope","Within LAN","Between networks"],["Device","Switch","Router"]] },
  { id:9, cat:"Network Types", q:"What is LAN, MAN, WAN?",
    a:"LAN (Local Area Network): small area — home, office, school. High speed, low cost, privately owned.\n\nMAN (Metropolitan Area Network): city-wide network. Connects multiple LANs in a city.\n\nWAN (Wide Area Network): country/global scale. Example: the Internet.",
    table:[["","LAN","MAN","WAN"],["Area","Room/Building","City","Country/Global"],["Speed","1 Gbps+","100 Mbps","10-100 Mbps"],["Ownership","Private","Public/Private","Public/Private"],["Example","Office Wi-Fi","Cable TV","Internet"]] },
  { id:10, cat:"Protocols", q:"What are HTTP Methods?",
    a:"HTTP methods define the action to be performed on a resource.",
    table:[["Method","Purpose","Idempotent","Safe"],["GET","Retrieve resource","Yes","Yes"],["POST","Create resource","No","No"],["PUT","Replace resource","Yes","No"],["PATCH","Partial update","No","No"],["DELETE","Remove resource","Yes","No"],["HEAD","Like GET, no body","Yes","Yes"]] },
  { id:11, cat:"Protocols", q:"What is the Three-Way Handshake?",
    a:"TCP's Three-Way Handshake establishes a reliable connection before data transfer:\n\n1. SYN — Client sends SYN with initial sequence number\n2. SYN-ACK — Server acknowledges client's SYN, sends its own SYN\n3. ACK — Client sends ACK, connection established\n\nFor closing: FIN → FIN-ACK → FIN → ACK (Four-way termination)." },
  { id:12, cat:"Security", q:"What is a Firewall?",
    a:"A Firewall monitors and controls incoming/outgoing network traffic based on predefined security rules.\n\nTypes:\n• Packet filtering: checks IP/port — fastest, least secure\n• Stateful inspection: tracks connection state — common in routers\n• Application layer (proxy): deep packet inspection — slowest, most secure" },
  { id:13, cat:"Devices", q:"What are Network Topologies?",
    a:"Network topology describes the physical/logical arrangement of nodes in a network.",
    table:[["Topology","Description","Advantage","Disadvantage"],["Bus","All devices on one cable","Simple, cheap","One break = whole network down"],["Star","All connected to central switch","Easy to manage","Hub failure = all down"],["Ring","Devices in a loop","Equal access","One failure breaks ring"],["Mesh","Every device connected to every other","Highly reliable","Expensive, complex"],["Tree","Hierarchical star","Scalable","Root failure = major issue"]] },
];

const CATS = ["All","Models","Addressing","Protocols","Devices","Network Types","Security"];
const CAT_COLORS = { Models:"#58a6ff", Addressing:"#3fb950", Protocols:"#f59e0b", Devices:"#a78bfa", "Network Types":"#8b949e", Security:"#f87171" };
const STORAGE_KEY = "cn_mastered";

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

export default function CNPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount/CN_QA.length)*100);
  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return CN_QA.filter(item=>{
      if(cat!=="All"&&item.cat!==cat) return false;
      if(!q) return true;
      return item.q.toLowerCase().includes(q)||item.a.toLowerCase().includes(q);
    });
  },[cat,search]);
  return (
    <div className="container collection">
      <div className="page-title">
        <div><p className="eyebrow">CORE CS · CN</p><h1>Computer Networks</h1><p>OSI, TCP/IP, Protocols, HTTP, Handshake — {CN_QA.length} questions.</p></div>
        <Network size={24}/>
      </div>
      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{CN_QA.length}</strong><span>Total</span></div>
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
