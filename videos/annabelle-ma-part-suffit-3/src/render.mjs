// Rendu image par image (Chromium headless + Playwright), par morceaux, avec FFmpeg.
//   node src/render.mjs stills  <scale> <rw> <out_dir> t1 t2 ...        → PNG aux instants donnés
//   node src/render.mjs chunk   <scale> <rw> <out.mp4> <t0> <t1>        → morceau vidéo (sans son), 30 i/s
// scale : 0.5 → 540×960 (tests), 1 → 1080×1920 ; rw : résolution de la scène 3D (largeur).
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");   // Playwright préinstallé (require global)
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [mode, scaleS, rwS, out, ...rest] = process.argv.slice(2);
const scale = +scaleS, rw = +rwS, FPS = 30;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".wav": "audio/wav", ".json": "application/json" };
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(r);
}).listen(0);
const port = srv.address().port;
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--use-angle=swiftshader", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
page.on("pageerror", (e) => console.error("ERREUR PAGE :", e.message));
await page.goto(`http://127.0.0.1:${port}/index.html?rw=${rw}`);
await page.waitForFunction(() => window.__film, null, { timeout: 180000 });
const shot = async (t) => { await page.evaluate((t) => window.__film.update(t), t); return page.screenshot({ type: "png" }); };
if (mode === "info") {
  fs.writeFileSync(out, JSON.stringify(await page.evaluate(() => ({ C: window.__C, shots: window.__shots.map((s) => [+s.t0.toFixed(2), s.type]) })), null, 0));
} else if (mode === "stills") {
  fs.mkdirSync(out, { recursive: true });
  for (const t of rest.map(Number)) { const b = await shot(t); fs.writeFileSync(path.join(out, `t${t.toFixed(2)}.png`), b); console.log("image", t); }
} else {
  const t0 = +rest[0], t1 = +rest[1], f0 = Math.round(t0 * FPS), f1 = Math.round(t1 * FPS);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "14", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
  const T = Date.now();
  for (let f = f0; f < f1; f++) {
    const b = await shot(f / FPS);
    if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - f0) % 150 === 0) console.log(`${out} : ${f - f0}/${f1 - f0} images, ${((Date.now() - T) / 1000 / Math.max(1, f - f0)).toFixed(2)} s/image`);
  }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
  console.log("fini", out, ((Date.now() - T) / 1000).toFixed(0), "s");
}
await browser.close(); srv.close();
