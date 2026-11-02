# Montage temporel + mixage audio + données du film (assets/data.js, assets/audio.wav).
# Usage : python3 src/build_data.py  (après src/timings.py)
import json, os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000; FPS = 30
T = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))
OFF = 2.6            # ouverture : vue aérienne avant la première phrase
CUT = 320.5          # fin du témoignage d'Annabelle (dans la voix)
GAP = 5.9            # ovation debout (applaudissements réels) avant la narration finale
M = lambda t: round(t + OFF + (GAP if t >= CUT else 0), 3)
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def lufs(x):
    p_ = os.path.join(ROOT, "assets", "_m.wav"); o = wave.open(p_, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p_, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr; os.remove(p_)
    return float(r[r.rindex("I:"):].split()[1])
v0 = load(os.path.join(ROOT, "audio", "voixoff-elevenlabs.mp3"))
# suite du narrateur : même niveau que la voix d'origine, fondus de 30 ms, 0,4 s de silence entre les deux
s2 = load(os.path.join(ROOT, "audio", "narrateur-suite.mp3")); s2 *= 10 ** ((lufs(v0) - lufs(s2)) / 20)
f30 = int(0.03 * SR); v0[-f30:] *= np.linspace(1, 0, f30); s2[:f30] *= np.linspace(0, 1, f30)
JOIN = round(len(v0) / SR + 0.4, 3)                     # début de la suite dans la voix
v = np.concatenate([v0, np.zeros(int(0.4 * SR), np.float32), s2]); VL = len(v) / SR
words = []
for tr in T["tours"]:
    for x in tr["mots"]: words.append([x["m"], M(x["t0"]), M(x["t1"]), tr["id"]])
LAST = max(words[-1][2], M(VL - 0.3)); LOGO = round(LAST + 1.3, 2); SIG = round(LOGO + 4.6, 2); DUR = round(SIG + 3.0, 2)
N = int(DUR * SR); voice = np.zeros(N, np.float32)
def put(a, b, dst):
    seg = v[int(a * SR):int(b * SR)].copy(); f = int(0.02 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(dst * SR); voice[i:i + len(seg)] += seg[:N - i]
put(0, CUT, M(0)); put(CUT, VL, M(CUT))
t_ax = np.arange(N) / SR; rnd = np.random.default_rng(3)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); n = len(x); X = np.fft.rfft(x); w_ = 2 * np.pi * np.fft.rfftfreq(n)
    return np.fft.irfft(X * (1 - a) / (1 - a * np.exp(-1j * w_)), n).astype(np.float32)
# ── ambiance de salle : souffle doux + ventilateurs ──
room = onepole(rnd.standard_normal(N).astype(np.float32), 350) * 0.7 + onepole(rnd.standard_normal(N).astype(np.float32), 1800) * 0.05
# ── pas d'Annabelle sur le carrelage (ouverture) ──
steps = np.zeros(N, np.float32)
for t0 in np.arange(5.0, OFF + 5.6, 0.48):
    L_ = int(0.07 * SR); tt = np.arange(L_) / SR; i = int(t0 * SR)
    steps[i:i + L_] += (rnd.standard_normal(L_) * np.exp(-tt / 0.01) * (0.6 + 0.4 * rnd.random())).astype(np.float32)
steps = onepole(steps, 2500)
# ── applaudissements réels (audio/applaudissements.mp3) : juste après « Amen, amen », fondu d'entrée 0,3 s, descente progressive,
#    fin ~1,5 s avant la reprise du narrateur ; niveau ≈ -18 LUFS (4 dB sous la voix normalisée à -14)
A_END = max(x[2] for x in words if x[3] == "A"); N_RE = min(x[1] for x in words if x[3] == "N2")
ap = load(os.path.join(ROOT, "audio", "applaudissements.mp3")); AP0 = round(A_END + 0.15, 3); AP1 = AP0 + len(ap) / SR
assert AP1 <= N_RE - 1.4, (AP1, N_RE)
ap *= 10 ** ((lufs(voice) - 4 - lufs(ap)) / 20); env = np.ones(len(ap), np.float32); fi = int(0.3 * SR); env[:fi] = np.linspace(0, 1, fi)
fo = int(2.2 * SR); env[-fo:] = np.linspace(1, 0, fo) ** 1.5; ap *= env
clap = np.zeros(N, np.float32); i0 = int(AP0 * SR); clap[i0:i0 + len(ap)] += ap[:N - i0]
# ── nappe de piano chaude : de « on pardonne parce qu'on a été pardonné » jusqu'à la fin ──
WARM = next(x[1] for k, x in enumerate(words) if x[0].lower() == "on" and words[k + 1][0] == "pardonne" and x[3] == "A" and x[1] > 280)
pad = np.zeros(N, np.float32); chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]]; k = 0; t0 = WARM - 0.5
while t0 < DUR:
    for j, f0 in enumerate(chords[k % 4]):
        st = int((t0 + j * 0.12) * SR); L_ = int(4.2 * SR); tt = np.arange(L_) / SR
        note = (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / 1.6) * np.clip(tt / 0.02, 0, 1)
        if st >= N: continue
        e = min(N, st + L_); pad[st:e] += note[:e - st].astype(np.float32)
    t0 += 3.0; k += 1
pad *= np.clip((t_ax - WARM) / 3.0, 0, 1) * np.clip((DUR - t_ax) / 1.5, 0, 1)
pad *= np.where(t_ax > M(CUT), 1.0, 0.7)
vr = rms(voice)
room *= vr * 10 ** (-40 / 20) / rms(room); steps *= vr * 10 ** (-24 / 20) / rms(steps)
pad *= vr * 10 ** (-29 / 20) / rms(pad)
mix = voice + room + steps + clap + pad
def wr(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
raw = os.path.join(ROOT, "assets", "_mix.wav"); wr(raw, mix / max(1e-6, np.max(np.abs(mix))) * 0.5)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ln, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True); os.remove(raw)
# ── lip-sync : niveau 0-9 par image ──
hop = SR // FPS; nf = N // hop
lv = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
lv = np.clip(lv / np.percentile(lv[lv > 1e-4], 90), 0, 1); lv = np.convolve(lv, [0.25, 0.5, 0.25], "same")
lev = "".join(str(int(min(9, x * 10))) for x in lv)
voc = []
for i in range(nf):
    fr = voice[i * hop:(i + 1) * hop]
    if lv[i] > 0.2 and len(fr) == hop:
        spc = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))); fq = np.fft.rfftfreq(len(fr), 1 / SR); c = np.sum(spc * fq) / (np.sum(spc) + 1e-9)
        voc.append("i" if c > 2300 else "o" if c < 1150 else "a")
    else: voc.append("a")
voc = "".join(voc)
data = {"fps": FPS, "dur": DUR, "off": OFF, "cut": M(CUT), "gap": GAP, "logo": LOGO, "sig": SIG, "ap": [AP0, round(AP1, 3)], "join": M(JOIN), "warm": WARM, "words": words, "lev": lev, "voc": voc}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("applaudissements", AP0, round(AP1, 2), "| narrateur reprend", N_RE, "| suite à", M(JOIN), "| signature", SIG); print("durée", DUR, "| reprise narration", M(CUT), "| chaleur", WARM, "| logo", LOGO, "| mots", len(words))
