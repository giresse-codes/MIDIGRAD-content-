# Style « 3D MIDIGRAD » — scène Three.js + personnages illustrés (9:16)

Première utilisation : `videos/annabelle-ma-part-suffit-2/` (branche `video-annabelle-partie-2`).
Suite des styles « LE DÉBAT » et « Église cinéma » : mêmes polices (Inter, JetBrains Mono), bulles karaoké gris → noir,
mots-clés surlignés en orange, cartes versets crème à liseré orange, logo en haut, pastille « EUD CONSISTOIRE MIDIGRAD » en bas.

## Outils
- **HyperFrames** (rendu image par image) avec **Three.js 0.170** (`assets/lib/three.module.min.js`, import map `"three"`).
  Le Chrome de rendu dispose de WebGL 2 (SwiftShader, CPU) : ombres douces (PCFSoft) et anticrénelage fonctionnent.
- Pour tester hors rendu : servir le dossier en HTTP (`python3 -m http.server`) — les modules ES ne se chargent pas en `file://`.
- Encodage final : master `--crf 10`, puis ffmpeg `libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30`,
  AAC 192 kb/s 48 kHz, `-movflags +faststart`. Version < 30 Mo en 2 passes si besoin.

## Fichiers
- `assets/room3d.js` : `createRoom(canvas, logoUrl)` → `{ render(t, état), renderLogo(t), project([x,y,z]) }`.
  Chambre d'hôpital « jouet » (formes arrondies `RoundedBoxGeometry`, matières mates) : lit médicalisé, oreillers, drap,
  perfusion, moniteur (ECG dessiné à chaque image dans une CanvasTexture), table de chevet (verre, fleurs), fenêtre
  (ciel de fin d'après-midi), rideau qui ondule, chaise. Lumières : hémisphère + soleil (ombres) + lumière d'appoint,
  rayon de soleil additif + poussière. État lumière : `cool`, `warm`, `beam`, `pastor` (0-1).
  Logo de fin : disque extrudé doré avec le logo en façade, reflet qui passe, rotation douce.
- `assets/rig.js` : personnages illustrés articulés (SVG), options `gown` (chemise d'hôpital), `noLegs` (couchée),
  `elder` + `pal` (belle-mère : autre pagne, cheveux gris), `noChair`. Voir le STYLE.md d'« Église cinéma » pour les pièces.
- `assets/film2.js` : moteur. Plaques des personnages **projetées** depuis un point 3D (`ROOM.project`) : elles suivent
  la caméra 3D et changent d'échelle avec la distance. Caméra 3D par images clés (`CAM` : DOOR, WIDE, MID, AC/AXC gros plans,
  OTS par-dessus l'épaule, PC pasteur, AL écoute, PULL recul). Profondeur de champ : flou CSS du canevas selon la distance
  caméra-cible + flou sur celui qui écoute. Lip-sync (RMS + timbre), clignements, respiration, hochements.
- `src/corriger_audio.py` : coupe d'un passage de la voix off avec fondu de 30 ms + timings.json.
- `src/build_data.py` : textes (`*mot*` surligné, `|` changement de bulle), calage mot à mot, mixage (bip du moniteur et
  nappe de piano à −28 dB, voix ≈ −14 LUFS), lip-sync. `src/build_index.py` : page HyperFrames + décors de narration.

## Règles
Expressions modérées, gestes 0,2 s avant la voix, changements en 0,3-0,5 s, pas de tremblement de caméra ni de flash.
Narration lumineuse : fondu vers le blanc chaud, sous-titres karaoké centrés en bas, mots-clés en orange.
Si les personnages en vraie 3D ne sont pas assez beaux, garder les plaques illustrées dans le décor 3D (choix retenu ici).

## Mise à jour (Annabelle partie 2, v2) — nouveaux personnages, réalisme des visages, pleurs

### Nouveaux personnages (`assets/rig.js`)
- **Le mari** : `RIG.make("pastor", id, { husband: true, pal })` — homme d'environ 35 ans, chemise en pagne assortie
  (motif `pal`), sans lunettes, cheveux et barbe courte noirs, pantalon sombre.
- **La belle-mère** : `RIG.make("annabelle", id, { elder: true, pal: ["#24407a", "#7fc06a", "#e7b64a"] })` — foulard et pagne
  bleu-vert, tempes grises ; d'abord `serieux`, puis `emue` et `paisible`.
- **Belle-famille** : 3-4 instances simples (`husband` / `annabelle` avec d'autres `pal`), plus petites, en retrait, floues (2,4 px).
- **Passants** (rue) : silhouettes plates `SCENES.passer(classe, corps, tête)`, bras et jambes animés.
- Accessoires : `propA` / `propB` (SVG placé dans la main A / B) — Bible d'Annabelle, téléphone du pasteur.

### Réalisme des visages (paramètres de `set`)
`wet` yeux humides (trait brillant sur la paupière inférieure, reflets agrandis) · `red` yeux et nez rougis ·
`lidlo` paupière inférieure qui remonte · `chin` menton crispé · `swallow` déglutition (0→1) · `mj` [dx, dy, sx, sy] lèvres qui frémissent ·
`drops` 3 canaux de **larmes** `[progression, traînée]` : la goutte descend la joue et laisse une **trace brillante** qui s'efface en 7 s.
Bouches ajoutées : `quiver` (lèvres tremblantes), `sob` (sanglot retenu), `smileT` (sourire à travers les larmes).
Dans `film2.js` : piste `AF` (wet, red, trem, chin, sob, lidlo) avec transitions de 1,2 à 1,6 s ; micro-mouvements par bruit
déterministe (paupières, sourcils, tête, lèvres) proportionnels à `trem` ; respiration saccadée selon `sob` ; regard qui fuit ;
cinématique inverse `ik(épaule, point)` pour la main sur la bouche / la poitrine / l'oreille.
Progression : 1 blessée → 2 yeux mouillés → 3 larmes → 4 larmes franches (main sur la bouche) → 5 tête baissée, yeux fermés → 6 soulagement.

### Gros plans de réaction
`CU` dans `build_data.py` : fenêtres (secondes de la voix off) + niveau d'émotion, toutes les 8-15 s pendant les longues
paroles du pasteur, jamais pendant les versets. Caméra `camAt` : coupe franche sur le visage, zoom lent (distance 1,42 → 1,20),
visage placé sous les bulles ; Annabelle nette, le reste flou.

### Méthode des pleurs (sans fichier extérieur)
1. `src/timings.py` : transcription Whisper (blocs coupés sur les pauses) + alignement du texte exact → `timings.json` mot à mot.
2. `src/pleurs.py` : dans les répliques émues d'Annabelle, on ne garde que les **pauses entre deux zones de parole** contenant
   un souffle (niveau entre −64 et −44 dB, après le silence qui suit le mot précédent) ; fondus 50 ms, passe-bas doux 6 kHz →
   `audio/pleurs-extraits/`. Contrôle : Whisper ne doit reconnaître **aucun mot** (seulement « soupir » / bruit), voisement faible.
3. `src/pleurs_mix.py` : extraits posés pendant les gros plans à −22/−26 dB sous la voix du pasteur, de préférence dans ses
   respirations, espacements irréguliers, jamais deux fois le même de suite, petite réverbération de pièce, fondus 0,5 s.
   `audio/pleurs.mp3` (optionnel) est mélangé au même niveau s'il existe. Aucun faux pleur généré par code.

### Nouvelles scènes (`assets/scenes.js`)
Rue de Douala (façades et boutiques, motos-taxis, taxi jaune, trottoir ; travelling en parallaxe, malaise au ralenti, son
étouffé, flou), couloir d'hôpital « CARDIOLOGIE » (le pasteur avance vers la caméra, téléphone à l'oreille), porte « CHAMBRE 12 »
qui s'ouvre, salon familial doré (naissance : bébé emmailloté dans un pagne, caméra circulaire en parallaxe).
L'apôtre n'est jamais dessiné : chaire vide.
