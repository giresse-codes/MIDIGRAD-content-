// « Ma part suffit » — moteur de scène. Données : window.FILM (build_data.py).
// Tout ce qui touche aux personnages, à la lumière, aux ventilateurs et à la poussière est une fonction pure du temps (update(t)),
// appelée à chaque image par un tween témoin : le rendu image par image reste déterministe.
(function () {
  const F = window.FILM, DUR = F.dur, FPS = F.fps;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const mk = (parent, html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); const el = d.firstElementChild; parent.appendChild(el); return el; };
  const LN = Object.fromEntries(F.lines.map((l) => [l.n, l]));
  const L = (n) => LN[n];
  const W = (n, w, k = 0) => { let c = 0; for (const x of L(n).words) if (x[0].includes(w)) { if (c === k) return x[1]; c++; } throw new Error(n + " " + w); };
  const SFX = []; const sfx = (t, n, v) => SFX.push([+t.toFixed(2), n, v]);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

  // ── Pistes d'état (images clés interpolées) ─────────────────────────
  function track(base) {
    const keys = [];
    return {
      key(t, d, v, lin) { keys.push({ t, d: Math.max(d, 0.001), v, lin }); return this; },
      at(t) {
        const s = JSON.parse(JSON.stringify(base));
        for (const k of keys) {
          if (k.t > t) continue;
          const p0 = clamp((t - k.t) / k.d), p = k.lin ? p0 : ease(p0);
          for (const [prop, v] of Object.entries(k.v)) {
            if (typeof v === "number") s[prop] = (s[prop] ?? 0) + (v - (s[prop] ?? 0)) * p;
            else if (Array.isArray(v)) s[prop] = v.map((x, i) => (s[prop]?.[i] ?? 0) + (x - (s[prop]?.[i] ?? 0)) * p);
            else if (p >= 0.5 || k.d < 0.01) s[prop] = v;
          }
        }
        return s;
      },
      sort() { keys.sort((a, b) => a.t - b.t); },
    };
  }
  // expressions (modérées) et poses
  const E = {
    neutre: { lid: 0.12, bin: 0, bfr: 0, bup: 0, mouth: "closed", gy: 0, head: 0, nod: 0 },
    respect: { lid: 0.32, bin: 0.2, bfr: 0, bup: 0, gy: 0.9, head: 6, nod: 7, mouth: "soft" },
    souci: { lid: 0.28, bin: 0.55, bfr: 0, bup: 0, gy: 0.3, head: 2, nod: 0, mouth: "closed" },
    triste: { lid: 0.38, bin: 1, bfr: 0, bup: 0, gy: 1, head: 4, nod: 3, mouth: "frown" },
    amere: { lid: 0.3, bin: 0.2, bfr: 0.35, bup: 0, gx: -1, gy: 0.2, head: -4, nod: 0, mouth: "pinch" },
    choc: { lid: 0, bin: 0, bfr: 0, bup: 1, gy: 0, head: -3, nod: -2, mouth: "o" },
    colere: { lid: 0.18, bin: 0, bfr: 1, bup: 0, gy: 0, head: -2, nod: 0, mouth: "tight" },
    froide: { lid: 0.26, bin: 0, bfr: 0.3, bup: 0, gx: 0.6, gy: 0, head: 0, nod: 0, mouth: "tight" },
    blessee: { lid: 0.42, bin: 0.85, bfr: 0, bup: 0, gx: 0.1, gy: 1, head: 5, nod: 4, mouth: "frown" },
    detour: { lid: 0.32, bin: 0.35, bfr: 0, bup: 0, gx: -1, gy: 0.4, head: -6, nod: 0, mouth: "pinch" },
    degout: { lid: 0.36, bin: 0, bfr: 0.6, bup: 0, gx: -1, gy: 0.3, head: -8, nod: 0, mouth: "pinch" },
    chaleureux: { lid: 0.1, bin: 0, bfr: 0, bup: 0.25, gy: 0, head: 0, nod: 0, mouth: "smile" },
    compatissant: { lid: 0.2, bin: 0.5, bfr: 0, bup: 0, gy: 0.2, head: 7, nod: 2, mouth: "soft" },
    lecture: { lid: 0.48, bin: 0, bfr: 0, bup: 0, gx: 0.2, gy: 1, head: 9, nod: 6, mouth: "closed" },
    calme: { lid: 0.2, bin: 0, bfr: 0, bup: 0, gy: 0, head: 3, nod: 0, mouth: "soft" },
    inquiet: { lid: 0, bin: 0.8, bfr: 0, bup: 0.3, gy: 0, head: 0, nod: 0, mouth: "o" },
    reflechit: { lid: 0.26, bin: 0, bfr: 0.25, bup: 0, gx: -0.4, gy: -0.6, head: 5, nod: 4, mouth: "tight" },
    surpris: { lid: 0, bin: 0, bfr: 0, bup: 1, gy: 0, head: -2, nod: 0, mouth: "o" },
    priere: { lid: 1, bin: 0.2, bfr: 0, bup: 0, gy: 0.5, head: 7, nod: 6, mouth: "soft" },
  };
  const POSE = {
    lap: [0, -65, -10, -50], joint: [18, -122, -18, 122], chest: [0, -65, 5, 139], chestA: [-5, -139, -10, -50],
    open: [-30, -70, -45, -65], chin: [0, -65, 72, 148], read: [-10, -95, 10, 95], reach: [0, -10, -84, -12],
    fists: [6, -52, -4, -42], hang: [5, 0, -5, 0], gesture: [0, -65, -58, -28], bag: [5, 0, -4, 2],
  };
  const A = track({ x: -560, y: 0, flip: 1, stand: 1, walk: 0, lean: 0, arms: POSE.hang, gx: 0.6, gy: 0, lid: 0.12, bin: 0, bfr: 0, bup: 0, head: 0, nod: 0, turn: 0, mouth: "closed", tear: 0, bag: "hand", blur: 0 });
  const P = track({ x: 0, y: 0, flip: 1, stand: 1, walk: 0, lean: 0, arms: POSE.hang, gx: 0.5, gy: 0, lid: 0.12, bin: 0, bfr: 0, bup: 0, head: 0, nod: 0, turn: 0, mouth: "closed", bib: "hand", blur: 0 });
  const ex = (T, t, k, d = 0.4, more = {}) => T.key(t, d, { ...E[k], ...more });
  const po = (T, t, k, d = 0.5, more = {}) => T.key(t, d, { arms: POSE[k], ...more });

  // ── Mise en scène du dialogue ───────────────────────────────────────
  const g = (n) => L(n).a - 0.2; // les gestes commencent 0,2 s avant la voix
  // 01 : Annabelle arrive et salue ; le pasteur est près du pupitre, de dos
  A.key(0, 1.5, { x: 0, walk: Math.PI * 4 }, true);
  po(A, 1.45, "chestA", 0.5); ex(A, 1.45, "respect", 0.5, { gx: 0.6 });
  P.key(0, 0.01, { flip: 1, gx: 0.3 });
  // 02 : le pasteur se retourne et sourit ; ils s'assoient
  P.key(g(2), 0.45, { flip: -1 }); ex(P, g(2), "chaleureux", 0.4, { gx: 0.6 }); po(P, g(2) + 0.2, "open", 0.6, { bib: "hand" });
  const sit = W(2, "Je") - 0.1;
  ex(A, L(1).b + 0.3, "neutre", 0.4, { gx: 0.6, mouth: "soft" });
  A.key(sit, 0.8, { stand: 0 }); po(A, sit, "lap", 0.7, { bag: "lap" });
  P.key(sit + 0.15, 0.8, { stand: 0 }); po(P, sit + 0.3, "lap", 0.7);
  // 03
  ex(A, g(3), "souci", 0.4, { gx: 0.6 }); ex(A, W(3, "prier") - 0.2, "colere", 0.5, { gx: 0.6 }); po(A, W(3, "prier") - 0.2, "fists", 0.5);
  ex(P, g(3), "compatissant", 0.5, { gx: 0.6 });
  // 04
  ex(P, g(4), "surpris", 0.3, { gx: 0.6 }); ex(P, W(4, "D'abord") - 0.2, "calme", 0.5, { gx: 0.6 }); po(P, W(4, "D'abord") - 0.2, "gesture", 0.6); po(P, L(4).b - 0.6, "lap", 0.7);
  ex(A, g(4) + 0.4, "souci", 0.5, { gx: 0.6 }); po(A, W(4, "Assieds") , "lap", 0.6);
  // 05–07 : tristesse, une larme discrète
  ex(A, g(5), "triste", 0.5, { gx: 0.4 }); po(A, g(5), "chest", 0.6); po(A, W(5, "belle-famille") , "lap", 0.7);
  A.key(W(6, "lapider") - 0.4, 3.2, { tear: 1 }, true);
  ex(A, W(6, "Et", 0) , "triste", 0.4, { gx: 0.3, gy: 1 });
  ex(A, g(7), "souci", 0.4, { gx: 0.6, gy: 0 }); po(A, W(7, "toujours") - 0.3, "open", 0.6); po(A, W(7, "Je", 0) - 0.1, "lap", 0.6);
  ex(A, W(7, "lui…") - 0.3, "amere", 0.5);
  ex(P, g(5), "compatissant", 0.5, { gx: 0.6 });
  // 08
  ex(P, g(8), "reflechit", 0.5); po(P, g(8), "chin", 0.7); ex(P, W(8, "Que") - 0.2, "compatissant", 0.5, { gx: 0.6 }); po(P, W(8, "Que") - 0.2, "lap", 0.7);
  ex(P, W(8, "Mais") - 0.2, "reflechit", 0.5, { gx: 0.5, gy: 0 });
  ex(A, g(8), "triste", 0.5, { gx: 0.6, gy: 0.4 });
  // 09
  ex(A, g(9), "detour", 0.5); ex(A, W(9, "Je") - 0.2, "souci", 0.5, { gx: 0.5, gy: 0.3 });
  // 10
  P.key(g(10), 0.8, { lean: 6 }); ex(P, g(10), "compatissant", 0.5, { gx: 0.7 }); po(P, W(10, "pardonne-leur") - 0.6, "open", 0.6);
  ex(A, g(10), "souci", 0.4, { gx: 0.6 });
  // 11 : Annabelle se redresse, choquée
  P.key(L(10).b, 0.6, { lean: 0 }); po(P, L(10).b + 0.2, "lap", 0.6);
  ex(A, g(11), "choc", 0.35, { gx: 0.6 }); A.key(g(11), 0.4, { lean: -8 }); po(A, g(11), "fists", 0.4);
  ex(A, W(11, "tuer") - 0.4, "colere", 0.5, { gx: 0.6 }); A.key(L(11).b + 0.5, 0.8, { lean: -3 });
  // 12–14 : le pasteur ouvre la Bible
  ex(P, g(12), "calme", 0.5, { gx: 0.6 });
  po(P, W(12, "Deuxième") - 0.5, "read", 0.7, { bib: "open" }); ex(P, W(12, "Deuxième") - 0.3, "lecture", 0.5);
  [13, 14].forEach((n) => { ex(P, L(n).b - 0.5, "calme", 0.4, { gx: 0.6, gy: 0.1 }); });
  ex(P, g(13) + 0.3, "lecture", 0.5); ex(P, g(14) + 0.3, "lecture", 0.5);
  ex(A, g(12) + 0.5, "froide", 0.6, { gx: 0.6 }); ex(A, W(13, "Laissez-le") , "amere", 0.6, { gx: 0.3 });
  // 15
  po(P, L(14).b + 0.2, "lap", 0.7, { bib: "lap" }); ex(P, L(14).b + 0.2, "compatissant", 0.5, { gx: 0.6 });
  ex(A, g(15), "blessee", 0.5);
  // 16
  ex(P, g(16), "calme", 0.4, { gx: 0.6 }); ex(P, W(16, "Il", 1) - 0.2, "compatissant", 0.5, { gx: 0.6 });
  po(P, W(16, "Première") - 0.5, "read", 0.7, { bib: "open" }); ex(P, W(16, "Première") - 0.3, "lecture", 0.5);
  ex(P, L(16).b - 0.4, "calme", 0.4, { gx: 0.6, gy: 0 }); ex(A, g(16) + 0.5, "triste", 0.6, { gx: 0.5, gy: 0.6 });
  // 17 : main sur la poitrine
  po(P, L(16).b + 0.2, "lap", 0.7, { bib: "lap" });
  ex(A, g(17), "blessee", 0.5, { gx: 0.6, gy: 0 }); po(A, g(17), "chest", 0.6); ex(A, W(17, "Et", 0) - 0.3, "colere", 0.5, { gx: 0.6 });
  A.key(W(17, "moi,") - 0.2, 0.4, { lean: -5 });
  // 18
  po(P, g(18), "read", 0.7, { bib: "open" }); ex(P, g(18), "lecture", 0.5); ex(P, W(18, "Commencer") , "lecture", 0.3);
  ex(P, W(18, "retire-toi.") - 0.5, "calme", 0.4, { gx: 0.6, gy: 0 });
  ex(A, g(18) + 0.4, "froide", 0.6); po(A, g(18) + 0.4, "lap", 0.7); A.key(g(18), 0.8, { lean: 0 });
  // 19
  po(P, g(19), "lap", 0.7, { bib: "lap" }); ex(P, g(19), "calme", 0.5, { gx: 0.6 }); ex(P, W(19, "T'excuser") - 0.2, "compatissant", 0.5, { gx: 0.6 });
  ex(A, W(19, "victime,") , "amere", 0.6);
  // 20 : Annabelle se lève, abasourdie
  ex(A, g(20), "choc", 0.35, { gx: 0.6 }); A.key(g(20), 0.8, { stand: 1, lean: -4 }); po(A, g(20), "fists", 0.6, { bag: "lap" });
  ex(A, W(20, "Non") - 0.2, "colere", 0.5, { gx: 0.6 });
  ex(P, g(20) + 0.3, "calme", 0.5, { gx: 0.6, gy: -0.3 }); po(P, g(20) + 0.3, "lap", 0.6);
  // 21 : le pasteur reste assis, calme
  ex(P, g(21), "calme", 0.4, { gx: 0.6, gy: -0.3 }); po(P, g(21), "read", 0.7, { bib: "open" }); ex(P, W(21, "C'est") - 0.2, "lecture", 0.5);
  ex(P, L(21).b - 0.6, "calme", 0.4, { gx: 0.6, gy: -0.3 });
  ex(A, g(21) + 0.4, "froide", 0.5, { gx: 0.6 }); A.key(g(21) + 0.4, 0.6, { lean: 0 }); po(A, g(21) + 0.4, "hang", 0.7);
  // 22
  po(P, L(21).b + 0.1, "lap", 0.6, { bib: "lap" });
  ex(A, g(22), "amere", 0.5); ex(A, W(22, "J'ai") - 0.3, "degout", 0.5);
  // 23 : mains jointes sur la Bible, regard bienveillant
  po(P, g(23), "joint", 0.7, { bib: "lap" }); ex(P, g(23), "compatissant", 0.5, { gx: 0.6, gy: -0.3 });
  // 24 : Annabelle prend son sac et part vers la droite
  ex(A, g(24), "froide", 0.4, { gx: 0.7 }); po(A, g(24), "bag", 0.5, { bag: "hand" });
  const go = W(24, "Et") - 0.2, stopX = 760;
  A.key(go, L(24).b + 0.6 - go, { x: stopX, walk: Math.PI * 2 * Math.round((L(24).b + 0.6 - go) / 0.65) }, true);
  ex(P, go, "inquiet", 0.5, { gx: 0.4 });
  // 25 : le pasteur se lève, main tendue
  P.key(g(25), 0.7, { stand: 1, flip: 1, lean: 4 }); po(P, g(25), "reach", 0.6, { bib: "hand" }); ex(P, g(25), "inquiet", 0.4, { gx: 0.7 });
  // 26 : Annabelle s'arrête, tourne la tête de profil, puis sort
  A.key(g(26), 0.5, { flip: -1, turn: 1 }); ex(A, g(26), "froide", 0.4, { gx: 0.8 });
  const out = L(26).b + 0.4;
  A.key(out, 0.4, { flip: 1, turn: 0 }); A.key(out + 0.3, 1.6, { x: 1350, walk: Math.PI * 2 * 3 + Math.PI * 4 * Math.round(stopX / 1000) }, true);
  // après 26 : église vide, le pasteur seul, yeux fermés, mains jointes
  const E0 = F.empty;
  P.key(out + 0.6, 0.7, { flip: -1, lean: 0 }); po(P, out + 0.6, "joint", 0.7, { bib: "hand" }); ex(P, out + 0.8, "priere", 0.8);
  A.sort(); P.sort();

  // ── Monde : décor, personnages ──────────────────────────────────────
  const layers = { bg: $("#bg"), mid: $("#mid"), front: $("#front") };
  layers.bg.insertAdjacentHTML("beforeend", DECOR.CHURCH_BG); layers.mid.insertAdjacentHTML("beforeend", DECOR.CHURCH_MID);
  const RA = RIG.make("annabelle", "a"), RP = RIG.make("pastor", "p");
  RA.svg.style.left = "-20px"; RA.svg.style.top = "1040px"; RP.svg.style.left = "620px"; RP.svg.style.top = "1040px";
  layers.front.appendChild(RP.svg); layers.front.appendChild(RA.svg);
  const fans = [...document.querySelectorAll(".fanblades")];
  const dust = $("#dust"); const motes = [];
  for (let i = 0; i < 34; i++) { const e = mk(dust, "<i></i>"); motes.push([e, 60 + rnd() * 960, 560 + rnd() * 820, rnd() * 6.28, 0.3 + rnd() * 0.7, 6 + rnd() * 10]); }
  // caméra (parallaxe : fond 0,55 · milieu 0,8 · avant 1)
  const FAC = { bg: 0.55, mid: 0.8, front: 1 }, ANC = [540, 1150];
  const camVals = (c) => Object.fromEntries(Object.entries(FAC).map(([k, f]) => {
    const z = 1 + (c.z - 1) * f, cx = ANC[0] + (c.cx - ANC[0]) * f, cy = ANC[1] + (c.cy - ANC[1]) * f;
    return [k, { x: ANC[0] - cx * z, y: ANC[1] - cy * z, scale: z }];
  }));
  const shot = (t, d, c, e = "sine.inOut") => { const v = camVals(c); Object.keys(FAC).forEach((k) => tl.to(layers[k], { ...v[k], duration: d, ease: e }, t)); };
  const C = {
    W: { cx: 540, cy: 1150, z: 1 }, W2: { cx: 560, cy: 1170, z: 1.08 }, M: { cx: 540, cy: 1250, z: 1.3 },
    A1: { cx: 380, cy: 1240, z: 1.45 }, A2: { cx: 290, cy: 1228, z: 1.62 }, P1: { cx: 700, cy: 1240, z: 1.45 }, MC: { cx: 560, cy: 1262, z: 1.24 },
  };
  Object.keys(FAC).forEach((k) => tl.set(layers[k], camVals({ cx: 540, cy: 1130, z: 1.05 })[k], 0));
  shot(0, 2.6, C.W);
  shot(sit - 0.3, 2.2, C.M);
  shot(g(3), 2.5, C.A1);
  shot(g(4), 1.6, C.M);
  shot(g(5), L(7).b - g(5), C.A2, "none");
  shot(g(8), 1.6, C.M);
  shot(g(9), 1.4, C.A1);
  shot(g(10), 1.6, C.P1);
  shot(g(11), 0.9, C.A1, "power2.out");
  shot(g(12), 1.6, C.MC);
  shot(g(15), 1.4, C.A1);
  shot(g(16), 1.6, C.MC);
  shot(g(17), 1.4, C.A2);
  shot(g(18), 1.6, C.MC);
  shot(g(19), L(19).b - g(19), C.P1, "none");
  shot(g(20), 1.2, C.W2);
  shot(g(22), L(23).b - g(22), { cx: 520, cy: 1165, z: 1.12 }, "none");
  shot(g(24), 2.4, C.W);
  shot(E0, F.black - E0, { cx: 600, cy: 1140, z: 0.96 }, "none");

  // ── HUD ─────────────────────────────────────────────────────────────
  tl.fromTo(["#logo", "#tag", "#brand"], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.2);
  tl.to(["#logo", "#tag", "#brand"], { opacity: 0, duration: 0.6 }, E0);

  // ── Bulles karaoké ──────────────────────────────────────────────────
  const bubbles = $("#bubbles"); let lastBub = null;
  const inUp = (el, t, o = {}) => tl.fromTo(el, { opacity: 0, y: o.y ?? 30, scale: o.s ?? 0.96 }, { opacity: 1, y: 0, scale: 1, duration: o.d ?? 0.45, ease: o.ease ?? "back.out(1.5)" }, t);
  const outB = (el, t, d = 0.22) => tl.to(el, { opacity: 0, y: -14, duration: d, ease: "power2.in" }, t);
  const karaoke = (tx, ws, col) => {
    let grp = null;
    ws.forEach(([txt, t, hl], j) => {
      if (hl && !grp) { grp = document.createElement("span"); grp.className = "hl"; tx.appendChild(grp); if (!col) tl.fromTo(grp, { "--a": 0 }, { "--a": 1, duration: 0.2, ease: "power2.out" }, t); }
      const s = document.createElement("span"); s.textContent = txt; (hl ? grp : tx).appendChild(s);
      const nextHl = j < ws.length - 1 && ws[j + 1][2];
      if (j < ws.length - 1) (hl && nextHl ? grp : tx).appendChild(document.createTextNode(" "));
      if (!hl || !nextHl) grp = null;
      tl.to(s, { color: col ? (hl ? "#f5a623" : col) : "#1a1a1a", duration: 0.12, ease: "none" }, t);
    });
  };
  F.lines.filter((l) => l.who !== "N").forEach((l) => {
    l.pages.forEach(([i0, i1]) => {
      const ws = l.words.slice(i0, i1);
      const b = mk(bubbles, `<div class="bub ${l.who === "A" ? "L" : "R"}${l.n === 20 ? " hot" : ""}"><div class="who">${l.who === "A" ? "Annabelle" : "Pasteur Yannick"}</div><div class="tx"></div></div>`);
      karaoke(b.querySelector(".tx"), ws);
      const tb = ws[0][1] - 0.18;
      if (lastBub) outB(lastBub, tb - 0.02, 0.18);
      inUp(b, tb); sfx(tb, "bulle", 0.08); lastBub = b;
    });
  });
  outB(lastBub, L(26).b + 0.5, 0.3);

  // ── Cartes versets ──────────────────────────────────────────────────
  const cards = $("#cards");
  const ILL = {
    sam: `<svg viewBox="0 0 832 200"><rect width="832" height="200" fill="#f3e6cc"/><path d="M0 160 Q200 140 420 156 T832 150 V200 H0Z" fill="#e2cfa6"/>
      <path d="M560 160 Q660 70 832 96 V200 H560Z" fill="#d8c193"/>
      <g class="roi" transform="translate(150 158)"><path d="M-22 0 L-18 -70 Q-18 -92 0 -94 Q18 -92 18 -70 L22 0Z" fill="#2b2420"/><circle cx="0" cy="-108" r="15" fill="#2b2420"/>
        <path d="M-14 -122 l5 -12 5 8 4 -10 4 10 5 -8 5 12z" fill="#e2a33a"/><path d="M18 -70 L46 -20" stroke="#2b2420" stroke-width="10" stroke-linecap="round"/><path d="M-22 -10 L-46 0" stroke="#2b2420" stroke-width="9" stroke-linecap="round"/>
        <path d="M-60 0 L-30 -60 L-26 0Z M60 0 L40 -50 L36 0Z" fill="#3d332c" opacity=".7"/></g>
      <g transform="translate(700 92)"><path d="M-12 0 L-10 -44 Q-10 -56 0 -57 Q10 -56 10 -44 L12 0Z" fill="#4a3f36"/><circle cx="0" cy="-66" r="9" fill="#4a3f36"/>
        <path d="M-10 -44 L-30 -64 M10 -44 L28 -66" stroke="#4a3f36" stroke-width="6" stroke-linecap="round"/>
        <g class="cri" stroke="#b5562e" stroke-width="4" stroke-linecap="round"><path d="M-40 -78 l-16 -6"/><path d="M-42 -62 l-20 0"/><path d="M-40 -46 l-16 6"/></g></g></svg>`,
    digue: `<svg viewBox="0 0 832 200"><rect width="832" height="200" fill="#dcebf2"/><rect x="0" y="40" width="380" height="160" fill="#7fb7d4"/>
      <path d="M0 52 Q60 44 120 52 T240 52 T380 52" stroke="#a8d2e6" stroke-width="5" fill="none"/>
      <path d="M380 30 L470 30 L500 200 L360 200 Z" fill="#a08460"/><path d="M380 30 L470 30" stroke="#86694a" stroke-width="8"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${376 + i * 6} ${70 + i * 32} h${100 + i * 8}" stroke="#8b6e4e" stroke-width="3"/>`).join("")}
      <path d="M440 120 L455 128 L448 140 Z" fill="#5f4b33"/>
      <path class="filet" d="M452 128 Q480 150 498 186 Q520 196 832 194" stroke="#7fb7d4" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="14 10"/>
      <rect x="500" y="190" width="332" height="10" fill="#cfe3ec"/></svg>`,
  };
  const card = (t0, t1, ref, html, hls = [], ill) => {
    const el = mk(cards, `<div class="vcard"><div class="ref"><span>${ref}</span><span>LSG</span></div>${html ? `<div class="tx">${html}</div>` : ""}${ill ? `<div class="ill">${ILL[ill]}</div>` : ""}</div>`);
    inUp(el, t0, { y: 40, s: 0.94, d: 0.55, ease: "power3.out" }); tl.to(el, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, t1);
    hls.forEach(([i, t]) => tl.fromTo(el.querySelectorAll("b")[i], { "--a": 0 }, { "--a": 1, duration: 0.3 }, t));
    sfx(t0, "page", 0.12);
    return el;
  };
  const c1 = card(W(12, "Deuxième") - 0.3, L(14).b + 0.4, "2 Samuel 16 : 10-12", "", [], "sam");
  tl.fromTo(c1.querySelector(".roi"), { x: -40 }, { x: 140, duration: L(14).b - W(12, "Deuxième"), ease: "none" }, W(12, "Deuxième"));
  tl.fromTo(c1.querySelector(".cri"), { opacity: 0.2 }, { opacity: 1, duration: 0.35, repeat: Math.round((L(14).b - W(12, "Deuxième")) / 0.7), yoyo: true, ease: "sine.inOut" }, W(12, "Deuxième"));
  card(W(16, "Première") - 0.3, L(16).b + 0.4, "1 Thessaloniciens 5 : 18", "Rendez grâces <b>en toutes choses</b>, car c'est à votre égard la volonté de Dieu en Jésus-Christ.", [[0, W(16, "toutes")]]);
  const c3 = card(L(18).a - 0.3, L(18).b + 0.6, "Proverbes 17 : 14", "Commencer une querelle, c'est ouvrir une digue ; avant que la dispute s'anime, <b>retire-toi</b>.", [[0, W(18, "retire-toi.")]], "digue");
  tl.fromTo(c3.querySelector(".filet"), { strokeDashoffset: 0 }, { strokeDashoffset: -240, duration: L(18).b - L(18).a + 1, ease: "none" }, L(18).a - 0.3);
  card(W(21, "Première") - 0.3, L(21).b + 0.4, "1 Corinthiens 6 : 7", "C'est déjà certes un défaut chez vous que d'avoir des procès les uns avec les autres. Pourquoi ne souffrez-vous pas plutôt <b>quelque injustice</b> ? Pourquoi ne vous laissez-vous pas plutôt dépouiller ?", [[0, W(21, "quelque")]]);

  // ── Transition et narration ─────────────────────────────────────────
  const NB = F.black, N0 = NB + 1.0;
  tl.fromTo("#black", { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "sine.inOut" }, NB);
  tl.set("#narr", { opacity: 1 }, N0); tl.set("#black", { opacity: 0 }, N0 + 0.01);
  const scn = (sel, t0, t1, z0 = 1, z1 = 1.06) => {
    tl.fromTo(sel, { opacity: 0, scale: z0 }, { opacity: 1, duration: 0.7, ease: "sine.inOut" }, t0);
    tl.to(sel, { scale: z1, duration: t1 - t0 + 0.6, ease: "none" }, t0);
    tl.to(sel, { opacity: 0, duration: 0.6, ease: "sine.inOut" }, t1);
  };
  $("#s-home").insertAdjacentHTML("afterbegin", DECOR.HOME); $("#s-ecg").insertAdjacentHTML("afterbegin", DECOR.ECG);
  $("#s-street").insertAdjacentHTML("afterbegin", DECOR.STREET); $("#s-corr").insertAdjacentHTML("afterbegin", DECOR.CORRIDOR);
  const RH = RIG.make("annabelle", "h", { chair: "#2a3047" }), RS = RIG.make("annabelle", "s", { noChair: true }), RC = RIG.make("annabelle", "c", { noChair: true });
  mk($("#s-home"), `<div class="rigbox" style="left:150px;top:860px"></div>`).appendChild(RH.svg);
  mk($("#s-street"), `<div class="rigbox" style="left:-60px;top:1040px;width:300px;height:450px"></div>`).appendChild(RS.svg);
  mk($("#s-corr"), `<div class="rigbox" style="left:300px;top:1180px;width:420px;height:630px"></div>`).appendChild(RC.svg);
  // 27 : DEUX MOIS PLUS TARD qui s'écrit
  const typed = $("#typed"), TXT = "DEUX MOIS PLUS TARD";
  [...TXT].forEach((ch, i) => { const s = document.createElement("span"); s.textContent = ch; s.style.opacity = 0; typed.appendChild(s); tl.set(s, { opacity: 1 }, L(27).a - 0.2 + i * Math.min(0.06, (L(27).b - L(27).a + 0.3) / TXT.length)); });
  sfx(L(27).a - 0.2, "clic", 0.15);
  tl.to(typed, { opacity: 0, duration: 0.5 }, L(28).a - 0.6);
  // 28 : chez elle, le soir ; 29 : moniteur ; 30 : vers MIDIGRAD puis couloir ; 31 : À SUIVRE…
  scn("#s-home", L(28).a - 0.5, L(29).a - 0.6, 1, 1.07);
  scn("#s-ecg", L(29).a - 0.6, L(30).a - 0.5, 1, 1.04);
  tl.fromTo("#ecgline", { strokeDashoffset: 2200 }, { strokeDashoffset: 0, duration: L(30).a - L(29).a + 0.4, ease: "none" }, L(29).a - 0.5);
  tl.fromTo("#diag", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, W(29, "insuffisance") - 0.3);
  const cut30 = W(30, "aller") - 0.4;
  tl.to("#diag", { opacity: 0, duration: 0.5 }, L(30).a - 0.5);
  scn("#s-street", L(30).a - 0.5, cut30, 1, 1.05);
  scn("#s-corr", cut30, L(31).a - 0.5, 1, 1.12);
  tl.fromTo("#suite", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.4, ease: "sine.inOut" }, L(31).a - 0.4);
  tl.to("#suite", { scale: 1.035, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut" }, L(31).a + 1.0);
  tl.to("#suite", { opacity: 0, duration: 0.6 }, F.fin - 0.6);
  tl.fromTo("#fin", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "sine.inOut" }, F.fin);
  tl.fromTo("#fin img", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.1, ease: "power2.out" }, F.fin + 0.2);
  // sous-titres karaoké de la narration
  const subs = $("#subs"); let lastSub = null;
  F.lines.filter((l) => l.who === "N" && l.n !== 27 && l.n !== 31).forEach((l) => l.pages.forEach(([i0, i1]) => {
    const ws = l.words.slice(i0, i1), s = mk(subs, `<div class="sub"></div>`);
    karaoke(s, ws, "#ffffff");
    const t = ws[0][1] - 0.2;
    if (lastSub) tl.to(lastSub, { opacity: 0, duration: 0.25 }, t - 0.05);
    tl.fromTo(s, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t); lastSub = s;
  }));
  tl.to(lastSub, { opacity: 0, duration: 0.4 }, L(30).b + 0.4);
  // pistes des Annabelle de la narration
  const H = track({ stand: 0, arms: POSE.lap, gx: 0.9, gy: -0.2, ...E.triste, bag: "none", flip: 1 });
  H.key(W(28, "son") - 0.3, 0.9, { arms: POSE.chest, lean: 9, head: 9, lid: 0.55, bin: 1, mouth: "frown", gy: 1 });
  const S = track({ stand: 1, flip: 1, arms: POSE.bag, bag: "hand", ...E.souci, gx: 0.6, x: 0, walk: 0 });
  S.key(L(30).a - 0.5, cut30 - L(30).a + 0.6, { x: 900, walk: Math.PI * 2 * 6 }, true);
  const Cc = track({ stand: 1, flip: 1, arms: POSE.bag, bag: "hand", ...E.souci, gx: 0.6, x: 0, walk: 0, sc: 1 });
  Cc.key(cut30, L(31).a - cut30, { x: 120, walk: Math.PI * 2 * 4, sc: 0.8, y: -60 }, true);
  RC.svg.style.filter = "brightness(.35)";

  // ── Mise à jour par image ───────────────────────────────────────────
  const speakers = F.lines.filter((l) => l.who !== "N").map((l) => [l.who, l.a, l.b]);
  const speaking = (who, t) => speakers.some(([w, a, b]) => w === who && t >= a - 0.05 && t <= b + 0.05);
  const blinks = (n) => { const out = []; let t = 1 + rnd() * 2; while (t < DUR) { out.push(t); t += 2 + rnd() * 3; } return out; };
  const BL = { A: blinks(), P: blinks(), H: blinks() };
  const blinkAt = (list, t) => { for (const b of list) { const d = t - b; if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI); } return 0; };
  const nods = { A: [], P: [] }; // petits hochements de celui qui écoute
  ["A", "P"].forEach((w) => { let t = 2; while (t < DUR) { nods[w].push(t); t += 3.5 + rnd() * 3; } });
  const nodAt = (list, t) => { for (const b of list) { const d = t - b; if (d >= 0 && d < 0.9) return Math.sin((d / 0.9) * Math.PI); } return 0; };
  const MOUTHS = ["closed", "mi"], VOC = { a: "open", o: "o", i: "i" };
  const lipShape = (t) => {
    const f = Math.round(t * FPS), lv = +(F.lev[f] || 0), v = F.voc[f] || "a";
    return lv < 2 ? "closed" : lv < 4 ? "mi" : VOC[v] || "open";
  };
  const lastBlur = {};
  const applyRig = (id, R, st, t, who, svgEl) => {
    const talking = who && speaking(who, t);
    const s = { ...st };
    if (talking) s.mouth = lipShape(t);
    s.lid = Math.max(s.lid || 0, blinkAt(BL[id] || BL.A, t));
    s.breathe = 0.008 * Math.sin((t / 3.6) * 6.283 + (id === "P" ? 1.7 : 0));
    if (who && !talking && t < F.empty) s.nod = (s.nod || 0) + 4 * nodAt(nods[who], t);
    R.set(s);
    if (svgEl) {
      let bl = 0;
      if (who && t > 2.5 && t < F.empty) { const other = who === "A" ? "P" : "A"; if (!talking && speaking(other, t)) bl = 2.4; }
      const k = bl.toFixed(1);
      if (lastBlur[id] !== k) { svgEl.style.filter = bl ? `blur(${k}px)` : "none"; lastBlur[id] = k; }
    }
  };
  const world = $("#world"), warm = $("#warm"), cool = $("#cool");
  let lastF = "";
  const T17 = L(17).a, T23 = L(23).b, T24 = L(24).a - 0.5;
  function update(t) {
    // personnages
    applyRig("A", RA, A.at(t), t, "A", RA.svg);
    applyRig("P", RP, P.at(t), t, "P", RP.svg);
    if (t > F.black) { RH.set({ ...H.at(t), lid: Math.max(H.at(t).lid, blinkAt(BL.H, t)), breathe: 0.01 * Math.sin(t * 1.6) }); RS.set(S.at(t)); RC.set(Cc.at(t)); }
    // lumière : chaude → plus grise à partir de 17 → légèrement sombre de 24 à 26
    const gr = clamp((t - T17) / (T23 - T17)), dk = clamp((t - T24) / 2.5);
    const flt = `saturate(${(1 - 0.28 * gr).toFixed(3)}) brightness(${(1 - 0.05 * gr - 0.13 * dk).toFixed(3)})`;
    if (flt !== lastF) { world.style.filter = flt; lastF = flt; }
    warm.style.opacity = (0.9 * (1 - 0.75 * gr) * (1 - 0.6 * dk)).toFixed(3);
    cool.style.opacity = (0.1 * gr + 0.08 * dk).toFixed(3);
    // ventilateurs, poussière
    fans.forEach((f, i) => f.setAttribute("transform", `rotate(${((t * 210 + i * 40) % 360).toFixed(1)})`));
    motes.forEach(([e, x0, y0, ph, sp, amp]) => {
      const y = y0 - ((t * 14 * sp) % 260), x = x0 + amp * Math.sin(t * 0.5 * sp + ph);
      e.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      e.style.opacity = (0.25 + 0.35 * Math.sin(t * 0.8 + ph) ** 2) * (1 - 0.7 * gr);
    });
    // grain de la narration
    if (t > F.black) { const f = Math.floor(t * FPS); $("#grain").style.transform = `translate(${(f * 37) % 64}px, ${(f * 53) % 64}px)`; }
  }
  const proxy = { v: 0 };
  tl.to(proxy, { v: DUR, duration: DUR, ease: "none", modifiers: { v: (v) => { update(parseFloat(v)); return v; } } }, 0);
  update(0);
  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__film = { tl, SFX, update };
})();
