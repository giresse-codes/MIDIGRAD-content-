# Le Débat · Ép. 2 — « Demander pardon à Dieu ? » (Dave & Marie, 9:16)

Même style, personnages et moteur que l'épisode 1 (`videos/debat-pardon-dave-marie/`). 1080×1920, 30 i/s.

- Intro 0–10 s : clip de l'apôtre Paris Talla (4:3, non recadré) dans un cadre de téléphone, son du clip avec fondu sur 0,5 s ;
  la voix off `voixoff-episode2.wav` démarre à 10 s. Mixage → `assets/dialogue.wav`, clip muet bouclé → `assets/clips/apotre.mp4` (non versionnés).
- `timings-episode2.json` **n'a pas été fourni** : les 21 répliques ont été relevées sur la voix off (Whisper + zones de parole,
  `src/regions.json`), puis réparties mot à mot au prorata de la longueur des mots (`src/build_data.py` → `assets/data.js`).
- `assets/debat.js` : bulles karaoké, carte rouge « DEMANDER PARDON ? », versets, carte comparative Adam/Christ (bascule, réplique 16),
  tremblement « Wooh », fumée + joues rouges (18), départ de Marie (21), « À SUIVRE… », écran de fin.
- Logo : `assets/logo.png` (logo MIDIGRAD fourni).

## À vérifier
- Réplique 03 : « Alors, tu as parlé à Jorvis hier ? » — Whisper entend « Jorvissière » ; « hier » est une déduction.
- Cartes versets en LSG : 1 Pierre 3:18 (partie lue), Romains 8:3, Romains 5:16 (partie lue). Romains 5:18 est résumé par la carte comparative demandée.
- Réplique 13 : « le message que prêche l'apôtre Paris Talla » (Whisper : « la porte par Estala »).
