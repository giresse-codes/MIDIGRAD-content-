# Timings mot à mot de la voix off ElevenLabs (utilisée telle quelle).
# Usage : python3 src/timings.py <voix.mp3> <segments.json>  → timings.json, audio/voixoff.wav (non versionné)
# Méthode : Whisper medium int8 (sherpa-onnx, français) sur les segments de parole (VAD Silero), alignement du texte
# exact (texte-voixoff.txt, sans les balises) sur la transcription (difflib), puis placement de chaque mot dans les
# zones de parole (énergie, pas de 10 ms) de son segment, au prorata de sa longueur.
import difflib, json, os, re, subprocess, sys, unicodedata, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000
WAV = os.path.join(ROOT, "audio", "voixoff.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", WAV], check=True)
SEG = json.load(open(sys.argv[2], encoding="utf-8"))
json.dump(SEG, open(os.path.join(HERE, "whisper_segments.json"), "w"), ensure_ascii=False, indent=0)
w = wave.open(WAV); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
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
D = len(v) / SR
BORNES = [("N1", "NARRATEUR", 0.0, 6.15), ("A", "ANNABELLE", 6.15, 320.5), ("N2", "NARRATEUR", 320.5, D)]
src = open(os.path.join(ROOT, "texte-voixoff.txt"), encoding="utf-8").read().split("\n")
TXT = [re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", l.split(" : ", 1)[1])).strip() for l in src if re.match(r"^(Narrateur|Annabelle) : ", l)]
assert len(TXT) == 3
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
WT, WB = [], []
for k, s in enumerate(SEG):
    for x in s["text"].split():
        if norm(x): WT.append(norm(x)); WB.append(k)
words = [[tid, x] for (tid, *_), t in zip(BORNES, TXT) for x in t.split()]
DT = [norm(x) for _, x in words]
bi = [None] * len(words)
for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks():
    for k in range(m.size): bi[m.a + k] = WB[m.b + k]
for k in range(len(bi)):
    if bi[k] is None:
        p = bi[k - 1] if k and bi[k - 1] is not None else None
        nx = next((x for x in bi[k:] if x is not None), p)
        bi[k] = p if p is not None and (nx is None or nx == p or not norm(words[k][1])) else (p if p is not None and SEG[nx]["start"] - SEG[p]["end"] < 0.05 else nx if p is None else p)
for k in range(1, len(bi)): bi[k] = max(bi[k], bi[k - 1])
def place(ws, a, b):
    reg = [[max(a, r0), min(b, r1)] for r0, r1 in REG if min(b, r1) - max(a, r0) > 0.02] or [[a, b]]
    tot = sum(e - s for s, e in reg); wt = [len(norm(x)) + 2.5 for x in ws]; W = sum(wt); out, acc = [], 0
    for x in wt:
        p0, p1 = acc / W * tot, (acc + x) / W * tot; acc += x; r = []
        for p in (p0, p1 - 1e-6):
            for s, e in reg:
                if p <= e - s + 1e-6: r.append(s + p); break
                p -= e - s
            else: r.append(reg[-1][1])
        out.append(r)
    return out
TOURS = []; k0 = 0
for (tid, qui, a, b), t in zip(BORNES, TXT):
    ws = t.split(); idx = list(range(k0, k0 + len(ws))); k0 += len(ws); T = [None] * len(ws)
    for blk in sorted(set(bi[k] for k in idx)):
        g = [j for j, k in enumerate(idx) if bi[k] == blk]
        ba, bb = max(a, SEG[blk]["start"] - 0.05), min(b, SEG[blk]["end"] + 0.05)
        for j, (s, e) in zip(g, place([ws[j] for j in g], ba, bb)): T[j] = (round(s, 2), round(e, 2))
    TOURS.append({"id": tid, "qui": qui, "debut": round(T[0][0], 2), "fin": round(T[-1][1], 2), "texte": t,
                  "mots": [{"m": x, "t0": s, "t1": e} for x, (s, e) in zip(ws, T)]})
json.dump({"fichier": "audio/voixoff.wav (voix off ElevenLabs telle quelle, 48 kHz mono)", "duree": round(D, 2),
           "methode": "Whisper medium int8 (sherpa-onnx, français) sur segments VAD + alignement du texte exact (difflib) + zones de parole ; secondes",
           "tours": TOURS}, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
for r in TOURS: print(r["id"], r["qui"], r["debut"], "→", r["fin"], len(r["mots"]), "mots")
print("mots alignés :", sum(m.size for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks()), "/", len(DT))
