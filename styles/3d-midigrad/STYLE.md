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
