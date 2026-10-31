# Montage temporel + mixage audio + données du film (assets/data.js, assets/audio.wav).
# Usage : python3 src/build_data.py  (après src/timings.py)
import json, os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000; FPS = 30
T = json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))
OFF = 2.6            # ouverture : vue aérienne avant la première phrase
CUT = 320.5          # fin du témoignage d'Annabelle (dans la voix)
GAP = 3.4            # ovation debout avant la narration finale
M = lambda t: round(t + OFF + (GAP if t >= CUT else 0), 3)
w = wave.open(os.path.join(ROOT, "audio", "voixoff.wav")); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close()
VL = len(v) / SR
words = []
for tr in T["tours"]:
    for x in tr["mots"]: words.append([x["m"], M(x["t0"]), M(x["t1"]), tr["id"]])
LAST = words[-1][2]; LOGO = round(LAST + 1.3, 2); DUR = round(LOGO + 4.6, 2)
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
# ── applaudissements (ovation) : ~45 personnes, claps de bruit filtré à rythme individuel ──
def applause(dur):
    L_ = int(dur * SR); out = np.zeros(L_, np.float32)
    for _ in range(45):
        t, rate, g = rnd.random() * 0.4, 3.2 + 1.6 * rnd.random(), 0.5 + 0.5 * rnd.random()
        while t < dur:
            i = int(t * SR); n_ = int(0.03 * SR); tt = np.arange(n_) / SR
            out[i:i + n_] += (rnd.standard_normal(n_) * np.exp(-tt / (0.006 + 0.004 * rnd.random())) * g)[:L_ - i].astype(np.float32)
            t += 1 / rate * (0.85 + 0.3 * rnd.random())
    return onepole(out, 5000) - onepole(out, 500) * 0.8
OV0 = M(CUT) - GAP - 0.3; OV1 = M(CUT) + 2.2
clap = np.zeros(N, np.float32); ap = applause(OV1 - OV0 + 0.5); i0 = int(OV0 * SR); clap[i0:i0 + len(ap)] += ap[:N - i0]
clap *= np.clip((t_ax - OV0) / 0.5, 0, 1) * np.clip((OV1 - t_ax) / 2.0, 0, 1)
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
room *= vr * 10 ** (-40 / 20) / rms(room); steps *= vr * 10 ** (-24 / 20) / rms(steps); clap *= vr * 10 ** (-9 / 20) / rms(clap[int((OV0 + 0.6) * SR):int((OV1 - 2) * SR)])
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
data = {"fps": FPS, "dur": DUR, "off": OFF, "cut": M(CUT), "gap": GAP, "logo": LOGO, "warm": WARM, "words": words, "lev": lev}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("durée", DUR, "| reprise narration", M(CUT), "| chaleur", WARM, "| logo", LOGO, "| mots", len(words))
