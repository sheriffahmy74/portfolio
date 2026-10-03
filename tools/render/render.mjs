// Renders the phone scroll sequence to assets/seq/{lg,sm}/NNN.webp
// Usage: node tools/render/render.mjs [frames]   (serve the repo root on :5180 first)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const N = Number(process.argv[2] || 120);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "assets/seq/lg");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
});
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto("http://localhost:5180/tools/render/render.html");
await page.evaluate(() => window.renderReady);
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((t) => window.renderFrame(t, "image/webp", 0.88), i / (N - 1));
  writeFileSync(path.join(out, String(i).padStart(3, "0") + ".webp"), Buffer.from(url.split(",")[1], "base64"));
  if (i % 20 === 0) console.log("frame", i);
}
await browser.close();
console.log("done", N, "frames →", out);
