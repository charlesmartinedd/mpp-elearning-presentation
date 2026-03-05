const { chromium } = require('playwright');
const path = require('path');

const DIR = __dirname;
const DL = 'C:/Users/MarieLexisDad/Downloads';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function incrementalScrollCapture(page, prefix, maxIterations = 80) {
  const container = '#page-wrap';
  let idx = 0;
  let prevScrollTop = -1;
  let stuckCount = 0;

  for (let i = 0; i < maxIterations; i++) {
    // Get current state
    const state = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
      return {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    }, container);

    // Capture every 3rd iteration (approx every 900px)
    if (i % 3 === 0) {
      const name = `${prefix}-${String(idx).padStart(2, '0')}.png`;
      await page.screenshot({ path: path.join(DIR, name) });
      idx++;
    }

    // Check if we've stopped scrolling
    if (Math.abs(state.scrollTop - prevScrollTop) < 5) {
      stuckCount++;
      if (stuckCount > 5) {
        console.log(`  Reached bottom at scrollTop=${state.scrollTop}, scrollHeight=${state.scrollHeight}`);
        break;
      }
    } else {
      stuckCount = 0;
    }
    prevScrollTop = state.scrollTop;

    // Scroll down by small increments to trigger lazy loading
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollTop += 300;
    }, container);
    await wait(500);
  }

  // One final capture at the bottom
  const name = `${prefix}-${String(idx).padStart(2, '0')}.png`;
  await page.screenshot({ path: path.join(DIR, name) });
  idx++;

  console.log(`  Captured ${idx} screenshots for ${prefix}`);
  return idx;
}

async function navigateToLesson(page, lessonText) {
  // Click the sidebar toggle/hamburger first if sidebar is hidden
  try {
    const sidebar = await page.$('.sidebar-content, [class*="sidebar"]');
    if (!sidebar) {
      // Try clicking hamburger
      await page.click('.hamburger, [class*="hamburger"], button[class*="menu"]', { timeout: 2000 });
      await wait(500);
    }
  } catch {}

  // Try clicking the lesson link in sidebar
  try {
    await page.click(`text=${lessonText}`, { timeout: 3000 });
    await wait(3000);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // MODULE 1
  console.log('\n=== MODULE 1 ===');
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p1 = await ctx1.newPage();
  await p1.goto(`file:///${DL}/module-1-do-w-mentor-protege-program-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p1.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  // Lesson 1
  await incrementalScrollCapture(p1, 'm1-L1-v2');

  // Click CONTINUE for Lesson 2
  try {
    await p1.click('text=CONTINUE', { timeout: 5000 });
    await wait(3000);
    // Scroll back to top
    await p1.evaluate(() => {
      const el = document.querySelector('#page-wrap');
      if (el) el.scrollTop = 0;
    });
    await wait(500);
    await incrementalScrollCapture(p1, 'm1-L2-v2');
  } catch { console.log('  No CONTINUE for L2'); }

  // Try Lesson 3 via sidebar click
  if (await navigateToLesson(p1, 'Lesson 3')) {
    await p1.evaluate(() => {
      const el = document.querySelector('#page-wrap');
      if (el) el.scrollTop = 0;
    });
    await wait(500);
    await incrementalScrollCapture(p1, 'm1-L3-v2');
  }

  // Try Lesson 4 via sidebar click
  if (await navigateToLesson(p1, 'Lesson 4')) {
    await p1.evaluate(() => {
      const el = document.querySelector('#page-wrap');
      if (el) el.scrollTop = 0;
    });
    await wait(500);
    await incrementalScrollCapture(p1, 'm1-L4-v2');
  }

  await ctx1.close();

  // MODULE 5
  console.log('\n=== MODULE 5 ===');
  const ctx5 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p5 = await ctx5.newPage();
  await p5.goto(`file:///${DL}/module-5-financial-management-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p5.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  await incrementalScrollCapture(p5, 'm5-L1-v2');

  try {
    await p5.click('text=CONTINUE', { timeout: 5000 });
    await wait(3000);
    await p5.evaluate(() => { document.querySelector('#page-wrap')?.scrollTo(0, 0); });
    await wait(500);
    await incrementalScrollCapture(p5, 'm5-L2-v2');
  } catch {}

  if (await navigateToLesson(p5, 'Lesson 3')) {
    await p5.evaluate(() => { document.querySelector('#page-wrap')?.scrollTo(0, 0); });
    await wait(500);
    await incrementalScrollCapture(p5, 'm5-L3-v2');
  }

  await ctx5.close();

  // MODULE 8
  console.log('\n=== MODULE 8 ===');
  const ctx8 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p8 = await ctx8.newPage();
  await p8.goto(`file:///${DL}/module-8-subcontracting-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p8.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  await incrementalScrollCapture(p8, 'm8-L1-v2');

  try {
    await p8.click('text=CONTINUE', { timeout: 5000 });
    await wait(3000);
    await p8.evaluate(() => { document.querySelector('#page-wrap')?.scrollTo(0, 0); });
    await wait(500);
    await incrementalScrollCapture(p8, 'm8-L2-v2');
  } catch {}

  if (await navigateToLesson(p8, 'Lesson 3')) {
    await p8.evaluate(() => { document.querySelector('#page-wrap')?.scrollTo(0, 0); });
    await wait(500);
    await incrementalScrollCapture(p8, 'm8-L3-v2');
  }

  await ctx8.close();
  await browser.close();
  console.log('\nDone!');
})();
