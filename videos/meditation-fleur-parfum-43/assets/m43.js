// Méditation 4:3 « Une fleur pour se venger » — moteur v4 adapté au 1440×1080.
// Plans orateur (cadrages qui changent, bulles, texte cinétique) + écrans d'animation contextuels avec médaillon.
(function () {
  const DUR = 420;
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
    xb: `<svg viewBox="0 0 48 48" ${st}><path d="M14 14l20 20M34 14L14 34"/></svg>`,
    chain: `<svg viewBox="0 0 48 48" ${st}><rect x="4" y="18" width="20" height="12" rx="6"/><rect x="24" y="18" width="20" height="12" rx="6"/></svg>`,
    flower: `<svg viewBox="0 0 120 120"><g fill="#fff"><ellipse cx="60" cy="34" rx="15" ry="22"/><ellipse cx="60" cy="34" rx="15" ry="22" transform="rotate(72 60 58)"/><ellipse cx="60" cy="34" rx="15" ry="22" transform="rotate(144 60 58)"/><ellipse cx="60" cy="34" rx="15" ry="22" transform="rotate(216 60 58)"/><ellipse cx="60" cy="34" rx="15" ry="22" transform="rotate(288 60 58)"/></g><circle cx="60" cy="58" r="12" fill="#f7941d"/></svg>`,
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

  // Fleur qui s'ouvre + volutes de parfum
  const flower = (el, a, kick, title, sub, tSub) => {
    const g = mk(el, `<div class="glow" style="left:400px;top:50%"></div>`);
    tl.fromTo(g, { opacity: 0, scale: 0.6 }, { opacity: 0.9, scale: 1, duration: 1.2, ease: "power2.out" }, a);
    const f = mk(el, `<div class="bigicon" style="left:160px;top:300px;width:480px;height:480px;border-radius:50%;background:linear-gradient(160deg,#3fc9f2,#1688c4);box-shadow:0 40px 90px rgba(22,136,196,.35)">${I.flower}</div>`);
    tl.fromTo(f, { opacity: 0, scale: 0.4, rotation: -40 }, { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: "back.out(1.6)" }, a + 0.15);
    const svg = f.querySelector("svg");
    live.push((t) => { svg.style.transform = `rotate(${(t - a) * 8}deg) scale(${1 + 0.03 * Math.sin(t * 2)})`; });
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 16; i++) {
      const d = mk(el, `<div class="star" style="left:${260 + rnd() * 280}px;top:${330 + rnd() * 160}px;width:${8 + rnd() * 10}px;height:${8 + rnd() * 10}px;background:#ffd08a;box-shadow:0 0 18px rgba(247,148,29,.8)"></div>`);
      const t0 = a + 0.6 + rnd() * 3;
      tl.fromTo(d, { opacity: 0, y: 0, x: 0 }, { opacity: 0.9, y: -220 - rnd() * 120, x: (rnd() - 0.5) * 160, duration: 2.6, ease: "sine.out" }, t0);
      tl.to(d, { opacity: 0, duration: 0.6 }, t0 + 2.2);
    }
    const h = mk(el, `<div class="lhead" style="left:720px;top:330px;width:660px"><div class="kick">${kick}</div><div class="ttl">${title}</div></div>`);
    [...h.children].forEach((c, i) => blurIn(c, a + 0.3 + i * 0.15));
    const s = mk(h, `<div class="sub">${sub}</div>`); blurIn(s, tSub);
    sfx(a + 0.2, "scintillement", 0.3);
  };
  // Deux cartes face à face (blanche = ce que Dieu veut, sombre = l'épreuve)
  const vs = (el, a, dark, light) => {
    const c1 = mk(el, `<div class="vs-c" style="left:110px;background:#14162b;color:#fff"><div class="k">${dark[0]}</div><div class="b">${dark[1]}</div><div class="m" style="background:#e1251b">${I.x}</div></div>`);
    const c2 = mk(el, `<div class="vs-c" style="left:770px;background:#fff;color:#14162b"><div class="k">${light[0]}</div><div class="b">${light[1]}</div><div class="m" style="background:#23bded">${I.check}</div></div>`);
    blurIn(c1, dark[2], { x: -80, y: 0, r: -3 }); blurIn(c2, light[2], { x: 80, y: 0, r: 3 }); sfx(dark[2], "whoosh_court", 0.22); sfx(light[2], "impact", 0.25);
  };
  // Phrase centrale dans la lumière
  const light = (el, a, title, sub, tSub) => {
    const g = mk(el, `<div class="glow"></div>`), r = mk(el, `<div class="rays"></div>`);
    tl.fromTo([g, r], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }, a);
    live.push((t) => { r.style.transform = `rotate(${t * 6}deg)`; });
    const t1 = mk(el, `<div class="ctr ttl" style="top:640px">${title}</div>`); blurIn(t1, a + 0.4);
    const t2 = mk(el, `<div class="ctr sub" style="top:740px;font-size:40px">${sub}</div>`); blurIn(t2, tSub);
    sfx(a + 0.2, "scintillement", 0.32);
  };

  // ════════════════════════ CONTENU ══════════════════════════════════
  // Temps absolus. Extraits : 1 @3,6 · 2 @126,59 · 3 @194,60 · 4 @278,42 · 5 @346,64
  const PL = "left:340px;top:110px";
  // Partie 1 — Le témoignage de Richard Wurmbrand
  scene(3.75, 10.6, (el, a) => flower(el, a, "UNE IMAGE À MÉDITER", "Une fleur écrasée", "te donne son bon parfum", 7.9));
  scene(10.6, 21.2, (el, a) => {
    head(el, a, "TÉMOIGNAGE", "Richard Wurmbrand");
    items(el, [[12.9, "book", "Missionnaire", "dans le communisme roumain"], [16.5, "chain", "Persécuté pour sa foi", "par les antichrétiens"]], 330);
  });
  speakerSeg(21.2, 32.6); pill(22.0, 27.6, "Ce qu'il a vécu", "heart", PL); pill(28.0, 32.4, "Et ce qu'il a prié", "hands", PL);
  scene(32.6, 44.6, (el, a) => {
    head(el, a, "LA PRIÈRE DE R. WURMBRAND", "« Seigneur… »", "pour ceux qui l'ont fait souffrir");
    items(el, [[37.6, "star", "Qu'ils reçoivent le salut", "", 38.6], [39.6, "hands", "Qu'ils deviennent chrétiens", "", 40.8]], 330);
  });
  speakerSeg(44.6, 59.2); pill(46.0, 51.8, "Une déclaration de pardon", "heart", PL); kin(53.0, 59.0, ["Il n'a pas", "envoyé", "le <span class='k'>feu</span>"], "l");
  scene(59.2, 74.6, (el, a) => {
    head(el, a, "HOMME DE DIEU", "Il n'a pas souhaité…");
    items(el, [[63.6, "xb", "La mort"], [64.4, "xb", "L'échec"], [65.2, "xb", "La malédiction"], [69.0, "heart", "Il a montré l'amour de Dieu", "dans ces situations", 70.4]], 170);
  });
  speakerSeg(74.6, 102.0); pill(75.1, 80.0, "La puissance du pardon", "logo", PL); kin(81.2, 85.2, ["Tu as été", "<span class='k'>offensé</span> ?"], "l");
  pill(86.0, 92.0, "Richard Wurmbrand", "book", PL); pill(92.8, 98.4, "Il a demandé le salut", "hands", PL);
  scene(98.9, 110.0, (el, a) => vs(el, a, ["CE QU'IL A SUBI", "La torture", 99.2], ["CE QU'IL A DEMANDÉ", "La conversion", 100.6]));
  speakerSeg(110.0, 118.2); kin(110.6, 117.6, ["Il avait", "rencontré", "<span class='k'>Christ</span>"], "l");
  scene(118.2, 125.0, (el, a) => {
    head(el, a, "QUAND TU RENCONTRES", "Jésus-Christ");
    chips(el, "left:730px;top:330px;width:640px", [[119.6, "L'Évangile", "a"], [121.4, "Pas une église", "d"], [122.4, "Pas un homme de Dieu", "d"]]);
  });
  // Partie 2 — Surmonte le mal par le bien
  speakerSeg(126.6, 142.9); pill(128.0, 134.6, "L'apôtre Paul · Corinthiens", "book", PL); pill(135.8, 140.2, "Connus par Christ", "star", PL);
  kin(140.8, 142.7, ["La <span class='k'>puissance</span>", "du pardon"], "l");
  scene(142.9, 157.7, (el, a) => {
    head(el, a, "DANS TA VIE", "Tu vas rencontrer…");
    items(el, [[143.4, "clock", "Des difficultés"], [146.4, "heart", "La haine sans raison"], [151.6, "chat", "La calomnie"], [155.4, "eyeoff", "Une image ternie"]], 170);
  });
  speakerSeg(157.7, 159.9); pill(157.9, 159.8, "Quelle sera ta réaction ?", "chat", PL);
  scene(159.9, 166.4, (el, a) => flower(el, a, "UNE FLEUR POUR SE VENGER", "Un parfum de bonne odeur", "pour celui qui l'a écrasée", 164.0));
  scene(166.4, 188.6, (el, a) => bible(el, a, "Romains 12 : 20-21", "« Mais si ton ennemi a faim, <b class='h1'>donne-lui à manger</b> ; s'il a soif, donne-lui à boire ; car en agissant ainsi, ce sont des <b class='h2'>charbons ardents</b> que tu amasseras sur sa tête. Ne te laisse pas vaincre par le mal, mais <b class='h3'>surmonte le mal par le bien</b>. »", [[".h1", 170.4], [".h2", 178.6], [".h3", 184.6]]));
  speakerSeg(188.6, 193.0); kin(188.8, 193.0, ["Surmonte", "la <span class='k'>haine</span>", "par le bien"], "l");
  // Partie 3 — Le seul remède de la haine
  speakerSeg(194.6, 207.1); kin(194.8, 198.2, ["Le seul", "remède :", "l'<span class='k'>amour</span>"], "l"); pill(198.6, 206.8, "La puissance du pardon", "logo", PL);
  scene(207.1, 222.8, (el, a) => vs(el, a, ["LE MONDE T'ENCOURAGE", "À te venger", 210.6], ["DIEU, LUI", "Pardonne", 219.0]));
  speakerSeg(222.8, 239.6); pill(223.2, 230.0, "Richard Wurmbrand", "book", PL); kin(231.0, 236.6, ["Surmonter", "le <span class='k'>mal</span>", "par le bien"], "l");
  scene(239.6, 260.4, (el, a) => {
    head(el, a, "LA VIE CHRÉTIENNE PRATIQUE", "Toi, souhaite le bien");
    items(el, [[240.2, "heart", "On souhaite ta mort", "toi, souhaite le bien"], [248.2, "hands", "On souhaite ton échec", "toi, prie pour leur réussite"], [253.0, "case", "On souhaite ta pauvreté", "toi, dépanne-les", 257.4]], 230);
  });
  speakerSeg(260.4, 269.6); kin(265.0, 269.4, ["<span class='k'>Christ</span>", "vit", "en toi"], "l");
  scene(269.6, 276.83, (el, a) => {
    head(el, a, "TON TÉMOIGNAGE", "Ils te verront vivre", "les gens perdus autour de toi");
    items(el, [[271.6, "eye", "Ils te verront", "vivre ce genre de vie"]], 360);
  });
  // Partie 4 — Étrangers dans ce monde
  speakerSeg(278.42, 291.2); pill(279.6, 283.2, "« Tu es faible »", "chat", PL); pill(283.6, 291.0, "Pas la même nature", "star", PL);
  scene(291.2, 300.8, (el, a) => {
    head(el, a, "TOI", "Tu vis la vie de Christ");
    chips(el, "left:730px;top:330px;width:640px", [[292.0, "La vie de Christ", "a"], [296.0, "Étrangers dans ce monde", "r"]]);
  });
  speakerSeg(300.8, 315.3); kin(301.2, 308.0, ["Ton <span class='k'>cœur</span>", "ne voudrait", "pas pardonner"], "l"); pill(308.6, 314.6, "Tu vis dans la lumière", "sun", PL);
  scene(315.3, 325.5, (el, a) => {
    head(el, a, "JE NE SAIS PAS", "Ta plus grande offense", "ce que tu as subi");
    items(el, [[321.6, "heart", "Dans ton cœur"], [324.0, "star", "Dans ton esprit"]], 330);
  });
  speakerSeg(325.5, 338.7); pill(326.0, 332.0, "Plus grave encore ?", "clock", PL); kin(337.4, 338.6, ["Que dit", "<span class='k'>Dieu</span> ?"], "l");
  scene(338.7, 345.04, (el, a) => light(el, a, "Nous devons pardonner.", "Je n'ai pas dit que c'est facile…", 341.6));
  // Partie 5 — Je puis tout
  scene(346.8, 356.6, (el, a) => bible(el, a, "Philippiens 4 : 13", "« <b class='h1'>Je puis tout par celui qui me fortifie.</b> »", [[".h1", 347.6]]));
  speakerSeg(356.6, 368.4); kin(357.0, 362.4, ["<span class='k'>Plus fort</span>", "que celui", "du monde"], "l"); pill(363.0, 368.2, "Pour t'aider à surmonter", "hands", PL);
  scene(368.4, 378.2, (el, a) => {
    head(el, a, "SANS RANCUNE", "Laisse Christ travailler pour toi");
    items(el, [[369.2, "xb", "Sans rancune ni haine"], [371.8, "xb", "Sans chercher à te venger"], [374.4, "star", "Christ travaille pour toi", "", 376.0]], 300);
  });
  scene(378.2, 390.6, (el, a) => bible(el, a, "Romains 12 : 19", "« Ne vous vengez point vous-mêmes, bien-aimés, mais laissez agir la colère ; car il est écrit : <b class='h1'>À moi la vengeance, à moi la rétribution</b>, dit le Seigneur. »", [[".h1", 379.0]]));
  speakerSeg(390.6, 409.0); pill(391.0, 396.8, "Le Saint-Esprit", "star", PL); pill(397.6, 401.4, "Richard Wurmbrand", "book", PL); pill(402.0, 408.0, "Je t'invite à lire son livre", "book", PL);
  speakerSeg(409.0, 413.56); kin(409.2, 413.5, ["Saint,", "juste,", "<span class='k'>parfait</span>", "en Christ"], "l");

  // ── Cartes plein écran ──────────────────────────────────────────────
  const full = (a, b, html, last) => {
    const el = mk($("#fulls"), `<div class="full">${html}</div>`);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35 }, a);
    [...el.querySelectorAll(".lhead > *, .lg, .wa")].forEach((c, i) => blurIn(c, a + 0.15 + i * 0.15, { s: c.classList.contains("lg") ? 0.8 : 1 }));
    if (!last) tl.to(el, { opacity: 0, filter: "blur(14px)", duration: 0.4 }, b - 0.4);
    sfx(a, "whoosh", 0.3); sfx(a + 0.2, "impact", 0.3);
  };
  full(0, 3.75, `<div class="lhead"><div class="kick">MÉDITATION · APÔTRE PARIS TALLA</div><div class="ttl">Une fleur pour se venger</div><div class="sub">La puissance du pardon · Romains 12 : 20-21</div></div><span class="lg"></span>`);
  full(124.95, 126.75, `<div class="lhead"><div class="kick">PARTIE 2</div><div class="ttl">Surmonte le mal par le bien</div><div class="sub">Romains 12 : 20-21</div></div><span class="lg"></span>`);
  full(192.95, 194.75, `<div class="lhead"><div class="kick">PARTIE 3</div><div class="ttl">Le seul remède de la haine</div><div class="sub">c'est l'amour</div></div><span class="lg"></span>`);
  full(276.78, 278.58, `<div class="lhead"><div class="kick">PARTIE 4</div><div class="ttl">Étrangers dans ce monde</div><div class="sub">Tu vis la vie de Christ</div></div><span class="lg"></span>`);
  full(345.0, 346.8, `<div class="lhead"><div class="kick">PARTIE 5</div><div class="ttl">Je puis tout</div><div class="sub">par celui qui me fortifie · Philippiens 4 : 13</div></div><span class="lg"></span>`);
  full(413.56, DUR, `<div class="lhead"><div class="kick">MISSION DE LA DISPENSATION DE LA GRÂCE DE DIEU</div><div class="ttl">MIDIGRAD</div><div class="sub">Méditation · Apôtre Paris Talla</div><div class="wa">WhatsApp <strong>+237 676 547 719</strong></div></div><span class="lg"></span>`, true);
  sfx(411.6, "montee", 0.22); sfx(414.4, "scintillement", 0.3);

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
  const KEY = /(pardon\w*|Dieu|Jésus-Christ|Christ|Évangile|Bible|bien-aimés?|amour)/gi;
  window.V3_CAPS.forEach(([a, b, txt, verse]) => {
    const p = mk($("#caps"), `<p class="cap${verse ? " verse" : ""}"><span>${txt.replace(KEY, "<em>$1</em>")}</span></p>`);
    tl.fromTo(p, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, a);
    tl.to(p, { opacity: 0, duration: 0.14 }, Math.max(a + 0.3, b - 0.08));
  });
  tl.fromTo("#brand", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, 4.0);
  tl.to("#brand", { opacity: 0, duration: 0.4 }, 413.2);
  tl.to("#caps", { opacity: 0, duration: 0.3 }, 413.4);

  // ── Pilote image par image ───────────────────────────────────────────
  const drv = {}; let tN = 0;
  Object.defineProperty(drv, "t", { get: () => tN, set: (v) => { tN = v; live.forEach((f) => f(v)); } });
  tl.fromTo(drv, { t: 0 }, { t: DUR, duration: DUR, ease: "none" }, 0);
  live.forEach((f) => f(0));

  window.__m43 = { tl, SFX };
})();
