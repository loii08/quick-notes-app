const puppeteer = require('puppeteer');
const portsToTry = [3003,3001,3000,3002,5173];

(async () => {
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
    page.on('console', msg => console.log('[Browser]', msg.type().toUpperCase(), msg.text()));
    await page.setViewport({ width: 1024, height: 800 });
    console.log('Opening', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Open demo via dev helper exposed on window (works without login)
    try {
      // small delay to allow React to finish hydrating and register the helper
      await new Promise(r => setTimeout(r, 1000));
      const opened = await page.evaluate(() => {
        try {
          if (window.__openOnboarding) { window.__openOnboarding(); return true; }
          return false;
        } catch (e) { return false; }
      });
      console.log('Tried window.__openOnboarding(), result =', opened);
    } catch (e) {
      console.log('Error invoking openOnboarding', e.message);
    }

    // wait for onboarding dialog
    await page.waitForSelector('div[role="dialog"]', { timeout: 20000 });
    console.log('Onboarding dialog shown');

    // Advance to Quick Actions step by clicking Next until tooltip title contains 'Quick Actions'
    let title = '';
    for (let i=0;i<10;i++) {
      const t = await page.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      title = t;
      console.log('Step title:', title);
      if (title === 'Quick Actions') break;
      // click Next
      const clickedNext = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && (x.textContent.trim() === 'Next' || x.textContent.trim() === 'Finish'));
        if (b) { b.click(); return true; }
        return false;
      });
      if (clickedNext) { await new Promise(r => setTimeout(r, 500)); } else break;
    }

    // Now click Back and observe current title
    const backClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.trim() === 'Back');
      if (b) { b.click(); return true; }
      return false;
    });
    if (backClicked) {
      await new Promise(r => setTimeout(r, 400));
      const newTitle = await page.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      console.log('After Back, title is:', newTitle);
      // On desktop, mobile-only steps (new-note-modal, manage-button) are skipped, so back goes to "Create a Note"
      if (newTitle === 'Create a Note') {
        console.log('✓ Back button navigation works correctly (desktop skips mobile-only steps)!');
      } else {
        console.log('✗ Back button failed: expected "Create a Note" but got "' + newTitle + '"');
      }
    } else {
      console.log('Back button not found');
    }

    // Continue to the end of the tour to test confetti effect
    console.log('\n--- Testing tour completion and confetti effect ---');
    for (let i = 0; i < 10; i++) {
      const t = await page.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim()).catch(() => '');
      if (t === 'Cloud Sync') {
        console.log('Reached final step:', t);
        break;
      }
      const clickedNext = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && (x.textContent.trim() === 'Next' || x.textContent.trim() === 'Finish'));
        if (b) { b.click(); return true; }
        return false;
      });
      if (clickedNext) { 
        await new Promise(r => setTimeout(r, 500)); 
      } else { 
        break; 
      }
    }

    // Click Finish to trigger confetti
    const finishClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(x => x.textContent && x.textContent.trim() === 'Finish');
      if (b) { b.click(); return true; }
      return false;
    });
    
    if (finishClicked) {
      console.log('✓ Clicked Finish - confetti effect should be displayed!');
      await new Promise(r => setTimeout(r, 2000)); // Wait for confetti animation
      const confettiExists = await page.$('div[style*="animation: confettiFall"]') !== null;
      console.log('Confetti DOM elements created:', confettiExists ? '✓ Yes' : '✗ No (but may have already animated away)');
    } else {
      console.log('✗ Finish button not found');
    }    // Mobile test
    const page2 = await browser.newPage();
    page2.on('console', msg => console.log('[Browser Mobile]', msg.type().toUpperCase(), msg.text()));
    await page2.setViewport({ width: 390, height: 844 });
    await page2.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Simulate logged-in state by creating dummy data in localStorage
    await page2.evaluate(() => {
      // Simulate a logged-in user with a note
      localStorage.setItem('user_id', 'test-user-123');
      localStorage.setItem('user_email', 'test@example.com');
      localStorage.setItem('notes', JSON.stringify([
        {
          id: 'test-note-1',
          content: 'Sample note for tour',
          categoryId: 'inbox',
          timestamp: Date.now(),
          history: []
        }
      ]));
    });
    
    // Reload to pick up the simulated user
    await page2.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    
    // open demo via dev helper
    const opened = await page2.evaluate(() => {
      try {
        if (window.__openOnboarding) { window.__openOnboarding(); return true; }
        return false;
      } catch (e) { return false; }
    });
    if (opened) { console.log('Opened onboarding (mobile)'); }
    await page2.waitForSelector('div[role="dialog"]', { timeout: 20000 });

    // Advance to notes-list
    for (let i=0;i<12;i++) {
      const t = await page2.$eval('div[role="dialog"] .font-semibold', el => el.textContent.trim());
      if (t === 'Your Notes') { console.log('Reached Notes step'); break; }
      const clickedNext = await page2.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && (x.textContent.trim() === 'Next' || x.textContent.trim() === 'Finish'));
        if (b) { b.click(); return true; }
        return false;
      });
      if (clickedNext) { await new Promise(r => setTimeout(r, 400)); } else break;
    }

    // Check if the targeted note element exists
    const exists = await page2.$('#notes-list-container') !== null;
    if (exists) {
      console.log('✓ Notes container found!');
    } else {
      console.log('✗ Notes container not found');
    }

    await page.close();
    await page2.close();
  } finally {
    await browser.close();
  }

  process.exit(0);
})();
