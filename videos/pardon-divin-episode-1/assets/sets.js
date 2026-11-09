// Décors réutilisables de la série (toon 3D). Chaque décor est un groupe placé loin des autres ; update(t, k) l'anime.
import * as THREE from "three";
import { tm, mesh, sph, cyl, cap, outline, tree, palm, bush, cloud, flowers, canvasTex, makeChar, rnd, setSeed, INK } from "./toon.js";

export const SETS = {};
const box = (w, h, d, c, o = {}) => mesh(new THREE.BoxGeometry(w, h, d), c, o);
function ground(parent, w, d, color, o = {}) { const g = mesh(new THREE.PlaneGeometry(w, d, 1, 1), color, { noOl: true, shadow: false, ...o }); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; parent.add(g); return g; }
function water(w, d, c1 = "#3fa7e6", c2 = "#bfe9ff") {
  const m = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, c1: { value: new THREE.Color(c1) }, c2: { value: new THREE.Color(c2) } },
    vertexShader: "varying vec2 vU; uniform float t; void main(){ vU=uv; vec3 p=position; p.z+=0.05*sin(p.x*2.+t*2.)*sin(p.y*1.7+t*1.3); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }",
    fragmentShader: "varying vec2 vU; uniform float t; uniform vec3 c1,c2; void main(){ float w=sin(vU.x*60.+sin(vU.y*20.+t)*3.+t*1.5)*sin(vU.y*45.-t*1.2); float s=smoothstep(.82,.95,w); vec3 c=mix(c1*vec3(.9,.95,1.),c1,vU.y); gl_FragColor=vec4(mix(c,c2,s),1.);\n#include <colorspace_fragment>\n}" });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 40, 40), m); g.rotation.x = -Math.PI / 2; g.userData.noOl = true; g.receiveShadow = true; return g;
}
export function sky(radius = 300) {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color("#5EB8F2") }, bot: { value: new THREE.Color("#E3F5FB") }, k: { value: 1 } },
    vertexShader: "varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec3 vP; uniform vec3 top,bot; uniform float k; void main(){ float h=clamp(vP.y*1.6+.15,0.,1.); gl_FragColor=vec4(mix(bot,top,pow(h,.8))*k,1.);\n#include <colorspace_fragment>\n}" });
  const s = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), m); s.userData.noOl = true; s.renderOrder = -10; return s;
}
const windowsTex = (wall) => canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = wall; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) { const x = 22 + c * 78, y = 26 + r * 70;
    g.fillStyle = "#9ad3ef"; g.fillRect(x, y, 56, 46); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(x, y, 56, 46); g.beginPath(); g.moveTo(x + 28, y); g.lineTo(x + 28, y + 46); g.stroke();
    g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(x + 4, y + 4, 12, 18); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 4, y + 54); g.lineTo(x + 60, y + 54); g.stroke(); }
});
const signTex = (txt) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#2f63c9"; g.fillRect(0, 0, w, h); g.strokeStyle = INK; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = "#fff"; g.font = "900 70px Nunito, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h / 2 + 4); });

// ── 1. Rue lumineuse de Douala ─────────────────────────────────────────
function douala() {
  setSeed(5); const G = new THREE.Group(); G.position.set(0, 0, 0);
  ground(G, 80, 60, "#9c9c9c");
  const road = mesh(new THREE.PlaneGeometry(80, 6), tm("#7b7b80"), { noOl: true }); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, 0); G.add(road);
  for (let i = -20; i < 20; i++) { const l = mesh(new THREE.PlaneGeometry(1.2, 0.18), tm("#f4f4f4"), { noOl: true }); l.rotation.x = -Math.PI / 2; l.position.set(i * 2, 0.02, 0); G.add(l); }
  const walk = box(80, 0.2, 3, "#d9d2c3", { noOl: true }); walk.position.set(0, 0.1, -4.5); G.add(walk);
  const walk2 = box(80, 0.2, 3, "#d9d2c3", { noOl: true }); walk2.position.set(0, 0.1, 4.5); G.add(walk2);
  const cols = ["#F4D58D", "#EF8E6A", "#F7F1E3", "#9BC7A5", "#F4D58D", "#EF8E6A", "#F7F1E3"];
  for (let i = 0; i < 9; i++) { const h = 6 + rnd() * 6, w = 4.2, x = -18 + i * 4.6;
    const b = box(w, h, 4, tm("#ffffff", { map: windowsTex(cols[i % cols.length]) }), { pos: [x, h / 2, -8.5] }); G.add(b);
    box(w + 0.3, 0.3, 4.3, "#e9e1cf", { pos: [x, h + 0.15, -8.5], parent: G });
    if (i === 4) { const s = mesh(new THREE.PlaneGeometry(3, 0.75), tm("#ffffff", { map: signTex("MIDIGRAD") }), { pos: [x, h + 0.9, -6.45], parent: G }); s.userData.noOl = true; box(3.1, 0.85, 0.1, INK, { pos: [x, h + 0.9, -6.52], parent: G }); }
  }
  for (const x of [-12, -4, 5, 13]) { const p = palm(4.2); p.position.set(x, 0.2, -5.6); G.add(p); }
  const clouds = []; for (let i = 0; i < 5; i++) { const c = cloud(1.6 + rnd()); c.position.set(-20 + i * 9, 13 + rnd() * 4, -22); G.add(c); clouds.push(c); }
  // passants
  const pass = [makeChar({ skin: "#6b4128", hair: "crepu", top: "#f39c3d", bottom: "#2b3a5c", scale: 0.85 }), makeChar({ skin: "#7d4b2d", hair: "long", top: "#8e4ec6", robe: true, scale: 0.9 })];
  pass[0].root.position.set(-3.5, 0.2, -4.2); pass[1].root.position.set(3.8, 0.2, -4.4); pass.forEach((p) => G.add(p.root));
  G.userData.update = (t) => { clouds.forEach((c, i) => (c.position.x = -20 + i * 9 + ((t * 0.3) % 9))); pass[0].root.position.x = -3.5 + Math.sin(t * 0.2) * 2; pass[0].pose({ walk: t * 6 }); pass[1].pose({ R: [0.4, 0.2, 0.6] }); pass[0].faceSet({ smile: 0.5 }); pass[1].faceSet({ smile: 0.6, lid: 0.1 }); };
  G.userData.cam = { pos: [0, 2.0, 7.5], tgt: [0, 1.5, 0] };
  return G;
}

// ── 2. Création : ciel étoilé → lumière → mer, arbres, animaux ──────────
export function lion() { const g = new THREE.Group();
  mesh(cap(0.32, 0.6, 14), tm("#e3a64b"), { rot: [0, 0, Math.PI / 2], pos: [0, 0.55, 0], parent: g });
  for (const [x, z] of [[-0.35, -0.18], [-0.35, 0.18], [0.35, -0.18], [0.35, 0.18]]) mesh(cap(0.09, 0.32), tm("#e3a64b"), { pos: [x, 0.25, z], parent: g });
  const head = new THREE.Group(); head.position.set(0.62, 0.85, 0); g.add(head);
  mesh(sph(0.42, 16), tm("#b8662a"), { parent: head, scale: [0.8, 1, 1] });
  mesh(sph(0.27, 16), tm("#e9b25a"), { pos: [0.16, 0, 0], parent: head });
  for (const s of [-1, 1]) { mesh(sph(0.055, 8), tm("#ffffff"), { pos: [0.36, 0.08, s * 0.1], parent: head, ol: 0.01 }); mesh(sph(0.028, 6), tm(INK), { pos: [0.4, 0.08, s * 0.1], parent: head, noOl: true }); }
  mesh(sph(0.05, 8), tm(INK), { pos: [0.43, -0.03, 0], parent: head, noOl: true });
  mesh(cap(0.04, 0.5, 6), tm("#e3a64b"), { pos: [-0.7, 0.75, 0], rot: [0, 0, 0.9], parent: g });
  g.userData.head = head; return outline(g, 0.02); }
export function elephant() { const g = new THREE.Group(), c = "#9ea7b3";
  mesh(sph(0.75, 18), tm(c), { scale: [1.3, 1, 1], pos: [0, 1.15, 0], parent: g });
  for (const [x, z] of [[-0.5, -0.35], [-0.5, 0.35], [0.5, -0.35], [0.5, 0.35]]) mesh(cyl(0.18, 0.2, 0.8), tm(c), { pos: [x, 0.4, z], parent: g });
  const head = new THREE.Group(); head.position.set(0.95, 1.45, 0); g.add(head);
  mesh(sph(0.48, 16), tm(c), { parent: head });
  for (const s of [-1, 1]) { mesh(sph(0.45, 12), tm("#b7bfca"), { scale: [0.25, 1, 0.9], pos: [-0.15, 0.05, s * 0.5], parent: head }); mesh(sph(0.06, 8), tm(INK), { pos: [0.38, 0.12, s * 0.2], parent: head, noOl: true }); }
  const trunk = new THREE.Group(); trunk.position.set(0.42, -0.1, 0); head.add(trunk);
  for (let i = 0; i < 6; i++) mesh(sph(0.15 - i * 0.012, 10), tm(c), { pos: [0.08 + i * 0.05, -i * 0.15, 0], parent: trunk });
  g.userData.trunk = trunk; return outline(g, 0.02); }
export function sheep(s = 1) { const g = new THREE.Group();
  for (let i = 0; i < 7; i++) mesh(sph(0.28, 12), tm("#fbfbf7"), { pos: [(i % 4 - 1.5) * 0.18, 0.6 + (i > 3 ? 0.15 : 0), (i % 2 - 0.5) * 0.18], parent: g });
  for (const [x, z] of [[-0.22, -0.12], [-0.22, 0.12], [0.22, -0.12], [0.22, 0.12]]) mesh(cyl(0.04, 0.04, 0.45), tm("#2a2522"), { pos: [x, 0.22, z], parent: g });
  const h = mesh(sph(0.2, 12), tm("#2a2522"), { pos: [0.42, 0.72, 0], scale: [1.2, 0.9, 0.85], parent: g });
  for (const sd of [-1, 1]) mesh(sph(0.04, 6), tm("#ffffff"), { pos: [0.18, 0.05, sd * 0.09], parent: h, noOl: true });
  g.scale.setScalar(s); return outline(g, 0.02); }
export function bird(c = "#ff6b4a") { const g = new THREE.Group(); mesh(sph(0.12, 10), tm(c), { scale: [1.4, 1, 1], parent: g });
  const w1 = mesh(sph(0.13, 8), tm(c), { scale: [0.6, 0.12, 1.4], pos: [0, 0.05, 0.14], parent: g }), w2 = mesh(sph(0.13, 8), tm(c), { scale: [0.6, 0.12, 1.4], pos: [0, 0.05, -0.14], parent: g });
  mesh(new THREE.ConeGeometry(0.04, 0.1, 6), tm("#ffb23f"), { rot: [0, 0, -Math.PI / 2], pos: [0.2, 0, 0], parent: g }); g.userData.w = [w1, w2]; return outline(g, 0.012); }
export function butterfly(c = "#ffd23f") { const g = new THREE.Group(); const w = [];
  for (const sd of [-1, 1]) { const p = new THREE.Group(); g.add(p); mesh(new THREE.CircleGeometry(0.12, 12), tm(c, { side: THREE.DoubleSide }), { pos: [0, 0, sd * 0.1], rot: [Math.PI / 2, 0, 0], parent: p, ol: 0 }); w.push(p); }
  g.userData.w = w; return g; }
function creation() {
  setSeed(9); const G = new THREE.Group(); G.position.set(200, 0, 0);
  const sea = water(200, 200); sea.position.y = -0.05; G.add(sea);
  const isl = mesh(cyl(9, 10, 1, 40), tm("#6cc04a"), { pos: [0, -0.45, -2] }); isl.userData.noOl = true; G.add(isl);
  const sand = mesh(cyl(10, 10.5, 0.6, 40), tm("#E9CF9E"), { pos: [0, -0.6, -2], noOl: true }); G.add(sand);
  const trees = []; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, r = 4 + rnd() * 3.5; const tr = i % 3 === 0 ? palm(3) : tree({ size: 0.8 + rnd() * 0.4, h: 2 }); tr.position.set(Math.cos(a) * r, 0, -2 + Math.sin(a) * r); G.add(tr); trees.push(tr); }
  const L = lion(), E = elephant(), Sh = sheep(0.9); L.position.set(-2.5, 0, 0.5); L.rotation.y = 0.5; E.position.set(2.8, 0, -1.2); E.rotation.y = 2.4; Sh.position.set(0.3, 0, 1.6); Sh.rotation.y = -1.2; G.add(L, E, Sh);
  const birds = []; for (let i = 0; i < 6; i++) { const b = bird(["#ff6b4a", "#3fa7e6", "#ffd23f"][i % 3]); G.add(b); birds.push(b); }
  const clouds = []; for (let i = 0; i < 6; i++) { const c = cloud(1.8 + rnd()); c.position.set(-25 + i * 10, 12 + rnd() * 5, -30); G.add(c); clouds.push(c); }
  // étoiles (avant la lumière)
  const N = 1500, sp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const a = rnd() * 6.283, b = Math.acos(2 * rnd() - 1), r = 120; sp[i * 3] = r * Math.sin(b) * Math.cos(a); sp[i * 3 + 1] = Math.abs(r * Math.cos(b)); sp[i * 3 + 2] = r * Math.sin(b) * Math.sin(a); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.9, color: "#fff8e0", transparent: true, fog: false })); G.add(stars);
  G.userData = { ...G.userData, sea, trees, L, E, Sh, birds, clouds, stars, cam: { pos: [0, 3, 12], tgt: [0, 1.5, -2] } };
  G.userData.update = (t, k) => {
    // k : { light 0..1, sea 0..1, grow 0..1, animals 0..1 }
    sea.material.uniforms.t.value = t; sea.visible = (k.sea ?? 1) > 0.01; sea.position.y = -0.05 - (1 - (k.sea ?? 1)) * 3;
    isl.scale.setScalar(Math.max(0.001, k.land ?? 1)); sand.scale.setScalar(Math.max(0.001, k.land ?? 1));
    trees.forEach((tr, i) => { const p = THREE.MathUtils.clamp((k.grow ?? 1) * 1.6 - i * 0.07, 0, 1); tr.scale.setScalar(Math.max(0.001, p * (1 + 0.15 * Math.sin(p * Math.PI)))); });
    [L, E, Sh].forEach((a, i) => { const p = THREE.MathUtils.clamp((k.animals ?? 1) * 1.5 - i * 0.25, 0, 1); a.scale.setScalar(Math.max(0.001, p * (1 + 0.25 * Math.sin(p * Math.PI)))); });
    if (L.userData.head) L.userData.head.rotation.z = 0.15 * Math.sin(t * 2) * (k.roar ?? 0);
    E.userData.trunk.rotation.z = 0.5 + 0.3 * Math.sin(t * 2.4);
    birds.forEach((b, i) => { const a = t * 0.5 + i; b.position.set(Math.cos(a) * (6 + i), 5 + i * 0.4 + Math.sin(t * 2 + i) * 0.3, -2 + Math.sin(a) * 5); b.rotation.y = -a; b.userData.w.forEach((w, j) => (w.rotation.x = (j ? 1 : -1) * Math.sin(t * 14 + i) * 0.7)); b.visible = (k.animals ?? 1) > 0.3; });
    clouds.forEach((c, i) => { c.position.x = -25 + i * 10 + ((t * 0.4) % 10); c.visible = (k.light ?? 1) > 0.5; });
    stars.material.opacity = 1 - (k.light ?? 1);
  };
  return G;
}

// ── 3. Jardin d'Éden ───────────────────────────────────────────────────
function eden() {
  setSeed(13); const G = new THREE.Group(); G.position.set(400, 0, 0);
  ground(G, 160, 160, "#6cc04a");
  // collines
  for (let i = 0; i < 7; i++) { const h = mesh(sph(8 + rnd() * 6, 24), tm(i % 2 ? "#5cb243" : "#79c95a"), { pos: [-40 + i * 14, -4, -38 - rnd() * 8], noOl: false, ol: 0.06 }); h.scale.y = 0.6; G.add(h); }
  // rivière + cascade
  const riv = water(4, 70, "#3fa7e6", "#d8f4ff"); riv.position.set(-7, 0.02, -8); riv.rotation.z = 0.25; G.add(riv);
  const cliff = mesh(new THREE.BoxGeometry(10, 7, 4), tm("#8d9aa8"), { pos: [-11, 3.5, -30] }); G.add(cliff);
  const fallM = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 } }, transparent: true,
    vertexShader: "varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec2 vU; uniform float t; void main(){ float s=sin(vU.x*40.)*.5+.5; float f=fract(vU.y*4.+t*1.6+s*.3); vec3 c=mix(vec3(.45,.78,.98),vec3(.92,.98,1.),smoothstep(.6,.95,f)); gl_FragColor=vec4(c,.95);\n#include <colorspace_fragment>\n}" });
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(3, 7), fallM); fall.position.set(-10.2, 3.5, -27.9); fall.userData.noOl = true; G.add(fall);
  const mist = []; for (let i = 0; i < 8; i++) { const m = mesh(sph(0.6, 10), tm("#ffffff", { transparent: true, opacity: 0.55 }), { pos: [-10.2 + (i - 4) * 0.4, 0.3, -27.5], noOl: true, shadow: false }); G.add(m); mist.push(m); }
  // végétation
  const deco = [];
  for (let i = 0; i < 26; i++) { const x = (rnd() - 0.5) * 60, z = -6 - rnd() * 30; if (Math.abs(x) < 6 && z > -16) continue;
    const tr = i % 4 === 0 ? palm(3 + rnd()) : tree({ size: 0.7 + rnd() * 0.6, h: 1.8 + rnd(), fruit: i % 3 === 0 ? "#ff9f1c" : null, nFruit: 5 }); tr.position.set(x, 0, z); G.add(tr); deco.push(tr); }
  for (let i = 0; i < 14; i++) { const b = bush(0.8 + rnd() * 0.7); b.position.set((rnd() - 0.5) * 40, 0, -2 - rnd() * 22); G.add(b); }
  G.add(flowers(420, [-25, 25, -30, 10]));
  // les deux arbres au centre
  const life = tree({ size: 1.55, h: 3.2, leaf: "#ffd84a", leaf2: "#ffbf2a", leafMat: { emissive: "#ffcc33", emissiveIntensity: 0.18 }, fruit: "#fff3b0", fruitMat: { emissive: "#ffe680", emissiveIntensity: 0.8 }, nFruit: 12, trunk: "#b07a3c", thick: 1.3 });
  life.position.set(-3.2, 0, -12); G.add(life);
  const know = tree({ size: 1.6, h: 3.3, fruit: "#e8202a", fruitMat: { emissive: "#ff2a2a", emissiveIntensity: 0.25 }, nFruit: 16, thick: 1.35 }); know.position.set(3.4, 0, -12); G.add(know);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(3.6, 24, 16), new THREE.MeshBasicMaterial({ color: "#ffe9a0", transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(-3.2, 4.4, -12); halo.userData.noOl = true; G.add(halo);
  // animaux en paix
  const L = lion(), Sh = sheep(0.85), E = elephant(); L.position.set(-8, 0, -6); L.rotation.y = 0.4; Sh.position.set(-6.5, 0, -5.4); Sh.rotation.y = 2.6; E.position.set(10, 0, -18); E.rotation.y = 2.2; G.add(L, Sh, E);
  const birds = []; for (let i = 0; i < 5; i++) { const b = bird(["#ff6b4a", "#3fa7e6", "#ffd23f"][i % 3]); G.add(b); birds.push(b); }
  const flies = []; for (let i = 0; i < 9; i++) { const b = butterfly(["#ffd23f", "#ff7ac0", "#7ad7ff"][i % 3]); G.add(b); flies.push(b); }
  const clouds = []; for (let i = 0; i < 6; i++) { const c = cloud(2 + rnd()); c.position.set(-30 + i * 12, 15 + rnd() * 5, -45); G.add(c); clouds.push(c); }
  // buissons-cachette
  const hide = bush(1.6, "#3f9a33"); hide.position.set(-1.2, 0, -5.5); G.add(hide);
  G.userData = { ...G.userData, life, know, halo, L, Sh, E, birds, flies, clouds, riv, fallM, mist, deco, hide, cam: { pos: [0, 3, 8], tgt: [0, 2, -10] } };
  G.userData.update = (t, k) => {
    riv.material.uniforms.t.value = t; fallM.uniforms.t.value = t; mist.forEach((m, i) => { const s = 0.8 + 0.3 * Math.sin(t * 2 + i); m.scale.setScalar(s); });
    halo.material.opacity = 0.07 + 0.03 * Math.sin(t * 1.4); hide.visible = !!k.hide; halo.visible = (k.cold ?? 0) < 0.8;
    know.userData.fruits.forEach((f, i) => f.scale.setScalar(1 + 0.06 * Math.sin(t * 2 + i) + (i === 0 ? (k.fruitBig || 0) * 1.4 : 0)));
    birds.forEach((b, i) => { const a = t * 0.35 + i * 1.3; b.position.set(Math.cos(a) * (10 + i), 6 + i * 0.5, -12 + Math.sin(a) * 6); b.rotation.y = -a; b.userData.w.forEach((w, j) => (w.rotation.x = (j ? 1 : -1) * Math.sin(t * 14 + i) * 0.7)); b.visible = (k.cold ?? 0) < 0.5; });
    flies.forEach((f, i) => { f.position.set(Math.sin(t * 0.5 + i * 2) * (3 + i % 4) - 1, 1 + 0.6 * Math.sin(t * 1.3 + i) + (i % 3) * 0.4, -6 - (i % 5) * 2 + Math.cos(t * 0.4 + i) * 2); f.userData.w.forEach((w, j) => (w.rotation.x = (j ? 1 : -1) * (0.3 + 0.9 * Math.abs(Math.sin(t * 12 + i))))); f.visible = (k.cold ?? 0) < 0.5; });
    clouds.forEach((c, i) => (c.position.x = -30 + i * 12 + ((t * 0.3) % 12)));
    L.userData.head.rotation.z = 0.05 * Math.sin(t * 0.8);
  };
  return G;
}

// ── 4. Ronces (conséquences), porte du jardin, générations ──────────────
function thorns() {
  setSeed(17); const G = new THREE.Group(); G.position.set(600, 0, 0);
  ground(G, 120, 120, "#b89564");
  for (let i = 0; i < 30; i++) { const g = new THREE.Group(); for (let j = 0; j < 6; j++) { const s = mesh(cyl(0.02, 0.05, 0.9, 5), tm("#5b4a2e"), { rot: [rnd() - 0.5, 0, rnd() * 2 - 1], pos: [0, 0.35, 0], parent: g }); for (let q = 0; q < 3; q++) mesh(new THREE.ConeGeometry(0.03, 0.12, 4), tm("#3e3220"), { pos: [0.05, -0.2 + q * 0.2, 0], rot: [0, 0, -1.2], parent: s }); }
    g.position.set((rnd() - 0.5) * 24, 0, -2 - rnd() * 18); outline(g, 0.012); G.add(g); }
  for (let i = 0; i < 5; i++) { const r = mesh(sph(0.8 + rnd(), 10), tm("#8d7f6c"), { pos: [(rnd() - 0.5) * 20, 0.2, -6 - rnd() * 14], scale: [1.3, 0.6, 1] }); G.add(r); }
  // porte du jardin (arche de verdure) + chérubins + épée flamboyante
  const gate = new THREE.Group(); gate.position.set(0, 0, -16); G.add(gate);
  for (const s of [-1, 1]) { mesh(cyl(0.5, 0.6, 5, 12), tm("#7d5a3a"), { pos: [s * 2.6, 2.5, 0], parent: gate }); for (let i = 0; i < 5; i++) mesh(sph(1.0, 14), tm(i % 2 ? "#4ea83b" : "#5fbf55"), { pos: [s * (2.6 - i * 0.55), 5 + Math.sin(i) * 0.4, 0], parent: gate }); }
  const behind = mesh(new THREE.PlaneGeometry(4.4, 4.6), tm("#9be37a", { emissive: "#c9ff9a", emissiveIntensity: 0.15 }), { pos: [0, 2.3, -0.3], parent: gate, noOl: true });
  outline(gate, 0.03);
  const cher = []; for (const s of [-1, 1]) { const c = new THREE.Group(); c.position.set(s * 3.9, 0, 0.6);
    const bodyM = tm("#fff6d8", { emissive: "#ffe9a8", emissiveIntensity: 0.9 });
    mesh(cyl(0.25, 0.45, 1.6, 14), bodyM, { pos: [0, 1.0, 0], parent: c }); mesh(sph(0.3, 16), bodyM, { pos: [0, 2.05, 0], parent: c });
    for (const w of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(w * 0.25, 1.6, -0.1); c.add(wg); for (let f = 0; f < 4; f++) mesh(sph(0.5, 10), tm("#ffffff", { emissive: "#fff2c4", emissiveIntensity: 1 }), { scale: [0.25, 1.1 - f * 0.18, 0.5], pos: [w * (0.25 + f * 0.22), 0.25 + f * 0.12, 0], rot: [0, 0, w * (0.5 + f * 0.15)], parent: wg }); c.userData["w" + w] = wg; }
    outline(c, 0.02); gate.add(c); cher.push(c); }
  const sword = new THREE.Group(); sword.position.set(0, 3.0, 0.8); gate.add(sword);
  mesh(new THREE.BoxGeometry(0.12, 2.2, 0.04), tm("#e8eef5", { emissive: "#ffb347", emissiveIntensity: 0.6 }), { parent: sword }); mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), tm("#d4a62a"), { pos: [0, -1.1, 0], parent: sword });
  outline(sword, 0.015);
  // générations : foule de petits personnages
  const crowd = new THREE.Group(); crowd.position.set(0, 0, 30); G.add(crowd); const people = [];
  const skins = ["#5b3a24", "#7d4b2d", "#9a6239", "#a8693f", "#6b4128"], tops = ["#e95f3c", "#3a7bd5", "#f2c14e", "#e86aa6", "#3fb37f", "#9b59b6", "#f39c3d"];
  for (let i = 0; i < 36; i++) { const p = makeChar({ skin: skins[i % 5], hair: i % 3 ? "crepu" : "long", top: tops[i % 7], robe: i % 2 === 0, scale: 0.55 }); p.root.position.set((i % 9 - 4) * 1.2 + (rnd() - 0.5) * 0.3, 0, -Math.floor(i / 9) * 1.6 + (rnd() - 0.5) * 0.3); p.root.rotation.y = (rnd() - 0.5) * 0.4; crowd.add(p.root); people.push(p); }
  const shadowM = new THREE.MeshBasicMaterial({ color: "#1b1630", transparent: true, opacity: 0, depthWrite: false }); const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), shadowM); shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.03, 26); shadow.userData.noOl = true; G.add(shadow);
  G.userData = { ...G.userData, gate, cher, sword, crowd, people, shadow, cam: { pos: [0, 2.5, 6], tgt: [0, 1.5, -8] } };
  G.userData.update = (t, k) => {
    cher.forEach((c, i) => { c.position.y = 0.1 * Math.sin(t * 1.5 + i); c.userData["w-1"].rotation.z = 0.15 * Math.sin(t * 3); c.userData.w1.rotation.z = -0.15 * Math.sin(t * 3); });
    sword.rotation.z = 0.08 * Math.sin(t * 1.2);
    shadowM.opacity = 0.55 * (k.shadow ?? 0); shadow.scale.setScalar(0.1 + 12 * (k.shadow ?? 0));
    people.forEach((p, i) => { const f = THREE.MathUtils.clamp((k.shadow ?? 0) * 1.4 - (Math.floor(i / 9)) * 0.12, 0, 1); p.pose({ hx: 0.35 * f, breath: 0.012 * Math.sin(t * 1.6 + i) }); p.faceSet({ smile: 0.4 - 0.9 * f, bi: 0.7 * f, lid: 0.15 + 0.2 * f, ly: 0.4 * f }); });
  };
  return G;
}

// ── 5. Plans du teaser de l'épisode 2 ──────────────────────────────────
function teaser() {
  setSeed(23); const G = new THREE.Group(); G.position.set(800, 0, 0);
  ground(G, 140, 140, "#d9c08a");
  // autel d'Abel (x = -30)
  const altar = new THREE.Group(); altar.position.set(-30, 0, 0); G.add(altar);
  for (let i = 0; i < 9; i++) mesh(sph(0.45, 8), tm(i % 2 ? "#9a8f80" : "#857a6c"), { pos: [(i % 3 - 1) * 0.7, 0.35 + Math.floor(i / 3) * 0.45, (i % 2 - 0.5) * 0.3], scale: [1.1, 0.7, 1], parent: altar });
  outline(altar, 0.02);
  // arche de Noé (x = 0)
  const ark = new THREE.Group(); ark.position.set(0, 0, 0); G.add(ark);
  const sea = water(60, 60, "#2f8fd6", "#cfefff"); sea.position.set(0, 0.3, 0); ark.add(sea);
  mesh(new THREE.BoxGeometry(6, 1.6, 2.2), tm("#8a5a32"), { pos: [0, 1.3, 0], parent: ark }); mesh(new THREE.BoxGeometry(3.4, 1.2, 1.8), tm("#a77a4a"), { pos: [0, 2.6, 0], parent: ark }); mesh(new THREE.ConeGeometry(2.2, 0.9, 4), tm("#6e4426"), { pos: [0, 3.6, 0], rot: [0, Math.PI / 4, 0], scale: [1.2, 1, 0.6], parent: ark });
  outline(ark, 0.03);
  // Abraham sur la montagne (x = 30)
  const mnt = new THREE.Group(); mnt.position.set(30, 0, -6); G.add(mnt);
  mesh(new THREE.ConeGeometry(7, 7, 7), tm("#a68a64"), { pos: [0, 3.5, 0], parent: mnt });
  const ab = makeChar({ skin: "#8a5a36", hair: "court", hairColor: "#dcdcdc", beard: "#e8e8e8", top: "#c9a46a", robe: true, scale: 0.7 }); ab.root.position.set(0, 6.95, 0.3); mnt.add(ab.root);
  outline(mnt, 0.03);
  // porte marquée en Égypte (x = 60)
  const door = new THREE.Group(); door.position.set(60, 0, 0); G.add(door);
  mesh(new THREE.BoxGeometry(6, 4, 3), tm("#e2c48e"), { pos: [0, 2, -1.5], parent: door });
  mesh(new THREE.BoxGeometry(1.4, 2.4, 0.1), tm("#6e4426"), { pos: [0, 1.2, 0.02], parent: door });
  mesh(new THREE.BoxGeometry(1.8, 0.18, 0.12), tm("#b0262c"), { pos: [0, 2.5, 0.05], parent: door });
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.16, 2.5, 0.12), tm("#b0262c"), { pos: [s * 0.82, 1.25, 0.05], parent: door });
  outline(door, 0.03);
  G.userData = { ...G.userData, altar, ark, sea, ab, door, cam: { pos: [-30, 2, 6], tgt: [-30, 1, 0] } };
  G.userData.update = (t) => { sea.material.uniforms.t.value = t; ark.children[1] && (ark.rotation.z = 0.04 * Math.sin(t * 1.2)); ab.pose({ R: [2.6, 0.3, 0.3], L: [2.6, 0.3, 0.3] }); ab.faceSet({ smile: 0.3, ly: -0.6 }); };
  return G;
}

export function buildSets(S) {
  for (const [k, f] of Object.entries({ douala, creation, eden, thorns, teaser })) { SETS[k] = f(); S.add(SETS[k]); }
  return SETS;
}
