import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('https://ais-dev-hnqnoryanxf74hmtkjtae3-413628601952.europe-west2.run.app', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log("Dev page loaded successfully.");
  } catch (e) {
    console.error("Error loading dev page:", e);
  }

  await browser.close();
})();
