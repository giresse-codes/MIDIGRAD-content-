# Style « PARDON — ILLUSTRÉ » — série « Le pardon divin » (MIDIGRAD)

Pour l'utiliser : « Utilise le style de la branche `style-pardon-illustre` ».
Remplace les styles `style-pardon-dessin-anime` et `style-pardon-3d` (jugés trop « cartoon » par les pasteurs).

## Le look (référence : vidéos TikTok de dessin animé africain semi-réaliste, ex. scène de bureau avec un jeune homme en chemise blanche et un vieil homme au chapeau)
- Illustration numérique **semi-réaliste** : proportions humaines réelles, visages détaillés (yeux, sourcils, rides, lèvres, reflets), peau brune avec ombrage doux, contours noirs fins et nets.
- Couleurs naturelles et lumineuses, ombrage léger en dégradé (pas d'aplats « jouet »), décors très détaillés et crédibles.
- Animation « limitée » mais vivante : la caméra zoome et glisse lentement sur l'image, coupes entre plan large et gros plan, la bouche s'ouvre et se ferme sur la voix, les yeux clignent, les expressions changent (surprise, colère, sourire).

## Production
1. **Les images** sont générées avec Gemini (Google AI Pro), avec le prompt de style commun ci-dessous et les fiches personnages jointes à chaque demande pour garder les mêmes visages. Pour chaque plan avec un personnage qui parle : variante A (bouche fermée), B (bouche ouverte), C (yeux fermés), obtenues en modifiant la même image.
2. **Claude Code** fait toute l'animation et le montage à partir de ces images : mouvements de caméra (zoom lent, panoramique, léger tremblement sur le tonnerre), coupes, alternance A/B synchronisée sur la voix, clignements avec C toutes les 3 à 5 s, effets ajoutés par-dessus (poussière dorée, rayons de lumière, feuilles qui tombent, feu de l'épée, pluie, particules), étalonnage qui change avec l'histoire, sous-titres, cartes de versets, bruitage, mixage.
3. Toutes les images sont rangées dans `images/` avec le numéro de plan (`01a.png`, `01b.png`, `01c.png`, …).

## Prompt de style commun (à mettre au début de chaque demande d'image)
« Illustration de dessin animé semi-réaliste, style bande dessinée numérique moderne : contours noirs fins et nets, couleurs naturelles et lumineuses, ombrage doux, proportions humaines réalistes, visages détaillés et expressifs, décor riche et détaillé, lumière naturelle. Format vertical 9:16. Aucun texte, aucun logo, aucun filigrane. »

## Personnages (fiches à générer une fois, sur fond blanc : face, trois-quarts, profil)
- **WILFRIED (narrateur)** : jeune homme camerounais d'environ 25 ans, peau brun foncé, cheveux courts crépus noirs, visage souriant et bienveillant, chemise blanche à manches longues, pantalon noir, chaussures noires, petite Bible marron à tranche dorée.
- **ADAM** : homme africain d'environ 30 ans, peau brune, barbe courte noire, cheveux courts crépus, musclé mais simple. Avant la chute : tunique simple en lin clair. Après : ceinture et tunique de feuilles de figuier. Fin : vêtement de peau.
- **ÈVE** : femme africaine d'environ 25 ans, peau brune, longues tresses noires, visage doux. Avant la chute : longue tunique claire en lin. Après : tunique de feuilles de figuier. Fin : vêtement de peau.
- **LE SERPENT** : serpent vert brillant aux écailles détaillées, yeux jaunes rusés, sourire en coin, impressionnant mais pas effrayant pour un enfant.
- **DIEU** n'est jamais dessiné comme une personne : une lumière chaude et dorée, des rayons.

## Mise en page de la vidéo
- 1080×1920, 30 fps. Images agrandies proprement (Lanczos) si besoin, sans déformation.
- Wilfried en entier au début et à la fin ; pendant l'histoire, en buste dans un médaillon rond en bas à gauche (environ 340 px, double bord noir et doré, étiquette « WILFRIED »), bouche animée sur la voix.
- Sous-titres : 2 lignes max, en haut sous l'étiquette d'épisode (ou en bas quand Wilfried est en entier), majuscules, police grasse arrondie, blanc avec contour noir, mot-clé en jaune, petit rebond.
- Cartes de versets : parchemin, référence en haut, Louis Segond 1910 mot pour mot.

## Règles
- Adam et Ève toujours habillés, aucune nudité. Pas de sang ni de violence montrés.
- La croix : émotion par la lumière et les visages des témoins. Jésus : par défaut de dos ou dans la lumière (à confirmer).
- L'apôtre Paris Talla n'apparaît pas.

## Sons (bruitage) — obligatoire dans chaque épisode
- Chaque scène a son ambiance (vent, oiseaux, eau, ville, feu…) et ses bruits ponctuels (animaux, pas, croquement, sifflement du serpent, whoosh des transitions, déroulement du parchemin des versets).
- Les sons sont des fichiers fournis dans `audio/sons/` (Pixabay, Mixkit). Claude Code ne fabrique pas de faux sons : s'il manque un fichier, il le signale et laisse ce moment sans bruit.
- Niveaux : ambiances -30 à -26 LUFS, bruits ponctuels vers -22 LUFS, toujours sous la voix. Baisse automatique des sons quand le narrateur parle (sidechain/ducking), remontée dans les silences. Fondus d'entrée et de sortie de 0,5 à 1 s pour les ambiances.
- Effets sur la voix seulement quand le texte le demande (ex. écho sur « Où es-tu ? » avec aecho de FFmpeg).
