// « Ma part suffit » partie 2 — scène 3D (Three.js) + personnages illustrés (plaques SVG articulées) + textes HTML.
// Tout ce qui dépend de l'image (caméra 3D, lumière, personnages, ECG, rideau, poussière) est une fonction pure du temps.
window.startFilm = function (ROOM) {
  const F = window.FILM, DUR = F.dur, FPS = F.fps;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const mk = (parent, html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); const el = d.firstElementChild; parent.appendChild(el); return el; };
  const LN = Object.fromEntries(F.lines.map((l) => [l.n, l])), L = (n) => LN[n];
  const W = (n, w, k = 0) => { let c = 0; for (const x of L(n).words) if (x[0].includes(w)) { if (c === k) return x[1]; c++; } throw new Error(n + " " + w); };
  const WX = (n, w) => { const x = L(n).words.find((x) => x[0] === w); if (!x) throw new Error(n + " " + w); return x[1]; };
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  function track(base) {
    const keys = [];
    return {
      key(t, d, v, lin) { keys.push({ t, d: Math.max(d, 0.001), v, lin }); keys.sort((a, b) => a.t - b.t); return this; },
      at(t) {
        const s = JSON.parse(JSON.stringify(base));
        for (const k of keys) {
          if (k.t > t) break;
          const p0 = clamp((t - k.t) / k.d), p = k.lin ? p0 : ease(p0);
          for (const [prop, v] of Object.entries(k.v)) {
            if (typeof v === "number") s[prop] = (s[prop] ?? 0) + (v - (s[prop] ?? 0)) * p;
            else if (Array.isArray(v)) s[prop] = v.map((x, i) => (s[prop]?.[i] ?? 0) + (x - (s[prop]?.[i] ?? 0)) * p);
            else if (p >= 0.5) s[prop] = v;
          }
        }
        return s;
      },
    };
  }
  const g = (n) => L(n).a - 0.2;

  // ── Expressions (modérées) et poses ─────────────────────────────────
  const E = {
    faible: { lid: 0.45, bin: 0.7, bfr: 0, bup: 0, gx: 0.5, gy: 0.3, head: 7, nod: 4, mouth: "closed" },
    triste: { lid: 0.42, bin: 1, bfr: 0, bup: 0, gx: 0.3, gy: 0.9, head: 6, nod: 4, mouth: "frown" },
    emue: { lid: 0.35, bin: 0.9, bfr: 0, bup: 0, gx: 0.6, gy: 0.2, head: 5, nod: 3, mouth: "soft" },
    pleurs: { lid: 0.62, bin: 1, bfr: 0, bup: 0, gx: 0, gy: 1, head: 9, nod: 6, mouth: "frown" },
    pensive: { lid: 0.3, bin: 0.4, bfr: 0, bup: 0, gx: -0.2, gy: 0.1, head: 4, nod: 2, mouth: "closed" },
    ecoute: { lid: 0.3, bin: 0.5, bfr: 0, bup: 0, gx: 0.7, gy: 0, head: 5, nod: 2, mouth: "closed" },
    gratitude: { lid: 0.3, bin: 0.55, bfr: 0, bup: 0, gx: 0.6, gy: 0, head: 4, nod: 2, mouth: "smile" },
    paisible: { lid: 1, bin: 0.1, bfr: 0, bup: 0, gx: 0, gy: 0, head: 4, nod: 2, mouth: "smile" },
    doux: { lid: 0.18, bin: 0.3, bfr: 0, bup: 0, gx: 0.6, gy: 0.2, head: 7, nod: 2, mouth: "soft" },
    pensif: { lid: 0.25, bin: 0, bfr: 0.2, bup: 0, gx: -1, gy: -0.5, head: 4, nod: 3, mouth: "tight" },
    serieux: { lid: 0.12, bin: 0, bfr: 0.2, bup: 0, gx: 0.7, gy: 0, head: 1, nod: 0, mouth: "tight" },
    lecture: { lid: 0.48, bin: 0, bfr: 0, bup: 0, gx: 0.2, gy: 1, head: 9, nod: 6, mouth: "closed" },
    heureux: { lid: 0.1, bin: 0, bfr: 0, bup: 0.3, gx: 0.6, gy: 0, head: 3, nod: 0, mouth: "smile" },
    // gros plans (progression émotionnelle)
    blessee: { lid: 0.32, bin: 0.55, bfr: 0.35, bup: 0, gx: -0.5, gy: 0.2, head: -2, nod: 0, mouth: "tight" },
    peine: { lid: 0.42, bin: 0.9, bfr: 0, bup: 0, gx: 0.3, gy: 0.6, head: 5, nod: 3, mouth: "quiver" },
    larmes: { lid: 0.5, bin: 1, bfr: 0, bup: 0, gx: 0.2, gy: 0.8, head: 7, nod: 4, mouth: "quiver" },
    sanglot: { lid: 0.56, bin: 1, bfr: 0.1, bup: 0, gx: 0, gy: 1, head: 10, nod: 6, mouth: "sob" },
    honte: { lid: 1, bin: 1, bfr: 0.15, bup: 0, gx: 0, gy: 1, head: 16, nod: 11, mouth: "quiver" },
    soulagee: { lid: 0.34, bin: 0.5, bfr: 0, bup: 0, gx: 0.6, gy: 0.1, head: 4, nod: 2, mouth: "smileT" },
    souffrante: { lid: 0.46, bin: 0.7, bfr: 0.1, bup: 0, gx: 0.5, gy: 0.15, head: 5, nod: 3, mouth: "mi" },
    inquiet: { lid: 0.18, bin: 0.9, bfr: 0.25, bup: 0, gx: 0.2, gy: 0, head: 2, nod: 0, mouth: "tight" },
  };
  // cinématique inverse du bras (repère du personnage, non retourné) : main posée sur un point (bouche, poitrine, oreille…)
  const UA = 125, FA2 = 127;
  const ik = (sh, tg) => {
    const dx = tg[0] - sh[0], dy = tg[1] - sh[1], D = clamp(Math.hypot(dx, dy), Math.abs(UA - FA2) + 2, UA + FA2 - 2);
    const phi = Math.atan2(-dx, dy), al = Math.acos((UA * UA + D * D - FA2 * FA2) / (2 * UA * D)), be = Math.acos((UA * UA + FA2 * FA2 - D * D) / (2 * UA * FA2));
    const sol = [-1, 1].map((bs) => { const t1 = phi + bs * al; return { t1, t2: -bs * (Math.PI - be), ey: sh[1] + UA * Math.cos(t1) }; }).sort((a, b) => b.ey - a.ey)[0];
    return [(sol.t1 * 180) / Math.PI, (sol.t2 * 180) / Math.PI];
  };
  const SHA = [225, 365], SHB = [375, 365];
  const armsIK = (a, b) => [...(a ? ik(SHA, a) : [8, -40]), ...(b ? ik(SHB, b) : [-6, -40])];
  const POSE = {
    lap: [0, -65, -10, -50], joint: [18, -122, -18, 122], face: [0, -65, 72, 148], chin: [0, -65, 72, 148], read: [-10, -95, 10, 95],
    open: [-30, -70, -45, -65], bible: [-5, -60, -10, -45], hug: [-62, -48, -78, -30], hang: [5, 0, -5, 0], rest: [8, -40, -6, -40],
    mouth: armsIK(null, [322, 316]), chestH: armsIK([302, 432], null), chest2: armsIK([300, 440], [338, 300]),
  };
  const ex = (T, t, k, d = 0.4, more = {}) => T.key(t, d, { ...E[k], ...more });
  const po = (T, t, k, d = 0.5, more = {}) => T.key(t, d, { arms: POSE[k], ...more });
  const A = track({ flip: 1, stand: 0, lean: -8, arms: POSE.rest, ...E.faible, turn: 0, tear: 0, bag: "none", sc: 1 });
  const P = track({ flip: -1, stand: 0, lean: 0, arms: POSE.bible, ...E.doux, turn: 0, bib: "lap", sc: 1 });
  const AW = track({ v: 0.6 }); // amplitude de respiration d'Annabelle (faible au début)
  // affect d'Annabelle (yeux humides, rougeur, tremblement, menton, sanglots, paupière inférieure) et larmes
  const AF = track({ wet: 0.15, red: 0, trem: 0.05, chin: 0, sob: 0, lidlo: 0 });
  const LEV = [null, { wet: 0.3, red: 0.05, trem: 0.15, chin: 0.25, sob: 0, lidlo: 0.1 }, { wet: 0.65, red: 0.25, trem: 0.4, chin: 0.4, sob: 0.1, lidlo: 0.3 },
    { wet: 0.85, red: 0.45, trem: 0.6, chin: 0.6, sob: 0.3, lidlo: 0.45 }, { wet: 0.95, red: 0.6, trem: 0.8, chin: 0.8, sob: 0.55, lidlo: 0.6 },
    { wet: 1, red: 0.7, trem: 0.7, chin: 0.65, sob: 0.4, lidlo: 0.2 }, { wet: 0.75, red: 0.4, trem: 0.18, chin: 0.1, sob: 0, lidlo: 0.3 }];
  const EXK = [null, "blessee", "peine", "larmes", "sanglot", "honte", "soulagee"];
  const TE = []; // larmes : [canal, début, durée]
  const tears = (t0, t1, every, chans) => { let t = t0, k = 0; while (t < t1) { TE.push([chans[k % chans.length], t, 2.8]); k++; t += every * (0.8 + 0.4 * rnd()); } };
  // 01–03
  ex(A, g(1), "faible", 0.5, { mouth: "soft" }); ex(P, g(2), "doux", 0.5); po(P, g(2), "open", 0.6); po(P, L(2).b + 0.3, "bible", 0.6);
  ex(A, g(3), "triste", 0.5); AF.key(W(3, "n'a") - 0.3, 1.0, { wet: 0.5, trem: 0.45, chin: 0.35, red: 0.15 });
  ex(A, W(3, "pourquoi") - 0.4, "emue", 0.5); AF.key(W(3, "pourquoi") - 0.4, 1.2, { wet: 0.7, trem: 0.5, red: 0.25 }); TE.push([0, W(3, "pourquoi"), 2.8]);
  ex(P, g(3) + 0.5, "doux", 0.5);
  // 04–05
  ex(P, g(4), "doux", 0.5); ex(P, W(4, "Dieu,") - 0.3, "serieux", 0.5); po(P, W(4, "Dieu,") - 0.2, "open", 0.6);
  ex(P, W(4, "Hummmm") - 0.2, "pensif", 0.5); po(P, W(4, "Hummmm") - 0.2, "chin", 0.7);
  po(P, W(4, "Job") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(4, "Job") - 0.2, "lecture", 0.5);
  ex(P, WX(4, "Ma") - 0.3, "serieux", 0.5, { lean: 5 }); po(P, WX(4, "Ma") - 0.2, "bible", 0.6, { bib: "lap" });
  ex(P, W(5, "Une") - 0.3, "doux", 0.5); ex(P, W(5, "Tu", 2) - 0.3, "serieux", 0.5);
  po(P, W(5, "Première") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(5, "Première") - 0.2, "lecture", 0.5);
  ex(A, g(4) + 0.6, "ecoute", 0.5);
  // 06 : en pleurs
  ex(P, L(5).b, "doux", 0.5, { lean: 0 }); po(P, L(5).b + 0.2, "bible", 0.6, { bib: "lap" });
  ex(A, g(6), "pleurs", 0.5, { mouth: "quiver" }); po(A, W(6, "Oui,") - 0.3, "chest2", 0.8); AF.key(g(6), 1.2, LEV[4]); tears(g(6) + 0.3, L(6).b, 2.2, [0, 1, 2]);
  // 07 : la question, puis silence pensif
  po(A, L(6).b + 0.2, "rest", 0.8); ex(P, g(7), "serieux", 0.4, { lean: 6 });
  ex(A, g(7) + 0.4, "pensive", 0.6, { mouth: "quiver" }); AF.key(g(7) + 0.4, 2, LEV[3]);
  // 09–13 : longue explication
  ex(P, g(9), "doux", 0.5, { lean: 3 });
  ex(P, g(10), "serieux", 0.5); po(P, W(10, "Romains") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(10, "Romains") - 0.2, "lecture", 0.5);
  ex(P, L(10).b - 0.6, "doux", 0.5); po(P, L(10).b + 0.1, "open", 0.7, { bib: "lap" });
  ex(P, g(11), "serieux", 0.5); ex(P, W(11, "L'apôtre") - 0.3, "doux", 0.5); po(P, W(11, "Si") - 0.3, "bible", 0.7);
  ex(P, g(12), "pensif", 0.5); po(P, g(12), "chin", 0.7); ex(P, W(12, "En") - 0.3, "serieux", 0.5, { lean: 5 }); po(P, W(12, "En") - 0.3, "open", 0.7);
  ex(P, W(12, "Tu", 0) - 0.3, "doux", 0.5); po(P, W(12, "Tu", 0) - 0.3, "bible", 0.7);
  ex(P, g(13), "doux", 0.5, { lean: 2 }); po(P, W(13, "imitateurs") - 0.5, "open", 0.7); ex(P, W(13, "Tu", 0) - 0.3, "serieux", 0.5); po(P, W(13, "Tu", 0) - 0.3, "bible", 0.6);
  // gros plans : expression, affect, larmes, mains
  F.cu.forEach(([a, b, k]) => {
    ex(A, a - 0.4, EXK[k], 0.9); AF.key(a - 0.4, 1.6, LEV[k]);
    if (k === 2) TE.push([1, b - 2.6, 3.2]);
    if (k === 3) tears(a + 0.9, b - 0.5, 3.3, [0, 1]);
    if (k === 4) tears(a + 0.6, b - 0.3, 2.5, [0, 1, 2]);
    if (k === 5) tears(a + 0.8, b - 0.4, 2.9, [1, 0, 2]);
    if (k === 6) TE.push([0, a + 0.9, 3.0]);
    if (k === 4 && b - a > 6) { po(A, a + 0.3, "mouth", 1.1); po(A, a + (b - a) * 0.6, "chestH", 1.0); }
    else if (k >= 3 && k <= 5) po(A, a + 0.4, "chestH", 1.1);
    else po(A, a, "rest", 0.8);
  });
  // 14 : sourire à travers les larmes, mains jointes
  ex(A, g(14), "gratitude", 0.5, { mouth: "smileT" }); po(A, g(14), "joint", 0.7); AF.key(g(14), 2, { wet: 0.8, red: 0.45, trem: 0.25, chin: 0.2, sob: 0, lidlo: 0.3 });
  TE.push([0, g(14) + 0.8, 3.0]); TE.push([1, g(14) + 4.6, 3.0]);
  ex(P, g(14) + 0.4, "doux", 0.5, { lean: 0 }); AW.key(g(14), 6, { v: 1 });
  // 15–16 : pasteur heureux, main sur la Bible
  ex(P, g(15), "heureux", 0.5); po(P, g(15), "bible", 0.6, { bib: "lap" }); ex(A, g(15) + 0.5, "gratitude", 0.6, { mouth: "smileT" });
  ex(P, g(16), "doux", 0.5); ex(P, W(16, "Rien") - 0.3, "heureux", 0.5); po(P, W(16, "Rien") - 0.3, "open", 0.6); po(P, W(16, "La") - 0.2, "bible", 0.6);
  ex(A, L(16).a + 1, "gratitude", 0.6, { mouth: "smileT" }); po(A, L(16).a + 1, "rest", 0.8);
  // 17 : paisible
  ex(A, g(17), "paisible", 0.6); po(A, g(17), "joint", 0.6); ex(P, g(17) + 0.3, "heureux", 0.5); AF.key(g(17), 2, { wet: 0.4, red: 0.2, trem: 0, chin: 0, sob: 0, lidlo: 0.1 });
  TE.sort((x, y) => x[1] - y[1]);
  const dropsAt = (t) => [0, 1, 2].map((c) => {
    let e = null; for (const x of TE) { if (x[1] > t) break; if (x[0] === c) e = x; }
    if (!e) return [0, 0]; const p = (t - e[1]) / e[2]; return [p >= 1 ? 1 : p, p < 1 ? 1 : clamp(1 - (t - e[1] - e[2]) / 7)];
  });
  const noise = (t, k) => Math.sin(t * (13.1 + k * 3.7) + k * 1.9) * 0.6 + Math.sin(t * (23.7 + k * 5.3) + k) * 0.4;
  const cuAt = (t) => { for (let i = 0; i < F.cu.length; i++) { const c = F.cu[i]; if (t >= c[0] && t < c[1]) return [c, i]; } return null; };

  // ── Caméra 3D par réplique ──────────────────────────────────────────
  const CAM = {
    DOOR: { pos: [-1.75, 1.6, 3.3], tgt: [-0.25, 0.95, -0.8] }, WIDE: { pos: [0.05, 1.55, 3.0], tgt: [-0.1, 0.98, -0.7] },
    MID: { pos: [0.0, 1.4, 2.2], tgt: [-0.05, 1.15, -0.6] }, AC: { pos: [-0.3, 1.5, 0.95], tgt: [-0.6, 1.5, -0.95] },
    AXC: { pos: [-0.46, 1.46, 0.95], tgt: [-0.62, 1.47, -0.95] }, OTS: { pos: [-0.95, 1.25, 0.55], tgt: [0.5, 0.98, -0.35] },
    PC: { pos: [0.1, 1.35, 1.1], tgt: [0.5, 1.22, -0.35] }, AL: { pos: [-0.15, 1.35, 1.35], tgt: [-0.6, 1.2, -0.95] },
    MIDL: { pos: [-0.45, 1.32, 2.1], tgt: [-0.1, 1.0, -0.6] }, MIDR: { pos: [0.45, 1.32, 2.05], tgt: [-0.1, 1.0, -0.6] }, PULL: { pos: [0.15, 1.75, 3.7], tgt: [-0.1, 0.92, -0.8] },
  };
  const C = track({ ...CAM.DOOR, fov: 50 });
  const shot = (t, d, k, lin) => C.key(t, d, { pos: CAM[k].pos, tgt: CAM[k].tgt }, lin);
  shot(F.room, L(1).b + 0.4 - F.room, "WIDE"); shot(g(2), 2.0, "MID"); shot(g(3), 2.5, "AC");
  shot(g(4), 1.8, "PC"); shot(W(4, "Hummmm") - 0.3, 2.0, "MIDR"); shot(g(5), 2.0, "PC"); shot(W(5, "Première") - 0.4, L(5).b - W(5, "Première"), "MIDR"); shot(g(6), 2.0, "AXC");
  shot(g(7), 1.4, "PC"); shot(L(7).b - 0.1, 0.9, "AL");
  const seq = ["MID", "PC", "AL", "MIDL", "PC", "AL", "MIDR"]; let si = 0;
  for (let n = 9; n <= 13; n++) { const l = L(n), len = l.b - l.a, parts = Math.max(1, Math.round(len / 9)); for (let k = 0; k < parts; k++) shot(l.a - 0.3 + (k * len) / parts, 2.6, seq[si++ % seq.length]); }
  shot(g(14), 2.2, "AXC"); shot(L(14).b + 0.2, 0.01, "PC"); shot(g(15), 2.0, "MID"); shot(g(16) + 4, L(16).b - g(16) - 4, "MIDL");
  shot(g(17), F.end17 - g(17) + 2.2, "PULL");
  // ── Lumière ─────────────────────────────────────────────────────────
  const LT = track({ cool: 1, warm: 0, beam: 0, pastor: 0 });
  LT.key(g(9), 6, { cool: 0.4, pastor: 1.6 }); LT.key(g(14), 5, { cool: 0, warm: 1, beam: 1, pastor: 0.6 });

  // ── Personnages (plaques articulées projetées dans la scène 3D) ─────
  const CU_FACE = [-0.585, 1.38, -0.95];
  const camAt = (t) => {
    const c = cuAt(t); if (!c) return C.at(t);
    const [[a, b], i] = c, u = (t - a) / (b - a), d = 1.42 - 0.22 * u, side = i % 2 ? 0.13 : 0.24;  // zoom lent
    return { pos: [CU_FACE[0] + side, CU_FACE[1] + 0.03, CU_FACE[2] + d], tgt: [CU_FACE[0] + 0.02, CU_FACE[1] + 0.17, CU_FACE[2]], fov: 50 };
  };
  const RA = RIG.make("annabelle", "a", { noChair: true, noLegs: true, gown: true });
  const RP = RIG.make("pastor", "p", { noChair: true });
  const plates = $("#plates"); plates.appendChild(RP.svg); plates.appendChild(RA.svg);
  RA.svg.style.clipPath = "inset(-20% -20% 33% -20%)";
  [RA.svg, RP.svg].forEach((s) => { s.style.position = "absolute"; s.style.left = "0"; s.style.top = "0"; s.style.width = "600px"; s.style.height = "900px"; s.style.transformOrigin = "0 0"; s.style.overflow = "visible"; });
  const PL = { A: { el: RA.svg, base: [-0.6, 0.31, -0.95], h: 1.45 }, P: { el: RP.svg, base: [0.5, 0.0, -0.35], h: 1.45 } };

  // ── Bulles, cartes ──────────────────────────────────────────────────
  const inUp = (el, t, o = {}) => tl.fromTo(el, { opacity: 0, y: o.y ?? 30, scale: o.s ?? 0.96 }, { opacity: 1, y: 0, scale: 1, duration: o.d ?? 0.45, ease: o.ease ?? "back.out(1.5)" }, t);
  const outB = (el, t, d = 0.22) => tl.to(el, { opacity: 0, y: -14, duration: d, ease: "power2.in" }, t);
  const karaoke = (tx, ws, col) => {
    let grp = null;
    ws.forEach(([txt, t, hl], j) => {
      if (hl && !grp) { grp = document.createElement("span"); grp.className = "hl"; tx.appendChild(grp); if (!col) tl.fromTo(grp, { "--a": 0 }, { "--a": 1, duration: 0.2 }, t); }
      const s = document.createElement("span"); s.textContent = txt; (hl ? grp : tx).appendChild(s);
      const nextHl = j < ws.length - 1 && ws[j + 1][2];
      if (j < ws.length - 1) (hl && nextHl ? grp : tx).appendChild(document.createTextNode(" "));
      if (!hl || !nextHl) grp = null;
      tl.to(s, { color: col ? (hl ? "#f5a623" : col) : "#1a1a1a", duration: 0.12, ease: "none" }, t);
    });
  };
  const bubbles = $("#bubbles"); let lastBub = null;
  F.lines.filter((l) => l.who !== "N").forEach((l) => l.pages.forEach(([i0, i1]) => {
    const ws = l.words.slice(i0, i1), b = mk(bubbles, `<div class="bub ${l.who === "A" ? "L" : "R"}"><div class="who">${l.who === "A" ? "Annabelle" : "Pasteur Yannick"}</div><div class="tx"></div></div>`);
    karaoke(b.querySelector(".tx"), ws); const tb = ws[0][1] - 0.18;
    if (lastBub) outB(lastBub, tb - 0.02, 0.18); inUp(b, tb); lastBub = b;
  }));
  outB(lastBub, L(17).b + 0.4, 0.3);
  const cards = $("#cards");
  const card = (t0, t1, ref, html, hls = []) => {
    const el = mk(cards, `<div class="vcard"><div class="ref"><span>${ref}</span><span>LSG</span></div><div class="tx">${html}</div></div>`);
    inUp(el, t0, { y: 40, s: 0.94, d: 0.55, ease: "power3.out" }); tl.to(el, { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, t1);
    hls.forEach(([i, t]) => tl.fromTo(el.querySelectorAll("b")[i], { "--a": 0 }, { "--a": 1, duration: 0.3 }, t));
  };
  card(W(4, "Job") - 0.3, WX(4, "Ma") - 0.2, "Job 2 : 10", "Quoi ! nous recevons de Dieu le bien, et nous ne recevrions pas aussi <b>le mal</b> !", [[0, W(4, "mal")]]);
  card(W(5, "Première") - 0.3, L(5).b + 0.4, "1 Thessaloniciens 5 : 18", "Rendez grâces <b>en toutes choses</b>, car c'est à votre égard la volonté de Dieu en Jésus-Christ.", [[0, W(5, "toutes")]]);
  card(W(10, "Romains") - 0.3, W(10, "Romains", 1) - 0.4, "Romains 7 : 15", "Car je ne sais pas ce que je fais : je ne fais point ce que je veux, et je fais <b>ce que je hais</b>.", [[0, W(10, "hais.")]]);
  card(W(10, "Romains", 1) - 0.3, L(10).b + 0.4, "Romains 7 : 24-25", "Misérable que je suis ! Qui me délivrera du corps de cette mort ?… <b>Grâces soient rendues à Dieu</b> par Jésus-Christ notre Seigneur !…", [[0, W(10, "Grâces")]]);
  card(W(16, "Bible") - 0.3, L(16).b + 0.4, "2 Pierre 3 : 9", "Le Seigneur ne tarde pas dans l'accomplissement de la promesse […] mais il use de patience envers vous, voulant qu'aucun ne périsse, mais voulant que tous arrivent <b>à la repentance</b>.", [[0, W(16, "repentance.")]]);

  // ── HUD ─────────────────────────────────────────────────────────────
  tl.fromTo(["#logo", "#tag", "#brand"], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.3);

  // ── Transition et narration (lumineuse) ─────────────────────────────
  const NW = F.end17 + 0.6;
  tl.fromTo("#white", { opacity: 0 }, { opacity: 1, duration: 1.3, ease: "sine.inOut" }, NW);
  tl.set("#narr", { opacity: 1 }, NW + 1.3); tl.to("#white", { opacity: 0, duration: 1.0, ease: "sine.inOut" }, NW + 1.35);
  tl.to(["#logo", "#tag"], { opacity: 0, duration: 0.6 }, NW);
  const scn = (sel, t0, t1, z0 = 1, z1 = 1.06) => {
    tl.fromTo(sel, { opacity: 0, scale: z0 }, { opacity: 1, duration: 0.8, ease: "sine.inOut" }, t0);
    tl.to(sel, { scale: z1, duration: t1 - t0 + 0.8, ease: "none" }, t0);
    tl.to(sel, { opacity: 0, duration: 0.8, ease: "sine.inOut" }, t1);
  };
  $("#s-church").insertAdjacentHTML("afterbegin", `<div class="cl" style="position:absolute;inset:0">${DECOR.CHURCH_BG}</div><div class="cl" style="position:absolute;inset:0">${DECOR.CHURCH_MID}</div>`);
  const R18A = RIG.make("annabelle", "n1", { noChair: true }), R18B = RIG.make("annabelle", "n2", { noChair: true, elder: true, pal: ["#24407a", "#7fc06a", "#e7b64a"] }), R19 = RIG.make("annabelle", "n3", { noChair: true });
  const box = (sel, R, style) => mk($(sel), `<div class="rigbox" style="${style}"></div>`).appendChild(R.svg);
  const famPal = [["#1f6fb2", "#f2c14e", "#e7b64a"], ["#2e7d32", "#f2c14e", "#c9a14a"], ["#8e44ad", "#f2c14e", "#e7b64a"], ["#d35400", "#fff1c9", "#7b1f2b"]];
  const FAM = [RIG.make("pastor", "f1", { noChair: true, husband: true }), RIG.make("annabelle", "f2", { noChair: true, pal: famPal[0] }), RIG.make("pastor", "f3", { noChair: true, husband: true, pal: famPal[1] }), RIG.make("annabelle", "f4", { noChair: true, pal: famPal[2] })];
  [[FAM[0], "left:-30px;top:930px", 1], [FAM[1], "left:250px;top:960px", 1], [FAM[2], "left:560px;top:940px", -1], [FAM[3], "left:760px;top:970px", -1]].forEach(([R, st]) =>
    box("#s-house", R, `${st};width:380px;height:570px;filter:blur(2.4px) brightness(.92)`));
  box("#s-house", R18A, "left:40px;top:860px;width:520px;height:780px"); box("#s-house", R18B, "left:520px;top:860px;width:520px;height:780px"); box("#s-morning", R19, "left:250px;top:780px;width:580px;height:870px");
  const HA = track({ stand: 1, flip: 1, x: -60, arms: POSE.hang, ...E.emue, gx: 0.6, mouth: "soft", bag: "none" }), HB = track({ stand: 1, flip: -1, x: 60, arms: POSE.hang, ...E.serieux, gx: 0.6, mouth: "closed", bag: "none" });
  const n18 = L(18);
  HA.key(W(18, "pardon") - 0.6, 1.2, { arms: POSE.joint, head: 8, nod: 6 }); HB.key(W(18, "reconnu.") - 0.8, 1.0, { ...E.emue, mouth: "soft", gx: 0.6 });
  HA.key(W(18, "accepté") - 0.4, 1.6, { x: 120, arms: POSE.hug, ...E.paisible }); HB.key(W(18, "accepté") - 0.4, 1.6, { x: -120, arms: POSE.hug, ...E.paisible });
  const MO = track({ stand: 1, flip: 1, arms: POSE.hang, ...E.heureux, gx: 0.3, mouth: "smile", bag: "none" });
  scn("#s-house", n18.a - 0.3, L(19).a - 0.6, 1, 1.05);
  scn("#s-morning", L(19).a - 0.6, L(23).a - 0.5, 1.04, 1.0);
  // NOUVELLE SCÈNE : « Dieu lui a donné un enfant » — salon familial doré, mouvement de caméra circulaire
  const SB = $("#s-baby");
  const bbBg = mk(SB, `<div class="ol">${SCENES.BABYROOM}</div>`), bbBack = mk(SB, `<div class="ol"></div>`), bbFront = mk(SB, `<div class="ol"></div>`);
  const BBF = [RIG.make("annabelle", "g1", { noChair: true, pal: famPal[3] }), RIG.make("pastor", "g2", { noChair: true, husband: true, pal: famPal[1] }), RIG.make("annabelle", "g3", { noChair: true, pal: famPal[0] }), RIG.make("pastor", "g4", { noChair: true, husband: true, pal: famPal[2] })];
  [[BBF[0], "left:-20px;top:880px"], [BBF[1], "left:200px;top:850px"], [BBF[2], "left:560px;top:870px"], [BBF[3], "left:780px;top:860px"]].forEach(([R, st]) =>
    mk(bbBack, `<div class="rigbox" style="${st};width:360px;height:540px;filter:blur(2.6px) brightness(.95)"></div>`).appendChild(R.svg));
  const BM = RIG.make("annabelle", "bm", { noChair: true, elder: true, pal: ["#24407a", "#7fc06a", "#e7b64a"] }), BA = RIG.make("annabelle", "ba", { noChair: true }), BH = RIG.make("pastor", "bh", { noChair: true, husband: true });
  const BX = { M: [40, 840, 520], A: [290, 790, 580], H: [600, 760, 580] };
  mk(bbFront, `<div class="rigbox" style="left:${BX.M[0]}px;top:${BX.M[1]}px;width:${BX.M[2]}px;height:${BX.M[2] * 1.5}px"></div>`).appendChild(BM.svg);
  mk(bbFront, `<div class="rigbox" style="left:${BX.H[0]}px;top:${BX.H[1]}px;width:${BX.H[2]}px;height:${BX.H[2] * 1.5}px"></div>`).appendChild(BH.svg);
  mk(bbFront, `<div class="rigbox" style="left:${BX.A[0]}px;top:${BX.A[1]}px;width:${BX.A[2]}px;height:${BX.A[2] * 1.5}px"></div>`).appendChild(BA.svg);
  // repère écran → repère du personnage (debout : le haut du corps est remonté de 130)
  const loc = (bx, flip, X, Y) => { const k = bx[2] / 600, lx = (X - bx[0]) / k; return [flip < 0 ? 600 - lx : lx, (Y - bx[1]) / k + 130]; };
  const BABY_S = 1.75, BABY_C = [BX.A[0] + (BX.A[2] / 600) * 410, BX.A[1] + (BX.A[2] / 600) * (470 - 130)];
  const baby = mk(bbFront, `<div style="position:absolute;left:${BABY_C[0] - 110 * BABY_S}px;top:${BABY_C[1] - 80 * BABY_S}px;width:${220 * BABY_S}px;height:${160 * BABY_S}px">${SCENES.BABY.replace('width="220" height="160"', `width="${220 * BABY_S}" height="${160 * BABY_S}"`)}</div>`);
  const bhand = [BABY_C[0] + 26 * BABY_S + 12, BABY_C[1] - 30 * BABY_S];
  const cradle = [...ik(SHA, loc(BX.A, 1, BABY_C[0] - 70, BABY_C[1] + 40)), ...ik(SHB, loc(BX.A, 1, BABY_C[0] + 60, BABY_C[1] + 30))];
  const mTouch = [-6, -40, ...ik(SHB, loc(BX.M, 1, bhand[0], bhand[1]))];
  const hShoulder = [5, 0, ...ik(SHB, loc(BX.H, -1, BX.A[0] + 0.933 * 375, BX.A[1] + 0.933 * (365 - 130) + 10))];
  const BBt = { M: track({ stand: 1, flip: 1, arms: POSE.hang, ...E.emue, gx: 0.9, gy: 0.7, mouth: "soft", wet: 0.5, bag: "none" }),
    A: { stand: 1, flip: 1, arms: cradle, ...E.heureux, gx: 0.7, gy: 0.9, head: 10, nod: 6, mouth: "smile", wet: 0.35, bag: "none" },
    H: { stand: 1, flip: -1, arms: hShoulder, ...E.heureux, gx: 0.8, gy: 0.6, head: 6, mouth: "smile" } };
  BBt.M.key(L(23).a + 0.3, 1.4, { arms: mTouch, ...E.emue, mouth: "smile", gx: 0.9, gy: 0.8, head: 8 });
  scn("#s-baby", L(23).a - 0.5, L(20).a - 0.5, 1.0, 1.04);
  tl.fromTo("#ecg2 path", { strokeDashoffset: 1600 }, { strokeDashoffset: 0, duration: 2.4, ease: "none" }, L(19).a);
  tl.to("#ecg2", { filter: "drop-shadow(0 0 18px #ffe39a)", duration: 1.2 }, W(19, "santé") - 0.2);
  tl.to("#ecg2 path", { stroke: "#ffe7a3", strokeWidth: 10, duration: 1.2 }, W(19, "santé") - 0.2);
  scn("#s-sky", L(20).a - 0.5, L(22).a - 0.6, 1, 1.08);
  const phrase = (t0, t1, html) => { const el = mk($("#s-sky"), `<div class="pcard">${html}</div>`); tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, t0); tl.to(el, { opacity: 0, duration: 0.6 }, t1); };
  phrase(W(20, "toute") - 0.4, L(20).b, "en <b>toute chose</b>");
  phrase(W(21, "différents.") - 1.2, L(21).b + 0.3, "nous ne sommes <b>pas différents</b>");
  scn("#s-church", L(22).a - 0.6, F.fin - 0.7, 1, 1.07);
  const subs = $("#subs"); let lastSub = null, lastEnd = 0;
  F.lines.filter((l) => l.who === "N").forEach((l) => l.pages.forEach(([i0, i1]) => {
    const ws = l.words.slice(i0, i1), s = mk(subs, `<div class="sub"></div>`); karaoke(s, ws, "#2a1a0a");
    const t = ws[0][1] - 0.2; if (lastSub) tl.to(lastSub, { opacity: 0, duration: 0.25 }, Math.min(t - 0.05, lastEnd + 0.7));
    tl.fromTo(s, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t); lastSub = s; lastEnd = ws[ws.length - 1][1] + 0.4;
  }));
  tl.to(lastSub, { opacity: 0, duration: 0.4 }, L(22).b + 0.3);
  // fin : logo 3D sur fond crème
  tl.to("#narr", { opacity: 0, duration: 0.7 }, F.fin - 0.7); tl.to("#brand", { opacity: 0, duration: 0.5 }, F.fin - 0.7);
  tl.fromTo("#gl", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1.03, duration: 0.9, ease: "power2.out" }, F.fin);
  tl.fromTo("#motfin", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, F.fin + 0.6);
  tl.set("#gl", { opacity: 1 }, 0); tl.set("#gl", { opacity: 0 }, NW + 1.3); tl.set(["#plates", "#bubbles", "#cards"], { opacity: 0 }, NW + 1.3);

  // ── Ouverture (N1) : rue de Douala → malaise → couloir de l'hôpital → porte de la chambre ──
  const OP = $("#open"), T1 = F.fall - 1.7, T2 = F.fall - 0.9, VW = 72;
  const ost = mk(OP, `<div class="oscene" id="o-street"></div>`);
  const lay = (h) => mk(ost, `<div class="ol">${h}</div>`);
  lay(SCENES.SKY); const Lback = lay(SCENES.STREET_BACK), Lroad = lay(SCENES.STREET_ROAD), Lfront = lay(SCENES.STREET_FRONT);
  const MOT = ["m1", "taxi", "m2", "m3"].map((c) => Lroad.querySelector("." + c));
  const annBox = mk(ost, `<div class="obox" style="left:250px;top:860px;width:560px;height:840px;transform-origin:50% 96%"></div>`);
  const RS = RIG.make("annabelle", "s", { noChair: true, propB: `<g transform="translate(8 34) rotate(6) scale(.9)">${SCENES.BIBLE}</g>` }); annBox.appendChild(RS.svg);
  const bibF = mk(ost, `<svg viewBox="-60 -60 120 120" width="120" height="120" style="position:absolute;left:0;top:0;overflow:visible;opacity:0">${SCENES.BIBLE}</svg>`);
  const PAS = [["#5a6b8a", "#4a2c1c", -160, 300, 1730, 1], ["#a0483a", "#5a3a26", 1240, 790, 1745, 1], ["#3f7a5a", "#3a2416", 1300, 960, 1610, 0.8]].map(([b, h, x0, x1, y, sc], i) =>
    ({ el: mk(ost, `<svg viewBox="-80 -360 160 520" width="160" height="520" style="position:absolute;left:0;top:0;overflow:visible;filter:blur(1.6px)">${SCENES.passer("ps" + i, b, h)}</svg>`), x0, x1, y, sc, i }));
  const vign = mk(ost, `<div class="vign"></div>`);
  const xAt = (t) => t < T1 ? VW * t : t < T2 ? VW * T1 + VW * ((t - T1) - (t - T1) ** 2 / (2 * (T2 - T1))) : VW * T1 + (VW * (T2 - T1)) / 2;
  const XT = xAt(T2), NST = Math.max(2, Math.round((XT / VW) * 1.6));
  const oc = mk(OP, `<div class="oscene" id="o-corr"><div class="ol">${SCENES.CORRIDOR2}</div></div>`), ocBg = oc.firstElementChild;
  const pbox = mk(oc, `<div class="obox" style="left:0;top:0;width:600px;height:900px;transform-origin:0 0"></div>`);
  const RW = RIG.make("pastor", "w", { noChair: true, propA: `<g transform="translate(-2 -34) rotate(-18)"><rect x="-13" y="-30" width="26" height="56" rx="6" fill="#1b1b1b"/><rect x="-10" y="-25" width="20" height="42" rx="3" fill="#3a4a6a"/></g>` });
  pbox.appendChild(RW.svg);
  const od = mk(OP, `<div class="oscene" id="o-door">${SCENES.DOOR}</div>`), leaf = od.querySelector(".leaf");
  const TC = F.street_end, TD = F.room - 1.25;
  tl.set(ost, { opacity: 1 }, 0); tl.to(ost, { opacity: 0, duration: 0.6 }, TC + 0.15);
  tl.fromTo(oc, { opacity: 0 }, { opacity: 1, duration: 0.6 }, TC - 0.1); tl.to(oc, { opacity: 0, duration: 0.25 }, TD + 0.25);
  tl.fromTo(od, { opacity: 0 }, { opacity: 1, duration: 0.25 }, TD); tl.to(OP, { opacity: 0, duration: 0.5 }, F.room - 0.3);
  const armSt = armsIK([302, 432], null);
  function updOpen(t) {
    if (t < TC + 0.8) {
      const X = xAt(t), tw = t < F.fall ? t : F.fall + (t - F.fall) * 0.35;   // léger ralenti après le malaise
      Lback.style.transform = `translateX(${(-X * 0.55).toFixed(1)}px)`; Lroad.style.transform = `translateX(${(-X * 0.75).toFixed(1)}px)`; Lfront.style.transform = `translateX(${(-X).toFixed(1)}px)`;
      const mx = [-260 + 330 * tw, -760 + 230 * tw, 1250 - 280 * tw, -980 + 300 * tw];
      MOT.forEach((m, i) => m.setAttribute("transform", `translate(${mx[i].toFixed(1)} 0) scale(${i === 2 ? -1 : 1} 1)`));
      const sway = clamp((t - (F.fall - 1.4)) / 1.0), u = ease(clamp((t - F.fall) / 1.5));
      const st = { ...E.souffrante, stand: 1 - 0.62 * u, flip: 1, walk: Math.min(1, X / XT) * NST * Math.PI, lean: 3 + 5 * sway * Math.sin((t - F.fall) * 4.2) * (1 - u) - 14 * u,
        arms: u > 0 ? armSt.map((v, i) => v + (POSE.hang[i] - v) * u) : [armSt[0], armSt[1], -10, -26], bag: "none", propB: t < F.fall - 0.15,
        lid: Math.min(1, 0.46 + 0.25 * sway + 0.4 * u), head: 5 + 3 * sway * Math.sin(t * 3.1) + 10 * u, nod: 3 + 6 * u, wet: 0.3, red: 0.1,
        breathe: 0.013 * Math.sin((t / 1.05) * 6.283), mouth: u > 0.3 ? "closed" : "mi" };
      st.lid = Math.max(st.lid, u > 0 ? 0 : blinkAt(BL.n, t)); RS.set(st);
      annBox.style.transform = `translateY(${(50 * u).toFixed(1)}px) rotate(${(-58 * u * u).toFixed(2)}deg)`;
      const tb = t - (F.fall - 0.15);
      if (tb > 0) { const fy = Math.min(1710, 1300 + 900 * (tb * 0.6) ** 2), done = fy >= 1710; bibF.style.opacity = 1;
        bibF.style.transform = `translate(${(560 + 70 * Math.min(1, tb)).toFixed(1)}px, ${fy.toFixed(1)}px) rotate(${(done ? 84 : 84 * clamp(tb / 0.75)).toFixed(1)}deg) translate(-60px,-60px)`; }
      const u2 = clamp((t - F.fall) / 1.1); ost.style.filter = u2 > 0 ? `blur(${(4.5 * u2).toFixed(2)}px) saturate(${(1 - 0.2 * u2).toFixed(2)})` : "none"; vign.style.opacity = (0.15 + 0.6 * u2).toFixed(2);
      PAS.forEach((p) => { const r0 = clamp((tw - (F.fall + 0.1)) / 0.55); const x = p.x0 + (p.x1 - p.x0) * ease(r0), ph = (tw - F.fall) * 14;
        p.el.style.opacity = r0 > 0 ? 1 : 0; p.el.style.transform = `translate(${(x - 80).toFixed(1)}px, ${(p.y - 360 * p.sc).toFixed(1)}px) scale(${p.sc})`;
        const sw = r0 < 1 ? 22 * Math.sin(ph + p.i) : 0;
        [["la", sw], ["lb", -sw], ["pa", -sw], ["pb", sw + (r0 >= 1 ? -40 : 0)]].forEach(([c, a]) => p.el.querySelector("." + c).setAttribute("transform", `rotate(${a.toFixed(1)} 0 ${c[0] === "l" ? -10 : -230})`)); });
    }
    if (t > TC - 0.2 && t < TD + 0.6) {
      const v = ease(clamp((t - TC) / (TD + 0.4 - TC))), s = 0.42 + 0.66 * v, fy = 1190 + 760 * v;
      pbox.style.transform = `translate(${(540 - 300 * s - 30 * (1 - v)).toFixed(1)}px, ${(fy - 864 * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
      const wk = t * 2 * Math.PI * 1.5;
      RW.set({ ...E.inquiet, stand: 1, flip: 1, walk: wk, lean: 5, arms: [...ik(SHA, [206, 252]), -6 + 16 * Math.sin(wk), -28], bib: "none", gx: 0.25 + 0.15 * Math.sin(t * 2.3),
        lid: Math.max(0.18, blinkAt(BL.P, t)), breathe: 0.01 * Math.sin(t * 7), mouth: t % 2.4 < 1.0 ? lip(t) === "closed" ? "tight" : "mi" : "tight" });
      ocBg.style.transform = `scale(${(1 + 0.07 * v).toFixed(4)})`; ocBg.style.transformOrigin = "50% 48%";
    }
    if (t > TD - 0.1) { const k = ease(clamp((t - (F.room - 0.9)) / 0.55)); leaf.setAttribute("transform", `translate(200 0) scale(${(1 - 0.86 * k).toFixed(4)} 1) translate(-200 0)`); }
  }

  // ── Mise à jour par image ───────────────────────────────────────────
  const spk = F.lines.filter((l) => l.who !== "N").map((l) => [l.who, l.a, l.b]);
  const speaking = (w, t) => spk.some(([x, a, b]) => x === w && t >= a - 0.05 && t <= b + 0.05);
  const blinks = () => { const o = []; let t = 1 + rnd() * 2; while (t < DUR) { o.push(t); t += 2 + rnd() * 3; } return o; };
  const BL = { A: blinks(), P: blinks(), n: blinks() };
  const blinkAt = (l, t) => { for (const b of l) { const d = t - b; if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI); } return 0; };
  const nods = { A: [], P: [] }; ["A", "P"].forEach((w) => { let t = 3; while (t < DUR) { nods[w].push(t); t += 3.5 + rnd() * 3; } });
  const nodAt = (l, t) => { for (const b of l) { const d = t - b; if (d >= 0 && d < 0.9) return Math.sin((d / 0.9) * Math.PI); } return 0; };
  const VOC = { a: "open", o: "o", i: "i" };
  const lip = (t) => { const f = Math.round(t * FPS), lv = +(F.lev[f] || 0); return lv < 2 ? "closed" : lv < 4 ? "mi" : VOC[F.voc[f]] || "open"; };
  const glc = $("#gl"); let lastBlur = {}, lastGl = "";
  function update(t) {
    if (t < F.room + 0.4) updOpen(t);
    if (t >= F.room - 0.35 && t < NW + 1.4) {
      const cs = camAt(t), ls = LT.at(t), cu = cuAt(t);
      ROOM.render(t, { pos: cs.pos, tgt: cs.tgt, fov: cs.fov, ...ls });
      const near = clamp((2.6 - Math.hypot(cs.pos[0] - cs.tgt[0], cs.pos[2] - cs.tgt[2])) / 1.8);
      const gb = (0.6 + 1.6 * near).toFixed(1); if (gb !== lastGl) { glc.style.filter = `blur(${gb}px)`; lastGl = gb; }
      [["A", RA, A], ["P", RP, P]].forEach(([w, R, T]) => {
        const s = T.at(t), talk = speaking(w, t);
        if (talk) s.mouth = lip(t);
        if (w === "A") {
          const af = AF.at(t), tr = af.trem;
          Object.assign(s, { wet: af.wet, red: af.red, lidlo: af.lidlo, chin: af.chin * (0.75 + 0.25 * noise(t, 6)), drops: dropsAt(t) });
          s.lid += tr * 0.05 * noise(t, 1); s.bin = (s.bin || 0) + tr * 0.1 * noise(t, 2); s.head = (s.head || 0) + tr * 0.7 * noise(t, 3);
          s.mj = [tr * 1.3 * noise(t, 4), tr * 1.1 * noise(t, 5), 1 + tr * 0.05 * noise(t, 7), 1 + tr * 0.09 * noise(t, 8)];
          if (cu) {
            const [[a, , k]] = cu, rel = t - a;
            if (k <= 4) { const ph = (rel / 3.1) % 1, z = Math.floor(rel / 3.1); if (ph > 0.35 && ph < 0.75) s.gx = (s.gx || 0) - (z % 2 ? 0.9 : 0.6) * Math.sin(((ph - 0.35) / 0.4) * Math.PI); }
            if (k >= 2 && k <= 5) { const sp = (rel + 4.2) % 6.4; if (sp < 0.6) s.swallow = sp / 0.6; }
            if (k === 6) s.nod = (s.nod || 0) + 4 * Math.max(0, Math.sin(rel * 2.4));
          }
        }
        s.lid = Math.max(s.lid, blinkAt(BL[w], t));
        s.breathe = (w === "A" ? 0.006 * AW.at(t).v : 0.008) * Math.sin((t / (w === "A" ? 3.0 : 3.6)) * 6.283);
        if (w === "A" && !talk) { const sob = AF.at(t).sob, ph = (t % 1.15) / 1.15; if (sob > 0.05) s.breathe += sob * 0.016 * (ph < 0.18 ? ph / 0.18 : Math.exp(-(ph - 0.18) * 5)); }
        if (!talk && t < F.end17) s.nod = (s.nod || 0) + 3.5 * nodAt(nods[w], t);
        R.set(s);
        const pl = PL[w], b = ROOM.project(pl.base), top = ROOM.project([pl.base[0], pl.base[1] + pl.h, pl.base[2]]);
        const sc = (b[1] - top[1]) / 900, vis = b[2] < 1 && sc > 0;
        pl.el.style.transform = `translate(${(b[0] - 300 * sc).toFixed(1)}px, ${top[1].toFixed(1)}px) scale(${sc.toFixed(4)})`;
        pl.el.style.display = vis ? "" : "none";
        const other = w === "A" ? "P" : "A", bl = cu ? (w === "A" ? 0 : 3) : !talk && speaking(other, t) ? 2.2 : 0.4, k = bl.toFixed(1);
        if (lastBlur[w] !== k) { pl.el.style.filter = `blur(${k}px)`; lastBlur[w] = k; }
      });
    } else if (t >= F.fin - 0.1) { if (lastGl !== "0") { glc.style.filter = "none"; lastGl = "0"; } ROOM.renderLogo(t - F.fin); }
    if (t > NW) {
      const hs = (T) => ({ ...T.at(t), lid: Math.max(T.at(t).lid, blinkAt(BL.n, t)), breathe: 0.008 * Math.sin(t * 1.7) });
      R18A.set(hs(HA)); R18B.set(hs(HB)); R19.set(hs(MO));
      FAM.forEach((R, i) => R.set({ ...E.heureux, stand: 1, flip: i < 2 ? 1 : -1, arms: POSE.hang, gx: 0.5, lid: Math.max(0.15, blinkAt(BL.n, t + i * 0.7)), breathe: 0.008 * Math.sin(t * 1.6 + i), bag: "none" }));
      if (t > L(19).b && t < L(20).a + 0.5) {
        const w = Math.sin((t - L(23).a) * 0.55);   // caméra circulaire (parallaxe)
        bbBg.style.transform = `translateX(${(34 * w).toFixed(1)}px)`; bbBack.style.transform = `translateX(${(16 * w).toFixed(1)}px)`; bbFront.style.transform = `translateX(${(-24 * w).toFixed(1)}px) scale(${(1.02 + 0.015 * Math.cos((t - L(23).a) * 0.55)).toFixed(4)})`;
        bbFront.style.transformOrigin = "50% 70%";
        BBF.forEach((R, i) => R.set({ ...E.heureux, stand: 1, flip: i < 2 ? 1 : -1, arms: POSE.hang, gx: 0.6, gy: 0.5, lid: Math.max(0.15, blinkAt(BL.n, t + i)), breathe: 0.008 * Math.sin(t * 1.5 + i), bag: "none" }));
        BM.set({ ...BBt.M.at(t), lid: Math.max(BBt.M.at(t).lid, blinkAt(BL.n, t + 0.4)), breathe: 0.008 * Math.sin(t * 1.4) });
        BA.set({ ...BBt.A, lid: Math.max(BBt.A.lid, blinkAt(BL.A, t)), breathe: 0.008 * Math.sin(t * 1.7), nod: 6 + 2 * Math.sin(t * 1.3) });
        BH.set({ ...BBt.H, lid: Math.max(0.1, blinkAt(BL.P, t)), breathe: 0.008 * Math.sin(t * 1.5) });
        baby.style.transform = `rotate(${(1.5 * Math.sin(t * 1.3)).toFixed(2)}deg)`;
      }
      const f = Math.floor(t * FPS); $("#grain").style.transform = `translate(${(f * 37) % 64}px, ${(f * 53) % 64}px)`;
    }
  }
  const proxy = { v: 0 };
  tl.to(proxy, { v: DUR, duration: DUR, ease: "none", modifiers: { v: (x) => { update(parseFloat(x)); return x; } } }, 0);
  update(0);
  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__film = { tl, update };
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
};
