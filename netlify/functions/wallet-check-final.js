import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function handler(event) {
  const { email, password } = JSON.parse(event.body || "{}");
  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing credentials" }) };
  }

  const executablePath = await chromium.executablePath();
  if (!executablePath) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Chromium executable not found." }),
    };
  }

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto("https://www.luckyblock.top/en/login", { waitUntil: "networkidle2" });

    await page.type('input[type=email]', email);
    await page.type('input[type=password]', password);
    await page.click('button[type=submit]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.goto("https://www.luckyblock.top/en/profile?overlay=wallet&tab=0", { waitUntil: "networkidle2" });

    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const usdtBtn = [...document.querySelectorAll("div,button")].find(el => el.textContent.includes("USDT"));
      if (usdtBtn) usdtBtn.click();
    });

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const erc20Btn = [...document.querySelectorAll("div,button")].find(el => el.textContent.includes("ERC20"));
      if (erc20Btn) erc20Btn.click();
    });

    await page.waitForTimeout(2000);

    const wallet = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("div, span, input, code"));
      for (let el of elements) {
        const text = (el.innerText || el.value || "").trim();
        if (text.startsWith("0x") && text.length >= 30 && text.length <= 100) return text;
      }
      return null;
    });

    await browser.close();

    return wallet
      ? { statusCode: 200, body: JSON.stringify({ wallet }) }
      : { statusCode: 404, body: JSON.stringify({ error: "Wallet not found" }) };

  } catch (error) {
    await browser.close();
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}