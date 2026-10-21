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
  const choose = async (title, neutral = false) => {
    await page.getByRole('navigation', { name: 'Visualization topics' }).getByRole('button', { name: new RegExp('^' + title) }).click();
    assert.equal(await page.locator('.tl-error').count(), 0);
    if (neutral) assert.doesNotMatch(await page.locator('.topic-lab').innerText(), /lecture|\bLEC\b|\bexams?\b|midterm|Basheer|slides?/i);
  };
  const last = async () => { const b = page.getByRole('button', { name: 'Last step', exact: true }); if (await b.count() && await b.isEnabled()) await b.click(); };
  await open('algo');
  // the Algorithms lab follows the course: every topic loads each worked example from the slides and plays it to the end
  const topics=['Sorting','Searching','Selection','Recurrences','Hashing','Amortized analysis','Skip lists','Red-black trees','Dynamic programming','Shortest paths','Spanning trees','Huffman codes','P, NP and reductions'];
  assert.equal(await page.locator('.tl-nav button').count(), 13);
  for (const title of topics) {
    await choose(title);
    const presets = page.locator('.tl-presets button');
    assert.ok(await presets.count() > 0, 'course examples: ' + title);
    for (let i = 0; i < await presets.count(); i++) {
      await presets.nth(i).click(); await last();
      assert.equal(await page.locator('.tl-error').count(), 0, title + ' example ' + i);
    }
  }
  await choose('Sorting');
  { const first = page.getByRole('button',{name:'First step',exact:true}); if (await first.isEnabled()) await first.click(); }
  await page.getByLabel('Playback speed').selectOption('3');
  await page.getByRole('button',{name:'Play',exact:true}).click();
  // polled from the test side: the page's Content-Security-Policy blocks waitForFunction's string evaluation
  for (let t = 0; t < 40 && +(await page.getByLabel('Simulation step').inputValue()) === 0; t++) await page.waitForTimeout(100);
  assert.ok(+(await page.getByLabel('Simulation step').inputValue()) > 0);
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.locator('.tl-stage').focus(); await page.keyboard.press('End');
  const slider=page.getByLabel('Simulation step');assert.equal(await slider.inputValue(),await slider.getAttribute('max'));
  await page.getByRole('button',{name:/Inspect the step history/}).click();
  assert.ok(await page.locator('.tl-history li').count()>5);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for(const title of topics){await choose(title);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'overflow: '+title);}
  // on phones a long list of examples is a dropdown
  await choose('Hashing'); assert.ok(await page.getByLabel('Load a worked example').isVisible());
  await page.getByLabel('Find a concept').fill('huffman');
  assert.equal(await page.locator('.tl-nav button').count(),1);
  await page.getByLabel('Find a concept').fill('');
  // notes embed the same topic workspaces
  await page.evaluate(()=>localStorage.setItem('sd:nav2',JSON.stringify({view:'course',course:'algo',mode:'read',lec:1})));
  await page.reload(); await page.locator('.tl-embedded').first().waitFor();
  await open('os');
  for(const title of ['CPU scheduling','Page replacement','Deadlock','Memory placement','Disk scheduling']) {
    await choose(title, true); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'overflow: '+title);
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
  console.log('Browser smoke passed: 13 course-matched Algorithms topics with every worked example, 5 neutral OS topics, playback, search and mobile layout.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
