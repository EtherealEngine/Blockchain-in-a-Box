const puppeteer = require('puppeteer');

const browserPromise = puppeteer.launch({
  args: [
    '--no-sandbox',
    '--no-zygote',
    // '--disable-dev-shm-usage',
  ],
  // defaultViewport: chromium.defaultViewport,
  // executablePath: await chromium.executablePath,
  headless: true,
});

module.exports = {
  async getBrowser() {
    return await browserPromise;
  },
};