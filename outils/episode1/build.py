"""Construit timeline.json, sous-titres (.srt), chapitres et feuille de montage à partir de words.json + vad.json."""
import json, re, unicodedata, math, random
random.seed(7)
FPS = 30
words = json.load(open("words.json"))
vad = json.load(open("vad_edit.json"))
VDUR = 351.93

OUV, ACC, INTRO01 = 5.0, 5.0, 1.5
V0 = OUV + ACC + INTRO01          # la voix commence ici dans la vidéo
def T(v): return round(v + V0, 4)  # temps voix -> temps vidéo

def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)
NW = [norm(x["w"]) for x in words]
_cursor = [0]
def find(phrase, after=None, last=False):
    """Début (temps voix) du 1er mot de la phrase, cherchée après le curseur."""
    toks = [norm(t) for t in re.findall(r"\S+", phrase) if norm(t)]
    start = _cursor[0] if after is None else after
    hits = []
    for i in range(start, len(NW) - len(toks) + 1):
        if NW[i:i + len(toks)] == toks:
            hits.append(i)
            if not last: break
    if not hits: raise SystemExit(f"introuvable: {phrase!r} après mot {start}")
    i = hits[-1] if last else hits[0]
    _cursor[0] = i
    return i
def ws(i): return words[i]["s"]
def we(i): return words[i]["e"]
def at(phrase, **k): return ws(find(phrase, **k))
def end_of(phrase):
    i = find(phrase); n = len([t for t in phrase.split() if norm(t)])
    return we(i + n - 1)

# ------------------------------------------------------------------ clips
FULL = [0, 0, 1280, 720]
USE = {  # fenêtres utilisables (QC étape 2)
    "01": (0, 10), "03": (0, 10), "04": (0, 10), "04b": (6.0, 10), "05": (0, 10), "05b": (0, 10), "06b": (0, 10),
    "07": (0, 10), "07b": (0, 10), "08": (0, 10), "08b": (0, 10), "09": (0, 10), "09a": (0, 3.5), "10": (0, 10), "10b": (0, 10),
    "11b": (0, 10), "11c": (0, 6.5), "12": (0, 10), "13": (0, 10), "14": (0, 7.4), "15": (0, 10), "15b": (0, 3.8),
    "16": (0, 2.0), "16fin": (7.0, 10), "17": (0, 10), "18": (0, 3.0), "18fin": (7.6, 10), "18b": (0.5, 10), "18c": (0, 10),
    "19": (1.5, 6.5), "19b": (0, 10), "19c": (0, 10), "20": (0, 8.2), "20b": (4.0, 8.2), "21": (0, 10),
    "22a": (4.0, 10), "22b": (0, 10), "22c": (0, 10), "22c2": (0, 10), "22d": (0, 10), "22e": (3.0, 6.0), "22f": (0, 10),
    "15b2": (5.2, 10),
}
ALIAS = {"16fin": "16", "18fin": "18", "20b": "20", "15b2": "15b"}
RECT = {"04b": [0, 170, 960, 540], "18": [0, 70, 1024, 576], "18fin": [40, 110, 800, 450], "16fin": [420, 0, 860, 484], "18b": [240, 0, 1040, 585], "20b": [560, 60, 720, 405]}
GRADE = {}
for c in ["03"]: GRADE[c] = "divin"
for c in ["04", "05", "05b", "06b", "07", "07b", "08", "08b", "09", "09a", "10", "10b", "11b", "11c", "12", "13", "14"]: GRADE[c] = "eden"
GRADE["04b"] = "espace"
for c in ["15", "15b", "15b2", "18", "18fin", "18b", "18c", "19", "19b", "19c", "20", "20b", "21", "22a", "22c2"]: GRADE[c] = "chute"
for c in ["16", "16fin", "17"]: GRADE[c] = "nuit"
for c in ["22b", "22c", "22d"]: GRADE[c] = "desert"
for c in ["22e", "22f"]: GRADE[c] = "dore"
FX = {c: ["or"] for c in ["03", "04", "06b", "07", "07b", "08", "08b", "09", "09a", "10", "10b", "12", "17", "22b", "22e", "22f"]}
for c in ["05", "05b", "11c", "13", "14"]: FX[c] = ["poussiere"]
for c in ["15", "15b", "15b2"]: FX[c] = ["pluie", "feuilles"]
FX["16"] = ["feuilles"]; FX["20"] = ["feu"]; FX["20b"] = ["feu"]
FX["22c"] = ["sang", "or"]; FX["22d"] = ["sang"]; FX["22a"] = ["feuilles"]

MOVES = [  # (z0, z1, px0, px1, py0, py1) — on varie le sens d'un plan à l'autre
    (1.00, 1.10, 0, 0, 0, 0), (1.12, 1.02, 0, 0, 0, 0), (1.10, 1.10, -1, 1, 0, 0), (1.10, 1.10, 1, -1, 0, 0),
    (1.04, 1.13, -0.6, 0.6, 0.5, -0.5), (1.12, 1.12, 0, 0, 1, -1), (1.13, 1.03, 0.6, -0.6, -0.4, 0.4), (1.02, 1.12, 0.8, -0.2, 0, 0),
]
mv_i = [0]
def next_move():
    m = MOVES[mv_i[0] % len(MOVES)]; mv_i[0] += 1; return list(m)

pieces = []
cuesheet = []
src_pos = {}

def add(t0v, clip, label, trans="fade", src=None, speed=1.0, move=None, fx=None, phrase="", sound=""):
    """Ajoute un plan qui commence au temps voix t0v."""
    pieces.append(dict(t0=T(t0v), clip=clip, label=label, trans=trans, src=src, speed=speed, move=move, fx=fx, phrase=phrase, sound=sound))

def add_abs(t0, **k):
    pieces.append(dict(t0=t0, **k))

# ------------------------------------------------------------- feuille de montage
# Accroche (avant la voix) : 12, 13, 11b, 20
add_abs(OUV + 0.0, clip="12", label="ACC fruit", trans="flash", src=3.0, phrase="(accroche)", sound="magie-lumiere")
add_abs(OUV + 1.25, clip="13", label="ACC bouchée", trans="cut", src=0.0, phrase="(accroche)", sound="croquer")
add_abs(OUV + 2.5, clip="11b", label="ACC serpent", trans="cut", src=5.0, phrase="(accroche)", sound="serpent")
add_abs(OUV + 3.75, clip="20b", label="ACC épée", trans="cut", src=5.0, phrase="(accroche)", sound="feu-epee")
add_abs(OUV + ACC, clip="01", label="01 l'Apôtre arrive", trans="fade", src=7.0, phrase="(01, sans voix)", sound="ambiance-ville")

# Introduction : l'Apôtre en grand qui parle
add(0.0, "APOSTLE", "02 Apôtre en grand (parole)", trans="cut", phrase="Bonjour, bien-aimés")
t = at("Remontons")
add(t, "03", "03 la lumière jaillit", trans="flash", phrase="Remontons… au tout commencement", sound="magie-lumiere")
add(at("Au commencement, Dieu créa"), "04", "04 la création", phrase="« Au commencement, Dieu créa les cieux et la terre »", sound="vagues+vent-doux")
add(at("avant les étoiles"), "04b", "04b la Terre", phrase="avant les étoiles")
add(at("La lumière, le ciel"), "04", "04 lumière, ciel, mer", src=6.0, phrase="la lumière, le ciel, la mer")
add(at("les animaux"), "05", "05 les animaux", phrase="les animaux", sound="lion+elephant (très bas)")
add(at("Puis Dieu a fait"), "05b", "05b la vie dans l'eau", phrase="Puis Dieu a fait quelque chose de spécial")
add(at("forma l'homme"), "06b", "06b la poussière / le souffle", trans="flash", phrase="forma l'homme de la poussière")
add(at("il souffla"), "06b", "06b le souffle de vie", src=4.0, trans="cut", phrase="il souffla … un souffle de vie", sound="souffle")
add(at("devint un être vivant"), "07", "07 Adam s'éveille", phrase="l'homme devint un être vivant")
add(at("Cet homme, c'est Adam"), "07b", "07b Adam se lève", phrase="Cet homme, c'est Adam", sound="pas-herbe")
add(at("planta un jardin"), "08", "08 le jardin", phrase="planta un jardin en Éden", sound="oiseaux-foret+cascade")
add(at("Imaginez ce jardin"), "08", "08 cascade", src=6.5, trans="cut", phrase="Imaginez ce jardin")
add(at("des animaux qui vivent"), "08b", "08b Adam parmi les animaux", phrase="des animaux qui vivent en paix")
add(at("deux arbres"), "08", "08 les deux arbres", src=0.5, phrase="deux arbres")
add(at("Mais Dieu voit"), "07b", "07b Adam seul", src=7.0, phrase="Mais Dieu voit qu'il manque quelque chose")
add(at("crée la femme"), "09a", "09a Ève apparaît", trans="flash", phrase="Dieu crée la femme, Ève", sound="magie-lumiere")
add(at("Dieu vit tout"), "09", "09 ensemble", phrase="Dieu vit tout ce qu'il avait fait")
add(at("ils marchaient avec lui"), "09", "09 ils marchent", src=4.0, phrase="ils marchaient avec lui", sound="pas-herbe")
add(at("une seule règle"), "10", "10 la règle", phrase="une seule règle", sound="magie-lumiere")
add(at("tu ne mangeras pas"), "10b", "10b le fruit défendu", phrase="tu ne mangeras pas")
add(at("Tout le reste était permis"), "10", "10 l'arbre", src=5.0, phrase="Tout le reste était permis")
add(at("quelqu'un s'approche"), "11b", "11b le serpent s'approche (repli du 11)", phrase="quelqu'un s'approche d'Ève", sound="serpent")
add(at("Le serpent était le plus rusé"), "11b", "11b le serpent", src=4.0, trans="cut", phrase="Le serpent était le plus rusé")
add(at("Dieu a-t-il réellement dit"), "11c", "11c Ève écoute", phrase="Dieu a-t-il réellement dit")
add(at("un doute"), "11c", "11c le doute", src=4.0, trans="cut", phrase="Il commence par un doute")
add(at("Puis il ment"), "11b", "11b les yeux du serpent", src=7.0, phrase="Puis il ment", sound="serpent")
add(at("vos yeux s'ouvriront"), "11c", "11c Ève troublée", src=1.0, phrase="vos yeux s'ouvriront")
add(at("Ève regarde l'arbre"), "12", "12 Ève regarde le fruit", phrase="Ève regarde l'arbre", sound="magie-lumiere")
add(at("elle prit de son fruit"), "13", "13 la bouchée", phrase="elle prit de son fruit, et en mangea", sound="croquer")
add(at("elle en donna aussi"), "14", "14 elle en donne à Adam", phrase="elle en donna aussi à son mari", sound="croquer")
add(at("Beaucoup d'entre vous"), "APOSTLE", "Apôtre en grand", phrase="Beaucoup d'entre vous diront")
add(at("Revenons en arrière"), "REWIND", "PENSÉE rembobinage", trans="cut", phrase="Revenons en arrière", sound="rembobinage")
add(at("Après que le serpent"), "11b", "11b le serpent parle à Ève (souvenir)", trans="fade", src=1.0, phrase="Après que le serpent eut fini de parler à Ève", sound="serpent")
add(at("des bienfaits du fruit"), "11c", "11c Ève écoute (souvenir)", trans="cut", src=2.0, phrase="des bienfaits du fruit")
t_vit = at("La femme vit que l'arbre était bon", after=_cursor[0])
add(t_vit, "12", "12 au ralenti (la pensée)", trans="flash", speed=0.5, src=1.0, phrase="« La femme vit que l'arbre était bon »")
add(at("Pourtant, ce n'était pas"), "11c", "11c Ève avant (pensée)", src=0.5, phrase="Pourtant, ce n'était pas le cas avant")
add(at("Le péché, ici"), "12", "12 les yeux d'Ève", src=7.0, phrase="Le péché, ici, c'est depuis la pensée")
add(at("tout bascule"), "15", "15 tout bascule", phrase="Et tout bascule", sound="tonnerre+vent-fort+pluie", fx=["pluie", "feuilles", "tremble"])
add(at("ayant cousu"), "15b", "15b ils cousent les feuilles", phrase="ayant cousu des feuilles de figuier", sound="feuilles")
add(at("ils ont honte"), "15", "15 la honte", src=4.0, phrase="ils ont honte")
add(at("ils ont peur"), "15b2", "15b la peur", phrase="ils ont peur")
add(at("ils se cachent"), "16", "16 la cachette", phrase="ils se cachent", sound="feuilles")
add(at("Mais Dieu vient les chercher"), "17", "17 la lumière de Dieu", trans="flash", phrase="Mais Dieu vient les chercher", sound="magie-lumiere")
add(at("Où es-tu"), "17", "17 « Où es-tu ? »", src=5.0, trans="cut", phrase="Où es-tu ?")
add(at("Dieu savait très bien"), "16fin", "16 Adam sort de sa cachette", phrase="Dieu savait très bien où était Adam")
add(at("C'est un père"), "APOSTLE", "Apôtre en grand", phrase="C'est un père qui appelle")
add(at("La femme que tu as mise"), "18b", "18b Adam accuse", phrase="La femme que tu as mise auprès de moi")
add(at("Le serpent m'a séduite"), "18c", "18c Ève accuse", phrase="Le serpent m'a séduite", sound="serpent")
add(at("Adam accuse Ève"), "18", "18 l'accusation", phrase="Adam accuse Ève")
add(at("Personne ne dit"), "18fin", "18 plan large", phrase="Personne ne dit : C'est moi")
add(at("Bien-aimés, depuis ce jour"), "APOSTLE", "Apôtre en grand", phrase="Bien-aimés, depuis ce jour")
add(at("la douleur"), "19b", "19b la douleur", phrase="la douleur")
add(at("le travail pénible"), "19", "19 le travail pénible", phrase="le travail pénible", sound="travail-terre")
add(at("et la mort"), "19c", "19c la fleur fane", phrase="et la mort")
add(at("chassés du jardin"), "20", "20 l'expulsion", phrase="chassés du jardin", sound="feu+ailes")
add(at("des chérubins"), "20b", "20b l'épée de feu", trans="cut", phrase="des chérubins gardent le chemin", sound="feu-epee")
add(at("ce péché ne s'est pas arrêté"), "21", "21 les générations", phrase="ce péché ne s'est pas arrêté à eux", sound="foule")
add(at("La Bible dit aussi"), "APOSTLE", "Apôtre en grand", phrase="La Bible dit aussi")
add(at("L'Éternel Dieu fit à Adam"), "17", "17 lumière (verset Gn 3:21, sans personnage)", src=1.0, trans="flash", phrase="« L'Éternel Dieu fit à Adam … des habits de peau »")
add(at("On constate ici"), "APOSTLE", "Apôtre en grand", phrase="On constate ici quelque chose")
add(at("Eux l'avaient fait"), "22a", "22a ils grelottent dans leurs feuilles", phrase="Eux l'avaient fait premièrement", sound="vent-fort")
add(at("Dieu lui-même a trouvé"), "22b", "22b l'agneau dans la lumière", trans="flash", phrase="Dieu lui-même a trouvé la solution", sound="agneau")
add(at("Leurs feuilles ne suffisaient"), "22a", "22a feuilles abîmées", src=6.0, phrase="Leurs feuilles ne suffisaient pas")
t = at("un animal a dû mourir")
add(t, "22c", "22c l'agneau sur l'autel", phrase="un animal a dû mourir", sound="coeur")
t2 = at("Le premier sang versé")
# alternance 22c / 22c2 entre t et t2
pieces.pop()
span = t2 - t
parts = max(2, int(round(span / 1.2)))
for k in range(parts):
    add(t + span * k / parts, "22c" if k % 2 == 0 else "22c2", "22c l'agneau sur l'autel" if k % 2 == 0 else "22c2 Adam et Ève bouleversés",
        trans="cut" if k else "fade", src=(2.0 + k) if k % 2 == 0 else (1.0 + k), phrase="un animal a dû mourir", sound="coeur" if k == 0 else "")
add(t2, "22d", "22d le premier sang versé (flouté)", phrase="Le premier sang versé", sound="coeur")
add(at("Retenez bien"), "22e", "22e les habits de peau", trans="flash", phrase="Retenez bien ça, bien-aimés", sound="magie-lumiere")
add(at("c'est là que commence"), "22f", "22f ils lèvent les yeux", phrase="c'est là que commence l'histoire du pardon")
t623 = at("Car le salaire du péché")
add(t623, "22f", "R623 sur 22f flouté", src=5.0, phrase="« Car le salaire du péché, c'est la mort … »")
t23 = at("Dans le prochain épisode")
add(t23, "APOSTLE", "23 l'Apôtre en grand, fin", phrase="Dans le prochain épisode …")

# ------------------------------------------------------------- découpe en plans 2–4 s
VEND = T(VDUR) + 0.4
FIN0 = VEND
pieces.sort(key=lambda p: p["t0"])
final = []
for i, p in enumerate(pieces):
    t1 = pieces[i + 1]["t0"] if i + 1 < len(pieces) else FIN0
    p["t1"] = t1
    L = t1 - p["t0"]
    if p["clip"] in ("APOSTLE", "REWIND") or L <= 4.0:
        final.append(p); continue
    n = math.ceil(L / 3.5)
    for k in range(n):
        q = dict(p); q["t0"] = p["t0"] + L * k / n; q["t1"] = p["t0"] + L * (k + 1) / n
        if k:
            q["trans"] = "fade" if k % 2 else "cut"; q["sound"] = ""; q["label"] = p["label"] + f" (suite {k})"; q["src"] = "auto"
        final.append(q)

out = []
last_clip_pos = {}
for p in final:
    L = p["t1"] - p["t0"]
    c = p["clip"]
    if c == "APOSTLE":
        # alterne cadrage large / moyen / serré
        k = len(out)
        rects = [[0, 0, 1280, 720], [280, 0, 720, 405], [330, 0, 620, 349]]
        # découpe en morceaux de ~3.5 s
        n = max(1, math.ceil(L / 3.6))
        for j in range(n):
            out.append(dict(kind="apostle", t0=p["t0"] + L * j / n, t1=p["t0"] + L * (j + 1) / n, rect=rects[(k + j) % 3],
                            move=next_move(), trans=p["trans"] if j == 0 else "cut", label=p["label"], phrase=p["phrase"] if j == 0 else "",
                            sound=p["sound"] if j == 0 else "", grade="none"))
        continue
    if c == "REWIND":
        out.append(dict(kind="rewind", t0=p["t0"], t1=p["t1"], sources=[["14", 0.0, 7.0], ["13", 0.0, 6.0], ["12", 0.0, 6.0]],
                        trans="cut", label=p["label"], phrase=p["phrase"], sound=p["sound"], grade="rewind", fx=[]))
        continue
    real = ALIAS.get(c, c)
    a, b = USE[c]
    sp = p.get("speed", 1.0) or 1.0
    need = L * sp + 0.3
    if p["src"] in (None, "auto"):
        s0 = last_clip_pos.get(c, a)
        if s0 + need > b: s0 = a if a + need <= b else a
    else:
        s0 = max(a, min(p["src"], b - 0.1))
    avail = b - s0
    if need > avail:  # ralentir plutôt que figer (jamais < 0,45)
        sp = max(0.45, avail / (L + 0.3))
        if L * sp > avail: s0 = a; sp = max(0.45, (b - a) / (L + 0.3))
    last_clip_pos[c] = s0 + L * sp
    fx = p.get("fx") or FX.get(c, [])
    out.append(dict(kind="clip", clip=real, t0=p["t0"], t1=p["t1"], src0=round(s0, 3), speed=round(sp, 3),
                    rect=RECT.get(c, FULL), move=next_move(), grade=GRADE.get(c, "none"), fx=fx, trans=p["trans"],
                    label=p["label"], phrase=p["phrase"], sound=p["sound"]))

# ------------------------------------------------------------- piste Apôtre (parole / silence)
speech = vad["speech"]; pauses = vad["pauses"]
# segments de parole fusionnés à travers les pauses <= 0,35 s
segs = []
cur = list(speech[0])
for s, e in speech[1:]:
    if s - cur[1] <= 0.35: cur[1] = e
    else: segs.append(cur); cur = [s, e]
segs.append(cur)
apostle = []
TALK = {"02-parle-a": (0.0, 9.9), "02-parle-b": (0.0, 7.6)}
names = list(TALK)
ti = 0
def talk_piece(t0, t1):
    global ti
    t = t0
    while t < t1 - 1e-6:
        n = names[ti % 2]; ti += 1
        a, b = TALK[n]
        L = min(t1 - t, b - a - 0.2)
        s0 = round(random.uniform(a, max(a, b - L - 0.05)), 3)
        apostle.append(dict(t0=T(t), t1=T(t + L), clip=n, src0=s0, talk=1))
        t += L
apostle.append(dict(t0=0.0, t1=T(segs[0][0]), clip="02-silence", src0=0.0, talk=0))
for i, (s, e) in enumerate(segs):
    talk_piece(s, e)
    nxt = segs[i + 1][0] if i + 1 < len(segs) else VDUR + 12
    apostle.append(dict(t0=T(e), t1=T(nxt), clip="02-silence", src0=round(random.uniform(0, 4), 3), talk=0))
# 02-silence fait 10 s : boucle en cas de longue pause
fixed = []
for a in apostle:
    if a["clip"] == "02-silence" and a["t1"] - a["t0"] > 9.5:
        t = a["t0"]
        while t < a["t1"]:
            L = min(9.0, a["t1"] - t); fixed.append(dict(a, t0=t, t1=t + L, src0=0.3)); t += L
    else: fixed.append(a)
apostle = fixed

# ------------------------------------------------------------- textes
def find_t(ph, after=0): return at(ph, after=after)
_cursor[0] = 0
TITLES = []
def title(ph, lines, dur=2.6, center=False):
    t = at(ph); TITLES.append(dict(t0=T(t), t1=T(t) + dur, lines=lines, center=center))
title("Remontons", ["AU COMMENCEMENT"], 3.0)
title("Revenons en arrière", ["LE PÉCHÉ COMMENCE", "DANS LA PENSÉE"], 3.2)
title("Où es-tu", ["OÙ ES-TU ?"], 2.2)
title("Adam accuse Ève", ["C'EST SA FAUTE !"], 2.4)
title("Dieu lui-même a trouvé", ["DIEU LUI-MÊME A TROUVÉ", "LA SOLUTION"], 3.0)
# accroche
TITLES.append(dict(t0=OUV + 0.15, t1=OUV + 3.9, lines=["ÈVE A-T-ELLE VRAIMENT PÉCHÉ", "EN MANGEANT LE FRUIT ?"], center=True))
TITLES.append(dict(t0=OUV + 3.95, t1=OUV + ACC - 0.05, lines=["LE PARDON DIVIN"], center=True))
# le titre « LE PÉCHÉ… » doit tomber sur la reprise ralentie : on le décale sur t_vit
for x in TITLES:
    if x["lines"][0] == "LE PÉCHÉ COMMENCE": x["t0"] = T(t_vit); x["t1"] = T(t_vit) + 3.4

REF = open("ref.txt").read()
def quote_after(marker):
    i = REF.index(marker); j = REF.index("«", i); k = REF.index("»", j)
    return REF[j:k + 1]
CARDS = []
_cursor[0] = 0
def card(ref, ph_start, text, minimum=4.0, maximum=6.0):
    s = at(ph_start)
    # fin = fin réelle de la citation (mot de fin) : on cherche le dernier mot de la citation
    last = [t for t in re.findall(r"\S+", text) if norm(t)][-3:]
    j = find(" ".join(last), after=_cursor[0]); e = we(j + len(last) - 1)
    t0, t1 = T(s), T(e) + 0.5
    if t1 - t0 < minimum: t1 = t0 + minimum
    t1 = min(t1, t0 + maximum)
    CARDS.append(dict(t0=t0, t1=t1, ref=ref, text=text))
card("GENÈSE 1:1", "Au commencement, Dieu créa", "« Au commencement, Dieu créa les cieux et la terre. »")
card("GENÈSE 2:7", "L'Éternel Dieu forma", quote_after("Genèse, chapitre deux, verset sept"))
card("ROMAINS 5:12", "C'est pourquoi, comme par un seul homme", quote_after("Romains, chapitre cinq, verset douze"))
card("GENÈSE 3:21", "L'Éternel Dieu fit à Adam", quote_after("Genèse, chapitre trois, verset vingt et un"))
card("ROMAINS 6:23", "Car le salaire du péché", "« Car le salaire du péché, c'est la mort ; mais le don gratuit de Dieu, c'est la vie éternelle en Jésus-Christ notre Seigneur. »")

# ------------------------------------------------------------- sous-titres
KW = {"PÉCHÉ", "PARDON", "DIEU", "ADAM", "ÈVE", "SERPENT", "FRUIT", "PENSÉE", "MORT", "VIE", "SANG", "AGNEAU", "JARDIN",
      "COMMENCEMENT", "RÈGLE", "DOUTE", "MENT", "HONTE", "PEUR", "CACHENT", "OÙ", "ES-TU", "PEAU", "JÉSUS-CHRIST", "BIEN-AIMÉS",
      "ÉDEN", "CONFIANCE", "DÉSOBÉI", "DÉSOBÉISSANCE", "REPENTANCE", "PARDONNER", "SOLUTION", "SACRIFICES", "BÉNIS", "TALLA"}
subs = []
cur = [];
def flush():
    global cur
    if not cur: return
    txt = " ".join(w["w"] for w in cur)
    subs.append(dict(s=cur[0]["s"], e=cur[-1]["e"], text=txt)); cur = []
for i, w in enumerate(words):
    if cur and (w["s"] - cur[-1]["e"] > 0.45 or len(" ".join(x["w"] for x in cur + [w])) > 52):
        flush()
    cur.append(w)
    if re.search(r"[.!?…»:;]$", w["w"]) and len(" ".join(x["w"] for x in cur)) > 18: flush()
flush()
def split2(txt):
    up = txt.upper()
    if len(up) <= 26: return [up]
    ws_ = up.split(" "); best = None
    for k in range(1, len(ws_)):
        a, b = " ".join(ws_[:k]), " ".join(ws_[k:])
        sc = abs(len(a) - len(b))
        if best is None or sc < best[0]: best = (sc, [a, b])
    return best[1]
SUBS = []
for i, s in enumerate(subs):
    t1 = s["e"] + 0.25
    if i + 1 < len(subs): t1 = min(t1, subs[i + 1]["s"])
    lines = split2(s["text"])
    kw = [k for k in KW if any(k == re.sub(r"[.,;:!?«»\"…\u00a0]", "", x) for ln in lines for x in ln.split(" "))]
    SUBS.append(dict(t0=T(s["s"]), t1=T(t1), lines=lines, kw=kw, text=s["text"]))

# médaillon visible pendant l'histoire (pas pendant l'Apôtre en grand ni les spéciaux)
MED = []
story0 = T(at("Remontons", after=0))
cur_t = None
for p in out:
    if p["t0"] < story0: continue
    if p.get("kind") == "apostle":
        if cur_t is not None: MED.append(dict(t0=cur_t, t1=p["t0"])); cur_t = None
    else:
        if cur_t is None: cur_t = p["t0"]
if cur_t is not None: MED.append(dict(t0=cur_t, t1=FIN0))

SPECIALS = [dict(t0=0, t1=OUV, kind="logo"),
            dict(t0=FIN0, t1=FIN0 + 3.0, kind="endcard", lines=["À SUIVRE :", "ÉPISODE 2", "LE SANG DES SACRIFICES"]),
            dict(t0=FIN0 + 3.0, t1=FIN0 + 8.0, kind="logo_close", fadeout=True)]
DUR = FIN0 + 8.0

tl = dict(pieces=out, apostle=apostle, medallion=MED, titles=TITLES, cards=CARDS, subs=SUBS, specials=SPECIALS,
          duration=DUR, V0=V0, story0=story0)
json.dump(tl, open("timeline.json", "w"), ensure_ascii=False, indent=0)

# ------------------------------------------------------------- SRT + chapitres + feuille
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
with open("episode1.srt", "w") as f:
    n = 1
    f.write(f"{n}\n{ts(OUV + 0.15)} --> {ts(OUV + 3.9)}\nÈVE A-T-ELLE VRAIMENT PÉCHÉ\nEN MANGEANT LE FRUIT ?\n\n"); n += 1
    for s in SUBS:
        f.write(f"{n}\n{ts(s['t0'])} --> {ts(s['t1'])}\n" + "\n".join(split2(s['text'])) + "\n\n"); n += 1
    f.write(f"{n}\n{ts(FIN0)} --> {ts(FIN0 + 3)}\nÀ SUIVRE : ÉPISODE 2\nLE SANG DES SACRIFICES\n\n")
_cursor[0] = 0
CH = [("Introduction", 0.0), ("La création", T(at("Remontons"))), ("Le jardin d'Éden", T(at("planta un jardin"))),
      ("Le serpent", T(at("quelqu'un s'approche"))), ("Le péché commence dans la pensée", T(at("Beaucoup d'entre vous"))),
      ("Où es-tu ?", T(at("tout bascule"))), ("Les conséquences", T(at("Le péché a des conséquences"))),
      ("Le sacrifice et les habits de peau", T(at("La Bible dit aussi"))), ("Conclusion", T(at("Dans le prochain épisode")))]
def mmss(x): return f"{int(x // 60):02d}:{int(x % 60):02d}"
with open("chapitres.txt", "w") as f:
    for n_, t_ in CH: f.write(f"{mmss(t_)} {n_}\n")
with open("feuille-de-montage.md", "w") as f:
    f.write("| Temps | Phrase (mot déclencheur) | Plan | Source | Effet | Son |\n|---|---|---|---|---|---|\n")
    for p in out:
        if not p.get("phrase") and "suite" not in p.get("label", ""): continue
        src = f"{p.get('clip','Apôtre')} @{p.get('src0','')}s ×{p.get('speed','')}" if p.get("kind") == "clip" else p.get("kind")
        eff = ", ".join([p.get("trans", "")] + p.get("fx", []) + ([] if p.get("grade") in (None, "none") else [p["grade"]]))
        f.write(f"| {mmss(p['t0'])}.{int((p['t0'] % 1) * 30):02d} | {p.get('phrase','')} | {p['label']} | {src} | {eff} | {p.get('sound','')} |\n")
json.dump(dict(CH=CH, FIN0=FIN0, DUR=DUR), open("meta.json", "w"))
print("pièces", len(out), "apôtre", len(apostle), "sous-titres", len(SUBS), "durée", round(DUR, 2))
lens = [p["t1"] - p["t0"] for p in out]
print("plan min/max", round(min(lens), 2), round(max(lens), 2))
