# « Ma part suffit » partie 2 (mise à jour) — découpage, montage audio (voix, ambiances, pleurs), lip-sync.
# Usage : python3 build_data.py  (lit ../audio/voixoff.wav et ../timings.json, produits par timings.py)
#   → ../assets/data.js, ../assets/audio.wav (non versionné)
import json, os, subprocess, sys, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, HERE)
from pleurs_mix import pleurs_bed
FPS, SR = 30, 48000
OFF = 1.5    # la rue avant la première phrase du narrateur
GAP1 = 2.5   # après N1 : couloir de l'hôpital, porte poussée, entrée dans la chambre
GAP2 = 2.2   # après la réplique 09 : recul de la caméra + fondu vers le blanc chaud
TJ = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8")); TR = {r["id"]: r for r in TJ["tours"]}
CUT1 = (TR["N1"]["fin"] + TR["01"]["debut"]) / 2; CUT2 = (TR["09"]["fin"] + TR["N2"]["debut"]) / 2
M = lambda t: OFF + t + (GAP1 if t > CUT1 else 0) + (GAP2 if t > CUT2 else 0)
WHO = {"NARRATEUR": "N", "ANNABELLE": "A", "PASTEUR YANNICK": "P"}
# sous-parties (numérotation reprise de la version précédente, pour la mise en scène) : premiers mots de chaque partie
SUB = {"N1": [(0, "")], "01": [(1, "")], "02": [(2, "")], "03": [(3, "")], "04": [(4, ""), (5, "Tu es ici")], "05": [(6, "")],
       "06": [(7, ""), (9, "Être sauvé"), (10, "Je ne te dis"), (11, "Alors, ma sœur, j'aimerais que tu comprennes"), (12, "Pourquoi est-ce"), (13, "Au lieu de ça, tu aurais")],
       "07": [(14, "")], "08": [(15, ""), (16, "Oui, tu dois aller")], "09": [(17, "")],
       "N2": [(18, ""), (19, "Deux ans"), (23, "Et Dieu lui a donné"), (20, "Ah, bien-aimés"), (21, "Dieu voudrait que, quand"), (22, "Mais malgré tout")]}
lines = []
for tid, subs in SUB.items():
    r = TR[tid]; ws = [m["m"] for m in r["mots"]]; starts = []
    for n, head in subs:
        if not head: starts.append(0); continue
        h = head.split(); cl = lambda x: x.strip(",.:;!?…"); k = next(i for i in range(len(ws)) if [cl(x) for x in ws[i:i + len(h)]] == [cl(x) for x in h]); starts.append(k)
    starts.append(len(ws))
    for (n, _), k0, k1 in zip(subs, starts, starts[1:]):
        mots = r["mots"][k0:k1]
        words = [[m["m"], round(M(m["t0"]), 3), m.get("hl", 0)] for m in mots]
        pages = [[max(a, k0) - k0, min(b, k1) - k0] for a, b in r["pages"] if min(b, k1) > max(a, k0)]
        lines.append({"n": n, "who": WHO[r["qui"]], "a": round(M(mots[0]["t0"]), 3), "b": round(M(mots[-1]["t1"]), 3), "words": words, "pages": pages})
LN = {l["n"]: l for l in lines}
END17 = LN[17]["b"]; NARR = LN[18]["a"]; FIN = round(LN[22]["b"] + 1.2, 2); DUR = round(FIN + 4.0, 2); ROOM_IN = round(LN[1]["a"] - 1.6, 2)
# gros plans d'Annabelle pendant les longues paroles du pasteur (secondes de la voix off) — pas pendant les versets.
# niveau d'émotion : 1 blessée/défensive, 2 yeux mouillés, 3 larmes, 4 larmes franches, 5 tête baissée, 6 soulagement
CU = [(43.0, 51.0, 1), (66.0, 72.3, 2), (82.5, 92.4, 3), (93.2, 98.9, 3),
      (121.0, 126.0, 3), (141.5, 149.6, 3), (186.8, 197.4, 4), (209.2, 218.9, 4), (219.4, 226.0, 4), (228.0, 234.6, 4), (239.2, 246.8, 4), (252.6, 263.7, 5),
      (277.8, 281.2, 6), (293.0, 298.4, 6), (310.0, 315.0, 6)]
CU = [[round(M(a), 2), round(M(b), 2), k] for a, b, k in CU]
CRY = [(a, b) for a, b, k in CU if k >= 2]           # pleurs sonores : tous les gros plans sauf le premier (défensive)

w = wave.open(os.path.join(ROOT, "audio", "voixoff.wav")); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
N = int(DUR * SR); voice = np.zeros(N, np.float32)
def put(a, b, dst):
    seg = v[int(a * SR):int(b * SR)].copy(); f = int(0.02 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(dst * SR); voice[i:i + len(seg)] += seg[:N - i]
put(0, CUT1, M(0)); put(CUT1, CUT2, M(CUT1 + 1e-3)); put(CUT2, len(v) / SR, M(CUT2 + 1e-3))
REG = [[M(a), M(b)] for a, b in json.load(open(os.path.join(HERE, "regions.json")))]
t_ax = np.arange(N) / SR; rnd = np.random.default_rng(5)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); n = len(x); X = np.fft.rfft(x); w_ = 2 * np.pi * np.fft.rfftfreq(n) # passe-bas 1er ordre (domaine fréquentiel)
    return np.fft.irfft(X * (1 - a) / (1 - a * np.exp(-1j * w_)), n).astype(np.float32)
# ── rue de Douala (dimanche matin) : rumeur, motos-taxis qui passent, klaxons lointains ; étouffée quand elle s'évanouit ──
FALL = LN[0]["words"][10][1]                         # « évanouie. »
STREET_END = LN[0]["words"][11][1] - 0.2             # « Le pasteur… » : couloir
street = onepole(rnd.standard_normal(N).astype(np.float32), 400) * 0.6 + onepole(rnd.standard_normal(N).astype(np.float32), 2500) * 0.08
for t0 in [0.3, 2.1, 3.6, 5.2]:
    L_ = int(2.6 * SR); tt = np.arange(L_) / SR; f0 = 92 + 20 * rnd.random(); env = np.sin(np.pi * tt / 2.6) ** 2
    saw = 2 * ((f0 * tt + 0.3 * np.sin(2 * np.pi * 9 * tt)) % 1) - 1; i = int(t0 * SR); street[i:i + L_] += (onepole(saw.astype(np.float32), 900) * env * 0.5)[:N - i]
for t0 in [1.2, 4.4]:
    L_ = int(0.35 * SR); tt = np.arange(L_) / SR; i = int(t0 * SR)
    street[i:i + L_] += ((np.sign(np.sin(2 * np.pi * 420 * tt)) + np.sign(np.sin(2 * np.pi * 530 * tt))) * 0.04 * np.clip(tt / 0.02, 0, 1) * np.clip((0.35 - tt) / 0.05, 0, 1)).astype(np.float32)
muff = np.clip((t_ax - (FALL - 0.4)) / 1.2, 0, 1)                    # le son de la rue s'étouffe
street = street * (1 - muff) + onepole(onepole(street, 300), 300) * muff * 0.8
street *= np.clip(t_ax / 0.6, 0, 1) * np.clip((STREET_END + 0.4 - t_ax) / 0.8, 0, 1)
# ── couloir : air conditionné, pas pressés du pasteur ──
hall = onepole(rnd.standard_normal(N).astype(np.float32), 600) * 0.3
for t0 in np.arange(STREET_END + 0.2, ROOM_IN + 0.6, 0.42):
    L_ = int(0.06 * SR); tt = np.arange(L_) / SR; i = int(t0 * SR); hall[i:i + L_] += (rnd.standard_normal(L_) * np.exp(-tt / 0.012) * 0.9).astype(np.float32)
hall *= np.clip((t_ax - STREET_END) / 0.4, 0, 1) * np.clip((ROOM_IN + 1.0 - t_ax) / 0.6, 0, 1)
# ── chambre : bip discret du moniteur ; narration : nappe de piano ──
beep = np.zeros(N, np.float32); bt = ROOM_IN + 0.3
while bt < END17 + 1.0:
    i = int(bt * SR); L_ = int(0.09 * SR); tt = np.arange(L_) / SR
    beep[i:i + L_] += (np.sin(2 * np.pi * 980 * tt) * np.exp(-tt / 0.03)).astype(np.float32)[:N - i]; bt += 1.0
beep *= np.clip((END17 + 1.0 - t_ax) / 1.0, 0, 1)
pad = np.zeros(N, np.float32); chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]]; k = 0; t0 = NARR - 1.2
while t0 < DUR:
    for j, f0 in enumerate(chords[k % 4]):
        st = int((t0 + j * 0.12) * SR); L_ = int(4.2 * SR); tt = np.arange(L_) / SR
        note = (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / 1.6) * np.clip(tt / 0.02, 0, 1)
        e = min(N, st + L_); pad[st:e] += note[:e - st].astype(np.float32)
    t0 += 3.0; k += 1
pad *= np.clip((t_ax - (NARR - 1.2)) / 1.5, 0, 1) * np.clip((DUR - t_ax) / 1.5, 0, 1)
vr = rms(voice)
street *= vr * 10 ** (-27 / 20) / rms(street[: int(FALL * SR)]); hall *= vr * 10 ** (-32 / 20) / rms(hall)
beep *= vr * 10 ** (-28 / 20) / rms(beep); pad *= vr * 10 ** (-28 / 20) / rms(pad)
cry = pleurs_bed(CRY, voice, SR, REG)
mix = voice + street + hall + beep + pad + cry
def wr(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
raw = os.path.join(ROOT, "assets", "_mix.wav"); wr(raw, mix / max(1e-6, np.max(np.abs(mix))) * 0.5)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ln, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True); os.remove(raw)

# ── lip-sync (niveau 0-9 + timbre o/a/i par image) ──
hop = SR // FPS; nf = N // hop
lv = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
lv = np.clip(lv / np.percentile(lv[lv > 1e-4], 90), 0, 1); lv = np.convolve(lv, [0.25, 0.5, 0.25], "same")
lev, voc = [], []
for i in range(nf):
    lev.append(str(int(min(9, lv[i] * 10)))); fr = voice[i * hop:(i + 1) * hop]
    if lv[i] > 0.2:
        spc = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))); fq = np.fft.rfftfreq(len(fr), 1 / SR); c = np.sum(spc * fq) / (np.sum(spc) + 1e-9)
        voc.append("i" if c > 2300 else "o" if c < 1150 else "a")
    else: voc.append("a")
data = {"fps": FPS, "dur": DUR, "off": OFF, "room": ROOM_IN, "fall": round(FALL, 2), "street_end": round(STREET_END, 2), "end17": round(END17, 2), "narr": round(NARR, 2), "fin": FIN,
        "cu": CU, "lines": lines, "lev": "".join(lev), "voc": "".join(voc)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("durée", DUR, "| chambre", ROOM_IN, "| chute", round(FALL, 2), "| narration", round(NARR, 2), "| logo", FIN)
print("gros plans :", round(sum(b - a for a, b, _ in CU), 1), "s ; pleurs sonores :", round(sum(b - a for a, b in CRY), 1), "s")
for l in lines: print(l["n"], l["who"], l["a"], l["b"], len(l["words"]), l["pages"][:3], "…")
