import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__)); from caps_src import O, S
MAX = 64
out = []
for e in S:
    c, a, b, txt = e[:4]; verse = len(e) > 4
    # découpe en propositions (ponctuation), puis regroupe jusqu'à MAX ; une proposition trop longue est coupée en parts égales
    parts = [x.strip() for x in re.split(r"(?<=[.?!:;,…])\s+(?!»)", txt) if x.strip()]
    pieces = []
    for p in parts:
        w = p.split(); n = -(-len(p) // MAX)
        if n > 1:
            k = -(-len(w) // n); pieces += [" ".join(w[i:i + k]) for i in range(0, len(w), k)]
        else: pieces.append(p)
    chunks = []
    for p in pieces:
        if chunks and len(chunks[-1]) + 1 + len(p) <= MAX and not re.search(r"[.?!]»?$", chunks[-1]): chunks[-1] += " " + p
        elif chunks and len(chunks[-1]) + 1 + len(p) <= 40: chunks[-1] += " " + p
        else: chunks.append(p)
    if len(chunks) > 1 and len(chunks[-1]) < 12: last = chunks.pop(); chunks[-1] += " " + last
    tot = sum(len(x) + 4 for x in chunks); t = a
    for x in chunks:
        d = (b - a) * (len(x) + 4) / tot
        out.append([round(O[c] + t, 2), round(O[c] + t + d, 2), x, 1 if verse else 0]); t += d
# pas de chevauchement
for i in range(len(out) - 1):
    if out[i][1] > out[i + 1][0]: out[i][1] = out[i + 1][0]
open(sys.argv[1], "w").write("window.V3_CAPS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "sous-titres; plus long:", max(len(x[2]) for x in out))
