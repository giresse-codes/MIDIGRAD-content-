// « Ma part suffit » partie 3 — mise en scène : caméra, visages, foule, étalonnage, cartes, titres, sous-titres.
// Tout est une fonction pure du temps t (timeline GSAP en pause, pilotée par HyperFrames).
window.startFilm = function (W) {
  const F = window.FILM, DUR = F.dur, FPS = F.fps, WD = F.words;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const smooth = (a, b, x) => { const p = clamp((x - a) / (b - a)); return p * p * (3 - 2 * p); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const L3 = (a, b, p) => a.map((x, i) => lerp(x, b[i], p));
  const pulse = (t, a, b, fi = 0.6, fo = 0.9) => Math.min(smooth(a - fi, a, t), 1 - smooth(b, b + fo, t));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");
  const NW = WD.map((w) => norm(w[0]));
  // P("phrase", après) : début du premier mot de la phrase ; PE : fin du dernier mot
  function find(ph, after = 0) {
    const q = ph.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i < NW.length; i++) { if (WD[i][1] < after) continue; let ok = true; for (let j = 0; j < q.length; j++) if (NW[i + j] !== q[j]) { ok = false; break; } if (ok) return [i, i + q.length - 1]; }
    throw new Error("phrase introuvable : " + ph);
  }
  const P = (ph, after) => WD[find(ph, after)[0]][1], PE = (ph, after) => WD[find(ph, after)[1]][2];
  const A0 = WD.find((w) => w[3] === "A")[1], A1 = [...WD].reverse().find((w) => w[3] === "A")[2], N2 = WD.find((w) => w[3] === "N2")[1];
  const END = WD[WD.length - 1][2];
  function track(base) {
    const keys = [];
    return {
      key(t, d, v) { keys.push({ t, d: Math.max(d, 0.001), v }); keys.sort((a, b) => a.t - b.t); return this; },
      at(t) {
        const s = { ...base };
        for (const k of keys) { if (k.t > t) break; const p = ease(clamp((t - k.t) / k.d));
          for (const [n, v] of Object.entries(k.v)) s[n] = Array.isArray(v) ? v.map((x, i) => lerp((s[n] || [])[i] ?? 0, x, p)) : lerp(s[n] ?? 0, v, p); }
        return s;
      },
    };
  }
  // ── repères du texte ──
  const C = {
    bonjour: P("Bien-aimés, bonjour"), mere: P("Mère d'enfants"), jeunesse: P("Dans ma jeunesse"), avorte: P("plusieurs fois avorté"), avorteE: PE("plusieurs fois avorté"),
    mariage: P("Le mariage était bien"), probleme: P("ensuite est venu le problème"), commerage: P("on a commencé le commérage"), maudire: P("toujours en train de me maudire"),
    rancoeur: P("plutôt porté rancœur"), pasteur: P("venir voir le pasteur Yannick"), surprise: P("Mais à ma grande surprise"), pardonner1: P("il m'a demandé de pardonner"),
    nature: P("Il m'a parlé de la nature"), psRef: P("La Bible, dans le Psaume"), ps0: P("L'insensé dit"), ps1: PE("pas même un seul."),
    importante1: P("Là, le pasteur Yannick"), insulte: P("Je voyais cela comme une insulte"), sorciere: P("moi, pareille à cette sorcière"), sorciereE: PE("Non, pasteur !"),
    romRef: P("Et il m'a aussi rappelé, dans Romains"), rom0: P("Ô homme, qui que tu sois"), rom1: PE("échapperas au jugement de Dieu ?"),
    pasAvecLui: P("Quand il me parlait ainsi"), charabia: P("tout ce charabia"), charabiaE: PE("je ne l'ai pas écouté."), maladie: P("ma maladie cardiaque"),
    hopital: P("c'est étant à l'hôpital"), fardeau: PE("comme un fardeau."), juge: P("J'ai jugé ma belle-mère"), rappele: P("Je me suis rappelé ma jeunesse"),
    avorter: P("avorter comme moi"), avorterE: PE("avorter comme moi."), tuais: P("Quand elle me disait que je tuais"), pourtant: P("Et pourtant, bien-aimés"),
    raison: P("Elle avait raison"), fait: PE("je l'ai fait."), utilise: P("Dieu a utilisé ma belle-mère"), fouet: P("les regards focalisés sur le fouet"),
    pardonCoeur: P("si tu avais réellement reçu le pardon"), probleme2: PE("n'aurait pas été un problème."),
    ephRef: P("Éphésiens, chapitre quatre"), eph0: P("Soyez bons les uns"), eph1: PE("pardonné en Christ."), amour: P("l'amour ne tolère pas"),
    colRef: P("Colossiens, chapitre trois"), col0: P("Supportez-vous les uns"), col1: PE("pardonnez-vous aussi."), pourquoi: P("Pourquoi s'aimer"),
    jesus: P("qu'est-ce que Jésus aurait fait"), pardonne2: P("Il aurait pardonné."), recuChrist: P("Et si tu as reçu Christ"),
    galRef: P("Galates, chapitre deux"), gal0: P("J'ai été crucifié"), gal1: PE("c'est Christ qui vit en moi."), honore: P("J'honore encore Christ"),
    onPardonne: P("on pardonne parce qu'on a été pardonné"), eau: P("dans l'eau, le visage"), offense: P("Je ne suis pas différente de celui"),
    compris: P("Une fois que j'ai compris"), reconnaissante: P("Je suis reconnaissante"), priere: P("ma prière aujourd'hui"), facile: P("ce n'est pas facile"),
    amen: P("Amen, amen."), amenE: A1,
    n2: N2, premiere: P("Première chose"), deuxieme: P("Et la deuxième chose"), repentir: P("c'est se repentir", N2), outil: P("À regarder Dieu", N2), fin: END,
  };
  window.__C = C;
  const COLD = (t) => Math.max(pulse(t, C.jeunesse - 0.2, C.psRef - 0.6, 1.2, 1.5) * 0.9, pulse(t, C.maladie, C.utilise + 4, 1.2, 2.0), 0.5 * pulse(t, C.insulte, C.sorciere - 0.5, 1, 1));
  const WARM = (t) => smooth(C.onPardonne - 0.6, C.onPardonne + 2.0, t);
  const VERSE = (t) => Math.max(pulse(t, C.ps0, C.ps1), pulse(t, C.rom0, C.rom1), pulse(t, C.eph0, C.eph1), pulse(t, C.col0, C.col1), pulse(t, C.gal0, C.gal1));

  // ── ANNABELLE : expressions (micro-expressions 0,3-0,5 s) ──
  const E0 = { lid: 0.08, lidLo: 0, bi: 0, bo: 0, bd: 0, ba: 0, lx: 0, ly: 0, smile: 0.15, open: 0, wide: 0, pinch: 0, trem: 0, wet: 0, red: 0, blush: 0.1, hx: 0, hy: 0, hz: 0, lock: 0 };
  const EX = {
    neutre: {}, joie: { smile: 0.9, lidLo: 0.38, bi: 0.25, bo: 0.3, blush: 0.4, hx: -0.06 }, chaleur: { smile: 0.55, lidLo: 0.22, bi: 0.15, blush: 0.25 },
    coeur: { smile: 0.65, lidLo: 0.32, bi: 0.35, blush: 0.4, hz: 0.09, hx: -0.03 },
    serieux: { smile: -0.05, bd: 0.2, pinch: 0.25, bi: 0.1, lid: 0.15 },
    honte: { lid: 0.52, ly: 0.85, bd: 0.4, pinch: 0.75, smile: -0.25, bi: 0.25, hx: 0.24, hy: -0.05, lock: 1 },
    triste: { bi: 0.95, bo: -0.35, smile: -0.45, lid: 0.28, ly: 0.25, hx: 0.08 },
    amer: { lx: 0.8, ly: 0.12, pinch: 0.85, bd: 0.55, bi: -0.25, smile: -0.32, lid: 0.25, hy: -0.2, lock: 1 },
    surprise: { bi: 0.85, bo: 0.85, lid: -0.15, open: 0.28, hx: -0.08 }, resist: { bd: 0.7, pinch: 0.7, smile: -0.32, lid: 0.18, hz: -0.06, hy: 0.12 },
    indigne: { ba: 0.95, bi: 0.15, bo: 0.3, smile: 0.2, pinch: 0.35, lid: 0.05, hz: 0.12, hx: -0.07 },
    gene: { smile: 0.45, lidLo: 0.28, lx: -0.65, ly: 0.3, blush: 0.7, hz: 0.1, hy: -0.14, lock: 1 },
    vide: { lid: 0.2, lx: 0.05, ly: 0.08, wet: 0.75, red: 0.4, bi: 0.6, smile: -0.18, lock: 1 },
    yeuxF: { lid: 1, wet: 0.8, red: 0.6, bi: 0.85, smile: -0.4, trem: 0.5, hx: 0.1, lock: 1 },
    pleure: { lid: 0.42, wet: 1, red: 0.9, bi: 1, bo: -0.3, smile: -0.55, trem: 1, hx: 0.12, ly: 0.35, lock: 1 },
    recueil: { lid: 0.3, ly: 0.35, smile: 0.08, bi: 0.22, hx: 0.06, lock: 1 }, apaise: { smile: 0.38, lid: 0.2, bi: 0.3, wet: 0.45, red: 0.3 },
    soulage: { smile: 0.75, lidLo: 0.32, wet: 0.95, red: 0.55, bi: 0.55, blush: 0.45 }, paix: { smile: 0.55, lidLo: 0.25, lid: 0.12, wet: 0.45, red: 0.25, blush: 0.3 },
    ferme: { lid: 1, smile: 0.4, wet: 0.45, red: 0.25, lock: 1 }, rire: { smile: 0.8, lidLo: 0.45, open: 0.2, blush: 0.6, hx: -0.06, hz: 0.06 },
  };
  const FA = track(E0), ex = (t, k, d = 0.4) => FA.key(t, d, { ...E0, ...EX[k] });
  ex(0, "chaleur"); ex(C.bonjour - 0.3, "joie"); ex(C.bonjour + 2.6, "chaleur"); ex(P("Aujourd'hui, je suis une femme") - 0.2, "joie"); ex(C.mere - 0.3, "coeur"); ex(C.mere + 2.2, "joie");
  ex(C.jeunesse - 0.4, "serieux", 0.5); ex(P("juvénile") - 0.1, "honte"); ex(P("exposée à la débauche"), "honte"); ex(C.avorte - 0.2, "honte", 0.3); ex(C.avorteE + 0.6, "serieux");
  ex(P("j'ai rencontré mon mari") - 0.2, "chaleur"); ex(C.mariage, "chaleur"); ex(C.probleme - 0.1, "triste"); ex(C.commerage - 0.2, "amer"); ex(C.maudire, "amer", 0.3);
  ex(P("et me demandait de laisser") - 0.1, "triste"); ex(C.rancoeur - 0.3, "amer"); ex(P("Je n'en pouvais plus") - 0.2, "triste"); ex(C.pasteur, "serieux");
  ex(C.surprise - 0.1, "surprise", 0.3); ex(C.pardonner1 + 0.5, "resist"); ex(C.nature, "serieux"); ex(C.psRef, "recueil", 0.5);
  ex(C.ps1 + 0.3, "serieux"); ex(C.importante1 + 2.5, "serieux"); ex(C.insulte - 0.2, "resist"); ex(C.sorciere - 0.2, "indigne", 0.3); ex(C.sorciereE - 0.6, "resist", 0.3);
  ex(C.romRef, "serieux"); ex(C.rom0, "recueil", 0.5); ex(C.pasAvecLui - 0.2, "gene"); ex(C.charabia - 0.8, "indigne", 0.3); ex(C.charabia + 0.6, "gene", 0.3); ex(C.charabiaE - 0.4, "rire");
  ex(C.maladie - 0.3, "triste"); ex(C.hopital - 0.2, "vide", 0.5); ex(C.juge - 0.2, "triste"); ex(C.rappele, "vide"); ex(C.avorter - 0.3, "yeuxF", 0.35); ex(C.avorterE + 0.8, "pleure");
  ex(C.tuais, "pleure"); ex(C.pourtant, "vide"); ex(C.raison - 0.2, "pleure", 0.35); ex(C.utilise + 1.5, "triste"); ex(C.fouet, "serieux");
  ex(C.pardonCoeur, "apaise"); ex(C.ephRef - 0.2, "recueil", 0.5); ex(C.eph1 + 0.3, "apaise"); ex(C.amour, "chaleur"); ex(C.colRef - 0.2, "recueil", 0.5);
  ex(C.col1 + 0.3, "apaise"); ex(C.jesus, "serieux"); ex(C.pardonne2 - 0.1, "apaise", 0.5); ex(C.galRef - 0.2, "recueil", 0.5); ex(C.gal1 + 0.3, "apaise");
  ex(C.honore - 0.2, "soulage"); ex(C.onPardonne - 0.2, "soulage"); ex(C.offense, "apaise"); ex(C.compris, "soulage"); ex(C.reconnaissante, "paix"); ex(C.facile, "rire", 0.3);
  ex(C.facile + 1.6, "paix"); ex(C.amen - 0.3, "ferme", 0.35); ex(C.amen + 1.1, "paix", 0.5); ex(A1 + 0.6, "joie", 0.6);
  // larmes : { côté, début, durée de descente, début du séchage }
  const TE = [{ s: 1, t0: C.avorterE - 0.2, d: 3.52, p0: 0, p1: 0.35, off: C.raison - 0.2 }, { s: 1, t0: C.raison - 0.1, d: 7.2, p0: 0.35, p1: 1, off: C.pardonCoeur }, { s: -1, t0: C.fait - 0.2, d: 6.72, p0: 0, p1: 0.95, off: C.pardonCoeur + 2 },
    { s: -1, t0: C.onPardonne + 0.2, d: 6.08, p0: 0, p1: 0.9, off: C.amen - 1 }, { s: 1, t0: C.compris, d: 6.72, p0: 0, p1: 0.8, off: C.amen - 0.5 }];
  const tears = (t) => TE.map((e) => ({ s: e.s, p: lerp(e.p0, e.p1, ease(clamp((t - e.t0) / e.d))), a: clamp((t - e.t0) / 0.3) * (1 - clamp((t - e.off) / 3)) * (t >= e.t0 ? 1 : 0) }));
  // gestes (bras gauche, bras droit) : [avant, écart, coude]
  const HANDS = { L: [0.95, 0.06, 0.9], R: [0.95, 0.06, 0.9] };
  const GA = track({ L: HANDS.L, R: HANDS.R, lean: 0.04, tw: 0 }), g = (t, v, d = 0.5) => GA.key(t, d, v);
  g(C.bonjour - 0.3, { L: [0.9, 0.55, 0.5], R: [0.9, 0.55, 0.5] }); g(C.bonjour + 1.4, HANDS);
  g(C.mere - 0.3, { R: [0.75, -0.55, 2.1], L: HANDS.L }); g(C.mere + 2.3, HANDS);
  g(C.avorte - 0.2, { L: HANDS.L, R: HANDS.R, lean: 0.1 }); g(C.mariage, { lean: 0.04 });
  g(C.surprise - 0.1, { L: [1.1, 0.35, 0.4], R: [1.1, 0.35, 0.4] }, 0.3); g(C.pardonner1 + 0.8, HANDS);
  g(C.sorciere - 0.1, { R: [0.8, -0.45, 2.0], L: HANDS.L }, 0.3); g(C.sorciereE + 0.2, HANDS);
  g(C.charabia - 0.8, { L: [1.0, 0.6, 0.6], R: [1.0, 0.6, 0.6] }, 0.3); g(C.charabiaE, HANDS);
  g(C.fait - 0.2, { R: [1.35, -0.45, 2.35], L: HANDS.L }, 0.5); g(C.fait + 2.6, HANDS, 0.6);
  g(C.amour, { L: [0.9, 0.5, 0.6], R: [0.9, 0.5, 0.6] }); g(C.amour + 2.5, HANDS);
  g(C.honore, { R: [0.75, -0.55, 2.1], L: HANDS.L }); g(C.honore + 3.5, HANDS);
  g(C.amen - 0.3, { R: [2.5, 0.25, 0.35], L: [0.75, -0.55, 2.1] }, 0.5); g(A1 + 0.8, { L: [0.9, 0.55, 0.5], R: [0.9, 0.55, 0.5] }, 0.8);
  const blinkT = []; { let b = 1.3, s = 9; while (b < DUR) { blinkT.push(b); s = (s * 16807) % 2147483647; b += 2.6 + (s / 2147483647) * 2.6; } }
  const blink = (t, ofs = 0) => { let v = 0; for (const b of blinkT) { const d = Math.abs(t + ofs - b); if (d < 0.1) v = Math.max(v, 1 - d / 0.1); if (b > t + ofs + 1) break; } return v; };
  const nz = (t, f, s) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 2.31 + s * 1.7) * 0.4;
  const lev = (t) => { const i = Math.floor(t * FPS); return i >= 0 && i < F.lev.length ? +F.lev[i] / 9 : 0; };
  const speaking = (t) => t >= A0 - 0.1 && t <= A1 + 0.1;
  const step = (t, s) => { const q = Math.floor(t / 1.3); return Math.sin(q * 12.9898 + s) * 0.5; };

  // ── OUVERTURE : arrivée d'Annabelle, pasteurs qui s'installent, fidèles qui entrent ──
  const WALK = [[-8.6, 0, 0.9], [-4.2, 0, 0.7], [-3.3, 0, 0.45], [-3.3, 0.45, -0.2], [-2.75, 0.45, -1.95]];
  const WK0 = 3.0, WK1 = A0 - 0.6;
  function walkPos(t) {
    const p = clamp((t - WK0) / (WK1 - WK0)); const seg = WALK.length - 1, f = p * seg, k = Math.min(seg - 1, Math.floor(f)), u = f - k;
    const a = WALK[k], b = WALK[k + 1]; const pos = L3(a, b, u); if (k === 2) pos[1] = lerp(0, 0.45, smooth(0.3, 0.8, u));
    const dx = b[0] - a[0], dz = b[2] - a[2]; return { pos, ry: p >= 1 ? 0.25 : Math.atan2(dx, dz), walking: p > 0 && p < 1 };
  }

  // ── PLANS DE CAMÉRA ──
  const H = (T) => { const v = W.headPos(T); return [v.x, v.y, v.z]; };
  const fwd = (T) => [Math.sin(T.root.rotation.y), 0, Math.cos(T.root.rotation.y)];
  const add = (...v) => v.reduce((a, b) => a.map((x, i) => x + b[i])), mul = (v, k) => v.map((x) => x * k);
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const side = (T) => { const f = fwd(T); return [f[2], 0, -f[0]]; };
  const SH = {
    aerial(u, o) { const a = (o.a ?? 0.6) + u * (o.da ?? 0.35), r = o.r ?? 14, c = [0, 0, 3.2]; const pos = [c[0] + Math.sin(a) * r, o.h ?? 13, c[2] + Math.cos(a) * r]; return { pos, tgt: [0, 0.4, 2.6], fov: o.fov ?? 40, focus: dist(pos, c), ap: 0.0015, top: false }; },
    follow(u, o) { const h = H(W.A); const pos = add(h, [2.4 - 0.8 * u, 0.5 - 0.3 * u, 3.4 - 0.6 * u]); return { pos, tgt: add(h, [0, -0.25, 0]), fov: 38, focus: dist(pos, h) }; },
    aCU(u, o) { const h = add(H(W.A), [0, -0.04, 0]), f = fwd(W.A), s = side(W.A), d = (o.d ?? 3.0) - (o.push ?? 0.45) * u, sx = (o.sx ?? 0) + (o.arc ?? 0.12) * (u - 0.5);
      const pos = add(h, mul(f, d * Math.cos(sx)), mul(s, d * Math.sin(sx)), [0, o.dy ?? -0.06, 0]); return { pos, tgt: add(h, [0, o.ty ?? 0, 0]), fov: o.fov ?? 24, focus: dist(pos, h), ap: 0.008, maxblur: 0.012 }; },
    aMS(u, o) { const h = H(W.A), f = fwd(W.A), s = side(W.A), d = 3.4 - 0.45 * u, sx = o.sx ?? 0.45;
      const pos = add(h, mul(f, d * Math.cos(sx)), mul(s, d * Math.sin(sx)), [0, -0.25, 0]); return { pos, tgt: add(h, [0, -0.3, 0]), fov: 30, focus: dist(pos, h), ap: 0.005 }; },
    aOTS(u, o) { const h = H(W.A), pos = [-0.9 + (o.x ?? 0) + 0.35 * u, 1.35, 3.6 - 0.5 * u]; const fg = 1.1;
      return { pos, tgt: add(h, [0, -0.08, 0]), fov: 24, focus: lerp(fg, dist(pos, h), smooth(0.08, 0.38, u)), ap: 0.01, maxblur: 0.014 }; },
    side(u, o) { const h = H(W.A), f = fwd(W.A), s = side(W.A), sg = o.sg ?? 1; const pos = add(h, mul(s, 3.1 * sg), mul(f, 1.5 + 0.4 * u), [0, -0.12, 0]); return { pos, tgt: add(h, mul(s, 0.3 * sg), [0, -0.05, 0]), fov: 26, focus: dist(pos, h), ap: 0.008 }; },
    wide(u, o) { const x = (o.x ?? 0.3) + (o.dx ?? 0.9) * (u - 0.5); const pos = [x, 2.6 - 0.2 * u, 9.6 - 1.0 * u]; return { pos, tgt: [x * 0.3, 1.55, -2.4], fov: 44, focus: 10, ap: 0.002 }; },
    wideLow(u, o) { const pos = [1.3 + 0.8 * u, 0.85, 1.9 - 0.3 * u]; return { pos, tgt: [-0.4, 2.35, -2.7], fov: 56, focus: 4.2, ap: 0.003 }; },
    pastors(u, o) { const h = H(W.Y), f = fwd(W.Y); const pos = add(h, mul(f, 3.3 - 0.55 * u), [-0.6 + 0.4 * u, 0.15, 0]); return { pos, tgt: add(h, [0, -0.18, 0]), fov: 30, focus: dist(pos, h), ap: 0.006 }; },
    pCU(u, o) { const T = W[o.who || "Y"], h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 2.8 - 0.35 * u), mul(s, (o.sx ?? 0.5)), [0, -0.05, 0]); return { pos, tgt: add(h, [0, -0.08, 0]), fov: 24, focus: dist(pos, h), ap: 0.009, maxblur: 0.012 }; },
    crowd(u, o) { const x0 = o.x ?? -2.2; const pos = [x0 + (o.dx ?? 1.6) * u, 1.85, 0.4]; return { pos, tgt: [x0 + (o.dx ?? 1.6) * u + 0.6, 0.95, 6.5], fov: 40, focus: 4.2, ap: 0.006 }; },
    hero(u, o) { const T = W.heroes[o.k ?? 0].T, h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 2.6 - 0.4 * u), mul(s, o.sx ?? 0.55), [0, 0.04 + (o.dy ?? 0), 0]); return { pos, tgt: add(h, [0, o.ty ?? -0.08, 0]), fov: 26, focus: dist(pos, h), ap: 0.009, maxblur: 0.012 }; },
    stageBack(u, o) { const pos = [-3.6 + 1.2 * u, 2.2, -4.4]; const h = H(W.A); return { pos, tgt: [0.5 + 0.8 * u, 0.9, 6], fov: 46, focus: dist(pos, h) + 4, ap: 0.003 }; },
  };
  // planning : plans imposés aux moments clés + remplissage par cycles (changement toutes les 3 à 5 s)
  const forced = [
    [C.bonjour - 0.15, "aCU", { push: 0.5 }], [C.mere - 0.2, "aCU", { d: 3.84, ty: -0.12 }], [C.jeunesse - 0.2, "aCU", { sx: 0.35, d: 3.2 }], [C.avorte - 0.4, "aCU", { d: 2.16, push: 0.2, fov: 22 }],
    [C.avorteE + 0.4, "crowd", { x: -1.4, dx: 1.0 }], [C.probleme, "aCU", { sx: -0.3 }], [C.commerage, "side", { sg: -1 }], [C.maudire, "aCU", { sx: 0.28, d: 2.56 }],
    [C.rancoeur, "aOTS", { x: 0.4 }], [C.surprise - 0.2, "aCU", { push: 0.5, d: 3.2 }], [C.pardonner1 + 1.4, "pCU", { who: "Y" }],
    [C.psRef, "wideLow", {}], [C.ps0 + 3.5, "aCU", { d: 3.68 }], [C.ps0 + 8, "crowd", { x: 0.6, dx: -1.4 }], [C.ps0 + 12, "aOTS", {}], [C.ps0 + 16.5, "aCU", { sx: -0.32, d: 3.36 }],
    [C.ps1 - 2, "pastors", {}], [C.insulte - 0.3, "aCU", { sx: 0.3 }], [C.sorciere - 0.2, "aCU", { push: 0.5, d: 2.88 }], [C.sorciere + 2.2, "crowd", { x: -1.0, dx: 0.9 }],
    [C.sorciereE - 0.7, "pastors", {}], [C.rom0 - 0.4, "aCU", { d: 3.68, sx: -0.25 }], [C.rom0 + 6, "wide", {}], [C.rom0 + 10.5, "aCU", {}], [C.rom0 + 15, "hero", { k: 2 }],
    [C.rom0 + 19, "aOTS", { x: -0.4 }], [C.rom0 + 23.5, "aCU", { sx: 0.3, d: 3.36 }], [C.pasAvecLui - 0.2, "aCU", { d: 3.04 }], [C.charabia - 1.0, "aCU", { push: 0.45, d: 2.72 }],
    [C.charabiaE - 1.2, "crowd", { x: -2.4, dx: 1.2 }], [C.maladie - 0.3, "aCU", { d: 3.52, push: 0.25 }], [C.hopital, "aCU", { d: 2.4, push: 0.15, fov: 22 }],
    [C.juge, "side", { sg: 1 }], [C.rappele - 0.3, "aCU", { d: 2.24, push: 0.2 }], [C.avorter - 0.5, "aCU", { d: 1.68, push: 0.18, fov: 21, ty: 0.02, dy: -0.02 }],
    [C.tuais + 0.2, "crowd", { x: -1.0, dx: 0.6 }], [C.pourtant - 0.2, "aCU", { d: 2.56 }], [C.raison - 0.4, "aCU", { d: 1.6, push: 0.12, fov: 20, ty: 0.03, dy: -0.01, arc: 0.04 }],
    [C.fait + 2.4, "pCU", { who: "Y", sx: 0.2 }], [C.utilise + 1.2, "hero", { k: 0 }], [C.fouet - 0.3, "aCU", { sx: -0.3 }], [C.pardonCoeur, "pastors", {}],
    [C.ephRef, "aCU", { d: 3.52 }], [C.eph0 + 3.6, "wideLow", {}], [C.amour, "aCU", { sx: 0.3 }], [C.colRef, "aOTS", {}], [C.col0 + 4, "aCU", { d: 3.2, sx: -0.25 }],
    [C.col0 + 8.5, "hero", { k: 2 }], [C.jesus, "aCU", {}], [C.pardonne2 - 0.2, "pCU", { who: "Em" }], [C.galRef, "wide", { x: -0.6 }], [C.gal0, "aCU", { d: 3.04, push: 0.5 }],
    [C.honore - 0.2, "pCU", { who: "Y", sx: -0.25 }], [C.onPardonne - 0.3, "aCU", { d: 2.32, push: 0.25, fov: 22 }], [C.eau + 0.3, "crowd", { x: 0.2, dx: -1.2 }],
    [C.offense, "aCU", { sx: 0.3, d: 2.88 }], [C.compris, "aOTS", {}], [C.reconnaissante, "aCU", { d: 2.88 }], [C.facile - 0.3, "aCU", { sx: -0.2, d: 2.72 }],
    [C.amen - 0.5, "aCU", { d: 2.56, push: 0.2 }], [A1 + 0.2, "stageBack", {}], [A1 + 2.2, "wide", { x: 0, dx: 0.6 }],
  ].sort((a, b) => a[0] - b[0]);
  const MODE = (t) => (t < C.jeunesse ? "joie" : t < C.psRef ? "conf" : VERSE(t) > 0.5 ? "vers" : t < C.onPardonne ? "mid" : "fin");
  const CYC = {
    joie: [["aCU", { sx: -0.3 }], ["wide", {}], ["aMS", { sx: 0.5 }], ["crowd", {}], ["pastors", {}], ["aOTS", {}], ["aCU", { sx: 0.3 }], ["hero", { k: 1 }], ["wideLow", {}]],
    conf: [["aCU", { sx: 0.25 }], ["aOTS", {}], ["pCU", { who: "Ma" }], ["aMS", { sx: -0.5 }], ["crowd", { x: 0.2, dx: -1 }], ["aCU", { sx: -0.3, d: 2.72 }], ["side", { sg: 1 }], ["pastors", {}]],
    vers: [["aCU", { d: 3.52 }], ["wideLow", {}], ["crowd", { x: -2, dx: 1.4 }], ["aMS", { sx: 0.4 }], ["aOTS", {}], ["hero", { k: 2 }]],
    mid: [["aCU", { sx: -0.25 }], ["wide", {}], ["pCU", { who: "Y" }], ["aOTS", { x: 0.3 }], ["crowd", {}], ["aMS", { sx: 0.5 }], ["hero", { k: 1 }], ["aCU", { sx: 0.3 }], ["pastors", {}]],
    fin: [["aCU", { sx: 0.25 }], ["crowd", { x: -1.8, dx: 1.4 }], ["aMS", { sx: -0.45 }], ["pCU", { who: "Y" }], ["aOTS", {}], ["hero", { k: 0 }]],
  };
  const shots = [{ t0: 0, type: "aerial", o: { a: 0.9, da: -0.55, r: 13, h: 12.5 } }, { t0: WK0 + 0.9, type: "follow", o: {} }];
  { let cur = A0 - 0.35, fi = 0, cyc = 0, sd = 3; shots.push({ t0: cur, type: "aCU", o: { push: 0.4, d: 3.52 } }); cur += 3.6;
    const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    while (fi < forced.length && forced[fi][0] < cur) fi++;
    while (cur < N2 - 0.4) {
      const nf = fi < forced.length ? forced[fi][0] : 1e9;
      if (nf - cur < 6.2) {
        if (nf - cur >= 2.6) { const m = MODE(cur), c = CYC[m][cyc++ % CYC[m].length]; shots.push({ t0: cur, type: c[0], o: c[1] }); }
        shots.push({ t0: nf, type: forced[fi][1], o: forced[fi][2] }); cur = nf + (forced[fi][1] === "aerial" ? 9 : forced[fi][2].d && forced[fi][2].d < 1.2 ? 4.8 : 3.6); fi++;
        while (fi < forced.length && forced[fi][0] < cur - 1.0) fi++;
        if (fi < forced.length && forced[fi][0] < cur) cur = forced[fi][0];
      } else { const m = MODE(cur), c = CYC[m][cyc++ % CYC[m].length]; shots.push({ t0: cur, type: c[0], o: c[1] }); cur += 3.3 + rnd() * 1.4; }
    }
  }
  // narration finale : la caméra s'élève et s'éloigne au-dessus de la salle (un angle toutes les ~5,5 s)
  { const n = Math.round((F.logo - N2) / 5.6); for (let k = 0; k < n; k++) { const t0 = N2 - 0.3 + k * (F.logo - N2) / n, p = k / Math.max(1, n - 1);
      shots.push({ t0, type: "aerial", o: { a: -0.9 + (k % 4) * 0.62 + k * 0.08, da: (k % 2 ? 0.22 : -0.22), r: 6.5 + 10.5 * p, h: 4.2 + 10 * p, fov: 46 - 8 * p } }); } }
  for (let i = shots.length - 1; i >= 0; i--) if (shots[i].t0 >= N2 - 0.4 && shots[i].type !== "aerial") shots.splice(i, 1);
  shots.sort((a, b) => a.t0 - b.t0); shots.forEach((s, i) => (s.t1 = i + 1 < shots.length ? shots[i + 1].t0 : DUR));
  for (let i = shots.length - 1; i > 0; i--) if (shots[i].t1 - shots[i].t0 < 0.8) { shots[i - 1].t1 = shots[i].t1; shots.splice(i, 1); }
  window.__shots = shots;
  const WH = 0.2;
  function camAt(t) {
    let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
    const s = shots[i], u = clamp((t - s.t0) / (s.t1 - s.t0)), c = SH[s.type](u, s.o);
    c.yaw = 0; c.pitch = 0; let bx = 0, by = 0; const dir = i % 2 ? 1 : -1, vert = i % 5 === 3;
    if (i + 1 < shots.length && t > s.t1 - WH && t < LOGO0) { const p = Math.pow((t - (s.t1 - WH)) / WH, 2); if (vert) { c.pitch = 0.5 * p * dir; by = 0.045 * p * dir; } else { c.yaw = 0.55 * p * dir; bx = 0.05 * p * dir; } }
    if (i > 0 && t < s.t0 + WH) { const pd = (i - 1) % 2 ? 1 : -1, pv = (i - 1) % 5 === 3, p = Math.pow(1 - (t - s.t0) / WH, 2); if (pv) { c.pitch = -0.5 * p * pd; by = -0.045 * p * pd; } else { c.yaw = -0.55 * p * pd; bx = -0.05 * p * pd; } }
    c.blur = [bx, by]; c.shot = s; return c;
  }

  // ── PERSONNAGES SECONDAIRES : pasteurs, interprète, fidèles ──
  const laughT = (t) => Math.max(pulse(t, C.sorciere + 0.6, C.sorciereE + 1.0, 0.4, 1.2), pulse(t, C.charabia + 0.2, C.charabiaE + 0.8, 0.4, 1.0), 0.6 * pulse(t, C.facile + 0.3, C.facile + 2.2, 0.3, 0.8));
  const moved = (t) => Math.max(pulse(t, C.avorter, C.utilise + 3, 1.0, 2), pulse(t, C.honore, C.onPardonne + 6, 1, 2), pulse(t, C.amen - 1, A1 + 3, 0.6, 2) * 0.7);
  const amenT = (t) => Math.max(pulse(t, C.ps1 + 0.1, C.ps1 + 1.6, 0.3, 0.6), pulse(t, C.eph1 + 0.1, C.eph1 + 1.4, 0.3, 0.6), pulse(t, C.col1 + 0.1, C.col1 + 1.4, 0.3, 0.6), pulse(t, C.gal1 + 0.1, C.gal1 + 1.6, 0.3, 0.6), pulse(t, C.pardonne2 + 0.4, C.pardonne2 + 1.6, 0.3, 0.6), pulse(t, C.amen, A1 + 0.6, 0.3, 0.6));
  const STAND0 = A1 + 0.3, STAND1 = N2 + 3.5;
  function crowdState(t) {
    return { appear: t, bow: Math.max(pulse(t, C.avorte, C.avorte + 5, 0.6, 1.5), 0.5 * pulse(t, C.hopital, C.fardeau + 1, 1, 1.5), 0.7 * pulse(t, C.avorter, C.raison + 5, 1, 2)),
      laugh: laughT(t), amen: amenT(t), clap: pulse(t, STAND0 - 0.2, STAND1, 0.5, 1.2), stand: pulse(t, STAND0 + 0.2, STAND1, 0.9, 1.4),
      wipe: pulse(t, C.raison + 1, C.utilise + 3, 0.8, 1.2), nod: 0.5 + 0.5 * VERSE(t), closed: 0.7 * VERSE(t) + 0.3 * pulse(t, C.amen, A1, 0.3, 0.5) };
  }
  const seatedPose = (t, ph, o = {}) => ({ seated: 1, lean: -0.05 + (o.lean || 0), breath: 0.012 * Math.sin(t * 1.6 + ph), headX: 0.04 * Math.sin(t * 0.6 + ph) + (o.hx || 0), headY: 0.12 * Math.sin(t * 0.21 + ph) + (o.hy || 0), headZ: o.hz || 0,
    L: o.L || [0.55, 0.05, 0.9], R: o.R || [0.55, 0.05, 0.9], lift: o.lift || 0 });
  function pastorFace(t, ph, k) {
    const lg = laughT(t), mv = moved(t) * (k === 0 ? 1 : 0.5), am = amenT(t);
    const amenMouth = am > 0.2 ? 0.25 * Math.max(0, Math.sin((t + ph) * 6)) : 0;
    return { lid: Math.max(0.1 + 0.3 * mv, blink(t, ph)), lidLo: 0.25 * lg, bi: 0.15 + 0.6 * mv, smile: 0.25 + 0.6 * lg + 0.1 * mv, open: 0.18 * lg + amenMouth, wet: 0.85 * mv, red: 0.45 * mv,
      ly: 0.05, lx: (k === 0 ? -0.25 : -0.35) + 0.1 * Math.sin(t * 0.3 + ph), blush: 0.15 + 0.2 * lg, t, tears: k === 0 && mv > 0.5 ? [{ s: -1, p: clamp((t - C.honore - 1) / 6) * 0.7, a: pulse(t, C.honore + 1, C.onPardonne + 6, 0.4, 2) }] : [] };
  }
  const nodAt = (t, ph, rate = 1) => 0.07 * Math.max(0, Math.sin(t * 1.9 * rate + ph)) * (0.5 + 0.5 * Math.sin(t * 0.37 + ph));

  // ── DOM : cartes de versets, titres, sous-titres, flash-back ──
  const VCARDS = [
    { ref: "PSAUME 14 : 1-3", a: C.ps0, b: C.ps1, hl: ["aucun qui fasse le bien", "Tous sont égarés", "pas même un seul"] },
    { ref: "ROMAINS 2 : 1-3", a: C.rom0, b: C.rom1, hl: ["inexcusable", "tu te condamnes toi-même", "tu fais les mêmes choses"] },
    { ref: "ÉPHÉSIENS 4 : 32", a: C.eph0, b: C.eph1, hl: ["Soyez bons", "vous pardonnant réciproquement", "comme Dieu vous a pardonné en Christ"] },
    { ref: "COLOSSIENS 3 : 13", a: C.col0, b: C.col1, hl: ["Supportez-vous les uns les autres", "pardonnez-vous réciproquement", "De même que Christ vous a pardonné"] },
    { ref: "GALATES 2 : 20", a: C.gal0, b: C.gal1, hl: ["crucifié avec Christ", "c'est Christ qui vit en moi"] },
  ];
  const cardsEl = $("#cards");
  VCARDS.forEach((c) => {
    const i0 = WD.findIndex((w) => w[1] >= c.a - 0.01), i1 = WD.findIndex((w) => w[2] >= c.b - 0.01);
    const ids = []; for (let i = i0; i <= i1; i++) ids.push(i);
    const hl = new Set(); for (const h of c.hl) { const [a, b] = find(h, c.a - 0.05); for (let i = a; i <= b; i++) hl.add(i); }
    const el = document.createElement("div"); el.className = "vcard";
    el.innerHTML = `<div class="ref">${c.ref}</div><div class="tx">${ids.map((i) => `<span class="${hl.has(i) ? "k" : ""}">${WD[i][0]}</span>`).join(" ")}</div>`;
    cardsEl.appendChild(el); c.el = el; c.spans = [...el.querySelectorAll(".tx span")]; c.ids = ids;
  });
  const TITLES = [
    { a: C.premiere, b: C.deuxieme - 0.3, html: "1. JE NE SUIS PAS<br>DIFFÉRENT D'ELLE" }, { a: C.deuxieme, b: C.repentir - 0.3, html: "2. CELUI QUI A ÉTÉ PARDONNÉ<br>PEUT PARDONNER" },
    { a: C.repentir, b: C.outil - 0.3, html: "SE REPENTIR" }, { a: C.outil, b: END + 0.8, html: "REGARDER DIEU,<br>ET NON L'OUTIL" },
  ];
  const titlesEl = $("#titles"); TITLES.forEach((x) => { const el = document.createElement("div"); el.className = "ttl"; el.innerHTML = x.html; titlesEl.appendChild(el); x.el = el; });
  // sous-titres : un mot à la fois (ponctuation seule rattachée au mot précédent)
  const SW = []; WD.forEach((w) => { const m = w[0].replace(/[«»"]/g, "").replace(/[,;:.…]+$/g, ""); if (!norm(m)) { if (SW.length && /[?!]/.test(w[0])) SW[SW.length - 1].m += " " + w[0].trim(); return; } SW.push({ m, a: w[1], b: w[2], who: w[3] }); });
  const subW = $("#subw"), subWho = $("#subwho"), subs = $("#subs");
  let lastSub = -2;
  const flash = $("#flash"), FL0 = C.hopital + 0.35, FL1 = FL0 + 2.9;
  const white = $("#white"), fin = $("#motfin"), LOGO0 = F.logo;
  const tag = $("#tag");

  function update(t) {
    // Annabelle
    const wk = walkPos(t), A = W.A;
    A.root.position.set(...wk.pos); A.root.rotation.y = wk.ry;
    const fa = FA.at(t), ga = GA.at(t), spk = speaking(t), lv = spk ? lev(t) : 0;
    const look = (1 - fa.lock) * (0.32 * Math.sin(t * 0.19 + 1) + 0.1 * step(t, 1)), lookY = (1 - fa.lock) * 0.06 * step(t, 7);
    const lid = Math.max(fa.lid, fa.lid < 0.9 ? blink(t) : 0);
    A.faceSet({ ...fa, lx: clamp(fa.lx + look, -1, 1), ly: clamp(fa.ly + lookY, -1, 1), lid, open: clamp(fa.open + lv * 0.42 * (1 - 0.6 * fa.pinch), 0, 0.6), tears: tears(t), t });
    if (wk.walking) { const ph = t * 7.5; A.pose({ lean: 0.03, L: [0.35 * Math.sin(ph), 0.1, 0.2], R: [-0.35 * Math.sin(ph), 0.1, 0.2], headX: 0.05 });
      A.legs[0].L.rotation.x = 0.45 * Math.sin(ph); A.legs[1].L.rotation.x = -0.45 * Math.sin(ph); A.legs[0].K.rotation.x = 0.3 * Math.max(0, -Math.sin(ph)); A.legs[1].K.rotation.x = 0.3 * Math.max(0, Math.sin(ph)); A.hips.position.y = 0.74 + 0.02 * Math.abs(Math.cos(ph)); }
    else A.pose({ lean: ga.lean, breath: 0.012 * Math.sin(t * 1.7), headX: fa.hx + lv * 0.03 * Math.sin(t * 9) + 0.02 * nz(t, 0.7, 1), headY: fa.hy + look * 0.3 + 0.03 * nz(t, 0.5, 2), headZ: fa.hz + 0.02 * nz(t, 0.4, 3),
      L: ga.L, R: ga.R, twist: look * 0.08 });
    // interprète : écoute, hoche la tête, petits gestes ; bouche fermée
    const I = W.I, g1 = 0.5 + 0.5 * Math.sin(t * 0.8);
    I.pose({ lean: 0.05, headX: 0.05 + nodAt(t, 2), headY: -0.35 + 0.05 * Math.sin(t * 0.3), L: [0.95, 0.06, 0.9], R: [0.95 + 0.2 * g1 * (Math.sin(t * 0.23) > 0.6 ? 1 : 0), 0.15, 0.9], breath: 0.01 * Math.sin(t * 1.5) });
    I.faceSet({ lid: Math.max(0.15, blink(t, 0.7)), smile: 0.12 + 0.35 * laughT(t), lx: -0.6, ly: 0.05, bi: 0.1 + 0.3 * moved(t), wet: 0.3 * moved(t), t });
    // pasteurs : installation (ouverture), écoute, « amen », émotion de Yannick
    const sit = smooth(1.2, 3.2, t), stand = pulse(t, STAND0 + 0.6, STAND1 - 0.4, 0.8, 1.2);
    [[W.Y, 0], [W.Em, 1], [W.Ma, 2]].forEach(([T, k]) => {
      const ph = k * 1.7, am = amenT(t), seat = sit * (1 - stand);
      const p = seatedPose(t, ph, { hx: nodAt(t, ph, 1 + k * 0.2) + 0.15 * moved(t) * (k === 0 ? 1 : 0.3) - 0.08 * laughT(t), hy: -0.2 + (k === 2 ? 0.25 : 0), lean: 0.05 + 0.1 * moved(t) * (k === 0 ? 1 : 0),
        R: am > 0.2 && k !== 1 ? [lerp(0.55, 2.5, am), 0.2, 0.3] : k === 0 && moved(t) > 0.5 && t > C.honore ? [0.8, -0.5, 2.1] : stand > 0.2 ? [1.2, -0.25 + 0.2 * Math.sin(t * 13 + k), 0.9] : [0.75, 0.05, 1.0],
        L: stand > 0.2 ? [1.2, -0.25 + 0.2 * Math.sin(t * 13 + k + 0.5), 0.9] : [0.75, 0.05, 1.0] });
      p.seated = seat; T.pose(p); T.faceSet(pastorFace(t, ph, k));
    });
    // fidèles détaillés (gros plans)
    const cs = crowdState(t);
    W.heroes.forEach((h, k) => {
      const T = h.T, ph = 2 + k * 2.3, sc = clamp((t - 0.4 - k * 0.5) / 0.4), st = cs.stand;
      T.root.scale.setScalar(sc < 1 ? 0.0001 + sc * (1 + 0.3 * Math.sin(sc * Math.PI)) : 1);
      const wipe = k === 0 ? pulse(t, C.raison + 0.8, C.utilise + 4, 0.6, 1) : 0, amen = k === 2 ? cs.amen : k === 1 ? 0 : cs.amen * 0.5, clap = Math.max(cs.clap, k === 1 ? 0.6 * cs.laugh : 0);
      const cl = Math.sin(t * 13 + k);
      const p = seatedPose(t, ph, { hx: 0.4 * cs.bow + nodAt(t, ph) * cs.nod - 0.12 * cs.laugh * (0.5 + 0.5 * Math.sin(t * 7 + k)) + 0.1 * wipe, lean: 0.25 * cs.bow,
        R: wipe > 0.1 ? [lerp(0.55, 1.45, wipe), -0.45 * wipe, lerp(0.9, 2.35, wipe)] : amen > 0.1 ? [lerp(0.55, 2.6, amen), 0.25, 0.2] : clap > 0.1 ? [1.1, -0.2 + 0.18 * cl, 1.0] : null,
        L: clap > 0.1 && wipe < 0.1 ? [1.1, -0.2 - 0.18 * cl, 1.0] : null, lift: 0 });
      p.seated = 1 - st; T.pose(p);
      T.faceSet({ lid: Math.max(cs.closed > 0.5 + k * 0.1 || cs.bow > 0.6 ? 0.92 : 0.1 + 0.3 * wipe, blink(t, ph)), lidLo: 0.35 * cs.laugh, bi: 0.2 + 0.7 * wipe + 0.3 * cs.bow, smile: 0.3 + 0.6 * cs.laugh - 0.4 * wipe + 0.3 * cs.clap,
        open: 0.25 * cs.laugh * (0.5 + 0.5 * Math.sin(t * 9 + k)), wet: 0.9 * wipe + 0.3 * moved(t), red: 0.6 * wipe, lx: 0.3 - 0.2 * k, ly: -0.25, blush: 0.2 + 0.4 * cs.laugh, t,
        tears: k === 0 ? [{ s: 1, p: clamp((t - C.raison - 0.2) / 3) * 0.8, a: pulse(t, C.raison, C.utilise + 4, 0.3, 2) }] : [] });
    });
    // caméra + rendu
    const c = camAt(t);
    W.C.top.visible = c.top !== false;
    const cold = COLD(t) * (1 - WARM(t)), warm = WARM(t);
    const sp = Math.max(pulse(t, C.amen, A1 + 2.5, 0.4, 1.5), 0);
    W.render(t, { cam: c, crowd: cs, cold, warm, blurX: c.blur[0], blurY: c.blur[1], sparks: sp, sparkAt: [-2.75, 2.2, -1.6],
      logo: t >= LOGO0 ? { rot: lerp(-2.4, 0, ease(clamp((t - LOGO0) / 1.6))) + 0.15 * Math.sin((t - LOGO0) * 1.2), scale: lerp(0.4, 1, ease(clamp((t - LOGO0) / 1.2))), y: 0.55, sparks: clamp((t - LOGO0 - 0.6) / 0.6) } : null });
    // cartes de versets : apparition flottante, mots lus en surbrillance
    VCARDS.forEach((cd) => {
      const o = pulse(t, cd.a - 0.4, cd.b + 0.9, 0.5, 0.6); cd.el.style.opacity = o.toFixed(3);
      if (o > 0) { cd.el.style.transform = `translateY(${((1 - o) * 40 + 6 * Math.sin(t * 1.1)).toFixed(1)}px) rotateX(${(4 * Math.sin(t * 0.7)).toFixed(2)}deg) scale(${(0.94 + 0.06 * o).toFixed(3)})`;
        cd.spans.forEach((s, j) => { const r = WD[cd.ids[j]][1] <= t ? 1 : 0; if (s._r !== r) { s.classList.toggle("r", !!r); s._r = r; } }); }
    });
    TITLES.forEach((x) => { const o = pulse(t, x.a - 0.1, x.b, 0.3, 0.4); x.el.style.opacity = o.toFixed(3); const p = clamp((t - x.a + 0.1) / 0.35);
      x.el.style.transform = `translateX(-50%) scale(${(p < 1 ? 0.7 + 0.3 * (1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2)) : 1).toFixed(3)})`; });
    // sous-titres
    let k = -1; for (let i = 0; i < SW.length; i++) { if (SW[i].a <= t) k = i; else break; }
    const show = k >= 0 && t <= SW[k].b + 0.35 && t < LOGO0;
    if (show) { const w = SW[k]; if (k !== lastSub) { subW.textContent = w.m; subWho.textContent = w.who === "A" ? "ANNABELLE" : "NARRATEUR"; subWho.className = w.who === "A" ? "a" : "n"; lastSub = k; }
      const p = clamp((t - w.a) / 0.13); subW.style.transform = `scale(${(0.85 + 0.15 * (1 + 2.6 * Math.pow(p - 1, 3) + 1.6 * Math.pow(p - 1, 2))).toFixed(3)})`; subs.style.opacity = "1"; }
    else subs.style.opacity = "0";
    // flash-back hôpital (≤ 3 s)
    const fo = pulse(t, FL0, FL1, 0.25, 0.3); flash.style.opacity = fo.toFixed(3); if (fo > 0) flash.firstElementChild.style.transform = `scale(${(1.06 + 0.05 * clamp((t - FL0) / 3)).toFixed(4)})`;
    // fin : fondu blanc, logo 3D, phrase finale
    white.style.opacity = pulse(t, LOGO0 - 0.1, LOGO0 + 0.05, 0.5, 0.5).toFixed(3);
    const fo2 = clamp((t - LOGO0 - 1.4) / 0.6); fin.style.opacity = fo2.toFixed(3); fin.style.transform = `translateX(-50%) translateY(${((1 - fo2) * 30).toFixed(1)}px)`;
    tag.style.opacity = (pulse(t, 0.3, A0 - 1.2, 0.5, 0.6)).toFixed(3);
  }
  const proxy = { v: 0 };
  tl.to(proxy, { v: DUR, duration: DUR, ease: "none", modifiers: { v: (x) => { update(parseFloat(x)); return x; } } }, 0);
  update(0);
  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__film = { tl, update };
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
};
