# Banque de « pleurs » tirée de la voix d'Annabelle : uniquement les respirations tremblantes / souffles entre ses mots
# (aucun mot), repérés grâce aux timings mot à mot et à l'énergie (pas de 10 ms).
# Usage : python3 pleurs.py  → ../audio/pleurs-extraits/*.wav  (+ pleurs.json : origine de chaque extrait)
import json, os, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); OUT = os.path.join(ROOT, "audio", "pleurs-extraits")
w = wave.open(os.path.join(ROOT, "audio", "voixoff.wav")); sr = w.getframerate()
v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
n = sr // 100; db = 20 * np.log10(np.sqrt((v[:len(v) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
TJ = json.load(open(os.path.join(ROOT, "timings.json")))
# pauses entre deux mots d'Annabelle, dans ses répliques émues (03 : « la voix se brise », 05 : en pleurs, 07)
CAND = []
for r in TJ["tours"]:
    if r["id"] not in ("03", "05", "07"): continue
    R = [g for g in json.load(open(os.path.join(HERE, "regions.json"))) if g[1] > r["debut"] and g[0] < r["fin"]]
    for (_, e0), (s1, _) in zip(R, R[1:]):
        if s1 - e0 > 0.3:
            x = max((m for m in r["mots"] if m["t0"] < e0), key=lambda m: m["t0"]); y = min((m for m in r["mots"] if m["t0"] >= e0), key=lambda m: m["t0"])
            CAND.append((r["id"], x["m"], y["m"], e0 - 0.12, s1 + 0.12))
def lp(x, fc=6000):                                   # passe-bas doux (2 × 1er ordre)
    a = np.exp(-2 * np.pi * fc / sr); y = x.copy()
    for _ in range(2):
        z = np.empty_like(y); s = 0.0
        for i, u in enumerate(y): s = (1 - a) * u + a * s; z[i] = s
        y = z
    return y
os.makedirs(OUT, exist_ok=True); INFO = []
for tid, m0, m1, a, b in CAND:
    i0, i1 = int(a * 100), int(b * 100); seg = db[i0:i1]
    # on coupe après le silence qui suit la fin du mot précédent et avant celui qui précède le mot suivant
    q = np.where(seg < -70)[0]
    if len(q) < 2: continue
    s, e = q[0], q[-1]
    core = seg[s:e]
    if e - s < 25 or core.max() < -64 or core.max() > -44: continue    # trop court, inaudible, ou trop fort (≈ parole)
    on = np.where(core > -66)[0]; s2, e2 = s + on[0] - 4, s + on[-1] + 6
    x = v[int((i0 + s2) / 100 * sr):int((i0 + e2) / 100 * sr)].copy()
    f = int(0.05 * sr); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    x = lp(x); x *= 0.5 / (np.abs(x).max() + 1e-9)
    name = f"pleur-{len(INFO) + 1:02d}.wav"; o = wave.open(os.path.join(OUT, name), "wb")
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((x * 32767).astype(np.int16).tobytes()); o.close()
    INFO.append({"fichier": name, "replique": tid, "entre": [m0, m1], "debut": round((i0 + int(s2)) / 100, 2), "fin": round((i0 + int(e2)) / 100, 2), "niveau_max_db": round(float(core.max()), 1)})
json.dump(INFO, open(os.path.join(OUT, "pleurs.json"), "w"), ensure_ascii=False, indent=1)
for x in INFO: print(x)
