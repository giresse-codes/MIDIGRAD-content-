# Note de montage : « La puissance du pardon » v2 (style motion design « widgets 3D »)

- **Projet :** `videos/meditation-pardon-v2/` (HyperFrames)
- **Référence de style :** vidéo troiscoups.fr fournie par Giresse. Cartes et widgets façon iOS
  flottant en 3D, caméra toujours en mouvement, titre animé mot par mot avec un mot-clé en couleur,
  transitions par flou, signature finale.
- **Format :** 9:16, 1080×1920, 30 i/s, **3 min 06 s**
- **Sous-titres :** `videos/sous-titres/2026-10-13_predication_puissance-du-pardon-v2.srt`
- **Statut :** ⏳ À valider

## Montage de l'audio (source `VID-20261012-WA0051.mp3`, 5:46)
| Partie | Source | Contenu |
|---|---|---|
| Extrait 1 | 0:00,6 → 1:06,99 | Accueil, « la puissance du pardon », Colossiens 3:13 |
| *(coupe)* | 1:07 → 1:33,6 | Retirée : elle répète l'idée « tu ne peux empêcher les offenses » |
| Extrait 2 | 1:33,6 → 3:28,2 | « Alors c'est pour cela que la Bible nous parle de pardonner… » → Joseph → « …mensonges sur toi. » |

La jonction se fait sur « …comme Christ vous a pardonné. » suivi de « Alors c'est pour cela que la Bible nous parle de pardonner », qui s'enchaîne naturellement.

## Traitement de la voix
1. **Musique de fond retirée** avec un modèle de séparation voix/instruments (UVR-MDX-NET Voc_FT).
   Pendant les silences, le fond passe de −43 dB à −51 dB. La voix n'est pas déformée.
2. Passe-haut 80 Hz, débruitage léger, égalisation de la voix, compression douce 2,5:1.
3. Normalisation à **−14 LUFS** (crête −1,4 dBFS).

## Effets sonores (fabriqués localement, aucun crédit consommé)
Whoosh à chaque changement de scène, « pop » sur les étiquettes, notifications sur les messages,
tonnerre et pluie pendant « On t'a offensé / blessé », montée et impact doux sur les titres,
tourne-page sur les cartes Bible, scintillement sur les versets, clic sur le bouton « Pardonner »,
nappe douce à la fin. Tous sont mixés nettement sous la voix.

## Versets affichés (texte Louis Segond 1910, à vérifier)
- **Colossiens 3:13** : « Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement. De même que Christ vous a pardonné, pardonnez-vous aussi. »
- **Proverbes 27:19** : « Comme dans l'eau le visage répond au visage, ainsi le cœur de l'homme répond au cœur de l'homme. »
- **Matthieu 7:3** : « Pourquoi vois-tu la paille qui est dans l'œil de ton frère, et n'aperçois-tu pas la poutre qui est dans ton œil ? »
- Joseph : seule la référence « Genèse 37 – 50 » est affichée, sans citation.

Les **sous-titres** reprennent les mots de l'Apôtre (ses citations de mémoire), pas le texte LSG.

## ⚠️ Mots à confirmer en écoutant (règle de CLAUDE.md)
1. 0:01–0:04 : un mot après « Bienvenue à ce moment de méditation » reste inaudible pour la machine ; il est remplacé par « … ».
2. « c'est les autres » / « ce sont les autres » (0:21–0:33).
3. 1:25 : « tu as eu à **noircir** quelqu'un à tort » (entendu « noycer / noisi »).
4. 1:39 : « Je peux me tromper, moi aussi je peux offenser » (fin de phrase peu claire).
5. 1:44 : « des gens qui **commettent** la fornication » (entendu « qui se commettent »).
6. 1:53 : « alors qu'eux aussi, ils **mentent** » (entendu « ils manquent »).
7. 2:11 : « accuser quelqu'un de **vampire**, de sorcier… » (la suite est inaudible).

Les textes des widgets (messages, liste du téléphone, étiquettes) sont des **illustrations** et non des citations.
