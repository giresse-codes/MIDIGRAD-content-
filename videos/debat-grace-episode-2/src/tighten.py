# Raccourcit les silences de la voix off : pauses internes ≤ 0,3 s, changements de réplique (≥ 1,2 s) → 0,55 s.
# Usage : python3 tighten.py voix.wav regions.json voix_serree.wav cuts.json
import json, sys, wave, numpy as np
src, regp, outp, cutp = sys.argv[1:5]
w = wave.open(src); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)
R = json.load(open(regp))
cuts = []  # intervalles retirés (temps de la voix d'origine)
for (_, e), (s, _) in zip(R, R[1:]):
    g = s - e; cap = 0.55 if g >= 1.2 else 0.3
    if g > cap + 0.02: cuts.append([round(e + cap / 2, 3), round(s - cap / 2, 3)])
keep, t = [], 0.0
for a, b in cuts: keep.append([t, a]); t = b
keep.append([t, len(x) / sr])
fade = int(0.01 * sr); out = []
for a, b in keep:
    seg = x[int(a * sr):int(b * sr)].copy()
    if len(seg) > 2 * fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    out.append(seg)
y = np.concatenate(out).astype(np.int16)
o = wave.open(outp, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(y.tobytes()); o.close()
json.dump(cuts, open(cutp, "w"))
print(f"{len(cuts)} pauses raccourcies : {len(x)/sr:.1f} s → {len(y)/sr:.1f} s")
