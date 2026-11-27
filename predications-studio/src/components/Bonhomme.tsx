import React from 'react';
import {C, lerp} from '../style';

/**
 * Bonhomme bâton sans visage : tête ronde pleine, corps en traits épais aux bouts arrondis.
 * Blanc = « toi » ; gris (#9AA3AE) = les autres.
 * Angles en degrés : 0 = vers le bas, 90 = vers la droite (+x), 180 = vers le haut, -90 = vers la gauche.
 * Coudes / genoux : angle relatif au segment précédent.
 */
export type Pose = {
  penche: number; // inclinaison du buste (+ = vers la droite)
  tete: number; // inclinaison de la tête par rapport au buste (+ = vers la droite)
  brasG: [number, number];
  brasD: [number, number];
  jambeG: [number, number];
  jambeD: [number, number];
};

export const POSES: Record<string, Pose> = {
  debout: {penche: 0, tete: 0, brasG: [-8, 0], brasD: [8, 0], jambeG: [-6, 0], jambeD: [6, 0]},
  // mains jointes devant (poignets réunis) : utilisé pour la chaîne aux poignets
  poignets: {penche: 0, tete: 0, brasG: [-40, 115], brasD: [40, -115], jambeG: [-6, 0], jambeD: [6, 0]},
  poignetsBas: {penche: 5, tete: 12, brasG: [-32, 100], brasD: [32, -100], jambeG: [-6, 0], jambeD: [6, 0]},
  voute: {penche: 24, tete: 16, brasG: [-22, 8], brasD: [-16, 10], jambeG: [-2, 6], jambeD: [8, 4]},
  brasLeves: {penche: 0, tete: 0, brasG: [-145, -10], brasD: [145, 10], jambeG: [-9, 0], jambeD: [9, 0]},
  regardHaut: {penche: -4, tete: -24, brasG: [-10, 0], brasD: [10, 0], jambeG: [-6, 0], jambeD: [6, 0]},
  pointe: {penche: 0, tete: 0, brasG: [-8, 0], brasD: [100, 0], jambeG: [-6, 0], jambeD: [6, 0]},
  // à genoux, mains jointes (buste droit, genoux au sol)
  genoux: {penche: 6, tete: 12, brasG: [28, 112], brasD: [40, 100], jambeG: [4, -94], jambeD: [10, -100]},
};

export const melange = (a: Pose, b: Pose, t: number): Pose => ({
  penche: lerp(a.penche, b.penche, t),
  tete: lerp(a.tete, b.tete, t),
  brasG: [lerp(a.brasG[0], b.brasG[0], t), lerp(a.brasG[1], b.brasG[1], t)],
  brasD: [lerp(a.brasD[0], b.brasD[0], t), lerp(a.brasD[1], b.brasD[1], t)],
  jambeG: [lerp(a.jambeG[0], b.jambeG[0], t), lerp(a.jambeG[1], b.jambeG[1], t)],
  jambeD: [lerp(a.jambeD[0], b.jambeD[0], t), lerp(a.jambeD[1], b.jambeD[1], t)],
});

/** pose de marche : phase en radians */
export const marche = (phase: number, base: Pose = POSES.debout): Pose => {
  const s = Math.sin(phase);
  return {
    ...base,
    brasG: [base.brasG[0] - 14 * s, 6],
    brasD: [base.brasD[0] + 14 * s, -6],
    jambeG: [-16 * s, Math.max(0, -18 * s)],
    jambeD: [16 * s, Math.max(0, 18 * s)],
  };
};

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];

const L = {buste: 235, epaule: 205, cou: 70, tete: 56, bras: 148, avantBras: 140, cuisse: 168, tibia: 162};
const EP = {buste: 46, membre: 32};

export type Points = {
  hanche: [number, number];
  cou: [number, number];
  tete: [number, number];
  epaule: [number, number];
  mainG: [number, number];
  mainD: [number, number];
  coudeG: [number, number];
  coudeD: [number, number];
};

export const calculer = (p: Pose) => {
  const chaine = (o: [number, number], a1: number, a2: number, l1: number, l2: number) => {
    const d1 = dir(a1);
    const m: [number, number] = [o[0] + d1[0] * l1, o[1] + d1[1] * l1];
    const d2 = dir(a1 + a2);
    const f: [number, number] = [m[0] + d2[0] * l2, m[1] + d2[1] * l2];
    return [m, f] as const;
  };
  // jambes depuis une hanche provisoire en (0,0)
  const [gG, pG] = chaine([0, 0], p.jambeG[0], p.jambeG[1], L.cuisse, L.tibia);
  const [gD, pD] = chaine([0, 0], p.jambeD[0], p.jambeD[1], L.cuisse, L.tibia);
  const bas = Math.max(pG[1], pD[1], gG[1], gD[1]) + EP.membre / 2;
  const hanche: [number, number] = [0, -bas];
  const sh = (q: readonly [number, number]): [number, number] => [q[0], q[1] - bas];
  const up: [number, number] = [Math.sin(rad(p.penche)), -Math.cos(rad(p.penche))];
  const cou: [number, number] = [hanche[0] + up[0] * L.buste, hanche[1] + up[1] * L.buste];
  const epaule: [number, number] = [hanche[0] + up[0] * L.epaule, hanche[1] + up[1] * L.epaule];
  const ut: [number, number] = [Math.sin(rad(p.penche + p.tete)), -Math.cos(rad(p.penche + p.tete))];
  const tete: [number, number] = [cou[0] + ut[0] * L.cou, cou[1] + ut[1] * L.cou];
  const [cG, mG] = chaine(epaule, p.brasG[0] + p.penche, p.brasG[1], L.bras, L.avantBras);
  const [cD, mD] = chaine(epaule, p.brasD[0] + p.penche, p.brasD[1], L.bras, L.avantBras);
  return {
    hanche,
    cou,
    tete,
    epaule,
    coudeG: cG,
    coudeD: cD,
    mainG: mG,
    mainD: mD,
    genouG: sh(gG),
    genouD: sh(gD),
    piedG: sh(pG),
    piedD: sh(pD),
  };
};

export const Bonhomme: React.FC<{
  pose: Pose;
  couleur?: string;
  sens?: number; // 1 = normal, -1 = miroir (un passage par 0 simule un demi-tour)
  halo?: boolean;
  allonge?: number; // 0 debout → 1 allongé au sol (tête vers la droite)
}> = ({pose, couleur = C.blanc, sens = 1, halo, allonge = 0}) => {
  const k = calculer(pose);
  const seg = (a: readonly number[], b: readonly number[], w: number) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={couleur} strokeWidth={w} strokeLinecap="round" />
  );
  const corps = (
    <g style={halo ? {filter: `drop-shadow(0 0 10px ${couleur}55)`} : undefined}>
      {seg(k.hanche, k.genouG, EP.membre)}
      {seg(k.genouG, k.piedG, EP.membre)}
      {seg(k.hanche, k.genouD, EP.membre)}
      {seg(k.genouD, k.piedD, EP.membre)}
      {seg(k.hanche, k.cou, EP.buste)}
      {seg(k.epaule, k.coudeG, EP.membre)}
      {seg(k.coudeG, k.mainG, EP.membre)}
      {seg(k.epaule, k.coudeD, EP.membre)}
      {seg(k.coudeD, k.mainD, EP.membre)}
      <circle cx={k.tete[0]} cy={k.tete[1]} r={L.tete} fill={couleur} />
    </g>
  );
  // allongé : rotation de 90° autour des pieds, reposé sur le sol
  const rot = allonge * 90;
  const dy = allonge * -(EP.membre / 2 + 2);
  return (
    <g transform={`scale(${sens} 1) translate(0 ${dy}) rotate(${rot})`}>
      {corps}
    </g>
  );
};
