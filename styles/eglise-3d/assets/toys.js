// Personnages-jouets 3D (style diorama) avec visages expressifs dessinés en direct (canvas → texture).
import * as THREE from "three";
import { mat, rnd, mergeGeoms } from "./church.js";

const FW = 512;
// visage : p = { lid, lidLo, bi, bo, bd, lx, ly, smile, open, wide, pinch, trem, wet, red, blush, tears:[{s,p,a}], t, closedSmile }
export function drawFace(g, o, p) {
  const sk = o.skin, W = FW, cx = 256;
  g.fillStyle = sk; g.fillRect(0, 0, W, W);
  const ey = 250, ex = 74;
  if (p.blush || p.red) { for (const s of [-1, 1]) { const gr = g.createRadialGradient(cx + s * 98, 318, 0, cx + s * 98, 318, 52); gr.addColorStop(0, `rgba(205,70,80,${0.28 * (p.blush || 0) + 0.25 * (p.red || 0)})`); gr.addColorStop(1, "rgba(205,70,80,0)"); g.fillStyle = gr; g.fillRect(0, 200, W, 200); } }
  if (p.red) { const gr = g.createRadialGradient(cx, 300, 0, cx, 300, 30); gr.addColorStop(0, `rgba(190,60,70,${0.35 * p.red})`); gr.addColorStop(1, "rgba(190,60,70,0)"); g.fillStyle = gr; g.fillRect(cx - 40, 260, 80, 80); }
  // nez
  { const gr = g.createRadialGradient(cx - 6, 284, 2, cx, 292, 26); gr.addColorStop(0, "rgba(255,230,210,.22)"); gr.addColorStop(1, "rgba(255,230,210,0)"); g.fillStyle = gr; g.fillRect(cx - 30, 260, 60, 60);
    g.fillStyle = "rgba(35,15,8,.45)"; g.beginPath(); g.ellipse(cx - 11, 304, 6, 4, 0.3, 0, 7); g.ellipse(cx + 11, 304, 6, 4, -0.3, 0, 7); g.fill(); }
  // yeux
  for (const s of [-1, 1]) {
    const x = cx + s * ex, rx = 33, ry = 37;
    g.save(); g.beginPath(); g.ellipse(x, ey, rx, ry, 0, 0, 7); g.clip();
    g.fillStyle = p.red ? `rgb(250,${236 - 30 * p.red},${232 - 34 * p.red})` : "#fbf8f2"; g.fillRect(x - rx, ey - ry, rx * 2, ry * 2);
    const ix = x + (p.lx || 0) * 13, iy = ey + 4 + (p.ly || 0) * 11;
    g.fillStyle = "#4a2a16"; g.beginPath(); g.arc(ix, iy, 22, 0, 7); g.fill();
    g.fillStyle = "#120a06"; g.beginPath(); g.arc(ix, iy, 12, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(ix - 8, iy - 9, 7 + 2 * (p.wet || 0), 0, 7); g.fill(); g.beginPath(); g.arc(ix + 8, iy + 7, 3, 0, 7); g.fill();
    if (p.wet) { g.globalAlpha = 0.85 * p.wet; g.beginPath(); g.arc(ix + 10, iy - 12, 4, 0, 7); g.fill(); g.beginPath(); g.arc(ix - 12, iy + 8, 2.5, 0, 7); g.fill(); g.globalAlpha = 1;
      g.fillStyle = `rgba(190,225,255,${0.55 * p.wet})`; g.beginPath(); g.ellipse(x, ey + ry - 6 - 70 * (p.lidLo || 0) * 0.5, rx * 0.95, 7, 0, 0, 7); g.fill(); }
    // paupière supérieure
    const lid = Math.min(1, p.lid || 0), ly = ey - ry + lid * ry * 2.05;
    g.fillStyle = sk; g.beginPath(); g.moveTo(x - rx - 2, ey - ry - 4); g.lineTo(x + rx + 2, ey - ry - 4); g.lineTo(x + rx + 2, ly - 6); g.quadraticCurveTo(x, ly + 12 * (1 - lid) , x - rx - 2, ly - 6); g.fill();
    g.strokeStyle = "#1a0d06"; g.lineWidth = 6; g.beginPath(); g.moveTo(x - rx, ly - 6); g.quadraticCurveTo(x, ly + 12 * (1 - lid), x + rx, ly - 6); g.stroke();
    // paupière inférieure (sourire des yeux, tristesse)
    const lo = p.lidLo || 0, lyy = ey + ry - lo * ry * 1.2;
    g.fillStyle = sk; g.beginPath(); g.moveTo(x - rx - 2, ey + ry + 4); g.lineTo(x + rx + 2, ey + ry + 4); g.lineTo(x + rx + 2, lyy + 4); g.quadraticCurveTo(x, lyy - 10 * lo, x - rx - 2, lyy + 4); g.fill();
    g.restore();
    if (p.wet) { g.strokeStyle = `rgba(230,245,255,${0.75 * p.wet})`; g.lineWidth = 3; g.beginPath(); g.ellipse(x, ey + 2, rx + 1, ry + 1, 0, 0.35, Math.PI - 0.35); g.stroke(); }
    g.strokeStyle = "rgba(30,15,8,.55)"; g.lineWidth = 3; g.beginPath(); g.ellipse(x, ey, rx + 1, ry + 1, 0, 0, 7); g.stroke();
    // sourcils
    const bi = p.bi || 0, bo = p.bo || 0, bd = p.bd || 0;
    const ba = (p.ba || 0) * (s > 0 ? 1 : -0.25), yin = ey - 58 - bi * 20 + bd * 14 - ba * 26, yout = ey - 56 - bo * 14 + bd * 3 - ba * 22;
    g.strokeStyle = o.brow || "#1d120b"; g.lineWidth = 13; g.beginPath(); g.moveTo(cx + s * 34, yin); g.quadraticCurveTo(cx + s * 72, Math.min(yin, yout) - 12, cx + s * 108, yout); g.stroke();
  }
  // bouche
  const my = 352, sm = p.smile || 0, op = Math.max(0, p.open || 0), wd = 44 * (1 + 0.28 * (p.wide || 0) - 0.25 * (p.pinch || 0));
  const tr = (p.trem || 0) * Math.sin((p.t || 0) * 38) * 3;
  const cy = my - sm * 15 + tr, lipC = o.lip || "#5b2a22";
  if (op > 0.04) {
    const h = op * 34;
    g.fillStyle = "#3a0f10"; g.beginPath(); g.moveTo(cx - wd, cy); g.quadraticCurveTo(cx, my - 6 + sm * 6 - h * 0.25, cx + wd, cy); g.quadraticCurveTo(cx, my + h + sm * 12, cx - wd, cy); g.fill();
    if (sm > 0.2) { g.save(); g.clip(); g.fillStyle = "#f5f1ea"; g.fillRect(cx - wd, my - 20, wd * 2, 14 + h * 0.2); g.restore(); }
    else { g.fillStyle = "#c2565a"; g.beginPath(); g.ellipse(cx, my + h * 0.7, wd * 0.45, h * 0.22, 0, 0, 7); g.fill(); }
    g.strokeStyle = lipC; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - wd, cy); g.quadraticCurveTo(cx, my + h + sm * 12, cx + wd, cy); g.stroke();
  } else {
    const lh = 12 * (1 - 0.7 * (p.pinch || 0));
    g.fillStyle = o.lipLo || "#8a3f38"; g.beginPath(); g.moveTo(cx - wd, cy); g.quadraticCurveTo(cx, my + sm * 16 + tr * 0.5 + lh * 1.6, cx + wd, cy - tr * 0.6); g.quadraticCurveTo(cx, my + sm * 16 + tr * 0.5 - 2, cx - wd, cy); g.fill();
    g.fillStyle = lipC; g.beginPath(); g.moveTo(cx - wd, cy); g.quadraticCurveTo(cx - wd * 0.4, my + sm * 6 - lh, cx, my + sm * 8 - lh * 0.5); g.quadraticCurveTo(cx + wd * 0.4, my + sm * 6 - lh, cx + wd, cy - tr * 0.6); g.quadraticCurveTo(cx, my + sm * 16 + 2, cx - wd, cy); g.fill();
    g.strokeStyle = "#2a0f0c"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - wd, cy); g.quadraticCurveTo(cx, my + sm * 16 + tr * 0.5, cx + wd, cy - tr * 0.6); g.stroke();
    g.fillStyle = "rgba(255,235,225,.35)"; g.beginPath(); g.ellipse(cx + 6, my + sm * 12 + lh * 0.9, wd * 0.3, 3, 0, 0, 7); g.fill();
  }
  if (o.beard) { g.fillStyle = o.beard; for (let i = 0; i < 520; i++) { const a = (i * 2.399) % 6.283, r = ((i * 0.618) % 1); const x = cx + Math.cos(a) * (110 + 40 * r), y = 360 + Math.abs(Math.sin(a)) * 80 * r + 40; if (y > 320) g.fillRect(x, y, 3, 3); }
    g.fillStyle = o.beard; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(cx, my - 22, 50, 9, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
  // larmes : traînées brillantes + gouttes
  for (const tr2 of p.tears || []) {
    if (tr2.a <= 0) continue;
    const x0 = cx + tr2.s * (ex - 6), y0 = ey + 34, y1 = y0 + tr2.p * 150, xx = (y) => x0 + tr2.s * Math.sin((y - y0) / 60) * 8;
    g.globalAlpha = tr2.a;
    g.strokeStyle = "rgba(160,205,240,.55)"; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y0); for (let y = y0; y <= y1; y += 6) g.lineTo(xx(y), y); g.stroke();
    g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 2, y0); for (let y = y0; y <= y1; y += 6) g.lineTo(xx(y) - 2, y); g.stroke();
    g.fillStyle = "rgba(175,215,245,.95)"; g.beginPath(); g.ellipse(xx(y1), y1, 8, 11, 0, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(xx(y1) - 3, y1 - 4, 3.2, 0, 7); g.fill();
    g.globalAlpha = 1;
  }
}

// ── personnage complet ────────────────────────────────────────────────
// o = { skin, top, bottom, topTex, dress, wrap, wrapTex, glasses, beard, hair, scale }
export function makeToy(o) {
  const root = new THREE.Group(), s = o.scale || 1;
  const skinM = mat(o.skin, { roughness: 0.55 });
  const topM = o.topTex ? mat("#ffffff", { map: o.topTex, roughness: 0.8 }) : mat(o.top, { roughness: 0.75 });
  const botM = o.bottomTex ? mat("#ffffff", { map: o.bottomTex, roughness: 0.8 }) : mat(o.bottom || "#2b2b33", { roughness: 0.8 });
  const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const hips = new THREE.Group(); root.add(hips); hips.position.y = 0.74;
  // jambes (cuisse + tibia)
  const legs = [];
  for (const sd of [-1, 1]) {
    const L = new THREE.Group(); L.position.set(sd * 0.09, 0, 0); hips.add(L);
    const th = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.26, 4, 10), botM)); th.position.y = -0.18; L.add(th);
    const K = new THREE.Group(); K.position.y = -0.37; L.add(K);
    const sn = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.24, 4, 10), o.dress ? skinM : botM)); sn.position.y = -0.16; K.add(sn);
    const ft = sh(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8).scale(1, 0.55, 1.6), mat(o.shoe || "#1b1b1f", { roughness: 0.5 }))); ft.position.set(0, -0.33, 0.05); K.add(ft);
    legs.push({ L, K });
  }
  const spine = new THREE.Group(); hips.add(spine);
  const torso = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.3, 6, 16).scale(1, 1, 0.78), topM)); torso.position.y = 0.26; spine.add(torso);
  if (o.dress) {
    const pts = []; for (let i = 0; i <= 12; i++) { const y = i / 12; pts.push(new THREE.Vector2(0.19 + 0.13 * Math.pow(1 - y, 1.3), -0.62 + y * 0.72)); }
    const sk = sh(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), o.dress)); sk.scale.z = 0.85; hips.add(sk);
  }
  if (o.tie) { const ti = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.01), mat(o.tie)); ti.position.set(0, 0.34, 0.145); spine.add(ti);
    const sh2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.01), mat("#f4f4f2")); sh2.position.set(0, 0.36, 0.142); spine.add(sh2); ti.position.z = 0.148; }
  const neck = new THREE.Group(); neck.position.y = 0.52; spine.add(neck);
  const nk = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 12), skinM)); nk.position.y = 0.02; neck.add(nk);
  const head = new THREE.Group(); head.position.y = 0.2; neck.add(head);
  const R = 0.2;
  const hd = sh(new THREE.Mesh(new THREE.SphereGeometry(R, 28, 18), skinM)); head.add(hd);
  const cv = document.createElement("canvas"); cv.width = cv.height = FW; const g = cv.getContext("2d");
  const ft = new THREE.CanvasTexture(cv); ft.colorSpace = THREE.SRGBColorSpace; ft.anisotropy = 4;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(R * 1.004, 40, 26, Math.PI / 2 - 1.35, 2.7, 0.16 * Math.PI, 0.68 * Math.PI), mat("#ffffff", { map: ft, roughness: 0.5 }));
  cap.receiveShadow = true; head.add(cap);
  for (const sd of [-1, 1]) { const ear = sh(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8).scale(0.6, 1, 0.8), skinM)); ear.position.set(sd * R * 0.98, 0, 0); head.add(ear); }
  if (o.hair) { const hr = sh(new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 32, 16, 0, Math.PI * 2, 0, 0.36 * Math.PI), mat(o.hair, { roughness: 0.95 }))); hr.rotation.x = -0.25; head.add(hr); }
  if (o.wrap) {
    const wm = mat("#ffffff", { map: o.wrapTex, roughness: 0.75 });
    const w1 = sh(new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 32, 16, 0, Math.PI * 2, 0, 0.42 * Math.PI), wm)); w1.rotation.x = -0.35; w1.position.y = 0.02; head.add(w1);
    const w2 = sh(new THREE.Mesh(new THREE.TorusGeometry(R * 0.95, 0.05, 10, 32), wm)); w2.rotation.x = Math.PI / 2 - 0.35; w2.position.y = 0.08; head.add(w2);
    for (const sd of [-1, 1]) { const b = sh(new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 10).scale(1.3, 0.8, 0.7), wm)); b.position.set(sd * 0.08, 0.22, -0.06); b.rotation.z = sd * 0.6; head.add(b); }
  }
  if (o.glasses) {
    const gm = mat("#141414", { metalness: 0.5, roughness: 0.3 });
    for (const sd of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.007, 6, 24), gm); ring.position.set(sd * 0.073, 0.0, R * 0.98); ring.rotation.y = sd * 0.25; head.add(ring);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 20), new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.1 })); lens.position.copy(ring.position); lens.rotation.y = ring.rotation.y; head.add(lens);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.17), gm); arm.position.set(sd * 0.125, 0.01, R * 0.55); head.add(arm); }
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.007, 0.007), gm); br.position.set(0, 0.012, R * 1.0); head.add(br);
  }
  // bras : épaule → coude → main
  const arms = [];
  for (const sd of [-1, 1]) {
    const S = new THREE.Group(); S.position.set(sd * 0.21, 0.44, 0); spine.add(S);
    const ua = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.2, 4, 10), topM)); ua.position.y = -0.13; S.add(ua);
    if (o.puff) { const pf = sh(new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), topM)); pf.position.y = -0.03; S.add(pf); }
    const E = new THREE.Group(); E.position.y = -0.28; S.add(E);
    const fa = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.18, 4, 10), o.shortSleeve ? skinM : topM)); fa.position.y = -0.12; E.add(fa);
    const hand = sh(new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 10).scale(0.9, 1.1, 0.7), skinM)); hand.position.y = -0.27; E.add(hand);
    arms.push({ S, E, hand });
  }
  root.scale.setScalar(s);
  const T = { root, hips, spine, neck, head, arms, legs, g, ft, o, cap, face: {} };
  // pose : { seated, lean, twist, headX, headY, headZ, L:[sx,sz,e], R:[sx,sz,e] } ; angles en radians
  T.pose = (P) => {
    const seated = P.seated || 0;
    hips.position.y = 0.74 - 0.26 * seated + (P.lift || 0);
    legs.forEach(({ L, K }) => { L.rotation.x = -1.5 * seated; K.rotation.x = 1.5 * seated; });
    spine.rotation.x = P.lean || 0; spine.rotation.y = P.twist || 0; spine.rotation.z = P.side || 0;
    spine.scale.y = 1 + (P.breath || 0);
    head.rotation.set(P.headX || 0, P.headY || 0, P.headZ || 0);
    const set = (a, v, sd) => { a.S.rotation.set(-(v[0] || 0), 0, sd * (v[1] || 0) + (v[3] || 0) * sd); a.E.rotation.set(-(v[2] || 0), 0, 0); };
    set(arms[0], P.L || [0, 0.12, 0.1], -1); set(arms[1], P.R || [0, 0.12, 0.1], 1);
  };
  T.faceSet = (p) => { drawFace(g, o, p); ft.needsUpdate = true; };
  T.pose({}); T.faceSet({});
  return T;
}

// ── foule : instances (InstancedMesh), chacun sa couleur et son décalage d'animation ──
export function makeCrowd(S, seats, opts) {
  const n = seats.length;
  const skins = ["#6b3f26", "#7c4a2d", "#5a341f", "#8a5634", "#4f2e1c", "#94603a"];
  const tops = ["#e95f3c", "#3a7bd5", "#f2c14e", "#e86aa6", "#3fb37f", "#ffffff", "#9b59b6", "#f39c3d", "#2ec4b6", "#d94848", "#5c6bc0", "#7cb342"];
  const torsoG = new THREE.CapsuleGeometry(0.17, 0.3, 3, 10).scale(1, 1, 0.78).translate(0, 0.26, 0);
  const legsSeat = mergeGeoms([new THREE.CylinderGeometry(0.07, 0.07, 0.42, 6).rotateX(Math.PI / 2).translate(-0.09, 0, 0.2), new THREE.CylinderGeometry(0.07, 0.07, 0.42, 6).rotateX(Math.PI / 2).translate(0.09, 0, 0.2),
    new THREE.CylinderGeometry(0.06, 0.06, 0.42, 6).translate(-0.09, -0.24, 0.38), new THREE.CylinderGeometry(0.06, 0.06, 0.42, 6).translate(0.09, -0.24, 0.38)]);
  const legsStand = mergeGeoms([new THREE.CylinderGeometry(0.07, 0.07, 0.74, 6).translate(-0.09, -0.37, 0), new THREE.CylinderGeometry(0.07, 0.07, 0.74, 6).translate(0.09, -0.37, 0)]);
  const headG = new THREE.SphereGeometry(0.2, 16, 10);
  const faceG = new THREE.SphereGeometry(0.202, 12, 8, Math.PI / 2 - 1.2, 2.4, 0.2 * Math.PI, 0.6 * Math.PI);
  const hairG = new THREE.SphereGeometry(0.212, 14, 5, 0, Math.PI * 2, 0, 0.4 * Math.PI).rotateX(-0.25);
  const armG = new THREE.CylinderGeometry(0.055, 0.05, 0.5, 6, 1, true).translate(0, -0.25, 0);
  const handG = new THREE.SphereGeometry(0.058, 7, 5);
  const mk = (geo, m, count, cs = true) => { const im = new THREE.InstancedMesh(geo, m, count); im.castShadow = cs; im.receiveShadow = true; im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); S.add(im); return im; };
  const faceTex = (closed) => { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, 256, 256);
    g.fillStyle = "#1a0d06"; g.strokeStyle = "#1a0d06"; g.lineCap = "round";
    for (const s of [-1, 1]) { if (closed) { g.lineWidth = 7; g.beginPath(); g.arc(128 + s * 40, 120, 14, 0.2, Math.PI - 0.2); g.stroke(); } else { g.beginPath(); g.ellipse(128 + s * 40, 124, 12, 15, 0, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(128 + s * 40 - 4, 119, 4, 0, 7); g.fill(); g.fillStyle = "#1a0d06"; }
      g.lineWidth = 6; g.beginPath(); g.moveTo(128 + s * 24, 92); g.lineTo(128 + s * 58, 90); g.stroke(); }
    g.lineWidth = 6; g.beginPath(); g.arc(128, 168, 22, 0.35, Math.PI - 0.35); g.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const M = { torso: mk(torsoG, mat("#fff", { roughness: 0.75 }), n), lseat: mk(legsSeat, mat("#fff", { roughness: 0.8 }), n), lstand: mk(legsStand, mat("#fff", { roughness: 0.8 }), n),
    head: mk(headG, mat("#fff", { roughness: 0.55 }), n), face: mk(faceG, new THREE.MeshStandardMaterial({ map: faceTex(false), roughness: 0.55 }), n, false),
    faceC: mk(faceG, new THREE.MeshStandardMaterial({ map: faceTex(true), roughness: 0.55 }), n, false), hair: mk(hairG, mat("#fff", { roughness: 0.9 }), n, false),
    arm: mk(armG, mat("#fff", { roughness: 0.75 }), n * 2), hand: mk(handG, mat("#fff", { roughness: 0.55 }), n * 2, false) };
  const P = seats.map(([x, z, ry], i) => {
    const skin = new THREE.Color(skins[(rnd() * skins.length) | 0]), top = new THREE.Color(tops[(rnd() * tops.length) | 0]), bot = new THREE.Color(["#2b2b33", "#3b4a6b", "#5b4636", "#1f2f4f", "#6b6b6b"][(rnd() * 5) | 0]);
    const wrap = rnd() < 0.45, hair = wrap ? new THREE.Color(tops[(rnd() * tops.length) | 0]) : new THREE.Color("#1a120c");
    const faceTint = skin.clone();
    M.torso.setColorAt(i, top); M.lseat.setColorAt(i, bot); M.lstand.setColorAt(i, bot); M.head.setColorAt(i, skin); M.face.setColorAt(i, faceTint); M.faceC.setColorAt(i, faceTint); M.hair.setColorAt(i, hair);
    for (const k of [0, 1]) { M.arm.setColorAt(i * 2 + k, top); M.hand.setColorAt(i * 2 + k, skin); }
    return { x, z: z + 0.02, ry: Math.PI + ry, ph: rnd() * 6.28, sp: 0.8 + rnd() * 0.5, sc: 0.92 + rnd() * 0.14, k: rnd(), wrap };
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), base = new THREE.Matrix4(), loc = new THREE.Matrix4(), tmp = new THREE.Matrix4(), hp = new THREE.Vector3();
  const ZERO = new THREE.Vector3(0, 0, 0);
  const put = (im, i, mtx) => im.setMatrixAt(i, mtx);
  const hide = (im, i) => { m4.compose(v.set(0, -50, 0), q.identity(), ZERO.clone().addScalar(0.0001)); im.setMatrixAt(i, m4); };
  // st = { bow, laugh, amen, clap, stand, wipe, nod, closed, look:[x,y,z] } (chaque valeur 0..1) ; skip = indices remplacés par des personnages détaillés
  return {
    P, M, update(t, st, skip) {
      P.forEach((p, i) => {
        if (skip && skip.has(i)) { for (const im of [M.torso, M.lseat, M.lstand, M.head, M.face, M.faceC, M.hair]) hide(im, i); for (const k of [0, 1]) { hide(M.arm, i * 2 + k); hide(M.hand, i * 2 + k); } return; }
        const ap = st.appear === undefined ? 1 : Math.max(0, Math.min(1, (st.appear - 0.3 - p.k * 2.6) / 0.45)); const k = p.k, w = (a) => Math.max(0, Math.min(1, a * 1.6 - k * 0.6));
        const stand = w(st.stand || 0), amen = (st.amen || 0) * (k < 0.55 ? 1 : 0.15), clap = Math.max(st.clap || 0, stand), bow = w(st.bow || 0), laugh = w(st.laugh || 0), wipe = (st.wipe || 0) * (k > 0.82 ? 1 : 0);
        const by = 0.48 + 0.26 * stand + 0.03 * laugh * Math.abs(Math.sin(t * 9 + p.ph));
        base.compose(v.set(p.x, 0, p.z), q.setFromEuler(e.set(0, p.ry, 0)), sc.setScalar(p.sc * (ap < 1 ? 0.0001 + ap * (1 + 0.35 * Math.sin(ap * Math.PI)) : 1)));
        const breath = 0.012 * Math.sin(t * 1.7 * p.sp + p.ph);
        const lean = -0.1 + 0.35 * bow - 0.12 * laugh * (0.5 + 0.5 * Math.sin(t * 7 + p.ph)) + 0.05 * Math.sin(t * 0.4 + p.ph);
        loc.compose(v.set(0, by, 0), q.setFromEuler(e.set(lean, 0.06 * Math.sin(t * 0.3 + p.ph * 2), 0)), sc.set(1, 1 + breath, 1));
        const body = tmp.multiplyMatrices(base, loc).clone(); put(M.torso, i, body);
        m4.multiplyMatrices(base, loc.compose(v.set(0, by, 0), q.identity(), sc.set(1, 1, 1)));
        if (stand > 0.5) { put(M.lstand, i, m4); hide(M.lseat, i); } else { put(M.lseat, i, m4); hide(M.lstand, i); }
        const nod = (st.nod || 0) * 0.12 * Math.max(0, Math.sin(t * 2.2 + p.ph * 3)) + 0.03 * Math.sin(t * 0.7 + p.ph);
        const hx = 0.45 * bow + nod - 0.3 * laugh * (0.5 + 0.5 * Math.sin(t * 7 + p.ph)) + 0.15 * wipe, hy = 0.15 * Math.sin(t * 0.25 + p.ph * 5) * (1 - bow);
        const H = new THREE.Matrix4().multiplyMatrices(body, new THREE.Matrix4().compose(v.set(0, 0.72, 0), q.setFromEuler(e.set(hx, hy, 0.04 * Math.sin(t * 0.5 + p.ph))), sc.set(1, 1, 1)));
        put(M.head, i, H); hp.setFromMatrixPosition(H);
        const closed = (st.closed || 0) > k || bow > 0.6 || (Math.sin(t * 2.9 + p.ph * 7) > 0.985);
        if (closed) { put(M.faceC, i, H); hide(M.face, i); } else { put(M.face, i, H); hide(M.faceC, i); }
        if (p.wrap) put(M.hair, i, H.clone().multiply(new THREE.Matrix4().makeScale(1.08, 1.15, 1.08))); else put(M.hair, i, H);
        for (const sd of [0, 1]) {
          const sgn = sd ? 1 : -1;
          let ax = 0.35, az = 0.1, len = 1;           // au repos : mains sur les genoux
          const cl = clap * (0.5 + 0.5 * Math.sin(t * 13 + p.ph)) ;
          if (clap > 0.05) { ax = 1.25 * clap + 0.35 * (1 - clap); az = (0.1 + 0.32 * (1 - cl)) * clap - 0.25 * clap + 0.1; }
          if (amen > 0.05 && (sd === 1 || k < 0.3)) { ax = ax * (1 - amen) + 2.7 * amen; az = 0.25 * amen + az * (1 - amen); }
          if (wipe > 0.05 && sd === 1) { ax = 2.2 * wipe + ax * (1 - wipe); az = -0.55 * wipe; len = 1 - 0.3 * wipe; }
          const A = new THREE.Matrix4().multiplyMatrices(body, new THREE.Matrix4().compose(v.set(sgn * 0.215, 0.44, 0), q.setFromEuler(e.set(-ax, 0, sgn * az)), sc.set(1, len, 1)));
          put(M.arm, i * 2 + sd, A);
          const hand = new THREE.Vector3(0, -0.5, 0).applyMatrix4(A); m4.compose(hand, q.identity(), sc.setScalar(p.sc * Math.min(1, ap))); put(M.hand, i * 2 + sd, m4);
        }
      });
      for (const im of Object.values(M)) im.instanceMatrix.needsUpdate = true;
    },
  };
}
