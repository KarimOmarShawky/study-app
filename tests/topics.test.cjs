// No browser or packages required: node --test tests/*.test.cjs
const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={console,React:{},htm:{bind:()=>()=>null},document:{getElementById:()=>true}};ctx.window=ctx;vm.createContext(ctx);
for(const file of ['figs.js','topics.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const {models:M,TOPICS,OS_TOPICS}=ctx.TOPICS;
const clean=x=>JSON.parse(JSON.stringify(x));

test('topic catalog is independent of course and assessment data',()=>{
  assert.equal(TOPICS.length,12);assert.equal(OS_TOPICS.length,5);
  assert.equal(new Set(TOPICS.concat(OS_TOPICS).map(t=>t.id)).size,17);
  assert.equal(ctx.COURSES,undefined);
  assert.doesNotMatch(JSON.stringify(TOPICS.concat(OS_TOPICS)),/\b(exam|midterm|lecture|Basheer|slides?)\b/i);
  assert.equal(typeof ctx.TOPICS.Embed,'function');
});
test('binary search handles matches, misses, and empty candidate intervals',()=>{
  const hit=M.searchFrames({text:'8,2,4,4,0',target:'0'});
  assert.equal(hit.at(-1).found,true);assert.equal(hit.at(-1).mid,0);
  assert.deepEqual(clean(hit[0].arr),[0,2,4,4,8]);
  const miss=M.searchFrames({text:'2,4,6',target:'9'}).at(-1);assert.ok(miss.lo>miss.hi);
  assert.throws(()=>M.searchFrames({text:'2,4',target:'1.5'}));
});
test('hash models preserve probe order, chains, cycle failures and old snapshots',()=>{
  for(const method of ['linear','double','chain']){
    const frames=M.hashFrames({text:'10,17,24',size:'7',method});
    assert.equal(frames[0].buckets.flat().length,0);
    assert.equal(frames.at(-1).buckets.flat().length,3);
    if(method==='linear')assert.deepEqual(clean(frames.at(-1).probe),[3,4,5]);
    if(method==='chain')assert.deepEqual(clean(frames.at(-1).buckets[3]),[10,17,24]);
  }
  const cycle=M.hashFrames({text:'1,31,61,91',size:'6',method:'double'}).at(-1);
  assert.equal(cycle.buckets.flat().length,3);assert.match(cycle.desc,/cycle/);
  assert.throws(()=>M.hashFrames({text:'1,2',size:'0',method:'linear'}));
});
test('dynamic array capacity and aggregate cost are computed, not fixed tables',()=>{
  const frames=M.arrayFrames({n:'10'});assert.equal(frames.at(-1).len,10);assert.equal(frames.at(-1).cap,16);
  assert.equal(frames.at(-1).total,25);assert.equal(frames[2].cap,2);assert.equal(frames[3].actual,3);
  assert.deepEqual(clean(frames[1].costs),[1]);assert.throws(()=>M.arrayFrames({n:'100'}));
});
test('weighted paths differ from hop paths and preserve earlier distance states',()=>{
  const cfg={text:'A B 2, B C 3, A C 9, D E 1',source:'A',method:'dijkstra'};
  const weighted=M.graphFrames(cfg);assert.equal(weighted.at(-1).dist.C,5);assert.equal(weighted.at(-1).parent.C,'B');
  assert.equal(weighted.at(-1).dist.D,Infinity);assert.equal(weighted[0].dist.C,Infinity);
  assert.deepEqual(clean(M.graphFrames({...cfg,method:'bfs'}).at(-1).dist),{A:0,B:1,C:1,D:null,E:null});
  assert.throws(()=>M.graphFrames({...cfg,text:'A B -1'}));
  assert.throws(()=>M.graphFrames({...cfg,text:'A B 1, B A 3'}));
  assert.throws(()=>M.graphFrames({...cfg,source:'Z'}));
});
test('Kruskal creates an MST or a forest and rejects cycles',()=>{
  const frames=M.graphFrames({text:'A B 4, A C 2, B C 1, B D 5, C D 3'},true);
  const last=frames.at(-1);assert.equal(last.chosen.length,3);
  assert.equal(last.edges.filter(e=>last.chosen.includes(e.id)).reduce((s,e)=>s+e.w,0),6);
  assert.ok(frames.some(f=>f.edge&&f.edge.rejected));
  assert.match(M.graphFrames({text:'A B 1, C D 2'},true).at(-1).desc,/forest/);
});
test('LCS and 0/1 knapsack fill only from solved dependencies and reconstruct answers',()=>{
  const lcs=M.dpFrames({method:'lcs',first:'BANANA',second:'ATANA'});
  assert.equal(lcs.at(-1).table.at(-1).at(-1),4);assert.match(lcs.at(-1).desc,/AANA/);
  assert.equal(lcs[0].table[1][1],null);
  for(const f of lcs)for(const [i,j]of f.deps)assert.notEqual(f.table[i][j],null);
  const knap=M.dpFrames({method:'knapsack',text:'2:6,3:10,4:12',capacity:'6'});
  assert.equal(knap.at(-1).table.at(-1).at(-1),18);assert.match(knap.at(-1).desc,/items 1, 3/);
  for(const f of knap)for(const [i]of f.deps)assert.equal(i,f.cell[0]-1);
  assert.throws(()=>M.dpFrames({method:'lcs',first:'',second:'A'}));
  assert.throws(()=>M.dpFrames({method:'knapsack',text:'0:3',capacity:'5'}));
});
test('Huffman trees conserve weight, produce prefix-free words and match merge cost',()=>{
  const frames=M.huffmanFrames({text:'A:5,B:9,C:12,D:13,E:16,F:20'}),last=frames.at(-1);
  assert.equal(frames[0].forest.length,6);assert.equal(last.forest[0].w,75);
  const codes=last.codes;for(const a of codes)for(const b of codes)if(a!==b)assert.ok(!b.code.startsWith(a.code));
  const internalCost=n=>n.l?n.w+internalCost(n.l)+internalCost(n.r):0;
  assert.equal(codes.reduce((s,c)=>s+c.frequency*c.code.length,0),internalCost(last.forest[0]));
  assert.throws(()=>M.huffmanFrames({text:'A:5,A:2'}));
});
test('eight-bit shifts, rotates and clear-lowest-bit traces stay in bounds',()=>{
  assert.equal(M.bitFrames({n:'137',method:'rotate'}).at(-1).value,19);
  assert.equal(M.bitFrames({n:'137',method:'shift'}).at(-1).value,18);
  const count=M.bitFrames({n:'137',method:'count'});assert.equal(count.length,4);assert.equal(count.at(-1).value,0);
  assert.equal(M.bitFrames({n:'0',method:'count'}).length,1);
  assert.throws(()=>M.bitFrames({n:'256',method:'rotate'}));
});
test('CPU and page models expose actual incremental state for editable workloads',()=>{
  const cpu=M.cpuFrames({text:'0:5,1:3,3:2',method:'RR',quantum:'2'});
  assert.equal(cpu[0].segments.length,0);assert.equal(cpu.at(-1).time,10);
  assert.equal(cpu.at(-1).rows.reduce((s,p)=>s+p.bt,0),10);
  const pages=M.pageFrames({text:'1,2,1,3,2',method:'LRU',size:'2'});
  assert.equal(pages[0].frames.filter(p=>p!==null).length,0);
  assert.deepEqual(clean(pages.at(-1).metrics),[['Hits',1],['Faults',4],['References processed',5]]);
});
test('sorting snapshots expose the held key, hole and merge buffer cursors',()=>{
  const insertion=ctx.STUDY_SIM.buildSortTrace('insertion','4,2,1',1);
  assert.ok(insertion.some(f=>f.extra&&f.extra.heldKey===2&&f.extra.hole===0));
  const merge=ctx.STUDY_SIM.buildSortTrace('merge','4,1,3,2',1);
  assert.ok(merge.some(f=>f.extra&&f.extra.li!==undefined&&f.extra.ri!==undefined));
  assert.deepEqual(clean(merge.at(-1).arr),[1,2,3,4]);
});
