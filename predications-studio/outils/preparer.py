"""Aligne le texte d'écran (texte-ecran.txt) sur l'horodatage mot à mot de la voix (faster-whisper).
Usage : python3 preparer.py mots.json texte-ecran.txt sortie.json
Alignement caractère par caractère (difflib), insensible aux accents / ponctuation / chiffres écrits."""
import json, re, sys, unicodedata, difflib

CHIFFRES = {"3": "trois", "13": "treize", "50": "cinquante", "20": "vingt"}

def norm(s):
    s = s.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.replace("œ", "oe")
    return re.sub(r"[^a-z0-9]", "", s)

def chiffres(s):
    return re.sub(r"\d+", lambda m: CHIFFRES.get(m.group(0), m.group(0)), s)

mots = json.load(open(sys.argv[1]))
lignes = [l.rstrip("\n") for l in open(sys.argv[2], encoding="utf-8") if l.strip() and not l.startswith("#")]

# flux de caractères de la voix
vc, vidx = [], []
for i, m in enumerate(mots):
    n = norm(chiffres(m["w"]))
    vc.append(n); vidx += [i] * len(n)
voix = "".join(vc)

phrases, jetons = [], []
for l in lignes:
    zone, texte = [x.strip() for x in l.split("::", 1)]
    ref = None
    jusqua = None
    if ">" in zone: zone, jusqua = zone.split(">", 1)
    if zone.startswith("verset="):
        zone, ref = "verset", zone.split("=", 1)[1].strip()
    lines = []
    for seg in texte.split("/"):
        ligne = []
        for tok in seg.split():
            c = "w"
            m = re.match(r"^([rovbg]):(.+)$", tok)
            if m: c, tok = m.group(1), m.group(2)
            ancre = None
            if "@" in tok: tok, ancre = tok.split("@", 1)
            j = {"t": tok, "c": c, "ancre": ancre}
            ligne.append(j); jetons.append(j)
        lines.append(ligne)
    phrases.append({"zone": zone, "ref": ref, "lines": lines, "jusqua": jusqua})

# flux de caractères de l'écran
ec, eidx = [], []
for k, j in enumerate(jetons):
    n = norm(chiffres(j["t"]))
    j["n"] = len(n)
    ec.append(n); eidx += [k] * len(n)
ecran = "".join(ec)

sm = difflib.SequenceMatcher(None, ecran, voix, autojunk=False)
corr = {}
for a, b, size in sm.get_matching_blocks():
    for d in range(size): corr[a + d] = b + d
pos, manquants = 0, []
for k, j in enumerate(jetons):
    t = None
    for d in range(j["n"]):
        if pos + d in corr:
            vi = vidx[corr[pos + d]]
            # temps du début du mot de voix + proportion dans le mot
            m = mots[vi]
            debut_mot = vidx.index(vi)
            frac = (corr[pos + d] - debut_mot) / max(1, len(vc[vi]))
            t = m["s"] + frac * (m["e"] - m["s"]) - d * 0.06
            break
    j["s"] = t
    if t is None: manquants.append(j["t"])
    pos += j["n"]
# ponctuation seule (« » :) : collée au mot voisin
for k, j in enumerate(jetons):
    if j["s"] is None and j["n"] == 0:
        if j["t"] == "«":
            j["s"] = next((jetons[i]["s"] for i in range(k + 1, len(jetons)) if jetons[i]["s"] is not None), None)
        else:
            j["s"] = next((jetons[i]["s"] for i in range(k - 1, -1, -1) if jetons[i]["s"] is not None), None)
        if j["s"] is not None: manquants.remove(j["t"])
# interpolation des jetons non trouvés
for k, j in enumerate(jetons):
    if j["s"] is None:
        av = next((jetons[i]["s"] for i in range(k - 1, -1, -1) if jetons[i]["s"] is not None), 0.0)
        ap = next((jetons[i]["s"] for i in range(k + 1, len(jetons)) if jetons[i]["s"] is not None), av + 0.3)
        j["s"] = av + (ap - av) * 0.5 if k else 0.0
# monotonie
for k in range(1, len(jetons)):
    jetons[k]["s"] = max(jetons[k]["s"], jetons[k - 1]["s"] + 0.04)

ancres, out = {}, []
fin_voix = mots[-1]["e"]
for p in phrases:
    toks = [j for l in p["lines"] for j in l]
    for j in toks:
        if j["ancre"]: ancres[j["ancre"]] = round(j["s"], 3)
    out.append({"zone": p["zone"], "ref": p["ref"], "jusqua": p["jusqua"], "start": round(toks[0]["s"], 3),
                "lines": [[{"t": j["t"], "c": j["c"], "s": round(j["s"], 3)} for j in l] for l in p["lines"]]})
# fin de chaque phrase : début de la phrase suivante de la même zone, ou dernier mot + 2,5 s
for i, p in enumerate(out):
    dern = max(w["s"] for l in p["lines"] for w in l)
    suiv = next((q["start"] for q in out[i + 1:] if q["zone"] == p["zone"]), None)
    if p["zone"] == "haut":
        fin = max(dern + 2.5, dern + 0.4)
        suiv2 = next((q["start"] for q in out[i + 1:] if q["zone"] in ("haut", "verset")), None)
        if suiv2 is not None: fin = min(fin, suiv2 - 0.05)
    elif p["jusqua"]:
        fin = ancres[p["jusqua"]] - 0.05
    else:
        # carte de verset / citation : jusqu'au retour de la narration en haut (ou page suivante)
        haut_suiv = next((q["start"] for q in out[i + 1:] if q["zone"] == "haut" and q["start"] > dern), dern + 2.0)
        fin = min(haut_suiv - 0.1, suiv - 0.05) if suiv is not None else haut_suiv - 0.1
    p["end"] = round(fin, 3)
    del p["jusqua"]
json.dump({"finVoix": fin_voix, "phrases": out, "ancres": ancres}, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print("jetons:", len(jetons), "non trouvés (interpolés):", manquants)
for p in out:
    print(f'{p["start"]:6.2f}-{p["end"]:6.2f} [{p["zone"]}] ' + " / ".join(" ".join(w["t"] for w in l) for l in p["lines"]))
