# Note de montage : « Ne doute pas de la promesse » (v3, maquette ordinateur portable)

- **Projet :** `videos/meditation-promesse-v3/` (HyperFrames)
- **Référence de style :** vidéo « ordinateur portable » (tonytuyisenge). La prédication passe dans l'écran d'un portable, dans une
  pièce sombre éclairée par des LED violettes et bleues. Dans l'écran, une interface animée : badge du nom, chapitres, mots-clés,
  carte Bible. La caméra est toujours en mouvement, avec un titre animé en haut.
- **Format :** 9:16, 1080×1920, 30 i/s (TikTok, Instagram Reels, Shorts), **4 min 59 s**
- **Sous-titres :** `videos/sous-titres/2026-10-13_predication_ne-doute-pas-de-la-promesse.srt`

## Assemblage (ordre d'envoi)
| Partie | Fichier source | Durée | Dans la vidéo |
|---|---|---|---|
| Intro | (écran MIDIGRAD) | 3,6 s | 0:00 |
| 1 | lv_0_…114.mp4 | 74 s | 0:03,6 |
| 2 | lv_0_…115.mp4 | 87 s | 1:18,8 (carte « Partie 2 ») |
| 3 | lv_0_…113.mp4 | 127 s | 2:47 (carte « Partie 3 ») |
| Fin | Logo + WhatsApp +237 676 547 719 | 4,7 s | 4:54 |

## Traitement image
- **Texte vert incrusté en haut supprimé** (recadrage à partir de 236 px, sous le message et le numéro).
- Réduction de bruit (nlmeans), **contraste réduit** et hautes lumières du mur blanc récupérées, légère chaleur,
  agrandissement ×2 (Lanczos) + netteté adaptative (CAS) pour un rendu « impression 4K ».

## Traitement audio
Passe-haut 75 Hz, réduction de bruit (afftdn), égalisation de la voix, compression douce, −14 LUFS.
Effets sonores : clic d'ouverture, whoosh à chaque mouvement de caméra et chapitre, pop sur les mots-clés,
notification sur la carte Bible, impact et scintillement sur l'intro et la fin.

## Verset affiché (LSG, à vérifier)
Romains 4:20-21 : « Il ne douta point, par incrédulité, au sujet de la promesse de Dieu ; mais il fut fortifié par la foi,
donnant gloire à Dieu, et ayant la pleine conviction que ce qu'il promet il peut aussi l'accomplir. »

## ⚠️ À confirmer en écoutant
1. 0:00 : « la démangeaison d'entendre des choses agréables à leurs oreilles » (2 Timothée 4:3, entendu approximativement).
2. 0:16 : « tu peux lire jusqu'à 20 à la maison » (le texte d'origine indiquait 18-21).
3. 0:40 : lecture de Romains 4:19 : « et que Sara… ne pouvait pas avoir d'enfant » (passage mal entendu).
4. 1:51 : « nos **cinq** sens » (entendu « nos sens-sens »).
5. 2:06 : « Ma vie, est-ce que ça avance ou ça recule ? » (reconstitution).
6. 2:43 : « pendant qu'il faisait son service » (entendu « rendait ses viscotes »).
7. 2:47–2:53 : début de la partie 3 (« il ne s'est pas découragé… », « Tu sers Dieu »).
8. 3:24 : « une promesse de Dieu qui est en train de **sonner** dans ta vie » (mot incertain).
9. 3:31 : une phrase inaudible a été retirée (« on va dire que tu es entré quelque part »).
10. 4:42 : « Jésus-Christ les a pardonnés » (entendu « ne les a pas donné ») et « Tu es saint » (entendu « sain »).
11. 4:50 : la dernière phrase (« … le meilleur matin du monde ») est incertaine.

---
## v4 : version YouTube 16:9 plein écran (version retenue)
Retour de Giresse : il ne fallait pas montrer l'ordinateur, seulement reprendre **la vidéo qui joue dans l'écran** de la référence.
- **Projet :** `videos/meditation-promesse-v4/` (1920×1080, 30 i/s, 4 min 59)
- **Plans orateur :** l'Apôtre au centre sur fond flouté de sa propre image. Le cadrage change toutes les 4 à 7 s
  (large, gros plan, plan moyen décalé) avec un petit zoom à chaque coupe. Des bulles blanches portent les mots-clés et un grand texte animé apparaît à gauche.
- **Écrans d'animation contextuels** (fond gris clair façon référence, médaillon rond de l'Apôtre en haut à droite), calés sur la parole :
  oreille (2 Tm 4:3), carte Romains 4:18, ciel étoilé (« Telle sera ta postérité »), compteur « 100 ans », santé / foyer /
  affaires / enfants / projets, « Ce que Dieu t'a dit » contre « Ce que tu vis », 2 Co 5:7 et les cinq sens, avancer / reculer,
  liste « Ne faiblis pas » cochée, Zacharie et Élisabeth, lumière de l'ange, paroles des gens en bulles, mariage / enfants,
  horloge « moment opportun », chaînes qui se brisent (« aucune malédiction »), Romains 4:20-21, croix + passé / présent / futur → pardonnés,
  saint / juste / parfait.
- Mêmes clips nettoyés, même voix et mêmes sous-titres que la v3 (rien n'a été retraité). 111 effets sonores.
