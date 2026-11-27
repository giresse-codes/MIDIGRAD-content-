import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, W} from '../style';
import {Scene} from './Scene';

/** Carte de fin MIDIGRAD (2 s) : logo en fondu lumineux doux + « EUD — CONSISTOIRE MIDIGRAD ». `debut` en secondes. */
export const CarteMidigrad: React.FC<{debut: number; duree?: number}> = ({debut, duree = 2}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps - debut;
  if (t < 0 || t > duree) return null;
  const o = interpolate(t, [0, 0.6, duree - 0.45, duree], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lueur = interpolate(t, [0, 0.9, duree], [0, 1, 0.8], {extrapolateRight: 'clamp'});
  const echelle = interpolate(t, [0, duree], [0.97, 1.0]);
  const oTexte = interpolate(t, [0.45, 0.95, duree - 0.45, duree], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const D = 420;
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Scene />
      {/* halo doré derrière le logo */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 360,
          top: 820 - 360,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.or}40 0%, ${C.or}12 40%, transparent 70%)`,
          opacity: lueur,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: W / 2 - D / 2,
          top: 820 - D / 2,
          width: D,
          height: D,
          borderRadius: '50%',
          overflow: 'hidden',
          transform: `scale(${echelle})`,
          boxShadow: `0 0 ${40 * lueur}px ${C.or}66`,
          filter: `brightness(${0.82 + 0.1 * lueur}) saturate(0.85)`,
        }}
      >
        <Img src={staticFile('logo-midigrad.png')} style={{width: '104%', height: '104%', marginLeft: '-2%', marginTop: '-2%'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1120,
          width: W,
          textAlign: 'center',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: '0.16em',
          color: C.texte,
          opacity: oTexte,
        }}
      >
        EUD — CONSISTOIRE <span style={{color: C.or, textShadow: `0 0 14px ${C.or}66`}}>MIDIGRAD</span>
      </div>
    </AbsoluteFill>
  );
};

/** Fondus doux par le noir autour de chaque coupure de scène (en secondes) */
export const FonduNoir: React.FC<{coupures: number[]; demi?: number; debut?: number; finNoir?: number}> = ({coupures, demi = 0.25, debut, finNoir}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  let o = 0;
  for (const c of coupures) o = Math.max(o, 1 - Math.abs(t - c) / demi);
  if (debut !== undefined) o = Math.max(o, 1 - t / 0.35);
  if (finNoir !== undefined && t >= finNoir) o = 1;
  return <AbsoluteFill style={{background: '#000', opacity: Math.max(0, Math.min(1, o))}} />;
};
