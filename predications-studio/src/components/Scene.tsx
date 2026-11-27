import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, H, SOL, W} from '../style';

/**
 * Décor fixe : fond presque noir, halo bleu nuit, sol brillant à 78 %, vignette, grain.
 * `children` = contenu SVG (coordonnées absolues 1080×1920). Utiliser <AuSol> pour les objets posés au sol
 * (ils reçoivent automatiquement leur reflet).
 */
export const Scene: React.FC<{children?: React.ReactNode; overlay?: React.ReactNode}> = ({children, overlay}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.fondHaut} 0%, ${C.fondBas} 70%, #070A10 100%)`}}>
      {/* halo bleu nuit très doux au centre */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 62% 42% at 50% 52%, ${C.halo}B3 0%, ${C.halo}40 45%, transparent 75%)`,
        }}
      />
      {/* sol : très léger éclaircissement sous l'horizon */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: SOL,
          width: W,
          height: H - SOL,
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(40,52,72,0.28) 0%, transparent 70%)',
        }}
      />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id="refletFondu" gradientUnits="userSpaceOnUse" x1="0" y1={SOL} x2="0" y2={SOL + 360}>
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="masqueReflet" maskUnits="userSpaceOnUse" x="0" y={SOL} width={W} height={H - SOL}>
            <rect x="0" y={SOL} width={W} height={H - SOL} fill="url(#refletFondu)" />
          </mask>
          <linearGradient id="horizon" x1="0" x2="1">
            <stop offset="0" stopColor="#8FA3BF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#8FA3BF" stopOpacity="0.22" />
            <stop offset="1" stopColor="#8FA3BF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y={SOL} width={W} height="1.5" fill="url(#horizon)" />
        {children}
      </svg>
      {overlay}
      {/* vignette forte */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse 78% 68% at 50% 50%, transparent 45%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.85) 100%)'}}
      />
      {/* grain léger */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'screen'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Objet posé au sol à l'abscisse x : y=0 local = le sol, dessiner vers le haut (y négatifs).
 * Le reflet (même dessin retourné, ~25 %, qui s'efface) est ajouté automatiquement.
 */
export const AuSol: React.FC<{
  x: number;
  children: React.ReactNode;
  opacity?: number;
  scale?: number;
  reflet?: number;
  y?: number; // élévation au-dessus du sol (objets qui flottent)
}> = ({x, children, opacity = 1, scale = 1, reflet = 0.25, y = 0}) => (
  <g opacity={opacity}>
    <g transform={`translate(${x} ${SOL - y}) scale(${scale})`}>{children}</g>
    {reflet > 0 && (
      <g mask="url(#masqueReflet)">
        <g opacity={reflet} style={{filter: 'blur(1.5px)'}} transform={`translate(${x} ${SOL + y}) scale(${scale} ${-scale})`}>
          {children}
        </g>
      </g>
    )}
  </g>
);

/** Objet qui flotte dans l'air (pas de reflet), coordonnées absolues */
export const EnLAir: React.FC<{x: number; y: number; scale?: number; opacity?: number; children: React.ReactNode}> = ({
  x,
  y,
  scale = 1,
  opacity = 1,
  children,
}) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${scale})`}>
    {children}
  </g>
);
