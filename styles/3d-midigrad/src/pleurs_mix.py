# Pose les extraits de pleurs d'Annabelle sous la voix du pasteur pendant ses gros plans.
# pleurs_bed(fenetres, voix, sr, regions) → piste mono : extraits à −22/−26 dB sous la voix, réverbération de petite pièce,
# espacements irréguliers (jamais deux fois le même extrait de suite), fondus de 0,5 s en entrée / sortie de chaque gros plan.
# Les fenêtres doivent déjà exclure la lecture des versets.
# Usage démo : python3 pleurs_mix.py 218.5 233.5  → ../audio/extrait-pleurs-15s.wav
import json, os, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); DIR = os.path.join(ROOT, "audio", "pleurs-extraits")
def lit(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; sr = w.getframerate(); w.close(); return x, sr
def banque():
    B = [lit(os.path.join(DIR, x["fichier"]))[0] for x in json.load(open(os.path.join(DIR, "pleurs.json"), encoding="utf-8"))]
    B = [x for x in B if len(x) > 0.25 * 48000]                      # les extraits trop courts sont écartés
    ext = os.path.join(ROOT, "audio", "pleurs.mp3")                   # fichier optionnel fourni par l'utilisateur
    if os.path.exists(ext):
        import subprocess, tempfile
        t = tempfile.mktemp(suffix=".wav"); subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", ext, "-ac", "1", "-ar", "48000", t], check=True)
        x, _ = lit(t); os.remove(t); L = 48000 * 2
        B += [x[i:i + L] for i in range(0, len(x) - L, L)]
    return B
def rms(x): return float(np.sqrt((x ** 2).mean()) + 1e-9)
def piece(sr, seed=3):                                               # réponse impulsionnelle de petite pièce (≈ 0,3 s)
    r = np.random.default_rng(seed); n = int(0.32 * sr); t = np.arange(n) / sr
    ir = r.standard_normal(n) * np.exp(-t / 0.07); ir[:int(0.004 * sr)] = 0; ir /= np.abs(ir).sum() / 6; ir[0] = 1.0; return ir
def pleurs_bed(fenetres, voix, sr, regions, seed=7):
    B = banque(); r = np.random.default_rng(seed); out = np.zeros(len(voix), np.float32)
    vr = rms(voix[np.abs(voix) > 0.01]) if (np.abs(voix) > 0.01).any() else 0.05
    last = -1
    for a, b in fenetres:
        lane = np.zeros(len(voix), np.float32); t = a + r.uniform(0.4, 1.2)
        while t < b - 0.6:
            # on préfère tomber dans une respiration du pasteur pour garder sa voix intelligible
            g = [e0 for (_, e0), (s1, _) in zip(regions, regions[1:]) if s1 - e0 > 0.18 and t <= e0 <= t + 1.5]
            if g: t = g[0] + 0.02
            k = int(r.integers(len(B)))
            if k == last: k = (k + 1) % len(B)
            last = k; x = B[k] * (vr / rms(B[k])) * 10 ** (r.uniform(-26, -22) / 20)
            i = int(t * sr); lane[i:i + len(x)] += x[:len(lane) - i]
            t += len(x) / sr + r.uniform(0.9, 3.4)
        f = int(0.5 * sr); i0, i1 = int(a * sr), int(b * sr); env = np.zeros(len(voix), np.float32); env[i0:i1] = 1
        env[i0:i0 + f] = np.linspace(0, 1, f); env[i1 - f:i1] = np.linspace(1, 0, f); out += lane * env
    wet = np.convolve(out, piece(sr))[:len(out)]
    return (0.75 * out + 0.25 * wet).astype(np.float32)
if __name__ == "__main__":
    A, B = float(sys.argv[1]), float(sys.argv[2]); v, sr = lit(os.path.join(ROOT, "audio", "voixoff.wav"))
    seg = v[int(A * sr):int(B * sr)].copy()
    reg = [[s - A, e - A] for s, e in json.load(open(os.path.join(HERE, "regions.json"))) if e > A and s < B]
    bed = pleurs_bed([(0.5, B - A - 0.5)], seg, sr, reg)
    f = int(0.3 * sr); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    mix = seg + bed; tmp = os.path.join(ROOT, "audio", "_demo.wav"); o = wave.open(tmp, "wb")
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
    import subprocess
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1",
                    os.path.join(ROOT, "audio", "extrait-pleurs-15s.wav")], check=True); os.remove(tmp)
    print("ok : audio/extrait-pleurs-15s.wav", round(B - A, 2), "s ;", "niveau pleurs/voix :", round(20 * np.log10(rms(bed[np.abs(bed) > 1e-4]) / rms(seg[np.abs(seg) > 0.01])), 1), "dB")
