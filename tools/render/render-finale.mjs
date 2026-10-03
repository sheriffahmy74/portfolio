// Renders the closing "dream flight" to assets/fin/{lg,sm}/NNN.jpg
// Usage: node tools/render/render-finale.mjs <lg|sm> [frames]   (serve the repo root on :5180 first)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const size = process.argv[2] || "lg";
const N = Number(process.argv[3] || 120);
const [w, h] = size === "sm" ? [540, 960] : [1280, 720];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "assets/fin", size);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(`http://localhost:5180/tools/render/finale.html?w=${w}&h=${h}`);
await page.evaluate(() => window.ready);
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((t) => window.renderFrame(t, "image/jpeg", 0.8), i / (N - 1));
  writeFileSync(path.join(out, String(i).padStart(3, "0") + ".jpg"), Buffer.from(url.split(",")[1], "base64"));
}
await browser.close();
console.log("done", size, N);
