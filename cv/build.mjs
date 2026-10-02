// Renders cv/cv.html to assets/Sherif-Fahmy-CV.pdf (A4).
// Usage: npm i -D playwright && node cv/build.mjs
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, "..", "assets", "Sherif-Fahmy-CV.pdf");

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(dir, "cv.html")).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log("wrote", out);
