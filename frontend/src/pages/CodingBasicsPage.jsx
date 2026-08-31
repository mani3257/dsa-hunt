import { useMemo, useState, useRef } from "react";
import { Code2, Search, Copy, Check } from "lucide-react";

const PROBLEMS = [
  { id:1, cat:"Strings", title:"Reverse a String",
    java:`String rev = new StringBuilder("hello").reverse().toString();
System.out.println(rev); // olleh`,
    python:`s = "hello"
print(s[::-1])  # olleh` },
  { id:2, cat:"Strings", title:"Check if a String is a Palindrome",
    java:`String s = "madam";
String rev = new StringBuilder(s).reverse().toString();
System.out.println(s.equals(rev)); // true`,
    python:`s = "madam"
print(s == s[::-1])  # True` },
  { id:3, cat:"Numbers", title:"Check if a Number is a Palindrome",
    java:`int n = 121, temp = n, rev = 0;
while (temp > 0) { rev = rev * 10 + temp % 10; temp /= 10; }
System.out.println(n == rev); // true`,
    python:`n = 121
print(str(n) == str(n)[::-1])  # True` },
  { id:4, cat:"Numbers", title:"Reverse an Integer",
    java:`int n = 1234, rev = 0;
while (n > 0) { rev = rev * 10 + n % 10; n /= 10; }
System.out.println(rev); // 4321`,
    python:`n = 1234
print(int(str(n)[::-1]))  # 4321` },
  { id:5, cat:"Numbers", title:"Check if a Number is Prime",
    java:`int n = 17;
boolean isPrime = n > 1;
for (int i = 2; i <= Math.sqrt(n); i++)
    if (n % i == 0) { isPrime = false; break; }
System.out.println(isPrime); // true`,
    python:`import math
n = 17
is_prime = n > 1 and all(n % i != 0 for i in range(2, int(math.sqrt(n))+1))
print(is_prime)  # True` },
  { id:6, cat:"Numbers", title:"Print Prime Numbers in a Range",
    java:`for (int n = 2; n <= 50; n++) {
    boolean isPrime = true;
    for (int i = 2; i <= Math.sqrt(n); i++)
        if (n % i == 0) { isPrime = false; break; }
    if (isPrime) System.out.print(n + " ");
}`,
    python:`import math
primes = [n for n in range(2,51) if all(n%i!=0 for i in range(2,int(math.sqrt(n))+1))]
print(primes)` },
  { id:7, cat:"Numbers", title:"Find Factorial of a Number",
    java:`int n = 5;
long fact = 1;
for (int i = 2; i <= n; i++) fact *= i;
System.out.println(fact); // 120`,
    python:`import math
print(math.factorial(5))  # 120` },
  { id:8, cat:"Numbers", title:"Generate Fibonacci Series",
    java:`int n = 10, a = 0, b = 1;
for (int i = 0; i < n; i++) {
    System.out.print(a + " ");
    int c = a + b; a = b; b = c;
}`,
    python:`a, b = 0, 1
for _ in range(10):
    print(a, end=' ')
    a, b = b, a + b` },
  { id:9, cat:"Numbers", title:"Find the Nth Fibonacci Number",
    java:`int n = 7, a = 0, b = 1;
for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
System.out.println(b); // 13`,
    python:`def fib(n):
    a, b = 0, 1
    for _ in range(n-1): a, b = b, a+b
    return b
print(fib(7))  # 13` },
  { id:10, cat:"Numbers", title:"Check if a Number is Armstrong",
    java:`int n = 153, temp = n, sum = 0, digits = String.valueOf(n).length();
while (temp > 0) { sum += Math.pow(temp % 10, digits); temp /= 10; }
System.out.println(sum == n); // true`,
    python:`n = 153
print(sum(int(d)**len(str(n)) for d in str(n)) == n)  # True` },
  { id:11, cat:"Numbers", title:"Check if a Number is Perfect",
    java:`int n = 28, sum = 0;
for (int i = 1; i < n; i++) if (n % i == 0) sum += i;
System.out.println(sum == n); // true`,
    python:`n = 28
print(sum(i for i in range(1,n) if n%i==0) == n)  # True` },
  { id:12, cat:"Numbers", title:"Find GCD of Two Numbers",
    java:`int a = 12, b = 18;
while (b != 0) { int t = b; b = a % b; a = t; }
System.out.println(a); // 6`,
    python:`import math
print(math.gcd(12, 18))  # 6` },
  { id:13, cat:"Numbers", title:"Find LCM of Two Numbers",
    java:`int a = 4, b = 6, gcd = a, temp = b;
while (temp != 0) { int t = temp; temp = gcd % temp; gcd = t; }
System.out.println((a * b) / gcd); // 12`,
    python:`import math
a, b = 4, 6
print((a * b) // math.gcd(a, b))  # 12` },
  { id:14, cat:"Numbers", title:"Count Digits in a Number",
    java:`int n = 12345;
System.out.println(String.valueOf(n).length()); // 5`,
    python:`print(len(str(12345)))  # 5` },
  { id:15, cat:"Numbers", title:"Sum of Digits of a Number",
    java:`int n = 1234, sum = 0;
while (n > 0) { sum += n % 10; n /= 10; }
System.out.println(sum); // 10`,
    python:`print(sum(int(d) for d in str(1234)))  # 10` },
  { id:16, cat:"Strings", title:"Reverse Words in a String",
    java:`String[] words = "Hello World Java".split(" ");
StringBuilder sb = new StringBuilder();
for (int i = words.length - 1; i >= 0; i--)
    sb.append(words[i]).append(" ");
System.out.println(sb.toString().trim());`,
    python:`s = "Hello World Java"
print(' '.join(s.split()[::-1]))` },
  { id:17, cat:"Strings", title:"Count Vowels and Consonants",
    java:`String s = "hello world";
int v = 0, c = 0;
for (char ch : s.toCharArray()) {
    if ("aeiou".indexOf(ch) != -1) v++;
    else if (Character.isLetter(ch)) c++;
}
System.out.println("Vowels: " + v + ", Consonants: " + c);`,
    python:`s = "hello world"
v = sum(1 for c in s if c in 'aeiou')
c = sum(1 for ch in s if ch.isalpha() and ch not in 'aeiou')
print(f'Vowels: {v}, Consonants: {c}')` },
  { id:18, cat:"Strings", title:"Count Frequency of Characters",
    java:`String s = "banana";
Map<Character, Integer> map = new LinkedHashMap<>();
for (char ch : s.toCharArray())
    map.put(ch, map.getOrDefault(ch, 0) + 1);
System.out.println(map); // {b=1, a=3, n=2}`,
    python:`from collections import Counter
print(dict(Counter("banana")))  # {'b':1,'a':3,'n':2}` },
  { id:19, cat:"Strings", title:"Find Duplicate Characters in a String",
    java:`String s = "programming";
Map<Character, Integer> map = new HashMap<>();
for (char ch : s.toCharArray())
    map.put(ch, map.getOrDefault(ch, 0) + 1);
for (var e : map.entrySet())
    if (e.getValue() > 1) System.out.print(e.getKey() + " ");`,
    python:`from collections import Counter
s = "programming"
print([c for c,v in Counter(s).items() if v > 1])` },
  { id:20, cat:"Strings", title:"Remove Duplicate Characters from a String",
    java:`String s = "programming";
StringBuilder sb = new StringBuilder();
Set<Character> seen = new LinkedHashSet<>();
for (char ch : s.toCharArray())
    if (seen.add(ch)) sb.append(ch);
System.out.println(sb); // progamin`,
    python:`s = "programming"
print(''.join(dict.fromkeys(s)))  # progamin` },
  { id:21, cat:"Strings", title:"Check if Two Strings are Anagrams",
    java:`char[] a = "listen".toCharArray(), b = "silent".toCharArray();
Arrays.sort(a); Arrays.sort(b);
System.out.println(Arrays.equals(a, b)); // true`,
    python:`print(sorted("listen") == sorted("silent"))  # True` },
  { id:22, cat:"Strings", title:"Find the First Non-Repeating Character",
    java:`String s = "swiss";
Map<Character, Integer> map = new LinkedHashMap<>();
for (char ch : s.toCharArray())
    map.put(ch, map.getOrDefault(ch, 0) + 1);
for (var e : map.entrySet())
    if (e.getValue() == 1) { System.out.println(e.getKey()); break; }`,
    python:`from collections import Counter
s = "swiss"
c = Counter(s)
print(next(ch for ch in s if c[ch]==1))  # w` },
  { id:23, cat:"Arrays", title:"Find the Largest Element in an Array",
    java:`int[] arr = {3, 7, 1, 9, 4};
int max = arr[0];
for (int x : arr) if (x > max) max = x;
System.out.println(max); // 9`,
    python:`arr = [3,7,1,9,4]
print(max(arr))  # 9` },
  { id:24, cat:"Arrays", title:"Find the Smallest Element in an Array",
    java:`int[] arr = {3, 7, 1, 9, 4};
int min = arr[0];
for (int x : arr) if (x < min) min = x;
System.out.println(min); // 1`,
    python:`arr = [3,7,1,9,4]
print(min(arr))  # 1` },
  { id:25, cat:"Arrays", title:"Find the Second Largest Element",
    java:`int[] arr = {3, 7, 1, 9, 4};
int max = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
for (int x : arr) {
    if (x > max) { second = max; max = x; }
    else if (x > second && x != max) second = x;
}
System.out.println(second); // 7`,
    python:`arr = [3,7,1,9,4]
s = sorted(set(arr), reverse=True)
print(s[1])  # 7` },
  { id:26, cat:"Arrays", title:"Find the Second Smallest Element",
    java:`int[] arr = {3, 7, 1, 9, 4};
int min = Integer.MAX_VALUE, second = Integer.MAX_VALUE;
for (int x : arr) {
    if (x < min) { second = min; min = x; }
    else if (x < second && x != min) second = x;
}
System.out.println(second); // 3`,
    python:`arr = [3,7,1,9,4]
s = sorted(set(arr))
print(s[1])  # 3` },
  { id:27, cat:"Arrays", title:"Find the Sum of Array Elements",
    java:`int[] arr = {1, 2, 3, 4, 5};
int sum = 0;
for (int x : arr) sum += x;
System.out.println(sum); // 15`,
    python:`print(sum([1,2,3,4,5]))  # 15` },
  { id:28, cat:"Arrays", title:"Reverse an Array",
    java:`int[] arr = {1, 2, 3, 4, 5};
int l = 0, r = arr.length - 1;
while (l < r) { int t = arr[l]; arr[l++] = arr[r]; arr[r--] = t; }
System.out.println(Arrays.toString(arr)); // [5,4,3,2,1]`,
    python:`arr = [1,2,3,4,5]
print(arr[::-1])  # [5,4,3,2,1]` },
  { id:29, cat:"Arrays", title:"Check if an Array is Sorted",
    java:`int[] arr = {1, 2, 3, 4, 5};
boolean sorted = true;
for (int i = 1; i < arr.length; i++)
    if (arr[i] < arr[i-1]) { sorted = false; break; }
System.out.println(sorted); // true`,
    python:`arr = [1,2,3,4,5]
print(arr == sorted(arr))  # True` },
  { id:30, cat:"Arrays", title:"Remove Duplicates from an Array",
    java:`int[] arr = {1, 2, 2, 3, 4, 4, 5};
int[] res = Arrays.stream(arr).distinct().toArray();
System.out.println(Arrays.toString(res));`,
    python:`arr = [1,2,2,3,4,4,5]
print(list(dict.fromkeys(arr)))` },
  { id:31, cat:"Arrays", title:"Find Duplicate Elements in an Array",
    java:`int[] arr = {1, 2, 3, 2, 4, 3};
Set<Integer> seen = new HashSet<>();
for (int x : arr)
    if (!seen.add(x)) System.out.print(x + " ");`,
    python:`arr = [1,2,3,2,4,3]
seen, dups = set(), set()
for x in arr:
    if x in seen: dups.add(x)
    seen.add(x)
print(dups)` },
  { id:32, cat:"Arrays", title:"Find Missing Number in an Array",
    java:`int[] arr = {1, 2, 4, 5, 6}; int n = 6;
int expected = n * (n + 1) / 2;
int actual = Arrays.stream(arr).sum();
System.out.println(expected - actual); // 3`,
    python:`arr = [1,2,4,5,6]; n = 6
print(n*(n+1)//2 - sum(arr))  # 3` },
  { id:33, cat:"Arrays", title:"Find Frequency of Array Elements",
    java:`int[] arr = {1, 2, 2, 3, 3, 3};
Map<Integer, Integer> map = new LinkedHashMap<>();
for (int x : arr) map.put(x, map.getOrDefault(x, 0) + 1);
System.out.println(map);`,
    python:`from collections import Counter
print(dict(Counter([1,2,2,3,3,3])))` },
  { id:34, cat:"Arrays", title:"Find Common Elements in Two Arrays",
    java:`int[] a = {1,2,3,4}, b = {3,4,5,6};
Set<Integer> setA = new HashSet<>();
for (int x : a) setA.add(x);
for (int x : b) if (setA.contains(x)) System.out.print(x + " ");`,
    python:`a, b = [1,2,3,4], [3,4,5,6]
print(list(set(a) & set(b)))` },
  { id:35, cat:"Arrays", title:"Merge Two Sorted Arrays",
    java:`int[] a = {1,3,5}, b = {2,4,6};
int[] res = new int[a.length + b.length];
int i = 0, j = 0, k = 0;
while (i < a.length && j < b.length)
    res[k++] = a[i] < b[j] ? a[i++] : b[j++];
while (i < a.length) res[k++] = a[i++];
while (j < b.length) res[k++] = b[j++];
System.out.println(Arrays.toString(res));`,
    python:`import heapq
a, b = [1,3,5], [2,4,6]
print(sorted(a+b))  # or list(heapq.merge(a,b))` },
  { id:36, cat:"Arrays", title:"Find Intersection of Two Arrays",
    java:`int[] a = {1,2,3,4}, b = {3,4,5,6};
Set<Integer> setA = new HashSet<>();
for (int x : a) setA.add(x);
Set<Integer> result = new HashSet<>();
for (int x : b) if (setA.contains(x)) result.add(x);
System.out.println(result); // [3, 4]`,
    python:`a, b = [1,2,3,4], [3,4,5,6]
print(list(set(a) & set(b)))  # [3,4]` },
  { id:37, cat:"Arrays", title:"Find Union of Two Arrays",
    java:`int[] a = {1,2,3}, b = {3,4,5};
Set<Integer> set = new LinkedHashSet<>();
for (int x : a) set.add(x);
for (int x : b) set.add(x);
System.out.println(set); // [1,2,3,4,5]`,
    python:`a, b = [1,2,3], [3,4,5]
print(list(set(a) | set(b)))  # [1,2,3,4,5]` },
  { id:38, cat:"Arrays", title:"Move All Zeros to the End",
    java:`int[] arr = {0,1,0,3,12};
int pos = 0;
for (int x : arr) if (x != 0) arr[pos++] = x;
while (pos < arr.length) arr[pos++] = 0;
System.out.println(Arrays.toString(arr));`,
    python:`arr = [0,1,0,3,12]
print(sorted(arr, key=lambda x: x==0))` },
  { id:39, cat:"Arrays", title:"Find Maximum and Minimum Difference",
    java:`int[] arr = {3, 7, 1, 9, 4};
int max = arr[0], min = arr[0];
for (int x : arr) { if (x > max) max = x; if (x < min) min = x; }
System.out.println(max - min); // 8`,
    python:`arr = [3,7,1,9,4]
print(max(arr) - min(arr))  # 8` },
  { id:40, cat:"Arrays", title:"Find Pair with Given Sum",
    java:`int[] arr = {1, 4, 3, 2, 7}; int target = 5;
Set<Integer> seen = new HashSet<>();
for (int x : arr) {
    if (seen.contains(target - x))
        System.out.println(x + " + " + (target - x) + " = " + target);
    seen.add(x);
}`,
    python:`arr = [1,4,3,2,7]; target = 5
seen = set()
for x in arr:
    if target-x in seen:
        print(f'{x} + {target-x} = {target}')
    seen.add(x)` },
];

const CATS = ["All","Strings","Numbers","Arrays"];
const CAT_COLORS = { Strings:"#58a6ff", Numbers:"#f59e0b", Arrays:"#3fb950" };
const STORAGE_KEY = "coding_mastered";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button className="code-copy-btn" onClick={copy} title="Copy code">
      {copied ? <Check size={13}/> : <Copy size={13}/>}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ProblemCard({ item }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("java");
  const [code, setCode] = useState({ java: item.java, python: item.python });
  const [mastered, setMastered] = useState(
    () => JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]").includes(item.id)
  );
  const taRef = useRef(null);

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
    setCode(prev => ({ ...prev, [lang]: e.target.value }));
    // auto-resize
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  }

  const currentCode = code[lang];

  return (
    <div className="corecs-card" style={{ borderLeft: mastered?"2px solid var(--success)":undefined }}>
      <button className="corecs-card-header" onClick={()=>setOpen(v=>!v)}>
        <span className="corecs-card-num">{String(item.id).padStart(2,"0")}</span>
        <span className="corecs-card-q">{item.title}</span>
        <span className="corecs-cat-badge" style={{color:CAT_COLORS[item.cat]||"#8b949e",borderColor:(CAT_COLORS[item.cat]||"#8b949e")+"44"}}>{item.cat}</span>
        <button className={`corecs-mastered-btn${mastered?" on":""}`} onClick={toggleMastered}>✓</button>
        <span className="corecs-chevron" style={{transform:open?"rotate(180deg)":undefined}}>▾</span>
      </button>

      <div className="corecs-card-body" style={{display:open?"block":"none"}}>
        {/* Lang toggle + copy */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,marginBottom:8}}>
          <div className="corecs-lang-toggle" style={{marginTop:0}}>
            {["java","python"].map(l=>(
              <button key={l} className={`corecs-lang-btn${lang===l?" active":""}`} onClick={()=>setLang(l)}>
                {l === "java" ? "Java" : "Python"}
              </button>
            ))}
          </div>
          <CopyBtn text={currentCode}/>
        </div>

        {/* Editable code area */}
        <div className="code-editor-wrap">
          <textarea
            ref={taRef}
            className="code-editor-ta"
            value={currentCode}
            onChange={handleCodeChange}
            spellCheck={false}
            rows={currentCode.split("\n").length}
          />
        </div>
      </div>
    </div>
  );
}

export default function CodingBasicsPage() {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const masteredIds = JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  const masteredCount = masteredIds.length;
  const pct = Math.round((masteredCount/PROBLEMS.length)*100);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return PROBLEMS.filter(item=>{
      if(cat!=="All"&&item.cat!==cat) return false;
      if(!q) return true;
      return item.title.toLowerCase().includes(q);
    });
  },[cat,search]);

  return (
    <div className="container collection">
      <div className="page-title">
        <div>
          <p className="eyebrow">BASIC CODING</p>
          <h1>Strings, Numbers & Arrays</h1>
          <p>40 most asked basic coding problems — editable code, Java & Python.</p>
        </div>
        <Code2 size={24}/>
      </div>

      <div className="corecs-stats">
        <div className="corecs-stat"><strong>{PROBLEMS.length}</strong><span>Total</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--success)"}}>{masteredCount}</strong><span>Mastered</span></div>
        <div className="corecs-stat"><strong style={{color:"var(--accent)"}}>{pct}%</strong><span>Progress</span></div>
        <div className="corecs-progress-track"><div className="corecs-progress-fill" style={{width:`${pct}%`}}/></div>
      </div>

      <div className="sheet-toolbar">
        <div className="inline-search">
          <Search size={15}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search problems…"/>
        </div>
        <select className="filter-select" value={cat} onChange={e=>setCat(e.target.value)}>
          {CATS.map(c=><option key={c} value={c}>{c==="All"?"All categories":c}</option>)}
        </select>
      </div>

      {filtered.length ? (
        <div className="corecs-list">
          {filtered.map(item=><ProblemCard key={item.id} item={item}/>)}
        </div>
      ) : (
        <div className="corecs-empty">
          <Search size={32} style={{color:"var(--muted)",marginBottom:12}}/>
          <p>No problems match.</p>
        </div>
      )}
    </div>
  );
}
