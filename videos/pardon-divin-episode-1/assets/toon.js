// Bibliothèque « 3D dessin animé » (série Le pardon divin) : matériaux à paliers, contours noirs (coque inversée),
// personnages à grosse tête ronde avec visage dessiné en direct (yeux, paupières, sourcils, 5 bouches), animaux, nature.
import * as THREE from "three";

export const INK = "#1D1A1F";
let seed = 21; export const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
export const setSeed = (s) => (seed = s);

// ── matériaux ──
const grad = (() => { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
export const tm = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: grad, ...o });
const olCache = new Map();
export function olMat(w) {
  const k = w.toFixed(4); if (olCache.has(k)) return olCache.get(k);
  const m = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(normal) * ${w.toFixed(4)};`); };
  m.customProgramCacheKey = () => "ol" + k; olCache.set(k, m); return m;
}
// contour noir : coque inversée légèrement gonflée le long des normales
export function outline(obj, w = 0.025) {
  const add = [];
  obj.traverse((o) => { if ((o.isMesh || o.isInstancedMesh) && !o.userData.noOl && !o.userData.isOl) add.push(o); });
  for (const o of add) {
    const ww = o.userData.ol ?? w; if (ww <= 0) continue;
    const h = o.isInstancedMesh ? new THREE.InstancedMesh(o.geometry, olMat(ww), o.count) : new THREE.Mesh(o.geometry, olMat(ww));
    if (o.isInstancedMesh) { h.instanceMatrix = o.instanceMatrix; h.count = o.count; }
    h.userData.isOl = true; h.castShadow = false; h.receiveShadow = false; h.renderOrder = -1; o.add(h); o.userData.hull = h;
  }
  return obj;
}
export function mesh(geo, color, o = {}) {
  const m = new THREE.Mesh(geo, color && color.isMaterial ? color : tm(color, o.mat || {}));
  m.castShadow = o.shadow ?? true; m.receiveShadow = true; if (o.ol !== undefined) m.userData.ol = o.ol; if (o.noOl) m.userData.noOl = true;
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale) Array.isArray(o.scale) ? m.scale.set(...o.scale) : m.scale.setScalar(o.scale);
  if (o.parent) o.parent.add(m); return m;
}
export const sph = (r, s = 24) => new THREE.SphereGeometry(r, s, Math.max(8, s * 0.66 | 0));
export const cyl = (r1, r2, h, s = 16) => new THREE.CylinderGeometry(r1, r2, h, s);
export const cap = (r, l, s = 12) => new THREE.CapsuleGeometry(r, l, 4, s);
export function canvasTex(w, h, draw, rep) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return t;
}

// ── visage dessiné (canvas) : p = { lid, lidLo, bi, bo, bd, lx, ly, mouth:0..4, open, smile, blush, tear, sweat, rusé, t } ──
// bouches : 0 fermée (trait), 1 petite ouverte, 2 grande ouverte, 3 « o », 4 sourire ouvert
export function drawFace(g, o, p) {
  const W = 512, cx = 256; g.clearRect(0, 0, W, W); g.fillStyle = o.skin; g.fillRect(0, 0, W, W);
  g.lineCap = g.lineJoin = "round";
  if (p.blush || o.blush) { for (const s of [-1, 1]) { g.fillStyle = `rgba(235,95,95,${0.28 * (p.blush ?? o.blush ?? 0)})`; g.beginPath(); g.ellipse(cx + s * 120, 320, 38, 22, 0, 0, 7); g.fill(); } }
  const ey = 222 + (o.eyeY || 0), ex = 92 + (o.eyeX || 0), ry = 84, rx = 70 * (o.eyeW || 1);
  for (const s of [-1, 1]) {
    const x = cx + s * ex;
    g.save(); g.beginPath(); g.ellipse(x, ey, rx, ry, 0, 0, 7); g.clip();
    g.fillStyle = "#ffffff"; g.fillRect(x - rx, ey - ry, rx * 2, ry * 2);
    const px = x + (p.lx || 0) * 20 + s * (p.cross || 0) * -10, py = ey + 12 + (p.ly || 0) * 20, pr = 32 * (p.pupil || 1);
    g.fillStyle = INK; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(px - 8, py - 9, 7, 0, 7); g.fill(); g.beginPath(); g.arc(px + 7, py + 8, 3, 0, 7); g.fill();
    if (p.glow) { g.fillStyle = `rgba(255,214,90,${p.glow})`; g.beginPath(); g.arc(px, py, pr * 0.8, 0, 7); g.fill(); }
    const lid = Math.max(-0.2, Math.min(1, p.lid || 0)), ly = ey - ry + lid * ry * 2.05;
    if (lid > 0) { g.fillStyle = o.skin; g.fillRect(x - rx - 2, ey - ry - 4, rx * 2 + 4, ly - (ey - ry) + 4); }
    const lo = p.lidLo || 0; if (lo > 0) { g.fillStyle = o.skin; g.beginPath(); g.ellipse(x, ey + ry + 30 - lo * 70, rx * 1.3, 40, 0, Math.PI, 0); g.fill(); }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.ellipse(x, ey, rx, ry, 0, 0, 7); g.stroke();
    if (lid > 0.02) { g.lineWidth = 8; g.beginPath(); g.moveTo(x - rx, Math.min(ly, ey + ry)); g.lineTo(x + rx, Math.min(ly, ey + ry)); g.stroke(); }
    // sourcils
    const bi = p.bi || 0, bo = p.bo || 0, bd = p.bd || 0, ru = p.ruse || 0;
    const yin = ey - ry - 20 - bi * 22 + bd * 18 + (s > 0 ? -ru * 18 : ru * 6), yout = ey - ry - 26 - bo * 16 + bd * 4;
    g.lineWidth = 17; g.beginPath(); g.moveTo(cx + s * (ex - rx + 4), yin); g.quadraticCurveTo(cx + s * ex, Math.min(yin, yout) - 14, cx + s * (ex + rx), yout); g.stroke();
  }
  // nez en petite courbe
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(cx + 6, 300, 16, -0.4, 1.9); g.stroke();
  // bouche
  const my = 362 + (o.mouthY || 0), m = p.mouth ?? 0, op = Math.max(0, Math.min(1, p.open || 0)), sm = p.smile ?? 0.3, w = 70;
  g.lineWidth = 8; g.strokeStyle = INK;
  if (m === 0 || op < 0.05) { g.beginPath(); g.moveTo(cx - w, my - sm * 14); g.quadraticCurveTo(cx, my + sm * 30, cx + w, my - sm * 14); g.stroke(); }
  else if (m === 3) { const r = 14 + op * 18; g.fillStyle = "#6b1e22"; g.beginPath(); g.ellipse(cx, my + 8, r * 0.8, r, 0, 0, 7); g.fill(); g.stroke(); }
  else {
    const h = (m === 1 ? 26 : m === 2 ? 60 : 44) * (0.35 + 0.65 * op), ww = m === 4 ? w * 1.15 : w * (m === 2 ? 0.9 : 0.75);
    g.fillStyle = "#6b1e22"; g.beginPath(); g.moveTo(cx - ww, my - sm * 10); g.quadraticCurveTo(cx, my + h * 1.6 + sm * 10, cx + ww, my - sm * 10); g.quadraticCurveTo(cx, my + (m === 4 ? 6 : -4), cx - ww, my - sm * 10); g.fill();
    g.save(); g.clip(); g.fillStyle = "#e86b6b"; g.beginPath(); g.ellipse(cx, my + h * 1.1, ww * 0.55, h * 0.35, 0, 0, 7); g.fill();
    if (m === 4 || sm > 0.4) { g.fillStyle = "#fff"; g.fillRect(cx - ww, my - 14, ww * 2, 18); } g.restore();
    g.beginPath(); g.moveTo(cx - ww, my - sm * 10); g.quadraticCurveTo(cx, my + h * 1.6 + sm * 10, cx + ww, my - sm * 10); g.quadraticCurveTo(cx, my + (m === 4 ? 6 : -4), cx - ww, my - sm * 10); g.stroke();
  }
  if (o.beard) { g.fillStyle = o.beard; g.beginPath(); g.ellipse(cx, my - 16, 60, 14, 0, 0, 7); g.fill(); }
  if (p.tear) { g.fillStyle = "rgba(120,200,255,.95)"; g.strokeStyle = INK; g.lineWidth = 5; const y = ey + 70 + p.tear * 60; g.beginPath(); g.ellipse(cx + ex + 10, y, 12, 16, 0, 0, 7); g.fill(); g.stroke(); }
  if (p.sweat) { g.fillStyle = "rgba(140,210,255,.95)"; g.strokeStyle = INK; g.lineWidth = 5; const y = 120 + p.sweat * 40; g.beginPath(); g.moveTo(cx + 170, y - 26); g.quadraticCurveTo(cx + 192, y + 4, cx + 170, y + 14); g.quadraticCurveTo(cx + 148, y + 4, cx + 170, y - 26); g.fill(); g.stroke(); }
}

// ── personnage ──
// o = { skin, hair:"crepu"|"long"|"court"|null, hairColor, beard, top, topTex, bottom, shoes, sleeve, robe(bool), glow, scale }
export function makeChar(o) {
  const root = new THREE.Group(), R = 0.36;
  const skinM = tm(o.skin);
  const topM = o.topMat || (o.topTex ? tm("#ffffff", { map: o.topTex }) : tm(o.top || "#ffffff"));
  const botM = o.botMat || tm(o.bottom || "#24324f");
  const hips = new THREE.Group(); hips.position.y = 0.62; root.add(hips);
  const legs = [];
  for (const sd of [-1, 1]) {
    const L = new THREE.Group(); L.position.x = sd * 0.1; hips.add(L);
    mesh(cap(0.075, 0.38), o.legSkin ? skinM : botM, { pos: [0, -0.27, 0], parent: L });
    mesh(sph(0.1, 14), tm(o.shoes || INK), { pos: [0, -0.56, 0.05], scale: [0.9, 0.55, 1.4], parent: L });
    legs.push(L);
  }
  const body = new THREE.Group(); hips.add(body);
  const torsoG = o.robe ? cyl(0.2, 0.34, 0.78, 20).translate(0, 0.05, 0) : cyl(0.22, 0.25, 0.56, 20).translate(0, 0.24, 0);
  const torso = mesh(torsoG, topM, { parent: body });
  if (o.robe) torso.position.y = 0.13;
  if (o.buttons) for (let i = 0; i < 4; i++) mesh(sph(0.018, 8), tm(INK), { pos: [0, 0.12 + i * 0.1, 0.235], parent: body, ol: 0 });
  if (o.belt) mesh(cyl(0.255, 0.255, 0.07, 20), tm(o.belt), { pos: [0, 0.03, 0], parent: body });
  const neck = new THREE.Group(); neck.position.y = 0.55; body.add(neck);
  const head = new THREE.Group(); head.position.y = R * 0.95; neck.add(head);
  mesh(sph(R, 32), skinM, { parent: head, ol: 0.022 });
  const cv = document.createElement("canvas"); cv.width = cv.height = 512; const fg = cv.getContext("2d");
  const ft = new THREE.CanvasTexture(cv); ft.colorSpace = THREE.SRGBColorSpace;
  const face = mesh(new THREE.SphereGeometry(R * 1.003, 40, 28, Math.PI / 2 - 1.15, 2.3, 0.2 * Math.PI, 0.62 * Math.PI), tm("#ffffff", { map: ft }), { parent: head, noOl: true, shadow: false });
  for (const sd of [-1, 1]) mesh(sph(0.08, 12), skinM, { pos: [sd * R * 0.97, 0, 0], scale: [0.55, 1, 0.8], parent: head });
  // cheveux
  const hc = o.hairColor || "#1b1412";
  if (o.hair === "crepu") { mesh(new THREE.SphereGeometry(R * 1.07, 28, 14, 0, Math.PI * 2, 0, 0.5 * Math.PI), tm(hc), { rot: [-0.5, 0, 0], pos: [0, 0.02, -0.03], parent: head });
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; mesh(sph(0.07, 8), tm(hc), { pos: [Math.cos(a) * R * 0.85, R * 0.62 + Math.sin(i * 1.7) * 0.03, Math.sin(a) * R * 0.85 - 0.04], parent: head, ol: 0.012 }); } }
  if (o.hair === "court") mesh(new THREE.SphereGeometry(R * 1.04, 28, 14, 0, Math.PI * 2, 0, 0.42 * Math.PI), tm(hc), { rot: [-0.3, 0, 0], parent: head });
  if (o.hair === "long") { mesh(new THREE.SphereGeometry(R * 1.07, 28, 14, 0, Math.PI * 2, 0, 0.5 * Math.PI), tm(hc), { rot: [-0.25, 0, 0], parent: head });
    const back = mesh(cap(R * 0.85, 0.5, 16), tm(hc), { pos: [0, -0.22, -0.14], scale: [1.15, 1, 0.55], parent: head }); back.userData.hair = true;
    for (const sd of [-1, 1]) mesh(cap(0.09, 0.42, 10), tm(hc), { pos: [sd * R * 0.88, -0.2, 0.05], parent: head }); }
  if (o.beard) { const bd = mesh(new THREE.SphereGeometry(R * 1.02, 28, 14, Math.PI / 2 - 1.3, 2.6, 0.7 * Math.PI, 0.22 * Math.PI), tm(o.beard), { parent: head }); bd.scale.set(1, 1.15, 1.05); }
  // bras
  const arms = [];
  for (const sd of [-1, 1]) {
    const S = new THREE.Group(); S.position.set(sd * 0.27, 0.46, 0); body.add(S);
    mesh(cap(0.07, 0.2), o.sleeve === "short" ? skinM : topM, { pos: [0, -0.13, 0], parent: S });
    const E = new THREE.Group(); E.position.y = -0.27; S.add(E);
    mesh(cap(0.062, 0.17), o.sleeve === "long" || !o.sleeve ? topM : skinM, { pos: [0, -0.11, 0], parent: E });
    const hand = mesh(sph(0.085, 14), skinM, { pos: [0, -0.27, 0], parent: E });
    arms.push({ S, E, hand });
  }
  if (o.glow) { topM.emissive = new THREE.Color(o.glow); topM.emissiveIntensity = 0.45; }
  outline(root, 0.02);
  root.scale.setScalar(o.scale || 1);
  const C = { root, hips, body, neck, head, arms, legs, face, fg, ft, o, R };
  C.pose = (P = {}) => {
    hips.position.y = 0.62 - 0.3 * (P.seated || 0) + (P.lift || 0) + (P.bob || 0);
    legs.forEach((L, i) => { L.rotation.x = (P.seated || 0) * -1.5 + (P.walk ? Math.sin(P.walk + i * Math.PI) * 0.55 : 0); });
    body.rotation.set(P.lean || 0, P.twist || 0, P.side || 0); body.scale.y = 1 + (P.breath || 0);
    head.rotation.set(P.hx || 0, P.hy || 0, P.hz || 0);
    const setA = (a, v, sd) => { a.S.rotation.set(-(v[0] || 0), v[3] || 0, sd * (v[1] ?? 0.12)); a.E.rotation.set(-(v[2] || 0), 0, 0); };
    setA(arms[0], P.L || [0, 0.12, 0.15], -1); setA(arms[1], P.R || [0, 0.12, 0.15], 1);
  };
  C.faceSet = (p) => { drawFace(fg, o, p); ft.needsUpdate = true; };
  C.pose({}); C.faceSet({});
  return C;
}

// ── nature ──
export function tree(o = {}) {
  const g = new THREE.Group(), h = o.h || 2.4, lc = o.leaf || "#5fb847";
  mesh(cyl(0.16 * (o.thick || 1), 0.26 * (o.thick || 1), h, 12), tm(o.trunk || "#8a5a32"), { pos: [0, h / 2, 0], parent: g });
  const crown = new THREE.Group(); crown.position.y = h; g.add(crown);
  const n = o.blobs || 7;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = i === 0 ? 0 : 0.75 * (o.size || 1);
    mesh(sph((0.75 + rnd() * 0.25) * (o.size || 1), 18), tm(i % 2 ? lc : (o.leaf2 || "#4ea83b"), o.leafMat || {}), { pos: [Math.cos(a) * r, (i === 0 ? 0.55 : 0.1 + rnd() * 0.4) * (o.size || 1), Math.sin(a) * r * 0.8], parent: crown }); }
  const fruits = [];
  if (o.fruit) for (let i = 0; i < (o.nFruit || 10); i++) { const a = rnd() * 6.28, r = (0.9 + rnd() * 0.5) * (o.size || 1);
    const f = mesh(sph(0.13, 14), tm(o.fruit, o.fruitMat || {}), { pos: [Math.cos(a) * r, 0.1 + rnd() * 0.9 * (o.size || 1), Math.sin(a) * r * 0.85 + 0.2], parent: crown, ol: 0.018 });
    mesh(sph(0.035, 6), tm("#ffffff"), { pos: [-0.04, 0.05, 0.1], parent: f, noOl: true }); fruits.push(f); }
  outline(g, 0.03); g.userData.crown = crown; g.userData.fruits = fruits; return g;
}
export function palm(h = 3.2) {
  const g = new THREE.Group(); const segs = 7;
  for (let i = 0; i < segs; i++) mesh(cyl(0.12, 0.15, h / segs + 0.02, 10), tm(i % 2 ? "#a77a4a" : "#946a3e"), { pos: [Math.sin(i / segs * 1.2) * 0.25, (i + 0.5) * h / segs, 0], parent: g });
  const top = new THREE.Group(); top.position.set(Math.sin(1.2) * 0.25, h, 0); g.add(top);
  for (let i = 0; i < 8; i++) { const lf = new THREE.Group(); lf.rotation.y = (i / 8) * Math.PI * 2; top.add(lf);
    const l = mesh(sph(0.5, 12), tm(i % 2 ? "#4caf50" : "#5fbf55"), { scale: [2.0, 0.12, 0.45], pos: [0.85, -0.18, 0], rot: [0, 0, -0.45], parent: lf }); }
  outline(g, 0.025); g.userData.top = top; return g;
}
export function bush(s = 1, c = "#4ea83b") { const g = new THREE.Group(); for (let i = 0; i < 4; i++) mesh(sph(0.45 * s, 14), tm(i % 2 ? c : "#62bd4c"), { pos: [(i - 1.5) * 0.4 * s, 0.3 * s + (i % 2) * 0.15 * s, (i % 2) * 0.15 * s], parent: g }); return outline(g, 0.025); }
export function cloud(s = 1) { const g = new THREE.Group(); [[0, 0, 0.6], [0.6, -0.08, 0.45], [-0.6, -0.1, 0.42], [0.25, 0.25, 0.42]].forEach(([x, y, r]) => mesh(sph(r * s, 16), tm("#ffffff", { emissive: "#ffffff", emissiveIntensity: 0.35 }), { pos: [x * s, y * s, 0], parent: g, shadow: false })); return outline(g, 0.03); }
export function flowers(n, area, colors) {
  const g = new THREE.Group(), geo = sph(0.07, 8), cols = colors || ["#ff6fa5", "#ffd23f", "#ffffff", "#b07cff", "#ff8c42"];
  cols.forEach((c, k) => { const im = new THREE.InstancedMesh(geo, tm(c), Math.ceil(n / cols.length)); const m4 = new THREE.Matrix4();
    for (let i = 0; i < im.count; i++) { m4.makeTranslation(area[0] + rnd() * (area[1] - area[0]), 0.06, area[2] + rnd() * (area[3] - area[2])); im.setMatrixAt(i, m4); } im.userData.ol = 0.012; g.add(im); });
  return outline(g);
}
