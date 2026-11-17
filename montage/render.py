#!/usr/bin/env python3
"""Montage « Le pardon divin » — épisode 1 (FFmpeg + libass, sans GPU disponible ici : libx264).

Usage :
  python3 montage/render.py WORK_DIR [--preview A B] [--formats tiktok,youtube] [--extraits]

WORK_DIR contient transcript.json (faster-whisper, horodatage par mot) et reçoit
les fichiers intermédiaires. Les sorties finales vont dans sorties/.
"""
import json, os, re, subprocess, sys, unicodedata, hashlib, argparse, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIPS = os.path.join(ROOT, "clips")
SONS = os.path.join(ROOT, "audio", "sons")
FONTS = os.path.join(ROOT, "fonts")
FPS = 30
HOOK = 4.0          # ouverture sans voix
CLIP_LEN = 10.0
END_CARD = 3.0      # chaque carte de fin

# Les fichiers 11 et 22b sont inversés dans clips/ : 11.mp4 = habits de peau, 22b.mp4 = serpent.
CLIP_FILE = {"11": "22b.mp4", "22b": "11.mp4"}
def clip_path(c): return os.path.join(CLIPS, CLIP_FILE.get(c, c + ".mp4"))

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        sys.stderr.write(" ".join(cmd)[:3000] + "\n" + r.stderr[-4000:])
        raise SystemExit("ffmpeg a échoué")
    return r

# ---------------------------------------------------------------- transcription
def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9]+", s.replace("’", "'"))

class Voice:
    def __init__(self, path):
        segs = json.load(open(path))
        self.words = []          # (texte affiché, début, fin)
        for s in segs:
            for w in s["words"]:
                self.words.append([w["w"].strip(), w["s"], w["e"]])
        self.tok = []            # (token normalisé, index du mot)
        for i, (w, _, _) in enumerate(self.words):
            for t in norm(w): self.tok.append((t, i))
        self.end = self.words[-1][2]

    def apply_fixes(self, fixes):
        for f in fixes:
            de = f["de"].split(); vers = f["vers"].split()
            strip = lambda x: x.strip()
            ok = False
            for i in range(len(self.words) - len(de) + 1):
                if abs(self.words[i][1] - f["t"]) < 3 and [strip(w[0]) for w in self.words[i:i + len(de)]] == de:
                    s0 = self.words[i][1]; e0 = max(w[2] for w in self.words[i:i + len(de)])
                    n = max(1, len(vers)); step = (e0 - s0) / n
                    self.words[i:i + len(de)] = [[w, s0 + k * step, s0 + (k + 1) * step] for k, w in enumerate(vers)]
                    ok = True; break
            if not ok: print("correction non appliquée :", f["de"])
        self.tok = []
        for i, (w, _, _) in enumerate(self.words):
            for t in norm(w): self.tok.append((t, i))

    def find(self, phrase, after=0.0, last=False):
        p = norm(phrase); toks = [t for t, _ in self.tok]; hits = []
        for k in range(len(toks) - len(p) + 1):
            if toks[k:k + len(p)] == p:
                i0 = self.tok[k][1]; i1 = self.tok[k + len(p) - 1][1]
                if self.words[i0][1] >= after - 1e-6:
                    hits.append((self.words[i0][1], self.words[i1][2]))
                    if not last: break
        if not hits: raise KeyError(f"phrase introuvable dans l'audio : « {phrase} » après {after:.1f}s")
        return hits[-1] if last else hits[0]

    def t(self, phrase, after=0.0): return self.find(phrase, after)[0]
    def te(self, phrase, after=0.0): return self.find(phrase, after)[1]

# ---------------------------------------------------------------- étalonnage
GRADES = {
    "neutre": "eq=saturation=1.05",
    "ville":  "eq=saturation=1.08:brightness=0.01,colorbalance=rm=0.03:bm=-0.03",
    "eden":   "eq=saturation=1.14:brightness=0.025:contrast=1.03,colorbalance=rs=0.04:gs=0.015:bs=-0.05:rm=0.04:bm=-0.04",
    "chute":  "eq=saturation=0.68:brightness=-0.02:contrast=1.05,colorbalance=rs=-0.03:bs=0.06:rm=-0.03:bm=0.05",
    "or":     "eq=saturation=1.08:brightness=0.03,colorbalance=rs=0.07:gs=0.035:bs=-0.08:rm=0.06:gm=0.02:bm=-0.07:rh=0.04:bh=-0.04",
}

# ---------------------------------------------------------------- plans
def build_plan(v):
    """Retourne la liste des plans (temps voix) + titres + cartes + bruitages + chapitres."""
    T = v.t; TE = v.te
    P = []   # dict(clip, start, src_in, src_out, grade, speed_min)
    def shot(clip, start, grade, src_in=0.0, src_out=CLIP_LEN, **kw):
        P.append(dict(clip=clip, start=start, grade=grade, src_in=src_in, src_out=src_out, **kw))

    a = {}
    a["remontons"] = T("remontons")
    a["gen11"] = T("genese chapitre 1 verset 1")
    a["parole"] = T("et par sa parole", a["gen11"])
    a["special"] = T("puis dieu a fait quelque chose", a["parole"])
    a["devint"] = T("devint un etre vivant", a["special"])
    a["laisse"] = T("ne l a pas laisse", a["devint"])
    a["manque"] = T("mais dieu voit", a["laisse"])
    a["regle"] = T("dans ce jardin dieu avait donne", a["manque"])
    a["unjour"] = T("mais un jour", a["regle"])
    a["regarde"] = T("eve regarde l arbre", a["unjour"])
    a["prit"] = T("elle prit de son fruit", a["regarde"])
    a["donna"] = T("elle en donna aussi", a["prit"])
    a["beaucoup"] = T("beaucoup d entre vous", a["donna"])
    a["revenons"] = T("revenons en arriere", a["beaucoup"])
    a["femme2"] = T("la femme vit", a["revenons"])
    a["pensee"] = T("c est depuis la pensee", a["revenons"])
    a["unfruit"] = T("un fruit une seule", a["pensee"])
    a["entendent"] = T("quand ils entendent", a["unfruit"])
    a["appela"] = T("appela l homme", a["entendent"])
    a["ouestu"] = v.find("ou es tu", a["appela"])
    a["regardez"] = T("regardez bien ce qui se passe", a["ouestu"][1])
    a["accuse"] = T("adam accuse eve", a["regardez"])
    a["consequences"] = T("le peche a des consequences", a["accuse"])
    a["chasses"] = T("sont chasses du jardin", a["consequences"]) - 0.9
    a["arrete"] = T("ce peche ne s est pas arrete", a["chasses"])
    a["habits"] = T("la bible dit aussi", a["arrete"])
    a["solution"] = T("dieu lui meme a trouve la solution", a["habits"])
    a["feuilles"] = T("leurs feuilles ne suffisaient pas", a["habits"])
    a["couvrir"] = T("pour les couvrir", a["feuilles"])
    a["salaire"] = T("car le salaire du peche", a["couvrir"])
    a["prochain"] = T("dans le prochain episode", a["salaire"])

    shot("01", 0.0, "ville")
    shot("03", a["remontons"], "or")
    shot("04", a["gen11"], "eden")
    shot("05", a["parole"], "eden")
    shot("06", a["special"], "eden")
    shot("07", a["devint"] - 0.6, "eden")
    shot("08", a["laisse"] - 0.3, "eden")
    shot("09", a["manque"], "eden")
    shot("10", a["regle"], "eden")
    shot("11", a["unjour"], "eden")
    shot("12", a["regarde"], "eden")
    shot("13", a["prit"], "eden")
    shot("14", a["donna"], "eden")
    shot("REWIND", a["revenons"], "eden")
    rew_end = a["revenons"] + 2.0
    shot("12", rew_end, "eden", slow=0.5)          # retour au ralenti
    shot("15", a["unfruit"], "chute")
    shot("16", a["entendent"], "chute", src_out=3.0)    # la cachette
    shot("16", a["ouestu"][0] - 2.2, "chute", src_in=3.0)  # Adam sort dans la lumière (couvre le plan 17)
    shot("18", a["regardez"], "chute")
    shot("19", a["consequences"], "chute")
    shot("20", a["chasses"], "chute")
    shot("21", a["arrete"], "chute")
    shot("22a", a["habits"], "chute")
    shot("22b", a["couvrir"], "or", src_out=3.0)
    shot("23", a["prochain"], "or")
    for i, s in enumerate(P):
        s["end"] = P[i + 1]["start"] if i + 1 < len(P) else v.end + 1.2
    # ROMAINS 6:23 : carte sur le plan 22b ; le plan 23 commence au « prochain épisode ».

    # cartes de versets (début = début de la citation lue)
    cards = []
    def card(cid, phrase, after, dur=None):
        s, _ = v.find(phrase, after)
        cards.append(dict(id=cid, start=s, dur=dur))
    card("gen1_1", "au commencement dieu crea", a["gen11"])
    card("gen2_7", "l eternel dieu forma", a["special"])
    card("gen2_8", "puis l eternel dieu planta", a["laisse"])
    card("gen2_18", "il n est pas bon", a["manque"])
    card("gen1_31", "dieu vit tout ce", a["manque"])
    card("gen2_16", "tu pourras manger", a["regle"])
    card("gen3_1", "le serpent etait le plus ruse", a["unjour"])
    card("gen3_4", "vous ne mourrez", a["unjour"])
    card("gen3_6", "la femme vit", a["regarde"])
    card("gen3_7", "les yeux de l un", a["unfruit"])
    card("gen3_9", "mais l eternel dieu appela", a["entendent"])
    card("gen3_12", "la femme que tu as mise", a["regardez"])
    card("gen3_19", "car tu es poussiere", a["consequences"])
    card("rom5_12", "c est pourquoi comme", a["arrete"])
    card("gen3_21", "l eternel dieu fit", a["habits"])
    card("rom6_23", "car le salaire", a["couvrir"])
    verses = {x["id"]: x for x in json.load(open(os.path.join(ROOT, "montage", "versets.json")))}
    for c in cards:
        n = len(verses[c["id"]]["texte"])
        c["dur"] = c["dur"] or max(4.0, min(6.0, 3.2 + n / 55.0))
    # pas de chevauchement entre cartes
    for i in range(len(cards) - 1):
        cards[i]["dur"] = min(cards[i]["dur"], cards[i + 1]["start"] - cards[i]["start"] - 0.2)

    titles = [
        ("AU COMMENCEMENT", a["remontons"] + 0.6, 3.0),
        ("LE PÉCHÉ COMMENCE\\NDANS LA PENSÉE", a["pensee"], 3.6),
        ("OÙ ES-TU ?", a["ouestu"][0], 3.0),
        ("C'EST SA FAUTE !", a["accuse"], 3.0),
        ("DIEU LUI-MÊME A TROUVÉ\\NLA SOLUTION", a["solution"], 3.6),
    ]
    a["_rew_end"] = rew_end
    return P, cards, titles, a

# ---------------------------------------------------------------- bruitages
def sfx_events(v, P, cards, a, total_story):
    """Liste (nom, début_programme, durée, cible_LUFS, fondu_in, fondu_out, décalage_fichier)."""
    H = HOOK; E = []
    def ev(name, start, dur, lufs, fi=0.05, fo=0.3, off=0.0): E.append((name, start, dur, lufs, fi, fo, off))
    def amb(name, start, end, lufs=-28): ev(name, start, end - start, lufs, 0.8, 1.0)
    st = {}
    for s in P: st.setdefault(s["clip"], []).append(s)
    def S(c, k=0): return st[c][k]["start"] + H
    def En(c, k=0): return st[c][k]["end"] + H
    # ouverture
    ev("croquer", 1.0, 1.0, -20, off=0.05)
    ev("serpent", 2.0, 1.2, -22, fo=0.3)
    ev("whoosh", 2.75, 1.4, -20, off=1.45)
    # ville
    amb("ambiance-ville", H - 0.5, S("03") + 0.5, -29)
    ev("magie-lumiere", S("03"), 4.0, -23, fo=1.0)
    # création
    ev("vagues", S("04"), En("04") - S("04"), -28, 0.8, 1.0)
    ev("lion", S("05") + 1.0, 3.0, -23, fo=1.0)
    ev("elephant", S("05") + 4.0, 2.0, -23)
    ev("souffle", S("06") + 0.8, 1.5, -22, fo=0.5)
    # ambiance d'Éden : oiseaux + cascade + vent doux
    eden0, eden1 = S("05"), S("15") + 1.5
    amb("oiseaux-foret", eden0, eden1, -28)
    amb("cascade", S("08"), eden1, -31)
    amb("vent-doux", S("04"), eden1, -30)
    ev("pas-herbe", S("09") + 0.3, 5.0, -24, 0.3, 1.0)
    ev("serpent", S("11") + 0.5, 3.0, -22, 0.1, 0.8)
    ev("croquer", S("13") + 0.4, 0.9, -21, off=0.05)
    ev("croquer", S("14") + 3.0, 0.9, -22, off=0.05)
    ev("rembobinage", a["revenons"] + H, 2.0, -21, 0.05, 0.4)
    # chute
    amb("vent-fort", S("15"), S("16", 1) - 3.0, -27)
    ev("tonnerre", S("15") + 0.2, 6.0, -23, 0.05, 2.0)
    ev("feuilles", S("15") + 1.0, 8.0, -25, 0.5, 1.5)
    ev("feuilles", S("16") + 0.5, 6.0, -26, 0.5, 1.5)
    # silence presque total avant « Où es-tu ? »
    ev("magie-lumiere", a["ouestu"][1] + H + 0.2, 3.0, -25, 0.3, 1.0)
    ev("travail-terre", S("19") + 0.3, 6.0, -24, 0.1, 0.8)
    ev("foule", S("21"), En("21") - S("21"), -28, 0.8, 1.0)
    ev("feu", S("20"), En("20") - S("20"), -26, 0.5, 1.0)
    ev("whoosh", S("20") - 0.6, 1.4, -24, off=1.45)
    ev("agneau", S("22a") + 4.0, 1.4, -23, off=0.1)
    ev("agneau", S("22b") + 0.3, 1.4, -23, off=0.1)
    ev("magie-lumiere", S("22b") + 2.0, 4.0, -23, fo=1.0)
    amb("ambiance-ville", S("23") - 0.5, total_story + H + 1.0, -29)
    # whoosh aux changements de lieu
    for c in ["03", "04", "08", "15", "21", "23"]:
        ev("whoosh", S(c) - 0.5, 1.4, -25, off=1.45)
    # parchemin sur les cartes
    for c in cards:
        ev("parchemin", c["start"] + H - 0.15, 1.0, -26, 0.02, 0.3, off=0.2)
    return E

# ---------------------------------------------------------------- rendu des plans
def shot_cache(work, d):
    h = hashlib.md5(json.dumps(d, sort_keys=True).encode()).hexdigest()[:12]
    return os.path.join(work, "plans", f"{d.get('clip','x')}_{h}.mp4")

ENC_TMP = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "15", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]

def zoom_hold(play, rest, z_end=1.10):
    """Lecture puis image figée avec zoom lent (zoompan sur image suréchantillonnée)."""
    N0 = int(round(play * FPS)); NR = max(1, int(round(rest * FPS)))
    z = f"if(lt(on\\,{N0})\\,1\\,1+{z_end-1:.3f}*(on-{N0})/{NR})"
    return (f"scale=2560:1440:flags=lanczos,zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":s=1920x1080:fps={FPS}")

def render_shot(work, s, dur):
    d = dict(clip=s["clip"], src_in=s["src_in"], src_out=s["src_out"], dur=round(dur, 3), grade=s["grade"],
             slow=s.get("slow"), v=3)
    out = shot_cache(work, d)
    if os.path.exists(out): return out
    avail = s["src_out"] - s["src_in"]
    vf = [f"trim={s['src_in']}:{s['src_out']}", "setpts=PTS-STARTPTS"]
    if s.get("slow"):
        speed = s["slow"]
        vf += [f"setpts=PTS/{speed}", f"minterpolate=fps={FPS}:mi_mode=blend"]
        play = avail / speed
    elif dur <= avail + 1e-3:
        speed = 1.0; play = dur
    elif dur <= avail / 0.8:
        speed = avail / dur; vf += [f"setpts=PTS/{speed:.4f}"]; play = dur
    else:
        speed = 0.8; vf += [f"setpts=PTS/0.8"]; play = avail / 0.8
    vf += [f"fps={FPS}"]
    rest = max(0.0, dur - play)
    if rest > 0.01:
        vf += [f"tpad=stop_mode=clone:stop_duration={rest + 0.2:.3f}", zoom_hold(play, rest, 1 + min(0.18, 0.06 + 0.008 * rest))]
    else:
        vf += ["scale=1920:1080:flags=lanczos"]
    vf += [GRADES[s["grade"]], f"trim=duration={dur:.4f}", "setsar=1"]
    os.makedirs(os.path.dirname(out), exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", clip_path(s["clip"]), "-vf", ",".join(vf), *ENC_TMP, out + ".tmp.mp4"])
    os.replace(out + ".tmp.mp4", out)
    return out

def speed_lines(work):
    """Images de lignes de vitesse (dessin graphique, pas de son)."""
    from PIL import Image, ImageDraw
    import random
    d = os.path.join(work, "lignes"); os.makedirs(d, exist_ok=True)
    if os.path.exists(os.path.join(d, "l07.png")): return d
    rnd = random.Random(3)
    for k in range(8):
        im = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
        for _ in range(70):
            y = rnd.randint(0, 1080); x = rnd.randint(-400, 1920); L = rnd.randint(200, 900)
            a = rnd.randint(70, 190); w = rnd.choice([2, 3, 4, 6])
            dr.line((x, y, x + L, y), fill=(255, 255, 255, a), width=w)
        im.save(os.path.join(d, f"l{k:02d}.png"))
    return d

def render_rewind(work, dur):
    out = os.path.join(work, "plans", f"rewind_{dur:.3f}_v3.mp4")
    if os.path.exists(out): return out
    lines = speed_lines(work)
    # 14 → 13 → 12 à l'envers, accéléré
    parts = []
    for c in ["14", "13", "12"]:
        parts.append(c)
    n = len(parts); per = dur / n
    inputs = []; fl = []
    for i, c in enumerate(parts):
        inputs += ["-i", clip_path(c)]
        fl.append(f"[{i}:v]fps=12,reverse,setpts=PTS*{per/CLIP_LEN:.5f},fps={FPS},scale=1920:1080,{GRADES['eden']}[r{i}]")
    fl.append("".join(f"[r{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,tmix=frames=3,eq=saturation=0.8:contrast=1.1[rv]")
    inputs += ["-framerate", "15", "-loop", "1", "-i", os.path.join(lines, "l%02d.png")]
    fl.append(f"[{n}:v]fps={FPS},format=rgba[ln]")
    fl.append(f"[rv][ln]overlay=shortest=1,trim=duration={dur:.3f},setsar=1[o]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fl), "-map", "[o]", *ENC_TMP, out + ".tmp.mp4"])
    os.replace(out + ".tmp.mp4", out)
    return out

def render_hook(work):
    out = os.path.join(work, "plans", "hook_v3.mp4")
    if os.path.exists(out): return out
    seq = [("12", 5.0, "eden"), ("13", 0.0, "eden"), ("11", 2.0, "eden"), ("20", 3.0, "chute")]
    inputs = []; fl = []
    for i, (c, ss, g) in enumerate(seq):
        inputs += ["-ss", str(ss), "-t", "1.0", "-i", clip_path(c)]
        fl.append(f"[{i}:v]fps={FPS},scale=2112:1188,crop=1920:1080:'(iw-ow)/2+40*t':'(ih-oh)/2',{GRADES[g]},trim=duration=1.0,setpts=PTS-STARTPTS,setsar=1[h{i}]")
    fl.append("".join(f"[h{i}]" for i in range(4)) + "concat=n=4:v=1:a=0[o]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fl), "-map", "[o]", *ENC_TMP, out + ".tmp.mp4"])
    os.replace(out + ".tmp.mp4", out)
    return out

def build_program(work, P, story_end):
    """Vidéo horizontale 1920×1080 sans texte : ouverture + histoire."""
    files = [render_hook(work)]
    for s in P:
        dur = s["end"] - s["start"]
        if s["clip"] == "REWIND": files.append(render_rewind(work, dur))
        else: files.append(render_shot(work, s, dur))
    lst = os.path.join(work, "programme.txt")
    open(lst, "w").write("".join(f"file '{f}'\n" for f in files))
    out = os.path.join(work, "programme.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", out])
    return out

# ---------------------------------------------------------------- sous-titres
CORR = {}  # corrections orthographiques (rempli par corrections.json)
KEYWORDS = {"dieu", "eternel", "peche", "pardon", "eden", "serpent", "fruit", "adam", "eve", "jardin", "mort",
            "vie", "honte", "peur", "confiance", "doute", "desobeissance", "sang", "solution", "pensee", "jesus-christ",
            "jesus", "christ", "habits", "peau", "poussiere", "appel", "repentance", "pardonner", "regle", "parfait"}

def chunks(v, maxc=40):
    out = []; cur = []
    def flush():
        if cur: out.append(cur[:]); cur.clear()
    for w in v.words:
        txt = w[0]
        if cur and len(" ".join(x[0] for x in cur + [w])) > maxc: flush()
        if cur and w[1] - cur[-1][2] > 0.7: flush()
        cur.append(w)
        if re.search(r"[.!?…:;]»?$", txt) or (re.search(r",$", txt) and len(" ".join(x[0] for x in cur)) > maxc * 0.55):
            flush()
    flush()
    res = []
    for i, c in enumerate(out):
        s = c[0][1]; e = c[-1][2] + 0.25
        if i + 1 < len(out): e = min(e + 0.4, out[i + 1][0][1])
        res.append((s, e, [x[0] for x in c]))
    return res

def split2(words):
    if len(" ".join(words)) <= 20 or len(words) < 2: return [words]
    best = None
    for k in range(1, len(words)):
        a = len(" ".join(words[:k])); b = len(" ".join(words[k:]))
        if best is None or abs(a - b) < best[0]: best = (abs(a - b), k)
    return [words[:best[1]], words[best[1]:]]

def ass_time(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def esc(s): return s.replace("{", "(").replace("}", ")")

def fmt_words(words, yellow="&H0000E1FF&"):
    out = []
    for w in words:
        W = w.upper()
        if any(t in KEYWORDS for t in norm(w)): out.append("{\\c" + yellow + "}" + esc(W) + "{\\c&HFFFFFF&}")
        else: out.append(esc(W))
    return " ".join(out)

def write_ass(path, fmt, subs, titles, cards, hide_ranges, med_range):
    vert = fmt == "tiktok"
    W, H = (1080, 1920) if vert else (1920, 1080)
    sub_fs = 64 if vert else 58
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Fredoka Bold,{sub_fs},&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,{5 if vert else 4.5},{2 if vert else 2},5,40,40,40,1
Style: Label,Fredoka Bold,{40 if vert else 30},&H0037AFD4,&H0037AFD4,&H00000000,&HC8000000,0,0,0,0,100,100,3,0,3,10,0,5,20,20,20,1
Style: Titre,Fredoka Bold,{92 if vert else 100},&H0000E5FF,&H0000E5FF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,{9 if vert else 9},4,5,30,30,30,1
Style: Hook,Fredoka Bold,{74 if vert else 84},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,1,0,1,7,4,5,40,40,40,1
Style: HookTitre,Cinzel Bold,{120 if vert else 150},&H0055D6FF,&H0055D6FF,&H00000000,&H96000000,0,0,0,0,100,100,4,0,1,8,5,5,40,40,40,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    L = []
    def add(st, s, e, txt, layer=1): L.append(f"Dialogue: {layer},{ass_time(s)},{ass_time(e)},{st},,0,0,0,,{txt}")
    bounce = "{\\fscx65\\fscy65\\t(0,130,\\fscx110\\fscy110)\\t(130,240,\\fscx100\\fscy100)}"
    # ouverture
    hp = (540, 960) if vert else (960, 540)
    add("Hook", 0.15, 2.7, "{\\pos(%d,%d)\\fad(120,150)}" % hp + bounce + "ÈVE A-T-ELLE\\NVRAIMENT PÉCHÉ\\NEN MANGEANT\\NLE FRUIT ?" if vert else
        "{\\pos(%d,%d)\\fad(120,150)}" % hp + bounce + "ÈVE A-T-ELLE VRAIMENT PÉCHÉ\\NEN MANGEANT LE FRUIT ?")
    add("HookTitre", 2.8, HOOK + 0.25, "{\\pos(%d,%d)\\fad(80,250)\\fscx40\\fscy40\\t(0,180,\\fscx112\\fscy112)\\t(180,320,\\fscx100\\fscy100)}LE PARDON\\NDIVIN" % hp)
    story_end = med_range[2]
    if vert:
        add("Label", HOOK, story_end, "{\\pos(540,120)}ÉPISODE 1 · AU COMMENCEMENT", 0)
    def hidden(s, e):
        for a, b in hide_ranges:
            if s < b and e > a: return (a, b)
        return None
    for s, e, words in subs:
        s += HOOK; e += HOOK
        h = hidden(s, e)
        if h:
            a, b = h
            if s >= a and e <= b: continue
            if s < a: e = a
            else: s = b
            if e - s < 0.35: continue
        lines = split2(words)
        txt = "\\N".join(fmt_words(l) for l in lines)
        pos = "{\\pos(540,430)}" if vert else "{\\an2\\pos(960,1040)}"
        add("Sub", s, e, pos + bounce + txt)
    tp = (540, 1350) if vert else (960, 150)
    for txt, s, d in titles:
        add("Titre", s + HOOK, s + HOOK + d, "{\\pos(%d,%d)\\fad(60,250)}" % tp +
            "{\\fscx40\\fscy40\\t(0,140,\\fscx115\\fscy115)\\t(140,260,\\fscx95\\fscy95)\\t(260,360,\\fscx100\\fscy100)}" + txt, 2)
    open(path, "w").write(head + "\n".join(L) + "\n")

def srt_time(t):
    ms = int(round(t * 1000)); return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"

def write_srt(path, subs):
    out = []
    for i, (s, e, words) in enumerate(subs, 1):
        out.append(f"{i}\n{srt_time(s + HOOK)} --> {srt_time(e + HOOK)}\n" + "\n".join(" ".join(l) for l in split2(words)) + "\n")
    open(path, "w").write("\n".join(out))

# ---------------------------------------------------------------- composition par format
def compose(work, fmt, program, assets, cards, ass, med_range, total_main, window=None, out=None, extra_end=None):
    vert = fmt == "tiktok"
    W, H = (1080, 1920) if vert else (1920, 1080)
    A = os.path.join(assets, fmt)
    med_d = 300 if vert else 210
    ring = os.path.join(A, "medaillon_bord.png")
    from PIL import Image
    rw, rh = Image.open(ring).size
    mx, my = (40, 1440) if vert else (30, H - rh - 20)
    t0 = window[0] if window else 0.0
    t1 = window[1] if window else total_main
    inputs = ["-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", program,
              "-stream_loop", "-1", "-i", os.path.join(work, "medaillon_src.mp4"),
              "-loop", "1", "-i", os.path.join(A, "medaillon_masque.png"),
              "-loop", "1", "-i", ring]
    fl = [f"[0:v]setpts=PTS+{t0:.3f}/TB,split=2[p1][p2]"]
    if vert:
        fl.append("[p1]scale=270:480:force_original_aspect_ratio=increase,crop=270:480,gblur=sigma=10,"
                  "scale=1080:1920:flags=bicubic,colorchannelmixer=rr=0.65:gg=0.65:bb=0.65[bg]")
        fl.append("[p2]scale=1080:608:flags=lanczos[fg]")
        fl.append("[bg][fg]overlay=0:656,drawbox=x=0:y=652:w=1080:h=4:color=0xD4AF37@1:t=fill,"
                  "drawbox=x=0:y=1264:w=1080:h=4:color=0xD4AF37@1:t=fill[base]")
    else:
        fl.append("[p1]null[base]"); fl.append("[p2]nullsink")
    # médaillon
    m0, m1 = med_range[0], med_range[1]
    fl.append(f"[1:v]scale={med_d}:{med_d},setpts=PTS+{t0:.3f}/TB[mv]")
    fl.append(f"[2:v]format=gray,scale={med_d}:{med_d}[mm]")
    fl.append("[mv][mm]alphamerge[med]")
    fl.append(f"[base][med]overlay={mx + 10}:{my + 10}:shortest=0:eof_action=pass:enable='between(t,{m0:.2f},{m1:.2f})'[b1]")
    fl.append(f"[b1][3:v]overlay={mx}:{my}:enable='between(t,{m0:.2f},{m1:.2f})'[b2]")
    # cartes de versets : flou plein cadre + parchemin
    cur = "b2"; k = 4; ranges = []
    vis = [c for c in cards if c["start"] + HOOK < t1 and c["start"] + HOOK + c["dur"] > t0]
    if vis:
        en = "+".join(f"between(t,{c['start']+HOOK:.2f},{c['start']+HOOK+c['dur']:.2f})" for c in vis)
        fl.append(f"[{cur}]split=2[c1][c2]")
        sw, sh = (270, 480) if vert else (480, 270)
        fl.append(f"[c2]scale={sw}:{sh},gblur=sigma=5,scale={W}:{H},colorchannelmixer=rr=0.8:gg=0.8:bb=0.8[cb]")
        fl.append(f"[c1][cb]overlay=enable='{en}'[cbo]"); cur = "cbo"
        for c in vis:
            s = c["start"] + HOOK; d = c["dur"]
            inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", os.path.join(A, f"verset_{c['id']}.png")]
            fl.append(f"[{k}:v]format=rgba,fade=in:st=0:d=0.35:alpha=1,fade=out:st={d-0.35:.3f}:d=0.35:alpha=1,"
                      f"setpts=PTS+{s:.3f}/TB[k{k}]")
            fl.append(f"[{cur}][k{k}]overlay=0:0:eof_action=pass[o{k}]"); cur = f"o{k}"; k += 1
    fontsdir = FONTS
    fl.append(f"[{cur}]ass='{ass}':fontsdir='{fontsdir}',setpts=PTS-STARTPTS,format=yuv420p[main]")
    last = "main"
    if extra_end:   # cartes de fin (épisode complet) ou carte « épisode complet » (extraits)
        n0 = k
        for img, d in extra_end:
            inputs += ["-loop", "1", "-t", f"{d:.3f}", "-i", img]
        parts = []
        for j, (img, d) in enumerate(extra_end):
            fo = f",fade=out:st={d-1.0:.2f}:d=1.0" if j == len(extra_end) - 1 else ""
            fl.append(f"[{n0+j}:v]scale={W}:{H},fps={FPS},format=yuv420p,fade=in:st=0:d=0.4{fo},setsar=1[e{j}]")
            parts.append(f"[e{j}]")
        fl.append(f"[{last}]fps={FPS},setsar=1[m2]")
        fl.append("[m2]" + "".join(parts) + f"concat=n={len(parts)+1}:v=1:a=0[fin]"); last = "fin"
    out = out or os.path.join(work, f"video_{fmt}.mp4")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fl), "-map", f"[{last}]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an", out])
    return out

def medallion_src(work):
    out = os.path.join(work, "medaillon_src.mp4")
    if os.path.exists(out): return out
    # nouveau clip 02 (costume, lunettes) : gros plan stable entre 6,8 et 8,8 s, aller-retour sans saut
    run(["ffmpeg", "-v", "error", "-y", "-ss", "6.8", "-t", "2", "-i", clip_path("02"), "-filter_complex",
         "[0:v]crop=460:460:400:15,fps=30,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,"
         + GRADES["ville"] + "[o]", "-map", "[o]", *ENC_TMP, out])
    return out

# ---------------------------------------------------------------- audio
LUFS_CACHE = {}
def lufs(path):
    if path in LUFS_CACHE: return LUFS_CACHE[path]
    r = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True)
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    LUFS_CACHE[path] = float(m[-1]) if m else -23.0
    return LUFS_CACHE[path]

def build_audio(work, voice_path, events, ouestu, total, out, missing):
    sons = json.load(open(os.path.join(ROOT, "montage", "sons.json")))
    inputs = ["-i", voice_path]; fl = []
    fmt = "aformat=sample_rates=48000:channel_layouts=stereo"
    a0, a1 = ouestu[0] + HOOK, ouestu[1] + HOOK + 0.05
    fl.append(f"[0:a]{fmt},adelay={int(HOOK*1000)}:all=1,apad=whole_dur={total:.3f},asplit=3[v1][v2][vsc]")
    fl.append(f"[v2]atrim={a0:.3f}:{a1:.3f},asetpts=PTS-STARTPTS,apad=pad_dur=1.6,aecho=0.85:0.75:260|520:0.32|0.16,"
              f"adelay={int(a0*1000)}:all=1[echo]")
    fl.append(f"[v1]volume=0:enable='between(t,{a0:.3f},{a1:.3f})'[vm]")
    fl.append("[vm][echo]amix=inputs=2:normalize=0:duration=first[voice]")
    idx = 1; labels = []
    for name, st, dur, target, fi, fo, off in events:
        f = sons.get(name)
        if not f:
            missing.add(name); continue
        p = os.path.join(SONS, f)
        g = target - lufs(p)
        inputs += ["-stream_loop", "-1", "-i", p]
        fo = min(fo, dur / 2); fi = min(fi, dur / 2)
        fl.append(f"[{idx}:a]{fmt},atrim={off:.3f}:{off+dur:.3f},asetpts=PTS-STARTPTS,volume={g:.2f}dB,"
                  f"afade=in:st=0:d={fi:.3f},afade=out:st={dur-fo:.3f}:d={fo:.3f},adelay={int(max(0,st)*1000)}:all=1[s{idx}]")
        labels.append(f"[s{idx}]"); idx += 1
    fl.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,apad=whole_dur={total:.3f},atrim=0:{total:.3f}[sfx]")
    fl.append("[sfx][vsc]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=450:makeup=1[duck]")
    fl.append(f"[voice][duck]amix=inputs=2:normalize=0:duration=first,atrim=0:{total:.3f}[mix]")
    pre = os.path.join(work, "mix_pre.wav")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fl), "-map", "[mix]", "-ar", "48000", pre])
    # loudnorm deux passes : -14 LUFS, pic -1 dBTP
    r = subprocess.run(["ffmpeg", "-nostats", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", ln + ",alimiter=limit=0.89:level=false", "-ar", "48000", out])
    return out

def mux(video, audio, out, a_start=0.0, dur=None, fade_out=None):
    af = []
    if fade_out: af = ["-af", f"afade=out:st={fade_out[0]:.3f}:d={fade_out[1]:.3f}"]
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", video, "-ss", f"{a_start:.3f}", "-i", audio]
    cmd += ["-map", "0:v", "-map", "1:a", "-c:v", "copy", *af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-shortest", "-movflags", "+faststart", out]
    run(cmd)

# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("work"); ap.add_argument("--preview", nargs=2, type=float)
    ap.add_argument("--formats", default="tiktok,youtube"); ap.add_argument("--extraits", action="store_true")
    ap.add_argument("--plan-only", action="store_true")
    args = ap.parse_args()
    work = args.work; os.makedirs(work, exist_ok=True)
    corr = json.load(open(os.path.join(ROOT, "montage", "corrections.json")))
    v = Voice(os.path.join(work, "transcript.json"))
    for w in v.words:
        for k, val in corr["mots"].items():
            if w[0].strip(".,;:!?»«…").lower() == k.lower():
                w[0] = w[0].replace(w[0].strip(".,;:!?»«…"), val)
    v.apply_fixes(corr["remplacements"])
    P, cards, titles, a = build_plan(v)
    story_end = v.end + 1.2
    total_main = HOOK + story_end
    shots_23 = [s for s in P if s["clip"] == "23"][0]
    s03 = [s for s in P if s["clip"] == "03"][0]
    med_range = (s03["start"] + HOOK, shots_23["start"] + HOOK, total_main)
    plan = dict(plans=[{k: (round(x, 2) if isinstance(x, float) else x) for k, x in s.items()} for s in P],
                cartes=cards, titres=titles, total=total_main)
    json.dump(plan, open(os.path.join(work, "plan.json"), "w"), ensure_ascii=False, indent=1)
    if args.plan_only:
        for s in P: print(f"{s['clip']:>6} {s['start']+HOOK:7.2f} → {s['end']+HOOK:7.2f}  ({s['end']-s['start']:5.2f}s) {s['grade']}")
        return
    subs = chunks(v)
    hide = [(c["start"] + HOOK, c["start"] + HOOK + c["dur"]) for c in cards]
    assets = os.path.join(work, "assets")
    if not os.path.exists(os.path.join(assets, "tiktok", "fin3.png")):
        run([sys.executable, os.path.join(ROOT, "montage", "assets.py"), assets])
    medallion_src(work)
    program = build_program(work, P, story_end)
    missing = set()
    events = sfx_events(v, P, cards, a, story_end)
    audio = os.path.join(work, "mix.wav")
    build_audio(work, os.path.join(ROOT, "audio", "ep1.mp3"), events, a["ouestu"], total_main + 3 * END_CARD, audio, missing)
    if missing: print("SONS MANQUANTS (moments laissés sans bruit) :", ", ".join(sorted(missing)))
    outdir = os.path.join(ROOT, "sorties"); os.makedirs(outdir, exist_ok=True)
    for fmt in args.formats.split(","):
        ass = os.path.join(work, f"subs_{fmt}.ass")
        write_ass(ass, fmt, subs, titles, cards, hide, med_range)
        if args.preview:
            A, B = args.preview
            vid = compose(work, fmt, program, assets, cards, ass, med_range, total_main, window=(A, B),
                          out=os.path.join(work, f"apercu_{fmt}.mp4"))
            mux(vid, audio, os.path.join(outdir, f"apercu-{fmt}.mp4"), a_start=A, fade_out=(B - A - 0.6, 0.6))
            continue
        A = os.path.join(assets, fmt)
        ends = [(os.path.join(A, "fin1.png"), END_CARD), (os.path.join(A, "fin2.png"), END_CARD), (os.path.join(A, "fin3.png"), END_CARD)]
        vid = compose(work, fmt, program, assets, cards, ass, med_range, total_main, extra_end=ends)
        mux(vid, audio, os.path.join(outdir, f"episode-1-{fmt}.mp4"))
    if not args.preview:
        write_srt(os.path.join(outdir, "episode-1.srt"), subs)
        chap = [("Introduction", 0), ("La création", a["gen11"] + HOOK), ("Le jardin d'Éden", a["laisse"] + HOOK),
                ("Le serpent", a["unjour"] + HOOK), ("Le péché commence dans la pensée", a["beaucoup"] + HOOK),
                ("Où es-tu ?", a["entendent"] + HOOK), ("Les conséquences", a["consequences"] + HOOK),
                ("Les habits de peau", a["habits"] + HOOK), ("Conclusion", a["salaire"] + HOOK)]
        open(os.path.join(outdir, "chapitres.txt"), "w").write(
            "".join(f"{int(t//60)}:{int(t%60):02d} {n}\n" for n, t in chap))
        json.dump(dict(a={k: v_ for k, v_ in a.items()}, total=total_main + 3 * END_CARD),
                  open(os.path.join(work, "ancres.json"), "w"), ensure_ascii=False, indent=1, default=str)

if __name__ == "__main__":
    main()
