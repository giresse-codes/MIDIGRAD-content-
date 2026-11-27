// Captures d'images clés : node outils/captures.mjs <composition> <sortieDir> <t1,t2,...> [scale]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const [comp, dir, ts, sc] = process.argv.slice(2);
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : undefined;
fs.mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp, browserExecutable});
for (const t of ts.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const output = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, scale: Number(sc ?? 0.5), browserExecutable});
  console.log(output);
}
