# Timings mot à mot de la nouvelle voix off (version complète, utilisée telle quelle).
# Usage : python3 timings.py <voix.mp3>  → ../timings.json, ../audio/voixoff.wav (non versionné)
# Méthode : transcription Whisper medium (sherpa-onnx) par blocs de 2-7 s coupés sur les pauses (whisper_blocs.tsv),
# alignement du texte exact (texte-voixoff.txt) sur la transcription (difflib), puis placement de chaque mot
# dans les zones de parole (énergie, pas de 10 ms) de son bloc, au prorata de sa longueur.
import difflib, json, os, re, subprocess, sys, unicodedata, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000
WAV = os.path.join(ROOT, "audio", "voixoff.wav")
if len(sys.argv) > 1:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", WAV], check=True)
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
json.dump(REG, open(os.path.join(HERE, "regions.json"), "w"))
# tours de parole : bornes vérifiées à l'écoute (Whisper sur fenêtres courtes autour de chaque changement de voix)
BORNES = [("N1", "NARRATEUR", 0.0, 8.8), ("01", "ANNABELLE", 8.8, 12.6), ("02", "PASTEUR YANNICK", 12.6, 16.2), ("03", "ANNABELLE", 16.2, 38.2),
          ("04", "PASTEUR YANNICK", 38.2, 109.3), ("05", "ANNABELLE", 109.3, 119.9), ("06", "PASTEUR YANNICK", 119.9, 263.8),
          ("07", "ANNABELLE", 263.8, 274.4), ("08", "PASTEUR YANNICK", 274.4, 332.6), ("09", "ANNABELLE", 332.6, 335.0), ("N2", "NARRATEUR", 335.0, len(v) / SR)]
def snap(a, b):
    r = [x for x in REG if x[1] > a and x[0] < b]; return round(max(a, r[0][0]), 2), round(min(b, r[-1][1]), 2)
# texte exact, sans crochets d'émotion ni en-tête
src = open(os.path.join(ROOT, "texte-voixoff.txt"), encoding="utf-8").read().split("\n")
TXT = [re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", l.split(" : ", 1)[1])).strip() for l in src if re.match(r"^(Narrateur|Annabelle|Pasteur Yannick) : ", l)]
assert len(TXT) == len(BORNES)
HL = {"*": ["réellement sauvée", "nature de Christ", "l'homme est faux", "repentance", "imitateurs de Christ", "je lui ai pardonné", "demander pardon",
            "supporter les uns les autres"],
      "04": ["dureté de ton cœur", "l'amour", "la vérité", "pardonner"], "06": ["pas différente"],
      "N2": ["santé optimale", "toute chose", "pas différents", "pardonnions"]}
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
def pages(ws):
    sents, cur = [], []
    for k, x in enumerate(ws):
        cur.append(k)
        if re.search(r"[.?!:…»]$", x) and not (x.endswith(":") and k + 1 < len(ws) and ws[k + 1].startswith("«")): sents.append(cur); cur = []
    if cur: sents.append(cur)
    def cut(s):
        if len(s) <= 25: return [s]
        c = [k for k in range(3, len(s) - 3) if ws[s[k]].endswith(",")] or [len(s) // 2]
        m = min(c, key=lambda k: abs(k + 1 - len(s) / 2)) + 1; return cut(s[:m]) + cut(s[m:])
    out = []
    for s in sents:
        for p in cut(s):
            if out and len(out[-1]) + len(p) <= 12: out[-1] += p
            else: out.append(p)
    return [[p[0], p[-1] + 1] for p in out]
# alignement sur la transcription
BL = [(float(a), float(b), t) for a, b, t in (l.rstrip("\n").split("\t") for l in open(os.path.join(HERE, "whisper_blocs.tsv"), encoding="utf-8"))]
WT, WB = [], []
for k, (a, b, t) in enumerate(BL):
    for x in t.split():
        if norm(x): WT.append(norm(x)); WB.append(k)
words = []
for (tid, qui, a, b), t in zip(BORNES, TXT):
    for x in t.split(): words.append([tid, x])
DT = [norm(x) for _, x in words]
bi = [None] * len(words)
for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks():
    for k in range(m.size): bi[m.a + k] = WB[m.b + k]
for k in range(len(bi)):                      # mots non reconnus : bloc du voisin précédent (ou suivant)
    if bi[k] is None: bi[k] = bi[k - 1] if k and bi[k - 1] is not None else next(x for x in bi[k:] if x is not None)
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
    a, b = snap(a, b); ws = t.split(); idx = list(range(k0, k0 + len(ws))); k0 += len(ws); T = [None] * len(ws)
    for blk in sorted(set(bi[k] for k in idx)):
        g = [j for j, k in enumerate(idx) if bi[k] == blk]
        ba, bb = max(a, BL[blk][0]), min(b, BL[blk][1])
        if bb - ba < 0.1: ba, bb = (a, min(b, a + 0.4)) if BL[blk][1] <= a + 0.1 else (max(a, b - 0.4), b)
        for j, (s, e) in zip(g, place([ws[j] for j in g], ba, bb)): T[j] = (round(s, 2), round(e, 2))
    hl = [0] * len(ws); nw = [norm(x) for x in ws]
    for ph in HL["*"] + HL.get(tid, []):
        q = [norm(x) for x in ph.split()]
        for s in range(len(ws) - len(q) + 1):
            if nw[s:s + len(q)] == q:
                for j in range(s, s + len(q)): hl[j] = 1
    TOURS.append({"id": tid, "qui": qui, "debut": a, "fin": b, "texte": t, "pages": pages(ws),
                  "mots": [{"m": x, "t0": s, "t1": e, **({"hl": 1} if h else {})} for x, (s, e), h in zip(ws, T, hl)]})
json.dump({"fichier": "audio/voixoff.wav (voix off ElevenLabs telle quelle, 48 kHz mono)", "duree": round(len(v) / SR, 2),
           "methode": "Whisper medium int8 (sherpa-onnx, français) par blocs coupés sur les pauses + alignement du texte exact (difflib) + zones de parole ; secondes",
           "tours": TOURS}, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
for r in TOURS: print(r["id"], r["qui"], r["debut"], "→", r["fin"], len(r["mots"]), "mots", len(r["pages"]), "pages, max", max(b - a for a, b in r["pages"]))
print("mots alignés :", sum(m.size for m in difflib.SequenceMatcher(None, DT, WT, autojunk=False).get_matching_blocks()), "/", len(DT))
