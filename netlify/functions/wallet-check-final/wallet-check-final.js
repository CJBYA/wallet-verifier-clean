
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async (req, res) => {
  console.log("🔥 Wallet check function deployed at:", new Date().toISOString());

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  try {
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
      return res.status(200).json({ wallet });
    } else {
      return res.status(404).json({ error: "Wallet not found" });
    }
  } catch (err) {
    await browser.close();
    return res.status(500).json({ error: "Verification failed", details: err.message });
  }
};
