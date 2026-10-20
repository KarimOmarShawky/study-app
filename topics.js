// Concept-first laboratory. No course, session, or assessment data is consumed here.
// Each model produces immutable snapshots; the view only draws the selected snapshot.
(function () {
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const copy = x => JSON.parse(JSON.stringify(x));
  const fmt = x => x === Infinity ? '∞' : x;
  const numbers = (text, max = 12, min = -99, high = 99) => {
    const parts = text.trim().split(/[\s,]+/).filter(Boolean), out = parts.map(Number);
    if (!parts.length || parts.length > max || parts.some(x => !/^-?\d+$/.test(x)) || out.some(x => !Number.isSafeInteger(x) || x < min || x > high))
      throw new Error(`Enter 1–${max} whole numbers between ${min} and ${high}.`);
    return out;
  };
  const TOPICS = [
    { id: 'sort', group: 'Sequences', title: 'Sorting', icon: '▥', desc: 'Build order, one comparison at a time.', question: 'How does an unordered sequence become ordered?', model: 'Values move between indexed positions. The key, sorted region, and active comparison have different roles.', watch: 'Follow the highlighted values. A partitioned region is not necessarily a sorted region.', defaults: { text: '7, 3, 5, 2, 8, 1', method: 'insertion' }, variants: [['insertion','Insertion sort'],['merge','Merge sort'],['quick','Quicksort'],['counting','Counting sort']], cost: 'Depends on the selected strategy; compare operation counts on the same input.' },
    { id: 'search', group: 'Sequences', title: 'Binary search', icon: '⌕', desc: 'Shrink a sorted search space.', question: 'What information lets us eliminate half the candidates?', model: 'The remaining candidates occupy an inclusive interval [low, high] in a sorted sequence.', watch: 'Compare the middle value to the target, then discard an entire side. Duplicates may return any match.', defaults: { text: '2, 5, 8, 12, 16, 23, 38, 56', target: '23' }, cost: 'O(log n) comparisons · O(1) auxiliary space. Input is sorted before searching.' },
    { id: 'rec', group: 'Divide & conquer', title: 'Recursion trees', icon: '⋔', desc: 'See how subproblems multiply.', question: 'Does most of the work happen at the root or the leaves?', model: 'A node of size s creates a children of size s/b. Node area is not a cost measure; the work bars show the totals.', watch: 'At depth d there are a^d subproblems. Level work is a^d · (n/b^d)^k.', defaults: { a: '2', b: '2', power: '1', n: '32' }, cost: 'Compare k with log_b(a). The model uses f(s)=s^k and constant-cost leaves.' },
    { id: 'hash', group: 'Data structures', title: 'Hashing', icon: '#', desc: 'Route keys into a finite table.', question: 'What happens when two keys choose the same bucket?', model: 'Hashing maps a key to a bucket; collision resolution defines where a displaced key is allowed to go.', watch: 'The highlighted trail is the exact probe sequence. A repeated bucket means the sequence has cycled.', defaults: { text: '10, 17, 24, 4, 11', size: '7', method: 'linear' }, variants: [['linear','Linear probing'],['double','Double hashing'],['chain','Separate chaining']], cost: 'Expected O(1) with good distribution and controlled load; worst O(n). Double hashing uses step 1+(key mod (m−1)).' },
    { id: 'amortized', group: 'Data structures', title: 'Dynamic arrays', icon: '↗', desc: 'Understand occasional expensive growth.', question: 'How can a costly resize coexist with cheap average appends?', model: 'A full array doubles its capacity. Old values are copied before the new value is appended.', watch: 'Compare a single append’s work with total work across the sequence. Capacity and length are not the same.', defaults: { n: '10' }, cost: 'A resize append costs Θ(n); n appends cost Θ(n) total, hence Θ(1) amortized per append.' },
    { id: 'trees', group: 'Data structures', title: 'Balanced trees', icon: '♧', desc: 'Preserve order while changing shape.', question: 'How can rotations shorten a tree without breaking search order?', model: 'A red–black tree maintains binary-search ordering, no adjacent red nodes, and equal black-height to NIL leaves.', watch: 'Follow the highlighted inserted key and its ancestors. Intermediate fixup states may temporarily violate an invariant.', defaults: { text: '20, 10, 5, 15, 30, 25, 35' }, cost: 'O(log n) search/insertion. NIL children are implicit black leaves; duplicate keys are omitted.' },
    { id: 'dp', group: 'Optimization', title: 'Dynamic programming', icon: '▦', desc: 'Reuse solved subproblems.', question: 'Which smaller answers does this cell depend on?', model: 'Each cell represents a well-defined prefix subproblem. Only already-solved dependencies may be read.', watch: 'Amber marks dependency cells; blue marks the cell being written. Unknown cells are not zeros.', defaults: { method: 'lcs', first: 'BANANA', second: 'ATANA', text: '2:6, 3:10, 4:12', capacity: '6' }, variants: [['lcs','Longest common subsequence'],['knapsack','0/1 knapsack']], cost: 'LCS: O(mn) time/storage. Knapsack: O(nW) time/storage, pseudo-polynomial in capacity W.' },
    { id: 'paths', group: 'Graphs & greedy', title: 'Graph exploration', icon: '◎', desc: 'Discover vertices and shortest paths.', question: 'Which vertex should we explore next, and why?', model: 'Vertices represent states and edges represent connections. BFS follows hop distance; Dijkstra follows weighted distance.', watch: 'The frontier contains discovered but unfinished vertices. Green vertices are finished. Edge weights matter only to Dijkstra.', defaults: { method: 'dijkstra', text: 'A B 4, A C 2, C B 1, B D 3, C D 7, C E 5, D E 1', source: 'A' }, variants: [['dijkstra','Dijkstra · weighted distance'],['bfs','Breadth-first · hop distance']], cost: 'Nonnegative, undirected graph. BFS O(V+E); scan-based Dijkstra O(V²+E). Adjacency is explored in input order.' },
    { id: 'mst', group: 'Graphs & greedy', title: 'Spanning trees', icon: '⌁', desc: 'Connect vertices without cycles.', question: 'Which connections minimize the total weight?', model: 'Kruskal grows a forest by considering edges from lightest to heaviest, accepting only edges between different components.', watch: 'Green edges join the forest; red candidates are rejected because their endpoints are already connected.', defaults: { text: 'A B 4, A C 2, B C 1, B D 5, C D 3, C E 7, D E 2' }, cost: 'O(E log E) for sorting. A disconnected graph produces a minimum spanning forest, not one tree.' },
    { id: 'huffman', group: 'Graphs & greedy', title: 'Prefix coding', icon: '⑂', desc: 'Turn frequencies into a code tree.', question: 'Why should rare symbols get longer codewords?', model: 'Repeatedly merge the two least frequent trees. Every symbol becomes a leaf; left and right edges encode 0 and 1.', watch: 'Internal node weight is the sum of its descendants. Leaf depth gives the codeword length.', defaults: { text: 'A:5, B:9, C:12, D:13, E:16, F:20' }, cost: 'Heap-based construction is O(n log n); this small visual model sorts the forest at each merge.' },
    { id: 'reduction', group: 'Foundations', title: 'Problem reductions', icon: '⇄', desc: 'Map a logical witness into a graph.', question: 'How does a satisfying assignment become a clique?', model: 'Make a vertex for each literal occurrence, and connect compatible literals from different clauses. The graph stays fixed when the assignment changes.', watch: 'One true literal per clause forms a candidate witness. An unsuccessful assignment does NOT prove that no clique exists.', defaults: {}, cost: 'For k clauses of three literals: 3k vertices, O(k²) possible edges, polynomial construction.' },
    { id: 'bits', group: 'Foundations', title: 'Bit operations', icon: '01', desc: 'Manipulate a fixed-width word.', question: 'Which bits change, disappear, or wrap around?', model: 'An unsigned eight-bit word has values 0–255. Shifts discard bits; rotation wraps them; a mask keeps the result within eight bits.', watch: 'Bit positions run from 7 (most significant) to 0. x & (x−1) clears the lowest set bit.', defaults: { n: '137', method: 'rotate' }, variants: [['rotate','Rotate left'],['shift','Logical left shift'],['count','Clear lowest set bit']], cost: 'A fixed-width bitwise operation is O(1). Repeated lowest-bit clearing takes one step per set bit.' }
  ];

  function searchFrames(cfg) {
    const arr = numbers(cfg.text).sort((a,b) => a-b), target = Number(cfg.target);
    if (!/^-?\d+$/.test(cfg.target) || !Number.isSafeInteger(target)) throw new Error('Enter an integer target.');
    const frames = []; let lo = 0, hi = arr.length-1, comparisons = 0;
    const push = (desc, mid, found = false) => frames.push({ arr: arr.slice(), lo, hi, mid, found, desc, roles: Object.fromEntries(arr.map((_,i) => [i, i < lo || i > hi ? 'dim' : i === mid ? (found ? 'sorted' : 'pivot') : ''])), metrics: [['Comparisons', comparisons], ['Candidates', Math.max(0,hi-lo+1)]] });
    push(`Sorted input. Search for ${target} inside [0, ${hi}].`, null);
    while (lo <= hi) {
      const mid = Math.floor((lo+hi)/2); comparisons++;
      push(`Middle index ${mid}: compare ${arr[mid]} with target ${target}.`, mid);
      if (arr[mid] === target) { push(`Found ${target} at index ${mid}.`,mid,true); return frames; }
      if (arr[mid] < target) { lo = mid+1; push(`${arr[mid]} < ${target}: discard the middle and everything to its left.`,null); }
      else { hi = mid-1; push(`${arr[mid]} > ${target}: discard the middle and everything to its right.`,null); }
    }
    push(`The candidate interval is empty. ${target} is not present.`,null); return frames;
  }
  function hashFrames(cfg) {
    const keys = numbers(cfg.text,12,0,999), size = +cfg.size;
    if (!Number.isInteger(size) || size < 3 || size > 13) throw new Error('Choose a table size from 3 to 13.');
    const buckets = Array.from({length:size},()=>[]), frames = [];
    const push = (desc,key=null,probe=[],active=null) => frames.push({ buckets: copy(buckets), key, probe:probe.slice(), active, desc, metrics:[['Stored',buckets.flat().length],['Buckets',size],['Load', (buckets.flat().length/size).toFixed(2)]] });
    push('An empty table. Each key first chooses key mod table size.');
    keys.forEach(key => {
      const home = key%size, trail=[]; push(`${key} mod ${size} = ${home}. Start at bucket ${home}.`,key,[],home);
      if (cfg.method === 'chain') { buckets[home].push(key); push(`Append ${key} to the chain at bucket ${home}.`,key,[home],home); return; }
      const step = cfg.method === 'double' ? 1+key%(size-1) : 1;
      for (let i=0;i<size;i++) {
        const at = (home+i*step)%size;
        if (trail.includes(at)) { push(`Probe cycle: step ${step} cannot reach another bucket. ${key} is not inserted.`,key,trail,at); return; }
        trail.push(at);
        if (!buckets[at].length) { buckets[at].push(key); push(`Bucket ${at} is free. Store ${key} after ${trail.length} probe(s).`,key,trail,at); return; }
        push(`Bucket ${at} contains ${buckets[at][0]}. Collision; advance by ${step}.`,key,trail,at);
      }
      push(`No reachable bucket is free; ${key} is not inserted.`,key,trail);
    }); return frames;
  }
  function arrayFrames(cfg) {
    const n = +cfg.n; if (!Number.isInteger(n) || n<1 || n>20) throw new Error('Choose 1–20 appends.');
    const frames=[]; let cap=1, len=0, total=0;
    frames.push({cap,len,total,actual:0,costs:[],desc:'Start with one empty slot. Capacity is allocated storage; length is stored values.'});
    const costs=[];
    for(let i=1;i<=n;i++) {
      const copying = len === cap ? len : 0, oldCap=cap;
      if(copying) cap*=2;
      total+=copying+1; len++; costs.push(copying+1);
      frames.push({cap,len,total,oldCap,copying,actual:copying+1,costs:costs.slice(),desc:copying ? `Capacity ${oldCap} was full. Allocate ${cap} slots, copy ${copying} values, append ${i}: ${copying+1} writes.` : `Append ${i} into existing capacity: one write.`,metrics:[['Length',len],['Capacity',cap],['This append',copying+1],['Total writes',total]]});
    } return frames;
  }
  function parseGraph(text) {
    const tokens=text.trim().split(/[,;\n]+/).filter(x=>x.trim());
    if (!tokens.length || tokens.length>14) throw new Error('Enter 1–14 edges: A B 4, B C 2.');
    const nodes=[],edges=[],seen=new Set();
    tokens.forEach((part,i)=>{
      const m=/^\s*([A-Za-z])\s+([A-Za-z])\s+(\d+)\s*$/.exec(part);
      if(!m || +m[3]>99 || m[1].toUpperCase()===m[2].toUpperCase()) throw new Error('Each edge needs two different letter vertices and a weight 0–99: A B 4.');
      const u=m[1].toUpperCase(),v=m[2].toUpperCase(),key=[u,v].sort().join('');
      if(seen.has(key)) throw new Error('Use only one edge per pair of vertices.'); seen.add(key);
      for(const n of [u,v]) if(!nodes.includes(n)) nodes.push(n);
      edges.push({u,v,w:+m[3],id:i});
    });
    if(nodes.length>8) throw new Error('Keep the graph to 8 vertices or fewer.');
    return {nodes,edges};
  }
  function graphFrames(cfg, mst=false) {
    const {nodes,edges}=parseGraph(cfg.text), frames=[];
    const active=[],done=[],chosen=[],frontier=[],dist=Object.fromEntries(nodes.map(n=>[n,Infinity])),parent={};
    const push=(desc,edge=null) => frames.push({nodes,edges,done:done.slice(),chosen:chosen.slice(),frontier:frontier.slice(),dist:{...dist},parent:{...parent},current:active[0],edge,desc,metrics:mst ? [['Accepted edges',chosen.length],['Total weight',edges.filter(e=>chosen.includes(e.id)).reduce((a,e)=>a+e.w,0)]] : [['Finished',done.length],['Frontier',frontier.length]]});
    if(mst) {
      const sets=Object.fromEntries(nodes.map(n=>[n,n]));
      const find=n=>sets[n]===n?n:(sets[n]=find(sets[n]));
      push('Start with separate components. Examine edges in nondecreasing weight order.');
      for(const e of edges.slice().sort((a,b)=>a.w-b.w||a.id-b.id)) {
        const same=find(e.u)===find(e.v);
        if(!same) {sets[find(e.u)]=find(e.v);chosen.push(e.id);}
        push(`${e.u}—${e.v}, weight ${e.w}: ${same?'reject; endpoints are already connected, so this edge would form a cycle.':'accept; it joins two different components.'}`,{...e,rejected:same});
      }
      push(chosen.length===nodes.length-1?'Complete: every vertex is connected with minimum total edge weight.':'Complete: disconnected components form a minimum spanning forest.');
      return frames;
    }
    const source=cfg.source.trim().toUpperCase(); if(!nodes.includes(source)) throw new Error('Choose a source vertex that appears in the graph.');
    dist[source]=0;frontier.push(source); push(`Discover source ${source}; distance is zero.`);
    while(frontier.length) {
      if(cfg.method==='dijkstra') frontier.sort((a,b)=>dist[a]-dist[b]);
      const u=frontier.shift(); active[0]=u; done.push(u);
      push(`Explore ${u}, ${cfg.method==='bfs'?'next in the FIFO frontier':'the unsettled vertex with smallest tentative distance'} (${dist[u]}).`);
      for(const e of edges.filter(e=>e.u===u||e.v===u)) {
        const v=e.u===u?e.v:e.u;if(done.includes(v))continue;
        const candidate=dist[u]+(cfg.method==='bfs'?1:e.w),old=dist[v];
        if(candidate<old) {
          dist[v]=candidate;parent[v]=u;if(!frontier.includes(v))frontier.push(v);
          // Rebuild the predecessor forest so an improved path removes the previous edge.
          chosen.splice(0,chosen.length,...Object.entries(parent).map(([to,from])=>edges.find(x=>(x.u===from&&x.v===to)||(x.v===from&&x.u===to)).id));
          push(`${u} → ${v}: ${dist[u]} + ${cfg.method==='bfs'?1:e.w} = ${candidate} improves ${fmt(old)}. Set parent(${v}) = ${u}.`,e);
        } else push(`${u} → ${v}: candidate ${candidate} does not improve ${fmt(old)}. Keep the existing path.`,e);
      }
    }
    active.length=0;push('Frontier empty. Distances are final; vertices still marked ∞ are unreachable.');return frames;
  }
  function dpFrames(cfg) {
    let rows,cols,table,frames=[],items,A,B;
    if(cfg.method==='lcs') {
      A=cfg.first.toUpperCase();B=cfg.second.toUpperCase();
      if(!/^[A-Z]{1,9}$/.test(A)||!/^[A-Z]{1,9}$/.test(B))throw new Error('Use 1–9 letters in each sequence.');
      rows=['∅',...A];cols=['∅',...B];table=Array.from({length:rows.length},()=>Array(cols.length).fill(null));
    } else {
      const tokens=cfg.text.trim().split(/[\s,]+/).filter(Boolean);
      if(!tokens.length||tokens.length>6||tokens.some(t=>!/^\d+:\d+$/.test(t)))throw new Error('Enter up to 6 weight:value items, e.g. 2:6, 3:10.');
      items=tokens.map(t=>t.split(':').map(Number));const W=+cfg.capacity;
      if(!Number.isInteger(W)||W<1||W>12||items.some(([w,v])=>w<1||w>20||v>99))throw new Error('Capacity must be 1–12; item weights 1–20, values 0–99.');
      rows=['∅',...items.map(([w,v],i)=>`${i+1} (${w}:${v})`)];cols=Array.from({length:W+1},(_,i)=>i);table=Array.from({length:rows.length},()=>Array(cols.length).fill(null));
    }
    const push=(desc,cell=null,deps=[],path=[])=>frames.push({rows,cols,table:copy(table),cell,deps:copy(deps),path:copy(path),desc,method:cfg.method});
    table[0].fill(0);for(const row of table)row[0]=0;
    push('Initialize empty-prefix / zero-capacity base cases. All other cells are unknown.');
    for(let i=1;i<rows.length;i++)for(let j=1;j<cols.length;j++) {
      let deps,desc;
      if(cfg.method==='lcs') {
        const same=A[i-1]===B[j-1];deps=same?[[i-1,j-1]]:[[i-1,j],[i,j-1]];
        table[i][j]=same?table[i-1][j-1]+1:Math.max(table[i-1][j],table[i][j-1]);
        desc=same?`${A[i-1]} matches ${B[j-1]}. Extend the diagonal answer ${table[i-1][j-1]} by 1 → ${table[i][j]}.`:`${A[i-1]} ≠ ${B[j-1]}. Reuse max(above ${table[i-1][j]}, left ${table[i][j-1]}) → ${table[i][j]}.`;
      } else {
        const [w,v]=items[i-1];deps=[[i-1,j]];
        if(w<=j)deps.push([i-1,j-w]);
        const include=w<=j?v+table[i-1][j-w]:null;
        table[i][j]=Math.max(table[i-1][j],include==null?0:include);
        desc=`Item ${i}, capacity ${j}: skip = ${table[i-1][j]}; ${include==null?'item is too heavy':`include = ${v} + ${table[i-1][j-w]} = ${include}`} → ${table[i][j]}. Dependencies come from the previous item row.`;
      }
      push(desc,[i,j],deps);
    }
    let i=rows.length-1,j=cols.length-1,answer=[],path=[];
    while(i>0&&j>0) {
      path.push([i,j]);
      if(cfg.method==='lcs') {if(A[i-1]===B[j-1]){answer.unshift(A[i-1]);i--;j--;}else if(table[i-1][j]>=table[i][j-1])i--;else j--;}
      else {if(table[i][j]!==table[i-1][j]){answer.unshift(i);j-=items[i-1][0];}i--;}
    }
    push(`Reconstruct an optimal solution: ${cfg.method==='lcs'?answer.join('')||'empty subsequence':'items '+(answer.join(', ')||'none')}. Optimal value = ${table.at(-1).at(-1)}.`,null,[],path);return frames;
  }
  function huffmanFrames(cfg) {
    const parts=cfg.text.trim().split(/[\s,]+/).filter(Boolean);
    if(parts.length<2||parts.length>7||parts.some(p=>!/^([A-Za-z]):([1-9]\d*)$/.test(p)))throw new Error('Enter 2–7 unique letter:frequency pairs, e.g. A:5, B:9.');
    let forest=parts.map((p,i)=>({label:p[0].toUpperCase(),w:+p.slice(2),id:'leaf'+i}));
    if(new Set(forest.map(n=>n.label)).size!==forest.length||forest.some(n=>n.w>99))throw new Error('Use unique symbols and frequencies 1–99.');
    const frames=[],push=desc=>frames.push({forest:copy(forest),desc});push('One leaf per symbol. Each root weight is its total frequency.');
    let id=0;
    while(forest.length>1){forest.sort((a,b)=>a.w-b.w||a.id.localeCompare(b.id));const l=forest.shift(),r=forest.shift();forest.push({id:'merge'+id++,w:l.w+r.w,l,r});push(`Merge the two smallest roots: ${l.w} + ${r.w} = ${l.w+r.w}. Keep their subtrees intact.`);}
    const codes=[];const walk=(n,code)=>{if(n.label)codes.push({symbol:n.label,frequency:n.w,code});else{walk(n.l,code+'0');walk(n.r,code+'1');}};walk(forest[0],'');
    frames.push({forest:copy(forest),codes,desc:`Prefix-free code complete. Weighted length = ${codes.reduce((s,c)=>s+c.frequency*c.code.length,0)} bits per frequency batch. No leaf code is a prefix of another.`});return frames;
  }
  function bitFrames(cfg) {
    const x=+cfg.n;if(!/^\d+$/.test(cfg.n)||!Number.isInteger(x)||x<0||x>255)throw new Error('Enter an unsigned value from 0 to 255.');
    const frames=[{value:x,previous:x,desc:`Initial word: ${x} = ${x.toString(2).padStart(8,'0')}₂.`,metrics:[['Decimal',x],['Set bits',x.toString(2).replace(/0/g,'').length]]}];
    let cur=x;
    for(let i=1;i<=(cfg.method==='count'?8:1);i++) {
      if(cfg.method==='count'&&cur===0)break;const prev=cur;
      cur=cfg.method==='rotate'?((cur<<1)|(cur>>>7))&255:cfg.method==='shift'?(cur<<1)&255:cur&(cur-1);
      frames.push({value:cur,previous:prev,desc:cfg.method==='rotate'?`Move the highest bit ${prev>>>7} into the lowest position. Result ${cur}; no bit is lost.`:cfg.method==='shift'?`Shift all bits left, drop the highest bit, insert 0 at the right. Result ${cur}.`:`${prev} & (${prev}−1) = ${cur}. Exactly one set bit disappears.`,metrics:[['Decimal',cur],['Operations',i],['Set bits',cur.toString(2).replace(/0/g,'').length]]});
    }return frames;
  }
  function build(topic,cfg) {
    if(topic==='sort')return window.STUDY_SIM.buildSortTrace(cfg.method,cfg.text,1).map(s=>({...s,desc:s.desc,metrics:[['Comparisons',s.comps],['Moves / swaps',s.swaps],['Calls',s.calls]]}));
    if(topic==='trees') {const vals=numbers(cfg.text);return window.STUDY_SIM.buildRbtSnapshots(vals.join(',')).map(s=>({...s,desc:s.title+'. '+s.detail}));}
    if(topic==='search')return searchFrames(cfg);
    if(topic==='hash')return hashFrames(cfg);
    if(topic==='amortized')return arrayFrames(cfg);
    if(topic==='paths'||topic==='mst')return graphFrames(cfg,topic==='mst');
    if(topic==='dp')return dpFrames(cfg);
    if(topic==='huffman')return huffmanFrames(cfg);
    if(topic==='bits')return bitFrames(cfg);
    return [];
  }
  const tone = role => ({ sorted:'#22a06b', active:'#f2a93b', pivot:'#7863d4', greater:'#eb8452', dim:'#c4cbd5' }[role] || '#7298d0');
  function SequenceDiagram({ f, topic }) {
    const arr=f.arr, n=arr.length, max=Math.max(1,...arr.map(Math.abs)), W=760, cell=W/n;
    return html`<div className="tl-sequence">${f.extra&&f.extra.heldKey!==undefined&&html`<div className="tl-held-key">Held outside the array <b>key = ${f.extra.heldKey}</b><span>The dashed position is the insertion hole.</span></div>`}<svg viewBox="0 0 820 340" role="img" aria-label="Sequence values with active regions and index positions">
      <line x1="30" x2="790" y1="250" y2="250" stroke="var(--line)"/>
      ${arr.map((v,i)=>{
        const x=30+i*cell+cell*.13,w=cell*.74,h=24+Math.abs(v)/max*150,role=f.roles&&f.roles[i]||'',label=f.ptrs&&f.ptrs[i],hole=f.extra&&f.extra.heldKey!==undefined&&f.extra.hole===i;
        return html`<g key=${i} opacity=${role==='dim'?.25:1}><rect x=${x} y=${250-h} width=${w} height=${h} rx="7" fill=${hole?'none':tone(role)} stroke=${hole?'#7863d4':'none'} strokeDasharray=${hole?'6 5':null}/><text x=${x+w/2} y=${235-h} textAnchor="middle" className="tl-svg-value">${hole?'hole':v}</text><text x=${x+w/2} y="275" textAnchor="middle" className="tl-svg-label">${topic==='sort'?i+1:i}</text>${label&&html`<text x=${x+w/2} y="304" textAnchor="middle" className="tl-svg-pointer">${label}</text>`}</g>`;
      })}
    </svg><div className="tl-stage-note">${topic==='search'?`Candidate interval [${f.lo}, ${f.hi}] · zero-based indices`:'One-based indices · bar height represents absolute magnitude'}</div>
      ${f.extra&&f.extra.L&&html`<div className="tl-merge-buffers">${[['Left',f.extra.L,f.extra.li],['Right',f.extra.R,f.extra.ri]].map(([name,values,at])=>html`<div key=${name}><b>${name} buffer</b>${values.map((v,i)=>html`<span key=${i} className=${at!==undefined&&i<at?'consumed':i===at?'current':''}>${v}</span>`)}</div>`)}</div>`}
      ${f.extra&&f.extra.B&&html`<div className="tl-output"><b>Output</b>${f.extra.B.map((v,i)=>html`<span key=${i}>${v}</span>`)}</div>`}
      ${f.extra&&f.extra.Acc&&html`<div className="tl-buckets">${f.extra.Occ.map((count,i)=>html`<div key=${i}><small>key ${i}</small><b>${count}</b><small>prefix ${f.extra.Acc[i]}</small></div>`)}</div>`}
    </div>`;
  }
  function HashDiagram({ f, cfg }) {
    return html`<div className="tl-hash"><div className="tl-routing"><span>Key <b>${f.key==null?'?':f.key}</b></span><i>→</i><span>mod <b>${cfg.size}</b></span><i>→</i><span>Home <b>${f.key==null?'?':f.key%+cfg.size}</b></span></div><div className="tl-probes"><b>Probe trail</b> ${f.probe.length?f.probe.join(' → '):'No probes yet'}</div><div className="tl-buckets">${f.buckets.map((b,i)=>html`<div key=${i} className=${(f.active===i?' current':'')+(f.probe.includes(i)?' visited':'')}><small>bucket ${i}</small><strong>${b.length?b.join(' → '):'∅'}</strong><small>${b.length?'occupied':'available'}</small></div>`)}</div></div>`;
  }
  function ArrayDiagram({ f }) {
    return html`<div className="tl-array"><div className="tl-capacity-label">Length ${f.len} <span>/ capacity ${f.cap}</span></div><div className="tl-slots">${Array.from({length:f.cap},(_,i)=>html`<div key=${i} className=${i<f.len?'filled':''}><b>${i<f.len?i+1:'·'}</b><small>${i}</small></div>`)}</div><h4>Cost of each append</h4><div className="tl-costs">${f.costs.map((v,i)=>html`<div key=${i}><i style=${{height:(v*9+3)+'px'}}></i><b>${v}</b><small>${i+1}</small></div>`)}</div><p className="tl-stage-note">A tall bar is a resize, not a high cost for every append. Total writes: ${f.total}.</p></div>`;
  }
  function TreeDiagram({ f, huffman=false }) {
    const roots=huffman?f.forest:[f.tree], leaves=n=>!n?0:(!n.l&&!n.r?1:leaves(n.l)+leaves(n.r));
    const total=roots.reduce((s,n)=>s+leaves(n),0)||1;let cursor=0;const nodes=[],edges=[];
    const layout=(n,depth)=>{
      if(!n)return null;const l=layout(n.l,depth+1),r=layout(n.r,depth+1);
      const x=l&&r?(l.x+r.x)/2:l?l.x:r?r.x:45+(cursor+++.5)*730/total;
      const node={...n,x,y:48+depth*75};nodes.push(node);if(l)edges.push({a:node,b:l,bit:'0'});if(r)edges.push({a:node,b:r,bit:'1'});return node;
    };
    if(huffman) roots.forEach(n=>layout(n,0));
    else {
      const count=n=>n?1+count(n.l)+count(n.r):0, amount=count(f.tree)||1;
      const searchTree=(n,depth)=>{if(!n)return null;const l=searchTree(n.l,depth+1);const node={...n,x:40+(cursor+++.5)*740/amount,y:48+depth*75};const r=searchTree(n.r,depth+1);nodes.push(node);if(l)edges.push({a:node,b:l});if(r)edges.push({a:node,b:r});return node;};
      searchTree(f.tree,0);
    }
    const height=Math.max(320,...nodes.map(n=>n.y+65));
    return html`<div><svg viewBox=${`0 0 820 ${height}`} role="img" aria-label=${huffman?'Huffman frequency forest with 0 and 1 edge labels':'Red-black search tree with key values and subtree sizes'}>
      ${edges.map((e,i)=>html`<g key=${i}><line x1=${e.a.x} y1=${e.a.y+20} x2=${e.b.x} y2=${e.b.y-20} stroke="var(--faint)" strokeWidth="2"/>${huffman&&html`<text x=${(e.a.x+e.b.x)/2+8} y=${(e.a.y+e.b.y)/2} className="tl-svg-label">${e.bit}</text>`}</g>`)}
      ${nodes.map((n,i)=>html`<g key=${i}><circle cx=${n.x} cy=${n.y} r="23" fill=${huffman?(n.label?'#7863d4':'#317c89'):n.c==='R'?'#ce5266':'#28384d'} stroke=${n.k===f.focusKey?'#efb84d':'transparent'} strokeWidth="5"/><text x=${n.x} y=${n.y+5} textAnchor="middle" fill="white" fontSize="15" fontWeight="700">${huffman?n.w:n.k}</text><text x=${n.x} y=${n.y+41} textAnchor="middle" className="tl-svg-label">${huffman?n.label||'merge':'size '+n.sz}</text></g>`)}
    </svg>${huffman&&f.codes&&html`<div className="tl-codewords">${f.codes.map(c=>html`<div key=${c.symbol}><b>${c.symbol}</b><code>${c.code}</code><small>frequency ${c.frequency}</small></div>`)}</div>`}</div>`;
  }
  function GraphDiagram({ f, cfg, mst }) {
    const pos=Object.fromEntries(f.nodes.map((n,i)=>[n,{x:410+250*Math.cos(-Math.PI/2+i*2*Math.PI/f.nodes.length),y:200+150*Math.sin(-Math.PI/2+i*2*Math.PI/f.nodes.length)}]));
    return html`<div><svg viewBox="0 0 820 410" role="img" aria-label="Undirected graph with highlighted candidate edges and computed path or forest">
      ${f.edges.map(e=>{const a=pos[e.u],b=pos[e.v],isActive=f.edge&&f.edge.id===e.id,accepted=f.chosen.includes(e.id);return html`<g key=${e.id}><line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} stroke=${isActive?(f.edge.rejected?'#ce5266':'#eca63c'):accepted?'#22a06b':'var(--line)'} strokeWidth=${isActive||accepted?4:2}/><rect x=${(a.x+b.x)/2-13} y=${(a.y+b.y)/2-12} width="26" height="24" rx="6" fill="var(--paper)"/><text x=${(a.x+b.x)/2} y=${(a.y+b.y)/2+5} textAnchor="middle" className="tl-svg-value">${e.w}</text></g>`;})}
      ${f.nodes.map(n=>{const p=pos[n],active=n===f.current,done=f.done.includes(n);return html`<g key=${n}><circle cx=${p.x} cy=${p.y} r="27" fill=${active?'#f2a93b':done?'#22a06b':'var(--paper)'} stroke=${f.frontier.includes(n)?'#7863d4':'var(--graphite)'} strokeWidth="3"/><text x=${p.x} y=${p.y+5} textAnchor="middle" className="tl-svg-value">${n}</text>${!mst&&html`<text x=${p.x} y=${p.y-39} textAnchor="middle" className="tl-svg-pointer">${fmt(f.dist[n])}</text>`}</g>`;})}
    </svg><div className="tl-frontier"><b>${mst?'Accepted edges':'Frontier'}</b>${mst?(f.chosen.map(id=>{const e=f.edges[id];return e.u+'—'+e.v;}).join(' · ')||'∅'):(f.frontier.map(n=>`${n} (${fmt(f.dist[n])})`).join(' → ')||'∅')}</div>
      ${!mst&&html`<div className="tl-distances">${f.nodes.map(n=>html`<div key=${n}><b>${n}</b><strong>${fmt(f.dist[n])}</strong><small>via ${f.parent[n]||'—'}</small></div>`)}</div>`}
    </div>`;
  }
  function DPDiagram({ f, onCell }) {
    const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1];
    return html`<div className="tl-dp"><div className="tl-stage-note">Rows: ${f.method==='lcs'?'first-sequence prefixes':'items available'} · Columns: ${f.method==='lcs'?'second-sequence prefixes':'available capacity'} · select a filled cell to revisit its decision</div><div className="tl-table-scroll"><table><thead><tr><th></th>${f.cols.map((v,j)=>html`<th key=${j}>${v}</th>`)}</tr></thead><tbody>${f.rows.map((row,i)=>html`<tr key=${i}><th>${row}</th>${f.table[i].map((v,j)=>html`<td key=${j}><button disabled=${v===null} onClick=${()=>onCell(i,j)} className=${same(f.cell,[i,j])?'current':f.deps.some(d=>same(d,[i,j]))?'dependency':f.path.some(d=>same(d,[i,j]))?'solution':v===null?'unknown':''} aria-label=${`Row ${i}, column ${j}: ${v===null?'unknown':v}`}>${v===null?'·':v}</button></td>`)}</tr>`)}</tbody></table></div><div className="tl-dp-key"><span>Blue: current cell</span><span>Amber: dependencies</span><span>Green: reconstructed solution</span></div></div>`;
  }
  function BitDiagram({ f, cfg }) {
    const row=(value,label)=>html`<div className="tl-bit-row"><b>${label}</b><div>${value.toString(2).padStart(8,'0').split('').map((bit,i)=>html`<span key=${i} className=${bit==='1'?'one':''}><small>${7-i}</small><strong>${bit}</strong></span>`)}</div><code>${value}</code></div>`;
    return html`<div className="tl-bits">${row(f.previous,'Before')}<div className="tl-bit-operation">${cfg.method==='rotate'?'↶ wrap most significant → least significant':cfg.method==='shift'?'← shift left · discard overflow':`AND with ${(Math.max(0,f.previous-1)).toString(2).padStart(8,'0')}`}</div>${row(f.value,'After')}<p className="tl-stage-note">Eight-bit unsigned representation · column labels are bit positions</p></div>`;
  }
  function RecursionModel({ cfg }) {
    const a=+cfg.a,b=+cfg.b,k=+cfg.power,n=+cfg.n;
    if(!Number.isInteger(a)||a<1||a>3||!Number.isInteger(b)||b<2||b>4||!Number.isFinite(k)||k<0||k>3||!Number.isInteger(n)||n<2||n>64)return html`<p className="tl-error" role="alert">Use branches 1–3, divisor 2–4, exponent 0–3, and size 2–64.</p>`;
    return html`<${RecursionView} key=${[a,b,k,n].join(':')} a=${a} b=${b} k=${k} n=${n}/>`;
  }
  function RecursionView({ a,b,k,n }) {
    const h=Math.ceil(Math.log(n)/Math.log(b)),[depth,setDepth]=useState(0),cut=Math.min(depth,3),nodes=[],edges=[];
    function tree(level,x,width,parent) {const node={level,x,y:45+level*86,size:n/Math.pow(b,level)};nodes.push(node);if(parent)edges.push({a:parent,b:node});if(level<cut)for(let c=0;c<a;c++)tree(level+1,x-width/2+width*(c+.5)/a,width/a,node);}
    tree(0,410,740,null);
    const critical=Math.log(a)/Math.log(b),equal=Math.abs(k-critical)<1e-6,solution=k<critical-1e-6?`Θ(n^${critical.toFixed(2)})`:equal?`Θ(n^${k} log n)`:`Θ(n^${k})`;
    const costs=Array.from({length:h+1},(_,d)=>Math.pow(a,d)*Math.pow(Math.max(1,n/Math.pow(b,d)),k)),max=Math.max(...costs);
    return html`<div className="tl-recursion"><div className="tl-rec-formula">T(n) = ${a}T(n/${b}) + n^${k}<span>${solution}</span></div><svg viewBox="0 0 820 345" role="img" aria-label="Recursion tree showing subproblem sizes by depth">${edges.map((e,i)=>html`<line key=${i} x1=${e.a.x} y1=${e.a.y+18} x2=${e.b.x} y2=${e.b.y-18} stroke="var(--line)" strokeWidth="2"/>`)}${nodes.map((node,i)=>html`<g key=${i}><rect x=${node.x-27} y=${node.y-18} width="54" height="36" rx="10" fill=${node.level===depth?'#7863d4':'var(--paper)'} stroke="var(--line)"/><text x=${node.x} y=${node.y+5} textAnchor="middle" fill=${node.level===depth?'white':'var(--ink)'} fontSize="13">${node.size.toFixed(1).replace('.0','')}</text></g>`)}</svg>${depth>3&&html`<p className="tl-stage-note">The branching diagram is aggregated after depth 3. The work profile includes all ${h+1} levels.</p>`}<div className="tl-levels">${costs.map((cost,d)=>html`<button key=${d} className=${depth===d?'current':''} onClick=${()=>setDepth(d)}><span>Depth ${d}</span><i style=${{width:(cost/max*62)+'%'}}></i><b>${Math.pow(a,d)} nodes · ${cost.toFixed(1)} work</b></button>`)}</div><div className="tl-current-explanation">At depth ${depth}: ${Math.pow(a,depth)} subproblems × ${Math.pow(Math.max(1,n/Math.pow(b,depth)),k).toFixed(1)} work each = ${costs[depth].toFixed(1)} level work. Leaves have constant cost. Non-integral splits are a continuous-size model.</div></div>`;
  }
  function ReductionModel() {
    const [assignment,setAssignment]=useState([true,false,true]);
    const clauses=[[1,-2,3],[-1,2,-3],[1,2,3]],vertices=clauses.flatMap((c,i)=>c.map((lit,j)=>({lit,group:i,id:i*3+j,x:170+j*235,y:75+i*135}))),truth=lit=>lit>0?assignment[lit-1]:!assignment[-lit-1];
    const picked=clauses.map((c,i)=>{const j=c.findIndex(truth);return j<0?null:i*3+j;}),satisfied=picked.every(v=>v!==null),edges=[];
    for(const u of vertices)for(const v of vertices)if(u.group<v.group&&u.lit!==-v.lit)edges.push({u,v,witness:satisfied&&picked.includes(u.id)&&picked.includes(v.id)});
    return html`<div><div className="tl-assignment">${assignment.map((v,i)=>html`<button key=${i} aria-pressed=${v} onClick=${()=>setAssignment(a=>a.map((x,j)=>i===j?!x:x))}>x${i+1} <b>${v?'true':'false'}</b></button>`)}</div><svg viewBox="0 0 820 410" role="img" aria-label="Three clause groups with compatibility edges; selected true literals highlight an assignment witness">${[0,1,2].map(i=>html`<g key=${i}><rect x="90" y=${30+i*135} width="650" height="85" rx="14" fill="var(--paper-2)"/><text x="48" y=${80+i*135} className="tl-svg-label">C${i+1}</text></g>`)}${edges.map((e,i)=>html`<line key=${i} x1=${e.u.x} y1=${e.u.y} x2=${e.v.x} y2=${e.v.y} stroke=${e.witness?'#22a06b':'var(--line)'} strokeWidth=${e.witness?4:1} opacity=${e.witness?1:.55}/>`)}${vertices.map(v=>html`<g key=${v.id}><circle cx=${v.x} cy=${v.y} r="25" fill=${picked.includes(v.id)?'#7863d4':truth(v.lit)?'#22a06b':'var(--paper)'} stroke="var(--graphite)"/><text x=${v.x} y=${v.y+5} textAnchor="middle" fill=${truth(v.lit)?'white':'var(--ink)'} fontSize="15">${v.lit<0?'¬':''}x${Math.abs(v.lit)}</text></g>`)}</svg><div className="tl-current-explanation">${satisfied?'This assignment satisfies all clauses. One selected true literal per clause gives three pairwise-compatible vertices: a clique witness.':'This assignment leaves a clause false, so it does not supply a witness. The graph has not changed, and another assignment may still supply a clique.'}</div><p className="tl-stage-note">No edges within a clause. No edge between x and ¬x. Purple = selected true literal; green edges = current witness.</p></div>`;
  }
  const OS_TOPICS = [
    {id:'cpu',group:'Execution',icon:'▤',title:'CPU scheduling',desc:'Share one processor across waiting work.',question:'Who runs next when several processes are ready?',model:'Each process has an arrival time and a CPU burst. One CPU runs one process at a time; no I/O or context-switch overhead is modeled.',watch:'The timeline shows service order. Process cards show remaining bursts and distinguish work not yet arrived, ready, and complete at each interval boundary.',defaults:{text:'0:5, 1:3, 3:2, 5:4',method:'FCFS',quantum:'2'},variants:[['FCFS','First come, first served'],['SJF','Shortest job first'],['SRTF','Shortest remaining time'],['RR','Round robin']],cost:'Turnaround = completion − arrival. Waiting = turnaround − burst. Round robin uses the chosen time quantum.'},
    {id:'pages',group:'Memory',icon:'▦',title:'Page replacement',desc:'Decide which resident page to evict.',question:'Which page should leave when every frame is occupied?',model:'A page reference hits if its page is resident. Otherwise it faults, loading into a free frame or replacing a victim.',watch:'Current reference flows into physical frames. FIFO remembers load order; LRU remembers recent use; OPT knows future references.',defaults:{text:'1, 2, 3, 1, 4, 2, 5, 1, 2',size:'3',method:'LRU'},variants:[['FIFO','First in, first out'],['LRU','Least recently used'],['OPT','Optimal · future knowledge'],['CLOCK','Clock · second chance']],cost:'OPT is a comparison baseline, not an online policy. Replacement counts exclude initial filling of free frames.'},
    {id:'rag',group:'Concurrency',icon:'⇄',title:'Deadlock',desc:'Distinguish waiting from circular waiting.',question:'When does resource waiting become impossible to resolve?',model:'Processes hold and request single-instance resources. Request arrows and assignment arrows point in opposite directions.',watch:'A cycle is sufficient for deadlock only under this single-instance assumption.',defaults:{},component:'os-rag',cost:'With multiple instances, a cycle alone does not prove deadlock.'},
    {id:'memory',group:'Memory',icon:'▥',title:'Memory placement',desc:'Fit allocations into available holes.',question:'Does enough total free memory guarantee that a request fits?',model:'Variable-size partitions split exactly. An allocation needs a contiguous hole, not just enough total free space.',watch:'Compare the chosen hole and the remainder under first fit, best fit, and worst fit.',defaults:{},component:'os-mem-fit',cost:'A simple unsorted free list takes O(h) search per request; fragmentation affects usable space.'},
    {id:'disk',group:'Storage',icon:'◎',title:'Disk scheduling',desc:'Balance head travel and service order.',question:'How does service policy change the route of a disk head?',model:'Requests are cylinder positions. Head movement is physical distance, including circular wrap travel.',watch:'The horizontal axis is cylinder position and the vertical axis is service order.',defaults:{},component:'os-disk-arm',cost:'All requests arrive at time zero. Transfer time and rotational latency are excluded.'}
  ];
  function cpuFrames(cfg) {
    const tokens=cfg.text.trim().split(/[\s,]+/).filter(Boolean);
    if(!tokens.length||tokens.length>6||tokens.some(t=>!/^\d+:\d+$/.test(t)))throw new Error('Enter 1–6 arrival:burst pairs, e.g. 0:5, 1:3.');
    const procs=tokens.map((t,i)=>{const [at,bt]=t.split(':').map(Number);return {id:'P'+(i+1),at,bt,pr:1};});
    if(procs.some(p=>p.at>30||p.bt<1||p.bt>20))throw new Error('Arrivals: 0–30, bursts: 1–20.');
    const q=+cfg.quantum;if(!Number.isInteger(q)||q<1||q>10)throw new Error('Quantum must be 1–10.');
    const res=window.STUDY_SIM.solveCpu(procs,cfg.method,q,0);
    return [{segments:[],time:0,rows:res.rows,total:res.totalTime,desc:'Processes wait until their arrival time. No service has occurred yet.'},...res.gantt.map((s,i)=>({segments:res.gantt.slice(0,i+1),time:s.e,rows:res.rows,total:res.totalTime,desc:s.id==='IDLE'?`No process is ready; the CPU is idle from ${s.s} to ${s.e}.`:`${s.id} runs from ${s.s} to ${s.e}, receiving ${s.e-s.s} time units.`,metrics:i===res.gantt.length-1?[['Average waiting',res.avgWt],['Average turnaround',res.avgTat]]:[['Time',s.e],['Service intervals',i+1]]}))];
  }
  function pageFrames(cfg) {
    const refs=numbers(cfg.text,20,0,99),count=+cfg.size;
    if(!Number.isInteger(count)||count<2||count>6)throw new Error('Use 2–6 physical frames.');
    const res=window.STUDY_SIM.solvePages(refs.join(' '),count,cfg.method);let faults=0,hits=0;
    return [{frames:Array(count).fill(null),p:null,hit:null,history:[],desc:'All frames are empty. The reference stream is processed from left to right.'},...res.steps.map((s,i)=>{if(s.hit)hits++;else faults++;return {...s,history:refs.slice(0,i+1),desc:s.hit?`Page ${s.p} is resident: hit. No page needs to be evicted.`:`Page ${s.p} is absent: fault. ${s.victim===null?'Use a free frame.':'Evict page '+s.victim+'.'} Load page ${s.p}.`,metrics:[['Hits',hits],['Faults',faults],['References processed',i+1]]};})];
  }
  function CpuDiagram({f}) {
    const colors=['#7863d4','#317c89','#e29b36','#ce5266','#3f8e61','#537ac0'];
    return html`<div className="tl-cpu"><h4>CPU timeline</h4><svg viewBox="0 0 820 130" role="img" aria-label="Gantt chart of completed CPU service intervals">${f.segments.map((s,i)=>{const x=30+s.s/f.total*750,w=(s.e-s.s)/f.total*750;return html`<g key=${i}><rect x=${x} y="32" width=${w} height="52" rx="4" fill=${s.id==='IDLE'?'var(--line)':colors[(+s.id.slice(1)-1)%colors.length]}/><text x=${x+w/2} y="63" textAnchor="middle" fill="white" fontSize="13">${s.id}</text><text x=${x} y="106" className="tl-svg-label">${s.s}</text></g>`;})}<text x=${30+f.time/f.total*750} y="106" className="tl-svg-label">${f.time}</text></svg><div className="tl-processes">${f.rows.map((p,i)=>{const served=f.segments.filter(s=>s.id===p.id).reduce((s,x)=>s+x.e-x.s,0),remaining=p.bt-served;return html`<div key=${p.id}><b style=${{color:colors[i]}}>${p.id}</b><strong>${remaining}</strong><small>remaining burst</small><span>${p.at>f.time?'not arrived':remaining===0?'complete':'ready'}</span><small>arrival ${p.at} · burst ${p.bt}</small></div>`;})}</div></div>`;
  }
  function PagesDiagram({f}) {
    return html`<div className="tl-page-model"><div className="tl-routing"><span>Requested page <b>${f.p===null?'?':f.p}</b></span><i>→</i><span className=${f.hit?'tl-hit':''}>${f.hit===null?'empty memory':f.hit?'HIT':'FAULT'}</span></div><div className="tl-physical">${f.frames.map((p,i)=>html`<div className=${f.p!==null&&p===f.p?'current':''} key=${i}><small>frame ${i+1}</small><strong>${p===null?'∅':p}</strong><span>${p===null?'free':'resident'}</span></div>`)}</div><div className="tl-frontier"><b>Processed references</b>${f.history.join(' → ')||'∅'}</div></div>`;
  }

  function Controls({ topic:t,cfg,setCfg }) {
    const input=(key,label,type='text')=>html`<label className=${type==='text'?'tl-wide':''}>${label}<input aria-label=${label} type=${type} value=${cfg[key]} onInput=${e=>setCfg(c=>({...c,[key]:e.target.value}))}/></label>`;
    return html`<div className="tl-inputs">
      ${t.variants&&html`<label>Strategy<select aria-label="Strategy" value=${cfg.method} onChange=${e=>setCfg(c=>({...c,method:e.target.value}))}>${t.variants.map(([id,label])=>html`<option value=${id} key=${id}>${label}</option>`)}</select></label>`}
      ${['sort','search','trees','hash'].includes(t.id)&&input('text',t.id==='hash'?'Keys':'Values')}
      ${t.id==='search'&&input('target','Target','number')}
      ${['paths','mst'].includes(t.id)&&input('text','Edges · vertex vertex weight')}
      ${t.id==='paths'&&input('source','Source vertex')}
      ${t.id==='huffman'&&input('text','Symbols · letter:frequency')}
      ${t.id==='hash'&&input('size','Table size','number')}
      ${t.id==='amortized'&&input('n','Number of appends','number')}
      ${t.id==='rec'&&html`${input('a','Branches a','number')}${input('b','Divisor b','number')}${input('power','Work exponent k','number')}${input('n','Initial size n','number')}`}
      ${t.id==='dp'&&(cfg.method==='lcs'?html`${input('first','First sequence')}${input('second','Second sequence')}`:html`${input('text','Items · weight:value')}${input('capacity','Capacity','number')}`)}
      ${t.id==='bits'&&input('n','Unsigned word','number')}
      ${t.id==='cpu'&&html`${input('text','Processes · arrival:burst')}${cfg.method==='RR'&&input('quantum','Time quantum','number')}`}
      ${t.id==='pages'&&html`${input('text','Page reference stream')}${input('size','Physical frames','number')}`}
    </div>`;
  }
  function Diagram({topic:t,f,cfg,onCell}) {
    if(t.id==='sort'||t.id==='search')return html`<${SequenceDiagram} f=${f} topic=${t.id}/>`;
    if(t.id==='hash')return html`<${HashDiagram} f=${f} cfg=${cfg}/>`;
    if(t.id==='amortized')return html`<${ArrayDiagram} f=${f}/>`;
    if(t.id==='trees'||t.id==='huffman')return html`<${TreeDiagram} f=${f} huffman=${t.id==='huffman'}/>`;
    if(t.id==='paths'||t.id==='mst')return html`<${GraphDiagram} f=${f} cfg=${cfg} mst=${t.id==='mst'}/>`;
    if(t.id==='dp')return html`<${DPDiagram} f=${f} onCell=${onCell}/>`;
    if(t.id==='bits')return html`<${BitDiagram} f=${f} cfg=${cfg}/>`;
    if(t.id==='cpu')return html`<${CpuDiagram} f=${f}/>`;
    if(t.id==='pages')return html`<${PagesDiagram} f=${f}/>`;
    return null;
  }
  function DiagramLegend({id}) {
    const labels={
      sort:[['#7298d0','Pending'],['#22a06b','Invariant region'],['#7863d4','Key / pivot'],['#f2a93b','Active'],['#eb8452','Greater than pivot']],
      search:[['#7298d0','Candidate'],['#7863d4','Middle'],['#22a06b','Match'],['#c4cbd5','Eliminated']],
      trees:[['#28384d','Black node'],['#ce5266','Red node'],['#efb84d','Fixup focus']],
      paths:[['#f2a93b','Current vertex / edge'],['#7863d4','Frontier'],['#22a06b','Finished / predecessor']],
      mst:[['#22a06b','Accepted'],['#f2a93b','Current candidate'],['#ce5266','Rejected cycle']],
      huffman:[['#7863d4','Symbol leaf'],['#317c89','Merged subtree']]
    }[id];
    return labels ? html`<div className="tl-legend" aria-label="Diagram color legend">${labels.map(([color,label])=>html`<span key=${label}><i style=${{background:color}}></i>${label}</span>`)}</div>` : null;
  }
  function Workspace({ topic:t }) {
    const [cfg,setCfg]=useState(()=>({...t.defaults})),[step,setStep]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[detail,setDetail]=useState(false),[zoom,setZoom]=useState(1);
    const result=useMemo(()=>{try{return {frames:t.id==='cpu'?cpuFrames(cfg):t.id==='pages'?pageFrames(cfg):build(t.id,cfg)};}catch(e){return {frames:[],error:e.message};}},[t.id,cfg]);
    const idx=Math.min(step,Math.max(0,result.frames.length-1)),f=result.frames[idx];
    useEffect(()=>{setStep(0);setPlaying(false);},[cfg]);
    useEffect(()=>{if(!playing)return;if(idx>=result.frames.length-1){setPlaying(false);return;}const timer=setTimeout(()=>setStep(s=>s+1),1100/speed);return()=>clearTimeout(timer);},[playing,idx,result.frames.length,speed]);
    const jump=n=>{setStep(Math.max(0,Math.min(result.frames.length-1,n)));setPlaying(false);};
    const onKey=e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'){e.preventDefault();jump(idx+1);}if(e.key==='ArrowLeft'){e.preventDefault();jump(idx-1);}if(e.key==='Home'){e.preventDefault();jump(0);}if(e.key==='End'){e.preventDefault();jump(result.frames.length-1);}if(e.key===' '&&f){e.preventDefault();setPlaying(p=>!p);}};
    const OSComponent=t.component&&window.FIGS[t.component];
    const cost=t.id==='sort' ? ({
      insertion:'Best Θ(n), worst Θ(n²), auxiliary space O(1). This stable variant only shifts strictly larger values.',
      merge:'Θ(n log n) time, O(n) temporary storage plus recursion. Equal values are taken from the left half first to preserve stability.',
      quick:'Deterministic first pivot: balanced Θ(n log n), worst Θ(n²). Recursion depth can be O(n); partitioning is not stable.',
      counting:'Θ(n+k) time and storage, where k is the maximum key. Nonnegative integer keys only; stable placement scans right to left.'
    }[cfg.method]) : t.cost;
    return html`<div className="tl-workspace" data-topic=${t.id}><header className="tl-topic-heading"><div><p>${t.group}</p><h2>${t.title}</h2><span>${t.question}</span></div><button className="tl-reset" onClick=${()=>{setCfg({...t.defaults});setStep(0);setPlaying(false);}}>Reset example ↺</button></header>
      ${!t.component&&t.id!=='reduction'&&html`<${Controls} topic=${t} cfg=${cfg} setCfg=${setCfg}/>`}
      <div className="tl-visual-grid"><div className="tl-main"><div className="tl-view-tools"><span>Visual model · focus diagram to step with ← / →</span><label>View<select aria-label="Diagram zoom" value=${zoom} onChange=${e=>setZoom(+e.target.value)}><option value="1">Fit</option><option value="1.5">150%</option><option value="2">200%</option></select></label></div><div className=${'tl-stage'+(zoom>1?' tl-zoomed':'')} tabIndex="0" onKeyDown=${onKey} aria-label=${t.title+' visual model'}><div className="tl-stage-body" style=${{width:(zoom*100)+'%'}}>
        ${result.error?html`<div className="tl-error" role="alert"><b>Let’s adjust the input</b><p>${result.error}</p></div>`:t.id==='rec'?html`<${RecursionModel} cfg=${cfg}/>`:t.id==='reduction'?html`<${ReductionModel}/>`:OSComponent?html`<${OSComponent}/>`:f?html`<${Diagram} topic=${t} f=${f} cfg=${cfg} onCell=${(i,j)=>{const n=result.frames.findIndex(s=>s.cell&&s.cell[0]===i&&s.cell[1]===j);if(n>=0)jump(n);}}/>`:null}
      </div></div><${DiagramLegend} id=${t.id}/>
      ${f&&html`<div className="tl-playback"><button aria-label="First step" disabled=${idx===0} onClick=${()=>jump(0)}>↤</button><button aria-label="Previous step" disabled=${idx===0} onClick=${()=>jump(idx-1)}>←</button><button className="tl-play" onClick=${()=>{if(idx===result.frames.length-1)setStep(0);setPlaying(p=>!p);}}>${playing?'Pause':idx===result.frames.length-1?'Replay':'Play'}</button><button aria-label="Next step" disabled=${idx===result.frames.length-1} onClick=${()=>jump(idx+1)}>→</button><input aria-label="Simulation step" type="range" min="0" max=${result.frames.length-1} value=${idx} onInput=${e=>jump(+e.target.value)}/><span>${idx+1} / ${result.frames.length}</span><button aria-label="Last step" disabled=${idx===result.frames.length-1} onClick=${()=>jump(result.frames.length-1)}>↦</button><label>Speed<select aria-label="Playback speed" value=${speed} onChange=${e=>setSpeed(+e.target.value)}>${[0.5,1,2,3].map(n=>html`<option key=${n} value=${n}>${n}×</option>`)}</select></label></div><div className="tl-explanation" aria-live=${playing?'off':'polite'}><small>WHAT HAPPENS · STEP ${idx+1}</small><p>${f.desc}</p></div>`}
      </div><aside className="tl-inspector"><section><h3>The mental model</h3><p>${t.model}</p></section><section><h3>What to watch</h3><p>${f&&f.inv||t.watch}</p></section>${f&&f.metrics&&html`<section className="tl-metrics"><h3>Live state</h3>${f.metrics.map(([label,value])=>html`<div key=${label}><span>${label}</span><b>${value}</b></div>`)}</section>`}<section><h3>Assumptions & cost</h3><p>${cost}</p></section></aside></div>
      ${f&&html`<button className="tl-details-toggle" aria-expanded=${detail} onClick=${()=>setDetail(d=>!d)}>${detail?'Hide':'Inspect'} the step history ${detail?'−':'+'}</button>${detail&&html`<div className="tl-history"><ol>${result.frames.slice(0,idx+1).map((s,i)=>html`<li key=${i}><button aria-current=${i===idx?'step':null} onClick=${()=>jump(i)}><span>${i+1}</span>${s.desc}</button></li>`)}</ol></div>`}`}
    </div>`;
  }
  function Studio({subject='algo'}) {
    const topics=subject==='os'?OS_TOPICS:TOPICS;
    const [selected,setSelected]=useState(topics[0].id),[query,setQuery]=useState('');
    const topic=topics.find(t=>t.id===selected)||topics[0],filtered=topics.filter(t=>(t.title+' '+t.desc+' '+t.group).toLowerCase().includes(query.toLowerCase())),groups=[...new Set(filtered.map(t=>t.group))];
    useEffect(()=>{setSelected(topics[0].id);setQuery('');},[subject]);
    return html`<div className="topic-lab"><header className="tl-hero"><div><p>THE CONCEPT LAB</p><h1>Understand it. Then watch it work.</h1><span>Choose a topic, change the input, and follow the idea—not a question sheet.</span></div><div className="tl-hero-mark" aria-hidden="true">${subject==='os'?'[ OS ]':'{ ƒ }'}</div></header><div className="tl-shell"><nav className="tl-nav" aria-label="Visualization topics"><label className="tl-search">Find a concept<input aria-label="Find a concept" type="search" placeholder="Search topics…" value=${query} onInput=${e=>setQuery(e.target.value)}/></label>${groups.map(group=>html`<section key=${group}><h2>${group}</h2>${filtered.filter(t=>t.group===group).map(t=>html`<button key=${t.id} aria-current=${topic.id===t.id?'page':null} onClick=${()=>setSelected(t.id)}><i aria-hidden="true">${t.icon}</i><span><b>${t.title}</b><small>${t.desc}</small></span></button>`)}</section>`)}${!filtered.length&&html`<p className="tl-no-results">No matching topics. Try “graph” or “memory”.</p>`}<div className="tl-nav-note">Each topic has its own visual model.<br/>Inputs are examples, not fixed answers.</div></nav><${Workspace} key=${topic.id} topic=${topic}/></div></div>`;
  }
  function Embed({id}) {
    const topic=TOPICS.concat(OS_TOPICS).find(t=>t.id===id);
    return topic ? html`<div className="topic-lab tl-embedded"><${Workspace} key=${id} topic=${topic}/></div>` : null;
  }
  window.TOPICS={Studio,Embed,TOPICS,OS_TOPICS,models:{searchFrames,hashFrames,arrayFrames,parseGraph,graphFrames,dpFrames,huffmanFrames,bitFrames,cpuFrames,pageFrames}};
})();
