const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = __dirname;
const DOWNLOADS = 'C:/Users/MarieLexisDad/Downloads';

const MODULES = {
  1: `file:///${DOWNLOADS}/module-1-do-w-mentor-protege-program-raw/content/index.html`,
  5: `file:///${DOWNLOADS}/module-5-financial-management-raw/content/index.html`,
  8: `file:///${DOWNLOADS}/module-8-subcontracting-raw/content/index.html`,
};

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrollToBottom(page) {
  // Rise courses scroll within an iframe or the main body
  await page.evaluate(async () => {
    const scrollable = document.querySelector('.blocks') || document.documentElement;
    const distance = 400;
    while (scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight) {
      scrollable.scrollBy(0, distance);
      await new Promise(r => setTimeout(r, 300));
    }
  });
}

async function captureModule(browser, moduleNum, url) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log(`Opening Module ${moduleNum}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(3000); // Let Rise initialize

  // Take a full page screenshot first
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `module-${moduleNum}-landing.png`),
    fullPage: false
  });
  console.log(`  Captured module-${moduleNum}-landing.png`);

  // Try to find and screenshot specific Rise blocks
  // Rise 360 uses data-block-type attributes and specific class patterns

  // Look for the sidebar/lesson navigation
  const sidebarExists = await page.$('.sidebar, [class*="sidebar"], [class*="navigation"]');
  if (sidebarExists) {
    console.log(`  Module ${moduleNum}: sidebar found`);
  }

  // Scroll down to capture different sections
  const blocks = await page.$$('.block, [class*="block-"], [data-block-type]');
  console.log(`  Module ${moduleNum}: Found ${blocks.length} blocks`);

  // Scroll through the page and capture at intervals
  let scrollY = 0;
  let shotIndex = 0;
  const pageHeight = await page.evaluate(() => {
    const el = document.querySelector('.blocks') || document.documentElement;
    return el.scrollHeight;
  });

  console.log(`  Module ${moduleNum}: Page height = ${pageHeight}px`);

  // Capture at key scroll positions
  const positions = [0, 800, 1600, 2400, 3200, 4000, 5000, 6000, 8000, 10000, 12000, 15000];
  for (const pos of positions) {
    if (pos > pageHeight) break;
    await page.evaluate((y) => {
      const el = document.querySelector('.blocks') || window;
      if (el.scrollTo) el.scrollTo(0, y);
      else window.scrollTo(0, y);
    }, pos);
    await wait(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `module-${moduleNum}-scroll-${pos}.png`),
      fullPage: false
    });
    shotIndex++;
  }
  console.log(`  Captured ${shotIndex} scroll positions for Module ${moduleNum}`);

  await page.close();
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chromium'
  });

  for (const [num, url] of Object.entries(MODULES)) {
    try {
      await captureModule(browser, num, url);
    } catch (err) {
      console.error(`Error capturing Module ${num}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done capturing screenshots.');
})();
