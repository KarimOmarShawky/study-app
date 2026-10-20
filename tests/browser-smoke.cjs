// Optional: npm install --no-save --package-lock=false @playwright/test
// Build and serve dist on port 3000, then run node tests/browser-smoke.cjs.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage'], headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:3000');
  const open = async subject => {
    await page.evaluate(subject => localStorage.setItem('sd:nav2', JSON.stringify({ view: 'course', course: subject, mode: 'studio', lec: 1 })), subject);
    await page.reload(); await page.locator('.topic-lab').waitFor();
  };
  const choose = async title => {
    await page.getByRole('navigation', { name: 'Visualization topics' }).getByRole('button', { name: new RegExp('^' + title) }).click();
    assert.equal(await page.locator('.tl-error').count(), 0);
    assert.doesNotMatch(await page.locator('.topic-lab').innerText(), /lecture|\bLEC\b|\bexams?\b|midterm|Basheer|slides?/i);
  };
  await open('algo');
  const topics=['Sorting','Binary search','Recursion trees','Hashing','Dynamic arrays','Balanced trees','Dynamic programming','Graph exploration','Spanning trees','Prefix coding','Problem reductions','Bit operations'];
  assert.equal(await page.locator('.tl-nav button').count(), 12);
  for (const title of topics) {
    await choose(title);
    const next=page.getByRole('button', { name: 'Last step', exact: true });
    if (await next.count()) await next.click();
    assert.equal(await page.locator('.tl-error').count(), 0);
  }
  await choose('Sorting');
  await page.getByLabel('Values', {exact:true}).fill('5, 0, -1, 2');
  await page.getByRole('button', {name:'Last step',exact:true}).click();
  assert.match(await page.locator('.tl-explanation').innerText(), /-1, 0, 2, 5/);
  await page.getByLabel('Values', {exact:true}).fill('1, bad, 3');
  assert.equal(await page.locator('.tl-error').count(), 1);
  await page.getByRole('button', {name:'Reset example'}).click();
  assert.equal(await page.locator('.tl-error').count(), 0);
  for (const strategy of ['merge','quick','counting','insertion']) {
    await page.getByLabel('Strategy', {exact:true}).selectOption(strategy);
    await page.getByRole('button', {name:'Last step',exact:true}).click();
  }
  await page.getByRole('button',{name:'First step',exact:true}).click();
  await page.getByLabel('Playback speed').selectOption('3');
  await page.getByRole('button',{name:'Play',exact:true}).click();
  await page.waitForFunction(()=>+document.querySelector('[aria-label="Simulation step"]').value>0);
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.locator('.tl-stage').focus(); await page.keyboard.press('End');
  const slider=page.getByLabel('Simulation step');assert.equal(await slider.inputValue(),await slider.getAttribute('max'));
  await choose('Hashing');
  for (const strategy of ['linear','double','chain']) {
    await page.getByLabel('Strategy',{exact:true}).selectOption(strategy);
    await page.getByRole('button',{name:'Last step',exact:true}).click();
    assert.ok(await page.locator('.tl-buckets strong').count());
  }
  await choose('Graph exploration');
  await page.getByLabel('Edges · vertex vertex weight').fill('A B 2, B C 3, A C 9');
  await page.getByRole('button',{name:'Last step',exact:true}).click();
  assert.match(await page.locator('.tl-distances').innerText(), /C\s+5\s+via B/);
  await page.getByLabel('Strategy',{exact:true}).selectOption('bfs');
  await page.getByRole('button',{name:'Last step',exact:true}).click();
  assert.match(await page.locator('.tl-distances').innerText(), /C\s+1\s+via A/);
  await choose('Dynamic programming');
  await page.getByLabel('Strategy',{exact:true}).selectOption('knapsack');
  await page.getByRole('button',{name:'Last step',exact:true}).click();
  assert.match(await page.locator('.tl-explanation').innerText(), /Optimal value = 18/);
  await page.getByRole('button',{name:/Inspect the step history/}).click();
  assert.ok(await page.locator('.tl-history li').count()>10);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for(const title of topics){await choose(title);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'overflow: '+title);}
  await page.getByLabel('Find a concept').fill('prefix');
  assert.equal(await page.locator('.tl-nav button').count(),1);
  await page.getByLabel('Find a concept').fill('');
  // Notes use the same neutral topic workspace, not a second exam-centric implementation.
  await page.evaluate(()=>localStorage.setItem('sd:nav2',JSON.stringify({view:'course',course:'algo',mode:'read',lec:1})));
  await page.reload(); await page.locator('.tl-embedded').first().waitFor();
  assert.doesNotMatch(await page.locator('.tl-embedded').first().innerText(), /\b(exam|midterm|lecture|Basheer|slide)\b/i);
  await open('os');
  for(const title of ['CPU scheduling','Page replacement','Deadlock','Memory placement','Disk scheduling']) {
    await choose(title); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'overflow: '+title);
  }
  await choose('CPU scheduling');
  for(const method of ['FCFS','SJF','SRTF','RR']) {
    await page.getByLabel('Strategy',{exact:true}).selectOption(method);
    await page.getByRole('button',{name:'Last step',exact:true}).click();
    assert.equal(await page.locator('.tl-error').count(),0);
  }
  await choose('Page replacement');
  for(const method of ['FIFO','LRU','OPT','CLOCK']) {
    await page.getByLabel('Strategy',{exact:true}).selectOption(method);
    await page.getByRole('button',{name:'Last step',exact:true}).click();
    assert.equal(await page.locator('.tl-error').count(),0);
  }
  assert.deepEqual(errors,[]);
  console.log('Browser smoke passed: 12 independent concepts, 5 OS topics, algorithm variants, custom inputs, playback, search, mobile, and no assessment references.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
