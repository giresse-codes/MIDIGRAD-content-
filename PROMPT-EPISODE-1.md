# Prompt Claude Code — « Le pardon divin », épisode 1 (version finale révisée)

Copier tout le bloc ci-dessous dans Claude Code, sur l'ordinateur, dans le dossier du projet.

```
VIDÉO « Le pardon divin » — ÉPISODE 1 : AU COMMENCEMENT. Version finale. Lance-toi directement.

0. FICHIERS ET STYLE
- Dépôt giresse-codes/midigrad-content-, branche `serie-pardon-divin-episode-1`. Elle contient : clips/ (01 à 23, dont 22a et 22b, pas de 17), STYLE.md, texte-voixoff.txt, logo-midigrad.png. Lis STYLE.md en entier. Travaille sur cette branche.
- Ajoute depuis mon dossier local : audio/ep1.mp3 (voix de l'apôtre Paris Talla), audio/sons/ (bruitages), audio/musique.mp3 (facultatif).
- Installe ce qui manque : Node.js 22+, FFmpeg, Python 3 + faster-whisper, HyperFrames ou Remotion, GSAP. Utilise la carte graphique pour le rendu et l'encodage (NVENC, QSV ou AMF si disponible, sinon libx264).

1. INVENTAIRE
IMPORTANT : le narrateur est l'APÔTRE PARIS TALLA, plus Wilfried (un jeune homme en chemise blanche). Les clips 01, 02 et 23 du dépôt montrent encore Wilfried : remplace-les par les clips de l'apôtre que je t'envoie (clips/01.mp4 salut dans la rue, clips/02.mp4 buste pour le médaillon, clips/23.mp4 main sur le cœur au coucher du soleil). Si tu n'as pas reçu ces 3 clips, ARRÊTE-TOI et demande-les-moi avant tout rendu. N'utilise jamais une image de Wilfried.
Tableau plan par plan : fichier, durée, résolution (attendu 1280×720, environ 10 s), présence d'un son d'origine. Signale tout fichier manquant ou illisible, puis continue.

2. VOIX ET SOUS-TITRES
- Transcris audio/ep1.mp3 au mot près (faster-whisper large-v3, français, horodatage par mot).
- Les SOUS-TITRES suivent ce qui est réellement dit dans l'audio (l'apôtre peut s'écarter un peu du texte). Corrige seulement l'orthographe des noms propres et des mots bibliques grâce à texte-voixoff.txt (Éternel, Éden, chérubins, Paris Talla…).
- Les CARTES DE VERSETS reprennent mot pour mot le texte de texte-voixoff.txt (Louis Segond 1910).
- N'ajoute aucune parole. Ignore les indications entre crochets du fichier texte.

3. FORMATS (les clips sont horizontaux : ne jamais les recadrer en vertical)
a) TikTok / Reels / Statut, 1080×1920 : clip à pleine largeur (1080×608) au centre ; au-dessus et en dessous, le même clip agrandi, flou fort (gblur ~40), assombri de 35 % ; fin trait doré au bord du clip. Bande du haut : étiquette « ÉPISODE 1 · AU COMMENCEMENT » puis les sous-titres (2 lignes max). Bande du bas : médaillon de l'apôtre à gauche.
b) YouTube / Facebook, 1920×1080 : clip plein écran (agrandi proprement), sous-titres en bas, médaillon plus petit en bas à gauche.

4. OUVERTURE ACCROCHEUSE (4 s, avant la voix)
Montage rapide sans voix : le fruit qui brille (12), la bouchée (13, son croquer), le serpent (11, sifflement), l'épée de feu (20). Texte au centre : « ÈVE A-T-ELLE VRAIMENT PÉCHÉ EN MANGEANT LE FRUIT ? », puis titre « LE PARDON DIVIN » sur un whoosh. La voix commence ensuite sur le plan 01.

5. MONTAGE
- Clips : son d'origine coupé ; durée ajustée au texte (coupe, ralenti jusqu'à 0,8×, ou zoom lent sur la dernière image). Aucune boucle visible. Coupes franches ou fondus courts ; whoosh aux changements de lieu.
- Médaillon : clip 02 recadré sur le visage de l'apôtre (rond, double bord noir et doré, étiquette « APÔTRE PARIS TALLA »), affiché du plan 03 au plan 22.
- Plan 16 : il couvre aussi le plan 17 (Adam sort dans la lumière sur « Où es-tu ? »).
- Plan 22 : clips/22a.mp4 sur « leurs feuilles ne suffisaient pas » et « Dieu lui-même a trouvé la solution », puis seulement les 3 premières secondes de clips/22b.mp4 (habits de peau, visages hors champ) sur « habits de peau », avec un zoom lent.
- Cartes de versets : plein écran sur le clip en cours flouté, style parchemin, référence en haut, 4 à 6 s selon la longueur, son parchemin.
- Étalonnage : chaud et lumineux en Éden, plus froid et gris après la chute, doré à la fin.

6. ORDRE DES PLANS (calé sur la voix)
01 accueil → 03 « au tout commencement » → 04 création (GENÈSE 1:1) → 05 animaux → 06 et 07 Adam (GENÈSE 2:7) → 08 le jardin (GENÈSE 2:8) → 09 Adam et Ève (GENÈSE 2:18, 1:31) → 10 la règle (GENÈSE 2:16-17) → 11 le serpent (GENÈSE 3:1, 3:4-5) → 12, 13, 14 le fruit (GENÈSE 3:6) → rembobinage (image qui recule en accéléré, lignes de vitesse, son rembobinage) et retour sur le 12 au ralenti → 15 la honte (GENÈSE 3:7) → 16 la cachette puis Adam qui sort → « Où es-tu ? » (GENÈSE 3:9, écho léger sur la voix) → 18 l'accusation (GENÈSE 3:12-13) → 19 les conséquences (GENÈSE 3:19) → 20 l'expulsion → 21 les générations (ROMAINS 5:12) → 22a puis 22b les habits de peau (GENÈSE 3:21) → carte ROMAINS 6:23 → 23 l'apôtre, fin.

7. TITRES À L'ÉCRAN (jaune, gros contour noir, petit rebond)
« AU COMMENCEMENT », « LE PÉCHÉ COMMENCE DANS LA PENSÉE », « OÙ ES-TU ? », « C'EST SA FAUTE ! », « DIEU LUI-MÊME A TROUVÉ LA SOLUTION ».

8. BRUITAGE ET MIXAGE (fichiers de audio/sons/)
ambiance-ville (01, 23) · magie-lumiere (03, lumière de Dieu) · vagues et vent-doux (04) · lion, elephant, oiseaux-foret (05) · souffle (06) · oiseaux-foret + cascade + vent-doux en fond dans tout Éden · pas-herbe (09) · serpent (11) · croquer (13, 14) · rembobinage · vent-fort, tonnerre, feuilles (15, 16 ; les oiseaux s'arrêtent) · silence presque total juste avant « Où es-tu ? » · travail-terre (19) · feu (20) · foule (21) · agneau puis magie-lumiere (22) · parchemin (cartes) · whoosh (transitions).
Ambiances -30 à -26 LUFS, bruits ponctuels vers -22 LUFS, musique -22 LUFS, toujours sous la voix avec baisse automatique (sidechaincompress) quand l'apôtre parle. Loudnorm final -14 LUFS, pic -1 dB. S'il manque un son, signale-le sans le fabriquer.

9. FIN
« À SUIVRE : ÉPISODE 2 — LE SANG DES SACRIFICES » (3 s), logo MIDIGRAD (logo-midigrad.png, 3 s), carte « EUD — Consistoire MIDIGRAD » (3 s), fondu au noir.

10. SORTIES
- episode-1-tiktok.mp4 (1080×1920) et episode-1-youtube.mp4 (1920×1080) : H.264 CRF 18, yuv420p, 30 fps, AAC 192 kb/s, +faststart.
- episode-1.srt (sous-titres pour YouTube et Facebook).
- chapitres.txt (chapitres YouTube avec horodatage : Introduction, La création, Le jardin d'Éden, Le serpent, Le péché commence dans la pensée, Où es-tu ?, Les conséquences, Les habits de peau, Conclusion).
- 3 extraits TikTok de 45 à 60 s (le serpent et le fruit ; « Où es-tu ? » et l'accusation ; les habits de peau), chacun terminé par « ÉPISODE COMPLET SUR NOTRE PAGE ».
- GitHub refuse les fichiers de plus de 100 Mo : pousse le code et les petits fichiers ; si une vidéo dépasse 95 Mo, garde-la seulement en local et dis-moi où elle est.

11. VALIDATION (dans l'ordre)
1) Le tableau d'inventaire. 2) Un extrait TikTok de 20 s (de la règle à la bouchée) pour valider la mise en page, les sous-titres et le son. 3) Après mon accord : toutes les sorties.
```
