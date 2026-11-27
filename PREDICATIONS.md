# PRÉDICATIONS COURTES — MIDIGRAD

Format court (50 s à 1 min 30, vertical) publié entre les épisodes de la série « Le pardon divin ».
Tout ce format vit sur la branche `predications-courtes`. **Pour chaque nouvelle prédication, applique exactement ces règles.**

## Commande `#predication N`

`NN` = N sur 2 chiffres (ex. `#predication 2` → `predications/02-<titre>/`).

1. **Voix** : récupère `predications/NN-<titre>/voix.wav` (ou `.mp3`). **Si elle est absente, arrête-toi et dis-le.**
2. **Transcription** : transcris la voix avec faster-whisper (horodatage par mot). **C'est la VOIX qui compte** : compare-la au texte fourni et signale toutes les différences (mots changés, phrases absentes ou ajoutées).
3. **Texte d'écran** : écris `predications/NN-<titre>/texte-ecran.txt` (version de la voix, sans balises `[ ]`) :
   - une ligne = un bloc : `haut :: …` (texte en haut), `verset=REFERENCE :: …` (carte de verset), `citation>ancre :: …` (mots qui restent affichés en or jusqu'à l'ancre) ;
   - `/` = retour à la ligne (24 caractères max par ligne, 4 lignes max) ; préfixes de couleur `o:` or, `r:` rouge, `v:` vert, `b:` bleu (1 ou 2 mots-clés par phrase) ; `MOT@nom` = ancre de synchro pour les animations.
4. **Horodatage précis** (obligatoire, ±3 images) : alignement forcé wav2vec2 du texte sur la voix :
   `python3 predications-studio/outils/aligner.py <voix> <texte-ecran.txt> predications/NN-…/mots-voix.json`
   (whisper large-v3 est décalé d'environ 4 images : ne l'utilise pas seul pour les temps ; recoupe avec whisper medium).
   Puis : `python3 predications-studio/outils/preparer.py <mots-voix.json> <texte-ecran.txt> predications-studio/src/pNN.json`
5. **Feuille de montage** `predications/NN-…/feuille-de-montage.md` : temps / phrase / scène / effet / son. Montre-la.
6. **Composition** : crée `predications-studio/src/predications/PredicationNN.tsx` (modèle : `Predication01.tsx`) et ajoute-la dans `Root.tsx`. Réutilise les composants, crée les icônes qui manquent dans `IconeNeon.tsx`.
7. **Hook** : rends les 15 premières secondes, mets-les côte à côte avec une capture de `reference/reference.mp4` → `hook-15s-comparaison.mp4`. **Attends l'OK.**
8. **Son** : `python3 predications-studio/outils/mixer.py predications/NN-… predications-studio/src/pNN.json predications-studio/out/pNN-mix.wav` (liste des bruitages dans `BRUITAGES`, à adapter).
9. **Rendu** :
   ```
   cd predications-studio
   npx remotion render src/index.ts predication-NN out/video.mp4 --muted --image-format=png --crf=14 --pixel-format=yuv420p
   ffmpeg -i out/video.mp4 -i out/pNN-mix.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
     -c:a aac -b:a 192k -movflags +faststart ../predications/NN-…/predication-NN.mp4
   ```
   Planche : `ffmpeg -i predication-NN.mp4 -vf "fps=1/3,scale=270:480,tile=8x4:padding=4" -frames:v 1 planche-captures.png` (une image toutes les 3 s).
10. **Revue** (oui / non pour chaque point, corrige tout « non » avant de livrer) — aide : `python3 predications-studio/outils/revue.py <vidéo> reference/reference.mp4`
    - [ ] fond aussi sombre que la référence ;
    - [ ] texte en haut, mot par mot, synchronisé avec la voix (±3 images) ;
    - [ ] reflets au sol présents ;
    - [ ] 3 couleurs maximum à l'écran ;
    - [ ] aucune balise visible ;
    - [ ] versets exacts, en Louis Segond 1910 (si la voix s'arrête au milieu d'un verset, finir la carte par « … ») ;
    - [ ] carte MIDIGRAD à la fin.
11. `legende.txt`, commit, puis `git -c push.negotiate=true push` sur `predications-courtes`. Envoie la vidéo.

## Style (repris EXACTEMENT du style Finance « scène sombre néon » de Studio-pov, adapté à MIDIGRAD)

Références visuelles : `reference/reference.mp4`, `reference/reference-planches-1.png`, `reference/reference-planches-2.png`. **Une version trop colorée, trop vive ou cartoon est rejetée.**

- **Format** : Remotion 2D (SVG + CSS), 1080×1920, 30 fps, H.264 CRF 18, yuv420p, AAC 192k, +faststart. Projet : `predications-studio/`.
- **Décor** (`Scene`) : fond presque noir `#05070B → #0B111C`, halo bleu nuit `#16233A` très doux, vignette forte, sol brillant (ligne d'horizon fine) à **78 %** de la hauteur, **reflet** sous chaque objet posé au sol (`AuSol` : même dessin retourné ~25 %, qui s'efface), léger grain **fixe en mode overlay** (il n'éclaircit pas le fond et garde la vidéo sous 100 Mo, limite GitHub). Ne jamais éclaircir le fond : luminance médiane ≈ 12/255 comme la référence (`revue.py`).
- **Personnages** (`Bonhomme`) : bonhomme bâton **blanc** sans visage = « toi » ; les autres en **gris `#9AA3AE`**. Poses : debout, poignets (enchaîné), voûté, bras levés, regard levé, face à, à genoux (mains jointes), marche, allongé. Mouvements lents.
- **Icônes néon** (`IconeNeon`) : traits fins, coins arrondis, remplissage 10-15 %, halo de la couleur du trait, tracé qui se dessine. Disponibles : chaîne/maillons, cadenas, croix, cœur (fissure, brisé, qui se serre), colombe, Bible ouverte, mains jointes, couronne d'épines, rayon de lumière, sac de grain, puits, poids, partage. Silhouette agenouillée = `Bonhomme` pose `genoux`.
- **Couleurs** (2 à 3 maximum à l'écran) : blanc par défaut ; **or `#F5B731`** = Dieu, la Parole, la lumière ; **rouge `#FF4D3D`** = blessure, offense ; **vert `#2ECC71`** = libération, pardon reçu ; **bleu `#4DA3FF`** = paix. Un changement de couleur (rouge → vert) se fait en fondu successif (le rouge s'efface, puis le vert apparaît), jamais les deux ensemble.
- **Texte** (`TexteHaut`) : en haut, centré, JetBrains Mono Bold MAJUSCULES, 42 px, espacement 0,12 em, blanc cassé `#E8ECF1` ; **mot par mot** au moment exact où la voix le dit (fondu 0,1 s) ; la phrase précédente s'efface en fondu.
- **Versets** (`CarteVerset`) : carte au centre, au-dessus du sol ; texte du verset en blanc, mot par mot ; référence en or, en petit, dessous (ex. « COLOSSIENS 3:13 »). Pendant la carte, pas de texte en haut. Texte Louis Segond 1910 exact.
- **Composition** : beaucoup de vide, 1 à 4 éléments par scène, posés au sol vers le centre. Une idée par scène.
- **Transitions** : fondu doux par le noir (0,5 s) entre deux scènes ; apparitions en fondu / tracé ; mouvements lents et élégants.
- **Fin** (exception à la règle Finance) : après la dernière phrase, **2 s de carte MIDIGRAD** (`CarteMidigrad` : logo-midigrad.png en fondu lumineux doux + « EUD — CONSISTOIRE MIDIGRAD » en monospace), puis **1 s de noir**. Pas de « ABONNE-TOI ».
- **Interdits** : balises entre crochets à l'écran, emoji, sous-titres en bas, gags, couleurs vives, logo ailleurs qu'à la fin.

## Son

- Voix : -14 LUFS, crête -1 dBTP (loudnorm deux passes).
- Musique très douce (`sons/musique.mp3`, piano, ambiance de prière) à 8-10 %, baissée automatiquement sous la voix (sidechain).
- Petits sons doux à 20-30 % (cœur, lumière, logo…). **Ne fabrique aucun son** : s'il en manque un, ajoute-le à `sons/LISTE.md`, dis-le et laisse le moment sans bruitage.

## Fichiers d'une prédication

`predications/NN-<titre>/` : `voix.mp3|wav`, `texte-ecran.txt`, `mots-voix.json`, `feuille-de-montage.md`, `hook-15s-comparaison.mp4`, `predication-NN.mp4`, `planche-captures.png`, `legende.txt`.

## Prédications

| N° | Titre | Versets |
|---|---|---|
| 01 | La chaîne du pardon | Colossiens 3:13 ; Genèse 50:20 |
