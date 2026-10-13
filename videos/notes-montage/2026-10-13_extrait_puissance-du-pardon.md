# Note de montage : extrait « La puissance du pardon »

- **Source :** `VID-20261012-WA0051.mp3` (5 min 46 s, voix de l'Apôtre Paris Talla)
- **Extrait :** de 0:00,6 à 1:06,99 dans la source, soit 66,4 s de voix, suivies d'une carte de fin de 3,6 s. Durée totale : **70 s**.
- **Format :** TikTok / Reels / Shorts, 9:16, 1080×1920, 30 i/s
- **Projet :** `videos/meditation-puissance-du-pardon/` (HyperFrames)
- **Sous-titres :** `videos/sous-titres/2026-10-13_extrait_puissance-du-pardon.srt`
- **Statut :** ⏳ **À valider** (texte des sous-titres + rendu)

## Traitement audio (voix seule, aucun son ajouté)
Passe-haut 85 Hz (grondement) → réduction de bruit RNNoise et FFT → égalisation de la voix
(−2 dB à 220 Hz, +2,5 dB à 3,2 kHz, −1,5 dB à 7 kHz) → compression douce 3:1 →
normalisation en deux passes à **−14 LUFS**, crête à −3,5 dBFS. Le volume visé est celui de TikTok, Instagram et YouTube.

## Déroulé visuel (« style vie réelle », ciel et paysage générés)
| Temps | Parole | Image |
|---|---|---|
| 0–10 s | Accueil, thème | Aube calme sur un lac, soleil bas |
| 8,3–11 s | « la puissance du pardon » | Titre « LA PUISSANCE DU PARDON » |
| 10,7–34 s | « Imaginez l'instant… On t'a offensé… blessé… » | L'orage se lève, pluie, deux éclairs discrets |
| 34–55 s | « Mais souviens-toi, bien-aimé… » | La pluie faiblit, le ciel reste couvert |
| 55–66 s | Colossiens 3:13 | Les nuages s'ouvrent, rayons dorés, une croix apparaît sur la colline |
| 66–70 s | (fin de la voix) | Logo MIDIGRAD, « Mission de la Dispensation de la Grâce de Dieu » |

La signature « MÉDITATION · par l'Apôtre PARIS TALLA » reste en bas pendant toute la parole.

## ⚠️ À vérifier avant publication (règle absolue de CLAUDE.md)
La transcription a été faite automatiquement (Whisper). Une écoute humaine est nécessaire, en particulier pour :
1. **0:01–0:04** : le mot qui suit « Bienvenue à ce moment de méditation » est **inaudible pour la machine**
   (entendu « Féthilesta » / « et pilestas »). Il est remplacé par « … » dans les sous-titres. Merci de me donner le mot exact.
2. **« c'est les autres » / « ce sont les autres »** (3 occurrences, 0:21 à 0:33) : les deux passes de transcription ne sont pas d'accord.
3. **« les gens de t'offenser »** (0:39) : forme reprise de la suite de la prédication, à confirmer.
4. **« des actes, des paroles de ton prochain »** (0:49) : la machine a entendu « des artes ».
5. **Colossiens 3:13** : l'Apôtre cite le verset de mémoire. Le sous-titre reprend **ses mots**, pas le texte LSG. Pour mémoire, LSG :
   « Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement.
   De même que Christ vous a pardonné, pardonnez-vous aussi. »

Après validation, corriger le tableau `CAPS` dans `videos/meditation-puissance-du-pardon/index.html`
(et le `.srt`), puis relancer le rendu.
