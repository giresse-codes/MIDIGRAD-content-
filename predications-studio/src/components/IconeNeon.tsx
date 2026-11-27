import React from 'react';
import {C} from '../style';

/**
 * Bibliothèque d'icônes néon (line art, contour fin, coins arrondis, remplissage très léger, halo de la couleur du trait).
 * Convention : dessinées avec le bas à y=0 et centrées sur x=0 (pour <AuSol>), en unités « px 1080 ».
 * `trace` 0→1 : le tracé se dessine.
 */
export type IconeProps = {couleur?: string; trace?: number; epaisseur?: number; remplissage?: number};

export const halo = (c: string, fort = 1) => ({
  filter: `drop-shadow(0 0 ${5 * fort}px ${c}) drop-shadow(0 0 ${16 * fort}px ${c}88)`,
});

/** Trait néon générique (path) qui se dessine */
export const Trait: React.FC<{
  d: string;
  couleur: string;
  trace?: number;
  ep?: number;
  fill?: number;
  opacity?: number;
}> = ({d, couleur, trace = 1, ep = 5, fill = 0, opacity = 1}) => (
  <g opacity={opacity}>
    {fill > 0 && <path d={d} fill={couleur} fillOpacity={fill * trace} stroke="none" />}
    <path
      d={d}
      fill="none"
      stroke={couleur}
      strokeWidth={ep}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - trace}
    />
  </g>
);

const N: React.FC<{couleur: string; children: React.ReactNode; fort?: number}> = ({couleur, children, fort}) => (
  <g style={halo(couleur, fort)}>{children}</g>
);

// ——— Chaîne et cadenas ———————————————————————————————————————————
/** Un maillon centré sur (0,0), orienté selon `angle` (deg). `plat` = vu de profil (trait). */
export const Maillon: React.FC<{x: number; y: number; angle: number; plat?: boolean; couleur: string; opacity?: number; l?: number}> = ({
  x,
  y,
  angle,
  plat,
  couleur,
  opacity = 1,
  l = 40,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`} opacity={opacity}>
    {plat ? (
      <rect x={-l / 2} y={-4} width={l} height={8} rx={4} fill="none" stroke={couleur} strokeWidth={5} />
    ) : (
      <rect x={-l / 2} y={-l * 0.3} width={l} height={l * 0.6} rx={l * 0.3} fill={couleur} fillOpacity={0.1} stroke={couleur} strokeWidth={5} />
    )}
  </g>
);

/** Chaîne le long d'une liste de points (polyligne). `trace` = proportion de maillons visibles. */
export const Chaine: React.FC<{
  points: [number, number][];
  couleur?: string;
  trace?: number;
  pas?: number;
  l?: number;
  decal?: (i: number, n: number) => {dx: number; dy: number; da: number; o?: number};
}> = ({points, couleur = C.rouge, trace = 1, pas = 30, l = 40, decal}) => {
  // échantillonne la polyligne à pas constant
  const maillons: {x: number; y: number; a: number}[] = [];
  let reste = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    let d = reste;
    while (d <= len) {
      const t = d / len;
      maillons.push({x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t, a});
      d += pas;
    }
    reste = d - len;
  }
  const n = maillons.length;
  const vis = trace * n;
  return (
    <N couleur={couleur}>
      {maillons.map((m, i) => {
        if (i >= vis) return null;
        const o = Math.min(1, vis - i);
        const dd = decal ? decal(i, n) : {dx: 0, dy: 0, da: 0, o: 1};
        return (
          <Maillon
            key={i}
            x={m.x + dd.dx}
            y={m.y + dd.dy}
            angle={m.a + dd.da}
            plat={i % 2 === 1}
            couleur={couleur}
            opacity={o * (dd.o ?? 1)}
            l={l}
          />
        );
      })}
    </N>
  );
};

export const Cadenas: React.FC<IconeProps & {ouvert?: number}> = ({couleur = C.rouge, trace = 1, ouvert = 0}) => (
  <N couleur={couleur}>
    <Trait d={`M -26 ${-62 - ouvert * 18} L -26 ${-92 - ouvert * 18} A 26 26 0 0 1 26 ${-92 - ouvert * 18} L 26 ${-74 - ouvert * 18}`} couleur={couleur} trace={trace} />
    <Trait d="M -40 -62 L 40 -62 Q 46 -62 46 -56 L 46 -6 Q 46 0 40 0 L -40 0 Q -46 0 -46 -6 L -46 -56 Q -46 -62 -40 -62 Z" couleur={couleur} trace={trace} fill={0.12} />
    <Trait d="M 0 -40 L 0 -24" couleur={couleur} trace={trace} ep={6} />
  </N>
);

// ——— Croix ———————————————————————————————————————————————————————
export const Croix: React.FC<IconeProps & {h?: number}> = ({couleur = C.or, trace = 1, h = 380}) => {
  const w = h * 0.075; // demi-largeur du montant
  const bras = h * 0.33;
  const yb = -h * 0.7; // hauteur de la traverse
  const d = `M ${-w} 0 L ${-w} ${yb + w} L ${-bras} ${yb + w} L ${-bras} ${yb - w} L ${-w} ${yb - w} L ${-w} ${-h} L ${w} ${-h} L ${w} ${yb - w} L ${bras} ${yb - w} L ${bras} ${yb + w} L ${w} ${yb + w} L ${w} 0 Z`;
  return (
    <N couleur={couleur} fort={1.3}>
      <Trait d={d} couleur={couleur} trace={trace} fill={0.12} ep={6} />
    </N>
  );
};

// ——— Cœur (et cœur brisé) ————————————————————————————————————————
const COEUR_G = 'M 0 -150 C 0 -185 -45 -200 -72 -195 C -112 -188 -124 -150 -112 -118 C -97 -78 -42 -38 0 0';
const COEUR_D = 'M 0 -150 C 0 -185 45 -200 72 -195 C 112 -188 124 -150 112 -118 C 97 -78 42 -38 0 0';
const FISSURE = 'M 0 -150 L -14 -120 L 12 -92 L -10 -62 L 10 -34 L 0 0';
const FISSURE_INV = 'L 10 -34 L -10 -62 L 12 -92 L -14 -120 L 0 -150';

export const Coeur: React.FC<IconeProps & {fissure?: number; ecart?: number; serre?: number}> = ({
  couleur = C.rouge,
  trace = 1,
  fissure = 0,
  ecart = 0,
  serre = 0,
}) => {
  const s = 1 - 0.1 * serre;
  if (ecart > 0) {
    return (
      <N couleur={couleur}>
        <g transform={`scale(${s}) translate(${-ecart} ${ecart * 0.3}) rotate(${-ecart * 0.25} 0 0)`}>
          <Trait d={`${COEUR_G} ${FISSURE_INV}`} couleur={couleur} trace={trace} fill={0.12} />
        </g>
        <g transform={`scale(${s}) translate(${ecart} ${ecart * 0.3}) rotate(${ecart * 0.25} 0 0)`}>
          <Trait d={`${COEUR_D} ${FISSURE_INV}`} couleur={couleur} trace={trace} fill={0.12} />
        </g>
      </N>
    );
  }
  return (
    <N couleur={couleur}>
      <g transform={`translate(0 -100) scale(${s}) translate(0 100)`}>
        <Trait d={`${COEUR_G} ${COEUR_D}`} couleur={couleur} trace={trace} fill={0.12} />
        {fissure > 0 && <Trait d={FISSURE} couleur={couleur} trace={fissure} ep={5} />}
      </g>
    </N>
  );
};

// ——— Colombe ————————————————————————————————————————————————————
export const Colombe: React.FC<IconeProps & {aile?: number}> = ({couleur = C.blanc, trace = 1, aile = 0}) => (
  <N couleur={couleur}>
    <Trait
      d="M -90 -40 C -60 -60 -20 -60 10 -50 C 30 -44 46 -50 58 -62 C 66 -70 80 -70 86 -62 L 100 -58 L 86 -52 C 84 -36 70 -22 50 -16 C 20 -8 -20 -14 -50 -26 L -110 -20 L -90 -40 Z"
      couleur={couleur}
      trace={trace}
      fill={0.1}
    />
    <g transform={`rotate(${-aile * 25} 0 -50)`}>
      <Trait d="M -10 -52 C -20 -110 -60 -150 -110 -160 C -90 -120 -60 -80 -40 -56" couleur={couleur} trace={trace} fill={0.08} />
    </g>
  </N>
);

// ——— Bible ouverte ———————————————————————————————————————————————
export const Bible: React.FC<IconeProps> = ({couleur = C.or, trace = 1}) => (
  <N couleur={couleur}>
    <Trait d="M 0 -20 C -40 -44 -90 -46 -130 -30 L -130 -130 C -90 -146 -40 -144 0 -120 Z" couleur={couleur} trace={trace} fill={0.1} />
    <Trait d="M 0 -20 C 40 -44 90 -46 130 -30 L 130 -130 C 90 -146 40 -144 0 -120 Z" couleur={couleur} trace={trace} fill={0.1} />
    <Trait d="M -140 -18 L -140 -6 C -90 -22 -40 -20 0 -2 C 40 -20 90 -22 140 -6 L 140 -18" couleur={couleur} trace={trace} ep={4} />
    {[-104, -84, -64].map((y, i) => (
      <React.Fragment key={i}>
        <Trait d={`M -108 ${y + 8} C -80 ${y - 2} -40 ${y - 2} -22 ${y + 6}`} couleur={couleur} trace={trace} ep={3} opacity={0.7} />
        <Trait d={`M 22 ${y + 6} C 40 ${y - 2} 80 ${y - 2} 108 ${y + 8}`} couleur={couleur} trace={trace} ep={3} opacity={0.7} />
      </React.Fragment>
    ))}
  </N>
);

// ——— Mains jointes ———————————————————————————————————————————————
export const MainsJointes: React.FC<IconeProps> = ({couleur = C.or, trace = 1}) => (
  <N couleur={couleur}>
    <Trait d="M -4 -190 C -18 -186 -30 -160 -38 -120 C -46 -86 -58 -60 -70 -40 L -46 0 L -4 -30 Z" couleur={couleur} trace={trace} fill={0.1} />
    <Trait d="M 4 -190 C 18 -186 30 -160 38 -120 C 46 -86 58 -60 70 -40 L 46 0 L 4 -30 Z" couleur={couleur} trace={trace} fill={0.1} />
  </N>
);

// ——— Couronne d'épines ———————————————————————————————————————————
export const CouronneEpines: React.FC<IconeProps> = ({couleur = C.rouge, trace = 1}) => {
  const epines = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.cos(a) * 92;
    const y = -40 + Math.sin(a) * 30;
    const dx = Math.cos(a + 0.6) * 26;
    const dy = Math.sin(a + 0.6) * 18 - 8;
    return `M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
  }).join(' ');
  return (
    <N couleur={couleur}>
      <Trait d="M -92 -40 A 92 30 0 1 0 92 -40 A 92 30 0 1 0 -92 -40" couleur={couleur} trace={trace} />
      <Trait d="M -84 -34 C -40 -6 40 -60 84 -46 M -84 -48 C -40 -76 40 -16 84 -32" couleur={couleur} trace={trace} ep={3} />
      <Trait d={epines} couleur={couleur} trace={trace} ep={3} />
    </N>
  );
};

// ——— Rayon de lumière (coordonnées absolues) ————————————————————
export const Rayon: React.FC<{x: number; yHaut?: number; yBas: number; largeurHaut?: number; largeurBas?: number; intensite: number; couleur?: string; id: string}> = ({
  x,
  yHaut = -50,
  yBas,
  largeurHaut = 70,
  largeurBas = 380,
  intensite,
  couleur = C.or,
  id,
}) => {
  if (intensite <= 0) return null;
  // le rayon descend : la partie basse apparaît avec l'intensité
  const bas = yHaut + (yBas - yHaut) * Math.min(1, intensite * 1.4);
  const lb = largeurHaut + (largeurBas - largeurHaut) * ((bas - yHaut) / (yBas - yHaut));
  return (
    <g opacity={Math.min(1, intensite)}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={yHaut} x2="0" y2={bas}>
          <stop offset="0" stopColor={couleur} stopOpacity="0.38" />
          <stop offset="0.7" stopColor={couleur} stopOpacity="0.14" />
          <stop offset="1" stopColor={couleur} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon
        points={`${x - largeurHaut / 2},${yHaut} ${x + largeurHaut / 2},${yHaut} ${x + lb / 2},${bas} ${x - lb / 2},${bas}`}
        fill={`url(#${id})`}
        style={{filter: 'blur(14px)'}}
      />
      {/* tache de lumière au sol */}
      {bas >= yBas - 1 && <ellipse cx={x} cy={yBas} rx={largeurBas * 0.55} ry={26} fill={couleur} opacity={0.16} style={{filter: 'blur(12px)'}} />}
    </g>
  );
};

// ——— Sac de grain (Joseph) ———————————————————————————————————————
export const SacGrain: React.FC<IconeProps> = ({couleur = C.or, trace = 1}) => (
  <N couleur={couleur}>
    <Trait d="M -40 -150 C -30 -138 30 -138 40 -150 L 30 -128 C 80 -100 96 -40 80 -10 Q 74 0 60 0 L -60 0 Q -74 0 -80 -10 C -96 -40 -80 -100 -30 -128 Z" couleur={couleur} trace={trace} fill={0.12} />
    <Trait d="M -34 -126 C -12 -118 12 -118 34 -126" couleur={couleur} trace={trace} ep={4} />
    {/* épi de blé */}
    <Trait d="M 0 -30 L 0 -96" couleur={couleur} trace={trace} ep={3} />
    {[-86, -72, -58].map((y, i) => (
      <Trait key={i} d={`M 0 ${y} C -12 ${y - 4} -16 ${y - 12} -14 ${y - 18} M 0 ${y} C 12 ${y - 4} 16 ${y - 12} 14 ${y - 18}`} couleur={couleur} trace={trace} ep={3} />
    ))}
  </N>
);

// ——— Puits ——————————————————————————————————————————————————————
export const Puits: React.FC<IconeProps> = ({couleur = C.blanc, trace = 1}) => (
  <N couleur={couleur} fort={0.7}>
    <Trait d="M -90 -110 A 90 22 0 1 0 90 -110 A 90 22 0 1 0 -90 -110" couleur={couleur} trace={trace} fill={0.06} />
    <Trait d="M -90 -110 L -90 -10 A 90 22 0 0 0 90 -10 L 90 -110" couleur={couleur} trace={trace} />
    <Trait d="M -90 -70 A 90 22 0 0 0 90 -70 M -40 -88 L -40 -50 M 30 -90 L 30 -52 M -60 -46 L -60 -14 M 10 -42 L 10 -10 M 64 -50 L 64 -16" couleur={couleur} trace={trace} ep={3} opacity={0.6} />
    <Trait d="M -78 -116 L -78 -250 M 78 -116 L 78 -250 M -110 -240 L 0 -300 L 110 -240" couleur={couleur} trace={trace} />
    <Trait d="M -78 -220 L 78 -220 M 0 -220 L 0 -170" couleur={couleur} trace={trace} ep={3} />
    <Trait d="M -16 -170 L 16 -170 L 12 -140 L -12 -140 Z" couleur={couleur} trace={trace} ep={4} />
  </N>
);

// ——— Poids (fardeau sur le dos) —————————————————————————————————
export const Poids: React.FC<IconeProps> = ({couleur = C.rouge, trace = 1}) => (
  <N couleur={couleur}>
    <Trait d="M -50 0 L 50 0 Q 60 0 58 -10 L 44 -88 Q 42 -96 34 -96 L -34 -96 Q -42 -96 -44 -88 L -58 -10 Q -60 0 -50 0 Z" couleur={couleur} trace={trace} fill={0.14} />
    <Trait d="M -22 -96 L -22 -112 A 22 22 0 0 1 22 -112 L 22 -96" couleur={couleur} trace={trace} />
  </N>
);

// ——— Partage (deux flèches qui se répondent) —————————————————
export const Partage: React.FC<IconeProps> = ({couleur = C.blanc, trace = 1}) => (
  <N couleur={couleur}>
    <Trait d="M -60 -40 C -30 -100 30 -100 60 -40 M 60 -40 L 40 -50 M 60 -40 L 66 -62" couleur={couleur} trace={trace} />
  </N>
);
