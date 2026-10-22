# Le Débat — « Pardonner à Jorvis » (Dave & Marie, 9:16)

Style « LE DÉBAT » (branche `style-debat` de giresse-codes/jp-motion-video), adapté à MIDIGRAD.
1080×1920, 30 i/s. Voix off : `pardonner-a-jorvis-dialogue.wav` (166 s), normalisée à −16 LUFS → `assets/dialogue.wav` (non versionné).

- `src/build_data.py` : texte des 20 répliques, mots surlignés (`*mot*`), changements de bulle (`|`), expressions ;
  calage mot à mot sur les zones de parole détectées (`src/regions.json`) → `assets/data.js`.
- `assets/persos.js` : Dave et Marie en SVG plat, visages interchangeables. `assets/debat.js` : moteur (bulles karaoké,
  cartes verdict/verset, lumière de bascule à la réplique 12, confettis à la 19, écran de fin).
- `src/build_index.py` → `index.html` (SFX exportés dans `src/sfx.json`).

## À confirmer
- Logo provisoire (rond « M ») ; texte du bouton « Suis MIDIGRAD » (étiquette « Abonne-toi »).
- Les cartes versets affichent le texte Louis Segond exact. Il diffère de la voix pour Éphésiens 5:1
  (LSG : « Devenez donc les imitateurs de Dieu… ») et Colossiens 3:13 (texte complet du verset).
- Audio : un « Dave ? » vers 43,9 s (entre les répliques 7 et 8) et un « Écoute » probable au début de la réplique 11
  ne sont pas dans le script et ne sont pas affichés.
