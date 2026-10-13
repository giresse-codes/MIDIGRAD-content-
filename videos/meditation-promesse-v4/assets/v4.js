// v4 — plein écran 16:9 façon « vidéo dans l'écran » de la référence.
// Plans orateur (cadrages qui changent, bulles, texte cinétique) + écrans d'animation contextuels avec médaillon.
(function () {
  const DUR = 299;
  const CLIPS = [{ s: 3.6, d: 74.08 }, { s: 78.8, d: 87.08 }, { s: 167.0, d: 127.29 }];
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const SFX = []; // [t, nom, volume]
  const sfx = (t, n, v) => SFX.push([+t.toFixed(2), n, v]);

  // ── Icônes ───────────────────────────────────────────────────────────
  const st = 'fill="none" stroke="#1688c4" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  const I = {
    ear: `<svg viewBox="0 0 48 48" ${st}><path d="M14 20a11 11 0 0 1 22 0c0 6-5 8-6 12s-3 8-8 8-6-4-6-6"/><path d="M20 20a5 5 0 0 1 10 0c0 3-3 4-3 6"/></svg>`,
    book: `<svg viewBox="0 0 48 48" ${st}><path d="M6 10h13a5 5 0 0 1 5 5v25a4 4 0 0 0-4-4H6z"/><path d="M42 10H29a5 5 0 0 0-5 5v25a4 4 0 0 1 4-4h14z"/></svg>`,
    star: `<svg viewBox="0 0 48 48" ${st}><path d="M24 5l5.6 12 13 1.4-9.8 8.8 2.8 12.8L24 33.5 12.4 40l2.8-12.8L5.4 18.4l13-1.4z"/></svg>`,
    eyeoff: `<svg viewBox="0 0 48 48" ${st}><path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/><path d="M8 40L40 8"/></svg>`,
    eye: `<svg viewBox="0 0 48 48" ${st}><path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/></svg>`,
    heart: `<svg viewBox="0 0 48 48" ${st}><path d="M24 41S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z"/><path d="M12 24h7l3-5 4 10 3-5h7"/></svg>`,
    house: `<svg viewBox="0 0 48 48" ${st}><path d="M7 22L24 8l17 14"/><path d="M11 19v21h26V19"/><path d="M20 40V28h8v12"/></svg>`,
    case: `<svg viewBox="0 0 48 48" ${st}><rect x="6" y="15" width="36" height="25" rx="4"/><path d="M17 15v-4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M6 26h36"/></svg>`,
    child: `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="12" r="6"/><path d="M14 44V30a10 10 0 0 1 20 0v14M24 30v14"/></svg>`,
    target: `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="11"/><circle cx="24" cy="24" r="4"/></svg>`,
    ring: `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="30" r="13"/><path d="M18 12l6-6 6 6-6 6z"/></svg>`,
    check: `<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 25l8 8 16-17"/></svg>`,
    x: `<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M14 14l20 20M34 14L14 34"/></svg>`,
    fwd: `<svg viewBox="0 0 48 48" ${st}><path d="M8 24h30M28 14l10 10-10 10"/></svg>`,
    back: `<svg viewBox="0 0 48 48" ${st}><path d="M40 24H10M20 14L10 24l10 10"/></svg>`,
    pause: `<svg viewBox="0 0 48 48" ${st}><rect x="12" y="10" width="8" height="28" rx="2"/><rect x="28" y="10" width="8" height="28" rx="2"/></svg>`,
    play: `<svg viewBox="0 0 48 48" ${st}><path d="M14 8l26 16-26 16z"/></svg>`,
    hands: `<svg viewBox="0 0 48 48" ${st}><path d="M24 8v24M24 8c-3 2-7 8-8 14l-6 8 6 8h8M24 8c3 2 7 8 8 14l6 8-6 8h-8"/></svg>`,
    church: `<svg viewBox="0 0 48 48" ${st}><path d="M24 4v10M20 8h8M10 42V24l14-10 14 10v18zM20 42v-9h8v9"/></svg>`,
    temple: `<svg viewBox="0 0 48 48" ${st}><path d="M6 16L24 6l18 10zM8 42h32M12 20v18M20 20v18M28 20v18M36 20v18"/></svg>`,
    clock: `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="24" r="18"/><path d="M24 13v11l7 5"/></svg>`,
    cross: `<svg viewBox="0 0 48 48" fill="#fff"><rect x="20" y="4" width="8" height="40" rx="3"/><rect x="9" y="14" width="30" height="8" rx="3"/></svg>`,
    crossb: `<svg viewBox="0 0 48 48" fill="#1688c4"><rect x="21" y="6" width="6" height="36" rx="2"/><rect x="12" y="15" width="24" height="6" rx="2"/></svg>`,
    sun: `<svg viewBox="0 0 48 48" ${st}><circle cx="24" cy="24" r="8"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4"/></svg>`,
    nose: `<svg viewBox="0 0 48 48" ${st}><path d="M24 8c0 10-8 18-8 24a6 6 0 0 0 6 4h4a6 6 0 0 0 6-4c0-6-8-14-8-24"/></svg>`,
    mouth: `<svg viewBox="0 0 48 48" ${st}><path d="M8 22c6 10 26 10 32 0M8 22c8-4 24-4 32 0"/></svg>`,
    hand: `<svg viewBox="0 0 48 48" ${st}><path d="M16 26V12a3 3 0 0 1 6 0v10M22 22V8a3 3 0 0 1 6 0v14M28 22V10a3 3 0 0 1 6 0v16M16 26l-4-4a3 3 0 0 0-4 4l8 10c3 4 6 6 12 6 6 0 10-4 10-10V18a3 3 0 0 0-6 0"/></svg>`,
    chat: `<svg viewBox="0 0 48 48" ${st}><path d="M8 10h32v22H20l-8 7v-7H8z"/></svg>`,
    link: `<svg viewBox="0 0 48 48" ${st}><rect x="4" y="16" width="22" height="16" rx="8"/><rect x="22" y="16" width="22" height="16" rx="8"/></svg>`,
  };

  // ── Couches ──────────────────────────────────────────────────────────
  const stage = $("#stage"), kins = $("#kins");
  let uid = 0;
  const mk = (parent, html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); const el = d.firstChild; el.id = el.id || "e" + uid++; parent.appendChild(el); return el; };
  const blurIn = (el, t, o = {}) => tl.fromTo(el, { opacity: 0, y: o.y ?? 30, x: o.x ?? 0, scale: o.s ?? 1, filter: "blur(14px)", rotation: o.r0 ?? 0 },
    { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)", rotation: o.r ?? 0, duration: o.d ?? 0.6, ease: o.ease ?? "power3.out" }, t);
  const blurOut = (el, t) => tl.to(el, { opacity: 0, filter: "blur(12px)", y: -16, duration: 0.4, ease: "power2.in" }, t);

  // ── Plans orateur : cadrages successifs (wide / close / medium) ─────
  const FR = [[1.0, 0, 0], [1.34, 0, 1], [1.15, -18, 1], [1.25, 22, 1], [1.07, 10, 0]];
  const A = []; // segments orateur
  function speakerSeg(a, b, opts = {}) { A.push([a, b]); return opts; }
  function framings() {
    let k = 0;
    A.forEach(([a, b]) => {
      let t = a;
      while (t < b - 0.5) {
        const f = FR[k++ % FR.length];
        const len = Math.min(b - t, 4.2 + (k % 3) * 1.3);
        tl.set("#frame", { scale: f[0], x: f[1], y: f[2] * 6 }, t);
        tl.fromTo("#frame", { scale: f[0] * 1.035 }, { scale: f[0], duration: 0.35, ease: "power3.out", immediateRender: false }, t);
        tl.to("#frame", { scale: f[0] * 1.04, duration: Math.max(0.4, len - 0.35), ease: "none" }, t + 0.35);
        t += len;
      }
    });
  }
  function pill(t, t2, text, icon, pos) {
    const el = mk($("#pills"), `<div class="pill" style="${pos}"><span class="ic${icon === "logo" ? " logo" : ""}">${icon && icon !== "logo" ? I[icon] : ""}</span>${text}</div>`);
    blurIn(el, t, { s: 0.85, y: 20, ease: "back.out(1.8)" }); blurOut(el, t2); sfx(t, "whoosh_court", 0.22);
  }
  function kin(t, t2, lines, side) {
    const el = mk(kins, `<div class="kin${side === "r" ? " r" : ""}">${lines.map((l) => `<span class="w">${l}</span>`).join("")}</div>`);
    tl.set(el, { opacity: 1 }, t);
    el.querySelectorAll(".w").forEach((w, i) => tl.fromTo(w, { opacity: 0, y: 60, filter: "blur(16px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power4.out" }, t + i * 0.22));
    tl.to(el, { opacity: 0, filter: "blur(14px)", duration: 0.4 }, t2 - 0.4);
    sfx(t, "impact", 0.25);
  }

  // ── Écrans d'animation ───────────────────────────────────────────────
  const B = [];
  function scene(a, b, build) {
    const el = mk(stage, `<div class="scn"></div>`);
    B.push([a, b]);
    tl.fromTo(el, { opacity: 0, scale: 1.03, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, a);
    tl.to(el, { opacity: 0, scale: 0.98, filter: "blur(16px)", duration: 0.4, ease: "power2.in" }, b - 0.4);
    sfx(a, "whoosh", 0.28);
    build(el, a, b);
  }
  const head = (el, a, kick, title, sub) => {
    const h = mk(el, `<div class="lhead"><div class="kick">${kick}</div><div class="ttl">${title}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`);
    [...h.children].forEach((c, i) => blurIn(c, a + 0.15 + i * 0.15));
    return h;
  };
  const items = (el, list, top) => {
    const box = mk(el, `<div class="items" style="top:${top ?? 230}px"></div>`);
    list.forEach(([t, icon, t1, t2, done]) => {
      const it = mk(box, `<div class="it"><span class="ic" style="position:relative">${I[icon]}<span class="ck" style="position:absolute;inset:0;display:grid;place-items:center;border-radius:50%;background:#23bded;opacity:0">${I.check}</span></span><div><div class="t1">${t1}</div>${t2 ? `<div class="t2">${t2}</div>` : ""}</div></div>`);
      blurIn(it, t, { x: 40, y: 0 }); sfx(t, "whoosh_court", 0.2);
      if (done) { tl.fromTo(it.querySelector(".ck"), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, done); sfx(done, "clic", 0.45); }
    });
  };
  const tilt = (el, t, text, icon, pos, rot) => { const p = mk(el, `<div class="tilt" style="${pos}"><span class="ic">${I[icon]}</span>${text}</div>`); blurIn(p, t, { s: 0.8, r0: 0, r: rot ?? -4, ease: "back.out(1.6)" }); sfx(t, "whoosh_court", 0.22); };
  const chips = (el, pos, list) => { const c = mk(el, `<div class="chips" style="${pos}"></div>`); list.forEach(([t, txt, tone]) => { const x = mk(c, `<div class="chip ${tone || ""}">${txt}</div>`); blurIn(x, t, { s: 0.8, y: 20, ease: "back.out(1.8)" }); sfx(t, "whoosh_court", 0.2); }); };
  const bible = (el, a, ref, html, hls) => {
    const c = mk(el, `<div class="card bible"><div class="kick">LA BIBLE · LOUIS SEGOND</div><div class="ref">${ref}</div><div class="vs">${html}</div><div class="ver">Texte de référence · à lire dans ta Bible</div></div>`);
    blurIn(c, a + 0.1, { y: 40 }); sfx(a + 0.1, "page", 0.35);
    hls.forEach(([sel, t]) => tl.fromTo(c.querySelector(sel), { "--hl": "0%" }, { "--hl": "100%", duration: 1.2, ease: "power2.inOut" }, t));
  };
  // animations continues pilotées par t
  const live = [];

  // ════════════════════════ CONTENU ══════════════════════════════════
  // Partie 1
  speakerSeg(3.6, 6.9); pill(4.0, 6.6, "Apôtre Paris Talla", "logo", "left:600px;top:120px");
  scene(6.9, 13.0, (el, a) => {
    head(el, a, "2 TIMOTHÉE 4 : 3", "Dans les derniers temps…");
    items(el, [[7.2, "ear", "Des choses agréables", "à leurs oreilles"], [9.9, "x", "Ce n'est pas mon message", "« je ne viens pas t'annoncer cela »"]], 330);
  });
  speakerSeg(13.0, 15.4); kin(13.2, 15.4, ["Une", "<span class='k'>bonne</span>", "nouvelle"], "l");
  scene(15.4, 22.8, (el, a) => bible(el, a, "Romains 4 : 18", "« <b class='h1'>Espérant contre toute espérance, il crut</b>, en sorte qu'il devint père d'un grand nombre de nations, selon ce qui lui avait été dit : <b class='h2'>Telle sera ta postérité</b>. »", [[".h1", 16.5], [".h2", 19.5]]));
  scene(22.8, 35.0, (el, a) => {
    const n = mk(el, `<div class="card night"></div>`);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 140; i++) {
      const s = mk(n, `<div class="star" style="left:${rnd() * 1500}px;top:${rnd() * 600}px;width:${2 + rnd() * 5}px;height:${2 + rnd() * 5}px"></div>`);
      const t0 = a + 0.3 + rnd() * 6;
      tl.fromTo(s, { opacity: 0, scale: 0.2 }, { opacity: 0.4 + rnd() * 0.6, scale: 1, duration: 0.6 }, t0);
      tl.to(s, { opacity: 0.25, duration: 0.8 + rnd(), yoyo: true, repeat: 3, ease: "sine.inOut" }, t0 + 0.8);
    }
    const t1 = mk(n, `<div class="nt">Telle sera ta postérité.</div>`); blurIn(t1, 30.5);
    const t2 = mk(n, `<div class="ns">Espérant contre toute espérance · un grand nombre de nations</div>`); blurIn(t2, 26.0);
    sfx(23.0, "scintillement", 0.3); sfx(30.5, "scintillement", 0.25);
  });
  scene(35.0, 47.0, (el, a) => {
    const b = mk(el, `<div class="big">0<small>ans</small></div>`);
    blurIn(b, a + 0.2);
    const num = { v: 0 }; let shown = -1;
    Object.defineProperty(num, "n", { get: () => num.v, set: (v) => { num.v = v; const r = Math.round(v); if (r !== shown) { shown = r; b.firstChild.nodeValue = String(r); } } });
    tl.fromTo(num, { n: 0 }, { n: 100, duration: 2.2, ease: "power2.out" }, 40.2); sfx(40.2, "montee", 0.2); sfx(42.4, "impact", 0.3);
    chips(el, "left:1060px;top:300px;width:700px", [[35.3, "Sans faiblir dans la foi", "a"], [37.6, "Corps usé", "d"], [42.9, "Sara", ""], [44.0, "Pas d'enfant", "d"]]);
  });
  speakerSeg(47.0, 62.2); pill(47.2, 50.4, "Il ne douta point", "eye", "left:600px;top:120px"); pill(50.6, 54.2, "Fortifié par la foi", "star", "left:600px;top:120px");
  scene(62.2, 71.6, (el, a) => {
    head(el, a, "INFORMATIONS NÉGATIVES", "Ce que tu vois autour de toi");
    items(el, [[65.2, "heart", "Ta santé"], [66.6, "house", "Ton foyer"], [67.9, "case", "Tes affaires"], [69.2, "child", "Tes enfants"], [70.3, "target", "Tes projets"]], 150);
  });
  speakerSeg(71.6, 77.3); kin(71.8, 77.3, ["La <span class='k'>foi</span>", "ne regarde", "pas aux", "circonstances"], "l");
  // Partie 2
  speakerSeg(79.0, 83.6); pill(79.2, 83.4, "Fortifier ta foi", "star", "left:600px;top:120px");
  scene(83.6, 96.6, (el, a) => {
    const c1 = mk(el, `<div class="vs-c" style="left:260px;background:#fff;color:#14162b"><div class="k">CE QUE DIEU T'A DIT</div><div class="b">La promesse</div><div class="m" style="background:#23bded">${I.check}</div></div>`);
    const c2 = mk(el, `<div class="vs-c" style="left:1040px;background:#14162b;color:#fff"><div class="k">CE QUE TU VIS</div><div class="b">Les circon&shy;stances</div><div class="m" style="background:#e1251b">${I.x}</div></div>`);
    blurIn(c1, 83.8, { x: -80, y: 0, r: -3 }); blurIn(c2, 86.0, { x: 80, y: 0, r: 3 }); sfx(86.0, "whoosh_court", 0.22);
    tilt(el, 92.0, "Actuellement contraires", "x", "left:640px;top:780px", -3);
  });
  speakerSeg(96.6, 104.6); pill(96.9, 100.0, "Abraham", "star", "left:600px;top:120px"); pill(100.2, 104.4, "Son corps était usé", "clock", "left:600px;top:120px");
  scene(104.6, 116.0, (el, a) => {
    head(el, a, "2 CORINTHIENS 5 : 7", "Nous ne marchons pas par la vue");
    items(el, [[109.3, "eyeoff", "Pas par la vue"], [111.8, "eye", "Ni par nos cinq sens", "vue · ouïe · odorat · goût · toucher"]], 300);
    chips(el, "left:980px;top:640px;width:860px", [[112.4, "Vue", ""], [112.7, "Ouïe", ""], [113.0, "Odorat", ""], [113.3, "Goût", ""], [113.6, "Toucher", ""]]);
  });
  scene(116.0, 120.6, (el, a) => {
    head(el, a, "CE QUI FAIT FOI", "La parole de Dieu");
    items(el, [[116.4, "book", "La parole de Dieu"], [118.0, "star", "La foi", "qui vient de la promesse de Dieu"]], 330);
  });
  speakerSeg(120.6, 126.4); pill(120.8, 126.2, "Tu es en train de m'écouter", "ear", "left:600px;top:120px");
  scene(126.4, 133.4, (el, a) => {
    head(el, a, "TU TE POSES LA QUESTION", "Ma vie avance ou recule ?");
    items(el, [[126.8, "fwd", "Avancer ?"], [127.8, "back", "Reculer ?"], [129.4, "play", "Continuer ?"], [130.6, "pause", "M'arrêter ?"]], 220);
  });
  speakerSeg(133.4, 144.5); kin(133.6, 142.0, ["Ne", "<span class='k'>doute</span>", "pas de", "Dieu"], "l"); pill(142.4, 144.3, "Dieu m'envoie te dire", "chat", "left:600px;top:120px");
  scene(144.5, 155.7, (el, a) => {
    head(el, a, "NE FAIBLIS PAS", "Continue à servir Dieu fidèlement");
    items(el, [[144.7, "star", "Dans la foi", "", 145.4], [146.6, "hands", "Dans la prière", "", 147.3], [148.2, "book", "Dans la méditation", "de la parole de Dieu", 149.0], [151.6, "heart", "Dans ton service", "", 152.2], [152.8, "church", "Dans ton église", "", 153.4]], 140);
  });
  scene(155.7, 165.5, (el, a) => {
    head(el, a, "LUC 1", "Zacharie et Élisabeth");
    items(el, [[158.7, "clock", "Ils étaient âgés"], [160.0, "child", "Point d'enfant"], [163.6, "temple", "Pendant son service", "au temple"]], 300);
  });
  // Partie 3
  scene(167.3, 174.4, (el, a) => {
    const g = mk(el, `<div class="glow"></div>`), r = mk(el, `<div class="rays"></div>`);
    tl.fromTo([g, r], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, a);
    live.push((t) => { r.style.transform = `rotate(${t * 6}deg)`; });
    const t1 = mk(el, `<div class="ctr ttl" style="top:700px">Un ange lui apparut.</div>`); blurIn(t1, a + 0.4);
    sfx(a + 0.2, "scintillement", 0.32);
  });
  speakerSeg(174.4, 177.1); pill(174.6, 177.0, "Souverain sacrificateur", "temple", "left:600px;top:120px");
  scene(177.1, 187.5, (el, a) => {
    head(el, a, "CE QUE LES GENS DISAIENT", "Les paroles");
    [[177.6, "« Tu sers Dieu… »", 300], [180.9, "« Tu pries, les gens sont guéris… »", 430], [182.6, "« Tu prêches la Bible… »", 560], [184.3, "« …et ta propre vie ? »", 690, 1]].forEach(([t, txt, y, me]) => {
      const bb = mk(el, `<div class="bub${me ? " me" : ""}" style="left:${me ? 1180 : 1000}px;top:${y}px">${txt}</div>`); blurIn(bb, t, { s: 0.85, y: 20, ease: "back.out(1.7)" }); sfx(t, "notification", 0.26);
    });
  });
  speakerSeg(187.5, 197.2); kin(187.7, 197.0, ["Malgré", "tout,", "il a", "<span class='k'>continué</span>"], "l");
  scene(197.2, 211.2, (el, a) => {
    head(el, a, "LA PROMESSE DE DIEU", "Elle s'accomplira");
    items(el, [[197.6, "fwd", "Tu ne finiras pas là", "où tu es aujourd'hui"], [200.8, "x", "Pas dans la misère"], [204.4, "ring", "Le mariage"], [205.3, "child", "Les enfants"], [206.5, "star", "Une promesse en route", "dans ta vie"]], 140);
  });
  scene(211.2, 218.2, (el, a) => {
    const c = mk(el, `<div class="clock"></div>`);
    for (let i = 0; i < 12; i++) mk(c, `<i class="tk" style="transform:rotate(${i * 30}deg) translateY(-245px)"></i>`);
    const hh = mk(c, `<i class="hd hh"></i>`), mh = mk(c, `<i class="hd mh"></i>`), sh = mk(c, `<i class="hd sh"></i>`); mk(c, `<i class="pin"></i>`);
    blurIn(c, a + 0.1, { s: 0.85 });
    live.push((t) => { hh.style.transform = `rotate(${t * 3}deg)`; mh.style.transform = `rotate(${t * 36}deg)`; sh.style.transform = `rotate(${t * 360}deg)`; });
    const h = mk(el, `<div class="lhead" style="left:960px;top:330px"><div class="kick">LE TEMPS DE DIEU</div><div class="ttl">Le moment opportun</div><div class="sub">pour se réaliser</div></div>`);
    [...h.children].forEach((x, i) => blurIn(x, a + 0.3 + i * 0.15));
  });
  speakerSeg(218.2, 232.2); pill(223.1, 225.0, "Ne te décourage pas", "heart", "left:600px;top:120px"); pill(225.4, 232.0, "Sans prêter attention aux moqueries", "ear", "left:600px;top:120px");
  scene(232.2, 243.0, (el, a) => {
    const l = mk(el, `<div class="chain" style="left:620px"></div>`), r = mk(el, `<div class="chain" style="left:860px"></div>`), r2 = mk(el, `<div class="chain" style="left:1100px"></div>`);
    [l, r, r2].forEach((c, i) => blurIn(c, a + 0.2 + i * 0.1, { y: 0 }));
    tl.to(l, { x: -260, rotation: -18, borderColor: "#23bded", duration: 0.7, ease: "power3.out" }, 234.9);
    tl.to(r2, { x: 260, rotation: 18, borderColor: "#23bded", duration: 0.7, ease: "power3.out" }, 234.9);
    tl.to(r, { y: 120, opacity: 0, rotation: 30, duration: 0.7, ease: "power2.in" }, 234.9);
    sfx(234.9, "impact", 0.35); sfx(235.0, "scintillement", 0.25);
    const t1 = mk(el, `<div class="ctr ttl" style="top:150px;font-size:70px">« On t'a lié, on t'a maudit »</div>`); blurIn(t1, 232.4); blurOut(t1, 234.7);
    const t2 = mk(el, `<div class="ctr ttl" style="top:150px">Aucune malédiction.</div>`); blurIn(t2, 235.0);
    const t3 = mk(el, `<div class="ctr sub" style="top:620px;font-size:44px">C'est juste le temps de Dieu.</div>`); blurIn(t3, 239.4);
  });
  speakerSeg(243.0, 261.8); kin(250.2, 254.2, ["Abraham", "n'a pas été", "<span class='k'>incrédule</span>"], "l"); pill(257.5, 261.6, "Près de cent ans", "clock", "left:600px;top:120px");
  scene(261.8, 277.6, (el, a) => bible(el, a, "Romains 4 : 20-21", "Il ne douta point, par incrédulité, au sujet de la promesse de Dieu ; mais il fut fortifié par la foi, donnant gloire à Dieu, et ayant <b class='h1'>la pleine conviction que ce qu'il promet il peut aussi l'accomplir</b>.", [[".h1", 266.0]]));
  scene(277.6, 290.3, (el, a) => {
    const ic = mk(el, `<div class="bigicon" style="left:230px;top:230px;width:440px;height:440px;background:linear-gradient(160deg,#3fc9f2,#1688c4);box-shadow:0 40px 90px rgba(22,136,196,.35)">${I.cross}</div>`);
    blurIn(ic, a + 0.2, { s: 0.8, ease: "back.out(1.5)" }); sfx(a + 0.2, "scintillement", 0.3);
    chips(el, "left:860px;top:380px;width:900px", [[279.0, "Passé", "d"], [279.6, "Présent", "d"], [280.3, "Futur", "d"], [283.2, "Pardonnés", "a"]]);
    chips(el, "left:860px;top:560px;width:900px", [[284.9, "Saint", "r"], [285.8, "Juste", "r"], [286.7, "Parfait", "r"]]);
    const t = mk(el, `<div class="lhead" style="left:860px;top:230px"><div class="kick">JÉSUS-CHRIST</div><div class="ttl" style="font-size:64px">Tout est pardonné</div></div>`); blurIn(t, a + 0.3);
  });
  speakerSeg(290.3, 294.0); kin(290.4, 294.0, ["Ne", "<span class='k'>doute</span>", "pas."], "l");

  // ── Cartes plein écran ──────────────────────────────────────────────
  const full = (a, b, html, last) => {
    const el = mk($("#fulls"), `<div class="full">${html}</div>`);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 }, a);
    [...el.querySelectorAll(".lhead > *, .lg, .wa")].forEach((c, i) => blurIn(c, a + 0.15 + i * 0.15, { s: c.classList.contains("lg") ? 0.8 : 1 }));
    if (!last) tl.to(el, { opacity: 0, filter: "blur(14px)", duration: 0.4 }, b - 0.4);
    sfx(a, "whoosh", 0.3); sfx(a + 0.2, "impact", 0.3);
  };
  full(0, 3.75, `<div class="lhead"><div class="kick">MÉDITATION · APÔTRE PARIS TALLA</div><div class="ttl">Ne doute pas de la promesse</div><div class="sub">Romains 4 : 18-21</div></div><span class="lg"></span>`);
  full(77.3, 79.05, `<div class="lhead"><div class="kick">PARTIE 2</div><div class="ttl">Par la foi, non par la vue</div><div class="sub">2 Corinthiens 5 : 7</div></div><span class="lg"></span>`);
  full(165.5, 167.35, `<div class="lhead"><div class="kick">PARTIE 3</div><div class="ttl">Dieu accomplit sa promesse</div><div class="sub">Zacharie, Élisabeth, Abraham</div></div><span class="lg"></span>`);
  full(294.0, DUR, `<div class="lhead"><div class="kick">MISSION DE LA DISPENSATION DE LA GRÂCE DE DIEU</div><div class="ttl">MIDIGRAD</div><div class="sub">Méditation · Apôtre Paris Talla</div><div class="wa">WhatsApp <strong>+237 676 547 719</strong></div></div><span class="lg"></span>`, true);
  sfx(291.6, "montee", 0.22); sfx(294.8, "scintillement", 0.3);

  // ── Écran d'animation : visibilité + médaillon ──────────────────────
  const merged = [];
  B.slice().sort((x, y) => x[0] - y[0]).forEach(([a, b]) => { const l = merged[merged.length - 1]; if (l && a - l[1] < 0.05) l[1] = b; else merged.push([a, b]); });
  merged.forEach(([a, b]) => {
    tl.fromTo("#stage", { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, a);
    tl.to("#stage", { opacity: 0, duration: 0.35 }, b - 0.35);
    tl.fromTo("#pip", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)", immediateRender: false }, a + 0.2);
    tl.to("#pip", { opacity: 0, scale: 0.7, duration: 0.3 }, b - 0.35);
  });
  framings();

  // ── Sous-titres ─────────────────────────────────────────────────────
  const KEY = /(promesse\w*|Dieu|Abraham|foi|Jésus-Christ|Bible|bien-aimés?|doute\w*)/gi;
  window.V3_CAPS.forEach(([a, b, txt, verse]) => {
    const p = mk($("#caps"), `<p class="cap${verse ? " verse" : ""}"><span>${txt.replace(KEY, "<em>$1</em>")}</span></p>`);
    tl.fromTo(p, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, a);
    tl.to(p, { opacity: 0, duration: 0.14 }, Math.max(a + 0.3, b - 0.08));
  });
  tl.fromTo("#brand", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, 4.0);
  tl.to("#brand", { opacity: 0, duration: 0.4 }, 293.6);
  tl.to("#caps", { opacity: 0, duration: 0.3 }, 293.8);

  // ── Pilote image par image ───────────────────────────────────────────
  const drv = {}; let tN = 0;
  Object.defineProperty(drv, "t", { get: () => tN, set: (v) => { tN = v; live.forEach((f) => f(v)); } });
  tl.fromTo(drv, { t: 0 }, { t: DUR, duration: DUR, ease: "none" }, 0);
  live.forEach((f) => f(0));

  window.__v4 = { tl, SFX };
})();
