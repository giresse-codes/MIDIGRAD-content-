# Prompt Claude Code — « Le pardon divin », épisode 1 (version 2, reprise complète)

À coller dans Claude Code : « Récupère le dépôt giresse-codes/midigrad-content-, branche `serie-pardon-divin-episode-1`. Lis PROMPT-EPISODE-1.md et exécute-le entièrement. »

```
VIDÉO « Le pardon divin » — ÉPISODE 1 : AU COMMENCEMENT — VERSION 2 (on recommence le montage depuis zéro, en tenant compte des retours des pasteurs). Lance-toi directement.

0. FICHIERS
- Branche `serie-pardon-divin-episode-1` du dépôt giresse-codes/midigrad-content-. Lis STYLE.md, texte-voixoff.txt et ce fichier en entier.
- Ignore tout montage précédent de l'épisode 1 : on repart de zéro.
- Ajoute ce que je t'envoie ou ce qui est dans mon dossier : audio/ep1.mp3 (la voix de l'apôtre, UNE seule voix du début à la fin), audio/sons/ (bruitages), audio/musique.mp3 (facultatif), et les nouveaux clips dans clips/ (liste au point 3). Range chaque clip sous son nom exact.
- Installe ce qui manque : Node.js 22+, FFmpeg, Python 3 + faster-whisper (large-v3), HyperFrames ou Remotion, GSAP, OpenCV. Utilise un GPU s'il y en a un.

1. RETOURS DES PASTEURS À RESPECTER ABSOLUMENT
a) Publicité MIDIGRAD : la vidéo COMMENCE par l'ouverture MIDIGRAD (logo + « EUD — Consistoire MIDIGRAD ») et SE TERMINE par elle.
b) L'apôtre doit PARLER à l'écran : banque de clips (point 5), médaillon plus grand.
c) SYNCHRONISATION : chaque action montrée arrive EN MÊME TEMPS que le mot qui la dit, jamais après (tolérance ±3 images).
d) ERREURS DE GÉNÉRATION : repère-les et corrige-les par le montage (point 6).
e) CONTINUITÉ : après les habits de peau, on ne revoit JAMAIS Adam et Ève en feuilles. Avant la chute : tuniques claires. Après la chute : feuilles. Après Genèse 3:21 : peaux.
f) LE SACRIFICE DE L'AGNEAU se voit clairement (plans 22b à 22d), le sang toujours flouté.
g) RICHE EN ANIMATION : plans courts (2 à 4 s), plusieurs clips par phrase, jamais l'impression de feuilleter un livre.

2. TRANSCRIPTION ET FEUILLE DE MONTAGE (avant tout rendu)
- Transcris audio/ep1.mp3 au mot près (faster-whisper large-v3, français, horodatage par mot).
- Sous-titres = ce qui est réellement dit. Corrige seulement l'orthographe des noms propres et mots bibliques avec texte-voixoff.txt. Cartes de versets = texte exact de texte-voixoff.txt (Louis Segond 1910).
- Construis une FEUILLE DE MONTAGE (cue sheet) : pour chaque plan du point 3, le mot-clé déclencheur, son horodatage, le clip, la partie du clip utilisée (début/fin), l'effet. L'action visible du clip (bouchée, geste, chute, flamme…) doit tomber sur le mot-clé. Montre-moi cette feuille avant le rendu.

3. LISTE DES PLANS (ordre, clip, mot-clé déclencheur)
OUV  — Ouverture MIDIGRAD (code, 5 s) : logo-midigrad.png qui apparaît en lumière dorée, son logo-reveal, puis « EUD — CONSISTOIRE MIDIGRAD » et « présente ».
ACC  — Accroche (4 s, sans voix) : 12 le fruit qui brille, 13 la bouchée (son croquer), 11 le serpent (sifflement), 20 l'épée de feu. Texte : « ÈVE A-T-ELLE VRAIMENT PÉCHÉ EN MANGEANT LE FRUIT ? », puis titre « LE PARDON DIVIN ».
01   — 01.mp4 : l'apôtre salue (« Bonjour, bien-aimés ») — en grand.
03   — 03.mp4 : la lumière jaillit (« au tout commencement ») — titre « AU COMMENCEMENT ». Médaillon de l'apôtre à partir d'ici.
04   — 04.mp4 puis 04b.mp4 : la création (« Dieu créa les cieux et la terre », « la lumière, le ciel, la mer »).
05   — 05.mp4 puis 05b.mp4 : les animaux (« les animaux »).
06   — 06.mp4 : la poussière dorée (« forma l'homme de la poussière »).
07   — 07.mp4 puis 07b.mp4 : Adam s'éveille (« souffle de vie ») puis se lève et découvre le monde (« Cet homme, c'est Adam »).
08   — 08.mp4 puis 08b.mp4 : le jardin (« planta un jardin en Éden ») puis Adam parmi les animaux (« animaux qui vivent en paix »).
09   — 09a.mp4 : Ève apparaît dans la lumière (« Dieu crée la femme, Ève ») ; 09.mp4 : ils marchent ensemble (« ils marchaient avec lui »).
10   — 10.mp4 puis 10b.mp4 : la règle (« une seule règle », « tu ne mangeras pas »).
11   — 11.mp4 (« quelqu'un s'approche d'Ève ») ; 11c.mp4 visage d'Ève qui doute (« un doute ») ; 11b.mp4 yeux du serpent (« Puis il ment »).
12-14 — 12.mp4 (« La femme vit »), 13.mp4 (« et en mangea »), 14.mp4 (« elle en donna aussi à son mari »).
PENSÉE — rembobinage (image qui recule en accéléré, lignes de vitesse, son rembobinage) sur « Revenons en arrière », puis 12.mp4 au ralenti sur « La femme vit que l'arbre était bon ». Titre « LE PÉCHÉ COMMENCE DANS LA PENSÉE ».
15   — 15.mp4 (« tout bascule ») puis 15b.mp4 (« ayant cousu des feuilles de figuier », « ils ont honte »).
16   — 16.mp4 : la cachette (« ils se cachent »).
17   — 17.mp4 : la lumière de Dieu traverse le jardin (« Mais Dieu vient les chercher ») ; « Où es-tu ? » avec écho léger sur la voix et titre « OÙ ES-TU ? » ; fin de 16.mp4 (Adam sort) sur « l'appel d'un Père ».
18   — 18b.mp4 Adam accuse (« La femme que tu as mise auprès de moi ») ; 18c.mp4 Ève accuse (« Le serpent m'a séduite ») ; 18.mp4 plan large (« Personne ne dit : C'est moi ») ; titre « C'EST SA FAUTE ! ».
19   — 19b.mp4 la douleur (« la douleur ») ; 19.mp4 le travail (« le travail pénible ») ; 19c.mp4 la fleur qui se fane (« et la mort », « tu retourneras dans la poussière »).
20   — 20.mp4 puis 20b.mp4 : l'expulsion et l'épée de feu (« chassés du jardin », « des chérubins »).
21   — 21.mp4 : les générations (« ce péché ne s'est pas arrêté à eux », Romains 5:12).
22   — 22a.mp4 Adam et Ève grelottent dans leurs feuilles abîmées (« cela n'a pas suffi ») ; 22b.mp4 l'agneau marche dans la lumière (« Dieu lui-même a trouvé la solution ») ; 22c.mp4 l'agneau sur l'autel de pierres (« un animal a dû mourir ») ; 22d.mp4 gros plan, le sang (« Le premier sang versé ») ; 22e.mp4 la lumière les habille de peaux (« habits de peau » — si la phrase arrive avant dans la voix, place 22e sur la lecture de Genèse 3:21) ; 22f.mp4 ils lèvent les yeux, reconnaissants (« c'est là que commence l'histoire du pardon »). Titre « DIEU LUI-MÊME A TROUVÉ LA SOLUTION ».
     Ordre réel : cale-toi sur la voix. Le verset Genèse 3:21 est lu avant l'explication : montre 22e (peaux) sur le verset, puis pendant l'explication 22a (« Eux l'avaient fait premièrement… »), 22b, 22c, 22d, et reviens sur 22f à la fin. 22a n'est utilisé que comme RETOUR EN ARRIÈRE, avec un léger filtre sépia et un cadre « souvenir », pour que la continuité reste claire.
R623 — carte ROMAINS 6:23 en grand, sur 22f flouté.
23   — 23.mp4 : l'apôtre, fin (« Dans le prochain épisode… Vous êtes infiniment bénis ») — en grand.
FIN  — « À SUIVRE : ÉPISODE 2 — LE SANG DES SACRIFICES » (3 s), puis l'ouverture MIDIGRAD en fermeture (logo + « EUD — CONSISTOIRE MIDIGRAD », 5 s), fondu au noir.

4. FORMATS (clips horizontaux : ne jamais recadrer en vertical)
a) TikTok 1080×1920 : clip pleine largeur (1080×608) au centre ; au-dessus et en dessous, le même clip agrandi, flou fort, assombri de 35 % ; fin trait doré. Haut : étiquette « ÉPISODE 1 · AU COMMENCEMENT » + sous-titres (2 lignes). Bas : grand médaillon de l'apôtre (point 5).
b) YouTube 1920×1080 : clip plein écran, sous-titres en bas, médaillon en bas à gauche.

5. L'APÔTRE QUI PARLE
- Banque : clips/02-parle-a.mp4, 02-parle-b.mp4, 02-parle-c.mp4 (bouche qui parle), clips/02-silence.mp4 (bouche fermée). Son d'origine supprimé.
- Détecte les moments de parole et les pauses dans audio/ep1.mp3 (énergie + horodatage ; pause = silence > 0,35 s).
- Parole → un clip « parle » ; changement de clip à chaque phrase (a, b, c en alternance), en démarrant à un endroit différent à chaque fois ; ton grave → de préférence c. Pause et longues cartes de versets → 02-silence. Fondu de 3 images entre clips ; changement exactement au début et à la fin de la parole (±2 images).
- Médaillon : rond, double bord noir et doré, étiquette « APÔTRE PARIS TALLA » ; 460 px sur TikTok, 380 px sur YouTube ; recadré sur le visage et le haut du buste.
- Plans 01 et 23 en grand : leur son d'origine est supprimé, la vraie voix joue par-dessus.

6. CORRECTION DES ERREURS DE GÉNÉRATION
- Examine chaque clip image par image (OpenCV + contrôle visuel sur des captures) : mains ou doigts déformés, visages qui changent, membres en trop, objets qui apparaissent ou disparaissent, texte ou filigrane, saut brusque, couleur qui change.
- Corrige : couper la partie fautive ; recadrer/zoomer pour la sortir du cadre ; flou local ou masque animé sur la zone ; ralenti ou image figée avec zoom lent pour masquer un saut ; étalonnage pour harmoniser les couleurs entre clips.
- Sang (22c, 22d) : flou local fort et animé qui suit la tache, en permanence.
- Donne-moi la liste de chaque erreur trouvée et de la correction appliquée.

7. RYTHME ET ANIMATION
- Plans de 2 à 4 s. Sur chaque clip, ajoute un mouvement de caméra virtuel (zoom lent, glissement, petit recadrage serré sur l'action).
- Effets par-dessus : poussière dorée et rayons (création, Dieu, habits de peau), feuilles qui volent et pluie légère (chute), lueur de feu qui vacille (épée), léger tremblement sur le tonnerre.
- Étalonnage : chaud et lumineux en Éden, froid et gris après la chute, doré à la fin.
- Cartes de versets : plein écran sur le clip en cours flouté, parchemin, référence en haut, 4 à 6 s, son parchemin. Titres à l'écran : jaune, gros contour noir, petit rebond.

8. SON
- Voix : audio/ep1.mp3 seule, jamais modifiée sauf l'écho sur « Où es-tu ? ». Si tu entends deux voix différentes dans le fichier, arrête-toi et signale-le-moi.
- Bruitages (audio/sons/) : logo-reveal (ouverture et fin MIDIGRAD) · ambiance-ville (01, 23) · magie-lumiere (03, lumière de Dieu, 22e) · vagues, vent-doux (04) · lion, elephant, oiseaux-foret (05, 08b) · souffle (06) · oiseaux-foret + cascade + vent-doux (Éden) · pas-herbe (07b, 09) · serpent (11, 11b) · croquer (13, 14) · rembobinage · vent-fort, tonnerre, feuilles, pluie (15, 15b, 16) · silence presque total avant « Où es-tu ? » · travail-terre (19) · feu, ailes (20, 20b) · foule (21) · agneau (22b) · coeur (22c, très doux) · parchemin (cartes) · whoosh (transitions).
- Niveaux : ambiances -30 à -26 LUFS, bruits -22 LUFS, musique -22 LUFS, toujours sous la voix (sidechaincompress). Final -14 LUFS, pic -1 dB. Son manquant : le signaler, ne pas le fabriquer.

9. SORTIES
- episode-1-tiktok.mp4 (1080×1920) et episode-1-youtube.mp4 (1920×1080), H.264 CRF 18, yuv420p, 30 fps, AAC 192 kb/s, +faststart.
- episode-1.srt et chapitres.txt (Introduction, La création, Le jardin d'Éden, Le serpent, Le péché commence dans la pensée, Où es-tu ?, Les conséquences, Le sacrifice et les habits de peau, Conclusion).
- 3 extraits TikTok de 45 à 60 s (le serpent et le fruit ; « Où es-tu ? » et l'accusation ; le sacrifice et les habits de peau), avec l'ouverture MIDIGRAD courte (2 s) et « ÉPISODE COMPLET SUR NOTRE PAGE » à la fin.
- GitHub refuse les fichiers de plus de 100 Mo : ne pousse pas les vidéos trop lourdes, garde-les en local et dis-moi où elles sont.

10. VALIDATION (dans l'ordre)
1) Inventaire des clips (présents, manquants, durée, défauts vus). 2) La feuille de montage. 3) La liste des erreurs corrigées. 4) Un extrait TikTok de 30 s (de « Mais un jour, quelqu'un s'approche d'Ève » à la bouchée) pour valider synchronisation, médaillon qui parle et son. 5) Après mon accord : toutes les sorties.
```
