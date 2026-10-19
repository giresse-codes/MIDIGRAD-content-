# CLAUDE.md — Contexte pour l'assistant

## Qui est MIDIGRAD
**MIDIGRAD** — Mission de la Dispensation de la Grâce de Dieu (*Grace of God Dispensation Mission*),
communauté chrétienne basée au **Cameroun**, conduite par l'**Apôtre Paris Talla**.
Mission : « Vivre, prêcher la grâce et l'amour inconditionnels de Dieu manifestés en Jésus-Christ. »
Ce dépôt est l'espace de communication (visuels, motion design, vidéos, planning),
géré par Giresse, responsable publicité et création de contenu.

**Langues :** français en priorité, anglais en second.

## Charte (résumé — détail dans `brand/charte.md`)
- Bleu ciel `#23BDED` (dominante) · Bleu royal `#2E3192` (titres) · Rouge `#E1251B` (accent) · Or `#F7941D` (lumière, motion).
- Règle 60-30-10 : 60 % bleu ciel/blanc, 30 % bleu royal, 10 % rouge et or.
- Titres : Montserrat ExtraBold ou Anton. Texte : Poppins ou Open Sans.
- Logo : complète / horizontale / icône (globe + croix).
- Slogan du logo : coquille « MANISFESTE » → « MANIFESTÉ », correction en attente de validation de l'Apôtre.

## Formats par plateforme
| Plateforme | Format | Dimensions |
|---|---|---|
| TikTok, Reels, Shorts, stories | 9:16 vertical | 1080×1920 |
| YouTube (vidéo longue) | 16:9 | 1920×1080 ; miniature 1280×720 |
| Instagram (fil) | 1:1 ou 4:5 (préféré) | 1080×1080 / 1080×1350 |
| Facebook | 4:5 pour le fil, 16:9 pour la vidéo, 1200×630 pour les liens/événements | — |

## Nommage
`AAAA-MM-JJ_type_titre` — minuscules, sans accents, mots séparés par des tirets.
Exemple : `2026-10-18_verset_la-grace-suffit.png`, `2026-10-18_extrait_marcher-par-la-foi.mp4`.
Types : `verset`, `citation`, `extrait`, `predication`, `annonce`, `recap`, `motion`, `miniature`, `script`.

## Ton
Respectueux, chaleureux, centré sur la grâce et l'amour de Dieu. Pas de condamnation,
pas de sensationnalisme, pas de polémique. Inviter plutôt qu'imposer.

## Règle absolue
**Ne jamais publier ni modifier une citation biblique ou une parole de l'Apôtre Paris Talla
sans vérification.** Les versets sont recopiés à l'identique depuis la version indiquée
(LSG par défaut) ; les paroles de l'Apôtre sont transcrites mot pour mot depuis l'enregistrement.
En cas de doute, signaler et demander plutôt que reformuler.

## Leçons de production (vidéo / HyperFrames, session cloud)
- **Style validé par la direction :** motion design façon « widgets iOS en 3D » (référence troiscoups.fr).
  Il faut une caméra toujours en mouvement et un titre animé mot par mot. Un montage trop simple (fond seul + sous-titres) a été refusé.
- **Livrables :** fichiers **< 30 Mo** directement téléchargeables. N'envoyer ni test audio ni test image : seulement la version finale.
- **Réseau :** Hugging Face, jsdelivr, les banques d'images et les CDN de modèles sont **bloqués**. Ne pas réessayer.
  Ce qui passe : `github.com/.../releases/download/...` (modèles sherpa-onnx : Whisper, VAD Silero, séparation UVR), npm et PyPI.
- **Transcription :** sherpa-onnx + Whisper medium int8, fenêtres de moins de 30 s coupées sur les pauses.
- **Retirer la musique de fond :** sherpa-onnx `OfflineSourceSeparation` + `UVR-MDX-NET-Voc_FT.onnx` (stem 0 = voix).
- **Rendu :** le Chrome de HyperFrames n'a pas de WebGL. Faire du CSS 3D + GSAP, ou pré-calculer en vidéo avec Playwright (`/opt/pw-browsers`).
- **Audio source (messages WhatsApp) :** vérifier la **saturation** avant tout (échantillons à 1.0). Chaîne qui marche :
  `volume=-8dB, adeclip, adeclick, highpass 90 Hz, arnndn (rnnoise, mix 0.75), EQ, deesser, adeclick, compresseur doux 3:1`, puis loudnorm −16 LUFS en deux passes.
  **Pas de craquement de vinyle** : il a été perçu comme du bruit.
- **SFX :** à synthétiser localement (numpy). Chaque `<audio>` a son propre `id` et sa piste (`data-track-index`).

## Formats adoptés
- **Prédication YouTube (16:9)** : `videos/meditation-promesse-v4/`. Plans orateur aux cadrages changeants, écrans d'animation contextuels avec médaillon, sous-titres.
- **MIDIGRAD Podcast (4:3)** : `videos/podcast-midigrad-croquis/` (croquis adopté le 18/10/2026, à améliorer plus tard).
  Intro avec le logo, « MIDIGRAD » ondulant en haut à droite, platine qui tourne à droite, illustration qui change toutes les 15 s à gauche, paroles mot à mot en bas.

## Organisation
`brand/` identité · `templates/` gabarits · `motion/` animations · `videos/` scripts, sous-titres, montage ·
`contenus/` de la prédication aux publications · `planning/` calendrier éditorial.
Les gros fichiers (rushs, rendus) restent sur le Drive ; on note le lien dans le dépôt.
