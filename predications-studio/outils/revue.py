"""Revue automatique d'une prédication rendue : obscurité du fond, nombre de couleurs à l'écran.
Usage : python3 revue.py video.mp4 reference.mp4 [début carte MIDIGRAD en s]"""
import sys, subprocess, numpy as np
def images(path, fps, w=270, h=480):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
vid, ref = images(sys.argv[1], 2), images(sys.argv[2], 1)
def fond(a):  # luminance médiane (le fond domine) et 25e centile, hors objets
    y = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2])
    return np.median(y), np.percentile(y, 25)
v = np.array([fond(f) for f in vid[2:-6]]); r = np.array([fond(f) for f in ref[2:-2]])
print(f"fond : vidéo médiane {np.median(v[:,0]):.1f}/255 | référence {np.median(r[:,0]):.1f}/255")
# couleurs : pixels saturés et lumineux classés par teinte
TEINTES = {"or": (35, 50), "rouge": (-12, 12), "vert": (130, 160), "bleu": (200, 225)}
import colorsys
def couleurs(f):
    a = f.reshape(-1, 3).astype(float) / 255
    mx, mn = a.max(1), a.min(1); s = (mx - mn) / np.maximum(mx, 1e-6)
    m = (s > 0.45) & (mx > 0.45); px = a[m]
    if len(px) == 0: return set()
    r, g, b = px[:, 0], px[:, 1], px[:, 2]; mxp = px.max(1); d = mxp - px.min(1)
    h = np.where(mxp == r, ((g - b) / d) % 6, np.where(mxp == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    h = np.where(h > 300, h - 360, h)
    return {k for k, (lo, hi) in TEINTES.items() if ((h >= lo) & (h <= hi)).sum() > 60}
carte = float(sys.argv[3]) if len(sys.argv) > 3 else 1e9  # le logo MIDIGRAD (couleurs officielles) est exclu du compte
pire = max(((len(couleurs(f)), i / 2, couleurs(f)) for i, f in enumerate(vid) if i / 2 < carte), key=lambda x: x[0])
print(f"couleurs vives max à l'écran : {pire[0]} (+ blanc/gris) à t={pire[1]:.1f}s {sorted(pire[2])}")
