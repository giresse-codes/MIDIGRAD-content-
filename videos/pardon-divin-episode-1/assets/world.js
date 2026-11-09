// Monde de l'épisode : rendu toon, décors, personnages, effets, médaillon de Wilfried, post-traitement.
import * as THREE from "three";
import { EffectComposer } from "./lib/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./lib/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./lib/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "./lib/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "./lib/jsm/postprocessing/ShaderPass.js";
import { makeChar, tm, mesh, sph, cyl, cap, outline, canvasTex, INK, rnd, setSeed } from "./toon.js";
import { buildSets, sky, sheep } from "./sets.js";
import { makeWilfried } from "../narrateur/wilfried.js";

export async function createWorld(canvas, logo, RW = 540, RH = 960) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(RW, RH, false);
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputColorSpace = THREE.SRGBColorSpace;
  const S = new THREE.Scene(); S.fog = new THREE.Fog("#d6f0fb", 28, 95);
  const hemi = new THREE.HemisphereLight("#ffffff", "#7fbf5a", 1.5); S.add(hemi);
  const sun = new THREE.DirectionalLight("#fff3dc", 2.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 }); S.add(sun, sun.target);
  const SK = sky(); S.add(SK);
  const sets = buildSets(S);
  const cam = new THREE.PerspectiveCamera(45, RW / RH, 0.1, 500);

  // personnages
  setSeed(31);
  const W = makeWilfried(); S.add(W.root);
  const tunic = tm("#fbf5e4", { emissive: "#fff2c8", emissiveIntensity: 0.25 });
  const figTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#4f9a3a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.save(); g.translate((i * 53) % w, (i * 97) % h); g.rotate(i); g.fillStyle = i % 2 ? "#6cc04a" : "#3f8a2e"; g.beginPath(); g.ellipse(0, 0, 26, 12, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.restore(); } }, [2, 2]);
  const fig = tm("#ffffff", { map: figTex });
  const skinTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#a5714a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = i % 2 ? "#8b5a37" : "#bf8a5e"; g.lineWidth = 3; g.beginPath(); const x = (i * 37) % w, y = (i * 61) % h; g.moveTo(x, y); g.lineTo(x + 6, y + 14); g.stroke(); } }, [2, 2]);
  const peau = tm("#ffffff", { map: skinTex });
  const A = makeChar({ skin: "#9a6239", hair: "crepu", beard: "#3a2414", topMat: tunic, robe: true, legSkin: true, sleeve: "short" });
  const E = makeChar({ skin: "#a8693f", hair: "long", hairColor: "#2a1a12", topMat: tunic.clone(), robe: true, legSkin: true, sleeve: "short", blush: 0.4 });
  S.add(A.root, E.root);
  const outfit = (C, kind) => { const m = kind === "fig" ? fig : kind === "peau" ? peau : (C === A ? tunic : E.o.topMat);
    C.root.traverse((o) => { if (o.isMesh && !o.userData.isOl && (o.material === tunic || o.material === E.o.topMat || o.material === fig || o.material === peau)) o.material = m; }); };
  // serpent : chaîne de boules vertes + tête rusée
  const snake = new THREE.Group(); S.add(snake); const segs = [];
  for (let i = 0; i < 26; i++) { const s = mesh(sph(0.12 - i * 0.0025, 12), tm(i % 3 ? "#5fb847" : "#8fd14f"), { parent: snake, ol: 0.012 }); segs.push(s); }
  const sh = new THREE.Group(); snake.add(sh); mesh(sph(0.17, 16), tm("#5fb847"), { scale: [1.35, 0.9, 1], parent: sh, ol: 0.014 });
  const eyes = []; for (const sd of [-1, 1]) { const e = mesh(sph(0.06, 10), tm("#fff7a0"), { pos: [0.12, 0.09, sd * 0.08], parent: sh, ol: 0.008 }); mesh(new THREE.BoxGeometry(0.02, 0.07, 0.02), tm(INK), { pos: [0.05, 0, 0], parent: e, noOl: true }); const lid = mesh(sph(0.064, 10, ), tm("#4e9a3a"), { pos: [0, 0.03, 0], scale: [1, 0.55, 1], parent: e, noOl: true }); eyes.push({ e, lid }); }
  const tongue = mesh(new THREE.BoxGeometry(0.16, 0.012, 0.03), tm("#e8323a"), { pos: [0.26, -0.03, 0], parent: sh, noOl: true });
  outline(snake, 0);
  // Dieu : lumière chaude et dorée (jamais une personne)
  const godG = new THREE.Group(); S.add(godG);
  const glowTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.25, "rgba(255,232,150,.9)"); gr.addColorStop(0.6, "rgba(255,200,80,.25)"); gr.addColorStop(1, "rgba(255,190,60,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const godSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); godSpr.scale.setScalar(4); godG.add(godSpr);
  const rays = new THREE.Group(); godG.add(rays);
  for (let i = 0; i < 12; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 6), new THREE.MeshBasicMaterial({ color: "#ffe39a", transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); r.rotation.z = (i / 12) * Math.PI * 2; r.position.set(Math.sin(r.rotation.z) * -3, Math.cos(r.rotation.z) * 3, 0); rays.add(r); }
  const godL = new THREE.PointLight("#ffd27a", 0, 14, 1.5); godG.add(godL);
  // agneau en silhouette (habits de peau) : s'efface dans la lumière
  const lamb = sheep(0.9); lamb.traverse((o) => { if (o.isMesh && !o.userData.isOl) { o.material = new THREE.MeshBasicMaterial({ color: "#3a2a1a", transparent: true, opacity: 1 }); } }); S.add(lamb);
  // houe d'Adam
  const hoe = new THREE.Group(); mesh(cyl(0.03, 0.03, 1.3, 8), tm("#8a5a32"), { parent: hoe }); mesh(new THREE.BoxGeometry(0.28, 0.12, 0.05), tm("#7d7f86"), { pos: [0.1, -0.62, 0], parent: hoe }); outline(hoe, 0.012); S.add(hoe);

  // particules : or (création, poussière d'Adam, dissolution), feu (épée), feuilles (vent), étincelles
  const dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  function points(n, color, size, additive = true) { const p = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); const c = new Float32Array(n * 3); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: false, color }); const pts = new THREE.Points(g, m); pts.frustumCulled = false; S.add(pts); return pts; }
  const gold = points(900, "#ffffff", 0.12), fire = points(500, "#ffffff", 0.22), leaves = points(260, "#ffffff", 0.16, false);
  const seeds = Array.from({ length: 1200 }, (_, i) => [Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, Math.abs(Math.sin(i * 78.233) * 12543.21) % 1, Math.abs(Math.sin(i * 39.425) * 9631.7) % 1]);
  const setCol = (pts, i, r, g, b) => { const c = pts.geometry.attributes.color.array; c[i * 3] = r; c[i * 3 + 1] = g; c[i * 3 + 2] = b; };

  // médaillon : Wilfried en buste devant un petit décor de rue (rendu dans une texture)
  const MS = new THREE.Scene(); MS.background = new THREE.Color("#8fd0f5");
  MS.add(new THREE.HemisphereLight("#ffffff", "#e8d8b8", 2.2)); const ml = new THREE.DirectionalLight("#fff3dc", 2.4); ml.position.set(0.6, 2.2, 4); MS.add(ml);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5EB8F2"); gr.addColorStop(1, "#E3F5FB"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    [["#F4D58D", 20, 140], ["#EF8E6A", 150, 90], ["#F7F1E3", 280, 60], ["#9BC7A5", 400, 120]].forEach(([c, x, y]) => { g.fillStyle = c; g.fillRect(x, y, 120, h - y); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(x, y, 120, h - y);
      for (let r = 0; r < 6; r++) for (let q = 0; q < 2; q++) { g.fillStyle = "#9ad3ef"; g.fillRect(x + 16 + q * 52, y + 20 + r * 60, 36, 34); g.strokeRect(x + 16 + q * 52, y + 20 + r * 60, 36, 34); } });
    g.fillStyle = "#4caf50"; g.beginPath(); g.ellipse(70, 120, 70, 20, -0.4, 0, 7); g.fill(); }) }));
  back.position.set(0, 1.4, -2.5); MS.add(back);
  const WM = makeWilfried(); MS.add(WM.root);
  const mcam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); mcam.position.set(0, 1.62, 2.25); mcam.lookAt(0, 1.52, 0);
  const medRT = new THREE.WebGLRenderTarget(360, 360); medRT.texture.colorSpace = THREE.SRGBColorSpace;

  // post-traitement
  const comp = new EffectComposer(R); comp.setPixelRatio(1); comp.setSize(RW, RH);
  comp.addPass(new RenderPass(S, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(RW / 2, RH / 2), 0.3, 0.5, 0.9); comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, tMed: { value: medRT.texture }, uMed: { value: 0 }, uMedC: { value: new THREE.Vector2(0.195, 0.155) }, uMedR: { value: 0.15 }, uAsp: { value: RH / RW },
      uCold: { value: 0 }, uWarm: { value: 0 }, uT: { value: 0 }, uRew: { value: 0 }, uDiss: { value: 0 }, uFade: { value: 0 }, uFadeCol: { value: new THREE.Color("#000") }, uBlur: { value: new THREE.Vector2() }, uVig: { value: 0.22 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: `uniform sampler2D tDiffuse, tMed; uniform float uMed, uMedR, uAsp, uCold, uWarm, uT, uRew, uDiss, uFade, uVig; uniform vec2 uMedC, uBlur; uniform vec3 uFadeCol; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
      void main(){
        vec2 uv = vUv;
        if (uRew > 0.) { uv.x += (h(vec2(floor(uv.y*90.), uT))-.5)*0.02*uRew; }
        vec3 c;
        if (abs(uBlur.x)+abs(uBlur.y) > .0005) { c=vec3(0.); float n=0.; for(int i=-6;i<=6;i++){ float w=1.-abs(float(i))/7.; c+=texture2D(tDiffuse, uv+uBlur*float(i)/6.).rgb*w; n+=w; } c/=n; }
        else c = texture2D(tDiffuse, uv).rgb;
        if (uRew > 0.) { c.r = texture2D(tDiffuse, uv+vec2(.006*uRew,0.)).r; c.b = texture2D(tDiffuse, uv-vec2(.006*uRew,0.)).b;
          c = mix(c, vec3(dot(c, vec3(.3,.59,.11)))*vec3(.85,.95,1.15), .35*uRew); c *= 1. - .18*uRew*step(.5, fract(uv.y*160.)); }
        float l = dot(c, vec3(.299,.587,.114));
        c = mix(c, mix(vec3(l), c, .55)*vec3(.82,.92,1.12), uCold);
        c = mix(c, c*vec3(1.08,1.,.86)+vec3(.03,.02,0.), uWarm);
        if (uDiss > 0.) { float nn = n2(uv*vec2(14.,25.)); float e = smoothstep(uDiss-.06, uDiss, nn); c = mix(c, vec3(0.02,0.02,.06), step(nn, uDiss)); c += vec3(1.,.8,.3)*(1.-e)*step(uDiss-.06, nn)*1.6; }
        vec2 d = uv-.5; d.x*=.6; c *= 1.-uVig*smoothstep(.3,.85,length(d)*1.4);
        if (uMed > 0.) { vec2 q = (uv-uMedC); q.y *= uAsp; float r = length(q); if (r < uMedR) { vec2 mu = q/uMedR*.5+.5; c = mix(c, texture2D(tMed, mu).rgb, uMed); } }
        c = mix(c, uFadeCol, uFade);
        gl_FragColor = vec4(c,1.);
      }` });
  comp.addPass(grade); grade.uniforms.tMed.value = medRT.texture;

  // logo final (scène claire)
  const LS = new THREE.Scene(); LS.background = new THREE.Color("#f3ead8"); LS.add(new THREE.HemisphereLight("#ffffff", "#e8dcc4", 1.3)); const ld = new THREE.DirectionalLight("#fff", 1.5); ld.position.set(2, 3, 5); LS.add(ld);
  const coin = new THREE.Group(); LS.add(coin);
  const logoTex = canvasTex(512, 512, (g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill(); g.drawImage(logo, 16, 16, 480, 480); });
  mesh(new THREE.CylinderGeometry(1, 1, 0.16, 96), tm("#d8a93b"), { rot: [Math.PI / 2, 0, 0], parent: coin, ol: 0.02 });
  mesh(new THREE.CircleGeometry(0.95, 96), new THREE.MeshBasicMaterial({ map: logoTex }), { pos: [0, 0, 0.082], parent: coin, noOl: true }); outline(coin, 0.02);
  const lcam = new THREE.PerspectiveCamera(35, RW / RH, 0.1, 50); lcam.position.set(0, 0, 7.5);

  const V = new THREE.Vector3();
  const WD = { R, S, cam, sets, sun, hemi, SK, W, WM, A, E, snake, segs, sh, eyes, tongue, godG, godSpr, rays, godL, lamb, hoe, gold, fire, leaves, seeds, setCol, grade, bloom, comp, outfit, coin, LS, lcam, MS, mcam, medRT,
    render(t, st) {
      for (const k in sets) { const on = st.set === k || (st.set2 && st.set2 === k); sets[k].visible = on; if (on) sets[k].userData.update(t, st.k || {}); }
      const G = sets[st.set]; const o = G.position;
      SK.position.copy(o); sun.position.set(o.x + 8, 14, o.z + 10); sun.target.position.set(o.x, 0, o.z - 4); sun.shadow.camera.updateProjectionMatrix();
      const night = st.night || 0, cold = st.cold || 0;
      SK.material.uniforms.k.value = Math.max(0.03, 1 - night) * (1 - 0.35 * cold);
      SK.material.uniforms.top.value.set(cold > 0 ? "#5d7fa6" : "#5EB8F2").lerp(new THREE.Color("#5EB8F2"), 1 - cold);
      S.fog.color.set("#d6f0fb").lerp(new THREE.Color("#020210"), night).lerp(new THREE.Color("#9fb0c4"), cold * (1 - night)); S.fog.near = 28 + night * 200; S.fog.far = 95 + night * 300;
      sun.intensity = 2.0 * (1 - night) * (1 - 0.45 * cold); hemi.intensity = 1.5 * (1 - 0.9 * night) * (1 - 0.3 * cold) + 0.15;
      const c = st.cam; cam.position.set(o.x + c.pos[0], c.pos[1], o.z + c.pos[2]); cam.up.set(0, 1, 0); cam.lookAt(o.x + c.tgt[0], c.tgt[1], o.z + c.tgt[2]); cam.fov = c.fov || 45; cam.updateProjectionMatrix();
      if (c.yaw) cam.rotateY(c.yaw); if (c.pitch) cam.rotateX(c.pitch); if (c.roll) cam.rotateZ(c.roll);
      // personnages
      const place = (C, p) => { C.root.visible = !!p; if (p) { C.root.position.set(o.x + p.pos[0], p.pos[1] || 0, o.z + p.pos[2]); C.root.rotation.y = p.ry || 0; C.root.scale.setScalar(p.scale ?? 1); C.pose(p.pose || {}); C.faceSet(p.face || {}); } };
      place(W, st.W); place(A, st.A); place(E, st.E);
      if (st.Aout) outfit(A, st.Aout); if (st.Eout) outfit(E, st.Eout);
      // serpent
      snake.visible = !!st.snake;
      if (st.snake) { const s = st.snake, P = s.path; for (let i = 0; i < segs.length; i++) { const u = Math.max(0, s.u - i * 0.022); const p = P(u, t); segs[i].position.set(o.x + p[0], p[1], o.z + p[2]); }
        const p0 = P(s.u, t), p1 = P(Math.max(0, s.u - 0.02), t); sh.position.set(o.x + p0[0], p0[1] + 0.03, o.z + p0[2]); V.set(o.x + p0[0] + (p0[0] - p1[0]) * 5 + (s.look ? s.look[0] : 0), p0[1] + (s.look ? s.look[1] : 0), o.z + p0[2] + (p0[2] - p1[2]) * 5 + (s.look ? s.look[2] : 0)); sh.lookAt(V); sh.rotateY(-Math.PI / 2);
        eyes.forEach((e) => (e.lid.position.y = 0.03 - 0.03 * (s.ruse ?? 0.6))); tongue.visible = Math.sin(t * 9) > 0.3 && (s.talk || 0) > 0; tongue.scale.x = 0.6 + 0.4 * Math.abs(Math.sin(t * 18)); }
      // Dieu
      godG.visible = !!st.god;
      if (st.god) { const g = st.god; godG.position.set(o.x + g.pos[0], g.pos[1], o.z + g.pos[2]); const pul = 1 + 0.06 * Math.sin(t * 2.2); godSpr.scale.setScalar((g.size || 4) * pul); godSpr.material.opacity = g.a ?? 1; rays.rotation.z = t * 0.15; rays.scale.setScalar((g.size || 4) / 4); rays.children.forEach((r) => (r.material.opacity = 0.22 * (g.a ?? 1))); godL.intensity = 8 * (g.a ?? 1); }
      lamb.visible = !!st.lamb; if (st.lamb) { lamb.position.set(o.x + st.lamb.pos[0], 0, o.z + st.lamb.pos[2]); lamb.rotation.y = st.lamb.ry || 0; lamb.traverse((m) => { if (m.isMesh) { m.material.opacity = st.lamb.a; m.material.transparent = true; } }); }
      hoe.visible = !!st.hoe; if (st.hoe) { hoe.position.set(o.x + st.hoe.pos[0], st.hoe.pos[1], o.z + st.hoe.pos[2]); hoe.rotation.set(0, 0, st.hoe.rz || 0); }
      // particules
      const fx = st.fx || {};
      const G1 = gold.geometry.attributes.position.array; gold.visible = !!fx.gold;
      if (fx.gold) { const f = fx.gold, n = Math.min(900, f.n || 600);
        for (let i = 0; i < 900; i++) { const [a, b, d] = seeds[i]; let x = 0, y = -99, z = 0;
          if (i < n) {
            if (f.kind === "tornado") { const lf = (t * 0.6 + a) % 1, ang = lf * 18 + b * 6.28, rr = (0.2 + (1 - lf) * 1.2) * (f.r || 1); x = f.c[0] + Math.cos(ang) * rr; y = f.c[1] + lf * (f.h || 2.4); z = f.c[2] + Math.sin(ang) * rr; }
            else if (f.kind === "burst") { const p = f.p; x = f.c[0] + (a - 0.5) * 2 * p * (f.r || 8); y = f.c[1] + (b - 0.3) * p * (f.r || 8) * 0.8; z = f.c[2] + (d - 0.5) * 2 * p * (f.r || 8); }
            else { const lf = (t * 0.25 + a) % 1; x = f.c[0] + (a - 0.5) * (f.r || 6); y = f.c[1] + lf * (f.h || 4); z = f.c[2] + (d - 0.5) * (f.r || 6); }
          }
          G1[i * 3] = o.x + x; G1[i * 3 + 1] = y; G1[i * 3 + 2] = o.z + z; setCol(gold, i, 1, 0.82 + 0.18 * b, 0.4 + 0.3 * d); }
        gold.geometry.attributes.position.needsUpdate = true; gold.geometry.attributes.color.needsUpdate = true; gold.material.opacity = f.a ?? 1; gold.material.size = f.size || 0.12; }
      const F1 = fire.geometry.attributes.position.array; fire.visible = !!fx.fire;
      if (fx.fire) { const f = fx.fire; for (let i = 0; i < 500; i++) { const [a, b, d] = seeds[i + 300]; const lf = (t * 1.6 + a) % 1;
          const x = f.c[0] + (b - 0.5) * (f.w || 0.15) * (1 - lf) + 0.05 * Math.sin(t * 9 + i), y = f.c[1] + (f.line ? (a - 0.5) * f.line : 0) + lf * (f.h || 0.8), z = f.c[2] + (d - 0.5) * 0.1;
          F1[i * 3] = o.x + x; F1[i * 3 + 1] = y; F1[i * 3 + 2] = o.z + z; setCol(fire, i, 1, 1 - lf * 0.8, Math.max(0, 0.6 - lf * 1.5)); }
        fire.geometry.attributes.position.needsUpdate = true; fire.geometry.attributes.color.needsUpdate = true; }
      const L1 = leaves.geometry.attributes.position.array; leaves.visible = !!fx.leaves;
      if (fx.leaves) { const f = fx.leaves; for (let i = 0; i < 260; i++) { const [a, b, d] = seeds[i + 800]; const lf = (t * (0.15 + 0.1 * b) + a) % 1;
          L1[i * 3] = o.x + f.c[0] + (a - 0.5) * 16 + lf * 6 * (f.wind || 1) + Math.sin(t * 2 + i) * 0.3; L1[i * 3 + 1] = 6 - lf * 6.2; L1[i * 3 + 2] = o.z + f.c[2] + (d - 0.5) * 12; setCol(leaves, i, f.brown ? 0.55 : 0.35, f.brown ? 0.4 : 0.7, 0.15); }
        leaves.geometry.attributes.position.needsUpdate = true; leaves.geometry.attributes.color.needsUpdate = true; leaves.material.opacity = f.a ?? 1; }
      // grade
      const gu = grade.uniforms; gu.uCold.value = cold; gu.uWarm.value = st.warm || 0; gu.uT.value = Math.floor(t * 30) / 30; gu.uRew.value = st.rew || 0; gu.uDiss.value = st.diss || 0;
      gu.uBlur.value.set(st.blurX || 0, st.blurY || 0); gu.uFade.value = st.fade || 0; gu.uFadeCol.value.set(st.fadeCol || "#000000");
      // médaillon
      gu.uMed.value = st.med || 0;
      if (st.med > 0) { WM.pose(st.medPose || {}); WM.faceSet(st.medFace || {}); R.setRenderTarget(medRT); R.render(MS, mcam); R.setRenderTarget(null); }
      if (st.logo) { const L = st.logo; coin.rotation.y = L.rot; coin.scale.setScalar(L.scale); coin.position.y = L.y; const sv = comp.passes[0]; sv.scene = LS; sv.camera = lcam; bloom.enabled = false; gu.uMed.value = 0; gu.uVig.value = 0.1; comp.render(); sv.scene = S; sv.camera = cam; bloom.enabled = true; gu.uVig.value = 0.22; return; }
      comp.render();
    },
  };
  return WD;
}
