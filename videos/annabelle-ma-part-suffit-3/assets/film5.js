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
  const pulse = (t, a, b, fi = 0.6, fo = 0.9) => !isFinite(a) || !isFinite(b) ? 0 : Math.min(smooth(a - fi, a, t), 1 - smooth(b, b + fo, t));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");
  const NW = WD.map((w) => norm(w[0]));
  // P("phrase", après) : début du premier mot de la phrase ; PE : fin du dernier mot
  function find(ph, after = 0) {
    const q = ph.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i < NW.length; i++) { if (WD[i][1] < after) continue; let ok = true; for (let j = 0; j < q.length; j++) if (NW[i + j] !== q[j]) { ok = false; break; } if (ok) return [i, i + q.length - 1]; }
    return null;
  }
  const P = (ph, after) => { const r = find(ph, after); return r ? WD[r[0]][1] : NaN; }, PE = (ph, after) => { const r = find(ph, after); return r ? WD[r[1]][2] : NaN; };
  const A0 = WD.find((w) => w[3] === "A")[1], A1 = [...WD].reverse().find((w) => w[3] === "A")[2], E0 = WD.find((w) => w[3] === "E")[1], E1 = [...WD].reverse().find((w) => w[3] === "E")[2], N2 = E0;
  const I0 = F.i0, I1 = F.i_end, AP = F.ap, LA = F.laugh;
  // applaudissements n° 2 : Annabelle descend et regagne sa place, Emmanuel se lève et monte au pupitre d'Annabelle
  const WA = [AP[1] + 0.3, AP[1] + 4.6], WE = [AP[1] + 0.2, E0 - 0.25], EARR = WE[1];
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
    bonjour: P("Bien-aimés, bonjour"), aimee: P("Je suis une femme aimée"), mere: P("mère d'enfants"), jeunesse: P("Dans ma jeunesse"), debauche: P("exposée à la débauche"),
    avorte: P("plusieurs fois avorté"), avorteE: PE("plusieurs fois avorté."), mariee: P("Puis je me suis mariée"), enfants: P("je n'arrivais pas"),
    maudire: P("Ma belle-mère ne cessait"), rancoeur: P("j'ai porté rancœur"), pasteur: P("Alors je suis venue voir"), surprise: P("Mais à ma grande surprise"),
    pardonner1: P("il m'a demandé de pardonner"), nature: P("Il m'a parlé de la nature"), psRef: P("Psaume 14"), ps0: P("Tous sont égarés"), ps1: PE("pas même un seul."),
    pasDiff: P("Il m'a dit que ma belle-mère"), coeur: P("Je disais en mon cœur"), sorciere: P("moi, pareille à cette sorcière"), sorciereE: PE("Non, pasteur"),
    romRef: P("Il m'a aussi rappelé Romains"), rom0: P("Ô homme, qui que tu sois"), rom1: PE("tu fais les mêmes choses."), tete: P("Mais dans ma tête"),
    charabia: P("tout ce charabia"), charabiaE: PE("tout ce charabia"), maladie: P("Ensuite est venue ma maladie"), hopital: P("c'est à l'hôpital"), fardeau: PE("comme un fardeau."),
    juge: P("J'ai jugé ma belle-mère"), pire: P("pourtant je suis pire"), tuais: P("Quand elle me disait que je tuais"), voyais: P("je la voyais comme une sorcière"),
    raison: P("Elle avait raison"), fait: PE("je l'ai fait."), fouet: P("Mais j'avais les regards"), yannick2: P("Le pasteur Yannick m'a dit"), pardonCoeur: P("si tu avais réellement compris"),
    probleme2: PE("n'aurait pas été un problème."), ephRef: P("Éphésiens, chapitre 4"), eph0: P("Soyez bons les uns"), eph1: PE("pardonné en Christ."),
    colRef: P("Colossiens, chapitre 3"), col0: P("De même que Christ"), col1: PE("pardonnez-vous aussi."), jesus: P("Qu'est-ce que Jésus aurait fait"), pardonne2: P("Il aurait pardonné."),
    galRef: P("Galates, chapitre 2"), gal0: P("J'ai été crucifié"), gal1: PE("c'est Christ qui vit en moi."), honore: P("J'honore encore Christ"),
    onPardonne: P("on pardonne parce qu'on a été pardonné"), eau: P("dans l'eau, le visage"), offense: P("Je ne suis pas différente de celui"), compris: P("Une fois que j'ai compris"),
    verite: P("En vérité, je découvre"), decouvert: P("et j'ai découvert réellement"), recu: P("que celui qui a reçu le pardon"), priere: P("Et ma prière aujourd'hui"),
    facile: P("ce n'est pas facile"), amen: P("Amen, amen.", A0), amenE: A1,
    // interprète
    i0: I0, iAccueil: P("Nous accueillons", I0), iEm: P("le pasteur Emmanuel", I0),
    // pasteur Emmanuel
    e0: E0, eHonore: P("j'honore vraiment", E0), eTemoin: P("Le témoignage", E0), eMidi: P("mes frères et sœurs de la MIDIGRAD", E0), eTrois: P("trois points essentiels", E0),
    eApotre: P("l'apôtre Paris Talla", E0), eP1: P("Premier point", E0), eP2: P("Deuxième point", E0), eVoler: P("Celui-là que tu accuses", E0), eMonte: P("c'est monté", E0),
    eMonteE: PE("c'est descendu.", E0), eDiff: P("tu n'es pas différent", E0), eCond: P("Il suffit juste", E0), eAmenQ: P("Amen ? Si tu veux", E0), eReponds: P("Si tu veux", E0),
    ePlaire: P("Moi, je ne suis pas ici", E0), ePlaireE: PE("pour plaire à quelqu'un.", E0), eP3: P("Troisième point", E0), eMort: P("Ah, ça, c'est alors", E0), eMortE: PE("ici à la MIDIGRAD.", E0),
    eSachez: P("Mais bien-aimés, sachez", E0), eColere: P("que ça te plaise ou non", E0), eColereE: PE("que ça te plaise ou non.", E0), eFond: P("Le fondement même", E0),
    eMonteP: P("Je ne monte pas ici", E0), eDonner: P("je suis là pour donner", E0), eBenis: P("Restons infiniment bénis", E0), eTermine: P("J'en ai terminé", E0), eAmen: P("Amen, amen.", E0), fin: END,
  };
  window.__C = C;
  // lumière froide pendant la confession (jeunesse, rancœur, hôpital) ; chaude à partir de « on pardonne… » et à la fin du message
  const COLD = (t) => Math.max(pulse(t, C.jeunesse - 0.2, C.pasteur - 0.4, 1.2, 1.5) * 0.9, pulse(t, C.maladie, C.fouet + 3, 1.2, 2.0), 0.4 * pulse(t, C.eColere - 0.2, C.eColereE + 0.6, 0.4, 1.2));
  const WARM = (t) => Math.max(smooth(C.onPardonne - 0.6, C.onPardonne + 2.0, t) * (1 - smooth(E0 + 20, E0 + 26, t)), smooth(C.eBenis - 1.5, C.eBenis + 1.0, t));
  const VERSE = (t) => Math.max(pulse(t, C.ps0, C.ps1), pulse(t, C.rom0, C.rom1), pulse(t, C.eph0, C.eph1), pulse(t, C.col0, C.col1), pulse(t, C.gal0, C.gal1));

  // ── ANNABELLE : expressions ──
  const EB = { lid: 0.08, lidLo: 0, bi: 0, bo: 0, bd: 0, ba: 0, ang: 0, lx: 0, ly: 0, smile: 0.15, open: 0, wide: 0, pinch: 0, trem: 0, wet: 0, red: 0, blush: 0.1, hx: 0, hy: 0, hz: 0, lock: 0 };
  const EX = {
    neutre: {}, joie: { smile: 0.9, lidLo: 0.38, bi: 0.25, bo: 0.3, blush: 0.4, hx: -0.06 }, chaleur: { smile: 0.55, lidLo: 0.22, bi: 0.15, blush: 0.25 },
    coeur: { smile: 0.65, lidLo: 0.32, bi: 0.35, blush: 0.4, hz: 0.09, hx: -0.03 },
    serieux: { smile: -0.05, bd: 0.2, pinch: 0.25, bi: 0.1, lid: 0.15 },
    honte: { lid: 0.55, ly: 0.9, bd: 0.4, pinch: 0.75, smile: -0.3, bi: 0.45, blush: 0.55, hx: 0.26, hy: -0.08, lock: 1 },
    triste: { bi: 0.95, bo: -0.35, smile: -0.45, lid: 0.28, ly: 0.25, hx: 0.08 },
    amer: { lx: 0.8, ly: 0.12, pinch: 0.85, bd: 0.55, bi: -0.25, smile: -0.32, lid: 0.25, hy: -0.2, lock: 1 },
    surprise: { bi: 0.85, bo: 0.85, lid: -0.15, open: 0.28, hx: -0.08 }, resist: { bd: 0.7, pinch: 0.7, smile: -0.32, lid: 0.18, hz: -0.06, hy: 0.12 },
    indigne: { ba: 0.95, bi: 0.15, bo: 0.3, smile: 0.25, pinch: 0.35, lid: -0.05, wide: 0.4, hz: 0.14, hx: -0.09 },
    gene: { smile: 0.45, lidLo: 0.28, lx: -0.65, ly: 0.3, blush: 0.7, hz: 0.1, hy: -0.14, lock: 1 },
    vide: { lid: 0.2, lx: 0.05, ly: 0.08, wet: 0.75, red: 0.4, bi: 0.6, smile: -0.18, lock: 1 },
    yeuxF: { lid: 1, wet: 0.8, red: 0.6, bi: 0.85, smile: -0.4, trem: 0.5, hx: 0.1, lock: 1 },
    pleure: { lid: 0.42, wet: 1, red: 0.9, bi: 1, bo: -0.3, smile: -0.55, trem: 1, hx: 0.12, ly: 0.35, lock: 1 },
    recueil: { lid: 0.3, ly: 0.35, smile: 0.08, bi: 0.22, hx: 0.06, lock: 1 }, apaise: { smile: 0.38, lid: 0.2, bi: 0.3, wet: 0.45, red: 0.3 },
    soulage: { smile: 0.75, lidLo: 0.32, wet: 0.95, red: 0.55, bi: 0.55, blush: 0.45, hx: -0.04 }, emue: { smile: 0.3, bi: 0.75, lid: 0.12, wet: 0.9, red: 0.45, blush: 0.35, hz: 0.06, lock: 0 },
    paix: { smile: 0.6, lidLo: 0.28, lid: 0.12, wet: 0.35, red: 0.2, blush: 0.3 },
    ferme: { lid: 1, smile: 0.5, wet: 0.35, red: 0.2, lock: 1 }, rire: { smile: 0.8, lidLo: 0.45, open: 0.2, blush: 0.6, hx: -0.06, hz: 0.06 },
  };
  const FA = track(EB), ex = (t, k, d = 0.4) => { if (isFinite(t)) FA.key(t, d, { ...EB, ...EX[k] }); };
  ex(0, "chaleur"); ex(C.bonjour - 0.3, "joie"); ex(C.bonjour + 2.4, "chaleur"); ex(C.aimee - 0.2, "joie"); ex(C.mere - 0.3, "coeur"); ex(C.mere + 1.6, "joie");
  ex(C.jeunesse - 0.4, "serieux", 0.5); ex(C.debauche - 0.2, "honte", 0.5); ex(C.avorte - 0.2, "honte", 0.3); ex(C.mariee, "serieux"); ex(C.enfants, "triste");
  ex(C.maudire - 0.1, "amer"); ex(C.rancoeur - 0.3, "amer", 0.3); ex(C.pasteur, "serieux"); ex(C.surprise - 0.1, "surprise", 0.3); ex(C.pardonner1 + 0.5, "resist");
  ex(C.nature, "serieux"); ex(C.psRef, "recueil", 0.5); ex(C.ps1 + 0.3, "serieux"); ex(C.pasDiff, "resist"); ex(C.sorciere - 0.2, "indigne", 0.25); ex(C.sorciereE - 0.5, "resist", 0.25);
  ex(C.romRef, "serieux"); ex(C.rom0, "recueil", 0.5); ex(C.tete - 0.2, "gene"); ex(C.charabia - 0.8, "indigne", 0.3); ex(C.charabiaE + 0.1, "rire", 0.3);
  ex(C.maladie - 0.3, "triste"); ex(C.hopital - 0.2, "vide", 0.5); ex(C.juge - 0.2, "triste"); ex(C.pire, "vide"); ex(C.tuais - 0.2, "yeuxF", 0.35); ex(C.voyais, "triste");
  ex(C.raison - 0.25, "pleure", 0.35); ex(C.fouet + 1.0, "triste"); ex(C.yannick2, "serieux"); ex(C.pardonCoeur, "apaise");
  ex(C.ephRef - 0.2, "recueil", 0.5); ex(C.eph1 + 0.3, "apaise"); ex(C.colRef - 0.2, "recueil", 0.5); ex(C.col1 + 0.3, "apaise"); ex(C.jesus, "serieux"); ex(C.pardonne2 - 0.1, "apaise", 0.5);
  ex(C.galRef - 0.2, "recueil", 0.5); ex(C.gal1 + 0.3, "apaise"); ex(C.honore - 0.2, "chaleur"); ex(C.onPardonne - 0.2, "soulage"); ex(C.offense, "apaise"); ex(C.compris, "soulage");
  ex(C.verite - 0.2, "emue", 0.5); ex(C.recu, "soulage"); ex(C.priere, "apaise"); ex(C.facile, "rire", 0.3); ex(C.facile + 1.6, "paix");
  ex(C.amen - 0.3, "paix", 0.35); ex(A1 + 0.3, "joie", 0.6);
  // larmes : { côté, début, durée de descente, début du séchage } — la larme coule sur « Elle avait raison, je l'ai fait »
  const TE = [{ s: 1, t0: C.raison - 0.1, d: 3.0, p0: 0, p1: 0.75, off: C.yannick2 }, { s: -1, t0: C.fait - 0.3, d: 3.6, p0: 0, p1: 0.95, off: C.pardonCoeur + 2 },
    { s: -1, t0: C.verite + 0.8, d: 6.0, p0: 0, p1: 0.85, off: C.amen - 0.5 }];
  for (let i = TE.length - 1; i >= 0; i--) if (!isFinite(TE[i].t0) || !isFinite(TE[i].off)) TE.splice(i, 1);
  const tears = (t) => TE.map((e) => ({ s: e.s, p: lerp(e.p0, e.p1, ease(clamp((t - e.t0) / e.d))), a: clamp((t - e.t0) / 0.3) * (1 - clamp((t - e.off) / 3)) * (t >= e.t0 ? 1 : 0) }));
  // gestes (bras gauche, bras droit) : [avant, écart, coude]
  const HANDS = { L: [0.95, 0.06, 0.9], R: [0.95, 0.06, 0.9] };
  const GA = track({ L: HANDS.L, R: HANDS.R, lean: 0.04, tw: 0 }), g = (t, v, d = 0.5) => { if (isFinite(t)) GA.key(t, d, v); };
  g(C.bonjour - 0.3, { L: [0.9, 0.55, 0.5], R: [0.9, 0.55, 0.5] }); g(C.bonjour + 1.4, HANDS);
  g(C.mere - 0.3, { R: [0.75, -0.55, 2.1], L: HANDS.L }); g(C.mere + 2.0, HANDS);
  g(C.debauche - 0.2, { L: HANDS.L, R: HANDS.R, lean: 0.12 }); g(C.mariee, { lean: 0.04 });
  g(C.surprise - 0.1, { L: [1.1, 0.35, 0.4], R: [1.1, 0.35, 0.4] }, 0.3); g(C.pardonner1 + 0.8, HANDS);
  g(C.sorciere - 0.1, { R: [0.8, -0.45, 2.0], L: [1.05, 0.5, 0.5] }, 0.25); g(C.sorciereE + 0.2, HANDS);
  g(C.charabia - 0.8, { L: [1.0, 0.6, 0.6], R: [1.0, 0.6, 0.6] }, 0.3); g(C.charabiaE + 0.3, HANDS);
  g(C.fait - 0.2, { R: [1.35, -0.45, 2.35], L: HANDS.L }, 0.5); g(C.fait + 2.4, HANDS, 0.6);
  g(C.onPardonne - 0.2, { L: [0.9, 0.5, 0.6], R: [0.9, 0.5, 0.6] }); g(C.onPardonne + 2.4, HANDS);
  g(C.verite - 0.2, { R: [0.75, -0.55, 2.1], L: HANDS.L }); g(C.verite + 4.0, HANDS);
  g(C.amen - 0.3, { R: [2.5, 0.25, 0.35], L: [0.75, -0.55, 2.1] }, 0.5); g(A1 + 0.6, { L: [0.9, 0.55, 0.5], R: [0.9, 0.55, 0.5] }, 0.8);
  // ── PASTEUR EMMANUEL ──
  const EXE = { chaud: { smile: 0.6, lidLo: 0.25, bi: 0.25, blush: 0.2 }, pose: { smile: 0.18, bi: 0.1, lid: 0.12 },
    serieux: { smile: -0.08, bd: 0.35, pinch: 0.25, bi: 0.1, lid: 0.18 },
    ironie: { smile: 0.45, ba: 0.9, lid: 0.2, lidLo: 0.15, pinch: 0.2, hz: 0.1, lx: 0.4 },
    ferme: { smile: -0.2, bd: 0.7, pinch: 0.55, lid: 0.12, ang: 0.35, hx: -0.04 },
    agace: { smile: -0.3, bd: 0.6, ang: 0.45, pinch: 0.7, lid: 0.3, lx: -0.5, hz: -0.06, hy: 0.15 },
    rire: { smile: 0.9, lidLo: 0.45, open: 0.3, blush: 0.4, hx: -0.08, hz: 0.06 },
    colere: { smile: -0.75, bd: 1, ang: 1, pinch: 0.6, lid: -0.1, wide: 0.1, red: 0.4, open: 0.12, hx: -0.07 },
    paix: { smile: 0.5, lid: 0.45, lidLo: 0.2, hx: 0.06 } };
  const FE = track({ ...EB, ...EXE.chaud }), exE = (t, k, d = 0.45) => { if (isFinite(t)) FE.key(t, d, { ...EB, ...EXE[k] }); };
  exE(C.eTemoin, "pose"); exE(C.eMidi, "chaud"); exE(C.eTrois, "pose"); exE(C.eP1 - 0.2, "serieux"); exE(C.eP2 - 0.2, "serieux"); exE(C.eMonte - 0.2, "ironie", 0.3);
  exE(C.eDiff - 0.2, "ferme", 0.3); exE(C.eAmenQ, "pose"); exE(C.eReponds + 0.4, "agace", 0.3); exE(C.eP3 - 0.2, "serieux"); exE(C.eMort - 0.1, "rire", 0.3);
  exE(C.eSachez, "serieux"); exE(C.eColere - 0.2, "colere", 0.25); exE(C.eColereE + 0.8, "ferme", 0.6); exE(C.eFond + 2, "serieux"); exE(C.eMonteP, "ferme");
  exE(C.eDonner, "pose"); exE(C.eBenis - 0.2, "paix", 0.6); exE(C.eTermine, "chaud"); exE(C.eAmen - 0.3, "paix", 0.5); exE(C.eAmen + 1.4, "chaud");
  const GEm = track({ L: HANDS.L, R: HANDS.R, lean: 0.04 }), gE = (t, v, d = 0.5) => { if (isFinite(t)) GEm.key(t, d, v); };
  const OPEN = { L: [0.95, 0.55, 0.55], R: [0.95, 0.55, 0.55] }, CHEST = { R: [0.75, -0.55, 2.1], L: HANDS.L }, ONE = { R: [1.6, 0.15, 0.6], L: HANDS.L };
  const SLAM = { R: [1.2, 0.05, 0.4], L: [1.2, 0.05, 0.4], lean: 0.12 };     // les deux mains plaquées sur le pupitre
  gE(E0 + 0.2, OPEN); gE(E0 + 2.4, HANDS); gE(C.eHonore, CHEST); gE(C.eHonore + 2.4, HANDS); gE(C.eMidi, OPEN); gE(C.eMidi + 2.6, HANDS);
  gE(C.eP1, ONE); gE(C.eP1 + 2.6, HANDS); gE(C.eP2, { R: [1.6, 0.15, 0.6], L: [0.9, 0.3, 0.6] }); gE(C.eP2 + 2.4, HANDS);
  gE(C.eMonte - 0.1, { R: [1.9, 0.25, 0.7], L: HANDS.L }, 0.3); gE(C.eMonte + 0.55, { R: [0.7, 0.25, 0.4], L: HANDS.L }, 0.35); gE(C.eMonteE + 0.3, HANDS);
  gE(C.eDiff - 0.1, ONE, 0.3); gE(C.eDiff + 1.6, HANDS); gE(C.ePlaire, { R: [0.9, 0.55, 0.4], L: [0.9, 0.55, 0.4] }, 0.35); gE(C.ePlaireE + 0.4, HANDS);
  gE(C.eP3, ONE); gE(C.eP3 + 1.8, HANDS); gE(C.eMort, { R: [0.75, -0.55, 2.1], L: HANDS.L, lean: -0.04 }); gE(C.eMortE + 0.4, HANDS);
  gE(C.eColere - 0.25, SLAM, 0.2); gE(C.eColereE + 0.9, HANDS, 0.6); gE(C.eDonner, OPEN); gE(C.eDonner + 2.4, HANDS);
  gE(C.eAmen - 0.3, { R: [2.3, 0.25, 0.4], L: HANDS.L }); gE(C.eAmen + 1.6, HANDS);
  // ── INTERPRÈTE : annonce souriante, bras tendu vers la table des pasteurs ──
  const GI = track({ L: HANDS.L, R: HANDS.R, lean: 0.05 }), gI = (t, v, d = 0.5) => { if (isFinite(t)) GI.key(t, d, v); };
  const POINT = { R: [1.35, 0.95, 0.15], L: HANDS.L, lean: 0.02 };
  gI(I0 - 0.2, { R: [2.4, 0.25, 0.4], L: HANDS.L }, 0.4); gI(I0 + 1.6, OPEN); gI(C.iAccueil - 0.1, { L: [0.9, 0.5, 0.5], R: [0.9, 0.5, 0.5] }); gI(C.iEm - 0.4, POINT, 0.45); gI(AP[1] + 2.0, HANDS, 0.8);
  // déplacements : Annabelle regagne sa place (siège 3, 1er rang), Emmanuel monte au pupitre
  const SEAT_A = 3; W.skip.add(SEAT_A); const sA = W.C.seatsList[SEAT_A];
  const PATH_A = [[-2.75, 0.45, -1.95], [-3.3, 0.45, -0.25], [-3.3, 0, 0.5], [sA[0], 0, 1.9], [sA[0], 0, sA[1] - 0.05]];
  const emSeat = W.Em.root.position.toArray(), emRy = W.Em.root.rotation.y;
  const PATH_E = [emSeat, [5.2, 0, 0.9], [3.5, 0, 0.5], [3.5, 0.45, -0.25], [0.6, 0.45, -1.1], [-2.75, 0.45, -1.95]];
  function along(path, p) { const seg = path.length - 1; const L = []; let tot = 0; for (let k = 0; k < seg; k++) { const l = dist0(path[k], path[k + 1]); L.push(l); tot += l; }
    let d = clamp(p) * tot, k = 0; while (k < seg - 1 && d > L[k]) { d -= L[k]; k++; } const u = clamp(d / L[k]), a = path[k], b = path[k + 1], pos = L3(a, b, u);
    if (Math.abs(b[1] - a[1]) > 0.1) pos[1] = lerp(a[1], b[1], smooth(0.25, 0.75, u)); return { pos, ry: Math.atan2(b[0] - a[0], b[2] - a[2]) }; }
  function dist0(a, b) { return Math.hypot(a[0] - b[0], a[2] - b[2]) + Math.abs(a[1] - b[1]); }
  function walkPose(T, t, ph0 = 0) { const ph = t * 7.5 + ph0; T.pose({ lean: 0.03, L: [0.35 * Math.sin(ph), 0.1, 0.2], R: [-0.35 * Math.sin(ph), 0.1, 0.2], headX: 0.05 });
    T.legs[0].L.rotation.x = 0.45 * Math.sin(ph); T.legs[1].L.rotation.x = -0.45 * Math.sin(ph); T.legs[0].K.rotation.x = 0.3 * Math.max(0, -Math.sin(ph)); T.legs[1].K.rotation.x = 0.3 * Math.max(0, Math.sin(ph)); T.hips.position.y = 0.74 + 0.02 * Math.abs(Math.cos(ph)); }
  const blinkT = []; { let b = 1.3, s = 9; while (b < DUR) { blinkT.push(b); s = (s * 16807) % 2147483647; b += 2.6 + (s / 2147483647) * 2.6; } }
  const blink = (t, ofs = 0) => { let v = 0; for (const b of blinkT) { const d = Math.abs(t + ofs - b); if (d < 0.1) v = Math.max(v, 1 - d / 0.1); if (b > t + ofs + 1) break; } return v; };
  const nz = (t, f, s) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 2.31 + s * 1.7) * 0.4;
  const lev = (t) => { const i = Math.floor(t * FPS); return i >= 0 && i < F.lev.length ? +F.lev[i] / 9 : 0; };
  const lvw = (t) => { const i = Math.floor(t * FPS); return F.voc && i >= 0 && i < F.voc.length ? (F.voc[i] === "i" ? 1 : F.voc[i] === "o" ? -0.6 : 0) : 0; };
  const speaking = (t) => t >= A0 - 0.1 && t <= A1 + 0.1, speakingE = (t) => t >= E0 - 0.1 && t <= E1 + 0.1;
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
  let curT = 0; const SPK = () => (curT >= EARR - 0.3 ? W.Em : W.A);
  const SH = {
    aerial(u, o) { const a = (o.a ?? 0.6) + u * (o.da ?? 0.35), r = o.r ?? 14, c = [0, 0, 3.2]; const pos = [c[0] + Math.sin(a) * r, o.h ?? 13, c[2] + Math.cos(a) * r]; return { pos, tgt: [0, 0.4, 2.6], fov: o.fov ?? 40, focus: dist(pos, c), ap: 0.0015, top: false }; },
    follow(u, o) { const h = H(W.A); const pos = add(h, [2.4 - 0.8 * u, 0.5 - 0.3 * u, 3.4 - 0.6 * u]); return { pos, tgt: add(h, [0, -0.25, 0]), fov: 38, focus: dist(pos, h) }; },
    aCU(u, o) { const h = add(H(SPK()), [0, -0.04, 0]), f = fwd(SPK()), s = side(SPK()), d = (o.d ?? 3.0) - (o.push ?? 0.45) * u, sx = (o.sx ?? 0) + (o.arc ?? 0.12) * (u - 0.5);
      const pos = add(h, mul(f, d * Math.cos(sx)), mul(s, d * Math.sin(sx)), [0, o.dy ?? -0.06, 0]); return { pos, tgt: add(h, [0, o.ty ?? 0, 0]), fov: o.fov ?? 24, focus: dist(pos, h), ap: 0.008, maxblur: 0.012 }; },
    aMS(u, o) { const h = H(SPK()), f = fwd(SPK()), s = side(SPK()), d = 3.4 - 0.45 * u, sx = o.sx ?? 0.45;
      const pos = add(h, mul(f, d * Math.cos(sx)), mul(s, d * Math.sin(sx)), [0, -0.25, 0]); return { pos, tgt: add(h, [0, -0.3, 0]), fov: 30, focus: dist(pos, h), ap: 0.005 }; },
    aOTS(u, o) { const h = H(SPK()), pos = [-0.9 + (o.x ?? 0) + 0.35 * u, 1.35, 3.6 - 0.5 * u]; const fg = 1.1;
      return { pos, tgt: add(h, [0, -0.08, 0]), fov: 24, focus: lerp(fg, dist(pos, h), smooth(0.08, 0.38, u)), ap: 0.01, maxblur: 0.014 }; },
    side(u, o) { const h = H(SPK()), f = fwd(SPK()), s = side(SPK()), sg = o.sg ?? 1; const pos = add(h, mul(s, 3.1 * sg), mul(f, 1.5 + 0.4 * u), [0, -0.12, 0]); return { pos, tgt: add(h, mul(s, 0.3 * sg), [0, -0.05, 0]), fov: 26, focus: dist(pos, h), ap: 0.008 }; },
    wide(u, o) { const x = (o.x ?? 0.3) + (o.dx ?? 0.9) * (u - 0.5); const pos = [x, 2.6 - 0.2 * u, 9.6 - 1.0 * u]; return { pos, tgt: [x * 0.3, 1.55, -2.4], fov: 44, focus: 10, ap: 0.002 }; },
    wideLow(u, o) { const h = H(SPK()); const pos = [1.3 + 0.8 * u, 0.85, 1.9 - 0.3 * u]; return { pos, tgt: [h[0] + 0.25, h[1] + 0.05, h[2]], fov: 42, focus: dist(pos, h), ap: 0.003 }; },
    pastors(u, o) { const h = H(W.Y), f = fwd(W.Y); const pos = add(h, mul(f, 3.3 - 0.55 * u), [-0.6 + 0.4 * u, 0.15, 0]); return { pos, tgt: add(h, [0, -0.18, 0]), fov: 30, focus: dist(pos, h), ap: 0.006 }; },
    pCU(u, o) { const T = W[o.who || "Y"], h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 2.8 - 0.35 * u), mul(s, (o.sx ?? 0.5)), [0, -0.05, 0]); return { pos, tgt: add(h, [0, -0.08, 0]), fov: 24, focus: dist(pos, h), ap: 0.009, maxblur: 0.012 }; },
    crowd(u, o) { const x0 = o.x ?? -2.2; const pos = [x0 + (o.dx ?? 1.6) * u, 1.85, 0.4]; return { pos, tgt: [x0 + (o.dx ?? 1.6) * u + 0.6, 0.95, 6.5], fov: 40, focus: 4.2, ap: 0.006 }; },
    hero(u, o) { const T = W.heroes[o.k ?? 0].T, h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 2.6 - 0.4 * u), mul(s, o.sx ?? 0.55), [0, 0.04 + (o.dy ?? 0), 0]); return { pos, tgt: add(h, [0, o.ty ?? -0.08, 0]), fov: 26, focus: dist(pos, h), ap: 0.009, maxblur: 0.012 }; },
    interp(u, o) { const T = W.I, h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 3.6 - 0.4 * u), mul(s, (o.sx ?? -0.8) + 0.5 * u), [0, -0.15, 0]); return { pos, tgt: add(h, [0, -0.3, 0]), fov: 32, focus: dist(pos, h), ap: 0.004 }; },
    two(u, o) { const pos = [-0.4 + 0.8 * u, 2.1, 8.3 - 0.6 * u]; return { pos, tgt: [0, 1.65, -1.9], fov: 52, focus: 9, ap: 0.002 }; },
    overI(u, o) { const hi = H(W.I), ha = H(SPK()); const pos = add(hi, [0.75 - 0.15 * u, 0.12, -1.1 + 0.1 * u]); return { pos, tgt: L3(hi, ha, 0.8), fov: 30, focus: dist(pos, ha), ap: 0.006, maxblur: 0.01 }; },
    overA(u, o) { const hi = H(W.I), ha = H(SPK()); const pos = add(ha, [-0.75 + 0.15 * u, 0.12, -1.1 + 0.1 * u]); return { pos, tgt: L3(ha, hi, 0.8), fov: 30, focus: dist(pos, hi), ap: 0.006, maxblur: 0.01 }; },
    pastorsZ(u, o) { const h = H(W.Y), f = fwd(W.Y); const d = lerp(5.6, 3.0, ease(u)); const pos = add(h, mul(f, d), [-0.5, 0.35, 0]); return { pos, tgt: add(h, [0, -0.3, 0]), fov: 34, focus: dist(pos, h), ap: 0.004 }; },
    banner(u, o) { const e = ease(u); const pos = [lerp(-0.4, 0.4, e), 2.6, lerp(0.2, 0.6, e)]; return { pos, tgt: [lerp(-0.25, 0.25, e), 3.2, 12.8], fov: lerp(81, 78, e), focus: 12, ap: 0.002 }; },
    stageView(u, o) { const h = H(SPK()); const pos = [h[0] - 0.9 + 0.5 * u, 2.35, h[2] - 1.5]; return { pos, tgt: [0.4 + 0.6 * u, 2.6, 12.8], fov: 50, focus: 15, ap: 0.002 }; },
    walkA(u, o) { const h = H(W.A); const pos = add(h, [2.6 - 0.6 * u, 0.6, 2.4 + 0.8 * u]); return { pos, tgt: add(h, [0, -0.35, 0]), fov: 40, focus: dist(pos, h), ap: 0.004 }; },
    walkE(u, o) { const h = H(W.Em); const pos = add(h, [-1.8 + 0.6 * u, 0.55, 3.0 - 0.4 * u]); return { pos, tgt: add(h, [0, -0.3, 0]), fov: 40, focus: dist(pos, h), ap: 0.004 }; },
    bannerEnd(u, o) { const pos = [0.3 - 0.6 * u, lerp(3.4, 3.9, u), lerp(10.5, 12.5, u)]; return { pos, tgt: [0, 2.5, -5.3], fov: 58, focus: 14, ap: 0.002 }; },
    stageBack(u, o) { const pos = [-3.6 + 1.2 * u, 2.2, -4.4]; const h = H(W.A); return { pos, tgt: [0.5 + 0.8 * u, 0.9, 6], fov: 46, focus: dist(pos, h) + 4, ap: 0.003 }; },
    iCU(u, o) { const T = W.I, h = H(T), f = fwd(T), s = side(T), d = (o.d ?? 2.6) - (o.push ?? 0.35) * u; const pos = add(h, mul(f, d), mul(s, (o.sx ?? -0.35)), [0, -0.05, 0]);
      return { pos, tgt: add(h, [0, -0.1, 0]), fov: o.fov ?? 26, focus: dist(pos, h), ap: 0.008, maxblur: 0.012 }; },
    iArm(u, o) { const T = W.I, h = H(T), f = fwd(T), s = side(T), d = 3.1 - 0.3 * u; const d2 = 3.5 - 0.3 * u, pos = add(h, mul(f, d2), mul(s, -0.45 + 0.15 * u), [0, 0.05, 0]);
      return { pos, tgt: add(h, mul(s, 0.2), [0, -0.2, 0]), fov: 38, focus: dist(pos, h), ap: 0.006, maxblur: 0.01 }; },
    iPoint(u, o) { const pos = [-2.9 + 0.5 * u, 2.25 - 0.1 * u, -3.3 + 0.3 * u]; return { pos, tgt: [4.7, 1.35, -0.1], fov: 50, focus: 6.5, ap: 0.002 }; },
    seatA(u, o) { const T = W.A, h = H(T), f = fwd(T), s = side(T); const pos = add(h, mul(f, 2.5 - 0.35 * u), mul(s, o.sx ?? 0.5), [0, 0.06, 0]); return { pos, tgt: add(h, [0, -0.1, 0]), fov: 28, focus: dist(pos, h), ap: 0.008, maxblur: 0.012 }; },
    rise(u, o) { const h = H(W.Em); const pos = [lerp(3.4, 3.0, u), 1.6, lerp(4.4, 3.8, u)]; return { pos, tgt: add(h, [0, -0.35, 0]), fov: 46, focus: dist(pos, h), ap: 0.003 }; },
  };
  // planning : plans imposés aux moments clés + remplissage par cycles (changement toutes les 3 à 5 s)
  const forced = [
    [C.bonjour - 0.15, "aCU", { push: 0.5 }], [C.mere - 0.2, "aCU", { d: 3.84, ty: -0.12 }],
    // honte : la caméra reste sur son visage (aucune image d'illustration)
    [C.jeunesse - 0.2, "aCU", { sx: 0.35, d: 3.0 }], [C.debauche - 0.1, "aCU", { d: 2.4, push: 0.2, fov: 22, sx: -0.12 }], [C.avorte - 0.3, "aCU", { d: 2.0, push: 0.15, fov: 21, sx: 0.1 }],
    [C.mariee + 0.1, "wideLow", {}], [C.maudire, "aCU", { sx: 0.28, d: 2.56 }], [C.rancoeur, "aOTS", { x: 0.4 }], [C.pasteur + 0.5, "pCU", { who: "Y" }],
    [C.surprise - 0.2, "aCU", { push: 0.5, d: 3.2 }], [C.psRef, "wideLow", {}], [C.ps0, "aCU", { d: 3.68 }], [C.ps0 + 3.2, "crowd", { x: 0.6, dx: -1.4 }],
    [C.pasDiff, "aCU", { sx: 0.3 }], [C.sorciere - 0.2, "aCU", { push: 0.5, d: 2.7 }], [C.sorciereE + 0.15, "crowd", { x: -1.0, dx: 0.9 }],
    [C.romRef, "pastors", {}], [C.rom0, "aCU", { d: 3.68, sx: -0.25 }], [C.rom0 + 4.4, "wide", {}], [C.rom0 + 8.4, "hero", { k: 2 }],
    [C.tete - 0.2, "aCU", { d: 3.04 }], [C.charabia - 0.9, "aCU", { push: 0.45, d: 2.72 }], [C.charabiaE + 0.3, "crowd", { x: -2.4, dx: 1.2 }],
    [C.maladie - 0.3, "aCU", { d: 3.52, push: 0.25 }], [C.hopital, "aCU", { d: 2.4, push: 0.15, fov: 22 }], [C.juge, "side", { sg: 1 }],
    [C.tuais - 0.3, "aCU", { d: 2.24, push: 0.2 }], [C.raison - 0.4, "aCU", { d: 1.6, push: 0.12, fov: 20, ty: 0.03, dy: -0.01, arc: 0.04 }],
    [C.fait + 2.0, "pCU", { who: "Y", sx: 0.2 }], [C.fouet + 1.0, "hero", { k: 0 }], [C.yannick2, "aCU", { sx: -0.3 }], [C.pardonCoeur + 1.5, "pastors", {}],
    [C.ephRef, "aCU", { d: 3.52 }], [C.eph0 + 3.0, "wideLow", {}], [C.colRef, "aOTS", {}], [C.col0 + 1.5, "hero", { k: 2 }], [C.jesus, "aCU", {}],
    [C.pardonne2 - 0.2, "pCU", { who: "Em" }], [C.galRef, "wide", { x: -0.6 }], [C.gal0, "aCU", { d: 3.04, push: 0.5 }], [C.honore - 0.2, "pCU", { who: "Y", sx: -0.25 }],
    [C.onPardonne - 0.3, "aCU", { d: 2.32, push: 0.25, fov: 22 }], [C.eau + 0.3, "crowd", { x: 0.2, dx: -1.2 }], [C.offense, "aCU", { sx: 0.3, d: 2.88 }], [C.compris, "aOTS", {}],
    [C.verite - 0.3, "aCU", { d: 2.2, push: 0.25, fov: 22 }], [C.decouvert + 0.8, "hero", { k: 0 }], [C.recu, "aCU", { sx: -0.2, d: 2.7 }], [C.priere, "aCU", { d: 2.9, sx: 0.25 }],
    [C.facile + 0.6, "pastors", {}], [C.amen - 0.5, "aCU", { d: 2.5, push: 0.2 }],
  ];
  forced.sort((a, b) => a[0] - b[0]);
  for (let i = forced.length - 1; i >= 0; i--) if (!isFinite(forced[i][0]) || forced[i][0] > A1 - 0.3) forced.splice(i, 1);
  const MODE = (t) => (t > A1 ? "emm" : t < C.jeunesse ? "joie" : t < C.psRef ? "conf" : VERSE(t) > 0.5 ? "vers" : t < C.onPardonne ? "mid" : "fin");
  const CYC = {
    joie: [["two", {}], ["aCU", { sx: -0.3 }], ["wide", {}], ["aMS", { sx: 0.5 }], ["interp", {}], ["crowd", {}], ["pastors", {}], ["overI", {}], ["aOTS", {}], ["aCU", { sx: 0.3 }], ["hero", { k: 1 }], ["wideLow", {}]],
    conf: [["aCU", { sx: 0.25 }], ["overI", {}], ["aOTS", {}], ["pCU", { who: "Ma" }], ["aMS", { sx: -0.5 }], ["interp", { sx: 0.5 }], ["crowd", { x: 0.2, dx: -1 }], ["aCU", { sx: -0.3, d: 2.72 }], ["side", { sg: 1 }], ["pastors", {}]],
    vers: [["interp", {}], ["aCU", { d: 3.52 }], ["wideLow", {}], ["crowd", { x: -2, dx: 1.4 }], ["aMS", { sx: 0.4 }], ["aOTS", {}], ["hero", { k: 2 }]],
    mid: [["two", {}], ["interp", { sx: 0.6 }], ["aCU", { sx: -0.25 }], ["wide", {}], ["pCU", { who: "Y" }], ["aOTS", { x: 0.3 }], ["crowd", {}], ["aMS", { sx: 0.5 }], ["hero", { k: 1 }], ["aCU", { sx: 0.3 }], ["pastors", {}]],
    emm: [["aCU", {}], ["crowd", { x: -1.6, dx: 1.2 }], ["aMS", { sx: 0.45 }], ["pastors", {}], ["interp", {}], ["aCU", { sx: -0.3 }], ["stageView", {}], ["hero", { k: 1 }], ["pCU", { who: "Y" }], ["aOTS", {}], ["two", {}], ["aCU", { sx: 0.3 }], ["hero", { k: 0 }], ["pCU", { who: "Ma" }]],
    fin: [["overA", {}], ["aCU", { sx: 0.25 }], ["crowd", { x: -1.8, dx: 1.4 }], ["aMS", { sx: -0.45 }], ["pCU", { who: "Y" }], ["aOTS", {}], ["hero", { k: 0 }]],
  };
  // ouverture : vue aérienne (les fidèles entrent), plan depuis l'estrade sur la bannière du fond (2,8 s), Annabelle monte à son pupitre
  const shots = [{ t0: 0, type: "aerial", o: { a: 0.9, da: -0.4, r: 13, h: 12.5 } }, { t0: 2.4, type: "banner", o: {} }, { t0: 5.2, type: "follow", o: {} }];
  function plan(start, end, list, first) {
    let cur = start, fi = 0, cyc = 0, sd = 3; shots.push({ t0: cur, type: first[0], o: first[1] }); cur += 3.6;
    const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    while (fi < list.length && list[fi][0] < cur) fi++;
    while (cur < end) {
      const nf = fi < list.length ? list[fi][0] : 1e9;
      if (nf - cur < 6.2) {
        if (nf - cur >= 2.6) { const m = MODE(cur), c = CYC[m][cyc++ % CYC[m].length]; shots.push({ t0: cur, type: c[0], o: c[1], cyc: 1 }); }
        shots.push({ t0: nf, type: list[fi][1], o: list[fi][2] }); cur = nf + (list[fi][2].d && list[fi][2].d < 1.2 ? 4.8 : 3.6); fi++;
        while (fi < list.length && list[fi][0] < cur - 1.0) fi++;
        if (fi < list.length && list[fi][0] < cur) cur = list[fi][0];
      } else { const m = MODE(cur), c = CYC[m][cyc++ % CYC[m].length]; shots.push({ t0: cur, type: c[0], o: c[1], cyc: 1 }); cur += 3.3 + rnd() * 1.4; }
    }
  }
  plan(A0 - 0.35, A1 - 0.4, forced, ["aCU", { push: 0.4, d: 3.52 }]);
  for (let i = shots.length - 1; i >= 0; i--) if (shots[i].t0 > A1 - 0.4) shots.splice(i, 1);
  // la honte reste sur son visage : aucun plan de remplissage entre « Dans ma jeunesse » et « Puis je me suis mariée »
  for (let i = shots.length - 1; i >= 0; i--) if (shots[i].cyc && shots[i].t0 > C.jeunesse - 0.3 && shots[i].t0 < C.mariee) shots.splice(i, 1);
  // applaudissements n° 1 (salle debout) → annonce de l'interprète → applaudissements n° 2 (Emmanuel monte, Annabelle descend)
  shots.push({ t0: A1 - 0.4, type: "aCU", o: { d: 2.6, push: 0.2 } }, { t0: AP[0] + 0.2, type: "wide", o: { x: 0, dx: 0.5 } }, { t0: AP[0] + 2.3, type: "crowd", o: { x: -1.8, dx: 1.6 } },
    { t0: AP[0] + 4.3, type: "stageBack", o: {} }, { t0: I0 - 0.25, type: "iCU", o: { push: 0.3 } }, { t0: C.iAccueil - 0.15, type: "overA", o: {} },
    { t0: C.iEm - 0.6, type: "iArm", o: {} }, { t0: AP[1] + 0.5, type: "pastorsZ", o: {} }, { t0: AP[1] + 1.9, type: "rise", o: {} }, { t0: WA[0] + 1.4, type: "walkA", o: {} },
    { t0: WA[1] - 0.2, type: "walkE", o: {} }, { t0: EARR - 0.9, type: "aMS", o: { sx: 0.5 } });
  const forcedE = [[C.eHonore - 0.1, "seatA", {}], [C.eTemoin, "aCU", { sx: 0.3 }], [C.eMidi, "crowd", { x: -0.8, dx: 0.8 }], [C.eTrois, "aMS", { sx: -0.45 }], [C.eApotre, "pastors", {}],
    [C.eP1 - 0.2, "aCU", { d: 2.9, push: 0.35 }], [C.eP2 - 0.2, "aCU", { sx: -0.25, d: 3.0 }], [C.eMonte - 0.3, "side", { sg: 1 }], [C.eDiff - 0.2, "aCU", { d: 2.4, push: 0.4 }],
    [C.eCond + 0.6, "crowd", { x: 0.4, dx: -1.0 }], [C.eReponds, "aCU", { sx: 0.3, d: 2.6, push: 0.3 }], [C.ePlaireE + 0.1, "crowd", { x: -2.0, dx: 1.3 }],
    [C.eP3 - 0.2, "aCU", { d: 2.8 }], [C.eMort + 0.2, "pastors", {}], [C.eMortE + 0.1, "crowd", { x: 0.6, dx: -1.2 }],
    // colère : gros plan, la caméra se rapproche franchement
    [C.eColere - 0.4, "aCU", { d: 4.0, push: 1.6, fov: 27, arc: 0.03, ty: -0.22, dy: 0.45 }], [C.eColereE + 0.9, "crowd", { x: -1.0, dx: 0.8 }], [C.eFond + 1.5, "aCU", { sx: -0.3, d: 2.8 }],
    [C.eMonteP, "aMS", { sx: 0.45 }], [C.eDonner, "stageView", {}], [C.eBenis - 0.2, "aCU", { d: 2.7, push: 0.3 }], [C.eTermine, "pastorsZ", {}], [C.eAmen - 0.4, "aCU", { d: 2.6, push: 0.25 }]]
    .filter((x) => isFinite(x[0])).sort((a, b) => a[0] - b[0]);
  const nEm = shots.length; plan(E0 - 0.35, E1 - 0.3, forcedE, ["aCU", { d: 3.2, push: 0.4 }]);
  for (let i = shots.length - 1; i >= nEm; i--) if (shots[i].t0 > E1 + 0.2) shots.splice(i, 1);
  // applaudissements n° 3, puis la salle vue d'en haut avant le logo
  shots.push({ t0: AP[2] + 0.1, type: "wide", o: { x: 0.4, dx: -0.6 } }, { t0: AP[2] + 2.2, type: "crowd", o: { x: 0.2, dx: -1.4 } }, { t0: AP[2] + 4.1, type: "bannerEnd", o: {} });
  shots.sort((a, b) => a.t0 - b.t0);
  // l'interprète revient régulièrement à l'image (au moins toutes les ~18 s)
  { const IT = [["interp", {}], ["overI", {}], ["two", {}], ["overA", {}], ["interp", { sx: 0.6 }]], ISH = new Set(["interp", "overI", "two", "overA"]); let last = A0, k = 0;
    for (const sh of shots) { if (!((sh.t0 >= A0 && sh.t0 <= A1) || (sh.t0 >= E0 && sh.t0 <= E1))) continue; if (ISH.has(sh.type)) { last = sh.t0; continue; }
      if (sh.cyc && sh.t0 - last > 16) { const c = IT[k++ % IT.length]; sh.type = c[0]; sh.o = c[1]; last = sh.t0; } } }
  shots.forEach((s, i) => (s.t1 = i + 1 < shots.length ? shots[i + 1].t0 : DUR));
  for (let i = shots.length - 1; i > 0; i--) if (shots[i].t1 - shots[i].t0 < 0.8) { shots[i - 1].t1 = shots[i].t1; shots.splice(i, 1); }
  window.__shots = shots;
  const WH = 0.2;
  function camAt(t) {
    curT = t; let i = 0; while (i + 1 < shots.length && shots[i + 1].t0 <= t) i++;
    const s = shots[i], u = clamp((t - s.t0) / (s.t1 - s.t0)), c = SH[s.type](u, s.o);
    c.yaw = 0; c.pitch = 0; let bx = 0, by = 0; const dir = i % 2 ? 1 : -1, vert = i % 5 === 3;
    if (i + 1 < shots.length && t > s.t1 - WH && t < LOGO0) { const p = Math.pow((t - (s.t1 - WH)) / WH, 2); if (vert) { c.pitch = 0.5 * p * dir; by = 0.045 * p * dir; } else { c.yaw = 0.55 * p * dir; bx = 0.05 * p * dir; } }
    if (i > 0 && t < s.t0 + WH) { const pd = (i - 1) % 2 ? 1 : -1, pv = (i - 1) % 5 === 3, p = Math.pow(1 - (t - s.t0) / WH, 2); if (pv) { c.pitch = -0.5 * p * pd; by = -0.045 * p * pd; } else { c.yaw = -0.55 * p * pd; bx = -0.05 * p * pd; } }
    c.blur = [bx, by]; c.shot = s; return c;
  }

  // ── PERSONNAGES SECONDAIRES : pasteurs, interprète, fidèles ──
  // rires de la salle (calés sur rires-salle.mp3 après « plaire à quelqu'un » et « notre mort ici à la MIDIGRAD ») + petits sourires du témoignage
  const laughT = (t) => Math.max(pulse(t, LA[0] + 0.1, LA[0] + 2.4, 0.25, 0.7), pulse(t, LA[1] + 0.1, LA[1] + 2.9, 0.25, 0.8), 0.8 * pulse(t, C.eMort + 0.4, C.eMortE, 0.3, 0.3),
    0.7 * pulse(t, C.sorciere + 0.6, C.sorciereE + 1.0, 0.4, 1.2), 0.7 * pulse(t, C.charabia + 0.2, C.charabiaE + 0.9, 0.4, 1.0), 0.5 * pulse(t, C.facile + 0.3, C.facile + 2.2, 0.3, 0.8));
  const moved = (t) => Math.max(pulse(t, C.tuais, C.fouet + 3, 1.0, 2), pulse(t, C.onPardonne, C.offense + 3, 1, 2), 0.8 * pulse(t, C.verite, C.recu + 3, 1, 2), pulse(t, C.amen - 1, A1 + 3, 0.6, 2) * 0.6);
  const amenT = (t) => Math.max(pulse(t, C.eAmen, C.eAmen + 2.0, 0.3, 0.8), pulse(t, C.ps1 + 0.1, C.ps1 + 1.6, 0.3, 0.6), pulse(t, C.eph1 + 0.1, C.eph1 + 1.4, 0.3, 0.6), pulse(t, C.col1 + 0.1, C.col1 + 1.4, 0.3, 0.6),
    pulse(t, C.gal1 + 0.1, C.gal1 + 1.6, 0.3, 0.6), pulse(t, C.pardonne2 + 0.4, C.pardonne2 + 1.6, 0.3, 0.6), pulse(t, C.amen, A1 + 0.6, 0.3, 0.6), pulse(t, I0, I0 + 1.8, 0.3, 0.6), pulse(t, C.eAmenQ, C.eAmenQ + 1.2, 0.2, 0.5));
  // applaudissements : n° 1 et n° 3 salle debout, n° 2 assise
  const OVA = (t) => Math.max(pulse(t, AP[0], AP[0] + 5.3, 0.5, 1.2), pulse(t, AP[2], AP[2] + 5.3, 0.5, 1.2));
  const CLAP = (t) => Math.max(pulse(t, AP[0] - 0.1, AP[0] + 6, 0.4, 1.0), pulse(t, AP[1] - 0.1, AP[1] + 6, 0.4, 1.0), pulse(t, AP[2] - 0.1, AP[2] + 6, 0.4, 1.0));
  const STANDS = (t) => Math.max(pulse(t, AP[0] + 0.3, AP[0] + 6.0, 0.9, 1.4), pulse(t, AP[2] + 0.3, AP[2] + 6.4, 0.9, 1.4));
  const STAND0 = AP[0] + 0.1, STAND1 = AP[0] + 6.0;
  function crowdState(t) {
    return { appear: t, bow: Math.max(pulse(t, C.debauche, C.mariee, 0.6, 1.5), 0.5 * pulse(t, C.hopital, C.fardeau + 1, 1, 1.5), 0.7 * pulse(t, C.tuais, C.fouet + 2, 1, 2)),
      laugh: laughT(t), amen: amenT(t), ovation: OVA(t), clap: CLAP(t), stand: STANDS(t),
      wipe: pulse(t, C.raison + 1, C.fouet + 3, 0.8, 1.2), nod: 0.5 + 0.5 * Math.max(VERSE(t), pulse(t, E0, E1, 1, 1) * 0.6), closed: 0.7 * VERSE(t) + 0.3 * pulse(t, C.amen, A1, 0.3, 0.5) };
  }
  const seatedPose = (t, ph, o = {}) => ({ seated: 1, lean: -0.05 + (o.lean || 0), breath: 0.012 * Math.sin(t * 1.6 + ph), headX: 0.04 * Math.sin(t * 0.6 + ph) + (o.hx || 0), headY: 0.12 * Math.sin(t * 0.21 + ph) + (o.hy || 0), headZ: o.hz || 0,
    L: o.L || [0.55, 0.05, 0.9], R: o.R || [0.55, 0.05, 0.9], lift: o.lift || 0 });
  function pastorFace(t, ph, k) {
    const lg = laughT(t), mv = moved(t) * (k === 0 ? 1 : 0.5), am = amenT(t);
    const amenMouth = am > 0.2 ? 0.25 * Math.max(0, Math.sin((t + ph) * 6)) : 0;
    return { lid: Math.max(0.1 + 0.3 * mv, blink(t, ph)), lidLo: 0.25 * lg, bi: 0.15 + 0.6 * mv, smile: 0.25 + 0.6 * lg + 0.1 * mv, open: 0.18 * lg + amenMouth, wet: 0.85 * mv, red: 0.45 * mv,
      ly: 0.05, lx: (k === 0 ? -0.25 : -0.35) + 0.1 * Math.sin(t * 0.3 + ph), blush: 0.15 + 0.2 * lg, t, tears: k === 0 && mv > 0.5 ? [{ s: -1, p: clamp((t - C.onPardonne - 1) / 6) * 0.7, a: pulse(t, C.onPardonne + 1, C.offense + 3, 0.4, 2) }] : [] };
  }
  const nodAt = (t, ph, rate = 1) => 0.07 * Math.max(0, Math.sin(t * 1.9 * rate + ph)) * (0.5 + 0.5 * Math.sin(t * 0.37 + ph));

  // ── DOM : cartes de versets, titres, sous-titres, flash-back ──
  const VCARDS = [
    { ref: "PSAUME 14:3", a: C.ps0, b: C.ps1, hl: ["Tous sont égarés", "aucun qui fasse le bien", "pas même un seul"] },
    { ref: "ROMAINS 2:1", a: C.rom0, b: C.rom1, hl: ["inexcusable", "tu te condamnes toi-même", "tu fais les mêmes choses"] },
    { ref: "ÉPHÉSIENS 4:32", a: C.eph0, b: C.eph1, hl: ["Soyez bons", "vous pardonnant réciproquement", "comme Dieu vous a pardonné en Christ"] },
    { ref: "COLOSSIENS 3:13", a: C.col0, b: C.col1, hl: ["De même que Christ vous a pardonné", "pardonnez-vous aussi"] },
    { ref: "GALATES 2:20", a: C.gal0, b: C.gal1, hl: ["crucifié avec Christ", "c'est Christ qui vit en moi"] },
  ];
  const cardsEl = $("#cards");
  VCARDS.forEach((c) => {
    const i0 = WD.findIndex((w) => w[1] >= c.a - 0.01), i1 = WD.findIndex((w) => w[2] >= c.b - 0.01);
    const ids = []; for (let i = i0; i <= i1; i++) ids.push(i);
    const hl = new Set(); for (const h of c.hl) { const r = find(h, c.a - 0.05); if (r && WD[r[0]][1] <= c.b) for (let i = r[0]; i <= r[1]; i++) hl.add(i); }
    const el = document.createElement("div"); el.className = "vcard";
    el.innerHTML = `<div class="ref">${c.ref}</div><div class="tx">${ids.map((i) => `<span class="${hl.has(i) ? "k" : ""}">${WD[i][0]}</span>`).join(" ")}</div>`;
    cardsEl.appendChild(el); c.el = el; c.spans = [...el.querySelectorAll(".tx span")]; c.ids = ids;
  });
  const TITLES = [
    { a: C.eP1, b: C.eP2 - 0.3, html: "1. RECONNAÎTRE DIEU<br>DERRIÈRE CELUI<br>QUI T'OFFENSE" }, { a: C.eP2, b: C.eP3 - 0.3, html: "2. JE NE SUIS PAS<br>DIFFÉRENT DE MON FRÈRE" },
    { a: C.eP3, b: C.eMort + 0.2, html: "3. SUIVRE LE CŒUR<br>DE L'ÉGLISE" },
  ].filter((x) => isFinite(x.a) && isFinite(x.b));
  const titlesEl = $("#titles"); TITLES.forEach((x) => { const el = document.createElement("div"); el.className = "ttl"; el.innerHTML = x.html; titlesEl.appendChild(el); x.el = el; });
  // sous-titres : un mot à la fois (ponctuation seule rattachée au mot précédent)
  const SW = []; WD.forEach((w) => { const m = w[0].replace(/[«»"]/g, "").replace(/[,;:.…]+$/g, "").trim(); if (!norm(m)) { if (SW.length && /[?!]/.test(w[0])) SW[SW.length - 1].m += " " + w[0].trim(); return; } SW.push({ m, a: w[1], b: w[2], who: w[3] }); });
  const subW = $("#subw"), subWho = $("#subwho"), subs = $("#subs");
  let lastSub = -2;
  const flash = $("#flash"), FL0 = C.hopital + 0.35, FL1 = FL0 + 2.9;
  const white = $("#white"), fin = $("#motfin"), LOGO0 = F.logo, SIG = F.sig, sig = $("#sig"), blk = $("#black");
  const tag = $("#tag");

  function update(t) {
    // Annabelle
    const A = W.A; let wk = walkPos(t), aSeat = false;
    if (t >= WA[0]) { const p = clamp((t - WA[0]) / (WA[1] - WA[0])); if (p < 1) { const q = along(PATH_A, p); wk = { pos: q.pos, ry: q.ry, walking: true }; } else { wk = { pos: [sA[0], 0, sA[1] + 0.02], ry: Math.PI + sA[2], walking: false }; aSeat = true; } }
    A.root.position.set(...wk.pos); A.root.rotation.y = wk.ry;
    const fa = FA.at(t), ga = GA.at(t), spk = speaking(t), lv = spk ? lev(t) : 0;
    const look = (1 - fa.lock) * (0.32 * Math.sin(t * 0.19 + 1) + 0.1 * step(t, 1)), lookY = (1 - fa.lock) * 0.06 * step(t, 7);
    const lid = Math.max(fa.lid, fa.lid < 0.9 ? blink(t) : 0);
    A.faceSet({ ...fa, lx: clamp(fa.lx + look, -1, 1), ly: clamp(fa.ly + lookY, -1, 1), lid, open: clamp(fa.open + Math.pow(lv, 0.8) * 0.95 * (1 - 0.35 * fa.pinch), 0, 1), vw: lvw(t), tears: tears(t), t });
    if (aSeat) { A.pose(seatedPose(t, 3.1, { hx: 0.05 + nodAt(t, 3.1) * 0.8, hy: 0.15 * Math.sin(t * 0.2), L: [0.55, 0.05, 0.9], R: [0.55, 0.05, 0.9] })); }
    else if (wk.walking) { const ph = t * 7.5; A.pose({ lean: 0.03, L: [0.35 * Math.sin(ph), 0.1, 0.2], R: [-0.35 * Math.sin(ph), 0.1, 0.2], headX: 0.05 });
      A.legs[0].L.rotation.x = 0.45 * Math.sin(ph); A.legs[1].L.rotation.x = -0.45 * Math.sin(ph); A.legs[0].K.rotation.x = 0.3 * Math.max(0, -Math.sin(ph)); A.legs[1].K.rotation.x = 0.3 * Math.max(0, Math.sin(ph)); A.hips.position.y = 0.74 + 0.02 * Math.abs(Math.cos(ph)); }
    else A.pose({ lean: ga.lean, breath: 0.012 * Math.sin(t * 1.7), headX: fa.hx + lv * 0.05 * Math.sin(t * 7) + 0.02 * nz(t, 0.7, 1), headY: fa.hy + look * 0.3 + 0.03 * nz(t, 0.5, 2), headZ: fa.hz + 0.02 * nz(t, 0.4, 3),
      L: ga.L, R: ga.R, twist: look * 0.08 });
    // interprète : écoute et hoche la tête ; parle (lip-sync) pour annoncer le pasteur Emmanuel, souriant, bras tendu vers la table des pasteurs
    const I = W.I, g1 = 0.5 + 0.5 * Math.sin(t * 0.8), icl = Math.sin(t * 12.5 + 1), clI = CLAP(t), spI = t >= I0 - 0.1 && t <= I1 + 0.1;
    if (t >= I0 - 0.6 && t <= AP[1] + 2.8) {
      const gi = GI.at(t), lvI = spI ? lev(t) : 0, pt = smooth(C.iEm - 0.5, C.iEm, t) * (1 - smooth(AP[1] + 1.6, AP[1] + 2.6, t));
      I.pose({ lean: gi.lean, breath: 0.01 * Math.sin(t * 1.5), headX: -0.02 + lvI * 0.05 * Math.sin(t * 7), headY: lerp(0.05 + 0.08 * Math.sin(t * 0.6), 0.55, pt), headZ: 0.03 * Math.sin(t * 0.5), L: gi.L, R: gi.R, twist: 0.12 * pt });
      I.faceSet({ lid: Math.max(0.08, blink(t, 0.7)), lidLo: 0.3, smile: 0.85, bi: 0.3, bo: 0.2, blush: 0.3, lx: lerp(0.1, 0.7, pt), ly: 0.02, open: clamp(Math.pow(lvI, 0.8) * 0.9, 0, 1), vw: lvw(t), t });
    } else {
      if (clI > 0.05) I.pose({ lean: 0.02, headX: -0.05, headY: -0.45, L: [lerp(0.95, 1.2, clI), -0.22 - 0.16 * icl * clI, 0.95], R: [lerp(0.95, 1.2, clI), -0.22 + 0.16 * icl * clI, 0.95], breath: 0.01 * Math.sin(t * 1.5) });
      else I.pose({ lean: 0.05, headX: 0.05 + nodAt(t, 2), headY: -0.35 + 0.05 * Math.sin(t * 0.3), L: [0.95, 0.06, 0.9], R: [0.95 + 0.2 * g1 * (Math.sin(t * 0.23) > 0.6 ? 1 : 0), 0.15, 0.9], breath: 0.01 * Math.sin(t * 1.5) });
      I.faceSet({ lid: Math.max(0.15, blink(t, 0.7)), smile: 0.12 + 0.45 * laughT(t) + 0.5 * clI, lx: -0.6, ly: 0.05, bi: 0.1 + 0.3 * moved(t), wet: 0.3 * moved(t), t });
    }
    // pasteurs : installation (ouverture), écoute, « amen », émotion de Yannick
    const sit = smooth(1.2, 3.2, t), stand = STANDS(t), clp = CLAP(t);
    [[W.Y, 0], [W.Em, 1], [W.Ma, 2]].forEach(([T, k]) => {
      if (k === 1 && t >= WE[0]) return;
      const ph = k * 1.7, am = amenT(t), seat = sit * (1 - stand);
      const p = seatedPose(t, ph, { hx: nodAt(t, ph, 1 + k * 0.2) + 0.15 * moved(t) * (k === 0 ? 1 : 0.3) - 0.08 * laughT(t), hy: -0.2 + (k === 2 ? 0.25 : 0), lean: 0.05 + 0.1 * moved(t) * (k === 0 ? 1 : 0),
        R: am > 0.2 && k !== 1 ? [lerp(0.55, 2.5, am), 0.2, 0.3] : k === 0 && moved(t) > 0.5 && t > C.honore ? [0.8, -0.5, 2.1] : clp > 0.2 ? [1.2, -0.25 + 0.2 * Math.sin(t * 13 + k), 0.9] : [0.75, 0.05, 1.0],
        L: clp > 0.2 ? [1.2, -0.25 + 0.2 * Math.sin(t * 13 + k + 0.5), 0.9] : [0.75, 0.05, 1.0] });
      p.seated = seat; T.pose(p); T.faceSet(pastorFace(t, ph, k));
    });
    // pasteur Emmanuel : se lève, monte sur l'estrade, parle au pupitre d'Annabelle
    if (t >= WE[0]) {
      const E = W.Em, pw = clamp((t - WE[0] - 0.7) / (WE[1] - WE[0] - 0.7));
      if (t < WE[0] + 0.7) { E.root.position.set(...emSeat); E.root.rotation.y = emRy; E.pose({ seated: 1 - smooth(WE[0], WE[0] + 0.7, t), lean: 0.05, L: [0.6, 0.05, 0.9], R: [0.6, 0.05, 0.9] }); E.faceSet({ lid: 0.12, smile: 0.35, bi: 0.15, lx: -0.3, t }); }
      else if (pw < 1) { const q = along(PATH_E, pw); E.root.position.set(...q.pos); E.root.rotation.y = q.ry; walkPose(E, t, 1.3); E.faceSet({ lid: Math.max(0.12, blink(t, 1.1)), smile: 0.3, bi: 0.15, t }); }
      else {
        E.root.position.set(-2.75, 0.45, -1.95); E.root.rotation.y = 0.25;
        const fe = FE.at(t), ge = GEm.at(t), lvE = speakingE(t) ? lev(t) : 0, lk = 0.3 * Math.sin(t * 0.17 + 2) + 0.1 * step(t, 4);
        const lkA = 1 - fe.ang; E.pose({ lean: ge.lean, breath: 0.012 * Math.sin(t * 1.5), headX: fe.hx + lvE * 0.05 * Math.sin(t * 6.5) + 0.02 * nz(t, 0.6, 5), headY: fe.hy + lk * 0.3 * lkA, headZ: fe.hz + 0.02 * nz(t, 0.4, 6), L: ge.L, R: ge.R, twist: lk * 0.08 });
        E.faceSet({ ...fe, lx: clamp(fe.lx + lk * lkA, -1, 1), lid: Math.max(fe.lid, fe.lid < 0.9 ? blink(t, 0.45) : 0), open: clamp(fe.open + Math.pow(lvE, 0.8) * 0.9, 0, 1), vw: lvw(t), t });
      }
    }
    // fidèles détaillés (gros plans)
    const cs = crowdState(t);
    W.heroes.forEach((h, k) => {
      const T = h.T, ph = 2 + k * 2.3, sc = clamp((t - 0.4 - k * 0.5) / 0.4), st = cs.stand;
      T.root.scale.setScalar(sc < 1 ? 0.0001 + sc * (1 + 0.3 * Math.sin(sc * Math.PI)) : 1);
      const wipe = k === 0 ? pulse(t, C.raison + 0.8, C.fouet + 3, 0.6, 1) : 0, amen = k === 2 ? cs.amen : k === 1 ? 0 : cs.amen * 0.5, clap = Math.max(cs.clap, k === 1 ? 0.6 * cs.laugh : 0);
      const cl = Math.sin(t * 13 + k);
      const p = seatedPose(t, ph, { hx: 0.4 * cs.bow + nodAt(t, ph) * cs.nod - 0.12 * cs.laugh * (0.5 + 0.5 * Math.sin(t * 7 + k)) + 0.1 * wipe, lean: 0.25 * cs.bow,
        R: cs.ovation > 0.1 ? [lerp(0.55, 2.6, cs.ovation), -0.1 + 0.14 * cl, 0.3] : wipe > 0.1 ? [lerp(0.55, 1.45, wipe), -0.45 * wipe, lerp(0.9, 2.35, wipe)] : amen > 0.1 ? [lerp(0.55, 2.6, amen), 0.25, 0.2] : clap > 0.1 ? [1.1, -0.2 + 0.18 * cl, 1.0] : null,
        L: cs.ovation > 0.1 ? [lerp(0.55, 2.6, cs.ovation), -0.1 - 0.14 * cl, 0.3] : clap > 0.1 && wipe < 0.1 ? [1.1, -0.2 - 0.18 * cl, 1.0] : null, lift: 0 });
      p.seated = 1 - st; T.pose(p);
      T.faceSet({ lid: Math.max(cs.closed > 0.5 + k * 0.1 || cs.bow > 0.6 ? 0.92 : 0.1 + 0.3 * wipe, blink(t, ph)), lidLo: 0.35 * cs.laugh, bi: 0.2 + 0.7 * wipe + 0.3 * cs.bow, smile: 0.3 + 0.6 * cs.laugh - 0.4 * wipe + 0.3 * cs.clap,
        open: 0.25 * cs.laugh * (0.5 + 0.5 * Math.sin(t * 9 + k)), wet: 0.9 * wipe + 0.3 * moved(t), red: 0.6 * wipe, lx: 0.3 - 0.2 * k, ly: -0.25, blush: 0.2 + 0.4 * cs.laugh, t,
        tears: k === 0 ? [{ s: 1, p: clamp((t - C.raison - 0.2) / 3) * 0.8, a: pulse(t, C.raison, C.fouet + 3, 0.3, 2) }] : [] });
    });
    // caméra + rendu
    const c = camAt(t);
    W.C.top.visible = c.top !== false;
    const cold = COLD(t) * (1 - WARM(t)), warm = WARM(t);
    const sp = 0.6 * Math.max(pulse(t, C.amen, AP[0] + 5.5, 0.4, 1.5), 0.8 * pulse(t, C.eAmen, AP[2] + 5, 0.4, 0.8));
    W.render(t, { cam: c, crowd: cs, cold, warm, blurX: c.blur[0], blurY: c.blur[1], sparks: sp, sparkAt: t > E0 ? [-2.75, 2.2, -1.2] : [-2.75, 2.2, -1.6],
      logo: t >= LOGO0 ? { rot: lerp(-2.4, 0, ease(clamp((t - LOGO0) / 1.6))) + 0.15 * Math.sin((t - LOGO0) * 1.2), scale: lerp(0.4, 1, ease(clamp((t - LOGO0) / 1.2))), y: lerp(0.55, 1.15, ease(clamp((t - SIG) / 0.9))), sparks: clamp((t - LOGO0 - 0.6) / 0.6) * (1 - 0.4 * clamp((t - SIG) / 0.6)) } : null });
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
    if (show) { const w = SW[k]; if (k !== lastSub) { subW.textContent = w.m; subWho.textContent = { A: "ANNABELLE", E: "PASTEUR EMMANUEL", I: "L'INTERPRÈTE", N1: "NARRATEUR" }[w.who]; subWho.className = { A: "a", E: "e", I: "i", N1: "n" }[w.who]; lastSub = k; }
      const p = clamp((t - w.a) / 0.13); subW.style.transform = `scale(${(0.85 + 0.15 * (1 + 2.6 * Math.pow(p - 1, 3) + 1.6 * Math.pow(p - 1, 2))).toFixed(3)})`; subs.style.opacity = "1"; }
    else subs.style.opacity = "0";
    // flash-back hôpital (≤ 3 s)
    const fo = pulse(t, FL0, FL1, 0.25, 0.3); flash.style.opacity = fo.toFixed(3); if (fo > 0) flash.firstElementChild.style.transform = `scale(${(1.06 + 0.05 * clamp((t - FL0) / 3)).toFixed(4)})`;
    // fin : fondu blanc, logo 3D, phrase finale
    white.style.opacity = pulse(t, LOGO0 - 0.1, LOGO0 + 0.05, 0.5, 0.5).toFixed(3);
    const fo2 = clamp((t - LOGO0 - 1.4) / 0.6) * (1 - clamp((t - SIG) / 0.5)); fin.style.opacity = fo2.toFixed(3); fin.style.transform = `translateX(-50%) translateY(${((1 - fo2) * 30).toFixed(1)}px)`;
    const so = clamp((t - SIG - 0.4) / 0.7); sig.style.opacity = so.toFixed(3); sig.style.transform = `translateX(-50%) scale(${(0.92 + 0.08 * ease(so)).toFixed(3)})`;
    blk.style.opacity = clamp((t - (DUR - 0.7)) / 0.6).toFixed(3);
    tag.style.opacity = (pulse(t, 0.3, A0 - 1.2, 0.5, 0.6)).toFixed(3);
  }
  const proxy = { v: 0 };
  tl.to(proxy, { v: DUR, duration: DUR, ease: "none", modifiers: { v: (x) => { update(parseFloat(x)); return x; } } }, 0);
  update(0);
  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__film = { tl, update };
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
};
