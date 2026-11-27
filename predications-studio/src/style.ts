// Style « scène sombre néon » (repris de Studio-pov / Finance), adapté à MIDIGRAD.
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const SOL = Math.round(H * 0.78); // ligne d'horizon : 78 % de la hauteur

export const C = {
  fondHaut: '#05070B',
  fondBas: '#0B111C',
  halo: '#16233A',
  blanc: '#F4F6F9',
  texte: '#E8ECF1',
  gris: '#9AA3AE',
  // Code couleur MIDIGRAD
  or: '#F5B731', // Dieu, la Parole, la lumière
  rouge: '#FF4D3D', // blessure, offense
  vert: '#2ECC71', // libération, pardon reçu
  bleu: '#4DA3FF', // paix
} as const;

export type Couleur = 'w' | 'o' | 'r' | 'v' | 'b' | 'g';
export const couleur = (c: Couleur | undefined): string =>
  ({w: C.texte, o: C.or, r: C.rouge, v: C.vert, b: C.bleu, g: C.gris})[c ?? 'w'];

export const MONO = 'JetBrains Mono';

// Lissage « lent et élégant »
export const doux = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** progression 0→1 entre deux instants (en secondes), lissée */
export const prog = (tSec: number, a: number, b: number) => doux(clamp01((tSec - a) / (b - a)));
