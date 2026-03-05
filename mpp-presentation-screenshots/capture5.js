const { chromium } = require('playwright');
const path = require('path');

const DIR = __dirname;
const DL = 'C:/Users/MarieLexisDad/Downloads';
const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function diagnoseScroll(page) {
  // Find the actual scrollable container in Rise
  const info = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 100) {
        results.push({
          tag: el.tagName,
          id: el.id,
          className: el.className.toString().substring(0, 100),
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
          overflow: getComputedStyle(el).overflow,
          overflowY: getComputedStyle(el).overflowY,
        });
      }
    }
    return results;
  });
  console.log('Scrollable elements:', JSON.stringify(info, null, 2));
  return info;
}

async function scrollContainer(page, selector, y) {
  await page.evaluate(({ sel, scrollY }) => {
    const el = document.querySelector(sel);
    if (el) el.scrollTop = scrollY;
  }, { sel: selector, scrollY: y });
  await wait(600);
}

async function captureViaContainer(page, prefix, containerSelector, maxY = 20000, step = 700) {
  let idx = 0;
  for (let y = 0; y <= maxY; y += step) {
    await scrollContainer(page, containerSelector, y);
    const currentScroll = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.scrollTop : -1;
    }, containerSelector);

    // If scroll didn't move, we hit the bottom
    if (y > 0 && currentScroll < y - step) break;

    const name = `${prefix}-${String(idx).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(DIR, name) });
    idx++;
  }
  console.log(`  Captured ${idx} screenshots for ${prefix}`);
  return idx;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Start with Module 1 to diagnose
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log('=== MODULE 1 - Diagnosing ===');
  await page.goto(`file:///${DL}/module-1-do-w-mentor-protege-program-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);

  // Click START
  try { await page.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  // Diagnose scrollable containers
  const scrollables = await diagnoseScroll(page);

  // Find the best scrollable container
  let bestSelector = null;
  for (const s of scrollables) {
    if (s.overflowY === 'auto' || s.overflowY === 'scroll' || s.overflow === 'auto' || s.overflow === 'scroll') {
      if (s.id) {
        bestSelector = `#${s.id}`;
      } else if (s.className) {
        const firstClass = s.className.split(' ')[0];
        if (firstClass) bestSelector = `.${firstClass}`;
      }
      console.log(`Best scrollable: ${bestSelector} (${s.scrollH}px height)`);
      break;
    }
  }

  // If no scrollable found, try body scroll
  if (!bestSelector) {
    console.log('No scrollable container found, using body');
    bestSelector = 'html';
  }

  // Now capture with the correct container
  await captureViaContainer(page, 'm1-fix', bestSelector, 25000, 700);

  // Try clicking through sidebar lessons
  console.log('\n  Trying sidebar navigation...');

  // Click Lesson 2
  try {
    await page.click('text=Lesson 2', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(page, 'm1-L2-fix', bestSelector, 25000, 700);
  } catch { console.log('  Could not click Lesson 2'); }

  // Click Lesson 3
  try {
    await page.click('text=Lesson 3', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(page, 'm1-L3-fix', bestSelector, 25000, 700);
  } catch { console.log('  Could not click Lesson 3'); }

  // Click Lesson 4
  try {
    await page.click('text=Lesson 4', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(page, 'm1-L4-fix', bestSelector, 25000, 700);
  } catch { console.log('  Could not click Lesson 4'); }

  await ctx.close();

  // MODULE 5
  console.log('\n=== MODULE 5 ===');
  const ctx5 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p5 = await ctx5.newPage();
  await p5.goto(`file:///${DL}/module-5-financial-management-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p5.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  // Re-diagnose for module 5
  const scrollables5 = await diagnoseScroll(p5);
  let sel5 = bestSelector; // reuse if same structure

  await captureViaContainer(p5, 'm5-fix', sel5, 25000, 700);

  // Navigate lessons
  try {
    await p5.click('text=Lesson 2', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(p5, 'm5-L2-fix', sel5, 25000, 700);
  } catch {}

  try {
    await p5.click('text=Lesson 3', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(p5, 'm5-L3-fix', sel5, 25000, 700);
  } catch {}

  await ctx5.close();

  // MODULE 8
  console.log('\n=== MODULE 8 ===');
  const ctx8 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p8 = await ctx8.newPage();
  await p8.goto(`file:///${DL}/module-8-subcontracting-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p8.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  await captureViaContainer(p8, 'm8-fix', bestSelector, 25000, 700);

  try {
    await p8.click('text=Lesson 2', { timeout: 3000 });
    await wait(3000);
    await captureViaContainer(p8, 'm8-L2-fix', bestSelector, 25000, 700);
  } catch {}

  await ctx8.close();
  await browser.close();
  console.log('\nDone!');
})();
