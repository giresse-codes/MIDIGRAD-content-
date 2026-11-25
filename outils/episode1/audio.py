"""Mixage : voix (une seule), bruitages, musique en sidechain, -14 LUFS / -1 dBTP.
Usage: audio.py out.wav [t_start t_end]"""
import json, subprocess, re, sys, unicodedata
REPO = "/home/user/MIDIGRAD-content-"
tl = json.load(open("timeline.json")); meta = json.load(open("meta.json"))
words = json.load(open("words.json")); vad = json.load(open("vad_edit.json"))
V0 = tl["V0"]; DUR = tl["duration"]; FIN0 = meta["FIN0"]
LUFS = {}
for l in open("sons_lufs.txt"):
    n, v = l.split(); LUFS[n] = float(v)
DUR_S = {}
for n in LUFS:
    DUR_S[n] = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{REPO}/sons/{n}.mp3"]))

def norm(w):
    w = unicodedata.normalize("NFD", w.lower()); w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)
NW = [norm(x["w"]) for x in words]
def at(ph, after=0, end=False):
    toks = [norm(t) for t in ph.split() if norm(t)]
    for i in range(after, len(NW)):
        if NW[i:i + len(toks)] == toks:
            return (words[i + len(toks) - 1]["e"] if end else words[i]["s"]) + V0
    raise SystemExit("introuvable " + ph)

EV = []  # (son, t, durée, cible LUFS, fondu entrée, fondu sortie, offset source)
AMB, PONCT = -28.0, -23.0
def ev(name, t, dur=None, lvl=PONCT, fi=0.02, fo=0.3, off=0.0):
    d = DUR_S[name] - off if dur is None else dur
    EV.append((name, t, d, lvl, fi, fo, off))

# --- ouverture / fermeture MIDIGRAD
ev("logo-reveal", 0.0, 5.0, -17.0, 0.01, 0.8)
ev("logo-reveal", FIN0 + 3.0, 5.0, -17.0, 0.01, 1.0)
ev("magie-lumiere", FIN0, 3.0, -24, 0.1, 0.8)
# --- sons attachés aux plans
for p in tl["pieces"]:
    s = p.get("sound", "")
    if not s: continue
    for n in re.split(r"\+", re.sub(r"\(.*?\)", "", s).strip()):
        n = n.strip()
        if not n: continue
        t = p["t0"]
        if n in ("ambiance-ville",): continue  # géré plus bas
        if n in ("oiseaux-foret", "cascade", "vagues", "vent-doux", "vent-fort", "pluie", "feu", "foule"): continue
        lvl = {"lion": -30, "elephant": -32, "croquer": -21, "serpent": -22, "souffle": -22, "coeur": -27, "agneau": -25,
               "magie-lumiere": -25, "tonnerre": -20, "rembobinage": -22, "feu-epee": -22, "ailes": -24, "feuilles": -26,
               "pas-herbe": -27, "travail-terre": -25}.get(n, PONCT)
        dur = {"lion": 2.0, "elephant": 1.6, "croquer": 1.3, "coeur": min(6.0, p["t1"] - t + 2), "pas-herbe": 2.5,
               "feuilles": 3.0, "travail-terre": 3.0, "magie-lumiere": 3.0, "rembobinage": p["t1"] - t, "tonnerre": 5.0,
               "serpent": 2.0, "souffle": 3.0, "ailes": 3.0}.get(n)
        off = {"croquer": 0.0}.get(n, 0.0)
        ev(n, t, dur, lvl, 0.02, 0.4, off)
# whoosh sur les transitions lumineuses et sur l'accroche
for p in tl["pieces"]:
    if p.get("trans") == "flash" and p["t0"] > 5: ev("whoosh", p["t0"] - 0.35, 1.2, -27, 0.02, 0.4)
ev("whoosh", 5.0 - 0.3, 1.2, -24)
# parchemin sur chaque carte de verset
for c in tl["cards"]: ev("parchemin", c["t0"], 1.6, -27, 0.02, 0.4)

# --- ambiances (-30 à -26 LUFS, fondus 0,8 s)
def amb(name, t0, t1, lvl=AMB):
    # boucle si nécessaire
    t = t0
    while t < t1 - 0.05:
        d = min(t1 - t, DUR_S[name] - 0.5)
        if d < 1.0: break
        ev(name, t, d, lvl, 0.8, 0.8); t += d - 0.8
t_rem = at("Remontons"); t_jard = at("planta un jardin"); t_basc = at("tout bascule"); t_cach = at("ils se cachent")
t_ou = at("Où es-tu"); t_ou_e = at("Où es-tu", end=True)
amb("ambiance-ville", V0 - 1.5, V0 + 4.0, -30)
amb("vagues", at("Au commencement, Dieu créa"), at("forma l'homme"), -29)
amb("vent-doux", at("Au commencement, Dieu créa"), t_jard, -31)
amb("oiseaux-foret", t_jard, t_basc, -29)
amb("cascade", t_jard, at("Ève regarde l'arbre"), -32)
amb("vent-fort", t_basc, t_cach + 2.0, -28)
amb("pluie", t_basc, t_cach + 2.0, -28)
# silence presque total avant « Où es-tu ? » : rien entre t_cach+2 et t_ou
amb("feu", at("chassés du jardin"), at("ce péché ne s'est pas arrêté"), -30)
amb("foule", at("ce péché ne s'est pas arrêté"), at("La Bible dit aussi"), -30)
amb("vent-fort", at("Eux l'avaient fait"), at("Dieu lui-même a trouvé"), -32)
amb("ambiance-ville", at("Dans le prochain épisode"), FIN0, -32)

# --- voix : égalisation de l'intro, écho sur « Où es-tu ? »
# frontière intro = première pause > 0,35 s après 24 s
cut = next(p for p in vad["pauses"] if p[0] > 24.0); intro_end = (cut[0] + cut[1]) / 2
ou0, ou1 = t_ou - V0, t_ou_e - V0
ms = lambda x: int(round(x * 1000))

import numpy as np
SR = 48000
def load(name):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f"{REPO}/sons/{name}.mp3", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2)
cache = {}
N = int(DUR * SR) + SR
bed = np.zeros((N, 2), np.float32)
for (n, t, d, lvl, fi, fo, off) in EV:
    if n not in cache: cache[n] = load(n)
    x = cache[n][int(off * SR):int((off + d) * SR)].copy()
    if len(x) == 0: continue
    L = len(x); fi_n = max(1, int(min(fi, d / 3) * SR)); fo_n = max(1, int(min(fo, d) * SR))
    x[:fi_n] *= np.linspace(0, 1, fi_n)[:, None]; x[-fo_n:] *= np.linspace(1, 0, fo_n)[:, None]
    g = 10 ** ((lvl - LUFS[n] + 2.0) / 20)
    a = int(t * SR); b = min(N, a + L)
    bed[a:b] += x[:b - a] * g
# musique en boucle (fondu enchaîné 2 s entre les boucles)
mus = load("musique"); musg = 10 ** ((-26 - LUFS["musique"] + 2.0) / 20)
pos = int(4.5 * SR); xf = 2 * SR
while pos < N:
    seg = mus.copy(); L = min(len(seg), N - pos)
    seg[:xf] *= np.linspace(0, 1, xf)[:, None]; seg[-xf:] *= np.linspace(1, 0, xf)[:, None]
    bed[pos:pos + L] += seg[:L] * musg; pos += len(seg) - xf
fo = int(3 * SR); bed[int((DUR - 3) * SR):int(DUR * SR)] *= np.linspace(1, 0, int(DUR * SR) - int((DUR - 3) * SR))[:, None]
bed[int(DUR * SR):] = 0
bed[:int(DUR * SR)].astype(np.float32).tofile("bed.f32")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", "voice_edit.wav", "-af",
    f"aresample=48000,equalizer=f=3200:t=h:w=1.0:g=1.5:enable='lt(t,{intro_end:.3f})'", "-f", "f32le", "-ac", "1", "-ar", "48000", "voice_eq.f32"])
vm = np.fromfile("voice_eq.f32", np.float32)
print("voix (s):", len(vm) / SR)
# écho léger sur « Où es-tu ? »
seg = vm[int(ou0 * SR):int((ou1 + 0.1) * SR)].copy()
for dly, gn in ((0.28, 0.32), (0.56, 0.16)):
    a = int((ou0 + dly) * SR); vm[a:a + len(seg)] += seg[:max(0, min(len(seg), len(vm) - a))] * gn
# niveau : -16 LUFS intégrés (mesuré)
vm.astype(np.float32).tofile("voice_tmp.f32")
mm = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", "48000", "-ac", "1", "-i", "voice_tmp.f32", "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
vi = float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", mm)[-1])
vm *= 10 ** ((-16 - vi - 3.0) / 20)  # 2 canaux identiques = +3 LU : -19 par canal = -16 LUFS stéréo
v = np.zeros((int(DUR * SR), 2), np.float32)
a = int(V0 * SR); L = min(len(vm), len(v) - a); v[a:a + L] = vm[:L, None]
M = min(len(v), int(DUR * SR)); v = v[:M]; b = bed[:M]
# atténuation automatique sous la voix (sidechain) : enveloppe RMS 20 ms, attaque 15 ms, relâchement 450 ms
hop = 480
e = np.sqrt((v[:M // hop * hop, 0].reshape(-1, hop) ** 2).mean(1) + 1e-10)
edb = 20 * np.log10(e)
red = np.clip((edb + 42) * 0.6, 0, 9.0)  # jusqu'à -9 dB quand la voix parle
sm = np.zeros_like(red); a_att = 1 - np.exp(-hop / SR / 0.015); a_rel = 1 - np.exp(-hop / SR / 0.45)
for k in range(len(red)):
    prev = sm[k - 1] if k else 0
    sm[k] = prev + (red[k] - prev) * (a_att if red[k] > prev else a_rel)
g = 10 ** (-np.repeat(sm, hop) / 20); g = np.concatenate([g, np.full(M - len(g), g[-1])])
mix = v + b * g[:, None]
mix.astype(np.float32).tofile("mix_pre.f32")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", "48000", "-ac", "2", "-i", "mix_pre.f32", "-c:a", "pcm_s24le", "pre_" + sys.argv[1]])
out = sys.argv[1]
print("atténuation moyenne pendant la parole (dB):", round(float(sm[red > 0].mean()), 1))
# norme finale deux passes : -14 LUFS, crête -1 dBTP
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "pre_" + out, "-af", "loudnorm=I=-13.6:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
af = (f"loudnorm=I=-13.6:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,alimiter=limit=0.89:level=false,aresample=48000")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", "pre_" + out, "-af", af, "-c:a", "pcm_s24le", "-ar", "48000", out])
print("intro_end", intro_end, "écho", ou0, ou1, "événements", len(EV))
