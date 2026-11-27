import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Couleur, couleur, MONO, W} from '../style';

// ——— Police : JetBrains Mono Bold (fichier local dans public/) ———
let policeChargee = false;
export const usePolice = () => {
  const [h] = React.useState(() => (policeChargee ? null : delayRender('police')));
  React.useEffect(() => {
    if (h === null) return;
    const f = new FontFace(MONO, `url(${staticFile('JetBrainsMono-Bold.ttf')})`, {weight: '700'});
    f.load()
      .then((ff) => {
        document.fonts.add(ff);
        policeChargee = true;
        continueRender(h);
      })
      .catch(() => continueRender(h));
  }, [h]);
};

export type Mot = {t: string; c: Couleur; s: number};
export type Phrase = {zone: 'haut' | 'verset' | 'citation'; ref: string | null; start: number; end: number; lines: Mot[][]};

const FONDU_MOT = 3; // 0,1 s
const FONDU_PHRASE = 8; // ~0,25 s

/** opacité d'une phrase (apparition avec son 1er mot, effacement en fondu à la fin) */
const opPhrase = (f: number, p: Phrase, fps: number, coupure?: number) => {
  const fin = Math.min(p.end, coupure ?? Infinity) * fps;
  return interpolate(f, [fin - FONDU_PHRASE, fin], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

const Lignes: React.FC<{p: Phrase; taille: number; espace: number; interligne: number; couleurForcee?: string; f: number; fps: number}> = ({
  p,
  taille,
  espace,
  interligne,
  couleurForcee,
  f,
  fps,
}) => (
  <>
    {p.lines.map((l, i) => (
      <div key={i} style={{whiteSpace: 'nowrap', lineHeight: `${interligne}px`, height: interligne}}>
        {l.map((m, j) => {
          const o = interpolate(f, [m.s * fps - 1, m.s * fps - 1 + FONDU_MOT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const col = couleurForcee ?? couleur(m.c);
          return (
            <span key={j} style={{opacity: o, color: col, textShadow: m.c !== 'w' || couleurForcee ? `0 0 14px ${col}66` : '0 0 10px rgba(232,236,241,0.18)'}}>
              {m.t}
              {j < l.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    ))}
  </>
);

/** Texte en haut, centré (12-20 % de la hauteur), mot par mot synchronisé avec la voix */
export const TexteHaut: React.FC<{phrases: Phrase[]; coupure?: number}> = ({phrases, coupure}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const actives = phrases.filter((p) => p.zone === 'haut' && t >= p.start - 0.1 && t < p.end && (coupure === undefined || t < coupure));
  return (
    <AbsoluteFill>
      {actives.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 250,
            width: W,
            textAlign: 'center',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 42,
            letterSpacing: '0.12em',
            color: C.texte,
            opacity: opPhrase(f, p, fps, coupure),
          }}
        >
          <Lignes p={p} taille={42} espace={0.12} interligne={82} f={f} fps={fps} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** Citation qui reste affichée (en or), au centre au-dessus du sol */
export const Citation: React.FC<{phrases: Phrase[]; y?: number}> = ({phrases, y = 760}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const actives = phrases.filter((p) => p.zone === 'citation' && t >= p.start - 0.1 && t < p.end);
  return (
    <AbsoluteFill>
      {actives.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: y,
            width: W,
            textAlign: 'center',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 50,
            letterSpacing: '0.1em',
            opacity: opPhrase(f, p, fps),
          }}
        >
          <Lignes p={p} taille={50} espace={0.1} interligne={92} couleurForcee={C.or} f={f} fps={fps} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/**
 * Carte de verset au centre, au-dessus du sol. Verset en blanc mot par mot ; référence en or, en petit, dessous.
 * Les pages successives d'un même verset partagent le même cadre.
 */
export const CarteVerset: React.FC<{phrases: Phrase[]; ref_: string; yCentre?: number; hauteur?: number}> = ({
  phrases,
  ref_,
  yCentre = 800,
  hauteur = 560,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const pages = phrases.filter((p) => p.zone === 'verset' && p.ref === ref_);
  if (!pages.length) return null;
  const debut = pages[0].start - 0.45;
  const fin = pages[pages.length - 1].end;
  if (t < debut || t > fin + 0.05) return null;
  const oCarte = interpolate(t, [debut, debut + 0.45, fin - 0.3, fin], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glisse = interpolate(t, [debut, debut + 0.6], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const page = pages.filter((p) => t >= p.start - 0.1 && t < p.end);
  const largeur = 900;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: (W - largeur) / 2,
          top: yCentre - hauteur / 2 + glisse,
          width: largeur,
          height: hauteur,
          borderRadius: 22,
          border: '2px solid rgba(232,236,241,0.22)',
          background: 'linear-gradient(180deg, rgba(14,20,32,0.82), rgba(8,12,20,0.82))',
          boxShadow: `0 0 40px rgba(245,183,49,0.10), inset 0 0 30px rgba(245,183,49,0.05)`,
          opacity: oCarte,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontWeight: 700,
        }}
      >
        <div style={{position: 'relative', height: hauteur - 150, width: largeur, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {page.map((p, i) => (
            <div key={i} style={{position: 'absolute', textAlign: 'center', fontSize: 40, letterSpacing: '0.06em', color: C.texte, opacity: opPhrase(f, p, fps)}}>
              <Lignes p={p} taille={40} espace={0.06} interligne={70} f={f} fps={fps} />
            </div>
          ))}
        </div>
        <div style={{fontSize: 27, letterSpacing: '0.18em', color: C.or, textShadow: `0 0 12px ${C.or}55`, marginTop: 10}}>{ref_}</div>
      </div>
    </AbsoluteFill>
  );
};
