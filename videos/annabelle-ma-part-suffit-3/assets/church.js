// Église MIDIGRAD en diorama 3D « jouet » (d'après les 3 photos de photos-eglise/, lieu seulement).
// Repère : mètres ; x vers la droite (vu depuis la salle), y vers le haut, z vers le fond de la salle (l'estrade est en z < 0).
import * as THREE from "three";
import { RoundedBoxGeometry } from "./lib/jsm/RoundedBoxGeometry.js";

export const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0, ...o });
export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
let seed = 7; export const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ── Textures procédurales ───────────────────────────────────────────────
export const TEX = {};
function makeTextures(logo) {
  TEX.concrete = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#8f9192"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const v = 120 + rnd() * 40 | 0; g.fillStyle = `rgba(${v},${v},${v + 3},.25)`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
    g.strokeStyle = "rgba(60,60,60,.18)"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rnd() - .5) * 80; y += (rnd() - .5) * 80; g.lineTo(x, y); } g.stroke(); }
  }, [6, 6]);
  TEX.tile = canvasTex(512, 512, (g, w, h) => {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const v = 228 + rnd() * 14 | 0; const gr = g.createLinearGradient(i * 128, j * 128, i * 128 + 128, j * 128 + 128);
      gr.addColorStop(0, `rgb(${v},${v - 14},${v - 40})`); gr.addColorStop(1, `rgb(${v - 10},${v - 24},${v - 52})`);
      g.fillStyle = gr; g.fillRect(i * 128, j * 128, 128, 128);
      g.fillStyle = "rgba(200,170,120,.25)"; for (let k = 0; k < 40; k++) g.fillRect(i * 128 + rnd() * 128, j * 128 + rnd() * 128, 6, 2);
    }
    g.strokeStyle = "#cdb48c"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); }
  }, [7, 3]);
  TEX.carpet = canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#e9dcc0"; g.fillRect(0, 0, w, h); g.fillStyle = "#2c4f8f"; g.fillRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#e9dcc0"; g.fillRect(26, 26, w - 52, h - 52); g.fillStyle = "#3d64a8"; g.fillRect(34, 34, w - 68, h - 68);
    const med = (x, y, r) => { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? "#2c4f8f" : "#efe3c8"; g.beginPath(); for (let a = 0; a < 16; a++) { const rr = (r - k * r / 4) * (a % 2 ? 0.78 : 1); g.lineTo(x + Math.cos(a * Math.PI / 8) * rr, y + Math.sin(a * Math.PI / 8) * rr); } g.fill(); } };
    med(w / 2, h / 2, 80); med(100, h / 2, 44); med(w - 100, h / 2, 44);
    g.fillStyle = "#efe3c8"; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(44 + i * 24.5, 40, 4, 0, 7); g.arc(44 + i * 24.5, h - 40, 4, 0, 7); g.fill(); }
  });
  const fabric = (bg, fg, leaf) => canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = rnd() * h, s = 10 + rnd() * 16, a = rnd() * 6.3; g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = fg;
      if (leaf) { g.beginPath(); g.ellipse(0, 0, s * 1.6, s * 0.55, 0, 0, 7); g.fill(); g.strokeStyle = bg; g.lineWidth = 2; g.beginPath(); g.moveTo(-s * 1.5, 0); g.lineTo(s * 1.5, 0); g.stroke(); }
      else { for (let p = 0; p < 5; p++) { g.rotate(1.2566); g.beginPath(); g.ellipse(s * 0.7, 0, s * 0.7, s * 0.35, 0, 0, 7); g.fill(); } g.fillStyle = "#f3d36b"; g.beginPath(); g.arc(0, 0, s * 0.3, 0, 7); g.fill(); }
      g.restore();
    }
  }, [2, 2]);
  TEX.leaf = fabric("#2457b8", "#f4f7ff", true);
  TEX.flower = fabric("#2a5cc4", "#ffffff", false);
  TEX.ceiling = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#9fd2ec"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#f6ecd2"; for (let i = 0; i < 26; i++) { const x = rnd() * w, y = rnd() * h, s = 30 + rnd() * 40; g.save(); g.translate(x, y); g.rotate(rnd() * 6.3);
      g.beginPath(); g.ellipse(0, 0, s * 1.6, s * 0.5, 0, 0, 7); g.ellipse(s * 0.9, -s * 0.2, s * 0.8, s * 0.42, 0.4, 0, 7); g.ellipse(-s * 0.9, s * 0.15, s * 0.7, s * 0.35, -0.3, 0, 7); g.fill(); g.restore(); }
    for (const [x, y] of [[260, 300], [760, 280], [520, 720], [200, 820], [860, 760]]) {
      g.strokeStyle = "#f8e7b0"; g.lineWidth = 6; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.moveTo(x + Math.cos(a) * 40, y + Math.sin(a) * 40); g.lineTo(x + Math.cos(a) * (k % 2 ? 80 : 110), y + Math.sin(a) * (k % 2 ? 80 : 110)); g.stroke(); }
      const gr = g.createRadialGradient(x, y, 0, x, y, 46); gr.addColorStop(0, "#fffbe8"); gr.addColorStop(1, "#f8e1a0"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 40, 0, 7); g.fill();
    }
  });
  TEX.corr = canvasTex(256, 64, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 150 + 60 * Math.sin(x / w * Math.PI * 16) | 0; g.fillStyle = `rgb(${v},${v + 6},${v + 10})`; g.fillRect(x, 0, 1, h); } }, [8, 1]);
  TEX.slat = canvasTex(256, 256, (g, w, h) => { for (let x = 0; x < w; x++) { const s = (x % 32) / 32; const v = s < 0.12 ? 0.55 : s > 0.88 ? 0.75 : 1; g.fillStyle = `rgb(${232 * v | 0},${112 * v | 0},${48 * v | 0})`; g.fillRect(x, 0, 1, h); } });
  TEX.pagne = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#7a1430"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 32; x < w; x += 64) {
      g.fillStyle = "#d9a737"; g.beginPath(); g.arc(x, y, 20, 0, 7); g.fill(); g.fillStyle = "#7a1430"; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill();
      g.fillStyle = "#f3cf6a"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
      g.strokeStyle = "#c48a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 32, y - 10); g.lineTo(x + 32, y + 10); g.stroke();
    }
  }, [2, 2]);
  TEX.wax = (a, b, c) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.fillStyle = i % 2 ? b : c; g.beginPath(); g.arc(rnd() * w, rnd() * h, 8 + rnd() * 18, 0, 7); g.fill(); } }, [2, 2]);
  TEX.banner = canvasTex(1536, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#2f8f3a"); gr.addColorStop(0.5, "#f2f6ee"); gr.addColorStop(1, "#2a63b8");
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(255,255,255,.75)"; g.fillRect(150, 40, w - 420, h - 80);
    g.fillStyle = "#c62828"; g.font = "900 64px Montserrat, sans-serif"; g.textAlign = "left"; g.fillText("2026", 30, 250);
    g.fillStyle = "#1b3d8f"; g.font = "900 54px Montserrat, sans-serif"; g.textAlign = "center"; g.fillText("Année des Opportunités Divines", 690, 130);
    g.fillStyle = "#d9862a"; g.font = "900 46px Montserrat, sans-serif"; g.fillText("YEAR OF DIVINE OPPORTUNITIES", 690, 200);
    g.fillStyle = "#1b3d8f"; g.font = "800 38px Montserrat, sans-serif"; g.fillText("« Tu es saint, tu es parfait en Christ »", 690, 280);
    if (logo) { g.fillStyle = "#fff"; g.beginPath(); g.arc(w - 150, h / 2, 128, 0, 7); g.fill(); g.drawImage(logo, w - 270, h / 2 - 120, 240, 240); }
  });
  TEX.logo = logo ? canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill(); g.drawImage(logo, 16, 16, 480, 480); }) : null;
}

// ── Construction ────────────────────────────────────────────────────────
export function buildChurch(S, logo) {
  makeTextures(logo);
  const box = (w, h, d, c, r = 0.02) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), c.isMaterial ? c : mat(c)); m.castShadow = m.receiveShadow = true; return m; };
  const at = (m, x, y, z, ry = 0, p = S) => { m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const plane = (w, h, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.receiveShadow = true; return p; };
  const C = { spots: [], fans: [], dust: null, beams: [] };

  // sol de la salle (béton) + bloc de terre du diorama sous le sol
  const fl = plane(20, 22, mat("#ffffff", { map: TEX.concrete, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, 4.5); S.add(fl);
  at(box(20.4, 1.4, 22.4, mat("#a5502c", { roughness: 1 }), 0.05), 0, -0.71, 4.5);
  // estrade : carrelage crème brillant
  const stage = box(13, 0.45, 5.5, mat("#efe4cf", { roughness: 0.6 }), 0.02); at(stage, 0, 0.225, -2.75);
  const st = plane(13, 5.5, new THREE.MeshPhysicalMaterial({ map: TEX.tile, roughness: 0.18, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
  st.rotation.x = -Math.PI / 2; st.position.set(0, 0.452, -2.75); S.add(st);
  at(box(13, 0.06, 0.08, "#c9b48e"), 0, 0.42, 0.0);
  const carpet = plane(3.6, 1.6, mat("#ffffff", { map: TEX.carpet, roughness: 1 })); carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.458, -0.95); S.add(carpet);
  // marche
  at(box(2.4, 0.22, 0.45, "#e8dcc4"), -0.2, 0.11, 0.25);

  // murs blancs + plinthe bleue
  const wallM = mat("#f4f4f1", { roughness: 0.95 }), blue = mat("#2f6fd0");
  const back = plane(20, 6, wallM); back.position.set(0, 3, -5.5); S.add(back);
  for (const sx of [-1, 1]) { const w = plane(22, 6, wallM); w.rotation.y = -sx * Math.PI / 2; w.position.set(sx * 9.6, 3, 4.5); S.add(w); at(box(0.05, 0.32, 22, blue), sx * 9.57, 0.16, 4.5); }
  const rear = plane(20, 6, wallM); rear.rotation.y = Math.PI; rear.position.set(0, 3, 15.5); S.add(rear);
  at(box(20, 0.32, 0.05, blue), 0, 0.16, 15.47);
  // fond de l'estrade : panneaux gris, panneau orange à lattes, rideaux bleus fleuris + voile jaune
  for (let i = 0; i < 6; i++) at(box(1.18, 3.0, 0.06, "#b7bcc4", 0.01), -0.6 + i * 1.22, 1.95, -5.45);
  at(box(1.5, 3.6, 0.1, mat("#ffffff", { map: TEX.slat, roughness: 0.7 }), 0.01), 2.2, 2.25, -5.38);
  for (const [x0, w] of [[-5.6, 2.6], [5.4, 2.2]]) {
    const g = new THREE.PlaneGeometry(w, 3.6, 40, 1), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, 0.09 * Math.sin(p.getX(k) * 9));
    g.computeVertexNormals(); const m = new THREE.Mesh(g, mat("#ffffff", { map: TEX.flower, side: THREE.DoubleSide, roughness: 0.9 })); m.position.set(x0, 2.25, -5.3); m.receiveShadow = true; S.add(m);
    const vg = new THREE.PlaneGeometry(w * 0.55, 3.0, 20, 1), vp = vg.attributes.position; for (let k = 0; k < vp.count; k++) vp.setZ(k, 0.06 * Math.sin(vp.getX(k) * 7 + 1));
    vg.computeVertexNormals(); const veil = new THREE.Mesh(vg, mat("#f6cf3a", { side: THREE.DoubleSide, transparent: true, opacity: 0.85, roughness: 0.6 })); veil.position.set(x0 + w * 0.22, 2.55, -5.2); S.add(veil);
  }
  // bannière 2026 + logo
  const ban = plane(4.6, 1.15, mat("#ffffff", { map: TEX.banner, roughness: 0.7 })); ban.position.set(-1.6, 3.55, -5.36); S.add(ban);

  const TOP = new THREE.Group(); S.add(TOP); C.top = TOP; const atT = (m, x, y, z) => at(m, x, y, z, 0, TOP);
  // plafond blanc avec spots, faux plafond en caisson (bord rose, dessous bleu peint de nuages et soleils)
  const ceilM = mat("#f7f7f4", { roughness: 0.95 });
  const ce = plane(20, 8.5, ceilM); ce.rotation.x = Math.PI / 2; ce.position.set(0, 4.3, -1.25); TOP.add(ce);
  const pink = mat("#f0609a", { roughness: 0.7 });
  const cx0 = 0.4, cz0 = 1.4, cw = 8.4, cd = 7.2;
  atT(box(cw, 0.35, 0.1, pink), cx0, 3.72, cz0 - cd / 2); atT(box(cw, 0.35, 0.1, pink), cx0, 3.72, cz0 + cd / 2);
  atT(box(0.1, 0.35, cd, pink), cx0 - cw / 2, 3.72, cz0); atT(box(0.1, 0.35, cd, pink), cx0 + cw / 2, 3.72, cz0);
  const caisson = plane(cw - 0.1, cd - 0.1, new THREE.MeshStandardMaterial({ map: TEX.ceiling, roughness: 0.9, emissive: "#ffffff", emissiveMap: TEX.ceiling, emissiveIntensity: 0.25 }));
  caisson.rotation.x = Math.PI / 2; caisson.position.set(cx0, 3.56, cz0); TOP.add(caisson);
  atT(box(cw + 0.6, 0.12, cd + 0.6, mat("#ffffff")), cx0, 3.94, cz0);
  // toit en tôle ondulée + poutres en bois au-delà du faux plafond (moitié arrière de la salle)
  const roof = plane(20, 12.5, mat("#ffffff", { map: TEX.corr, roughness: 0.55, metalness: 0.35, side: THREE.DoubleSide }));
  roof.rotation.x = Math.PI / 2 + 0.12; roof.position.set(0, 4.95, 9.3); TOP.add(roof);
  const wood = mat("#8a5a34", { roughness: 0.8 });
  for (let i = 0; i < 6; i++) atT(box(20, 0.16, 0.14, wood), 0, 4.55 + i * 0.12, 3.6 + i * 2.1);
  for (let i = 0; i < 5; i++) atT(box(0.14, 0.16, 12.5, wood), -8 + i * 4, 4.7, 9.4);
  // spots encastrés (lumineux → bokeh)
  const spotM = new THREE.MeshBasicMaterial({ color: "#fff6dc", toneMapped: false });
  const spotG = new THREE.CircleGeometry(0.09, 16);
  const addSpot = (x, y, z) => { const m = new THREE.Mesh(spotG, spotM); m.rotation.x = Math.PI / 2; m.position.set(x, y, z); TOP.add(m); C.spots.push(m.position); };
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) addSpot(cx0 - 3 + i * 2, 3.55, cz0 - 2.2 + j * 2.2);
  for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) addSpot(-7.5 + i * 2.5, 4.29, -4.6 + j * 2.2);
  // poteau blanc
  at(box(0.32, 4.3, 0.32, mat("#f2f2ee")), -4.7, 2.15, 1.7);
  // gros ventilateurs sur pied
  const fanBuild = (x, z, ry) => {
    const g = new THREE.Group(); at(g, x, 0, z, ry);
    at(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 24), mat("#222")), 0, 0.03, 0, 0, g);
    at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 12), mat("#2a2a2a")), 0, 0.78, 0, 0, g);
    const head = new THREE.Group(); at(head, 0, 1.55, 0.05, 0, g);
    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.012, 6, 48), mat("#1d1d1d", { metalness: 0.6, roughness: 0.4 })); head.add(cage);
    for (let k = 0; k < 12; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.01, 1.1, 0.01), mat("#1d1d1d")); sp.rotation.z = k * Math.PI / 12; head.add(sp); }
    const rotor = new THREE.Group(); head.add(rotor); rotor.position.z = -0.08;
    for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12, 0, 1.2), mat("#333", { side: THREE.DoubleSide })); b.rotation.z = k * 2.094; rotor.add(b); }
    at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16), mat("#222")), 0, 0, -0.15, 0, head).rotation.x = Math.PI / 2;
    C.fans.push(rotor); return g;
  };
  fanBuild(-7.6, 3.2, 0.5); fanBuild(7.9, 7.5, -0.6); fanBuild(-7.8, 9.5, 0.7);
  // fenêtres hautes (mur gauche) → rayons de lumière
  const winM = new THREE.MeshBasicMaterial({ color: "#fff3d6", toneMapped: false });
  for (let i = 0; i < 3; i++) { const w = plane(1.2, 0.9, winM); w.rotation.y = Math.PI / 2; w.position.set(-9.58, 3.3, 3 + i * 3.4); S.add(w);
    for (let k = 0; k < 4; k++) at(box(0.04, 0.9, 0.03, "#dfe3e8"), -9.56, 3.3, 3 + i * 3.4 - 0.45 + k * 0.3); }
  // mezzanine au fond de la salle : garde-corps drapé de tissu bleu, rideau satiné blanc, étoile et hexagone bleus, batterie à gauche
  at(box(19, 0.18, 2.6, mat("#e9e9e4")), 0, 2.45, 14.2);
  const drape = new THREE.PlaneGeometry(19, 0.8, 80, 1), dp = drape.attributes.position;
  for (let k = 0; k < dp.count; k++) dp.setZ(k, 0.04 * Math.sin(dp.getX(k) * 5));
  drape.computeVertexNormals(); const dr = new THREE.Mesh(drape, mat("#ffffff", { map: TEX.leaf, side: THREE.DoubleSide })); dr.position.set(0, 2.95, 12.88); dr.rotation.y = Math.PI; S.add(dr);
  const sat = new THREE.PlaneGeometry(19, 1.0, 120, 1), sp2 = sat.attributes.position;
  for (let k = 0; k < sp2.count; k++) sp2.setZ(k, 0.05 * Math.sin(sp2.getX(k) * 8));
  sat.computeVertexNormals(); const sa = new THREE.Mesh(sat, mat("#f4f4f6", { roughness: 0.25, metalness: 0.2, side: THREE.DoubleSide })); sa.position.set(0, 1.85, 12.9); sa.rotation.y = Math.PI; S.add(sa);
  const star = new THREE.Shape(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.22 : 0.5, a = k * Math.PI / 5 + Math.PI / 2; k ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const stM = new THREE.Mesh(new THREE.ShapeGeometry(star), mat("#2f6fd0", { side: THREE.DoubleSide })); stM.position.set(-1.5, 4.0, 15.45); stM.rotation.y = Math.PI; S.add(stM);
  const hex = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 6), mat("#2f6fd0", { side: THREE.DoubleSide })); hex.position.set(2.2, 4.0, 15.45); hex.rotation.y = Math.PI; S.add(hex);
  const sq = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.36, 4, 1, Math.PI / 4), mat("#2f6fd0", { side: THREE.DoubleSide })); sq.position.set(-5.5, 4.0, 15.45); sq.rotation.y = Math.PI; S.add(sq);
  const drum = new THREE.Group(); at(drum, -6.8, 0, 12.6, Math.PI);
  const dm = (r, h, x, y, z, rx = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat("#1b1b1f", { roughness: 0.4 })); m.position.set(x, y, z); m.rotation.x = rx; m.castShadow = true; drum.add(m);
    const sk = new THREE.Mesh(new THREE.CircleGeometry(r * 0.98, 20), mat("#eeeae0")); sk.position.set(x, y + h / 2 + 0.002, z); sk.rotation.x = -Math.PI / 2; if (!rx) drum.add(sk); };
  dm(0.3, 0.4, 0, 0.32, 0, Math.PI / 2); dm(0.16, 0.14, -0.3, 0.6, -0.1); dm(0.16, 0.14, 0.3, 0.62, -0.1); dm(0.2, 0.3, 0.55, 0.4, 0.2);
  for (const [x, y] of [[-0.6, 1.0], [0.75, 1.1]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.01, 24), mat("#c9a23a", { metalness: 0.8, roughness: 0.3 })); c.position.set(x, y, 0); drum.add(c); }

  // pupitres drapés (tissu bleu à feuilles blanches, jupe plissée) + micro col de cygne ; centre de l'estrade vide
  const pulpit = (x, z, ry) => {
    const g = new THREE.Group(); at(g, x, 0.45, z, ry);
    const n = 64, sk = new THREE.CylinderGeometry(0.42, 0.5, 1.0, n, 1, true), p = sk.attributes.position;
    for (let k = 0; k < p.count; k++) { const a = Math.atan2(p.getZ(k), p.getX(k)), r = 1 + 0.05 * Math.sin(a * 22); p.setX(k, p.getX(k) * r); p.setZ(k, p.getZ(k) * r); }
    sk.computeVertexNormals(); const skirt = new THREE.Mesh(sk, mat("#ffffff", { map: TEX.leaf, roughness: 0.9 })); skirt.position.y = 0.5; skirt.castShadow = skirt.receiveShadow = true; g.add(skirt);
    const top = box(0.95, 0.06, 0.62, mat("#ffffff", { map: TEX.leaf }), 0.02); top.position.y = 1.03; top.rotation.x = -0.12; g.add(top);
    const flap = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.18, 32, 1, true), mat("#ffffff", { map: TEX.leaf, side: THREE.DoubleSide })); flap.position.y = 0.95; g.add(flap);
    const bible = box(0.3, 0.05, 0.22, "#5a2d1c", 0.01); bible.position.set(-0.05, 1.08, 0.05); bible.rotation.x = -0.12; g.add(bible);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.36, 1.05, -0.12), new THREE.Vector3(0.38, 1.2, -0.12), new THREE.Vector3(0.36, 1.28, -0.24), new THREE.Vector3(0.3, 1.29, -0.33)]);
    const neck = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.008, 6), mat("#111", { metalness: 0.7, roughness: 0.35 })); g.add(neck);
    const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.05, 4, 8), mat("#0d0d0d", { metalness: 0.5, roughness: 0.3 })); mic.position.set(0.28, 1.295, -0.36); mic.rotation.x = -1.4; mic.rotation.z = 0.4; g.add(mic);
    return g;
  };
  C.pulpitA = pulpit(-2.7, -1.3, 0.25); C.pulpitB = pulpit(2.7, -1.3, -0.25);

  // table des pasteurs (bord de l'estrade, côté droit) : tissu bleu, jupe plissée gris-vert, trois sièges, bouquet
  const T = new THREE.Group(); at(T, 6.9, 0, 1.6, -Math.PI / 2 + 0.45); C.table = T;
  const tt = box(2.4, 0.06, 0.8, mat("#2350b0", { roughness: 0.8 }), 0.02); tt.position.y = 0.78; T.add(tt);
  const tsk = new THREE.BoxGeometry(2.42, 0.74, 0.82, 60, 1, 1), tp = tsk.attributes.position;
  for (let k = 0; k < tp.count; k++) { const x = tp.getX(k), z = tp.getZ(k); if (Math.abs(z) > 0.4) tp.setZ(k, z + 0.025 * Math.sin(x * 40)); if (Math.abs(x) > 1.2) tp.setX(k, x + 0.025 * Math.sin(z * 40)); }
  tsk.computeVertexNormals(); const tskirt = new THREE.Mesh(tsk, mat("#7f8f86", { roughness: 0.6 })); tskirt.position.y = 0.38; tskirt.castShadow = tskirt.receiveShadow = true; T.add(tskirt);
  const tcloth = box(2.5, 0.12, 0.9, mat("#2a5cc4", { roughness: 0.85 }), 0.03); tcloth.position.y = 0.72; T.add(tcloth);
  at(box(0.08, 0.26, 0.08, mat("#cfe3f5", { transparent: true, opacity: 0.6, roughness: 0.1 })), -0.6, 0.94, 0.1, 0, T);
  at(box(0.08, 0.26, 0.08, mat("#cfe3f5", { transparent: true, opacity: 0.6, roughness: 0.1 })), 0.7, 0.94, 0.05, 0, T);
  at(box(0.3, 0.04, 0.22, "#3a2418", 0.01), 0.1, 0.83, 0.1, 0.2, T);
  C.seats = [];
  for (let i = 0; i < 3; i++) { const ch = new THREE.Group(); at(ch, -0.8 + i * 0.8, 0, -0.75, 0, T);
    const s = box(0.5, 0.08, 0.48, "#d8d6cf"); s.position.y = 0.48; ch.add(s); const b = box(0.5, 0.6, 0.06, "#d8d6cf"); b.position.set(0, 0.8, -0.24); ch.add(b);
    for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46), mat("#888")); l.position.set(lx, 0.23, lz); ch.add(l); }
    C.seats.push(ch); }
  // bouquet de fleurs blanches et bleues sur un socle drapé
  const BQ = new THREE.Group(); at(BQ, 5.6, 0, 0.7); C.bouquet = BQ;
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.0, 20), mat("#ffffff", { map: TEX.leaf })); ped.position.y = 0.5; ped.castShadow = true; BQ.add(ped);
  for (let i = 0; i < 26; i++) { const a = rnd() * 6.3, r = rnd() * 0.25, f = new THREE.Mesh(new THREE.SphereGeometry(0.06 + rnd() * 0.04, 10, 8), mat(i % 3 ? "#f6f7fb" : "#6f9be6", { roughness: 0.7 }));
    f.position.set(Math.cos(a) * r, 1.08 + rnd() * 0.25, Math.sin(a) * r); f.castShadow = true; BQ.add(f); }

  // chaises en plastique (rangées irrégulières) — instances
  const chairG = (() => {
    const parts = [new THREE.BoxGeometry(0.46, 0.05, 0.44).translate(0, 0.44, 0), new THREE.BoxGeometry(0.46, 0.5, 0.04).rotateX(-0.12).translate(0, 0.72, 0.21)];
    for (const [lx, lz] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) parts.push(new THREE.CylinderGeometry(0.018, 0.022, 0.44, 4, 1, true).translate(lx, 0.22, lz));
    return mergeGeoms(parts);
  })();
  const cols = ["#f07a3a", "#f07a3a", "#d93a2e", "#8b9a8a", "#8b9a8a", "#eeeeea", "#f28a46"];
  const seatsList = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) {
    const x = -5.6 + c * 0.82 + (c >= 5 ? 0.9 : 0) + (rnd() - 0.5) * 0.18, z = 2.6 + r * 1.05 + (rnd() - 0.5) * 0.2;
    if (x > 4.6 && z < 4.2) continue; seatsList.push([x, z, (rnd() - 0.5) * 0.18]);
  }
  const chairs = new THREE.InstancedMesh(chairG, mat("#ffffff", { roughness: 0.55 }), seatsList.length); chairs.castShadow = chairs.receiveShadow = true;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1);
  seatsList.forEach(([x, z, ry], i) => { M.compose(V.set(x, 0, z), Q.setFromEuler(E.set(0, ry, 0)), ONE); chairs.setMatrixAt(i, M); chairs.setColorAt(i, new THREE.Color(cols[(rnd() * cols.length) | 0])); });
  S.add(chairs); C.seatsList = seatsList;

  // rayons de lumière (fenêtres) + poussière en suspension
  const beamM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uI: { value: 0.18 }, uT: { value: 0 } },
    vertexShader: "varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: "varying vec2 vU; uniform float uI; uniform float uT; void main(){ float e=smoothstep(0.,.25,vU.x)*smoothstep(1.,.75,vU.x); float l=smoothstep(0.,.15,vU.y)*(.35+.65*vU.y); float n=.85+.15*sin(vU.x*23.+uT*.3); gl_FragColor=vec4(vec3(1.,.93,.78)*uI*e*l*n,1.); }" });
  C.beamM = beamM;
  for (let i = 0; i < 3; i++) {
    const g = new THREE.CylinderGeometry(0.55, 1.4, 9, 16, 1, true); g.translate(0, -4.5, 0);
    const m = new THREE.Mesh(g, beamM); m.position.set(-9.5, 3.4, 3 + i * 3.4); m.rotation.z = -1.0; m.rotation.x = 0.12; S.add(m); C.beams.push(m);
  }
  const N = 900, pos = new Float32Array(N * 3), dustBase = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { dustBase[i * 3] = -8 + rnd() * 14; dustBase[i * 3 + 1] = 0.4 + rnd() * 3.6; dustBase[i * 3 + 2] = -3 + rnd() * 14; }
  pos.set(dustBase); const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dotTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  C.dotTex = dotTex;
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.025, map: dotTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: "#fff2d0" }));
  S.add(dust); C.dust = { pts: dust, base: dustBase, pos };

  C.update = (t) => {
    C.fans.forEach((r, i) => (r.rotation.z = t * (9 + i)));
    const p = C.dust.pos, b = C.dust.base;
    for (let i = 0; i < p.length / 3; i++) { p[i * 3] = b[i * 3] + 0.25 * Math.sin(t * 0.13 + i); p[i * 3 + 1] = b[i * 3 + 1] + 0.15 * Math.sin(t * 0.09 + i * 1.7); p[i * 3 + 2] = b[i * 3 + 2] + 0.2 * Math.cos(t * 0.11 + i * 0.7); }
    C.dust.pts.geometry.attributes.position.needsUpdate = true; beamM.uniforms.uT.value = t;
  };
  return C;
}

export function mergeGeoms(list) {
  const geoms = list.map((g) => (g.index ? g.toNonIndexed() : g));
  const n = geoms.reduce((s, g) => s + g.attributes.position.count, 0);
  const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  for (const g of geoms) { P.set(g.attributes.position.array, o * 3); Nn.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
  const m = new THREE.BufferGeometry(); m.setAttribute("position", new THREE.BufferAttribute(P, 3)); m.setAttribute("normal", new THREE.BufferAttribute(Nn, 3)); m.setAttribute("uv", new THREE.BufferAttribute(U, 2)); return m;
}
