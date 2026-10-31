// Monde 3D : église + personnages + foule + post-traitement. render(t, S) est une fonction pure de t et de l'état S.
import * as THREE from "three";
import { EffectComposer } from "./lib/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./lib/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./lib/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "./lib/jsm/postprocessing/BokehPass.js";
import { GTAOPass } from "./lib/jsm/postprocessing/GTAOPass.js";
import { OutputPass } from "./lib/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "./lib/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "./lib/jsm/RoomEnvironment.js";
import { buildChurch, TEX, mat, canvasTex } from "./church.js";
import { makeToy, makeCrowd } from "./toys.js";

export async function createWorld(canvas, logo, RW = 540, RH = 960) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(RW, RH, false);
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
  const S = new THREE.Scene(); S.background = new THREE.Color("#dfe6ea");
  const pm = new THREE.PMREMGenerator(R); const ENV = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  const cam = new THREE.PerspectiveCamera(40, RW / RH, 0.05, 80);
  const hemi = new THREE.HemisphereLight("#eaf3ff", "#9a7f62", 1.05); S.add(hemi);
  const key = new THREE.DirectionalLight("#fff4e2", 2.0); key.position.set(-4, 9, 7); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 30 }); key.shadow.bias = -0.0005; key.shadow.radius = 3;
  key.target.position.set(0, 0, 3); S.add(key, key.target);
  const stageL = new THREE.SpotLight("#ffe9c8", 30, 14, 0.55, 0.6, 1.6); stageL.position.set(0, 4.2, 2.5); stageL.target.position.set(0, 1, -1.5); S.add(stageL, stageL.target);
  const fill = new THREE.DirectionalLight("#ffeedd", 0.9); fill.position.set(1, 2.2, 8); fill.target.position.set(0, 1.5, -2); S.add(fill, fill.target);
  const C = buildChurch(S, logo);
  // reflets d'environnement seulement sur les matières brillantes (carrelage, métal, verre)
  const envOn = (o) => { if (o.material && (o.material.clearcoat || o.material.metalness > 0.3 || o.material.roughness < 0.3)) { o.material.envMap = ENV; o.material.envMapIntensity = 0.6; o.material.needsUpdate = true; } };

  // personnages principaux
  const skinA = "#7a4a2e";
  const A = makeToy({ skin: skinA, topTex: TEX.pagne, dress: mat("#ffffff", { map: TEX.pagne, roughness: 0.75 }), wrap: true, wrapTex: TEX.pagne, puff: true, shortSleeve: true, lip: "#5a2420", shoe: "#c8a23a" });
  const I = makeToy({ skin: "#5e3822", top: "#24262d", bottom: "#24262d", tie: "#3b3f4a", hair: "#140d08" });
  const Y = makeToy({ skin: "#6a4029", top: "#1b2a4a", bottom: "#1b2a4a", tie: "#7a8fb8", glasses: true, beard: "#8d8a86", hair: "#3d3833", brow: "#3a332d" });
  const Em = makeToy({ skin: "#583520", topTex: TEX.wax("#2f6b4a", "#e8c35a", "#f4efe2"), bottomTex: TEX.wax("#2f6b4a", "#e8c35a", "#f4efe2"), hair: "#120c08", shortSleeve: false });
  const Ma = makeToy({ skin: "#7d5134", top: "#f2f0ea", bottom: "#4a3a2c", tie: "#8a3b2c", hair: "#1a120b" });
  S.add(A.root, I.root, Y.root, Em.root, Ma.root);
  S.traverse(envOn);
  // fidèles mis en avant (gros plans) : visages détaillés
  const heroes = [
    { T: makeToy({ skin: "#5f3a24", topTex: TEX.wax("#c0392b", "#f1c40f", "#fdf2e9"), dress: mat("#ffffff", { map: TEX.wax("#c0392b", "#f1c40f", "#fdf2e9") }), wrap: true, wrapTex: TEX.wax("#c0392b", "#f1c40f", "#fdf2e9"), puff: true, shortSleeve: true }), seat: 2 },
    { T: makeToy({ skin: "#7a4b2f", top: "#3a7bd5", bottom: "#2b2b33", hair: "#120c08", shortSleeve: true }), seat: 13 },
    { T: makeToy({ skin: "#8a5836", topTex: TEX.wax("#7b3fa0", "#f7d774", "#ffffff"), dress: mat("#ffffff", { map: TEX.wax("#7b3fa0", "#f7d774", "#ffffff") }), hair: "#120c08", shortSleeve: true }), seat: 6 },
  ];
  heroes.forEach((h) => S.add(h.T.root));
  const crowd = makeCrowd(S, C.seatsList);
  const skip = new Set(heroes.map((h) => h.seat));
  heroes.forEach((h) => { const [x, z, ry] = C.seatsList[h.seat]; h.T.root.position.set(x, 0, z + 0.03); h.T.root.rotation.y = Math.PI + ry; });
  // places
  Y.root.position.copy(C.seats[1].getWorldPosition(new THREE.Vector3())); Em.root.position.copy(C.seats[0].getWorldPosition(new THREE.Vector3())); Ma.root.position.copy(C.seats[2].getWorldPosition(new THREE.Vector3()));
  for (const T of [Y, Em, Ma]) { T.root.rotation.y = C.table.rotation.y; T.root.position.y = 0.04; }
  I.root.position.set(2.75, 0.45, -1.95); I.root.rotation.y = -0.25 - 0.15;

  // étincelles dorées
  const SPN = 260, spPos = new Float32Array(SPN * 3), spSeed = Array.from({ length: SPN }, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12543.21 % 1, Math.sin(i * 39.425) * 9631.7 % 1].map(Math.abs));
  const spG = new THREE.BufferGeometry(); spG.setAttribute("position", new THREE.BufferAttribute(spPos, 3));
  const sparks = new THREE.Points(spG, new THREE.PointsMaterial({ size: 0.05, map: C.dotTex, color: "#ffd36b", transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  S.add(sparks);

  // logo final 3D (scène claire séparée)
  const LS = new THREE.Scene(); LS.background = new THREE.Color("#e9e1d0");
  LS.add(new THREE.HemisphereLight("#ffffff", "#e8dcc4", 0.55)); const ld = new THREE.DirectionalLight("#fff", 1.1); ld.position.set(2, 3, 5); LS.add(ld);
  LS.environment = ENV;
  const coin = new THREE.Group(); LS.add(coin);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.16, 96), new THREE.MeshStandardMaterial({ color: "#d8a93b", metalness: 0.85, roughness: 0.25 })); rim.rotation.x = Math.PI / 2; coin.add(rim);
  const faceL2 = new THREE.Mesh(new THREE.CircleGeometry(0.96, 96), new THREE.MeshStandardMaterial({ map: TEX.logo, roughness: 0.4 })); faceL2.position.z = 0.081; coin.add(faceL2);
  const back2 = faceL2.clone(); back2.rotation.y = Math.PI; back2.position.z = -0.081; coin.add(back2);
  const lcam = new THREE.PerspectiveCamera(35, RW / RH, 0.1, 50); lcam.position.set(0, 0, 7.2);
  const lsp = new THREE.Points(spG, sparks.material.clone()); LS.add(lsp);

  // post-traitement
  const comp = new EffectComposer(R); comp.setPixelRatio(1); comp.setSize(RW, RH);
  const rp = new RenderPass(S, cam); comp.addPass(rp);
  const sao = new GTAOPass(S, cam, RW, RH); sao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1, samples: 8 });
  sao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 8 }); sao.blendIntensity = 0.8; comp.addPass(sao); sao.setSize(RW / 2, RH / 2);
  const bokeh = new BokehPass(S, cam, { focus: 3, aperture: 0.004, maxblur: 0.008 }); comp.addPass(bokeh);
  const bloom = new UnrealBloomPass(new THREE.Vector2(RW / 2, RH / 2), 0.24, 0.5, 0.93); comp.addPass(bloom);
  comp.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uWarm: { value: 0 }, uCold: { value: 0 }, uT: { value: 0 }, uBlur: { value: new THREE.Vector2() }, uVig: { value: 0.28 }, uGrain: { value: 0.035 }, uFade: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uWarm, uCold, uT, uVig, uGrain, uFade; uniform vec2 uBlur; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))+uT*7.13)*43758.5453); }
      void main(){
        vec3 c = vec3(0.); float n = 0.;
        if (abs(uBlur.x) + abs(uBlur.y) > 0.0005) { for (int i=-6;i<=6;i++){ float w = 1. - abs(float(i))/7.; c += texture2D(tDiffuse, vUv + uBlur*float(i)/6.).rgb*w; n += w; } c /= n; }
        else c = texture2D(tDiffuse, vUv).rgb;
        float l = dot(c, vec3(.299,.587,.114));
        c = mix(c, vec3(l), .28*uCold) * mix(vec3(1.), vec3(.86,.95,1.12), uCold);
        c = mix(c, c*vec3(1.1,1.0,.82) + vec3(.03,.015,0.), uWarm); c = mix(c, vec3(l)*vec3(1.08,.98,.85), .06*uWarm);
        c = (c - .5) * (1. + .06*uCold + .04*uWarm) + .5;
        vec2 d = vUv - .5; d.x *= .75; c *= 1. - uVig*smoothstep(.25, .85, length(d)*1.25);
        c += (h(vUv*vec2(720.,1280.)) - .5) * uGrain;
        c = mix(c, vec3(1.), uFade);
        gl_FragColor = vec4(c, 1.);
      }` });
  comp.addPass(grade);

  const V3 = (a) => new THREE.Vector3(...a);
  const W = { R, S, cam, C, A, I, Y, Em, Ma, heroes, crowd, skip, comp, bokeh, bloom, grade, sao, sparks, coin, lcam, LS, lsp, spSeed, spPos, V3,
    headPos(T) { T.root.updateMatrixWorld(true); return T.head.getWorldPosition(new THREE.Vector3()); },
    render(t, st) {
      C.update(t);
      crowd.update(t, st.crowd || {}, skip);
      const c = st.cam; cam.position.set(...c.pos); cam.up.set(Math.sin(c.roll || 0), Math.cos(c.roll || 0), 0); cam.lookAt(...c.tgt); cam.fov = c.fov; cam.updateProjectionMatrix();
      if (c.yaw) cam.rotateY(c.yaw); if (c.pitch) cam.rotateX(c.pitch);
      bokeh.enabled = (c.ap ?? 0.004) >= 0.006; bokeh.uniforms.focus.value = c.focus; bokeh.uniforms.aperture.value = c.ap ?? 0.004; bokeh.uniforms.maxblur.value = c.maxblur ?? 0.008;
      grade.uniforms.uWarm.value = st.warm || 0; grade.uniforms.uCold.value = st.cold || 0; grade.uniforms.uT.value = Math.floor(t * 30) / 30;
      grade.uniforms.uBlur.value.set(st.blurX || 0, st.blurY || 0); grade.uniforms.uFade.value = st.fade || 0;
      C.beamM.uniforms.uI.value = 0.12 + 0.08 * (st.warm || 0) - 0.05 * (st.cold || 0);
      // étincelles
      const sk = st.sparks || 0; sparks.material.opacity = sk;
      if (sk > 0 || st.logo) { const cen = st.sparkAt || [0, 2, 0];
        for (let i = 0; i < spSeed.length; i++) { const [a, b, d] = spSeed[i], life = ((t * 0.35 + a) % 1);
          spPos[i * 3] = cen[0] + (b - 0.5) * 3.2 + 0.2 * Math.sin(t * 2 + i); spPos[i * 3 + 1] = cen[1] - 1 + life * 2.6; spPos[i * 3 + 2] = cen[2] + (d - 0.5) * 2.4; }
        sparks.geometry.attributes.position.needsUpdate = true; }
      if (st.logo) {
        const L = st.logo; coin.rotation.y = L.rot; coin.scale.setScalar(L.scale); coin.position.y = L.y;
        lsp.material.opacity = L.sparks; lsp.position.set(0, -0.6, -1);
        R.setRenderTarget(null); R.toneMapping = THREE.ACESFilmicToneMapping; rp.scene = LS; rp.camera = lcam; bokeh.enabled = false; sao.enabled = false; bloom.enabled = false;
        grade.uniforms.uWarm.value = 0.3; grade.uniforms.uCold.value = 0; comp.render(); rp.scene = S; rp.camera = cam; sao.enabled = true; bloom.enabled = true; return;
      }
      
      comp.render();
    },
  };
  return W;
}
