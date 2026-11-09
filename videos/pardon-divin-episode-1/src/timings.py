# Timings mot à mot de l'épisode 1 (audio/ep1.mp3, voix de Wilfried utilisée telle quelle).
# Méthode : Whisper medium int8 (sherpa-onnx, français) par segments de parole (src/whisper_ep1.json) ;
# alignement du texte (texte-voixoff.txt, sans les indications entre crochets) sur la transcription (difflib) ;
# chaque mot est placé dans les zones de parole de son segment, au prorata de sa longueur.
# Usage : python3 src/timings.py  → timings.json
import difflib, json, os, re, subprocess, unicodedata
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "audio", "ep1.mp3"), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
v = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
n = SR // 100; db = 20 * np.log10(np.sqrt((v[:len(v) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
sp = db > max(np.percentile(db, 20) + 8, -45); REG, i = [], 0
while i < len(sp):
    if sp[i]:
        j = i
        while j < len(sp) and sp[j]: j += 1
        if REG and i / 100 - REG[-1][1] < 0.12: REG[-1][1] = j / 100
        else: REG.append([i / 100, j / 100])
        i = j
    else: i += 1
SEG = json.load(open(os.path.join(HERE, "whisper_ep1.json"), encoding="utf-8"))
txt = open(os.path.join(ROOT, "texte-voixoff.txt"), encoding="utf-8").read()
body = "\n".join(l for l in txt.split("\n") if not l.startswith("#") and l.strip())
words = re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", body)).strip().split()
WT, WB = [], []
for k, s in enumerate(SEG):
    for x in s["text"].split():
        if norm(x): WT.append(norm(x)); WB.append(k)
DT = [norm(x) for x in words]; bi = [None] * len(words)
for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks():
    for k in range(m.size): bi[m.a + k] = WB[m.b + k]
for k in range(len(bi)):
    if bi[k] is None: bi[k] = bi[k - 1] if k and bi[k - 1] is not None else next(x for x in bi[k:] if x is not None)
for k in range(1, len(bi)): bi[k] = max(bi[k], bi[k - 1])
def place(wl, a, b):
    reg = [[max(a, r0), min(b, r1)] for r0, r1 in REG if min(b, r1) - max(a, r0) > 0.02] or [[a, b]]
    tot = sum(e - s for s, e in reg); wt = [len(norm(x)) + 2.5 for x in wl]; W = sum(wt); out, acc = [], 0
    for x in wt:
        p0, p1 = acc / W * tot, (acc + x) / W * tot; acc += x; r = []
        for p in (p0, p1 - 1e-6):
            for s, e in reg:
                if p <= e - s + 1e-6: r.append(s + p); break
                p -= e - s
            else: r.append(reg[-1][1])
        out.append(r)
    return out
T = [None] * len(words)
for blk in sorted(set(bi)):
    g = [j for j in range(len(words)) if bi[j] == blk]
    for j, (s, e) in zip(g, place([words[j] for j in g], SEG[blk]["start"] - 0.05, SEG[blk]["end"] + 0.05)): T[j] = (round(s, 2), round(e, 2))
ok = sum(m.size for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks())
json.dump({"fichier": "audio/ep1.mp3 (voix de Wilfried telle quelle)", "duree": round(len(v) / SR, 2),
           "methode": "Whisper medium int8 (sherpa-onnx, français) par segments VAD + alignement du texte (difflib) + zones de parole ; secondes",
           "mots": [{"m": x, "t0": s, "t1": e} for x, (s, e) in zip(words, T)]}, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
print(len(words), "mots ;", ok, "reconnus par Whisper ; de", T[0][0], "à", T[-1][1], "s")
