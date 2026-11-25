"""Aligne les mots de faster-whisper sur texte-voixoff.txt.
Sortie words.json : [{w (orthographe du texte de référence si identique), s, e}]"""
import json, re, difflib, unicodedata
tr = json.load(open("transcript_edit.json"))
ref = open("ref.txt").read()

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)

ww = [x for s in tr for x in s["words"]]
hyp = [(x["w"].strip(), x["s"], x["e"], x["p"]) for x in ww if norm(x["w"])]
# découpe les tokens à apostrophe/trait d'union pareil des deux côtés : on compare token par token « mots »
raw = re.findall(r"\S+", ref); reft = []; pre = ""
for t in raw:
    if norm(t):
        reft.append(pre + t); pre = ""
    elif t == "«": pre = "«\u00a0"
    elif reft: reft[-1] += "\u00a0" + t
A = [norm(t) for t in reft]; B = [norm(h[0]) for h in hyp]
sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
out = []; diffs = []
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op == "equal":
        for k in range(a1 - a0):
            out.append({"w": reft[a0 + k], "s": hyp[b0 + k][1], "e": hyp[b0 + k][2]})
    elif op == "replace" and (a1 - a0) == (b1 - b0):
        for k in range(a1 - a0):
            out.append({"w": reft[a0 + k], "s": hyp[b0 + k][1], "e": hyp[b0 + k][2], "chk": hyp[b0 + k][0]})
        diffs.append(("~", " ".join(reft[a0:a1]), " ".join(h[0] for h in hyp[b0:b1])))
    elif op in ("replace", "insert"):
        # ce qui est réellement dit
        if op == "replace":
            # répartir les mots de référence sur la durée si même contenu approximatif
            diffs.append(("R", " ".join(reft[a0:a1]), " ".join(h[0] for h in hyp[b0:b1])))
        else:
            diffs.append(("+", "", " ".join(h[0] for h in hyp[b0:b1])))
        if op == "replace":  # mêmes mots, autre graphie (chiffres, mot mal reconnu) : texte de référence réparti sur la durée
            s0, e0 = hyp[b0][1], hyp[b1 - 1][2]; n = a1 - a0
            for k in range(n):
                out.append({"w": reft[a0 + k], "s": s0 + (e0 - s0) * k / n, "e": s0 + (e0 - s0) * (k + 1) / n})
        else:
            for k in range(b0, b1):
                if hyp[k][3] >= 0.7: out.append({"w": hyp[k][0], "s": hyp[k][1], "e": hyp[k][2], "said": 1})
    elif op == "delete":
        diffs.append(("-", " ".join(reft[a0:a1]), ""))
json.dump(out, open("words.json", "w"), ensure_ascii=False, indent=0)
print(len(out), "mots ;", len(diffs), "différences")
for d in diffs: print(d)
