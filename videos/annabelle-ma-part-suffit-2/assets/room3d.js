// Chambre d'hôpital (Douala) en 3D « jouet » : formes arrondies, matières mates, ombres douces.
// createRoom(canvas) → { render(t, s), project([x,y,z]), renderLogo(t) } ; tout dépend uniquement de t et de s.
import * as THREE from "three";
import { RoundedBoxGeometry } from "./lib/RoundedBoxGeometry.js";

export async function createRoom(canvas, logoUrl) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(540, 960, false); // 3D à mi-résolution (arrière-plan flouté) ; textes et personnages en pleine résolution
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  const S = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 40);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, metalness: 0, ...o });
  const box = (w, h, d, c, r = 0.03, o) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), typeof c === "object" ? c : mat(c, o)); m.castShadow = m.receiveShadow = true; return m; };
  const cyl = (r1, r2, h, c, seg = 20) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), typeof c === "object" ? c : mat(c)); m.castShadow = m.receiveShadow = true; return m; };
  const at = (m, x, y, z, ry = 0) => { m.position.set(x, y, z); m.rotation.y = ry; S.add(m); return m; };
  const canvasTex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { t, c, g }; };

  // ── Pièce ───────────────────────────────────────────────────────────
  const floorTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#d8cfbf"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c6bba8"; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); } }).t;
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(5, 6);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6), mat("#ffffff", { map: floorTex })); floor.rotation.x = -Math.PI / 2; floor.position.set(-0.1, 0, 1.2); floor.receiveShadow = true; S.add(floor);
  const wallM = mat("#dfe9e3");
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.9), wallM); back.position.set(-0.1, 1.45, -1.6); back.receiveShadow = true; S.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.9), wallM); left.rotation.y = Math.PI / 2; left.position.set(-2.3, 1.45, 1.4); left.receiveShadow = true; S.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.9), wallM); right.rotation.y = -Math.PI / 2; right.position.set(2.1, 1.45, 1.4); right.receiveShadow = true; S.add(right);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6), mat("#f1f3ef")); ceil.rotation.x = Math.PI / 2; ceil.position.set(-0.1, 2.9, 1.2); S.add(ceil);
  at(box(4.4, 0.12, 0.04, "#b9c9c0", 0.01), -0.1, 0.06, -1.58); // plinthe
  at(box(4.4, 0.06, 0.03, "#c9d6cf", 0.01), -0.1, 1.0, -1.585); // cimaise
  // porte (mur gauche)
  at(box(0.06, 2.1, 0.95, "#b98b5e", 0.02), -2.27, 1.05, 2.0); at(cyl(0.025, 0.025, 0.14, "#d9d4c8"), -2.22, 1.0, 1.65).rotation.z = Math.PI / 2;
  // fenêtre : ciel de fin d'après-midi
  const sky = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#9cc7e6"); gr.addColorStop(0.6, "#f6d9a8"); gr.addColorStop(1, "#f3b97a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(80,110,90,.55)"; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(20 + i * 30, 230 - (i % 3) * 12, 26, 0, 7); g.fill(); } }).t;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), new THREE.MeshBasicMaterial({ map: sky, toneMapped: false })); glass.position.set(0.85, 1.65, -1.595); S.add(glass);
  const frameM = mat("#fbfbf8");
  [[0.85, 2.27, 1.22, 0.06], [0.85, 1.03, 1.22, 0.08], [0.27, 1.65, 0.06, 1.3], [1.43, 1.65, 0.06, 1.3], [0.85, 1.65, 0.04, 1.2]].forEach(([x, y, w, h]) => at(box(w, h, 0.06, frameM, 0.01), x, y, -1.58));
  // rideau léger (ondule)
  const curG = new THREE.PlaneGeometry(0.55, 1.6, 12, 16), curBase = curG.attributes.position.array.slice();
  const curtain = new THREE.Mesh(curG, new THREE.MeshStandardMaterial({ color: "#f3efe4", roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.93 }));
  curtain.position.set(1.62, 1.55, -1.5); curtain.castShadow = true; S.add(curtain);
  at(cyl(0.012, 0.012, 1.7, "#cfcac0"), 1.05, 2.38, -1.52).rotation.z = Math.PI / 2;

  // ── Lit médicalisé ──────────────────────────────────────────────────
  const BX = -0.6;
  at(box(1.0, 0.18, 2.05, "#c9cfd3", 0.04), BX, 0.42, -0.55);
  [[-0.45, -1.5], [0.45, -1.5], [-0.45, 0.4], [0.45, 0.4]].forEach(([dx, dz]) => { at(cyl(0.025, 0.025, 0.36, "#9aa2a8"), BX + dx, 0.2, dz); at(cyl(0.045, 0.045, 0.04, "#555b60"), BX + dx, 0.03, dz); });
  at(box(1.08, 0.95, 0.06, "#e9eef0", 0.04), BX, 0.82, -1.55); at(box(1.08, 0.55, 0.06, "#e9eef0", 0.04), BX, 0.62, 0.48);
  at(box(0.96, 0.18, 1.95, "#fbfbf9", 0.07), BX, 0.6, -0.55);                // matelas
  const pil1 = at(box(0.78, 0.2, 0.42, "#ffffff", 0.09), BX, 0.82, -1.3); pil1.rotation.x = -0.9;
  const pil2 = at(box(0.7, 0.18, 0.38, "#f4f7fa", 0.09), BX, 0.92, -1.12); pil2.rotation.x = -1.0;
  const sheet = at(box(1.02, 0.12, 1.25, "#eef3f6", 0.06), BX, 0.72, -0.05);  // drap sur les jambes
  at(box(1.0, 0.03, 0.06, "#c3d6e2", 0.01), BX, 0.79, -0.66);
  [[-0.53], [0.53]].forEach(([dx]) => at(box(0.03, 0.18, 0.8, "#b8c0c5", 0.01), BX + dx, 0.82, -0.3));  // barrières

  const wrap = at(box(0.42, 0.06, 0.16, "#7b1f2b", 0.03), BX + 0.22, 0.81, 0.18, 0.4); at(box(0.43, 0.02, 0.04, "#e7b64a", 0.01), BX + 0.22, 0.845, 0.18, 0.4);
  // ── Perfusion ───────────────────────────────────────────────────────
  const IX = -1.4, IZ = -0.6;
  at(cyl(0.014, 0.014, 1.95, "#b9c0c6"), IX, 0.98, IZ);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const l = at(cyl(0.012, 0.012, 0.3, "#9aa2a8"), IX + Math.cos(a) * 0.14, 0.04, IZ + Math.sin(a) * 0.14); l.rotation.set(Math.PI / 2, 0, -a + Math.PI / 2); }
  at(box(0.32, 0.02, 0.02, "#b9c0c6", 0.005), IX, 1.92, IZ);
  const bag = at(box(0.16, 0.26, 0.05, new THREE.MeshStandardMaterial({ color: "#e8f4fb", roughness: 0.3, transparent: true, opacity: 0.75 }), 0.03), IX + 0.12, 1.74, IZ);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(IX + 0.12, 1.6, IZ), new THREE.Vector3(IX + 0.1, 1.2, IZ + 0.05), new THREE.Vector3(IX + 0.45, 0.95, IZ - 0.1), new THREE.Vector3(BX - 0.25, 0.92, -0.75)]), 40, 0.006, 6), mat("#dfeef5"));
  S.add(tube);

  // ── Moniteur cardiaque (ECG qui défile) ─────────────────────────────
  at(cyl(0.02, 0.02, 1.3, "#8f979d"), -1.5, 0.65, -1.3); at(cyl(0.18, 0.2, 0.04, "#6f777c"), -1.5, 0.02, -1.3);
  const mon = at(box(0.5, 0.38, 0.1, "#2c3238", 0.04), -1.5, 1.45, -1.28, 0.35);
  const ecg = canvasTex(400, 280, () => {});
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.43, 0.3), new THREE.MeshBasicMaterial({ map: ecg.t, toneMapped: false })); scr.position.set(0, 0, 0.052); mon.add(scr);
  const drawEcg = (t, mode) => {
    const g = ecg.g, w = 400, h = 280; g.fillStyle = "#04110b"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#0d2d1b"; g.lineWidth = 1; for (let x = 0; x < w; x += 25) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 25) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = "#45f08a"; g.lineWidth = 4; g.shadowColor = "#45f08a"; g.shadowBlur = 8; g.beginPath();
    const period = 1.0, speed = 160;
    for (let x = 0; x <= w; x += 2) {
      const tt = t - (w - x) / speed, ph = ((tt % period) + period) % period;
      let y = 150;
      if (ph > 0.1 && ph < 0.16) y -= Math.sin(((ph - 0.1) / 0.06) * Math.PI) * 14;
      if (ph > 0.24 && ph < 0.27) y += 14; if (ph >= 0.27 && ph < 0.31) y -= 95 * Math.sin(((ph - 0.27) / 0.04) * Math.PI); if (ph >= 0.31 && ph < 0.34) y += 22;
      if (ph > 0.45 && ph < 0.6) y -= Math.sin(((ph - 0.45) / 0.15) * Math.PI) * 20;
      x ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke(); g.shadowBlur = 0; g.fillStyle = "#45f08a"; g.font = "bold 34px JetBrains Mono, monospace"; g.fillText("♥ 62", 18, 44); g.fillStyle = "#4fc3f7"; g.fillText("SpO2 96", 220, 44);
    const x0 = w - 3; g.fillStyle = "#04110b"; g.fillRect(x0, 60, 3, 220);
    ecg.t.needsUpdate = true;
  };

  // ── Table de chevet, verre d'eau, fleurs ────────────────────────────
  at(box(0.42, 0.62, 0.38, "#c79a6b", 0.03), 0.18, 0.31, -1.35); at(box(0.36, 0.02, 0.01, "#a77c50", 0.005), 0.18, 0.42, -1.155);
  at(cyl(0.035, 0.03, 0.11, new THREE.MeshStandardMaterial({ color: "#dff2ff", roughness: 0.1, transparent: true, opacity: 0.55 })), 0.06, 0.68, -1.3);
  at(cyl(0.05, 0.04, 0.14, "#4f7fb8"), 0.27, 0.69, -1.4);
  [["#f28fb0", 0.25, 0.86, -1.4], ["#f7c948", 0.31, 0.83, -1.37], ["#ffffff", 0.22, 0.82, -1.36], ["#f28fb0", 0.29, 0.9, -1.43], ["#e86a5a", 0.33, 0.88, -1.42]].forEach(([c, x, y, z]) => { at(cyl(0.004, 0.004, y - 0.7, "#4c8a4a", 6), x, (y + 0.7) / 2, z); const f = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mat(c)); f.castShadow = true; at(f, x, y, z); });
  // chaise du pasteur
  const CX = 0.5, CZ = -0.35;
  at(box(0.46, 0.06, 0.44, "#5f7f9a", 0.025), CX, 0.46, CZ); at(box(0.06, 0.5, 0.42, "#5f7f9a", 0.025), CX + 0.22, 0.74, CZ);
  [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(([dx, dz]) => at(cyl(0.018, 0.018, 0.44, "#3f4b55"), CX + dx, 0.22, CZ + dz));

  // ── Lumières ────────────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight("#dfe8f0", "#8a8174", 1.0); S.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2b0", 1.4); sun.position.set(1.6, 3.2, -3.4); sun.target.position.set(-0.4, 0.6, -0.6);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.radius = 6; sun.shadow.bias = -0.0008;
  Object.assign(sun.shadow.camera, { left: -2.6, right: 2.6, top: 2.6, bottom: -2.6, near: 0.5, far: 9 }); S.add(sun); S.add(sun.target);
  const fill = new THREE.PointLight("#fff3e0", 0.0, 4, 1.6); fill.position.set(0.9, 1.9, 0.8); S.add(fill);
  const key = new THREE.DirectionalLight("#ffffff", 0.6); key.position.set(-1, 2.5, 3); S.add(key);
  // rayon de soleil (volume additif) + poussière
  const beamM = new THREE.MeshBasicMaterial({ color: "#ffd590", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.6, 2.4, 24, 1, true), beamM);
  beam.position.set(0.15, 1.3, -1.0); beam.lookAt(-0.55, 0.9, -0.85); beam.rotateX(Math.PI / 2); S.add(beam);
  const NDUST = 160, dpos = new Float32Array(NDUST * 3), dseed = [];
  for (let i = 0; i < NDUST; i++) dseed.push([Math.sin(i * 12.9898) * 0.5 + 0.5, Math.sin(i * 78.233) * 0.5 + 0.5, Math.sin(i * 37.719) * 0.5 + 0.5]);
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: "#fff1cc", size: 0.012, transparent: true, opacity: 0.7, depthWrite: false })); S.add(dust);

  // ── Logo 3D (fin) ───────────────────────────────────────────────────
  const LS = new THREE.Scene(); LS.background = new THREE.Color("#f3f1ec");
  const lcam = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 20); lcam.position.set(0, -0.2, 10.5); lcam.lookAt(0, -0.2, 0);
  const logoTex = await new THREE.TextureLoader().loadAsync(logoUrl); logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = 8; logoTex.center.set(0.5, 0.5); logoTex.rotation = Math.PI / 2;
  const plate = new THREE.Group(); LS.add(plate);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.14, 96), [mat("#d9a441", { roughness: 0.35, metalness: 0.4 }), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false }), mat("#f3f1ec")]);
  disc.rotation.x = Math.PI / 2; plate.add(disc); plate.position.y = 0.9;
  const sh = canvasTex(256, 256, () => {});
  const shineM = new THREE.MeshBasicMaterial({ map: sh.t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const shine = new THREE.Mesh(new THREE.CircleGeometry(1.0, 96), shineM); shine.position.z = 0.072; plate.add(shine);
  const drawShine = (u) => { const g = sh.g; g.clearRect(0, 0, 256, 256); g.save(); g.beginPath(); g.arc(128, 128, 128, 0, 7); g.clip();
    const x = -80 + u * 420, gr = g.createLinearGradient(x - 60, 0, x + 60, 256); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.restore(); sh.t.needsUpdate = true; };
  LS.add(new THREE.HemisphereLight("#ffffff", "#c9c2b5", 1.3)); const ll = new THREE.DirectionalLight("#fff4e0", 1.6); ll.position.set(2, 3, 4); LS.add(ll);
  const lsh = new THREE.Mesh(new THREE.CircleGeometry(1.1, 64), new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.08 })); lsh.rotation.x = -Math.PI / 2; lsh.position.y = -0.55; LS.add(lsh);

  const v = new THREE.Vector3(), tmpC = new THREE.Color();
  function render(t, s) {
    cam.position.set(...s.pos); cam.lookAt(...s.tgt); cam.fov = s.fov || 50; cam.updateProjectionMatrix();
    // lumière : froide/grise → neutre → chaude
    const c = s.cool, w = s.warm;
    hemi.color.set(tmpC.set("#dfe6ee").lerp(new THREE.Color("#fff1dc"), w)); hemi.intensity = 0.85 + 0.25 * w - 0.1 * c;
    sun.color.set(new THREE.Color("#c9d3dd").lerp(new THREE.Color("#ffd08a"), w)); sun.intensity = 0.9 + 1.6 * w;
    fill.intensity = s.pastor || 0;
    R.toneMappingExposure = 0.92 + 0.18 * w - 0.06 * c;
    beamM.opacity = 0.16 * s.beam;
    for (let i = 0; i < NDUST; i++) { const [a, b, d] = dseed[i]; const k = ((t * 0.03 * (0.5 + d)) + a) % 1;
      dpos[i * 3] = 0.15 + (-0.7 * k) + (b - 0.5) * 0.5 + 0.03 * Math.sin(t * 0.4 + i); dpos[i * 3 + 1] = 1.9 - 1.0 * k + (d - 0.5) * 0.35; dpos[i * 3 + 2] = -1.25 + 0.4 * k + (a - 0.5) * 0.4; }
    dg.attributes.position.needsUpdate = true; dust.material.opacity = 0.25 + 0.55 * s.beam;
    const p = curG.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) { const x = curBase[i], y = curBase[i + 1]; p[i + 2] = curBase[i + 2] + 0.035 * Math.sin(t * 0.9 + x * 9 + y * 1.5) * (0.6 - y / 1.6); }
    curG.attributes.position.needsUpdate = true; curG.computeVertexNormals();
    drawEcg(t);
    R.render(S, cam);
  }
  function renderLogo(t) {
    plate.rotation.y = 0.35 * Math.sin(t * 0.9); plate.rotation.x = 0.06 * Math.sin(t * 0.6);
    drawShine(((t * 0.45) % 1.4));
    R.render(LS, lcam);
  }
  function project(p) { v.set(...p).project(cam); return [(v.x * 0.5 + 0.5) * 1080, (-v.y * 0.5 + 0.5) * 1920, v.z]; }
  return { render, renderLogo, project, cam };
}
