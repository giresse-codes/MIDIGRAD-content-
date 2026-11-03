# Timings mot à mot des nouveaux audios (version courte) : audio/annabelle.mp3 (tour A) et audio/pasteur-emmanuel.mp3 (tour E).
# Le tour N1 (narrateur d'ouverture, voixoff-elevenlabs.mp3) est conservé tel quel depuis timings.json.
# Méthode : Whisper medium int8 (sherpa-onnx, français) par segments de parole (src/whisper_*.json) ; le texte affiché suit
# la transcription, avec l'orthographe et la ponctuation du texte de référence (texte-voixoff.txt) là où les mots
# correspondent (difflib) ; chaque mot est placé dans les zones de parole de son segment, au prorata de sa longueur.
# Usage : python3 src/timings_v4.py
import difflib, json, os, re, subprocess, unicodedata
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def regions(v):
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
    return REG
def place(wl, a, b, REG):
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
src = open(os.path.join(ROOT, "texte-voixoff.txt"), encoding="utf-8").read().split("\n")
REF = {}
for l in src:
    m = re.match(r"^(Narrateur|Annabelle|Narrateur \(suite\)) : (.*)$", l)
    if m: REF.setdefault(m.group(1), []).append(re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", "", m.group(2))).strip())
def tour(tid, qui, audio, segs, ref, fix):
    v = load(os.path.join(ROOT, "audio", audio)); REG = regions(v); SEG = json.load(open(os.path.join(HERE, segs), encoding="utf-8"))
    tw, tb = [], []                                  # mots transcrits + segment
    for k, s in enumerate(SEG):
        t = s["text"]
        for a, b in fix: t = t.replace(a, b)
        for x in t.split():
            if norm(x): tw.append(x); tb.append(k)
    rw = " ".join(ref).split(); RN = [norm(x) for x in rw]; TN = [norm(x) for x in tw]
    out = list(tw)                                   # orthographe du texte de référence quand le mot correspond
    for m in difflib.SequenceMatcher(None, TN, RN, autojunk=False).get_matching_blocks():
        for k in range(m.size):
            r_ = rw[m.b + k]
            if len(norm(r_)) >= 4: out[m.a + k] = r_                       # mots courts (a/à, la/l'a) : on garde la transcription
            else: out[m.a + k] = re.sub(r"[,.;:!?…»]*$", "", tw[m.a + k]) + re.search(r"[,.;:!?…»]*$", r_).group(0)
    T = [None] * len(out)
    for blk in sorted(set(tb)):
        g = [j for j in range(len(out)) if tb[j] == blk]
        for j, (s, e) in zip(g, place([out[j] for j in g], SEG[blk]["start"] - 0.05, SEG[blk]["end"] + 0.05, REG)): T[j] = (round(s, 2), round(e, 2))
    ok = sum(m.size for m in difflib.SequenceMatcher(None, TN, RN, autojunk=False).get_matching_blocks())
    print(tid, qui, T[0][0], "→", T[-1][1], len(out), "mots ;", ok, "conformes au texte de référence")
    return {"id": tid, "qui": qui, "fichier": "audio/" + audio, "debut": T[0][0], "fin": T[-1][1], "texte": " ".join(out),
            "mots": [{"m": x, "t0": s, "t1": e} for x, (s, e) in zip(out, T)]}
J = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))
N1 = next(t for t in J["tours"] if t["id"] == "N1"); N1["fichier"] = "audio/voixoff-elevenlabs.mp3"
# corrections vérifiées à l'écoute (fenêtres plus longues) : coupures de Whisper et mots mal entendus
A = tour("A", "ANNABELLE", "annabelle.mp3", "whisper_annabelle.json", REF["Annabelle"],
         [("J'ai jugé ma belle-mère pour...", "J'ai jugé ma belle-mère,"), ("J'ai condamné ma belle-mère pour", "J'ai condamné ma belle-mère,"), ("pour compris contre", "pour qu'on prie contre"),
          ("Galat,", "Galates,"), ("Bien aimé", "Bien-aimés"), ("bien aimé", "bien-aimés"), ("Moi, pareil à", "Moi, pareille à"), ("crucifiée", "crucifié"), ("Romain chapitre", "Romains, chapitre"), ("J'la voyais", "Je la voyais")])
E = tour("E", "PASTEUR EMMANUEL", "pasteur-emmanuel.mp3", "whisper_emmanuel.json", REF["Narrateur"][1:] + REF.get("Narrateur (suite)", []),
         [("Bien aimé", "Bien-aimés"), ("bien aimé", "bien-aimés"), ("Paris-Stalla", "Paris Talla"), ("Paris Stalla", "Paris Talla"), ("Paris-Talla", "Paris Talla")])
json.dump({"methode": "Whisper medium int8 (sherpa-onnx, français) par segments VAD ; orthographe du texte de référence quand les mots correspondent ; secondes, relatives à chaque fichier audio",
           "tours": [N1, A, E]}, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
