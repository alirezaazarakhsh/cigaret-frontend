import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.status() === 404) {
      console.log('404 URL:', response.url());
    }
  });

  try {
    await page.goto('https://ais-pre-hnqnoryanxf74hmtkjtae3-413628601952.europe-west2.run.app', { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (e) {
  }

  await browser.close();
})();
