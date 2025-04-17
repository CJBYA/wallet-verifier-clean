const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

exports.handler = async (event, context) => {
  console.log("🔥 Wallet check function triggered at:", new Date().toISOString());

  let email, password;
  try {
    const data = JSON.parse(event.body || '{}');
    email = data.email;
    password = data.password;
    console.log("📩 Email received:", email);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing email or password' }),
    };
  }

  let browser;
  try {
    console.log("🧪 Launching Chromium...");
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto('https://www.luckyblock.top/en/login', { waitUntil: 'networkidle2' });
    await page.type('input[type=email]', email);
    await page.type('input[type=password]', password);
    await page.click('button[type=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto('https://www.luckyblock.top/en/profile?overlay=wallet&tab=0', { waitUntil: 'networkidle2' });

    const wallet = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      for (let el of elements) {
        const text = (el.innerText || el.value || '').trim();
        if (text.startsWith('0x') && text.length >= 30 && text.length <= 100) {
          return text;
        }
      }
      return null;
    });

    await browser.close();

    if (wallet) {
      return {
        statusCode: 200,
        body: JSON.stringify({ wallet, email }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Wallet not found' }),
      };
    }
  } catch (err) {
    if (browser) await browser.close();
    console.error("💥 Verification failed:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Verification failed', details: err.message }),
    };
  }
};