// « Ma part suffit » partie 2 — scène 3D (Three.js) + personnages illustrés (plaques SVG articulées) + textes HTML.
// Tout ce qui dépend de l'image (caméra 3D, lumière, personnages, ECG, rideau, poussière) est une fonction pure du temps.
window.startFilm = function (ROOM) {
  const F = window.FILM, DUR = F.dur, FPS = F.fps;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const mk = (parent, html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); const el = d.firstElementChild; parent.appendChild(el); return el; };
  const LN = Object.fromEntries(F.lines.map((l) => [l.n, l])), L = (n) => LN[n];
  const W = (n, w, k = 0) => { let c = 0; for (const x of L(n).words) if (x[0].includes(w)) { if (c === k) return x[1]; c++; } throw new Error(n + " " + w); };
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
  };
  const POSE = {
    lap: [0, -65, -10, -50], joint: [18, -122, -18, 122], face: [0, -65, 72, 148], chin: [0, -65, 72, 148], read: [-10, -95, 10, 95],
    open: [-30, -70, -45, -65], bible: [-5, -60, -10, -45], hug: [-62, -48, -78, -30], hang: [5, 0, -5, 0], rest: [8, -40, -6, -40],
  };
  const ex = (T, t, k, d = 0.4, more = {}) => T.key(t, d, { ...E[k], ...more });
  const po = (T, t, k, d = 0.5, more = {}) => T.key(t, d, { arms: POSE[k], ...more });
  const A = track({ flip: 1, stand: 0, lean: -8, arms: POSE.rest, ...E.faible, turn: 0, tear: 0, bag: "none", sc: 1 });
  const P = track({ flip: -1, stand: 0, lean: 0, arms: POSE.bible, ...E.doux, turn: 0, bib: "lap", sc: 1 });
  const AW = track({ v: 0.6 }); // amplitude de respiration d'Annabelle (faible au début)
  // 01–03
  ex(A, g(1), "faible", 0.5, { mouth: "soft" }); ex(P, g(2), "doux", 0.5); po(P, g(2), "open", 0.6); po(P, L(2).b + 0.3, "bible", 0.6);
  ex(A, g(3), "triste", 0.5); ex(A, W(3, "pourquoi") - 0.4, "emue", 0.5); A.key(W(3, "pourquoi") - 0.2, 2.5, { tear: 1 }, true);
  ex(P, g(3) + 0.5, "doux", 0.5);
  // 04–05
  ex(P, g(4), "pensif", 0.5); po(P, g(4), "chin", 0.7);
  po(P, W(4, "Job") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(4, "Job") - 0.2, "lecture", 0.5);
  ex(P, W(4, "Ma") - 0.3, "serieux", 0.5, { lean: 5 }); po(P, W(4, "Ma") - 0.2, "bible", 0.6, { bib: "lap" });
  ex(P, W(5, "Une") - 0.3, "doux", 0.5); ex(P, W(5, "Tu", 2) - 0.3, "serieux", 0.5);
  po(P, W(5, "Première") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(5, "Première") - 0.2, "lecture", 0.5);
  ex(A, g(4) + 0.6, "ecoute", 0.5); ex(A, W(4, "vérité,") , "triste", 0.6); A.key(W(4, "vérité,"), 0.01, { tear: 0 });
  // 06 : en pleurs
  ex(P, L(5).b, "doux", 0.5, { lean: 0 }); po(P, L(5).b + 0.2, "bible", 0.6, { bib: "lap" });
  ex(A, g(6), "pleurs", 0.5); po(A, W(6, "Oui,") - 0.3, "face", 0.8); A.key(g(6), 2.2, { tear: 1 }, true); A.key(g(6) + 2.3, 0.01, { tear: 0 }); A.key(g(6) + 2.4, 2.4, { tear: 1 }, true); A.key(g(6) + 4.9, 0.01, { tear: 0 }); A.key(g(6) + 5.0, 2.4, { tear: 1 }, true);
  // 07 : la question, puis silence pensif
  po(A, L(6).b + 0.2, "rest", 0.8); ex(P, g(7), "serieux", 0.4, { lean: 6 });
  ex(A, g(7) + 0.4, "pensive", 0.6); ex(A, L(7).b + 0.1, "pensive", 0.3, { gx: 0.6 });
  // 09–13 : longue explication
  ex(P, g(9), "doux", 0.5, { lean: 3 }); ex(A, g(9) + 0.6, "ecoute", 0.6);
  ex(P, g(10), "serieux", 0.5); po(P, W(10, "Romains") - 0.4, "read", 0.7, { bib: "open" }); ex(P, W(10, "Romains") - 0.2, "lecture", 0.5);
  ex(P, L(10).b - 0.6, "doux", 0.5); po(P, L(10).b + 0.1, "open", 0.7, { bib: "lap" });
  ex(P, g(11), "serieux", 0.5); ex(P, W(11, "L'apôtre") - 0.3, "doux", 0.5); po(P, W(11, "Si") - 0.3, "bible", 0.7);
  ex(A, W(11, "faux.") , "pensive", 0.6); ex(A, L(11).b, "ecoute", 0.6);
  ex(P, g(12), "pensif", 0.5); po(P, g(12), "chin", 0.7); ex(P, W(12, "En") - 0.3, "serieux", 0.5, { lean: 5 }); po(P, W(12, "En") - 0.3, "open", 0.7);
  ex(P, W(12, "Tu", 0) - 0.3, "doux", 0.5); po(P, W(12, "Tu", 0) - 0.3, "bible", 0.7);
  ex(A, W(12, "repentance,") , "triste", 0.6, { gy: 0.6 }); A.key(W(12, "sorcière") - 0.3, 2.6, { tear: 1 }, true);
  ex(P, g(13), "doux", 0.5, { lean: 2 }); po(P, W(13, "imitateurs") - 0.5, "open", 0.7); ex(P, W(13, "Tu", 0) - 0.3, "serieux", 0.5); po(P, W(13, "Tu", 0) - 0.3, "bible", 0.6);
  ex(A, g(13) + 1, "ecoute", 0.6); A.key(g(13) + 1, 0.01, { tear: 0 });
  // 14 : sourire à travers les larmes, mains jointes
  ex(A, g(14), "gratitude", 0.5); po(A, g(14), "joint", 0.7); A.key(g(14) + 0.5, 2.8, { tear: 1 }, true);
  ex(P, g(14) + 0.4, "doux", 0.5, { lean: 0 }); AW.key(g(14), 6, { v: 1 });
  // 15–16 : pasteur heureux, main sur la Bible
  ex(P, g(15), "heureux", 0.5); po(P, g(15), "bible", 0.6, { bib: "lap" }); ex(A, g(15) + 0.5, "gratitude", 0.6, { tear: 0 });
  ex(P, g(16), "doux", 0.5); ex(P, W(16, "Rien") - 0.3, "heureux", 0.5); po(P, W(16, "Rien") - 0.3, "open", 0.6); po(P, W(16, "La") - 0.2, "bible", 0.6);
  // 17 : paisible
  ex(A, g(17), "paisible", 0.6); po(A, g(17), "joint", 0.6); ex(P, g(17) + 0.3, "heureux", 0.5);

  // ── Caméra 3D par réplique ──────────────────────────────────────────
  const CAM = {
    DOOR: { pos: [-1.75, 1.6, 3.3], tgt: [-0.25, 0.95, -0.8] }, WIDE: { pos: [0.05, 1.55, 3.0], tgt: [-0.1, 0.98, -0.7] },
    MID: { pos: [0.0, 1.4, 2.2], tgt: [-0.05, 1.15, -0.6] }, AC: { pos: [-0.4, 1.4, 1.15], tgt: [-0.6, 1.3, -0.95] },
    AXC: { pos: [-0.46, 1.42, 0.8], tgt: [-0.62, 1.36, -0.95] }, OTS: { pos: [-0.95, 1.25, 0.55], tgt: [0.5, 0.98, -0.35] },
    PC: { pos: [0.1, 1.35, 1.1], tgt: [0.5, 1.22, -0.35] }, AL: { pos: [-0.15, 1.35, 1.35], tgt: [-0.6, 1.2, -0.95] },
    MIDL: { pos: [-0.45, 1.32, 2.1], tgt: [-0.1, 1.0, -0.6] }, MIDR: { pos: [0.45, 1.32, 2.05], tgt: [-0.1, 1.0, -0.6] }, PULL: { pos: [0.15, 1.75, 3.7], tgt: [-0.1, 0.92, -0.8] },
  };
  const C = track({ ...CAM.DOOR, fov: 50 });
  const shot = (t, d, k, lin) => C.key(t, d, { pos: CAM[k].pos, tgt: CAM[k].tgt }, lin);
  shot(0, L(1).b + 0.4, "WIDE"); shot(g(2), 2.0, "MID"); shot(g(3), L(3).b - g(3), "AC");
  shot(g(4), 1.8, "OTS"); shot(g(5) + 4, L(5).b - g(5) - 4, "MIDR"); shot(g(6), 2.0, "AXC");
  shot(g(7), 1.4, "PC"); shot(L(7).b - 0.1, 0.9, "AL");
  const seq = ["MID", "PC", "AL", "MIDL", "PC", "AL", "MIDR"]; let si = 0;
  for (let n = 9; n <= 13; n++) { const l = L(n), len = l.b - l.a, parts = Math.max(1, Math.round(len / 9)); for (let k = 0; k < parts; k++) shot(l.a - 0.3 + (k * len) / parts, 2.6, seq[si++ % seq.length]); }
  shot(g(14), 2.2, "AXC"); shot(g(15), 2.0, "MID"); shot(g(16) + 4, L(16).b - g(16) - 4, "MIDL");
  shot(g(17), F.end17 - g(17) + 2.2, "PULL");
  // ── Lumière ─────────────────────────────────────────────────────────
  const LT = track({ cool: 1, warm: 0, beam: 0, pastor: 0 });
  LT.key(g(9), 6, { cool: 0.4, pastor: 1.6 }); LT.key(g(14), 5, { cool: 0, warm: 1, beam: 1, pastor: 0.6 });

  // ── Personnages (plaques articulées projetées dans la scène 3D) ─────
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
  card(W(4, "Job") - 0.3, W(4, "Ma") - 0.2, "Job 2 : 10", "Quoi ! nous recevons de Dieu le bien, et nous ne recevrions pas aussi <b>le mal</b> !", [[0, W(4, "mal")]]);
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
  box("#s-house", R18A, "left:40px;top:860px;width:520px;height:780px"); box("#s-house", R18B, "left:520px;top:860px;width:520px;height:780px"); box("#s-morning", R19, "left:250px;top:780px;width:580px;height:870px");
  const HA = track({ stand: 1, flip: 1, x: -60, arms: POSE.hang, ...E.emue, gx: 0.6, mouth: "soft", bag: "none" }), HB = track({ stand: 1, flip: -1, x: 60, arms: POSE.hang, ...E.serieux, gx: 0.6, mouth: "closed", bag: "none" });
  const n18 = L(18);
  HA.key(W(18, "pardon") - 0.6, 1.2, { arms: POSE.joint, head: 8, nod: 6 }); HB.key(W(18, "reconnu.") - 0.8, 1.0, { ...E.emue, mouth: "soft", gx: 0.6 });
  HA.key(W(18, "accepté") - 0.4, 1.6, { x: 120, arms: POSE.hug, ...E.paisible }); HB.key(W(18, "accepté") - 0.4, 1.6, { x: -120, arms: POSE.hug, ...E.paisible });
  const MO = track({ stand: 1, flip: 1, arms: POSE.hang, ...E.heureux, gx: 0.3, mouth: "smile", bag: "none" });
  scn("#s-house", n18.a - 0.3, L(19).a - 0.6, 1, 1.05);
  scn("#s-morning", L(19).a - 0.6, L(20).a - 0.5, 1.04, 1.0);
  tl.fromTo("#ecg2 path", { strokeDashoffset: 1600 }, { strokeDashoffset: 0, duration: 2.4, ease: "none" }, L(19).a);
  tl.to("#ecg2", { filter: "drop-shadow(0 0 18px #ffe39a)", duration: 1.2 }, W(19, "santé") - 0.2);
  tl.to("#ecg2 path", { stroke: "#ffe7a3", strokeWidth: 10, duration: 1.2 }, W(19, "santé") - 0.2);
  scn("#s-sky", L(20).a - 0.5, L(22).a - 0.6, 1, 1.08);
  const phrase = (t0, t1, html) => { const el = mk($("#s-sky"), `<div class="pcard">${html}</div>`); tl.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, t0); tl.to(el, { opacity: 0, duration: 0.6 }, t1); };
  phrase(W(20, "toute") - 0.4, L(20).b, "en <b>toute chose</b>");
  phrase(W(21, "différents.") - 1.2, L(21).b + 0.3, "nous ne sommes <b>pas différents</b>");
  scn("#s-church", L(22).a - 0.6, F.fin - 0.7, 1, 1.07);
  const subs = $("#subs"); let lastSub = null;
  F.lines.filter((l) => l.who === "N").forEach((l) => l.pages.forEach(([i0, i1]) => {
    const ws = l.words.slice(i0, i1), s = mk(subs, `<div class="sub"></div>`); karaoke(s, ws, "#2a1a0a");
    const t = ws[0][1] - 0.2; if (lastSub) tl.to(lastSub, { opacity: 0, duration: 0.25 }, t - 0.05);
    tl.fromTo(s, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t); lastSub = s;
  }));
  tl.to(lastSub, { opacity: 0, duration: 0.4 }, L(22).b + 0.3);
  // fin : logo 3D sur fond crème
  tl.to("#narr", { opacity: 0, duration: 0.7 }, F.fin - 0.7); tl.to("#brand", { opacity: 0, duration: 0.5 }, F.fin - 0.7);
  tl.fromTo("#gl", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1.03, duration: 0.9, ease: "power2.out" }, F.fin);
  tl.fromTo("#motfin", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, F.fin + 0.6);
  tl.set("#gl", { opacity: 1 }, 0); tl.set("#gl", { opacity: 0 }, NW + 1.3); tl.set(["#plates", "#bubbles", "#cards"], { opacity: 0 }, NW + 1.3);

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
    if (t < NW + 1.4) {
      const cs = C.at(t), ls = LT.at(t);
      ROOM.render(t, { pos: cs.pos, tgt: cs.tgt, fov: cs.fov, ...ls });
      const near = clamp((2.6 - Math.hypot(cs.pos[0] - cs.tgt[0], cs.pos[2] - cs.tgt[2])) / 1.8);
      const gb = (0.6 + 1.6 * near).toFixed(1); if (gb !== lastGl) { glc.style.filter = `blur(${gb}px)`; lastGl = gb; }
      [["A", RA, A], ["P", RP, P]].forEach(([w, R, T]) => {
        const s = T.at(t), talk = speaking(w, t);
        if (talk) s.mouth = lip(t);
        s.lid = Math.max(s.lid, blinkAt(BL[w], t));
        s.breathe = (w === "A" ? 0.006 * AW.at(t).v : 0.008) * Math.sin((t / (w === "A" ? 3.0 : 3.6)) * 6.283);
        if (!talk && t < F.end17) s.nod = (s.nod || 0) + 3.5 * nodAt(nods[w], t);
        R.set(s);
        const pl = PL[w], b = ROOM.project(pl.base), top = ROOM.project([pl.base[0], pl.base[1] + pl.h, pl.base[2]]);
        const sc = (b[1] - top[1]) / 900, vis = b[2] < 1 && sc > 0;
        pl.el.style.transform = `translate(${(b[0] - 300 * sc).toFixed(1)}px, ${top[1].toFixed(1)}px) scale(${sc.toFixed(4)})`;
        pl.el.style.display = vis ? "" : "none";
        const other = w === "A" ? "P" : "A", bl = !talk && speaking(other, t) ? 2.2 : 0.4, k = bl.toFixed(1);
        if (lastBlur[w] !== k) { pl.el.style.filter = `blur(${k}px)`; lastBlur[w] = k; }
      });
    } else if (t >= F.fin - 0.1) { if (lastGl !== "0") { glc.style.filter = "none"; lastGl = "0"; } ROOM.renderLogo(t - F.fin); }
    if (t > NW) {
      const hs = (T) => ({ ...T.at(t), lid: Math.max(T.at(t).lid, blinkAt(BL.n, t)), breathe: 0.008 * Math.sin(t * 1.7) });
      R18A.set(hs(HA)); R18B.set(hs(HB)); R19.set(hs(MO));
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
