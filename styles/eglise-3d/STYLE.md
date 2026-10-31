# Style « Église MIDIGRAD 3D » (diorama jouet)

Église MIDIGRAD reconstruite en 3D (Three.js) d'après les 3 photos de `photos-eglise/`, avec la foule de fidèles en instances.
Utilisée pour « Ma part suffit » partie 3 (branche `video-annabelle-partie-3`). Pour l'utiliser : « Utilise le style de la branche `style-eglise-3d` ».

## Fichiers
- `assets/church.js` : le lieu (`buildChurch(scene, logo)`), textures procédurales (pagne, tissus bleus à feuilles/fleurs, plafond peint, carrelage, tapis, bannière 2026 avec logo).
- `assets/toys.js` : personnages-jouets (`makeToy`) avec visages dessinés en direct (paupières, sourcils, regard, bouche, larmes brillantes, rougeurs) et foule (`makeCrowd`, InstancedMesh).
- `assets/world.js` : rendu complet (lumières, ombres, GTAO, profondeur de champ, bloom léger, étalonnage froid/chaud, vignette, grain, flou de balayage, étincelles, logo 3D final).
- Dépendances : Three.js 0.170 + `examples/jsm` (postprocessing, shaders, math, RoomEnvironment, RoundedBoxGeometry).

## Le lieu (repère : mètres, x à droite vu de la salle, z vers le fond, estrade en z < 0)
- Salle : sol en béton gris, murs blancs à plinthe bleue, bloc de terre brun-rouge sous le sol (signature diorama).
- Estrade (13 × 5,5 m, 0,45 m de haut) : carrelage crème brillant, tapis à médaillons bleu et crème au bord.
- Fond d'estrade : panneaux gris, panneau orange à lattes verticales, rideaux bleus à fleurs blanches avec voile jaune, bannière « Année des Opportunités Divines / YEAR OF DIVINE OPPORTUNITIES » 2026 + logo + « Tu es saint, tu es parfait en Christ ».
- Plafond blanc à spots ; faux plafond en caisson à bord rose, dessous bleu clair peint de nuages crème et de soleils ; au-delà, tôle ondulée et poutres en bois (groupe `C.top`, masqué pour les vues aériennes).
- Poteau blanc, 3 gros ventilateurs sur pied (pales qui tournent), fenêtres hautes à gauche avec rayons de lumière et poussière.
- Mezzanine au fond de la salle : garde-corps drapé de tissu bleu à feuilles, rideau satiné blanc, étoile / hexagone / carré bleus au mur, batterie à gauche.
- DEUX pupitres seulement (x = ±2,7 ; 5,4 m d'écart) drapés de tissu bleu à feuilles, jupe plissée, micro col de cygne tourné vers l'orateur. Centre de l'estrade vide.
- Table des pasteurs (côté droit, au bord de l'estrade) : tissu bleu, jupe plissée gris-vert, 3 sièges, bouquet blanc et bleu sur socle.
- 76 chaises en plastique (orange, rouge, vert-gris, blanches), rangées irrégulières.

## Personnages
- Annabelle : pagne bordeaux et or, attache-tête assorti (nœud), manches bouffantes. Pasteur Yannick : costume bleu nuit, lunettes 3D, barbe courte grisonnante. Pasteur Emmanuel : tenue wax verte et or. Frère aîné Matthieu : chemise blanche, gilet brun, cravate. Interprète : costume sombre, bouche fermée.
- Foule : ~75 fidèles instanciés, couleur et décalage d'animation propres ; états `bow`, `laugh`, `amen`, `clap`, `stand`, `wipe`, `nod`, `closed`, `appear` (0..1). 3 fidèles « héros » à visage détaillé pour les gros plans.
- Visage (`faceSet`) : `lid, lidLo, bi, bo, bd, ba (sourcil levé), lx, ly, smile, open, wide, pinch, trem, wet, red, blush, tears:[{s,p,a}]`.

## Rendu (machine sans GPU)
- Canvas WebGL 540×960 agrandi en 1080×1920 ; ~0,7 s/image de 3D, ~1,6 s/image avec la capture HyperFrames.
- Rendre par morceaux (`--start/--end`) de moins de 2 h et assembler avec ffmpeg.
- Éviter SAOPass (écran noir sous SwiftShader) ; GTAO à mi-résolution ; profondeur de champ seulement sur les gros plans ; désactiver bloom et GTAO pour la scène du logo.
