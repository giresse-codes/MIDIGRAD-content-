// « Le pardon divin » — épisode 1 : mise en scène (18 scènes calées sur les mots du texte).
// Tout est une fonction pure du temps t (timeline GSAP en pause, pilotée par HyperFrames).
window.startFilm = function (W) {
  const F = window.FILM, DUR = F.dur, FPS = F.fps, OFF = F.off, WD = F.words;   // WD : [mot, t0, t1] en temps du film
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const smooth = (a, b, x) => { const p = clamp((x - a) / (b - a)); return p * p * (3 - 2 * p); };
  const lerp = (a, b, p) => a + (b - a) * p, L3 = (a, b, p) => a.map((x, i) => lerp(x, b[i], p));
  const pulse = (t, a, b, fi = 0.4, fo = 0.5) => (!isFinite(a) || !isFinite(b) ? 0 : Math.min(smooth(a - fi, a, t), 1 - smooth(b, b + fo, t)));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");
  const NW = WD.map((w) => norm(w[0]));
  function find(ph, after = 0) { const q = ph.split(/\s+/).map(norm).filter(Boolean);
    for (let i = 0; i < NW.length; i++) { if (WD[i][1] < after) continue; let ok = true; for (let j = 0; j < q.length; j++) if (NW[i + j] !== q[j]) { ok = false; break; } if (ok) return [i, i + q.length - 1]; }
    console.error("phrase introuvable : " + ph); return null; }
  const P = (ph, a) => { const r = find(ph, a); return r ? WD[r[0]][1] : NaN; }, PE = (ph, a) => { const r = find(ph, a); return r ? WD[r[1]][2] : NaN; };
  const END = WD[WD.length - 1][2];
  // ── repères ──
  const C = {
    remontons: P("Remontons au tout commencement"), gen1: P("Genèse, chapitre 1, verset 1"), gen1q: P("Au commencement, Dieu créa"), gen1e: PE("les cieux et la terre."),
    queDieu: P("il n'y avait que Dieu"), lumiere: P("la lumière, le ciel"), ciel: P("le ciel, la mer"), mer: P("la mer, les arbres"), arbres: P("les arbres, les animaux"), animaux: P("les animaux."),
    special: P("Puis Dieu a fait quelque chose"), gen27: P("Genèse, chapitre 2, verset 7"), forma: P("L'Éternel Dieu forma"), souffla: P("il souffla dans ses narines"), vivant: P("devint un être vivant"), gen27e: PE("devint un être vivant."), adam: P("Cet homme, c'est Adam"),
    pasLaisse: P("Dieu ne l'a pas laissé"), planta: P("planta un jardin"), imaginez: P("Imaginez ce jardin"), animauxPaix: P("des animaux qui vivent en paix"), deuxArbres: P("deux arbres"), arbreVie: P("l'arbre de vie et"), connaissance: P("l'arbre de la connaissance du bien et du mal. Mais"),
    manque: P("Mais Dieu voit qu'il manque"), pasBon: P("Il n'est pas bon"), eve: P("Alors Dieu crée la femme"), bibleDit: P("Et la Bible dit"), gen131: P("Dieu vit tout ce qu'il avait fait"), gen131e: PE("cela était très bon."), parfait: P("Tout était parfait"), marchaient: P("Ils marchaient avec lui"), voulue: PE("Dieu l'avait voulue."),
    regle: P("Dans ce jardin, Dieu avait donné"), tuPourras: P("Tu pourras manger"), mourras: PE("tu en mangeras, tu mourras."), permis: P("Tout le reste était permis"), confiance: PE("lui faire confiance."),
    unJour: P("Mais un jour, quelqu'un"), serpent: P("Le serpent était le plus rusé"), ilDit: P("Il dit à la femme"), reellement: P("Dieu a-t-il réellement dit"), gen31e: PE("tous les arbres du jardin ?"), ruse: P("Vous voyez la ruse"), doute: P("Il commence par un doute"),
    mourrez: P("Vous ne mourrez point"), gen345e: PE("connaissant le bien et le mal."), regarde: P("Ève regarde l'arbre"), vit: P("La femme vit que l'arbre"), prit: P("elle prit de son fruit"), mangea1: P("et en mangea ;"), donna: P("elle en donna aussi"), ilMangea: P("et il en mangea."), ilMangeaE: PE("et il en mangea."),
    beaucoup: P("Beaucoup d'entre vous"), maisNon: P("Mais non !"), regardeMin: P("Regarde minutieusement"), revenons: P("Revenons en arrière"), apres: P("Après que le serpent eut fini"), vit2: P("la femme vit que l'arbre", 190), pourtant: P("Pourtant, ce n'était pas"), pensee: P("Le péché ici, c'est depuis la pensée"), desobei: P("Elle avait déjà désobéi"),
    unFruit: P("Un fruit, une seule désobéissance"), bascule: P("tout bascule."), yeux: P("Les yeux de l'un"), ceintures: PE("ils s'en firent des ceintures."), figuier: P("feuilles de figuier"), honte: P("ils ont honte"), peur: P("ils ont peur"), entendent: P("quand ils entendent Dieu"), cachent: P("ils se cachent."),
    chercher: P("Mais Dieu vient les chercher"), appela: P("Mais l'Éternel Dieu appela"), ouEsTu: P("Où es-tu ?"), ouEsTuE: PE("Où es-tu ?"), savait: P("Dieu savait très bien"), pere: P("c'est l'appel d'un père"),
    laRegardez: P("Et là, regardez bien"), adamRep: P("Adam répond"), laFemme: P("La femme que tu as mise"), eveDit: P("Et Ève dit"), serpentSeduite: P("Le serpent m'a séduite"), accuse: P("Adam accuse Ève"), personne: P("Personne ne dit"), habitude: P("l'homme a pris l'habitude"), coeur: P("ce cœur-là qui nous empêche"), coeurE: PE("nous empêche de pardonner."),
    consequences: P("Le péché a des conséquences"), travail: P("le travail pénible"), poussiere: P("Tu es poussière"), poussiereE: PE("dans la poussière."), chasses: P("Adam et Ève sont chassés"), cherubins: P("des chérubins gardent"),
    arrete: P("Et ce péché ne s'est pas arrêté"), rom512: P("Romains, chapitre 5, verset 12"), rom512q: P("C'est pourquoi, comme par un seul homme"), rom512e: PE("parce que tous ont péché."),
    habits: P("La Bible dit aussi que Dieu a fait"), gen321: P("Genèse, chapitre 3, verset 21"), gen321q: P("L'Éternel Dieu fit à Adam"), revetit: P("il les en revêtit"), gen321e: PE("il les en revêtit."), constate: P("On constate ici"), cousu: P("Dieu a cousu des habits"), pasSuffi: P("mais cela n'a pas suffi"), solution: P("Dieu lui-même a trouvé la solution"),
    feuilles: P("Leurs feuilles ne suffisaient pas"), animal: P("un animal a dû mourir"), sang: P("le premier sang versé"), retenez: P("Retenez bien ça"), histoire: PE("commence l'histoire du pardon."),
    salaire: P("Car le salaire du péché"), rom623e: PE("Jésus-Christ notre Seigneur."), prochain: P("Dans le prochain épisode"), abel: P("Abel, Noé"), noe: P("Noé, Abraham"), abraham: P("Abraham, et cette nuit"), egypte: P("cette nuit en Égypte"), merci: P("Merci d'avoir regardé"), fin: END,
  };
  window.__C = C;
  const LOGO0 = F.logo, SIG = F.sig;
  // lip-sync de Wilfried
  const lev = (t) => { const i = Math.floor(t * FPS); return i >= 0 && i < F.lev.length ? +F.lev[i] / 9 : 0; };
  const mouthOf = (t, base = {}) => { const l = lev(t); if (l < 0.08) return { ...base, mouth: 0, open: 0 }; const syl = Math.sin(t * 23) * 0.5 + 0.5; return { ...base, mouth: l > 0.65 ? 2 : syl > 0.75 ? 3 : 1, open: Math.min(1, l * 1.2) }; };
  const blinkT = []; { let b = 1.1, s = 7; while (b < DUR) { blinkT.push(b); s = (s * 16807) % 2147483647; b += 2.4 + (s / 2147483647) * 2.6; } }
  const blink = (t, ofs = 0) => { let v = 0; for (const b of blinkT) { const d = Math.abs(t + ofs - b); if (d < 0.09) v = Math.max(v, 1 - d / 0.09); if (b > t + ofs + 1) break; } return v; };
  const nz = (t, f, s) => Math.sin(t * f + s) * 0.6 + Math.sin(t * f * 2.31 + s * 1.7) * 0.4;

  // ── SCÈNES : [début, décor] (le décor change aux transitions ; whoosh dans le mixage) ──
  const SCN = [
    [0, "douala"], [C.remontons, "douala"], [C.gen1 - 0.6, "creation"], [C.special - 0.3, "eden"], [C.pasLaisse - 0.3, "eden"], [C.manque - 0.3, "eden"], [C.regle - 0.3, "eden"],
    [C.unJour - 0.3, "eden"], [C.regarde - 0.3, "eden"], [C.beaucoup - 0.3, "eden"], [C.unFruit - 0.3, "eden"], [C.chercher - 0.3, "eden"], [C.laRegardez - 0.3, "eden"],
    [C.consequences - 0.3, "thorns"], [C.arrete - 0.3, "thorns"], [C.habits - 0.3, "eden"], [C.salaire - 0.3, "eden"], [C.prochain - 0.3, "douala"],
  ];
  const sceneAt = (t) => { let k = 0; for (let i = 0; i < SCN.length; i++) if (SCN[i][0] <= t) k = i; return k; };
  window.__SCN = SCN;

  // ── PLANS DE CAMÉRA : [t0, {pos, tgt, fov}, {pos2, tgt2, fov2}] (mouvement lent du premier au second) ──
  const S = (t0, a, b) => [t0, a, b || a];
  const CA = (p, g, f = 42) => ({ pos: p, tgt: g, fov: f });
  const AE = [2.1, 0, -8.8], EV = [3.0, 0, -9.0];         // places d'Adam et d'Ève près de l'arbre de la connaissance
  const SHOTS = [
    // 1 — rue de Douala
    S(0, CA([0, 1.9, 9.5], [0, 1.6, 0], 46), CA([0, 1.8, 7.0], [0, 1.6, 0], 44)), S(4.2, CA([1.4, 1.6, 3.6], [0, 1.45, 0], 36), CA([1.0, 1.6, 3.2], [0, 1.45, 0], 34)),
    S(9.5, CA([-5, 3.2, 8], [0, 2, -2], 48), CA([-2, 2.6, 7.5], [0, 1.8, -1], 46)), S(14.5, CA([0.4, 1.65, 2.6], [0, 1.55, 0], 30), CA([0.3, 1.62, 2.3], [0, 1.55, 0], 28)), S(18.5, CA([0, 1.9, 6.8], [0, 1.5, 0], 44)),
    // 2 — dissolution dorée
    S(C.remontons, CA([0, 1.9, 6.2], [0, 1.6, 0], 42), CA([0, 2.4, 9], [0, 2, -2], 50)),
    // 3 — création
    S(C.gen1 - 0.6, CA([0, 6, 18], [0, 8, -20], 55), CA([0, 5, 16], [0, 6, -20], 52)), S(C.lumiere, CA([0, 4, 16], [0, 4, -10], 52), CA([0, 3, 13], [0, 2, -2], 48)),
    S(C.mer, CA([-6, 2, 10], [0, 0.5, -2], 46), CA([-4, 2.5, 9], [0, 1, -2], 44)), S(C.arbres, CA([5, 3.5, 9], [0, 1.5, -2], 46), CA([3, 3, 8], [0, 1.5, -2], 44)), S(C.animaux, CA([0, 1.6, 6], [0, 1, 0], 44), CA([-1, 1.5, 5], [0, 1, 0], 42)),
    // 4 — Adam formé de la poussière
    S(C.special - 0.3, CA([0, 2.2, 7], [0, 1.4, -2], 44), CA([0, 2, 5.5], [0, 1.4, -2], 40)), S(C.souffla, CA([1.0, 1.8, 1.2], [0, 1.55, -2], 32), CA([0.8, 1.75, 0.8], [0, 1.6, -2], 30)),
    S(C.adam, CA([-1.5, 1.6, 1.5], [0, 1.3, -2], 38), CA([-1.2, 1.7, 1.0], [0, 1.4, -2], 36)),
    // 5 — Éden : plan aérien puis au sol
    S(C.pasLaisse - 0.3, CA([0, 30, 24], [0, 0, -12], 50), CA([0, 18, 14], [0, 0, -12], 48)), S(C.imaginez, CA([-14, 3, -12], [-8, 2, -26], 46), CA([-10, 2.5, -14], [-9, 3, -26], 44)),
    S(C.animauxPaix, CA([-6, 1.6, -2.5], [-7, 0.8, -6], 40), CA([-5.5, 1.5, -3], [-7, 0.8, -6], 38)), S(C.deuxArbres, CA([0, 5.5, 12], [0, 2.8, -12], 52), CA([0, 4.8, 9.5], [0, 2.8, -12], 50)),
    S(C.arbreVie, CA([-1.2, 2.4, -1.5], [-3.2, 3.4, -12], 44), CA([-1.6, 2.3, -2.5], [-3.2, 3.4, -12], 42)), S(C.connaissance, CA([1.4, 2.4, -1.5], [3.4, 3.4, -12], 44), CA([1.8, 2.3, -2.5], [3.4, 3.4, -12], 42)),
    // 6 — Ève, marche avec la lumière
    S(C.manque - 0.3, CA([2.5, 1.7, -5.5], [AE[0], 1.4, AE[2]], 38)), S(C.eve, CA([2.6, 1.8, -4.8], [2.6, 1.4, -9], 42), CA([2.6, 1.7, -5.4], [2.6, 1.4, -9], 40)),
    S(C.gen131, CA([0, 5, 2], [0, 2, -10], 50), CA([0, 4, 0], [0, 2, -10], 48)), S(C.parfait, CA([4.5, 1.6, -4], [1.5, 1.2, -8], 40), CA([3.5, 1.6, -4], [0.5, 1.2, -8], 40)), S(C.marchaient, CA([-2, 2, -1], [0, 1.2, -6], 44), CA([-3, 2, -2], [-2, 1.2, -7], 44)),
    // 7 — la règle
    S(C.regle - 0.3, CA([1, 2.6, -2.5], [3.4, 2.5, -12], 46), CA([1.5, 2.4, -4], [3.4, 2.5, -12], 44)), S(C.tuPourras, CA([4.8, 1.7, -6], [3, 1.6, -10], 40)), S(C.mourras - 3, CA([2.5, 3.5, -7.5], [3.4, 4, -12], 44), CA([2.8, 3.2, -8], [3.4, 4, -12], 42)), S(C.permis, CA([3.6, 1.6, -5.5], [2.5, 1.5, -9], 34)),
    // 8 — le serpent
    S(C.unJour - 0.3, CA([7.0, 2.4, -6.0], [3.4, 2.6, -12], 44), CA([6.5, 1.9, -6.5], [3.4, 1.6, -12], 42)), S(C.ilDit, CA([2.2, 1.7, -6.5], [3.1, 1.5, -10], 34), CA([2.4, 1.6, -7], [3.1, 1.5, -10], 32)),
    S(C.ruse, CA([5.4, 1.2, -7.2], [3.3, 0.6, -10.6], 34), CA([5.1, 1.2, -7.6], [3.3, 0.6, -10.6], 32)), S(C.mourrez, CA([1.8, 1.6, -7.2], [3.0, 1.4, -9.5], 32), CA([2.1, 1.6, -7.6], [3.0, 1.4, -9.5], 30)),
    // 9 — le fruit
    S(C.regarde - 0.3, CA([2.6, 1.6, -7.6], [3.3, 2.6, -11], 34)), S(C.vit, CA([3.1, 2.3, -9.8], [3.45, 2.6, -11.1], 26), CA([3.2, 2.3, -10.1], [3.45, 2.6, -11.1], 22)),
    S(C.prit, CA([2.4, 1.7, -7.3], [3.0, 1.55, -9.2], 30)), S(C.donna, CA([1.6, 1.6, -6.4], [2.5, 1.4, -9], 36)), S(C.ilMangea - 0.2, CA([1.5, 1.7, -7.4], [AE[0], 1.6, AE[2]], 26)),
    // 10 — retour en arrière, le péché commence dans la pensée
    S(C.beaucoup - 0.3, CA([0.5, 2.2, -4], [2.5, 1.4, -9], 42)), S(C.apres, CA([2.0, 1.75, -7.3], [3.0, 1.62, -9.0], 26), CA([2.2, 1.72, -7.7], [3.0, 1.62, -9.0], 22)),
    S(C.pourtant, CA([3.0, 2.4, -9.6], [3.45, 2.6, -11.1], 24), CA([3.1, 2.4, -10.0], [3.45, 2.6, -11.1], 20)), S(C.pensee, CA([1.8, 1.8, -6.6], [2.9, 1.6, -9.0], 32), CA([1.9, 1.8, -7.0], [2.9, 1.6, -9.0], 30)),
    // 11 — tout bascule, feuilles de figuier, cachette
    S(C.unFruit - 0.3, CA([0, 3.2, -2], [2.5, 1.5, -9], 48), CA([0.5, 2.8, -3], [2.5, 1.5, -9], 46)), S(C.yeux, CA([2.5, 1.7, -6], [2.5, 1.4, -9], 40)), S(C.honte, CA([1.6, 1.7, -6.8], [AE[0], 1.5, AE[2]], 30)),
    S(C.peur, CA([3.4, 1.7, -7.0], [EV[0], 1.5, EV[2]], 30)), S(C.entendent, CA([-1, 2.5, -1], [0, 1.5, -6], 44)), S(C.cachent, CA([-1.2, 1.3, -1.6], [-1.2, 0.8, -6], 40), CA([-1.2, 1.2, -2.2], [-1.2, 0.8, -6], 38)),
    // 12 — Où es-tu ?
    S(C.chercher - 0.3, CA([4, 3, -2], [-1, 1.5, -6], 50), CA([3, 3, -1], [-1, 1.5, -6], 48)), S(C.ouEsTu - 0.4, CA([-1.2, 1.4, -2.4], [-1.2, 1.3, -6], 34)), S(C.savait, CA([1.5, 1.8, -2.2], [-1, 1.3, -5.2], 38), CA([1.2, 1.7, -2.6], [-1, 1.3, -5.2], 36)),
    // 13 — l'accusation
    S(C.laRegardez - 0.3, CA([0.3, 1.9, -1.4], [0.4, 1.2, -6.5], 44)), S(C.laFemme, CA([1.6, 1.7, -2.2], [0.0, 1.3, -6.3], 38)), S(C.serpentSeduite, CA([3.4, 1.5, -2.6], [1.8, 0.8, -7.2], 40)),
    S(C.accuse, CA([0.6, 2.6, -1.2], [1.2, 1.0, -7], 46)), S(C.habitude, CA([0.2, 1.8, -1.8], [0.2, 1.3, -6.3], 40), CA([0.2, 1.7, -2.3], [0.2, 1.3, -6.3], 38)),
    // 14 — conséquences, expulsion
    S(C.consequences - 0.3, CA([3, 2.2, 2], [0, 1.2, -4], 44), CA([2, 2, 1], [0, 1.2, -4], 42)), S(C.travail, CA([1.2, 1.6, -1.5], [0, 1.3, -4], 34)), S(C.poussiere, CA([0, 1.4, -1.8], [0, 1.2, -4], 30)),
    S(C.chasses, CA([2.6, 2.6, -1.5], [0, 2.4, -14], 46), CA([2.2, 2.5, -2.5], [0, 2.4, -14], 44)), S(C.cherubins, CA([3, 3, -11], [0, 3.3, -16], 44), CA([2, 3.2, -12], [0, 3.3, -16], 42)),
    // 15 — les générations
    S(C.arrete - 0.3, CA([0, 9, 44], [0, 0, 27], 46), CA([0, 7, 41], [0, 0, 26], 44)), S(C.rom512q + 3, CA([5, 2, 32], [0, 1, 27], 42), CA([3, 2, 32], [0, 1, 27], 40)), S(C.rom512q + 9, CA([0, 14, 40], [0, 0, 26], 50)),
    // 16 — les habits de peau
    S(C.habits - 0.3, CA([0, 2.2, -3.2], [0, 1.5, -8], 44)), S(C.gen321q, CA([0.2, 1.8, -4.5], [0, 1.6, -8], 38), CA([0.2, 1.8, -5.2], [0, 1.6, -8], 36)), S(C.constate, CA([3, 2, -4], [0, 1.4, -8], 42)),
    S(C.pasSuffi - 1, CA([0, 1.2, -5], [0, 1.0, -8], 40), CA([0, 1.3, -5.4], [0, 1.0, -8], 38)), S(C.solution, CA([0, 2.4, -2.6], [0, 1.8, -8], 46), CA([0, 2.2, -3.6], [0, 1.8, -8], 44)),
    S(C.animal, CA([2.6, 1.8, -5], [1.6, 0.9, -8.4], 38)), S(C.retenez, CA([0, 2, -3.5], [0, 1.6, -8], 42), CA([0, 2.1, -2.5], [0, 1.6, -8], 44)),
    // 17 — Romains 6:23
    S(C.salaire - 0.3, CA([0, 4, 6], [0, 4, -12], 50), CA([0, 4.5, 2], [0, 4.5, -12], 48)),
    // 18 — Wilfried et le teaser de l'épisode 2
    S(C.prochain - 0.3, CA([0, 1.75, 4.2], [0, 1.5, 0], 38), CA([0, 1.7, 3.6], [0, 1.5, 0], 36)), S(C.abel, CA([-27, 2.2, 5], [-30, 1.2, 0], 40)), S(C.noe, CA([0, 4, 11], [0, 2.5, 0], 44)),
    S(C.abraham, CA([30, 5, 6], [30, 6, -6], 44)), S(C.egypte, CA([60, 1.8, 6], [60, 1.6, 0], 40)), S(C.merci - 0.2, CA([0, 1.9, 6.5], [0, 1.5, 0], 44), CA([0, 1.8, 5.5], [0, 1.5, 0], 42)),
  ].filter((s) => isFinite(s[0])).sort((a, b) => a[0] - b[0]);
  SHOTS.forEach((s, i) => (s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR));
  const teaserSet = (t) => t >= C.abel - 0.3 && t < C.merci - 0.2;
  window.__shots = SHOTS.map((s) => s[0]);
  function camAt(t) {
    let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++;
    const s = SHOTS[i], u = ease(clamp((t - s[0]) / Math.max(0.5, s.t1 - s[0]))), a = s[1], b = s[2];
    const c = { pos: L3(a.pos, b.pos, u), tgt: L3(a.tgt, b.tgt, u), fov: lerp(a.fov, b.fov, u), yaw: 0 }; c.blur = 0;
    { const d = c.pos.map((x, j) => x - c.tgt[j]), L = Math.hypot(...d), need = 1.45 / Math.tan((c.fov * Math.PI) / 360); if (L < need) c.pos = c.tgt.map((x, j) => x + d[j] * (need / L)); }
    const WH = 0.18; if (i + 1 < SHOTS.length && t > s.t1 - WH) { const p = Math.pow((t - (s.t1 - WH)) / WH, 2); c.yaw = 0.4 * p * (i % 2 ? 1 : -1); c.blur = 0.04 * p * (i % 2 ? 1 : -1); }
    if (i > 0 && t < s[0] + WH) { const p = Math.pow(1 - (t - s[0]) / WH, 2); c.yaw = -0.4 * p * ((i - 1) % 2 ? 1 : -1); c.blur = -0.04 * p * ((i - 1) % 2 ? 1 : -1); }
    return c;
  }

  // ── TEXTES À L'ÉCRAN ──
  const CARDS = [
    { ref: "GENÈSE 1:1", a: C.gen1, b: C.gen1e, q: "Au commencement, Dieu créa les cieux et la terre.", k: ["Dieu créa"] },
    { ref: "GENÈSE 2:7", a: C.gen27, b: C.gen27e, q: "L'Éternel Dieu forma l'homme de la poussière de la terre, il souffla dans ses narines un souffle de vie et l'homme devint un être vivant.", k: ["poussière", "souffle de vie"] },
    { ref: "GENÈSE 1:31", a: C.bibleDit, b: C.gen131e, q: "Dieu vit tout ce qu'il avait fait et voici, cela était très bon.", k: ["très bon"] },
    { ref: "GENÈSE 2:16-17", a: C.tuPourras, b: C.mourras, q: "Tu pourras manger de tous les arbres du jardin ; mais tu ne mangeras pas de l'arbre de la connaissance du bien et du mal, car le jour où tu en mangeras, tu mourras.", k: ["tu ne mangeras pas", "tu mourras"] },
    { ref: "GENÈSE 3:1", a: C.serpent, b: C.gen31e, q: "Le serpent était le plus rusé de tous les animaux des champs, que l'Éternel Dieu avait faits. Il dit à la femme : Dieu a-t-il réellement dit : Vous ne mangerez pas de tous les arbres du jardin ?", k: ["le plus rusé", "réellement dit"] },
    { ref: "GENÈSE 3:4-5", a: C.mourrez, b: C.gen345e, q: "Vous ne mourrez point ; mais Dieu sait que, le jour où vous en mangerez, vos yeux s'ouvriront, et que vous serez comme des dieux, connaissant le bien et le mal.", k: ["Vous ne mourrez point", "comme des dieux"] },
    { ref: "GENÈSE 3:7", a: C.yeux, b: C.ceintures, q: "Les yeux de l'un et de l'autre s'ouvrirent, ils connurent qu'ils étaient nus, et ayant cousu des feuilles de figuier, ils s'en firent des ceintures.", k: ["feuilles de figuier"] },
    { ref: "GENÈSE 3:19", a: C.poussiere, b: C.poussiereE, q: "Tu es poussière, et tu retourneras dans la poussière.", k: ["poussière"] },
    { ref: "ROMAINS 5:12", a: C.rom512, b: C.rom512e, q: "C'est pourquoi, comme par un seul homme le péché est entré dans le monde, et par le péché la mort, et qu'ainsi la mort s'est étendue sur tous les hommes, parce que tous ont péché.", k: ["le péché est entré dans le monde", "tous ont péché"] },
    { ref: "GENÈSE 3:21", a: C.gen321, b: C.gen321e, q: "L'Éternel Dieu fit à Adam et à sa femme des habits de peau, et il les en revêtit.", k: ["habits de peau"] },
    { ref: "ROMAINS 6:23", a: C.salaire, b: C.rom623e, q: "Car le salaire du péché, c'est la mort ; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ notre Seigneur.", k: ["le don gratuit de Dieu", "la vie éternelle"], big: true },
  ].filter((c) => isFinite(c.a) && isFinite(c.b));
  const cardsEl = $("#cards");
  CARDS.forEach((c) => { let html = c.q; for (const k of c.k) html = html.replace(k, `<span class="k">${k}</span>`);
    const el = document.createElement("div"); el.className = "card" + (c.big ? " big" : ""); el.innerHTML = `<div class="ref">${c.ref}</div><div class="tx">${html}</div>`; cardsEl.appendChild(el); c.el = el; });
  const TITLES = [
    { a: C.remontons + 0.4, b: C.gen1 - 0.8, html: "AU COMMENCEMENT", tag: true },
    { a: C.pensee, b: C.pensee + 5.5, html: "LE PÉCHÉ COMMENCE<br>DANS LA PENSÉE" },
    { a: C.ouEsTu - 0.1, b: C.ouEsTu + 3.2, html: "OÙ ES-TU ?" },
    { a: C.laFemme, b: C.personne, html: "C'EST SA FAUTE !" },
    { a: C.solution, b: C.solution + 5.5, html: "DIEU LUI-MÊME A TROUVÉ<br>LA SOLUTION" },
  ].filter((x) => isFinite(x.a) && isFinite(x.b));
  const titlesEl = $("#titles"); TITLES.forEach((x) => { const el = document.createElement("div"); el.className = x.tag ? "tag" : "ttl"; el.innerHTML = x.html; titlesEl.appendChild(el); x.el = el; });
  // sous-titres : pages de 2 lignes max
  const KEY = new Set(["peche", "pardon", "dieu", "adam", "eve", "serpent", "jardin", "fruit", "mort", "vie", "poussiere", "honte", "peur", "confiance", "doute", "pensee", "desobei", "desobeissance", "sang", "agneau", "solution", "salaire", "eternelle", "commencement", "lumiere", "eden", "ruse", "figuier", "cherubins", "accuser", "pardonner", "parfait", "regle", "abel", "noe", "abraham", "egypte", "wilfried"]);
  const pages = []; { let cur = [], len = 0;
    WD.forEach((w, i) => { const m = w[0].replace(/[«»"]/g, ""); const clean = m.replace(/[,;:.…!?]+$/, ""); if (!norm(clean)) { if (cur.length && /[?!]/.test(m)) cur[cur.length - 1].m += " " + m.trim(); return; }
      const wd = { m: /[?!]$/.test(m) ? clean + " " + m.slice(-1) : clean, a: w[1], b: w[2], k: KEY.has(norm(clean)) };
      if (cur.length && (len + wd.m.length > 30 || (/[.?!;:]$/.test(WD[i - 1][0]) && len > 12))) { pages.push(cur); cur = []; len = 0; }
      cur.push(wd); len += wd.m.length + 1; });
    if (cur.length) pages.push(cur); }
  pages.forEach((pg) => { pg.a = pg[0].a; pg.b = pg[pg.length - 1].b; });
  const subs = $("#subs"); let lastPage = -1, spans = [];
  const bubble = $("#bubble"), qmark = $("#qmark"), rewind = $("#rewind"), medal = $("#medal"), pill = $("#pill"), serie = $("#serie"), endw = $("#endw"), sig = $("#sig"), suite = $("#suite"), blk = $("#black");

  // ── chemins du serpent (le long du tronc de l'arbre de la connaissance, puis vers Ève) ──
  const KT = [3.4, -12];
  const snakeIn = (u, t) => { if (u < 0.6) { const q = u / 0.6, a = q * 9 + 0.5; return [KT[0] + Math.cos(a) * 0.42, 3.4 - q * 3.2, KT[1] + Math.sin(a) * 0.42]; }
    const q = (u - 0.6) / 0.4; return [lerp(KT[0] + 0.3, 3.2, q) + 0.08 * Math.sin(q * 12 + t * 3), 0.15 + 0.05 * Math.sin(q * 8), lerp(KT[1] + 0.4, -10.3, q)]; };
  const snakeOut = (u, t) => { const q = u; return [lerp(3.2, 7.5, q) + 0.1 * Math.sin(q * 14 + t * 4), 0.13, lerp(-10.3, -13.5, q)]; };
  const snakeAcc = (u, t) => [lerp(2.6, 6.5, u) + 0.1 * Math.sin(u * 16 + t * 5), 0.13, lerp(-7.6, -9.8, u)];

  function update(t) {
    const k = sceneAt(t), set = teaserSet(t) ? "teaser" : SCN[k][1];
    const st = { set, k: {}, fx: {}, med: 0 };
    const c = camAt(t); st.cam = c; st.blurX = c.blur;
    // Wilfried (en entier : scènes 1 et 18 ; médaillon ailleurs)
    const full = (k <= 1 && t < C.remontons + 1.2) || (k === 17 && !teaserSet(t));
    const wFace = (base) => ({ ...mouthOf(t, base), lid: Math.max(base.lid || 0, blink(t)), t });
    const laugh = pulse(t, C.pensee - 2.5, C.pensee + 1.5, 0.3, 0.6), serious = pulse(t, C.coeur - 0.4, C.coeurE + 0.8, 0.4, 0.6), surprise = pulse(t, C.maisNon, C.maisNon + 1.2, 0.2, 0.4);
    const wBase = laugh > 0.3 ? { smile: 0.95, lidLo: 0.4, ruse: 0.5, lx: 0.4 } : serious > 0.3 ? { smile: -0.15, bd: 0.4, bi: 0.15 } : surprise > 0.3 ? { bi: 0.8, bo: 0.7, smile: 0.2 } : { smile: 0.55, lidLo: 0.12 };
    const wave = pulse(t, 0.2, 3.0, 0.3, 0.5) + pulse(t, C.merci + 4.5, C.fin + 0.5, 0.3, 0.5);
    if (full) st.W = { pos: [0, 0.2, 0], ry: 0, pose: { R: wave > 0.05 ? [lerp(0.2, 2.7, wave), 0.35, 0.4 + 0.25 * Math.sin(t * 9) * wave] : [0.35, 0.15, 0.5 + 0.2 * Math.sin(t * 1.3)], L: [0.6, 0.12, 1.3], hx: 0.03 * nz(t, 0.8, 1) + lev(t) * 0.04 * Math.sin(t * 8), hy: 0.08 * nz(t, 0.4, 2), breath: 0.012 * Math.sin(t * 1.7) }, face: wFace(wBase) };
    else { st.med = smooth(C.remontons + 0.8, C.remontons + 1.6, t) * (1 - smooth(C.prochain - 0.6, C.prochain, t)) + (teaserSet(t) ? 1 : 0); st.med = clamp(st.med);
      st.medPose = { hx: 0.04 * nz(t, 0.8, 1) + lev(t) * 0.05 * Math.sin(t * 8) - 0.1 * laugh, hy: 0.1 * nz(t, 0.35, 3), hz: 0.05 * laugh * Math.sin(t * 14), L: [0.2, 0.1, 0.3], R: [0.2, 0.1, 0.3] }; st.medFace = wFace(wBase); }
    // ── décors et action par scène ──
    const o = {};
    if (set === "douala") {
      // dissolution dorée : « Remontons au tout commencement »
      st.diss = smooth(C.remontons + 0.3, C.gen1 - 0.7, t);
      if (st.diss > 0) st.fx.gold = { kind: "burst", c: [0, 1.5, 0], p: st.diss, r: 6, n: 900, a: 1 - st.diss * 0.5, size: 0.14 };
    }
    if (set === "creation") {
      const lt = smooth(C.lumiere - 0.2, C.lumiere + 0.9, t);
      st.night = 1 - lt; st.k = { light: lt, sea: smooth(C.mer - 0.2, C.mer + 1.0, t), land: smooth(C.ciel, C.mer + 0.8, t), grow: smooth(C.arbres - 0.2, C.arbres + 2.2, t), animals: smooth(C.animaux - 0.2, C.animaux + 1.6, t), roar: pulse(t, C.animaux + 0.6, C.animaux + 2.5) };
      if (t < C.lumiere + 0.5) st.god = { pos: [0, lerp(6, 9, smooth(C.queDieu, C.lumiere, t)), -14], size: lerp(1.2, 9, smooth(C.queDieu - 1, C.lumiere + 0.4, t)), a: 1 - smooth(C.lumiere + 0.3, C.lumiere + 1.2, t) * 0.7 };
      if (t > C.lumiere - 0.3 && t < C.lumiere + 2.5) st.fx.gold = { kind: "burst", c: [0, 7, -14], p: smooth(C.lumiere - 0.3, C.lumiere + 2.5, t), r: 20, n: 700, a: 1 - smooth(C.lumiere + 1, C.lumiere + 2.5, t) };
      st.fadeCol = "#000"; st.fade = 0;
    }
    if (set === "eden" && k === 3) {
      // Adam formé de la poussière : tourbillon doré, souffle de vie, yeux qui s'ouvrent
      const form = smooth(C.forma, C.souffla - 0.2, t), born = smooth(C.souffla, C.vivant + 0.4, t);
      st.fx.gold = { kind: "tornado", c: [0, 0, -2], r: lerp(1.2, 0.6, form), h: lerp(1, 2.6, form), n: Math.round(lerp(300, 900, form) * (1 - born * 0.85)), a: 1, size: 0.12 };
      if (t > C.souffla - 0.3 && t < C.vivant + 1) st.fx.gold = { kind: "tornado", c: [0, 1.4, -2], r: 0.35, h: 0.6, n: 500, a: 1 - born };
      st.A = { pos: [0, 0, -2], ry: 0.1, scale: Math.max(0.001, smooth(C.forma + 0.5, C.souffla, t)), pose: { breath: 0.015 * Math.sin(t * 1.6) * born, hx: 0.15 * (1 - born) }, face: { lid: lerp(1, 0.08, smooth(C.vivant - 0.3, C.vivant + 0.4, t)), smile: 0.2 + 0.5 * smooth(C.adam, C.adam + 1, t), lx: 0.3 * Math.sin(t * 0.8), t } };
      if (t > C.souffla - 0.5) st.god = { pos: [-2.2, 3.6, -6.0], size: 1.1, a: pulse(t, C.souffla, C.vivant + 0.3, 0.6, 0.8) };
      st.Aout = "tunique";
    }
    // personnages de l'Éden (scènes 5 à 16)
    if (set === "eden" && k >= 4) {
      const eveOn = t >= C.eve - 0.2, eveS = smooth(C.eve - 0.2, C.eve + 0.8, t);
      const walk = pulse(t, C.marchaient - 0.2, C.voulue + 0.5, 0.2, 0.3);
      let ax = AE[0], az = AE[2], ex = EV[0], ez = EV[2], ary = 0.25, ery = -0.3, aPose = { breath: 0.012 * Math.sin(t * 1.6) }, ePose = { breath: 0.012 * Math.sin(t * 1.7 + 1) };
      let aFace = { smile: 0.55, lid: blink(t, 0.3), t }, eFace = { smile: 0.65, lid: blink(t, 0.9), blush: 0.35, t };
      if (k === 4) { ax = lerp(-6, AE[0], smooth(C.pasLaisse, C.deuxArbres, t)); az = lerp(-4, AE[2], smooth(C.pasLaisse, C.deuxArbres, t)); ary = 1.2; aPose.walk = t < C.deuxArbres ? t * 6 : 0; }
      if (walk > 0) { const w = smooth(C.marchaient - 0.2, C.voulue + 0.5, t); ax = lerp(AE[0], -2.2, w); az = lerp(AE[2], -6.5, w); ex = ax + 0.9; ez = az - 0.2; ary = ery = -1.2; aPose.walk = ePose.walk = t * 6.5; }
      if (k === 6) { aFace.ly = -0.5; eFace.ly = -0.5; aFace.lx = eFace.lx = 0.4; }
      // serpent
      if (k === 7 || k === 8 || (k === 9 && t < C.revenons)) { eFace.lx = 0.5; eFace.ly = 0.3; }
      // la bouchée
      const bite = C.mangea1, give = C.donna;
      if (k === 8) { eFace = { ...eFace, glow: pulse(t, C.vit, C.prit, 0.4, 0.4) * 0.6, pupil: 1 + 0.25 * pulse(t, C.vit, C.prit) };
        ePose.R = t < C.prit ? [0.3, 0.2, 0.3] : t < give ? [lerp(0.3, 2.3, smooth(C.prit, C.prit + 0.6, t)), 0.1, lerp(0.3, 1.8, smooth(bite - 0.4, bite, t))] : [lerp(1.6, 1.2, smooth(give, give + 0.6, t)), lerp(0.1, -0.6, smooth(give, give + 0.6, t)), 0.6];
        if (t > bite && t < bite + 0.9) eFace = { ...eFace, mouth: 2, open: 0.6, smile: 0.3 };
        aPose.R = t > C.ilMangea - 0.6 ? [lerp(0.3, 2.0, smooth(C.ilMangea - 0.6, C.ilMangea, t)), -0.1, 1.7] : aPose.R;
        if (t > C.ilMangea && t < C.ilMangea + 0.9) aFace = { ...aFace, mouth: 2, open: 0.6 }; }
      // retour en arrière : on rejoue Ève juste après les paroles du serpent, son regard change
      if (k === 9 && t >= C.apres - 0.4) { eFace = { ...eFace, lx: 0.55, ly: -0.6, glow: smooth(C.vit2, C.pourtant, t) * 0.8, pupil: 1 + 0.35 * smooth(C.vit2, C.pourtant, t), smile: 0.4, lidLo: 0.2, ruse: 0.3 * smooth(C.pourtant, C.pensee, t) }; st.k.fruitBig = smooth(C.vit2, C.pourtant + 1, t); }
      // tout bascule
      const cold = smooth(C.bascule - 0.2, C.bascule + 1.6, t) * (k >= 10 && k <= 14 ? 1 : 0);
      if (k >= 10 && k <= 12) { st.cold = cold * 0.85; st.k.cold = cold; st.fx.leaves = { c: [0, 0, -6], wind: 1.6, a: cold, brown: false };
        aFace = { ...aFace, smile: -0.3, bi: 0.8, bo: -0.2, ly: 0.6, lid: Math.max(0.3, aFace.lid) }; eFace = { ...eFace, smile: -0.35, bi: 0.85, ly: 0.6, lid: Math.max(0.3, eFace.lid), glow: 0 };
        aPose.hx = ePose.hx = 0.25 * cold; aPose.L = aPose.R = ePose.L = ePose.R = [0.9, -0.35, 1.2]; }
      if (k >= 10) { st.Aout = st.Eout = t >= C.figuier ? "fig" : "tunique"; }
      // cachette derrière le buisson
      const hide = smooth(C.cachent - 0.3, C.cachent + 1.2, t) * (1 - smooth(C.ouEsTuE + 0.5, C.savait + 1.5, t));
      if (k >= 10 && k <= 11) st.k.hide = 1;
      if (k >= 10 && k <= 11) { ax = lerp(ax, -1.6, hide); az = lerp(az, -6.6, hide); ex = lerp(ex, -0.8, hide); ez = lerp(ez, -6.7, hide); if (hide > 0.05) { aPose.seated = ePose.seated = 0.6 * hide; ary = ery = 0; } }
      if (k === 11) { const out = smooth(C.ouEsTuE + 0.3, C.savait + 1.2, t); az = lerp(-6.6, -4.9, out); ax = -1.2; aPose.hx = 0.35; aFace = { ...aFace, ly: 0.7, smile: -0.4, bi: 0.6 }; if (out > 0.1) aPose.walk = out < 0.95 ? t * 5 : 0; }
      // accusation
      if (k === 12) { ax = -0.4; az = -6.2; ex = 0.9; ez = -6.4; ary = 0.4; ery = 0.2;
        const p1 = pulse(t, C.laFemme, C.accuse + 3, 0.3, 0.5), p2 = pulse(t, C.serpentSeduite, C.accuse + 3, 0.3, 0.5);
        aPose.R = [lerp(0.3, 1.5, p1), lerp(0.1, -0.2, p1), 0.15]; ary = lerp(0.4, 1.2, p1); aFace = { ...aFace, bd: 0.6, smile: -0.3, lx: 0.8 };
        ePose.R = [lerp(0.3, 1.5, p2), 0.1, 0.15]; ery = lerp(0.2, 1.6, p2); eFace = { ...eFace, bd: 0.5, smile: -0.25, lx: 0.8 };
        if (t > C.laFemme && t < C.eveDit) aFace = { ...aFace, ...mouthOf(t) }; if (t > C.serpentSeduite && t < C.accuse) eFace = { ...eFace, ...mouthOf(t) }; }
      // habits de peau
      if (k === 15) { ax = -0.6; az = -7.2; ex = 0.6; ez = -7.3; ary = 0.15; ery = -0.15;
        const wil = smooth(C.pasSuffi - 0.3, C.pasSuffi + 2.0, t), wrap = smooth(C.solution - 0.6, C.solution + 1.6, t);
        st.Aout = st.Eout = wrap > 0.5 ? "peau" : "fig"; st.warm = 0.35 * wrap;
        st.fx.leaves = wil > 0 && wrap < 0.9 ? { c: [0, 0, -7.3], wind: 0.3, a: wil * (1 - wrap), brown: true } : null;
        st.god = { pos: [0, 2.6, -8.6], size: lerp(2.5, 6.5, wrap), a: 0.6 + 0.4 * wrap };
        if (wrap > 0 && wrap < 1) st.fx.gold = { kind: "tornado", c: [0, 0, -7.25], r: 1.2, h: 2.2, n: 700, a: Math.sin(wrap * Math.PI) };
        aFace = { ...aFace, smile: lerp(-0.2, 0.5, wrap), bi: lerp(0.6, 0.3, wrap), ly: lerp(0.5, -0.4, wrap) }; eFace = { ...eFace, smile: lerp(-0.2, 0.55, wrap), bi: lerp(0.6, 0.3, wrap), ly: lerp(0.5, -0.4, wrap), tear: wrap > 0.4 ? 0.5 : 0 };
        const la = pulse(t, C.animal - 0.3, C.sang + 2.4, 0.6, 1.4); if (la > 0) st.lamb = { pos: [1.6, 0, -8.4], ry: 2.6, a: la * 0.85 };
      }
      if (k === 16) { ax = -0.6; az = -7.2; ex = 0.6; ez = -7.3; st.Aout = st.Eout = "peau"; st.warm = 0.45; st.god = { pos: [0, 5, -11], size: 7, a: 0.8 }; }
      const show = k !== 3;
      if (show && k >= 4) st.A = { pos: [ax, 0, az], ry: ary, pose: aPose, face: aFace };
      if (show && eveOn && k >= 5) st.E = { pos: [ex, 0, ez], ry: ery, scale: Math.max(0.001, eveS), pose: ePose, face: eFace };
      if (k === 5 && t > C.eve - 0.5 && t < C.eve + 1.5) st.fx.gold = { kind: "tornado", c: [EV[0], 0, EV[2]], r: 0.7, h: 2.2, n: 500, a: pulse(t, C.eve - 0.3, C.eve + 1.0) };
      if (!st.Aout) st.Aout = "tunique"; if (!st.Eout) st.Eout = "tunique";
      // la lumière de Dieu
      if (k === 5 && t > C.marchaient - 0.4) st.god = { pos: [lerp(AE[0] - 1.2, -3.5, smooth(C.marchaient, C.voulue + 0.5, t)), 2.2, lerp(-9.6, -7.2, smooth(C.marchaient, C.voulue, t))], size: 2.2, a: pulse(t, C.marchaient, C.voulue + 0.8) };
      if (k === 6) st.god = { pos: [3.4, 2.4, -10.6], size: 2.8, a: 1 };
      if (k === 11) st.god = { pos: [lerp(8, 1.4, smooth(C.chercher, C.ouEsTu, t)), 2.1, lerp(-12, -8.4, smooth(C.chercher, C.ouEsTu, t))], size: 1.8, a: 0.9 };
      // serpent
      if (k === 7) { st.snake = { path: snakeIn, u: smooth(C.unJour, C.ilDit, t), talk: pulse(t, C.reellement, C.gen31e, 0.1, 0.2) + pulse(t, C.mourrez, C.gen345e, 0.1, 0.2), ruse: 0.6, look: [-1, 0.3, 1] }; st.cold = 0.12 * smooth(C.reellement, C.reellement + 2, t); }
      if (k === 8 || (k === 9 && t >= C.apres - 0.4)) st.snake = { path: snakeIn, u: 1, ruse: 0.7, look: [-1, 0.3, 1] };
      if (k === 12) st.snake = { path: snakeAcc, u: smooth(C.accuse + 0.5, C.personne + 1, t), ruse: 0.9 };
      if (k === 9 && t < C.apres - 0.4) { st.snake = { path: snakeIn, u: 1, ruse: 0.7, look: [-1, 0.3, 1] }; }
    }
    // retour en arrière : rembobinage visuel
    const rw = pulse(t, C.revenons, C.apres - 0.4, 0.15, 0.25); st.rew = rw;
    if (set === "thorns") {
      if (k === 13) { const sweat = (t * 0.9) % 1; st.A = { pos: [0, 0, -4], ry: 0.3, pose: { L: [1.2 + 0.6 * Math.sin(t * 3), -0.2, 0.8], R: [1.2 + 0.6 * Math.sin(t * 3), 0.2, 0.8], lean: 0.25 + 0.1 * Math.sin(t * 3), hx: 0.1 }, face: { smile: -0.3, bi: 0.5, lid: 0.3, sweat, t } };
        st.hoe = { pos: [0.25, 1.0 + 0.25 * Math.sin(t * 3), -3.55], rz: 0.4 + 0.5 * Math.sin(t * 3) }; st.Aout = "fig"; st.cold = 0.3; st.k = { };
        const ch = smooth(C.chasses - 0.2, C.chasses + 1, t);
        if (ch > 0) { st.hoe = null; const w = smooth(C.chasses, C.arrete, t); st.A = { pos: [-0.6, 0, lerp(-14.2, -8.5, w)], ry: Math.PI, pose: { walk: t * 5, hx: 0.3 }, face: { smile: -0.4, bi: 0.7, t } }; st.E = { pos: [0.6, 0, lerp(-14.4, -8.7, w)], ry: Math.PI, pose: { walk: t * 5 + 1, hx: 0.3 }, face: { smile: -0.4, bi: 0.7, tear: 0.6, t } }; st.Eout = "fig";
          st.fx.fire = { c: [0, 3.0, -15.2], w: 0.25, h: 1.0, line: 2.0 }; } }
      if (k === 14) st.k = { shadow: smooth(C.arrete + 0.5, C.rom512e, t) }, st.cold = 0.25 + 0.2 * smooth(C.arrete, C.rom512e, t);
    }
    if (set === "eden" && k === 16) { st.k = {}; }
    if (set === "teaser") { if (t >= C.abel - 0.3 && t < C.noe) st.fx.fire = { c: [-30, 1.3, 0], w: 0.6, h: 1.3 }; st.cam = c; }
    if (set === "douala" && k === 17) { st.cam = c; }
    // ── rendu 3D ──
    W.render(t, st);
    // ── textes ──
    const fullW = full;
    pill.style.opacity = (t < C.fin + 0.3 ? 1 : 0).toFixed(2);
    serie.style.opacity = pulse(t, 0.5, C.remontons - 0.5, 0.5, 0.5).toFixed(3); serie.style.transform = `translateX(-50%) scale(${(0.9 + 0.1 * ease(clamp((t - 0.5) / 0.5))).toFixed(3)})`;
    medal.style.opacity = st.med.toFixed(3);
    CARDS.forEach((cd) => { const o2 = pulse(cd.a - 0.2, cd.a, cd.b + 1.2, 0.35, 0.45) || pulse(t, cd.a, cd.b + 1.2, 0.35, 0.45); const op = pulse(t, cd.a, cd.b + 1.2, 0.35, 0.45);
      cd.el.style.opacity = op.toFixed(3); if (op > 0) cd.el.style.transform = `translateY(${((1 - op) * 50).toFixed(1)}px) rotate(${(0.6 * Math.sin(t * 0.8)).toFixed(2)}deg) scale(${(0.92 + 0.08 * op).toFixed(3)})`; });
    TITLES.forEach((x) => { const op = pulse(t, x.a, x.b, 0.25, 0.4); x.el.style.opacity = op.toFixed(3); const p = clamp((t - x.a + 0.25) / 0.35); x.el.style.transform = `translateX(-50%) scale(${(p < 1 ? 0.6 + 0.4 * (1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2)) : 1 + 0.02 * Math.sin(t * 3)).toFixed(3)})`; });
    // sous-titres
    let pi = -1; for (let i = 0; i < pages.length; i++) { if (pages[i].a - 0.05 <= t) pi = i; else break; }
    const showSub = pi >= 0 && t <= pages[pi].b + 0.5 && t < LOGO0 && !(t > C.ouEsTu - 0.15 && t < C.ouEsTuE + 0.2);
    subs.className = fullW ? "bas" : ""; subs.style.opacity = showSub ? "1" : "0";
    if (showSub) { if (pi !== lastPage) { subs.innerHTML = pages[pi].map((w) => `<span class="${w.k ? "k" : ""}">${w.m}</span>`).join(" "); spans = [...subs.children]; lastPage = pi; }
      pages[pi].forEach((w, j) => { const p = clamp((t - w.a) / 0.16); spans[j].style.transform = t >= w.a && p < 1 ? `translateY(${(-14 * Math.sin(p * Math.PI)).toFixed(1)}px) scale(${(1 + 0.12 * Math.sin(p * Math.PI)).toFixed(3)})` : "none"; }); }
    // bulle de pensée et point d'interrogation
    const bo = pulse(t, C.vit2 + 0.4, C.desobei + 1.5, 0.35, 0.4); bubble.style.opacity = bo.toFixed(3); bubble.style.transform = `scale(${(0.6 + 0.4 * ease(clamp((t - C.vit2 - 0.4) / 0.5))).toFixed(3)}) translateY(${(6 * Math.sin(t * 2)).toFixed(1)}px)`;
    bubble.querySelector(".fr").style.transform = `scale(${(1 + 0.25 * smooth(C.vit2 + 0.5, C.pourtant + 1, t) + 0.05 * Math.sin(t * 5)).toFixed(3)})`;
    const qo = pulse(t, C.reellement, C.ruse + 1.5, 0.3, 0.5); qmark.style.opacity = qo.toFixed(3); qmark.style.transform = `translateY(${(-20 * Math.sin(t * 2.2)).toFixed(1)}px) rotate(${(8 * Math.sin(t * 1.5)).toFixed(1)}deg)`;
    rewind.style.opacity = rw.toFixed(3); if (rw > 0) [...rewind.querySelectorAll(".ln")].forEach((l, i) => (l.style.transform = `translateX(${(((t * 2400 + i * 397) % 1500) - 200).toFixed(0)}px)`));
    // fin : logo, signature, à suivre
    const lo = smooth(LOGO0 - 0.4, LOGO0, t); endw.style.opacity = lo.toFixed(3);
    if (t >= LOGO0) W.render(t, { set: "douala", cam: c, logo: { rot: lerp(-2.4, 0, ease(clamp((t - LOGO0) / 1.4))) + 0.12 * Math.sin((t - LOGO0) * 1.3), scale: lerp(0.4, 1, ease(clamp((t - LOGO0) / 1.1))), y: lerp(0.2, 1.0, ease(clamp((t - SIG) / 0.8))) } });
    sig.style.opacity = clamp((t - SIG - 0.2) / 0.5).toFixed(3); suite.style.opacity = clamp((t - SIG - 0.9) / 0.5).toFixed(3); suite.style.transform = `translateX(-50%) scale(${(0.85 + 0.15 * ease(clamp((t - SIG - 0.9) / 0.4))).toFixed(3)})`;
    blk.style.opacity = clamp((t - (DUR - 0.5)) / 0.5).toFixed(3);
  }
  const proxy = { v: 0 };
  tl.to(proxy, { v: DUR, duration: DUR, ease: "none", modifiers: { v: (x) => { update(parseFloat(x)); return x; } } }, 0);
  update(0);
  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__film = { tl, update };
  window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl;
};
