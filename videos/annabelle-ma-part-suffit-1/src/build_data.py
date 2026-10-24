# « Ma part suffit » — timings, calage mot à mot, montage audio et lip-sync.
# Usage : python3 build_data.py <voix.mp3|wav> <regions.json>
#   → ../timings.json, ../assets/data.js, ../assets/audio.wav (non versionné)
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC, REGP = sys.argv[1], sys.argv[2]
FPS, SR = 30, 48000
OFF = 1.6          # plan d'arrivée avant la première réplique
# Fenêtres des répliques dans la voix d'origine (s) : relevées par Whisper phrase par phrase + zones de parole.
T = {1: (0.19, 2.90), 2: (3.18, 7.72), 3: (8.92, 18.21), 4: (18.52, 25.97), 5: (26.43, 32.48), 6: (32.95, 43.80), 7: (44.33, 56.73),
     8: (57.11, 66.12), 9: (66.52, 71.62), 10: (71.98, 79.05), 11: (79.40, 85.69), 12: (86.05, 94.97), 13: (95.74, 119.86),
     14: (120.59, 126.80), 15: (127.23, 130.63), 16: (130.99, 152.66), 17: (153.18, 159.49), 18: (160.00, 167.35),
     19: (168.09, 180.07), 20: (180.54, 187.62), 21: (188.08, 201.04), 22: (201.48, 212.04), 23: (212.51, 222.68),
     24: (223.05, 227.08), 25: (227.49, 228.64), 26: (228.87, 230.28),
     27: (230.76, 231.63), 28: (232.29, 239.34), 29: (239.94, 242.19), 30: (242.76, 250.07), 31: (250.75, 251.35)}
CUT_DIAL = 230.45  # fin du dialogue
NARR_IN = 230.60   # début de la narration dans la voix d'origine
TEXT = {
 1: ("A", "Bonjour, pasteur… J'espère que vous allez bien."),
 2: ("P", "Bonjour, ma précieuse sœur ! | Je vais très bien, gloire à Dieu. Et toi ?"),
 3: ("A", "Je pourrais dire que ça va… mais si je suis là, c'est parce que j'ai besoin de Dieu. | J'ai besoin de *prier* *contre* *mes* *ennemis.* Contre tous ceux qui me détestent."),
 4: ("P", "Wooh… C'est fort, ça. | D'abord, calme-toi. Assieds-toi… et raconte-moi ce qui s'est passé."),
 5: ("A", "Pasteur, je n'en peux plus. | Ma belle-famille… ma *belle-mère…* et même mon mari."),
 6: ("A", "Cette femme passe son temps à m'insulter. Tout ce qui ne va pas, c'est ma faute. | À la moindre occasion, elle est prête à me *lapider.* | Et toute la famille la suit… parce que je ne leur ai pas encore donné d'enfant."),
 7: ("A", "M'accusant d'être *stérile* parce que j'ai tellement avorté dans ma jeunesse, pendant mon célibat… | raison pour laquelle je ne peux pas avoir d'enfant. | Je vis dans le stress, tous les jours. Et lui… il préfère défendre sa mère."),
 8: ("P", "Hmmm… Je vois. Que Dieu te fortifie, ma sœur. | Mais il y a une chose que j'essaie de comprendre… Tu es venue pour qu'on prie contre eux ?"),
 9: ("A", "C'est bizarre de le dire comme ça… mais oui, pasteur. | Je veux juste retrouver *la* *paix.*"),
 10: ("P", "Souhaiter du mal à ceux qui t'offensent ne te rendra jamais la paix. | Je ne peux te demander qu'une seule chose : *pardonne-leur.*"),
 11: ("A", "Quoi ?! Pasteur, vous me demandez de pardonner à ceux qui me veulent du mal ? | À des gens qui sont prêts à *me* *tuer* ?!"),
 12: ("P", "Ma sœur… souviens-toi de ce que David a dit quand Schimeï le maudissait sur la route. | Deuxième livre de Samuel, chapitre seize, versets dix à douze."),
 13: ("P", "Mais le roi dit : Qu'ai-je affaire avec vous, fils de Tseruja ? | *S'il* *maudit,* c'est que l'Éternel lui a dit : Maudis David ! Qui donc lui dira : Pourquoi agis-tu ainsi ? | Et David dit à Abischaï et à tous ses serviteurs : | Voici, mon fils, qui est sorti de mes entrailles, en veut à ma vie ; | à plus forte raison ce Benjamite ! *Laissez-le,* et qu'il maudisse, car l'Éternel le lui a dit."),
 14: ("P", "Peut-être l'Éternel regardera-t-il mon affliction, | et l'Éternel *me* *fera-t-il* *du* *bien* en retour des malédictions d'aujourd'hui."),
 15: ("A", "Alors… c'est Dieu qui me fait volontairement tout ce mal ?"),
 16: ("P", "Non. Dieu ne veut pas te faire du mal. Il veut t'amener à la *repentance.* | Il veut te montrer que tu n'es pas si différente de ceux qui te font du mal… | et que c'est vers Lui que tu dois regarder. | Première épître aux Thessaloniciens, chapitre cinq, verset dix-huit : | Rendez grâces *en* *toutes* *choses,* car c'est à votre égard la volonté de Dieu en Jésus-Christ."),
 17: ("A", "Vous ne pouvez pas comprendre tout le mal qu'ils m'ont fait… et vous me demandez de pardonner ? | *Et* *moi,* dans tout ça ?!"),
 18: ("P", "Proverbes dix-sept, verset quatorze : | Commencer une querelle, c'est ouvrir une digue ; avant que la dispute s'anime, *retire-toi.*"),
 19: ("P", "Ma sœur, depuis le début, tu cherches à avoir raison. | À chaque problème, tu te présentes comme la *victime,* et tu veux gagner en donnant tort à l'autre. | *T'excuser* auprès de ta belle-mère aurait été la meilleure solution."),
 20: ("A", "Tu es sérieux, là ?! Tu t'entends parler ?! | Non mais pasteur… désolée, mais je crois que vous êtes devenu fou."),
 21: ("P", "Première épître aux Corinthiens, chapitre six, verset sept : | C'est déjà certes un défaut chez vous que d'avoir des procès les uns avec les autres. | Pourquoi ne souffrez-vous pas plutôt *quelque* *injustice* ? Pourquoi ne vous laissez-vous pas plutôt dépouiller ?"),
 22: ("A", "Pasteur, je vous arrête là. C'est ça, l'évangile de la grâce ? | Je suis censée être libre… et accepter n'importe quoi ? | *J'ai* *honte* de l'évangile que vous prêchez, pasteur Yannick."),
 23: ("P", "La Bible nous demande d'être de bons *imitateurs* *de* *Christ.* | De rendre grâce à Dieu en toute occasion, favorable ou non. | De chercher Dieu… et non de rejeter la faute sur les autres."),
 24: ("A", "C'est bon. Je m'en vais. | Et je ne remettrai plus jamais les pieds dans cette église."),
 25: ("P", "Ma sœur, attends…"),
 26: ("A", "Non. Ma part suffit."),
 27: ("N", "*Deux* *mois* *plus* *tard…*"),
 28: ("N", "Annabelle n'est jamais revenue à l'église. | Les insultes ont continué. Le stress aussi. | Et *son* *cœur…* a fini par céder."),
 29: ("N", "Diagnostic : *insuffisance* *cardiaque.*"),
 30: ("N", "Persuadée que ses jours sont comptés, | elle prend une décision : | aller voir le pasteur *Yannick.* | Pour se confesser… et mourir en paix."),
 31: ("N", "À suivre…"),
}

# ── Temps final ────────────────────────────────────────────────────────
EMPTY = OFF + T[26][1] + 2.8           # Annabelle est sortie : église vide (2 s)
BLACK = EMPTY + 2.0          # fondu au noir (1 s)
NARR0 = BLACK + 1.0 + 0.4    # la narration démarre après le noir
def M(t):  # voix d'origine -> temps de la vidéo
    return OFF + t if t <= CUT_DIAL + 0.05 else NARR0 + (t - NARR_IN)

REG = json.load(open(REGP))
def speech(a, b):
    out = [[max(a, r0), min(b, r1)] for r0, r1 in REG if min(b, r1) - max(a, r0) > 0.02]
    return out or [[a, b]]
def place(words, a, b, even=False):
    reg = [[a, b]] if even else speech(a, b); tot = sum(e - s for s, e in reg)
    wt = [len(re.sub(r"[^\wÀ-ÿœ]", "", w)) + 2.5 for w in words]; Wt = sum(wt); out, acc = [], 0
    for x in wt:
        pos = acc / Wt * tot; acc += x
        for s, e in reg:
            if pos <= e - s + 1e-6: out.append(s + pos); break
            pos -= e - s
    return out

lines = []
for n, (who, txt) in TEXT.items():
    pages, words = [], []
    for part in txt.split("|"):
        ws = part.split(); i0 = len(words)
        for w in ws: words.append([w.replace("*", ""), 0, 1 if "*" in w else 0])
        pages.append([i0, len(words)])
    a0, b0 = T[n]; ts = [M(t) for t in place([w[0] for w in words], a0, b0)]; a, b = M(a0), M(b0)
    for w, t in zip(words, ts): w[1] = round(t, 3)
    lines.append({"n": n, "who": who, "a": round(a, 3), "b": round(b, 3), "words": words, "pages": pages, "muet": False})
FIN = round(M(T[31][1]) + 1.6, 2); DUR = round(FIN + 3.2, 2)

# ── Audio : dialogue, pause, narration ; ambiance très discrète ─────────
tmp = os.path.join(ROOT, "assets", "voix48.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp], check=True)
w = wave.open(tmp); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close(); os.remove(tmp)
N = int(DUR * SR); voice = np.zeros(N, np.float32)
def put(src_a, src_b, dst):
    seg = v[int(src_a * SR):int(src_b * SR)].copy(); f = int(0.02 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(dst * SR); voice[i:i + len(seg)] += seg[:N - i]
put(0, CUT_DIAL, OFF); put(NARR_IN, len(v) / SR, NARR0)
# normalisation de la voix à environ −14 LUFS (mesure ffmpeg ebur128 en deux passes)
def lufs(x):
    p = os.path.join(ROOT, "assets", "_m.wav"); wav_write(p, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    os.remove(p); return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
def wav_write(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
rng = np.random.default_rng(3); t_ax = np.arange(N) / SR
room = np.convolve(rng.standard_normal(N).astype(np.float32), np.ones(400) / 400, "same")  # souffle de salle, très bas
room *= np.clip((t_ax - 0) / 2, 0, 1) * np.clip((BLACK + 1 - t_ax) / 1.0, 0, 1)
pad = np.zeros(N, np.float32)  # nappe de piano lente (la mineur – fa – do – sol)
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
k = 0; t0 = NARR0 - 1.0
while t0 < FIN + 2.5:
    for j, f0 in enumerate(chords[k % 4]):
        st = int((t0 + j * 0.12) * SR); L_ = int(4.2 * SR); tt = np.arange(L_) / SR
        note = (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(4 * np.pi * f0 * tt)) * np.exp(-tt / 1.6) * np.clip(tt / 0.02, 0, 1)
        e = min(N, st + L_); pad[st:e] += note[:e - st].astype(np.float32)
    t0 += 3.0; k += 1
pad *= np.clip((t_ax - (NARR0 - 1.0)) / 1.5, 0, 1) * np.clip((DUR - t_ax) / 1.5, 0, 1)
g = 10 ** ((-14 - lufs(voice)) / 20); voice *= g
vr = np.sqrt(np.mean(voice[np.abs(voice) > 1e-3] ** 2)); dbv = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
room *= vr * 10 ** (-30 / 20) / dbv(room); pad *= vr * 10 ** (-28 / 20) / dbv(pad)
mix = voice + room + pad
peak = np.max(np.abs(mix)); lim = 10 ** (-1.5 / 20)
if peak > lim: mix *= lim / peak
raw = os.path.join(ROOT, "assets", "_mix.wav"); wav_write(raw, mix)
# normalisation finale en deux passes (≈ −14 LUFS, crête −1,5 dBTP)
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", ln, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True); os.remove(raw)

# ── Lip-sync : niveau (0-9) et timbre (o / a / i) par image, sur la voix seule ──
hop = SR // FPS; nf = N // hop; lev, voc = [], []
rms = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
ref = np.percentile(rms[rms > 1e-3], 90)
lv = np.clip(rms / ref, 0, 1); lv = np.convolve(lv, [0.25, 0.5, 0.25], "same")
for i in range(nf):
    lev.append(str(int(min(9, lv[i] * 10))))
    fr = voice[i * hop:(i + 1) * hop]
    if lv[i] > 0.2:
        sp = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))); fq = np.fft.rfftfreq(len(fr), 1 / SR)
        c = np.sum(sp * fq) / (np.sum(sp) + 1e-9); voc.append("i" if c > 2300 else "o" if c < 1150 else "a")
    else: voc.append("a")
data = {"fps": FPS, "dur": DUR, "off": OFF, "empty": round(EMPTY, 2), "black": round(BLACK, 2), "fin": FIN, "lines": lines, "lev": "".join(lev), "voc": "".join(voc)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
tj = {"source": os.path.basename(SRC), "montage": {"debut_voix": OFF, "fin_dialogue_voix_origine": CUT_DIAL, "debut_narration_voix_origine": NARR_IN, "debut_narration_video": round(NARR0, 2), "duree_video": DUR},
      "remarque": {"30": "la voix dit « aller voir le pasteur Yannick » (le script indiquait « l'apôtre Paris Talla ») : sous-titre aligné sur la voix"},
      "repliques": [{"n": l["n"], "qui": {"A": "ANNABELLE", "P": "PASTEUR YANNICK", "N": "NARRATEUR"}[l["who"]],
                     "voix_debut": T.get(l["n"], (None,))[0], "voix_fin": T.get(l["n"], (None, None))[1], "video_debut": l["a"], "video_fin": l["b"]} for l in lines]}
json.dump(tj, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
print("durée", DUR, "narration à", round(NARR0, 2), "fin", FIN, "| gain voix", round(20 * np.log10(g), 1), "dB")
