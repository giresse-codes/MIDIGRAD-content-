# Prompt Claude Code — « Le pardon divin », épisode 1 (version 3)

À coller dans Claude Code : « Récupère le dépôt giresse-codes/midigrad-content-, branche `serie-pardon-divin-episode-1`. Lis STYLE.md, texte-voixoff.txt et PROMPT-EPISODE-1.md (v3) en entier, et exécute PROMPT-EPISODE-1.md. »

La v3 reprend la v2 et y intègre toutes les modifications demandées après les retours des pasteurs. En cas de contradiction, c'est la v3 qui compte.

```
VIDÉO « Le pardon divin » — ÉPISODE 1 : AU COMMENCEMENT — VERSION 3.
Chaque point doit être réellement appliqué et vérifié : ne rien cocher sans l'avoir contrôlé.

0. RÉCEPTION DES FICHIERS
- Les clips, sons et voix off arrivent en plusieurs messages (20 fichiers max par message). Ne rien commencer avant « TOUT EST ENVOYÉ ». Après chaque message : répondre seulement par la liste des fichiers reçus.
- Clips (.mp4, ou .png pour un plan refusé par Veo) → clips/ ; sons → sons/ (noms de la section 8) ; voix off de l'apôtre Paris Talla → audio/ep1.mp3.
- Les clips Gemini/Veo arrivent sous des noms génériques : les identifier à l'image, proposer la correspondance, puis renommer (01.mp4, 02-parle-a.mp4…).
- Fichier > 95 Mo : recompresser (H.264 CRF 20, même résolution). Commit puis : git -c push.negotiate=true push
- Aucun fichier de l'ancien narrateur Wilfried n'est utilisé ni gardé dans le dépôt.
- Outils : FFmpeg, Python 3 (faster-whisper large-v3, OpenCV, NumPy, Pillow). Polices : Nunito Black (sous-titres), Cinzel (références), EB Garamond (versets).

1. INVENTAIRE (le montrer, puis attendre l'OK)
Tableau : nom / présent ou manquant / durée / résolution / son présent ou non.
Clips attendus : 01, 02-parle-a, 02-parle-b, 02-parle-c (facultatif), 02-silence, 03 à 10, 04b, 05b, 06b (remplace 06), 07b, 08b, 09a, 10b, 11, 11b, 11c, 12 à 16, 15b, 17, 18, 18b, 18c, 19, 19b, 19c, 20, 20b, 21, 22a, 22b, 22c, 22c2, 22d, 22e, 22f, 23.
- Plan livré en .png : l'animer (zoom lent 1,00 → 1,08, léger panoramique, particules de lumière dorée, léger flou de profondeur), même étalonnage que les clips voisins.
- Clip ou son manquant : le signaler et proposer une solution ; ne rien inventer sans accord.
État après la v3 : 11, 20b et 23 n'ont pas été livrés → replis utilisés (11b sur « quelqu'un s'approche d'Ève » ; plan serré tiré du 20 sur l'épée ; l'Apôtre en grand avec 02-parle-a/b pour la fin).

2. CONTRÔLE DE CHAQUE CLIP (montrer la liste, puis attendre l'OK)
Extraire 3 images par clip (début, milieu, fin), les regarder toutes, plus une image par seconde sur les clips douteux, et une détection automatique des sauts d'image.
- Adam et Ève : visages africains, peau brun foncé ; Adam cheveux courts crépus, barbe courte ; Ève cheveux crépus volumineux avec sa fleur. Référence : clips 09 et 15. Peau claire, cheveux longs et lisses ou autre visage → REJETÉ, le dire, ne pas l'utiliser.
- Tenues : tuniques claires avant la chute, feuilles après, habits de peau après Genèse 3:21. Aucune feuille après les peaux, sauf flash-back sépia clairement marqué.
- Pudeur : aucun corps insuffisamment couvert ; recadrer, sinon signaler.
- Erreurs de génération (mains, doigts, visages qui fondent, objets qui apparaissent/disparaissent, texte, filigrane) : couper, recadrer, masquer, ralentir ou remplacer.
- Son d'origine de Veo : toujours coupé.
Décisions de la v3 (fenêtres utilisées) : 06 rejeté (visage européen) → 06b ; ancien 11 rejeté (ancien style, peau claire) → clips/rejetes/ ; 04b seulement 6–10 s (station spatiale et lumières de villes avant) ; 09a seulement 0–3,5 s (Ève plus claire et sans fleur ensuite) ; 11c 0–8 s (2e fleur à la fin) ; 14 0–7,4 s ; 15b 0–3,8 s et 5,2–10 s ; 16 0–2 s puis 7–10 s recadré sur Adam (Ève rétrécit) ; 18 0–3 s et 7,6–10 s (serpent vert au milieu) ; 18b 0,5–10 s recadré à droite (cheveux lisses au bord gauche) ; 19 1,5–6,5 s (cuisse découverte au début, visage qui change à la fin) ; 20 0–8,2 s (saut à 8,5 s) ; 22a 4–10 s (cadre serré) ; 22e 3–6 s ; 01 utilisé 1,5 s sans voix (il sourit sans parler).

3. TRANSCRIPTION ET FEUILLE DE MONTAGE (la montrer, puis attendre l'OK)
- Transcrire la voix au mot près (faster-whisper large-v3, français, horodatage par mot). Aligner sur texte-voixoff.txt : sous-titres = ce qui est dit, orthographe et ponctuation du texte (guillemets, ?, !, : gardés). Versets = Louis Segond 1910 mot pour mot.
- Vérifier que la voix ne contient ni répétition ni coupure. (v3 : la phrase « Alors, installez-vous bien. Remontons… au tout commencement » était dite deux fois ; la première occurrence, de 21,0 à 26,3 s, est retirée avec des fondus de 15 ms dans les silences. Rien d'autre n'est modifié.)
- Tableau : temps / phrase / plan / effet / son. Chaque réaction, geste ou changement de plan tombe SUR le mot (±3 images), jamais après.
Ordre des plans :
OUV — logo-midigrad.png révélé en lumière dorée (son logo-reveal), puis « EUD — CONSISTOIRE MIDIGRAD » et « présente » (5 s).
ACC — 12, 13 (croquer), 11b (serpent), plan serré du 20 (feu) ; texte « ÈVE A-T-ELLE VRAIMENT PÉCHÉ EN MANGEANT LE FRUIT ? » puis « LE PARDON DIVIN » (5 s, sans voix).
01 — l'Apôtre arrive (1,5 s, sans voix, ambiance-ville). L'ancien plan de salutation au geste robotique n'est plus utilisé.
L'APÔTRE PARLE — en grand pendant l'introduction (cadrages large / moyen / serré qui alternent toutes les ~3,5 s), puis dans le médaillon pendant l'histoire, et de nouveau en grand sur ses commentaires (« Beaucoup d'entre vous… », « C'est un père… », « Bien-aimés, depuis ce jour… », « La Bible dit aussi… », « On constate ici… ») et pour la fin (« Dans le prochain épisode… »).
03 « Remontons… au tout commencement » (titre AU COMMENCEMENT) ; 04 « Au commencement, Dieu créa » ; 04b « avant les étoiles » ; 04 « la lumière, le ciel » ; 05 « les animaux » ; 05b « Puis Dieu a fait » ; 06b « forma l'homme », « il souffla » ; 07 « devint un être vivant » ; 07b « Cet homme, c'est Adam » ; 08 « planta un jardin » ; 08b « des animaux qui vivent en paix » ; 08 « deux arbres » ; 07b « Mais Dieu voit » ; 09a « crée la femme » ; 09 « Dieu vit tout », « ils marchaient avec lui » ; 10 « une seule règle » ; 10b « tu ne mangeras pas » ; 11b « quelqu'un s'approche d'Ève », « Le serpent était le plus rusé » ; 11c « Dieu a-t-il réellement dit », « un doute » ; 11b « Puis il ment » ; 11c « vos yeux s'ouvriront » ; 12 « Ève regarde l'arbre » ; 13 « elle prit de son fruit » ; 14 « elle en donna aussi ».
PENSÉE — rembobinage conservé (images qui reculent en accéléré, lignes de vitesse, son rembobinage) sur « Revenons en arrière » ; 11b/11c « Après que le serpent… des bienfaits du fruit » ; 12 au ralenti sur « La femme vit que l'arbre était bon » (titre LE PÉCHÉ COMMENCE DANS LA PENSÉE).
15 « tout bascule » ; 15b « ayant cousu » ; 15 « ils ont honte » ; 15b « ils ont peur » ; 16 « ils se cachent » ; 17 « Mais Dieu vient les chercher », « Où es-tu ? » (écho léger, titre OÙ ES-TU ?) ; 16 fin recadrée « Dieu savait très bien ».
18b « La femme que tu as mise » ; 18c « Le serpent m'a séduite » ; 18 « Adam accuse Ève » (titre C'EST SA FAUTE !) ; 18 fin « Personne ne dit ».
19b « la douleur » ; 19 « le travail pénible » ; 19c « et la mort » ; 20 « chassés du jardin » ; 20b « des chérubins » ; 21 « ce péché ne s'est pas arrêté » (Romains 5:12).
Genèse 3:21 : carte sur 17 (lumière, aucun personnage) : ni feuilles ni peaux pendant le verset.
22 — LE SACRIFICE, dans cet ordre : 22a « Eux l'avaient fait premièrement » ; 22b « Dieu lui-même a trouvé la solution » (titre) ; 22a « Leurs feuilles ne suffisaient pas » ; alternance 22c (l'agneau sur l'autel) / 22c2 (Adam et Ève bouleversés) sur « un animal a dû mourir » ; 22d « Le premier sang versé » ; 22e « Retenez bien ça » (habits de peau) ; 22f « c'est là que commence l'histoire du pardon » ; puis R623 (Romains 6:23) sur 22f flouté. L'agneau est montré, le sang toujours flouté (masque automatique sur le rouge, flou fort et désaturé, à chaque image).
23 — l'Apôtre en grand (fin).
FIN — « À SUIVRE : ÉPISODE 2 — LE SANG DES SACRIFICES » (3 s), puis fermeture MIDIGRAD (logo + « EUD — CONSISTOIRE MIDIGRAD », 5 s), fondu au noir.

4. FORMATS (clips horizontaux : jamais recadrés en vertical)
a) TikTok 1080×1920 : clip centré pleine largeur (1080×608) ; bandes du haut et du bas = même image agrandie, floue et assombrie (-35 %) ; fin trait doré. Haut : « ÉPISODE 1 · AU COMMENCEMENT » + sous-titres (2 lignes). Bas : médaillon de l'Apôtre 460 px.
b) YouTube 1920×1080 : clip plein écran, sous-titres en bas, médaillon 380 px en bas à gauche.
c) H.264 CRF 18, yuv420p, 30 fps, AAC 192 kb/s, +faststart.

5. L'APÔTRE QUI PARLE
- Banque : 02-parle-a, 02-parle-b, 02-parle-c s'il existe (bouche qui parle), 02-silence (bouche fermée). Son d'origine supprimé.
- Détection d'activité vocale sur la voix (énergie, fenêtres de 10 ms). Pause > 0,35 s → 02-silence ; retour à la parole dès que la voix reprend. Pendant la parole : alternance a / b (/ c), chaque reprise démarre à un point différent du clip (aléatoire), fondu de 3 images à chaque raccord.
- La bouche ne bouge jamais pendant un silence et n'est jamais fermée pendant la parole (±3 images). Les 2 dernières secondes de 02-parle-b (bouche souvent fermée) ne sont pas utilisées.
- Médaillon rond, double bord noir et doré, étiquette « APÔTRE PARIS TALLA », recadré sur le visage et le haut du buste ; masqué quand l'Apôtre est en grand et pendant les cartes de versets.

6. RYTHME ET ANIMATION (fin de l'effet « livre qu'on feuillette »)
- Plans de 2 à 4 s (plus courts seulement quand la synchronisation l'impose : énumérations, accroche), jamais d'image figée : un plan trop court dans sa source est ralenti (minimum ×0,45), jamais arrêté.
- Mouvement de caméra sur chaque plan (zoom avant, zoom arrière, panoramique gauche/droite, vertical, diagonale), le sens change d'un plan à l'autre.
- Transitions variées : fondu, fondu enchaîné lumineux (moments divins), raccord dans le mouvement. La transition commence 3 images avant le mot.
- Particules de lumière dorée et poussière dans les scènes du jardin ; feuilles qui volent et pluie après la chute ; lueur du feu sur l'épée ; léger tremblement sur le tonnerre.
- Étalonnage : chaud en Éden, froid et gris après la chute, nuit bleutée pour la cachette, doré pour les habits de peau.
- Cartes de versets : parchemin, référence en haut, 4 à 6 s, sur le plan en cours flouté, avec un lent zoom (jamais figées).

7. CORRECTION DES ERREURS DE GÉNÉRATION
Voir la section 2 (fenêtres utilisées) ; toute nouvelle erreur trouvée en revue finale est corrigée avant livraison.

8. SON
- Une seule voix, la même du début à la fin. Vérifier que l'introduction n'est ni plus grave ni différente du reste (volume, timbre, hauteur). v3 : même volume (-18,5 dB contre -18,4 dB en moyenne) ; hauteur médiane de l'intro 130 Hz, donc pas plus grave (97 à 118 Hz pour le reste) ; timbre un peu plus sourd (centroïde 1 377 Hz contre 1 520 à 1 660 Hz) → plateau aigu +1,5 dB à 3,2 kHz sur les 25,3 premières secondes, hauteur inchangée.
- Effet sur la voix seulement sur « Où es-tu ? » (écho léger : +280 ms et +560 ms).
- Bruitages (sons/) : logo-reveal (ouverture et fermeture) · ambiance-ville (01, 23) · magie-lumiere (03, lumière de Dieu, 09a, 12, 22e) · vagues, vent-doux (création) · lion, elephant (très bas et brefs, ce sont des sons agressifs) · souffle (06b) · oiseaux-foret + cascade (Éden) · pas-herbe (07b, 09) · serpent (11b, 18c) · croquer (13, 14) · rembobinage · tonnerre, vent-fort, pluie, feuilles (15 à 16) · silence presque total avant « Où es-tu ? » · travail-terre (19) · feu, feu-epee, ailes (20, 20b) · foule (21) · agneau (22b) · coeur (22c, 22d, très doux) · parchemin (cartes) · whoosh (transitions lumineuses) · musique = soft piano, en boucle.
- Niveaux : ambiances -32 à -28 LUFS, bruits ponctuels -27 à -20, musique -26, toujours sous la voix ; baisse automatique (sidechaincompress) de tous les sons et de la musique sous la voix. Final -14 LUFS, crête -1 dBTP max.

9. SORTIES
- episode1-tiktok.mp4 (1080×1920) et episode1-youtube.mp4 (1920×1080).
- episode1.srt et chapitres.txt (Introduction, La création, Le jardin d'Éden, Le serpent, Le péché commence dans la pensée, Où es-tu ?, Les conséquences, Le sacrifice et les habits de peau, Conclusion).
- 3 extraits TikTok de 45 à 60 s (le serpent et le fruit ; « Où es-tu ? » et l'accusation ; le sacrifice et les habits de peau), avec l'ouverture MIDIGRAD courte (2 s) au début et « ÉPISODE COMPLET SUR NOTRE PAGE » à la fin.
- GitHub refuse les fichiers > 100 Mo : ne pas pousser les vidéos trop lourdes, les livrer directement.

10. VALIDATION
1) Inventaire. 2) Contrôle des clips. 3) Feuille de montage. 4) Extrait TikTok de 30 s (ouverture MIDIGRAD, l'Apôtre qui parle avec au moins une pause, un passage de la séquence 22). 5) Rendu complet. Chaque étape attend l'OK, sauf si on demande expressément le rendu final directement.

11. REVUE FINALE OBLIGATOIRE (avant livraison)
Revoir tout le rendu (une image toutes les 2 s + chaque raccord) et remplir, avec oui/non et la preuve (horodatage) :
[ ] Ouverture et fermeture MIDIGRAD présentes
[ ] L'Apôtre parle : bouche synchronisée avec la voix, médaillon agrandi
[ ] Réactions sur le mot (±3 images)
[ ] Adam et Ève identiques partout (peau brun foncé, mêmes visages)
[ ] Continuité tuniques → feuilles → peaux respectée
[ ] Pudeur respectée sur tous les plans
[ ] Agneau montré, sang flouté
[ ] Aucune erreur de génération visible
[ ] Aucune image figée plus de 4 s
[ ] Voix identique du début à la fin, -14 LUFS
[ ] Sous-titres sans faute, versets en Louis Segond 1910
Une case « non » → corriger et refaire la revue avant de livrer.
```
