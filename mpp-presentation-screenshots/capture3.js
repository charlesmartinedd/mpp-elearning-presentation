const { chromium } = require('playwright');
const path = require('path');

const DIR = __dirname;
const DL = 'C:/Users/MarieLexisDad/Downloads';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function riseScroll(page, y) {
  await page.evaluate((scrollY) => {
    // Rise 360 scrolls inside a specific wrapper
    const el = document.querySelector('#app')
      || document.querySelector('[id*="app"]')
      || document.querySelector('[class*="rise"]')
      || document.documentElement;
    // Try all possible scrollable ancestors
    const all = document.querySelectorAll('*');
    for (const node of all) {
      if (node.scrollHeight > node.clientHeight + 50 && node.clientHeight > 200) {
        node.scrollTop = scrollY;
        return;
      }
    }
    window.scrollTo(0, scrollY);
  }, y);
  await wait(600);
}

async function getRiseScrollHeight(page) {
  return page.evaluate(() => {
    const all = document.querySelectorAll('*');
    let maxH = 0;
    let scrollEl = null;
    for (const node of all) {
      if (node.scrollHeight > node.clientHeight + 50 && node.clientHeight > 200) {
        if (node.scrollHeight > maxH) {
          maxH = node.scrollHeight;
          scrollEl = node;
        }
      }
    }
    return maxH || document.documentElement.scrollHeight;
  });
}

async function captureScrollPositions(page, prefix, stepPx = 700) {
  const height = await getRiseScrollHeight(page);
  console.log(`  Scroll height: ${height}px`);
  let idx = 0;
  for (let y = 0; y <= height; y += stepPx) {
    await riseScroll(page, y);
    const name = `${prefix}-${String(idx).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(DIR, name) });
    idx++;
  }
  console.log(`  Captured ${idx} screenshots for ${prefix}`);
  return idx;
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ========== MODULE 1 ==========
  console.log('\n=== MODULE 1 ===');
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p1 = await ctx1.newPage();
  await p1.goto(`file:///${DL}/module-1-do-w-mentor-protege-program-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);

  // Click START
  try { await p1.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  // Capture Lesson 1 content (video intro, learning objectives, etc.)
  await captureScrollPositions(p1, 'm1-L1', 700);

  // Navigate to Lesson 2 using the Continue button at bottom or sidebar
  try {
    // Try clicking "Continue" or "Next" at the bottom
    await p1.click('text=CONTINUE', { timeout: 3000 });
    await wait(2000);
    await captureScrollPositions(p1, 'm1-L2', 700);
  } catch {
    console.log('  No CONTINUE button found for lesson 2');
  }

  // Navigate to Lesson 3
  try {
    await p1.click('text=CONTINUE', { timeout: 3000 });
    await wait(2000);
    await captureScrollPositions(p1, 'm1-L3', 700);
  } catch {
    console.log('  No CONTINUE for L3');
  }

  // Navigate to Lesson 4
  try {
    await p1.click('text=CONTINUE', { timeout: 3000 });
    await wait(2000);
    await captureScrollPositions(p1, 'm1-L4', 700);
  } catch {
    console.log('  No CONTINUE for L4');
  }

  await ctx1.close();

  // ========== MODULE 5 ==========
  console.log('\n=== MODULE 5 ===');
  const ctx5 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p5 = await ctx5.newPage();
  await p5.goto(`file:///${DL}/module-5-financial-management-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p5.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  // Capture all lessons
  await captureScrollPositions(p5, 'm5-L1', 700);
  for (let i = 2; i <= 5; i++) {
    try {
      await p5.click('text=CONTINUE', { timeout: 3000 });
      await wait(2000);
      await captureScrollPositions(p5, `m5-L${i}`, 700);
    } catch { break; }
  }
  await ctx5.close();

  // ========== MODULE 8 ==========
  console.log('\n=== MODULE 8 ===');
  const ctx8 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p8 = await ctx8.newPage();
  await p8.goto(`file:///${DL}/module-8-subcontracting-raw/content/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);
  try { await p8.click('text=START COURSE', { timeout: 5000 }); } catch {}
  await wait(3000);

  await captureScrollPositions(p8, 'm8-L1', 700);
  for (let i = 2; i <= 5; i++) {
    try {
      await p8.click('text=CONTINUE', { timeout: 3000 });
      await wait(2000);
      await captureScrollPositions(p8, `m8-L${i}`, 700);
    } catch { break; }
  }
  await ctx8.close();

  await browser.close();
  console.log('\nDone!');
})();
