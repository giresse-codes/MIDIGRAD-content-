# Style « Église cinéma » — MIDIGRAD (9:16)

Évolution du style « LE DÉBAT » : on garde son identité (polices Inter / JetBrains Mono, bulles karaoké gris → noir,
mots-clés surlignés en orange, pastilles, cartes versets) et on passe à une vraie scène de film animé, naturelle et retenue.
Première utilisation : `videos/annabelle-ma-part-suffit-1/` (branche `video-annabelle-partie-1`).
Aperçus : `replique-02_plan-large.png`, `replique-11_annabelle-choquee.png`, `replique-28_narration.png`.

## Pipeline
1. **Voix** : `src/build_data.py <voix> <regions.json>` lit la voix off, place chaque réplique (fenêtres `T`),
   répartit les mots au prorata de leur longueur sur les zones de parole, monte l'audio (pause avant la narration,
   ambiance de salle −30 dB, nappe de piano −28 dB sous la voix, voix à ≈ −14 LUFS) et calcule le **lip-sync**
   (niveau RMS 0-9 + timbre o/a/i par image, lissé). Sorties : `assets/data.js`, `assets/audio.wav`, `timings.json`.
2. **Page** : `src/build_index.py` → `index.html` (HyperFrames, timeline GSAP en pause).
3. **Rendu** : `npx hyperframes render --crf 10` (rendu image par image), puis encodage final ffmpeg :
   `libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30`, AAC 192 kb/s 48 kHz, `-movflags +faststart`.

Déterminisme : tout ce qui concerne les personnages, la lumière, les ventilateurs, la poussière et le grain est une
**fonction pure du temps** (`update(t)` dans `film.js`), appelée à chaque image par un tween témoin (`modifiers`).
Bulles, cartes et caméra sont des tweens GSAP classiques.

## Personnages articulés — `assets/rig.js`
`RIG.make("annabelle" | "pastor", uid, {chair, noChair})` → `{svg, set(state)}`. Boîte 600×900, tourné vers la droite
(`flip: -1` pour la gauche ; passer par 0 donne l'effet « se retourne »).
Pièces : jambes assises / debout (marche : `walk` = phase en radians), bassin, torse (`lean`), respiration (`breathe`),
bras (`arms: [épaule A, coude A, épaule B, coude B]` en degrés), mains, cou, tête (`head` inclinaison, `nod` hochement, `turn` profil),
yeux (blanc, pupille `gx/gy`, paupière `lid` 0-1), sourcils (`bin` milieu relevé, `bfr` froncés, `bup` levés),
bouche (`closed, mi, open, o, i` pour la parole ; `smile, soft, pinch, frown, tight` au repos), larme (`tear` 0-1).
Accessoires : Bible (`bib: hand | open | lap`), sac (`bag: lap | hand`), alliance (main A).

## Table des expressions et poses — `assets/film.js`
| Clé | Réglage |
|---|---|
| respect | tête un peu baissée, regard bas, bouche douce |
| souci / triste / blessee | sourcils relevés au centre, regard bas, bouche tombante (+ `tear`) |
| amere / detour / degout | regard de côté, bouche pincée |
| choc | yeux ouverts, sourcils levés, buste qui recule (`lean` négatif) |
| colere / froide | sourcils froncés, bouche serrée, regard droit |
| chaleureux / compatissant / calme | sourire, tête inclinée |
| lecture | regard sur la page, Bible ouverte (pose `read`) |
| reflechit | main au menton (pose `chin`) |
| inquiet / priere | sourcils relevés · yeux fermés, mains jointes |

Poses : `lap, joint, chest, chestA, open, chin, read, reach, fists, hang, gesture, bag`.
Règles : changements progressifs (0,3-0,5 s), gestes 0,2 s avant la voix, clignements toutes les 2-5 s,
respiration permanente, petits hochements de celui qui écoute, flou léger (2,4 px) sur celui qui ne parle pas.

## Décor — `assets/decor.js`
Église MIDIGRAD (Douala) en 3 plans : fond (mur, banderole MIDIGRAD, croix, fenêtres, rayons), milieu (estrade, pupitre,
clavier, batterie, chaises en plastique déplacées, ventilateurs), avant (personnages). Parallaxe : 0,55 / 0,8 / 1.
Caméra : `shot(t, durée, {cx, cy, z})` (plans W, M, A1/A2 sur Annabelle, P1 sur le pasteur).
Lumière : chaude au début → plus grise progressivement → légèrement sombre (filtre + calques `#warm` / `#cool`).
Scènes de narration : `HOME` (soir, fenêtre), `ECG` (moniteur), `STREET` (bâtiment MIDIGRAD), `CORRIDOR` (silhouette de dos, lumière chaude).

## Narration
Fondu au noir 1 s, bandes cinéma, palette froide, grain léger, sous-titres centrés en bas (karaoké blanc, mots-clés en orange),
titre monospace qui s'écrit, « À SUIVRE… » qui pulse, logo final sur fond crème.

## Cartes versets
Fond crème, liseré orange, référence en monospace orange, texte LSG, mots-clés surlignés au moment où ils sont dits,
petite illustration plate possible (`ILL.sam` roi et homme qui crie, `ILL.digue` digue qui laisse filer l'eau).
