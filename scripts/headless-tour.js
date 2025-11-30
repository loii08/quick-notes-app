const puppeteer = require('puppeteer');
const portsToTry = [3003,3001,3000,3002,5173];

async function findServer() {
  for (const port of portsToTry) {
    try {
      const url = `http://localhost:${port}/`;
      const res = await fetch(url, { method: 'HEAD' });
      if (res && res.ok) return url;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

(async () => {
  // Node's fetch may not be available depending on Node version; use http
  const http = require('http');
  async function probe(port) {
    return new Promise((resolve) => {
      const req = http.request({ method: 'HEAD', host: '127.0.0.1', port, path: '/' }, res => {
        resolve(res.statusCode && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.end();
    });
  }

  let url = null;
  for (const port of portsToTry) {
    const ok = await probe(port);
    if (ok) { url = `http://localhost:${port}/`; console.log('Found server at', url); break; }
  }
  if (!url) {
    console.error('No local dev server found on common ports:', portsToTry.join(','));
    process.exit(2);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  try {
    // Desktop test
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 800 });
    console.log('Opening', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Open demo via menu button "Show Demo" (button text)
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      const demoBtn = await page.$x("//button[contains(., 'Show Demo')]");
      if (demoBtn.length) {
        await demoBtn[0].click();
        console.log('Clicked Show Demo');
      } else {
        console.log('Show Demo button not found');
      }
    } catch (e) {
      console.log('Error finding demo button', e.message);
    }

    // wait for onboarding dialog
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    console.log('Onboarding dialog shown');

    // Advance to Quick Actions step by clicking Next until tooltip title contains 'Quick Actions'
    let title = '';
    for (let i=0;i<10;i++) {
      const t = await page.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      title = t;
      console.log('Step title:', title);
      if (title === 'Quick Actions') break;
      // click Next
      const next = await page.$x("//button[normalize-space(.)='Next' or normalize-space(.)='Finish']");
      if (next.length) {
        await next[0].click();
        await page.waitForTimeout(500);
      } else break;
    }

    // Now click Back and observe current title
    const backBtn = await page.$x("//button[normalize-space(.)='Back']");
    if (backBtn.length) {
      await backBtn[0].click();
      await page.waitForTimeout(400);
      const newTitle = await page.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      console.log('After Back, title is:', newTitle);
    } else {
      console.log('Back button not found');
    }

    // Mobile test
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 390, height: 844 });
    await page2.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // open demo
    const demoBtn2 = await page2.$x("//button[contains(., 'Show Demo')]");
    if (demoBtn2.length) { await demoBtn2[0].click(); console.log('Clicked Show Demo (mobile)'); }
    await page2.waitForSelector('div[role="dialog"]', { timeout: 10000 });

    // Advance to notes-list
    for (let i=0;i<12;i++) {
      const t = await page2.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      if (t === 'Your Notes') { console.log('Reached Notes step'); break; }
      const next = await page2.$x("//button[normalize-space(.)='Next' or normalize-space(.)='Finish']");
      if (next.length) { await next[0].click(); await page2.waitForTimeout(400); } else break;
    }

    // Check if the targeted note element exists
    const exists = await page2.$('#notes-list-container .divide-y > .w-full:first-child') !== null;
    console.log('First note card found?', !!exists);

    await page.close();
    await page2.close();
  } finally {
    await browser.close();
  }

  process.exit(0);
})();
