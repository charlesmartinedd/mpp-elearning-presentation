const { chromium } = require('playwright');
const path = require('path');

const DIR = __dirname;
const DL = 'C:/Users/MarieLexisDad/Downloads';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function scrollAndCapture(page, prefix, maxScrolls = 40) {
  let shotIdx = 0;
  for (let i = 0; i < maxScrolls; i++) {
    // Use mouse wheel events to trigger Rise's lazy-loading scroll
    await page.mouse.wheel(0, 600);
    await wait(800);

    // Only capture every 2nd scroll for efficiency
    if (i % 2 === 0) {
      const name = `${prefix}-${String(shotIdx).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(DIR, name) });
      shotIdx++;
    }
  }
  console.log(`  Captured ${shotIdx} screenshots for ${prefix}`);
}

async function openModule(browser, num, url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  console.log(`\n=== Module ${num} ===`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);

  // Click START COURSE
  try { await page.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // MODULE 1 — Deep scroll through Lesson 1 (has video, objectives, accordions, Storyline)
  {
    const { ctx, page } = await openModule(browser, 1, `file:///${DL}/module-1-do-w-mentor-protege-program-raw/content/index.html`);

    // Scroll deep through Lesson 1
    await scrollAndCapture(page, 'm1-deep', 50);

    // Click CONTINUE to go to Lesson 2
    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm1-L2-deep', 50);
    } catch { console.log('  No CONTINUE for L2'); }

    // Lesson 3
    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm1-L3-deep', 40);
    } catch { console.log('  No CONTINUE for L3'); }

    // Lesson 4
    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm1-L4-deep', 40);
    } catch { console.log('  No CONTINUE for L4'); }

    await ctx.close();
  }

  // MODULE 5 — Has flashcards and scenarios
  {
    const { ctx, page } = await openModule(browser, 5, `file:///${DL}/module-5-financial-management-raw/content/index.html`);

    await scrollAndCapture(page, 'm5-deep', 50);

    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm5-L2-deep', 50);
    } catch { console.log('  No CONTINUE for M5-L2'); }

    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm5-L3-deep', 40);
    } catch { console.log('  No CONTINUE for M5-L3'); }

    await ctx.close();
  }

  // MODULE 8 — Has different content types
  {
    const { ctx, page } = await openModule(browser, 8, `file:///${DL}/module-8-subcontracting-raw/content/index.html`);

    await scrollAndCapture(page, 'm8-deep', 50);

    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm8-L2-deep', 50);
    } catch { console.log('  No CONTINUE for M8-L2'); }

    try {
      await page.click('text=CONTINUE', { timeout: 5000 });
      await wait(3000);
      await scrollAndCapture(page, 'm8-L3-deep', 40);
    } catch { console.log('  No CONTINUE for M8-L3'); }

    await ctx.close();
  }

  await browser.close();
  console.log('\nDone!');
})();
