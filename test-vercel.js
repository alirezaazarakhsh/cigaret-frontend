import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));

  try {
    await page.goto('https://cigaretsevin.vercel.app/shopmanage', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Page loaded.");
    const bodyClass = await page.evaluate(() => document.body.className);
    console.log("Body className:", bodyClass);
    const styles = await page.evaluate(() => {
      const el = document.querySelector('h1, h2, form, button');
      return el ? { tag: el.tagName, className: el.className, computed: window.getComputedStyle(el).fontSize } : null;
    });
    console.log("Element style:", styles);
  } catch (e) {
    console.error("Error loading vercel page:", e);
  }

  await browser.close();
})();
