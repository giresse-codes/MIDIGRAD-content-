// WILFRIED — narrateur de la série « Le pardon divin » (même personnage dans tous les épisodes).
// Jeune homme camerounais souriant : peau brun foncé, cheveux courts crépus noirs, chemise blanche à boutons,
// pantalon bleu foncé, chaussures noires, petite Bible marron à tranche dorée dans la main gauche.
// Usage : import { makeWilfried } from "./narrateur/wilfried.js" ; W.pose({...}) ; W.faceSet({...}) (voir assets/toon.js).
import * as THREE from "three";
import { makeChar, mesh, tm, outline } from "../assets/toon.js";
export function makeWilfried() {
  const W = makeChar({ skin: "#6a4127", hair: "crepu", top: "#ffffff", bottom: "#1f2d4d", shoes: "#151217", buttons: true, sleeve: "long", blush: 0.15 });
  const bible = new THREE.Group(); mesh(new THREE.BoxGeometry(0.2, 0.27, 0.07), tm("#6b3f22"), { parent: bible }); mesh(new THREE.BoxGeometry(0.19, 0.25, 0.072), tm("#e3b23c"), { pos: [0.006, 0, 0], parent: bible, noOl: true });
  mesh(new THREE.BoxGeometry(0.205, 0.275, 0.05), tm("#6b3f22"), { pos: [-0.004, 0, 0], parent: bible });
  outline(bible, 0.012); bible.position.set(0, -0.32, 0.06); bible.rotation.set(0.2, 0, 0.1); W.arms[0].E.add(bible); W.bible = bible;
  return W;
}
// Expressions de base (paramètres de visage) réutilisables
export const WILFRIED_FACES = {
  sourire: { smile: 0.75, lidLo: 0.2 }, parle: { smile: 0.45 }, rire: { smile: 0.95, lidLo: 0.45, mouth: 4, open: 0.6 },
  serieux: { smile: -0.1, bd: 0.35, bi: 0.1 }, surpris: { bi: 0.8, bo: 0.8, mouth: 3, open: 0.5 }, complice: { smile: 0.8, ruse: 0.6, lidLo: 0.25, lx: 0.4 },
};
