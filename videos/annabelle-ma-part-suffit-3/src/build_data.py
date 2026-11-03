# Montage temporel + mixage audio + données du film (assets/data.js, assets/audio.wav) — version 4 :
# narrateur d'ouverture (inchangé) → Annabelle (audio/annabelle.mp3) → applaudissements → Annabelle regagne sa place,
# le pasteur Emmanuel monte au pupitre → Emmanuel (audio/pasteur-emmanuel.mp3) → logo, phrase, signature.
# Usage : python3 src/timings_v4.py && python3 src/build_data.py
import json, os, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000; FPS = 30
T = {t["id"]: t for t in json.load(open(os.path.join(ROOT, "timings.json"), encoding="utf-8"))["tours"]}
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def lufs(x):
    p_ = os.path.join(ROOT, "assets", "_m.wav"); o = wave.open(p_, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p_, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr; os.remove(p_)
    return float(r[r.rindex("I:"):].split()[1])
OFF = 2.6                                   # ouverture inchangée : vue aérienne, puis le narrateur
A0F = 8.67                                  # Annabelle commence à parler au même instant qu'avant (arrivée au pupitre)
vn = load(os.path.join(ROOT, "audio", "voixoff-elevenlabs.mp3"))[: int(6.15 * SR)]
va = load(os.path.join(ROOT, "audio", "annabelle.mp3")); ve = load(os.path.join(ROOT, "audio", "pasteur-emmanuel.mp3"))
L0 = lufs(vn); va *= 10 ** ((L0 - lufs(va)) / 20); ve *= 10 ** ((L0 - lufs(ve)) / 20)   # trois voix au même niveau
A_OFF = round(A0F - T["A"]["debut"], 3); A_END = round(A_OFF + T["A"]["fin"], 3)
AP0 = round(A_END + 0.15, 3)                          # applaudissements juste après « Amen, amen »
WALK_A = [round(A_END + 1.8, 2), round(A_END + 6.8, 2)]  # Annabelle descend et regagne sa place
WALK_E = [round(A_END + 3.2, 2), round(A_END + 11.2, 2)] # Emmanuel se lève, monte sur l'estrade, va au pupitre
E_OFF = round(A_END + 12.0 - T["E"]["debut"], 3); E_END = round(E_OFF + T["E"]["fin"], 3)
LOGO = round(E_END + 1.3, 2); SIG = round(LOGO + 4.6, 2); DUR = round(SIG + 3.0, 2)
words = [[x["m"], round(x["t0"] + OFF, 3), round(x["t1"] + OFF, 3), "N1"] for x in T["N1"]["mots"]]
words += [[x["m"], round(x["t0"] + A_OFF, 3), round(x["t1"] + A_OFF, 3), "A"] for x in T["A"]["mots"]]
words += [[x["m"], round(x["t0"] + E_OFF, 3), round(x["t1"] + E_OFF, 3), "E"] for x in T["E"]["mots"]]
N = int(DUR * SR); voice = np.zeros(N, np.float32)
def put(seg, dst):
    seg = seg.copy(); f = int(0.02 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(dst * SR); voice[i:i + len(seg)] += seg[:N - i]
put(vn, OFF); put(va, A_OFF); put(ve, E_OFF)
t_ax = np.arange(N) / SR; rnd = np.random.default_rng(3)
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
def onepole(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); n = len(x); X = np.fft.rfft(x); w_ = 2 * np.pi * np.fft.rfftfreq(n)
    return np.fft.irfft(X * (1 - a) / (1 - a * np.exp(-1j * w_)), n).astype(np.float32)
room = onepole(rnd.standard_normal(N).astype(np.float32), 350) * 0.7 + onepole(rnd.standard_normal(N).astype(np.float32), 1800) * 0.05
# pas sur le carrelage : arrivée d'Annabelle (ouverture), puis Annabelle qui descend et Emmanuel qui monte
steps = np.zeros(N, np.float32)
for a_, b_, ph in [(5.0, OFF + 5.6, 0), (WALK_A[0], WALK_A[1], 0.1), (WALK_E[0] + 0.8, WALK_E[1], 0.3)]:
    for t0 in np.arange(a_ + ph, b_, 0.48):
        L_ = int(0.07 * SR); tt = np.arange(L_) / SR; i = int(t0 * SR)
        steps[i:i + L_] += (rnd.standard_normal(L_) * np.exp(-tt / 0.01) * (0.6 + 0.4 * rnd.random())).astype(np.float32)
steps = onepole(steps, 2500)
# applaudissements réels (audio/applaudissements.mp3), ≈ 4 dB sous la voix
ap = load(os.path.join(ROOT, "audio", "applaudissements.mp3")); AP1 = AP0 + len(ap) / SR
ap *= 10 ** ((lufs(voice) - 4 - lufs(ap)) / 20); env = np.ones(len(ap), np.float32); fi = int(0.3 * SR); env[:fi] = np.linspace(0, 1, fi)
fo = int(2.2 * SR); env[-fo:] = np.linspace(1, 0, fo) ** 1.5; ap *= env
clap = np.zeros(N, np.float32); i0 = int(AP0 * SR); clap[i0:i0 + len(ap)] += ap[:N - i0]
# nappe de piano chaude : de « on pardonne parce qu'on a été pardonné » (s'il est dit) jusqu'à la fin
def first(phrase, who):
    q = phrase.split()
    for k in range(len(words) - len(q)):
        if words[k][3] == who and all(words[k + j][0].lower().strip(",.:;!?") == q[j] for j in range(len(q))): return words[k][1]
WARM = first("on pardonne parce", "A") or E_OFF
pad = np.zeros(N, np.float32); chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]]; k = 0; t0 = WARM - 0.5
while t0 < DUR:
    for j, f0 in enumerate(chords[k % 4]):
        st = int((t0 + j * 0.12) * SR); L_ = int(4.2 * SR); tt = np.arange(L_) / SR
        note = (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / 1.6) * np.clip(tt / 0.02, 0, 1)
        if st >= N: continue
        e = min(N, st + L_); pad[st:e] += note[:e - st].astype(np.float32)
    t0 += 3.0; k += 1
pad *= np.clip((t_ax - WARM) / 3.0, 0, 1) * np.clip((DUR - t_ax) / 1.5, 0, 1)
vr = rms(voice)
room *= vr * 10 ** (-40 / 20) / rms(room); steps *= vr * 10 ** (-24 / 20) / rms(steps); pad *= vr * 10 ** (-30 / 20) / rms(pad)
mix = voice + room + steps + clap + pad
def wr(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
raw = os.path.join(ROOT, "assets", "_mix.wav"); wr(raw, mix / max(1e-6, np.max(np.abs(mix))) * 0.5)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ln, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True); os.remove(raw)
# lip-sync : niveau 0-9 + timbre par image
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
data = {"fps": FPS, "dur": DUR, "off": OFF, "a_end": A_END, "ap": [AP0, round(AP1, 3)], "walkA": WALK_A, "walkE": WALK_E, "e0": round(E_OFF + T["E"]["debut"], 3), "e_end": E_END,
        "logo": LOGO, "sig": SIG, "warm": WARM, "words": words, "lev": lev, "voc": "".join(voc)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("Annabelle", A0F, "→", A_END, "| applaudissements", AP0, round(AP1, 2), "| Emmanuel", data["e0"], "→", E_END, "| logo", LOGO, "| signature", SIG, "| durée", DUR, "| mots", len(words))
