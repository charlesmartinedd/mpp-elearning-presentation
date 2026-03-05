const { chromium } = require('playwright');
const path = require('path');

const DIR = __dirname;
const DL = 'C:/Users/MarieLexisDad/Downloads';

const MODULES = {
  1: `file:///${DL}/module-1-do-w-mentor-protege-program-raw/content/index.html`,
  5: `file:///${DL}/module-5-financial-management-raw/content/index.html`,
  8: `file:///${DL}/module-8-subcontracting-raw/content/index.html`,
};

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function scrollInCourse(page, y) {
  await page.evaluate((scrollY) => {
    // Rise uses a scrollable container
    const containers = [
      document.querySelector('[class*="blocks-container"]'),
      document.querySelector('[class*="course-content"]'),
      document.querySelector('.blocks'),
      document.querySelector('main'),
      document.querySelector('[role="main"]'),
      document.documentElement,
    ];
    for (const c of containers) {
      if (c && c.scrollHeight > c.clientHeight) {
        c.scrollTo({ top: scrollY, behavior: 'instant' });
        return;
      }
    }
    window.scrollTo(0, scrollY);
  }, y);
  await wait(800);
}

async function getScrollHeight(page) {
  return page.evaluate(() => {
    const containers = [
      document.querySelector('[class*="blocks-container"]'),
      document.querySelector('[class*="course-content"]'),
      document.querySelector('.blocks'),
      document.querySelector('main'),
      document.querySelector('[role="main"]'),
      document.documentElement,
    ];
    for (const c of containers) {
      if (c && c.scrollHeight > c.clientHeight) return c.scrollHeight;
    }
    return document.documentElement.scrollHeight;
  });
}

async function captureModule(browser, num, url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  console.log(`\n=== Module ${num} ===`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(2000);

  // Capture landing
  await page.screenshot({ path: path.join(DIR, `m${num}-00-landing.png`) });
  console.log(`  m${num}-00-landing.png`);

  // Click "START COURSE" button
  const startBtn = await page.$('button:has-text("START COURSE"), a:has-text("START COURSE"), [class*="start"]:has-text("START")');
  if (startBtn) {
    console.log('  Clicking START COURSE...');
    await startBtn.click();
    await wait(3000);
  } else {
    console.log('  No START button found, trying text match...');
    try {
      await page.click('text=START COURSE', { timeout: 3000 });
      await wait(3000);
    } catch {
      console.log('  Could not find start button');
    }
  }

  // After entering course, capture the full scrollable content
  const totalHeight = await getScrollHeight(page);
  console.log(`  Scroll height: ${totalHeight}px`);

  // Capture systematically every ~800px
  let shotNum = 1;
  for (let y = 0; y < totalHeight; y += 700) {
    await scrollInCourse(page, y);
    const padded = String(shotNum).padStart(2, '0');
    await page.screenshot({ path: path.join(DIR, `m${num}-${padded}-${y}.png`) });
    shotNum++;
  }
  console.log(`  Captured ${shotNum - 1} content screenshots`);

  // Also try to navigate to the sidebar lessons if available
  const sidebarToggle = await page.$('[class*="sidebar-toggle"], [aria-label*="sidebar"], [class*="menu-toggle"], button[class*="nav"]');
  if (sidebarToggle) {
    console.log('  Opening sidebar...');
    await sidebarToggle.click();
    await wait(1000);
    await page.screenshot({ path: path.join(DIR, `m${num}-sidebar.png`) });
  }

  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const [num, url] of Object.entries(MODULES)) {
    try {
      await captureModule(browser, num, url);
    } catch (err) {
      console.error(`Module ${num} error:`, err.message);
    }
  }

  await browser.close();
  console.log('\nDone!');
})();
