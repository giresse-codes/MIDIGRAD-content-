import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../p01.json';
import {AuSol, EnLAir, Scene} from '../components/Scene';
import {Bonhomme, calculer, marche, melange, Pose, POSES} from '../components/Bonhomme';
import {Bible, Cadenas, Chaine, Coeur, Croix, Poids, Puits, Rayon, SacGrain} from '../components/IconeNeon';
import {CarteVerset, Citation, Phrase, TexteHaut, usePolice} from '../components/Texte';
import {CarteMidigrad, FonduNoir} from '../components/CarteMidigrad';
import {C, clamp01, lerp, prog, SOL} from '../style';

// « La chaîne du pardon » — prédication courte n° 1
const A = data.ancres as Record<string, number>;
const PHRASES = data.phrases as Phrase[];

// coupures de scène (fondu par le noir), en secondes
export const T = {
  s2: A.scene2 - 0.15,
  s2b: A.lui - 0.2,
  s3: A.ecoute - 0.25,
  s4: A.remarque - 0.3,
  s5: A.scene5 - 0.25,
  s6: A.joseph - 0.25,
  s7: A.donc - 0.2,
  s8: A.scene8 - 0.3,
  s9: A.scene9 - 0.2,
};
export const FIN_VOIX = data.finVoix;
export const CARTE = FIN_VOIX + 0.25; // carte MIDIGRAD (2 s)
export const NOIR = CARTE + 2; // puis 1 s de noir
export const DUREE = NOIR + 1;

const pose = (nom: keyof typeof POSES) => POSES[nom];
const P = (a: Pose, b: Pose, t: number) => melange(a, b, t);

// face à droite / gauche (le bonhomme n'a pas de visage : l'orientation passe par l'inclinaison)
const FACE: Pose = {penche: 6, tete: 10, brasG: [-6, 0], brasD: [22, -10], jambeG: [-6, 0], jambeD: [6, 0]};
const LEVE_TETE: Pose = {penche: -7, tete: -16, brasG: [-6, 4], brasD: [10, -4], jambeG: [-6, 0], jambeD: [6, 0]};

/** maillons en boucle autour des poignets + chaîne qui pend jusqu'au sol puis va vers le cadenas */
const cheminChaine = (cx: number, cy: number, r: number, mou: number, xCadenas: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 14; i++) {
    const a = -Math.PI / 2 + (i / 14) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.55]);
  }
  // pend depuis le bas de la boucle vers le sol
  const bx = cx + 6;
  const by = cy + r * 0.55;
  const n = 10;
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const x = lerp(bx, xCadenas - 40, u);
    const y = lerp(by, -14, u) + Math.sin(u * Math.PI) * mou;
    pts.push([x, Math.min(-14, y)]);
  }
  return pts;
};

// ——— Scène 1 : HOOK ————————————————————————————————————————————
const Scene1: React.FC<{t: number}> = ({t}) => {
  const trace = prog(t, 0.25, 2.3);
  const serre = prog(t, A.serre, A.serre + 1.4);
  const r = lerp(64, 44, serre);
  const mou = lerp(40, 4, serre);
  // la silhouette grise s'éloigne
  const u = clamp01(t / 6.2);
  const xg = lerp(770, 930, u);
  const sg = lerp(0.92, 0.72, u);
  const pb = P(pose('poignets'), pose('poignetsBas'), serre);
  const k = calculer(pb);
  const cx = (k.mainG[0] + k.mainD[0]) / 2;
  const cy = (k.mainG[1] + k.mainD[1]) / 2;
  return (
    <>
      <AuSol x={xg} scale={sg} opacity={lerp(0.95, 0.55, u)}>
        <Bonhomme pose={marche(t * 3.2)} couleur={C.gris} />
      </AuSol>
      <AuSol x={400}>
        <Bonhomme pose={pb} halo />
        <Chaine points={cheminChaine(cx, cy, r, mou, 210)} trace={trace} pas={lerp(31, 27, serre)} l={lerp(40, 36, serre)} />
        <g transform="translate(210 0)" opacity={prog(t, 1.8, 2.6)}>
          <Cadenas trace={prog(t, 1.8, 2.8)} />
        </g>
      </AuSol>
    </>
  );
};

// ——— Scène 2 : la blessure ——————————————————————————————————————
const Scene2a: React.FC<{t: number}> = ({t}) => {
  const trace = prog(t, T.s2 + 0.2, T.s2 + 1.3);
  const fissure = prog(t, A.rouvre - 0.15, A.rouvre + 0.55);
  const ecart = 9 * prog(t, A.rouvre + 0.5, A.rouvre + 1.2);
  // le cœur se serre : deux battements lents
  const b = t - A.serrecoeur;
  const serre = b > 0 && b < 1.6 ? Math.max(0, Math.sin((b / 0.8) * Math.PI)) : 0;
  return (
    <AuSol x={540} y={330} scale={1.75} reflet={0.2}>
      <Coeur trace={trace} fissure={fissure} ecart={ecart} serre={serre} />
    </AuSol>
  );
};

const Scene2b: React.FC<{t: number}> = ({t}) => {
  const vout = prog(t, A.lui + 1.6, A.poids + 0.4);
  const ps = P(pose('debout'), pose('voute'), vout);
  const k = calculer(ps);
  const oPoids = prog(t, A.poids - 0.1, A.poids + 0.5);
  const descente = (1 - prog(t, A.poids - 0.1, A.poids + 0.6)) * 60;
  // sur le dos : entre hanche et épaule, décalé côté dos (normale au buste)
  const rp = (ps.penche * Math.PI) / 180;
  const mi = [lerp(k.hanche[0], k.epaule[0], 0.78), lerp(k.hanche[1], k.epaule[1], 0.78)];
  const dos = [mi[0] - Math.cos(rp) * 58, mi[1] - Math.sin(rp) * 58];
  return (
    <>
      <AuSol x={590} scale={0.62} opacity={prog(t, T.s2b, T.s2b + 0.6)}>
        <Bonhomme pose={pose('debout')} couleur={C.gris} allonge={1} />
      </AuSol>
      <AuSol x={300}>
        <Bonhomme pose={ps} halo />
        <g opacity={oPoids} transform={`translate(${dos[0]} ${dos[1] - descente}) rotate(${ps.penche - 50})`}>
          <Poids trace={prog(t, A.poids - 0.1, A.poids + 0.7)} />
        </g>
      </AuSol>
    </>
  );
};

// ——— Scène 3 : Colossiens 3:13 ——————————————————————————————————
const Scene3: React.FC<{t: number}> = ({t}) => {
  const oBible = prog(t, A.parole - 0.2, A.parole + 0.6) * (1 - prog(t, A.verset1 - 0.8, A.verset1 - 0.2));
  const rayon = prog(t, A.verset1 + 0.3, A.verset1 + 3.0);
  const regard = prog(t, A.verset1 + 1.0, A.verset1 + 2.6);
  return (
    <>
      <Rayon id="r3" x={540} yBas={SOL} intensite={rayon} largeurBas={420} />
      <AuSol x={540} scale={0.62} opacity={prog(t, T.s3, T.s3 + 0.6)}>
        <Bonhomme pose={P(pose('debout'), {...LEVE_TETE, penche: 0, tete: 0, brasG: [-14, 0], brasD: [14, 0]}, regard)} halo />
      </AuSol>
      <EnLAir x={540} y={1000} opacity={oBible} scale={1.25}>
        <Bible trace={prog(t, A.parole - 0.2, A.parole + 1.2)} />
      </EnLAir>
    </>
  );
};

// ——— Scène 4 : « si l'un a sujet de se plaindre » puis la croix ——————————
const Scene4: React.FC<{t: number}> = ({t}) => {
  const croix = prog(t, A.regarde, A.regarde + 1.3);
  const genoux = prog(t, A.regarde + 2.2, A.regarde + 3.4);
  const lueur = prog(t, A.pardonne - 0.1, A.pardonne + 0.8);
  return (
    <>
      <AuSol x={250} scale={0.72} opacity={prog(t, T.s4, T.s4 + 0.6)}>
        <Bonhomme pose={P(P(pose('debout'), FACE, croix), pose('genoux'), genoux)} halo />
      </AuSol>
      {croix > 0 && (
        <>
          <ellipse cx={640} cy={SOL - 230} rx={260} ry={300} fill={C.or} opacity={0.05 + 0.07 * lueur} style={{filter: 'blur(40px)'}} />
          <AuSol x={640}>
            <Croix trace={croix} h={440} />
          </AuSol>
        </>
      )}
    </>
  );
};

// ——— Scène 5 : regarder à Dieu ———————————————————————————————————
const Scene5: React.FC<{t: number}> = ({t}) => {
  const tour = prog(t, A.regarder - 0.1, A.regarder + 0.9);
  const sens = Math.cos(tour * Math.PI); // 1 → -1 : demi-tour
  const leve = prog(t, A.regarder + 0.7, A.etnon + 0.6);
  const lumiere = prog(t, A.regarder + 0.2, A.regarder + 2.2);
  const genoux = prog(t, A.repentance - 0.3, A.repentance + 0.9);
  const pz = P(P(FACE, LEVE_TETE, leve), pose('genoux'), genoux);
  return (
    <>
      <Rayon id="r5" x={330} yBas={SOL} intensite={lumiere} largeurBas={400} largeurHaut={60} />
      <AuSol x={820} scale={0.9} opacity={lerp(0.95, 0.5, prog(t, A.etnon, A.etnon + 1.2))}>
        <Bonhomme pose={{...FACE, penche: -4, tete: -6}} couleur={C.gris} sens={1} />
      </AuSol>
      <AuSol x={lerp(500, 360, prog(t, A.regarder + 0.4, A.etnon + 0.8))} opacity={prog(t, T.s5, T.s5 + 0.6)}>
        <Bonhomme pose={pz} sens={Math.abs(sens) < 0.08 ? 0.08 * Math.sign(sens || 1) : sens} halo />
      </AuSol>
    </>
  );
};

// ——— Scène 6 : Joseph ——————————————————————————————————————————
const Scene6: React.FC<{t: number}> = ({t}) => {
  const depart = prog(t, A.vendu, A.vendu + 1.4); // les frères s'éloignent
  const versPuits = prog(t, A.pourtant - 0.2, A.pourtant + 0.8);
  const sac = prog(t, A.pourtant + 0.3, A.pourtant + 1.5);
  // icône rouge → verte : le mal changé en bien (rouge s'efface, puis le vert apparaît)
  const guerit = prog(t, A.dieubien, A.dieubien + 0.6);
  const vert = prog(t, A.dieubien + 0.55, A.bien + 0.3);
  const oCoeur = prog(t, A.verset2 + 0.2, A.verset2 + 0.9);
  const ech = 0.62;
  return (
    <>
      {[150, 255, 360].map((x, i) => (
        <AuSol key={i} x={x - depart * 120} scale={ech} opacity={(0.95 - 0.12 * i) * (1 - depart)}>
          <Bonhomme pose={marche(depart * 6 + i, {...FACE, penche: -4})} couleur={C.gris} sens={depart > 0.02 ? -1 : 1} />
        </AuSol>
      ))}
      <AuSol x={790} scale={0.85} opacity={prog(t, T.s6, T.s6 + 0.6) * (1 - versPuits)}>
        <Puits />
      </AuSol>
      <AuSol x={560} scale={ech} opacity={prog(t, T.s6, T.s6 + 0.6)}>
        <Bonhomme pose={P(pose('debout'), FACE, sac)} halo />
      </AuSol>
      <AuSol x={790} scale={0.95} opacity={sac}>
        <SacGrain trace={sac} />
      </AuSol>
      {oCoeur > 0 && (
        <AuSol x={300} y={40} scale={0.5} opacity={oCoeur}>
          <g opacity={1 - guerit}>
            <Coeur couleur={C.rouge} ecart={8} />
          </g>
          <g opacity={vert}>
            <Coeur couleur={C.vert} />
          </g>
        </AuSol>
      )}
    </>
  );
};

// ——— Scène 7 : « nous ne sommes pas différents » ——————————————————
const Scene7: React.FC<{t: number}> = ({t}) => {
  const lumiere = prog(t, T.s7 + 0.2, T.s7 + 2.2);
  const leve = prog(t, A.donc + 1.2, A.donc + 2.6) * (1 - prog(t, A.donc + 4.2, A.donc + 5.2));
  const egal = prog(t, A.differents - 0.4, A.differents + 1.0);
  const sg = lerp(0.8, 0.9, egal);
  return (
    <>
      <Rayon id="r7" x={540} yBas={SOL} intensite={lumiere} largeurHaut={120} largeurBas={720} />
      <AuSol x={lerp(700, 640, egal)} scale={sg} opacity={prog(t, T.s7, T.s7 + 0.6)}>
        <Bonhomme pose={P(pose('debout'), LEVE_TETE, leve)} couleur={C.gris} sens={-1} />
      </AuSol>
      <AuSol x={lerp(400, 440, egal)} scale={0.9} opacity={prog(t, T.s7, T.s7 + 0.6)}>
        <Bonhomme pose={P(pose('debout'), LEVE_TETE, leve)} halo />
      </AuSol>
    </>
  );
};

// ——— Scène 8 : libération ————————————————————————————————————————
const Scene8: React.FC<{t: number}> = ({t}) => {
  const trace = prog(t, T.s8 + 0.2, T.s8 + 1.2);
  const casse = clamp01((t - A.liberer) / 1.0);
  const rougeOut = prog(t, A.liberer, A.liberer + 0.25);
  const vertIn = prog(t, A.liberer + 0.25, A.liberer + 0.6);
  const bras = prog(t, A.liberer + 0.25, A.liberer + 1.2);
  const ps = P(pose('poignets'), pose('brasLeves'), bras);
  const kp = calculer(pose('poignets'));
  const cx = (kp.mainG[0] + kp.mainD[0]) / 2;
  const cy = (kp.mainG[1] + kp.mainD[1]) / 2;
  const X = 400;
  const XC = 820;
  // les maillons se séparent et tombent au pied de la croix
  const decal = (i: number, n: number) => {
    if (casse <= 0) return {dx: 0, dy: 0, da: 0, o: 1};
    const g = casse * casse;
    const cible = XC - 140 + (i / n) * 120 - X; // pied de la croix (repère du bonhomme)
    const base = cheminChaine(cx, cy, 46, 4, 200);
    const j = Math.min(base.length - 1, Math.round((i / n) * (base.length - 1)));
    const bx = base[j][0];
    const by = base[j][1];
    return {dx: (cible - bx) * doux2(casse) + Math.sin(i * 2.1) * 30 * casse * (1 - casse), dy: (-16 - by) * g, da: casse * (i % 3 === 0 ? 70 : -40), o: 1};
  };
  const chemin = cheminChaine(cx, cy, 46, 4, 200);
  return (
    <>
      <ellipse cx={XC} cy={SOL - 200} rx={200} ry={250} fill={C.or} opacity={0.06} style={{filter: 'blur(40px)'}} />
      <AuSol x={XC} opacity={0.75 * prog(t, T.s8, T.s8 + 0.8)}>
        <Croix h={400} />
      </AuSol>
      <AuSol x={X}>
        <Bonhomme pose={ps} halo />
      </AuSol>
      <g transform={`translate(${X} ${SOL})`}>
        {rougeOut < 1 && (
          <g opacity={1 - rougeOut}>
            <Chaine points={chemin} trace={trace} couleur={C.rouge} decal={decal} pas={28} l={37} />
          </g>
        )}
        {vertIn > 0 && (
          <g opacity={vertIn}>
            <Chaine points={chemin} couleur={C.vert} decal={decal} pas={28} l={37} />
          </g>
        )}
      </g>
    </>
  );
};
const doux2 = (x: number) => 1 - Math.pow(1 - x, 2);

// ——— Scène 9 : appel ————————————————————————————————————————————
const Scene9: React.FC<{t: number}> = ({t}) => {
  const vol = clamp01((t - A.partage - 0.2) / 1.4);
  const xh = lerp(470, 640, prog(vol, 0, 1));
  const yh = SOL - 470 - Math.sin(vol * Math.PI) * 120;
  const oH = prog(t, A.partage - 0.1, A.partage + 0.4) * (1 - prog(t, A.benis + 0.6, A.benis + 1.2));
  const lumiere = prog(t, A.benis - 0.1, A.benis + 1.4);
  return (
    <>
      <Rayon id="r9" x={540} yBas={SOL} intensite={lumiere} largeurHaut={120} largeurBas={700} />
      <AuSol x={380} scale={0.85} opacity={prog(t, T.s9, T.s9 + 0.6)}>
        <Bonhomme pose={FACE} halo />
      </AuSol>
      <AuSol x={720} scale={0.85} opacity={prog(t, T.s9, T.s9 + 0.6)}>
        <Bonhomme pose={FACE} couleur={C.gris} sens={-1} />
      </AuSol>
      {oH > 0 && (
        <EnLAir x={xh} y={yh} scale={0.36} opacity={oH}>
          <g transform="translate(0 100)">
            <Coeur couleur={C.blanc} />
          </g>
        </EnLAir>
      )}
    </>
  );
};

export const Predication01: React.FC = () => {
  usePolice();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const scene =
    t < T.s2 ? <Scene1 t={t} />
    : t < T.s2b ? <Scene2a t={t} />
    : t < T.s3 ? <Scene2b t={t} />
    : t < T.s4 ? <Scene3 t={t} />
    : t < T.s5 ? <Scene4 t={t} />
    : t < T.s6 ? <Scene5 t={t} />
    : t < T.s7 ? <Scene6 t={t} />
    : t < T.s8 ? <Scene7 t={t} />
    : t < T.s9 ? <Scene8 t={t} />
    : t < CARTE ? <Scene9 t={t} />
    : null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {t < CARTE && (
        <Scene
          overlay={
            <>
              <CarteVerset phrases={PHRASES} ref_="COLOSSIENS 3:13" yCentre={750} />
              <CarteVerset phrases={PHRASES} ref_="GENÈSE 50:20" yCentre={720} hauteur={500} />
              <Citation phrases={PHRASES} y={700} />
            </>
          }
        >
          {scene}
        </Scene>
      )}
      <FonduNoir coupures={Object.values(T).concat([CARTE])} debut={0} finNoir={NOIR} />
      <TexteHaut phrases={PHRASES} coupure={CARTE - 0.05} />
      <CarteMidigrad debut={CARTE} />
    </AbsoluteFill>
  );
};

