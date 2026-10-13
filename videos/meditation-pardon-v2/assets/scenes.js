// Scènes, caméra, sous-titres et SFX — temps en secondes vidéo.
// Partie 1 = source 0:00,6 → 1:06,99 (v = source − 0,6)
// Partie 2 = source 1:33,6 → 3:28,2 (v = source − 26,76)
(function () {
  const SVG = {
    storm: '<svg class="ic" viewBox="0 0 64 50"><path d="M18 34h30a10 10 0 0 0 0-20 14 14 0 0 0-27-3A11 11 0 0 0 18 34z" fill="#fff"/><path d="M33 30l-6 11h6l-3 8 9-12h-6l4-7z" fill="#ffc94a"/></svg>',
    sun: '<svg class="ic" viewBox="0 0 64 50"><circle cx="32" cy="25" r="11" fill="#ffd25a"/><g stroke="#ffd25a" stroke-width="4" stroke-linecap="round"><path d="M32 4v5M32 41v5M11 25h5M48 25h5M17 10l4 4M43 36l4 4M17 40l4-4M43 14l4-4"/></g></svg>',
    check: '<svg width="52" height="52" viewBox="0 0 52 52"><path d="M12 27l9 9 19-20" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cross: '<svg width="46" height="46" viewBox="0 0 46 46"><path d="M12 12l22 22M34 12L12 34" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>',
  };
  const chip = (html, tone, font) => ({ type: "text", html, tone: tone || "light", font: font || '700 40px "Montserrat"' });
  const P = (o, extra) => Object.assign({}, o, extra);

  // Anim utilitaire : bulles de message qui apparaissent une à une
  const bubbles = (times) => (tl, el, tIn, tOut, id) =>
    times.forEach((t, i) => tl.fromTo(`#${id} .m-${i}`, { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, t));
  const typing = (t0, dur) => (tl, el, tIn, tOut, id) =>
    tl.fromTo(`#${id} .q`, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: "steps(" + Math.round(dur * 14) + ")" }, t0);
  const highlight = (pairs) => (tl, el, tIn, tOut, id) =>
    pairs.forEach(([sel, t]) => tl.fromTo(`#${id} ${sel}`, { "--hl": "0%" }, { "--hl": "100%", duration: 1.1, ease: "power2.inOut" }, t));

  const BLANKS = (t, seed) => [
    { type: "blank", tone: "blank-d", w: 260, h: 170, x: 930 - seed * 40, y: 1240, z: -380, ry: -18, blur: 2, d: 0.05 },
    { type: "blank", tone: "blank-l", w: 210, h: 210, x: 110 + seed * 30, y: 1420, z: -520, ry: 20, blur: 3, d: 0.1 },
    { type: "blank", tone: "blank-b", w: 170, h: 170, x: 960, y: 420 + seed * 30, z: -620, ry: -24, blur: 4, d: 0.15 },
    { type: "blank", tone: "blank-l", w: 150, h: 230, x: 90, y: 560, z: -300, ry: 26, blur: 2, d: 0.2 },
  ];

  const SCENES = [
    // 1 — Accueil
    { t0: 0.2, t1: 8.3,
      heads: [{ words: ["Un", "moment", "de", "méditation."], key: [3], t0: 0.5, t1: 8.2, step: 0.22 }],
      cards: [
        { type: "clock", x: 330, y: 860, z: 40, ry: 16, rx: 6 },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 790, y: 720, z: -60, ry: -18, d: 0.35 },
        { type: "tag", tone: "dark", k: "MIDIGRAD", big: "3:13", s: "Colossiens", x: 800, y: 1070, z: 60, ry: -14, d: 0.6 },
        ...BLANKS(0, 0),
      ] },
    // 2 — Titre
    { t0: 8.2, t1: 10.95,
      heads: [{ words: ["La", "puissance", "du", "pardon."], key: [3], big: true, at: [8.62, 8.82, 9.1, 9.42], t1: 10.9 }],
      cards: [
        { type: "blank", tone: "blank-b", w: 320, h: 320, x: 170, y: 420, z: -200, ry: 22, d: 0 },
        { type: "blank", tone: "blank-d", w: 300, h: 200, x: 900, y: 1300, z: -150, ry: -22, d: 0.08 },
        { type: "blank", tone: "blank-l", w: 260, h: 260, x: 880, y: 360, z: -500, ry: -20, blur: 3, d: 0.12 },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 180, y: 1300, z: -100, ry: 20, d: 0.2 },
      ] },
    // 3 — L'offense
    { t0: 10.6, t1: 16.0,
      heads: [
        { words: ["Imaginez", "l'instant."], key: [1], t0: 10.68, t1: 11.9 },
        { words: ["On", "t'a", "offensé."], key: [2], t0: 11.93, t1: 14.2, step: 0.18 },
        { words: ["On", "t'a", "blessé."], key: [2], t0: 14.27, t1: 16.0, step: 0.18 },
      ],
      cards: [
        { type: "msg", title: "Message", av: [["A", "#e1251b"], ["M", "#f7941d"]], lines: ["Tu m'as menti.", "Je ne te crois plus.", "..."],
          x: 540, y: 820, z: 80, ry: -8, rx: 6, anim: bubbles([12.0, 13.1, 14.35]) },
        { type: "weather", loc: "Mon cœur", deg: "4°", cond: "Orageux", icon: SVG.storm, x: 820, y: 1130, z: -40, ry: -16, d: 0.5 },
        { type: "blank", tone: "blank-d", w: 240, h: 240, x: 230, y: 1150, z: -160, ry: 18, d: 0.3 },
        { type: "blank", tone: "blank-l", w: 200, h: 140, x: 130, y: 520, z: -420, ry: 22, blur: 3, d: 0.4 },
      ] },
    // 4 — Chacun croit avoir raison
    { t0: 16.0, t1: 33.0,
      heads: [
        { words: ["Et", "vous", "le", "savez…"], key: [], t0: 16.06, t1: 19.1 },
        { words: ["C'est", "lui", "qui", "a", "raison…"], key: [4], t0: 19.17, t1: 21.4 },
        { words: ["…les", "autres", "ont", "tort."], key: [3], t0: 21.45, t1: 26.3 },
        { words: ["Simples.", "Humbles."], key: [0, 1], t0: 26.38, t1: 29.1, step: 1.4 },
        { words: ["Les", "autres", "?", "Orgueilleux."], key: [3], t0: 29.16, t1: 33.0, step: 0.4 },
      ],
      cards: [
        { type: "vs", tone: "light", k: "MOI", big: "J'ai<br>raison", mark: SVG.check, mc: "#23bded", x: 310, y: 860, z: 40, ry: 20, from: "left", d: 1.2 },
        { type: "vs", tone: "dark", k: "LES AUTRES", big: "Ils ont<br>tort", mark: SVG.cross, mc: "#e1251b", x: 770, y: 900, z: 0, ry: -20, from: "right", d: 5.5 },
        P(chip("Simple", "light"), { x: 250, y: 1180, z: 120, ry: 16, from: "pop", d: 10.4 }),
        P(chip("Humble", "light"), { x: 330, y: 1300, z: 90, ry: 16, from: "pop", d: 11.9 }),
        P(chip("Compliqués", "dark"), { x: 790, y: 1220, z: 60, ry: -16, from: "pop", d: 13.2 }),
        P(chip("Orgueilleux", "dark"), { x: 760, y: 1340, z: 30, ry: -16, from: "pop", d: 15.0 }),
        { type: "blank", tone: "blank-b", w: 180, h: 180, x: 960, y: 480, z: -500, ry: -20, blur: 3, d: 0.2 },
        { type: "blank", tone: "blank-l", w: 160, h: 240, x: 110, y: 520, z: -380, ry: 24, blur: 2, d: 0.3 },
      ] },
    // 5 — Souviens-toi : on ne peut empêcher les offenses
    { t0: 33.0, t1: 51.6,
      heads: [
        { words: ["Mais", "souviens-toi,"], key: [1], t0: 33.12, t1: 35.0 },
        { words: ["bien-aimé,", "la", "puissance", "du", "pardon."], key: [0, 4], t0: 35.11, t1: 37.7, step: 0.2 },
        { words: ["Tu", "ne", "pourras", "jamais", "empêcher…"], key: [3], t0: 37.79, t1: 41.3, step: 0.18 },
        { words: ["…les", "malentendus."], key: [1], t0: 41.4, t1: 44.7 },
        { words: ["Les", "mauvaises", "interprétations."], key: [2], t0: 44.83, t1: 51.5, step: 0.5 },
      ],
      cards: [
        { type: "icon", tone: "blue", ic: "heart-ic", x: 540, y: 860, z: 60, d: 2.0, out: -15.5 },
        { type: "search", q: "Comment empêcher les offenses ?", x: 540, y: 760, z: 80, rx: 8, d: 4.8, anim: typing(38.0, 2.6) },
        P(chip("Malentendus", "dark"), { x: 330, y: 960, z: 40, ry: 14, from: "down", d: 8.4 }),
        P(chip("Mauvaises compréhensions", "light", '700 34px "Montserrat"'), { x: 640, y: 1080, z: 0, ry: -10, from: "down", d: 11.8 }),
        P(chip("Mauvaises interprétations", "blue", '700 34px "Montserrat"'), { x: 470, y: 1200, z: 60, ry: 8, from: "down", d: 14.4 }),
        P(chip("Actes · Paroles", "light"), { x: 760, y: 1310, z: -40, ry: -14, from: "down", d: 16.6 }),
        ...BLANKS(33, 1),
      ] },
    // 6 + 7 — La Bible : Colossiens 3:13
    { t0: 51.6, t1: 66.5,
      heads: [
        { words: ["Il", "y", "aura", "toujours", "des", "offenses."], key: [5], t0: 51.71, t1: 53.4, step: 0.12 },
        { words: ["C'est", "ce", "que", "la", "Bible", "nous", "dit."], key: [4], t0: 53.46, t1: 58.3, step: 0.12 },
        { words: ["Pardonnez-vous."], key: [0], t0: 58.47, t1: 66.4 },
      ],
      cards: [
        { type: "bible", ref: "Colossiens 3 : 13", vs: "<b class='h1'>Supportez-vous les uns les autres</b>, et, si l'un a sujet de se plaindre de l'autre, <b class='h2'>pardonnez-vous réciproquement</b>. <b class='h3'>De même que Christ vous a pardonné</b>, pardonnez-vous aussi.",
          x: 540, y: 880, z: 100, rx: 6, d: 3.0, anim: highlight([[".h2", 58.5], [".h1", 60.8], [".h3", 64.3]]) },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 200, y: 560, z: -200, ry: 24, d: 3.4 },
        { type: "icon", tone: "blue", ic: "heart-ic", x: 900, y: 1290, z: -120, ry: -22, d: 3.6 },
        { type: "blank", tone: "blank-d", w: 220, h: 150, x: 900, y: 520, z: -460, ry: -20, blur: 3, d: 3.8 },
        { type: "blank", tone: "blank-l", w: 200, h: 200, x: 150, y: 1330, z: -300, ry: 22, blur: 2, d: 4.0 },
      ] },
  ];

  const CAPS = [
    [0.40, 4.10, "Bienvenue à ce moment de méditation…"],
    [4.26, 5.93, "Je suis encore honoré de partager"],
    [6.01, 7.95, "ce précieux thème avec toi :"],
    [8.50, 10.30, "la puissance du pardon."],
    [10.68, 11.75, "Imaginez l'instant."],
    [11.93, 13.70, "On t'a offensé."],
    [14.27, 15.50, "On t'a blessé."],
    [16.06, 17.30, "Et vous le savez,"],
    [17.40, 19.12, "chacun vit dans ce monde"],
    [19.17, 21.38, "en croyant que c'est lui qui a raison"],
    [21.45, 22.95, "et que c'est les autres qui ont tort."],
    [23.27, 26.10, "Nous croyons toujours que nous avons raison."],
    [26.38, 27.60, "Nous sommes simples,"],
    [27.87, 29.10, "nous sommes humbles"],
    [29.16, 30.85, "et que c'est les autres qui sont compliqués,"],
    [30.95, 32.90, "que c'est les autres qui sont orgueilleux."],
    [33.12, 34.60, "Mais souviens-toi,"],
    [35.11, 36.35, "bien-aimé,"],
    [36.44, 37.70, "la puissance du pardon :"],
    [37.79, 39.40, "tu ne pourras jamais empêcher"],
    [39.52, 41.10, "les gens de t'offenser."],
    [41.40, 44.55, "Tu ne pourras jamais empêcher les malentendus,"],
    [44.83, 47.35, "les mauvaises compréhensions"],
    [47.43, 49.50, "ou les mauvaises interprétations"],
    [49.63, 51.40, "des actes, des paroles de ton prochain."],
    [51.71, 53.40, "Oui, il y aura toujours les offenses."],
    [53.46, 54.65, "C'est ce que la Bible nous dit."],
    [54.77, 55.80, "La Bible nous dit"],
    [55.89, 58.25, "dans Colossiens chapitre 3, le verset 13 :"],
    [58.47, 60.58, "« Pardonnez-vous réciproquement,", true],
    [60.76, 62.50, "supportez-vous les uns les autres", true],
    [62.65, 64.05, "et pardonnez-vous", true],
    [64.31, 66.35, "comme Christ vous a pardonné. »", true],
  ];

  const CAM = [
    // [t, [x, y, z, rx, ry, rz]]
    [0, [0, 40, -260, 10, -14, -2]],
    [8.0, [0, 0, 0, 6, 8, 1]],
    [9.0, [0, 0, 120, 2, 0, 0]],
    [10.8, [0, 0, 60, 4, -6, 0]],
    [16.0, [0, 20, -60, 8, 10, 1]],
    [24.0, [-30, 0, 40, 4, -6, -1]],
    [33.0, [20, 10, -40, 10, 8, 2]],
    [42.0, [0, -20, 60, 6, -10, 0]],
    [51.5, [0, 10, -80, 12, 6, -1]],
    [58.0, [0, 0, 80, 4, -4, 0]],
    [66.4, [0, -10, 180, 2, 2, 0]],
  ];


  // ── Partie 2 (v = source − 26,76) ─────────────────────────────────
  const A = (a) => +(a - 26.76).toFixed(2);
  const phoneRows = (rows) => rows.map((r, i) => `<div class="row r-${i}"><span class="av" style="background:${r[2]}">${r[0]}</span><div><div class="nm">${r[1]}</div><div class="ds">${r[3] || ""}</div></div></div>`).join("");
  const rowsIn = (times) => (tl, el, tIn, tOut, id) =>
    times.forEach((t, i) => tl.fromTo(`#${id} .r-${i}`, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, t));
  const reflect = (tl, el, tIn, tOut, id) => tl.fromTo(`#${id} .refl`, { opacity: 0 }, { opacity: 0.38, duration: 1.2, ease: "power2.out" }, tIn + 0.6);

  SCENES.push(
    // 8 — L'offensé / l'offenseur
    { t0: A(93.5), t1: A(100.1),
      heads: [
        { words: ["La", "Bible", "nous", "parle", "de", "pardonner."], key: [5], t0: A(93.7), t1: A(97.0), step: 0.13 },
        { words: ["L'offensé.", "L'offenseur."], key: [1], t0: A(97.1), t1: A(100.0), step: 1.1 },
      ],
      cards: [
        { type: "vs", tone: "light", k: "L'OFFENSÉ", big: "Blessé", mark: SVG.cross, mc: "#e1251b", x: 300, y: 880, z: 30, ry: 20, from: "left", d: 3.4 },
        { type: "vs", tone: "dark", k: "L'OFFENSEUR", big: "A blessé", mark: SVG.cross, mc: "#e1251b", x: 780, y: 920, z: 0, ry: -20, from: "right", d: 4.5 },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 540, y: 1250, z: -200, d: 0.4 },
        ...BLANKS(0, 2),
      ] },
    // 9 — Toi aussi
    { t0: A(100.1), t1: A(115.6),
      heads: [
        { words: ["Toi", "aussi,"], key: [1], t0: A(100.2), t1: A(104.9) },
        { words: ["tu", "as", "eu", "à", "offenser."], key: [4], t0: A(105.1), t1: A(115.5), step: 0.12 },
      ],
      cards: [
        { type: "phone", s: 0.68, x: 540, y: 870, z: 60, rx: 6, ry: -6, d: 0.5,
          screen: `<div class="app"><div class="ttl">Souviens-toi</div><div class="sub">Toi aussi, tu as eu à…</div>${phoneRows([["1", "Offenser", "#2e3192", "certaines personnes"], ["2", "Mal interpréter", "#1688c4", "les actes de quelqu'un"], ["3", "Accuser à tort", "#e1251b", "quelqu'un"], ["4", "Noircir à tort", "#f7941d", "quelqu'un"]])}</div>`,
          anim: rowsIn([A(105.1), A(107.0), A(109.4), A(112.1)]) },
        { type: "blank", tone: "blank-d", w: 240, h: 240, x: 160, y: 520, z: -300, ry: 24, blur: 2, d: 0.2 },
        { type: "blank", tone: "blank-b", w: 200, h: 140, x: 930, y: 1320, z: -250, ry: -22, blur: 2, d: 0.3 },
        { type: "blank", tone: "blank-l", w: 180, h: 260, x: 950, y: 560, z: -420, ry: -20, blur: 3, d: 0.4 },
      ] },
    // 10 — La base de toute chose : le pardon
    { t0: A(115.6), t1: A(126.0),
      heads: [
        { words: ["La", "base", "de", "toute", "chose…"], key: [1], t0: A(115.8), t1: A(121.3), step: 0.16 },
        { words: ["…c'est", "le", "pardon."], key: [2], t0: A(124.2), t1: A(125.9), step: 0.2 },
      ],
      cards: [
        P(chip("Vie spirituelle", "light"), { x: 540, y: 760, z: 40, from: "down", d: 3.6 }),
        P(chip("Relations", "light"), { x: 330, y: 900, z: 60, ry: 12, from: "down", d: 5.9 }),
        P(chip("Société", "light"), { x: 760, y: 900, z: 60, ry: -12, from: "down", d: 6.9 }),
        P(chip("LE PARDON", "blue", '800 76px "Montserrat"'), { x: 540, y: 1080, z: 80, rx: 10, from: "up", d: 8.5, pad: "40px 90px" }),
        ...BLANKS(0, 1),
      ] },
    // 11 — Prêts à te lapider
    { t0: A(126.0), t1: A(143.2),
      heads: [
        { words: ["Je", "peux", "me", "tromper."], key: [3], t0: A(126.0), t1: A(129.4), step: 0.16 },
        { words: ["Prêts", "à", "te", "lapider…"], key: [3], t0: A(133.9), t1: A(140.0), step: 0.2 },
        { words: ["…alors", "qu'eux", "aussi."], key: [2], t0: A(140.0), t1: A(143.1), step: 0.2 },
      ],
      cards: [
        { type: "vs", tone: "light", k: "MOI AUSSI", big: "Je peux<br>offenser", mark: SVG.check, mc: "#23bded", x: 540, y: 860, z: 60, d: 0.2, out: -9.5 },
        { type: "blank", tone: "blank-d", w: 150, h: 120, r: 50, x: 260, y: 700, z: 40, from: "down", d: 7.6 },
        { type: "blank", tone: "blank-d", w: 120, h: 100, r: 44, x: 820, y: 760, z: -40, from: "down", d: 7.9 },
        { type: "blank", tone: "blank-d", w: 170, h: 130, r: 56, x: 640, y: 1220, z: 80, from: "down", d: 8.3 },
        { type: "blank", tone: "blank-d", w: 110, h: 90, r: 40, x: 380, y: 1180, z: 20, from: "down", d: 8.6 },
        P(chip("Fornication", "dark"), { x: 330, y: 960, z: 100, ry: 14, from: "pop", d: 6.0 }),
        P(chip("Mensonge", "dark"), { x: 760, y: 1000, z: 70, ry: -14, from: "pop", d: 11.0 }),
        P(chip("Eux aussi", "sky"), { x: 540, y: 1100, z: 140, from: "pop", d: 14.2 }),
      ] },
    // 12 — Le visage dans l'eau
    { t0: A(143.2), t1: A(164.9),
      heads: [
        { words: ["Si", "chacun", "pouvait", "se", "mirer…"], key: [4], t0: A(143.2), t1: A(145.5), step: 0.18 },
        { words: ["Le", "visage", "reflète", "le", "visage."], key: [2], t0: A(145.6), t1: A(150.15), step: 0.2 },
        { words: ["Tu", "accuses", "ton", "frère", "?"], key: [3], t0: A(150.2), t1: A(154.7), step: 0.16 },
        { words: ["Le", "visage", "dans", "l'eau."], key: [3], t0: A(154.9), t1: A(164.8), step: 0.2 },
      ],
      cards: [
        { type: "mirror", x: 540, y: 860, z: 40, rx: 4, d: 0.3, anim: reflect, out: -12.9 },
        { type: "bible", ref: "Proverbes 27 : 19", vs: "Comme dans l'eau <b class='h1'>le visage répond au visage</b>, ainsi le cœur de l'homme répond au cœur de l'homme.",
          x: 540, y: 880, z: 100, rx: 6, d: 8.4, anim: highlight([[".h1", A(155.6)]]) },
        { type: "blank", tone: "blank-b", w: 200, h: 200, x: 150, y: 520, z: -380, ry: 22, blur: 3, d: 0.1 },
        { type: "blank", tone: "blank-d", w: 240, h: 160, x: 930, y: 1340, z: -260, ry: -20, blur: 2, d: 0.2 },
      ] },
    // 13 — La paille et la poutre
    { t0: A(164.9), t1: A(177.0),
      heads: [
        { words: ["La", "paille…"], key: [1], t0: A(167.3), t1: A(172.0), step: 0.2 },
        { words: ["…et", "la", "poutre."], key: [2], t0: A(172.0), t1: A(176.9), step: 0.2 },
      ],
      cards: [
        { type: "bible", ref: "Matthieu 7 : 3", vs: "Pourquoi vois-tu <b class='h1'>la paille</b> qui est dans l'œil de ton frère, et n'aperçois-tu pas <b class='h2'>la poutre</b> qui est dans ton œil ?",
          x: 540, y: 880, z: 100, rx: 6, d: 0.2, anim: highlight([[".h1", A(168.4)], [".h2", A(172.6)]]) },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 190, y: 1300, z: -120, ry: 22, d: 0.6 },
        { type: "blank", tone: "blank-d", w: 220, h: 220, x: 900, y: 500, z: -400, ry: -22, blur: 3, d: 0.4 },
      ] },
    // 14 — Le grand secret : voir Dieu
    { t0: A(177.0), t1: A(187.4),
      heads: [
        { words: ["L'un", "des", "grands", "secrets."], key: [3], t0: A(179.3), t1: A(185.2), step: 0.18 },
        { words: ["Voir", "Dieu."], key: [1], big: true, at: [A(185.4), A(186.0)], t1: A(187.4) },
      ],
      cards: [
        { type: "search", q: "Comment vivre la vie du pardon ?", x: 540, y: 820, z: 80, rx: 8, d: 2.3, anim: typing(A(180.2), 2.6), out: -2.2 },
        { type: "weather", tone: "sky", loc: "Mon cœur", deg: "24°", cond: "Ensoleillé", icon: SVG.sun, x: 790, y: 1100, z: 0, ry: -16, d: 3.6, out: -2.2 },
        { type: "clock", x: 280, y: 1120, z: -60, ry: 16, d: 3.9, out: -2.2 },
        ...BLANKS(0, 0),
      ] },
    // 15 — Joseph
    { t0: A(187.4), t1: A(197.5),
      heads: [
        { words: ["Derrière", "celui", "qui", "t'a", "offensé."], key: [0], t0: A(187.5), t1: A(191.8), step: 0.14 },
        { words: ["C'est", "ce", "que", "Joseph", "a", "fait."], key: [3], t0: A(191.9), t1: A(197.4), step: 0.14 },
      ],
      cards: [
        { type: "icon", tone: "sky", ic: "cross-ic", s: 1.5, x: 540, y: 860, z: 60, d: 0.2, out: -5.74 },
        P(chip("JOSEPH", "dark", '800 96px "Montserrat"'), { x: 540, y: 820, z: 80, d: 4.4, pad: "40px 70px" }),
        P(chip("Genèse 37 – 50", "light", '600 34px "Poppins"'), { x: 540, y: 980, z: 120, d: 4.9 }),
        P(chip("Vendu par ses frères", "light"), { x: 360, y: 1150, z: 40, ry: 14, from: "pop", d: 7.2 }),
        P(chip("Dieu derrière", "sky"), { x: 740, y: 1250, z: 60, ry: -14, from: "pop", d: 8.0 }),
        ...BLANKS(0, 2),
      ] },
    // 16 — Voir Dieu derrière l'offense → Pardonner
    { t0: A(197.5), t1: A(208.6),
      heads: [
        { words: ["Il", "faut", "voir", "Dieu."], key: [3], t0: A(197.6), t1: A(208.3), step: 0.18 },
      ],
      cards: [
        { type: "phone", s: 0.68, x: 540, y: 840, z: 80, rx: 5, d: 0.3, keep: true,
          screen: `<div class="app"><div class="ttl">Pardonner</div><div class="sub">Voir Dieu derrière l'offense</div>${phoneRows([["!", "Insulte", "#e1251b"], ["!", "Manque de respect", "#f7941d"], ["!", "Accusation fausse", "#2e3192"], ["!", "Mensonges sur toi", "#1688c4"]])}<div class="btn">Pardonner</div><div class="sheet"><div class="ok"></div><div class="t1">Pardonné</div><div class="t2">« De même que Christ vous a pardonné »</div></div></div>`,
          anim: (tl, el, tIn, tOut, id) => {
            rowsIn([A(200.3), A(201.8), A(204.5), A(206.2)])(tl, el, tIn, tOut, id);
            tl.fromTo(`#${id} .btn`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, A(206.9));
            tl.to(`#${id} .btn`, { scale: 0.93, duration: 0.12, ease: "power1.in" }, A(207.7));
            tl.to(`#${id} .btn`, { scale: 1, duration: 0.4, ease: "back.out(3)" }, A(207.82));
            tl.fromTo(`#${id} .sheet`, { y: 640 }, { y: 0, duration: 0.7, ease: "power3.out" }, A(207.95));
            tl.fromTo(`#${id} .ok`, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)" }, A(208.3));
            tl.to(el, { opacity: 0, z: 400, duration: 1.0, ease: "power2.in" }, A(209.9));
          } },
        { type: "icon", tone: "blue", ic: "heart-ic", x: 170, y: 640, z: -160, ry: 22, d: 1.0 },
        { type: "icon", tone: "sky", ic: "cross-ic", x: 920, y: 1290, z: -120, ry: -22, d: 1.2 },
        { type: "blank", tone: "blank-d", w: 200, h: 140, x: 920, y: 520, z: -420, ry: -22, blur: 3, d: 0.5 },
      ] }
  );

  CAPS.push(
    [A(93.7), A(97.0), "Alors c'est pour cela que la Bible nous parle de pardonner."],
    [A(97.1), A(99.9), "Il y a l'offensé et il y a l'offenseur."],
    [A(100.2), A(102.6), "Toi aussi, tu as eu à offenser certaines personnes."],
    [A(102.6), A(104.9), "Souviens-toi toujours que…"],
    [A(105.1), A(107.0), "toi aussi tu as eu à offenser,"],
    [A(107.0), A(109.4), "tu as eu à mal interpréter les actes de quelqu'un,"],
    [A(109.4), A(111.9), "tu as eu à accuser quelqu'un à tort,"],
    [A(112.1), A(115.4), "tu as eu à noircir quelqu'un à tort. Oui."],
    [A(115.8), A(118.9), "Mais la base de toute chose,"],
    [A(119.0), A(121.4), "de la vie spirituelle,"],
    [A(121.4), A(125.8), "la base de toute bonne relation dans la société, c'est le pardon."],
    [A(126.0), A(129.4), "Je peux me tromper, moi aussi je peux offenser."],
    [A(129.6), A(131.0), "Souviens-toi,"],
    [A(131.0), A(133.9), "il y a des gens qui commettent la fornication,"],
    [A(133.9), A(136.7), "qui sont prêts à te lapider parce que tu as forniqué."],
    [A(136.9), A(140.0), "Il y a des gens prêts à te lapider parce que tu as menti,"],
    [A(140.0), A(143.0), "alors qu'eux aussi, ils mentent."],
    [A(143.2), A(145.6), "Mais si chacun pouvait se mirer…"],
    [A(145.6), A(150.0), "La Bible dit : dans l'eau, le visage reflète le visage."],
    [A(150.2), A(152.0), "Tu accuses ton frère de ça ?"],
    [A(152.0), A(154.7), "Peut-être qu'on peut t'accuser de la même chose."],
    [A(154.9), A(158.4), "Oui, la Bible dit : le visage dans l'eau reflète le visage."],
    [A(158.4), A(161.8), "Quand tu es en train d'accuser quelqu'un de vampire,"],
    [A(161.9), A(164.8), "de sorcier…"],
    [A(165.0), A(167.3), "Oui, c'est pour cela que la Bible dit :"],
    [A(167.3), A(171.8), "« Avant d'enlever la paille qui est dans l'œil de ton frère, souviens-toi", true],
    [A(172.0), A(174.9), "qu'il y a une poutre dans ton œil. »", true],
    [A(174.9), A(176.9), "Oui, bien-aimé."],
    [A(177.1), A(179.3), "Et ce soir, aujourd'hui,"],
    [A(179.3), A(182.2), "je te donne l'un des grands secrets"],
    [A(182.4), A(185.1), "pour pouvoir vivre la vie du pardon :"],
    [A(185.3), A(187.4), "c'est toujours voir Dieu"],
    [A(187.5), A(190.0), "derrière celui qui t'a offensé."],
    [A(190.0), A(191.9), "Ah oui, ah oui ! Voir Dieu."],
    [A(191.9), A(194.4), "C'est ce que Joseph a fait."],
    [A(194.5), A(197.4), "Joseph a vu Dieu derrière ses frères qui l'ont vendu."],
    [A(197.6), A(200.3), "Il faut voir Dieu qui a amené cette personne"],
    [A(200.3), A(204.4), "à t'insulter, à te manquer de respect,"],
    [A(204.5), A(208.1), "à t'accuser faussement, à dire des mensonges sur toi."]
  );

  CAM.push(
    [A(97.0), [-20, 0, 40, 8, -10, -1]],
    [A(105.0), [0, 20, -80, 10, 8, 1]],
    [A(116.0), [10, -10, 40, 6, -6, 0]],
    [A(124.5), [0, 0, 160, 3, 0, 0]],
    [A(133.0), [-20, 20, -40, 10, 10, 2]],
    [A(143.5), [0, 0, 30, 4, -8, 0]],
    [A(155.0), [20, -10, -60, 9, 8, -1]],
    [A(166.0), [0, 0, 60, 5, -4, 0]],
    [A(176.0), [-10, 10, -40, 10, 10, 1]],
    [A(185.5), [0, 0, 170, 2, 0, 0]],
    [A(191.0), [0, 10, -20, 8, -8, -1]],
    [A(198.0), [0, 0, 40, 6, 6, 0]],
    [A(208.4), [0, -20, 200, 2, 0, 0]],
    [186.5, [0, -20, 240, 0, 0, 0]]
  );

  const finale = (tl) => {
    tl.to("#world", { opacity: 0, duration: 1.0, ease: "power2.in" }, 181.6);
    tl.to(["#heads", "#caps"], { opacity: 0, duration: 0.4 }, 181.5);
    tl.fromTo("#end", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 181.9);
    tl.fromTo("#end img", { scale: 0.7, opacity: 0, filter: "blur(14px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.1, ease: "back.out(1.5)" }, 182.0);
    tl.fromTo("#end .n", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 182.5);
    tl.fromTo("#end .s", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 182.8);
    tl.fromTo("#end .r", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 183.0);
    tl.fromTo("#end .a", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 183.4);
  };

  const SFX = [];

  window.MG = { finale, SCENES, CAPS, CAM, SFX, DUR: 186.5, SVG, chip, P, bubbles, typing, highlight, BLANKS };
})();
