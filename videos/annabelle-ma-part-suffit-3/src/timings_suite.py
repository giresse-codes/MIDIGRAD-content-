# Ajoute la suite du narrateur (audio/narrateur-suite.mp3) à timings.json, sans toucher aux timings existants.
# Méthode : Whisper medium int8 (sherpa-onnx) sur la suite seule (src/whisper_suite.json), alignement du texte
# (section « NARRATION (SUITE) » de texte-voixoff.txt) par difflib, placement des mots dans les zones de parole.
# Les temps sont exprimés dans la voix assemblée : suite placée 0,4 s après la fin de la voix d'origine.
import difflib, json, os, re, subprocess, unicodedata
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
v0 = load(os.path.join(ROOT, "audio", "voixoff-elevenlabs.mp3")); v = load(os.path.join(ROOT, "audio", "narrateur-suite.mp3"))
OFFS = round(len(v0) / SR + 0.4, 3)
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
SEG = json.load(open(os.path.join(HERE, "whisper_suite.json"), encoding="utf-8"))
src = open(os.path.join(ROOT, "texte-voixoff.txt"), encoding="utf-8").read()
txt = re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", [l for l in src.split("\n") if l.startswith("Narrateur (suite) : ")][0].split(" : ", 1)[1])).strip()
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
WT, WB = [], []
for k, s in enumerate(SEG):
    for x in s["text"].split():
        if norm(x): WT.append(norm(x)); WB.append(k)
ws = txt.split(); DT = [norm(x) for x in ws]; bi = [None] * len(ws)
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
T = [None] * len(ws)
for blk in sorted(set(bi)):
    g = [j for j in range(len(ws)) if bi[j] == blk]
    for j, (s, e) in zip(g, place([ws[j] for j in g], SEG[blk]["start"] - 0.05, SEG[blk]["end"] + 0.05)): T[j] = (round(s + OFFS, 2), round(e + OFFS, 2))
J = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))
J["tours"] = [t for t in J["tours"] if t["id"] != "N3"]
J["tours"].append({"id": "N3", "qui": "NARRATEUR", "debut": T[0][0], "fin": T[-1][1], "texte": txt, "source": "audio/narrateur-suite.mp3 (placée à " + str(OFFS) + " s dans la voix assemblée)",
                   "mots": [{"m": x, "t0": s, "t1": e} for x, (s, e) in zip(ws, T)]})
json.dump(J, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
print("N3", T[0][0], "→", T[-1][1], len(ws), "mots ; alignés :", sum(m.size for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks()), "/", len(ws))
