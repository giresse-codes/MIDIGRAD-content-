import { chromium } from 'playwright-core';
import { spawn } from 'child_process';
const [from, to, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
const FPS = 30, W = 540, H = 960;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage(); p.on('pageerror', e=>console.log('err', e.message));
await p.goto('file://' + process.cwd() + '/outils/page-ciel.html');
const ff = spawn('ffmpeg', ['-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${W}x${H}`,'-r',`${FPS}`,'-i','-','-vf','vflip','-c:v','ffv1','-pix_fmt','yuv444p', out], { stdio: ['pipe','inherit','inherit'] });
for (let i = from; i < to; i += 10) {
  const n = Math.min(10, to - i);
  const chunks = await p.evaluate(([i, n, W, H, FPS]) => {
    const gl = document.getElementById('sky-canvas').getContext('webgl2'); const res = [];
    const px = new Uint8Array(W*H*4);
    for (let k = 0; k < n; k++) { window.__skyDraw((i+k)/FPS); gl.readPixels(0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,px);
      let s=''; for (let j=0;j<px.length;j+=32768) s+=String.fromCharCode.apply(null, px.subarray(j,j+32768)); res.push(btoa(s)); }
    return res; }, [i, n, W, H, FPS]);
  for (const c of chunks) { if (!ff.stdin.write(Buffer.from(c, 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  if (i % 300 === 0) console.log(out, 'frame', i);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', out);
