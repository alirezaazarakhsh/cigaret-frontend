import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => console.log('RESPONSE:', response.status(), response.url()));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.failure().errorText, request.url()));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Page loaded successfully.");
  } catch (e) {
    console.error("Error loading page:", e);
  }

  await browser.close();
})();
