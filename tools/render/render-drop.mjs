// Renders the hero "Flutter drop" to assets/drop/{lg,sm}/NNN.webp (transparent).
// Usage: node tools/render/render-drop.mjs <lg|sm> [frames]   (serve the repo root on :5180 first)
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const size = process.argv[2] || "lg";
const N = Number(process.argv[3] || 110);
const [w, h] = size === "sm" ? [720, 1100] : [1440, 900];
const root = process.env.REPO_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = path.join(root, "assets/drop", size);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://localhost:5180/tools/render/flutter-drop.html?w=${w}&h=${h}`);
await page.evaluate(() => window.ready);
for (let i = 0; i < N; i++) {
  const url = await page.evaluate((t) => window.renderFrame(t, "image/webp", 0.82), i / (N - 1));
  writeFileSync(path.join(out, String(i).padStart(3, "0") + ".webp"), Buffer.from(url.split(",")[1], "base64"));
}
await browser.close();
console.log("done", size, N);
