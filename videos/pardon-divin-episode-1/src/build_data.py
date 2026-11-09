# Mixage (voix + bruitages de audio/sons/) et données du film (assets/data.js, assets/audio.wav).
# Bruitages : ambiances ≈ -28 LUFS en boucle avec fondus, bruits ponctuels ≈ -22 LUFS, toujours sous la voix ;
# baisse automatique sous la voix (sidechaincompress de FFmpeg), écho léger (aecho) sur « Où es-tu ? » seulement.
# Fichiers manquants : signalés, le moment reste sans bruit (aucun son fabriqué).
import json, os, re, subprocess, unicodedata, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000; FPS = 30
SONS = os.path.join(ROOT, "audio", "sons")
T = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))
OFF = 0.5
words = [[w["m"], round(w["t0"] + OFF, 3), round(w["t1"] + OFF, 3)] for w in T["mots"]]
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())
NW = [norm(w[0]) for w in words]
def find(ph, after=0):
    q = [norm(x) for x in ph.split() if norm(x)]
    for i in range(len(NW)):
        if words[i][1] < after: continue
        if NW[i:i + len(q)] == q: return i, i + len(q) - 1
    raise SystemExit("phrase introuvable : " + ph)
P = lambda ph, a=0: words[find(ph, a)[0]][1]
PE = lambda ph, a=0: words[find(ph, a)[1]][2]
W_ = lambda ph, k, a=0: words[find(ph, a)[0] + k][1]          # début du k-ième mot de la phrase
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def wr(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
def lufs(x):
    if len(x) < SR * 0.5: x = np.concatenate([x, np.zeros(int(SR * 0.5), np.float32)])
    p_ = os.path.join(ROOT, "assets", "_m.wav"); wr(p_, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p_, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr; os.remove(p_)
    try: return float(r[r.rindex("I:"):].split()[1])
    except Exception: return -70.0
voice0 = load(os.path.join(ROOT, "audio", "ep1.mp3"))
END = words[-1][2]; LOGO = round(END + 0.8, 2); SIG = round(LOGO + 4.0, 2); DUR = round(SIG + 3.5, 2)
N = int(DUR * SR); voice = np.zeros(N, np.float32); i0 = int(OFF * SR); voice[i0:i0 + len(voice0)] = voice0[:N - i0]
LV = lufs(voice)
# écho léger sur « Où es-tu ? » uniquement
a, b = P("Où es-tu ?"), PE("Où es-tu ?") + 0.05
seg = voice[int(a * SR):int(b * SR)].copy(); tmp = os.path.join(ROOT, "assets", "_e.wav"); wr(tmp, np.concatenate([seg, np.zeros(int(1.2 * SR), np.float32)]))
ech = subprocess.run(["ffmpeg", "-v", "error", "-i", tmp, "-af", "aecho=0.8:0.7:180|360:0.35|0.2", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout; os.remove(tmp)
ech = np.frombuffer(ech, dtype=np.int16).astype(np.float32) / 32768
ia, ib = int(a * SR), int(b * SR); voice[ia:ib] = 0; voice[ia:ia + len(ech)] += ech[:N - ia]
# ── bruitages ──
manquants = []; cache = {}
def snd(name):
    p = os.path.join(SONS, name + ".mp3")
    if not os.path.exists(p):
        if name not in manquants: manquants.append(name)
        return None
    if name not in cache: cache[name] = load(p)
    return cache[name]
sfx = np.zeros(N, np.float32)
def amb(name, t0, t1, level=-28, fade=0.8):
    x = snd(name)
    if x is None or t1 <= t0: return
    L = int((t1 - t0) * SR); rep = np.tile(x, L // len(x) + 2)[:L].copy()
    rep *= 10 ** ((level - lufs(x[: SR * 10])) / 20); f = int(fade * SR); f = min(f, L // 2)
    rep[:f] *= np.linspace(0, 1, f); rep[-f:] *= np.linspace(1, 0, f); s = int(t0 * SR); sfx[s:s + L] += rep[:N - s]
def hit(name, t, level=-22, dur=None, start=0.0, fade=0.05):
    x = snd(name)
    if x is None: return
    x = x[int(start * SR):]; x = x[:int(dur * SR)] if dur else x; x = x.copy()
    x *= 10 ** ((level - lufs(x)) / 20); f = int(fade * SR); x[-f:] *= np.linspace(1, 0, f); s = int(t * SR); sfx[s:s + len(x)] += x[:N - s]
C = dict(remontons=P("Remontons au tout commencement"), gen1=P("Genèse, chapitre 1, verset 1"), lumiere=P("la lumière, le ciel"), ciel=P("le ciel, la mer"), mer=P("la mer, les arbres"),
         arbres=P("les arbres, les animaux"), animaux=P("les animaux."), special=P("Puis Dieu a fait quelque chose"), forma=P("L'Éternel Dieu forma"), souffla=P("il souffla dans ses narines"),
         pasLaisse=P("Dieu ne l'a pas laissé"), deuxArbres=P("deux arbres"), manque=P("Mais Dieu voit qu'il manque"), eve=P("Alors Dieu crée la femme"), marchaient=P("Ils marchaient avec lui"), voulue=PE("Dieu l'avait voulue."),
         regle=P("Dans ce jardin, Dieu avait donné"), unJour=P("Mais un jour, quelqu'un"), reellement=P("Dieu a-t-il réellement dit"), mourrez=P("Vous ne mourrez point"), regarde=P("Ève regarde l'arbre"),
         mangeaE=W_("et en mangea ;", 2), mangeaA=W_("et il en mangea.", 3), beaucoup=P("Beaucoup d'entre vous"), revenons=P("Revenons en arrière"), apres=P("Après que le serpent eut fini"),
         unFruit=P("Un fruit, une seule désobéissance"), bascule=P("tout bascule."), cachent=P("ils se cachent."), chercher=P("Mais Dieu vient les chercher"), ouEsTu=P("Où es-tu ?"), savait=P("Dieu savait très bien"),
         laRegardez=P("Et là, regardez bien"), accuse=P("Adam accuse Ève"), consequences=P("Le péché a des conséquences"), chasses=P("Adam et Ève sont chassés"), arrete=P("Et ce péché ne s'est pas arrêté"),
         habits=P("La Bible dit aussi que Dieu a fait"), solution=P("Dieu lui-même a trouvé la solution"), animal=P("un animal a dû mourir"), salaire=P("Car le salaire du péché"), prochain=P("Dans le prochain épisode"),
         abel=P("Abel, Noé"), noe=P("Noé, Abraham"), abraham=P("Abraham, et cette nuit"), egypte=P("cette nuit en Égypte"), merci=P("Merci d'avoir regardé"))
SCN = [C["remontons"], C["gen1"] - 0.6, C["special"] - 0.3, C["pasLaisse"] - 0.3, C["manque"] - 0.3, C["regle"] - 0.3, C["unJour"] - 0.3, C["regarde"] - 0.3, C["beaucoup"] - 0.3,
       C["unFruit"] - 0.3, C["chercher"] - 0.3, C["laRegardez"] - 0.3, C["consequences"] - 0.3, C["arrete"] - 0.3, C["habits"] - 0.3, C["salaire"] - 0.3, C["prochain"] - 0.3]
# rue de Douala (début et fin) : ambiance-ville
amb("ambiance-ville", 0.0, C["remontons"] + 1.5, -28); amb("ambiance-ville", C["prochain"] - 0.3, DUR - 0.5, -28)
# transitions de scène : whoosh ; cartes de versets : parchemin
for t in SCN: hit("whoosh", t - 0.25, -22, dur=1.4, start=0.0)
CARDS = [C["gen1"], P("Genèse, chapitre 2, verset 7"), P("Et la Bible dit"), P("Tu pourras manger"), P("Le serpent était le plus rusé"), C["mourrez"], P("Les yeux de l'un"), P("Tu es poussière"),
         P("Romains, chapitre 5, verset 12"), P("Genèse, chapitre 3, verset 21"), C["salaire"]]
for t in CARDS: hit("parchemin", t - 0.1, -22)
# création
hit("magie-lumiere", C["lumiere"] - 0.2, -22); amb("vagues", C["mer"], C["special"] - 0.2, -28); amb("vent-doux", C["ciel"], C["special"] - 0.2, -30)
amb("oiseaux-foret", C["arbres"], C["special"] - 0.2, -29); hit("lion", C["animaux"] + 0.5, -22, dur=3.5, start=1.5); hit("elephant", C["animaux"] + 1.5, -23)
# Adam formé : souffle
hit("souffle", C["forma"], -24, dur=4.0); hit("souffle", C["souffla"], -22, dur=3.5)
# Éden : ambiance continue
amb("oiseaux-foret", C["pasLaisse"] - 0.3, C["bascule"] + 0.3, -28, fade=1.0); amb("cascade", C["pasLaisse"] - 0.3, C["bascule"] + 2, -31, fade=1.0); amb("vent-doux", C["pasLaisse"] - 0.3, C["bascule"], -32, fade=1.0)
amb("pas-herbe", C["pasLaisse"] + 0.2, C["deuxArbres"], -27, fade=0.4); amb("pas-herbe", C["marchaient"] - 0.2, C["voulue"] + 0.5, -27, fade=0.4)
# serpent : sifflement court à son apparition et quand il parle
for t in [C["unJour"] + 0.3, C["reellement"] - 0.2, C["mourrez"] - 0.2, C["accuse"] + 0.4]: hit("serpent", t, -23, dur=0.9, start=0.5, fade=0.2)
# bouchées
hit("croquer", C["mangeaE"], -21, dur=0.8, start=2.5); hit("croquer", C["mangeaA"], -21, dur=0.8, start=2.5)
# retour en arrière : rembobinage
hit("rembobinage", C["revenons"], -22)
# tout bascule : vent fort, feuilles ; cachette ; silence avant « Où es-tu ? »
amb("vent-fort", C["bascule"] - 0.2, C["cachent"] + 1.2, -27, fade=1.0); hit("feuilles", C["bascule"] + 0.3, -23, dur=4.0); hit("feuilles", C["cachent"], -22, dur=2.0)
amb("vent-doux", C["chercher"] - 0.3, C["ouEsTu"] - 0.8, -36, fade=0.6)
amb("pas-herbe", C["savait"] - 0.4, C["savait"] + 1.4, -28, fade=0.3)
# conséquences, expulsion : tonnerre, feu de l'épée
hit("tonnerre", C["consequences"], -24, dur=8.0); hit("tonnerre", C["chasses"] - 0.3, -23, dur=8.0); amb("feu", C["chasses"], C["arrete"] - 0.3, -27, fade=0.6)
amb("vent-doux", C["arrete"] - 0.3, C["habits"] - 0.3, -32)
# habits de peau : agneau (une seule fois), puis lumière
hit("agneau", C["animal"] + 0.2, -24); hit("magie-lumiere", C["solution"] - 0.3, -22)
amb("oiseaux-foret", C["habits"] - 0.3, C["prochain"] - 0.3, -33, fade=1.0)
# teaser
for t in [C["abel"], C["noe"], C["abraham"], C["egypte"], C["merci"]]: hit("whoosh", t - 0.55, -24, dur=1.2)
amb("feu", C["abel"] - 0.3, C["noe"], -29, fade=0.3)
# ── mixage : baisse des sons sous la voix (sidechain), puis loudnorm -14 LUFS / -1 dB ──
vp = os.path.join(ROOT, "assets", "_v.wav"); sp = os.path.join(ROOT, "assets", "_s.wav"); mp = os.path.join(ROOT, "assets", "_mix.wav")
wr(vp, voice * 0.7); wr(sp, sfx * 0.7)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sp, "-i", vp, "-filter_complex",
                "[1:a]asplit=2[sc][vo];[0:a][sc]sidechaincompress=threshold=0.02:ratio=5:attack=30:release=500:makeup=1[du];[du][vo]amix=inputs=2:normalize=0[m]",
                "-map", "[m]", "-c:a", "pcm_s16le", mp], check=True)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp, "-af", ln, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True)
for p_ in (vp, sp, mp): os.remove(p_)
# lip-sync de Wilfried : niveau 0-9 par image
hop = SR // FPS; nf = N // hop
lv = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
lv = np.clip(lv / np.percentile(lv[lv > 1e-4], 90), 0, 1); lv = np.convolve(lv, [0.25, 0.5, 0.25], "same")
data = {"fps": FPS, "dur": DUR, "off": OFF, "logo": LOGO, "sig": SIG, "words": words, "lev": "".join(str(int(min(9, x * 10))) for x in lv)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("durée", DUR, "| logo", LOGO, "| signature", SIG, "| sons manquants :", ", ".join(manquants) or "aucun")
