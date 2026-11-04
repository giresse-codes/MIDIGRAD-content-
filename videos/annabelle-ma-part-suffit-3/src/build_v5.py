# Version 5 (finale) : timings mot à mot, montage, mixage et données du film (timings.json, assets/data.js, assets/audio.wav).
# Ordre : narrateur (ouverture) → Annabelle → applaudissements 6 s (salle debout) → l'interprète annonce le pasteur Emmanuel
#         → applaudissements 6 s (Emmanuel monte au pupitre, Annabelle regagne sa place) → pasteur Emmanuel → applaudissements 6 s
#         → logo (4 s) + « Pardonne comme Christ t'a pardonné. » → carte « EUD — Consistoire MIDIGRAD » (3 s) → fondu au noir.
# Transcription : faster-whisper (small, CTranslate2 int8, français, horodatage par mot, VAD) → src/w_*.json.
# Le texte affiché est la transcription corrigée (noms propres, versets Louis Segond 1910) ; chaque mot corrigé reprend
# l'horodatage du mot Whisper correspondant (difflib), les mots remplacés se partagent le temps de ceux qu'ils remplacent.
# Usage : python3 src/build_v5.py && python3 src/build_index.py
import difflib, json, os, re, subprocess, unicodedata, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); SR = 48000; FPS = 30
norm = lambda s: re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", s.lower().replace("œ", "oe")).encode("ascii", "ignore").decode())

TXT = {
 "N1": "Quelque temps après, la sœur Annabelle a décidé de partager cette situation avec les chrétiens de la MIDIGRAD.",
 "A": "Bien-aimés, bonjour ! Aujourd'hui, j'aimerais rendre grâce à Dieu et partager concernant ma situation. Je suis une femme aimée dans ma belle-famille, "
      "mère d'enfants et heureuse. Dans ma jeunesse, j'ai été exposée à la débauche sexuelle et j'ai plusieurs fois avorté. Puis je me suis mariée, "
      "mais je n'arrivais pas à avoir d'enfants. Ma belle-mère ne cessait de m'insulter et de me maudire. Au lieu de regarder à ma vie, j'ai porté rancœur "
      "à ma belle-famille. Alors je suis venue voir le pasteur Yannick pour qu'on prie contre eux. Mais à ma grande surprise, il m'a demandé de pardonner. "
      "Il m'a parlé de la nature de l'homme. Psaume 14, verset 3 : Tous sont égarés, tous sont pervertis ; il n'en est aucun qui fasse le bien, pas même un seul. "
      "Il m'a dit que ma belle-mère et moi, nous ne sommes pas différentes. Je disais en mon cœur : moi, pareille à cette sorcière ? Non, pasteur ! "
      "Il m'a aussi rappelé Romains, chapitre 2, verset 1 : Ô homme, qui que tu sois, toi qui juges, tu es donc inexcusable ; car, en jugeant les autres, "
      "tu te condamnes toi-même, puisque toi qui juges, tu fais les mêmes choses. Mais dans ma tête, je disais : pasteur, je suis venue pour qu'on prie contre "
      "ma belle-famille, pas pour entendre tout ce charabia ! Ensuite est venue ma maladie cardiaque, et c'est à l'hôpital que tout m'est revenu comme un fardeau. "
      "J'ai jugé ma belle-mère, pourtant je suis pire qu'elle. Quand elle me disait que je tuais ses petits-fils dans mon ventre, je la voyais comme une sorcière. "
      "Elle avait raison, je l'ai fait. Mais j'avais les regards focalisés sur le fouet, et non sur celui qui me fouettait par sa parole. "
      "Le pasteur Yannick m'a dit : si tu avais réellement compris la grâce que Dieu nous a accordée en Jésus-Christ, pardonner ta belle-mère n'aurait pas été un problème. "
      "Éphésiens, chapitre 4, verset 32 : Soyez bons les uns envers les autres, compatissants, vous pardonnant réciproquement, comme Dieu vous a pardonné en Christ. "
      "Colossiens, chapitre 3, verset 13 : De même que Christ vous a pardonné, pardonnez-vous aussi. Qu'est-ce que Jésus aurait fait dans cette situation ? "
      "Il aurait pardonné. Galates, chapitre 2, verset 20 : J'ai été crucifié avec Christ ; et si je vis, ce n'est plus moi qui vis, c'est Christ qui vit en moi. "
      "J'honore encore Christ dans la vie du pasteur Yannick, qui m'a fait comprendre une chose très importante : on pardonne parce qu'on a été pardonné. "
      "On pardonne parce qu'en réalité, dans l'eau, le visage reflète le visage. Je ne suis pas différente de celui ou celle qui m'offense. "
      "Une fois que j'ai compris ça, bien-aimés, une fois que j'ai appris à regarder à Dieu dans tout ce qui m'arrive, rien n'était plus un problème à mes yeux. "
      "En vérité, je découvre au travers de la situation que je ne suis pas différente de mes frères et sœurs qui peuvent m'offenser, et j'ai découvert réellement, "
      "au travers de l'entretien et de la parole, que celui qui a reçu le pardon peut pardonner. Et ma prière aujourd'hui, c'est qu'il m'aide, car je sais que "
      "ce n'est pas facile de le voir partout dans ma vie, que ce soit en bien ou en mal pour ma chair. Amen, amen.",
 "I": "Amen ! Amen ! Nos ovations, bien-aimés ! Nous accueillons l'homme que Dieu a prévu pour nous donner le message : le pasteur Emmanuel !",
 "E": "Oui, bien-aimés, c'est aussi comme ça que Dieu peut travailler : quand la parole rencontre le cœur, rien n'est problème. Hum hum, oui. Ma sœur Annabelle, "
      "j'honore vraiment le Christ en toi. Le témoignage, c'est aussi une façon de donner la vie par les situations et l'enseignement qu'on a reçu au travers "
      "de ces situations-là. Donc, mes frères et sœurs de la MIDIGRAD, partageons, c'est très important. Je vais juste revenir sur les trois points essentiels "
      "dont nous a parlé notre père, l'apôtre Paris Talla, pour facilement pratiquer le pardon fraternel. Premier point : toujours reconnaître Dieu derrière "
      "celui ou celle qui nous a offensés. Deuxième point : toujours savoir que je ne suis pas différent de mon frère ou de ma sœur que j'accuse. "
      "Celui-là que tu accuses de voler, bien-aimés, tu n'es pas différent. Il suffit juste que les conditions soient réunies, et tu feras la même chose. "
      "Amen ? Si tu veux, tu ne réponds pas. Moi, je ne suis pas ici devant pour plaire à quelqu'un. Oui, eh, parce que si je suis mielleux quand je prêche, "
      "Dieu ne le sera pas avec moi quand il me redemandera cela. Donc, hum, la paix est bien, comme on dit souvent au quartier. Troisième point : suivre le cœur "
      "de l'église. Ah, ça, c'est alors notre mort ici à la MIDIGRAD ! Mais bien-aimés, sachez qu'on vous parle selon la parole, que ça te plaise ou non ! "
      "Le fondement même d'un bon chrétien, c'est de suivre le cœur de l'église. Je ne monte pas ici pour faire plaisir à qui que ce soit, je suis là pour donner "
      "la parole comme je l'ai reçue, ou bien ce n'est pas ça ? Donc vraiment, ma prière, c'est que nous recevions réellement ces enseignements. N'oublions pas "
      "la lecture de la parole, bien-aimés, c'est très important. Bon, je pense que j'ai dit tout ce qu'il fallait dire pour aujourd'hui. Restons infiniment bénis. "
      "J'en ai terminé. Amen, amen.",
}
FILES = {"N1": ("narrateur-ouverture.mp3", "w_ouverture.json", "NARRATEUR"), "A": ("annabelle.mp3", "w_annabelle.json", "ANNABELLE"),
         "I": ("narrateur-annonce.mp3", "w_annonce.json", "L'INTERPRÈTE"), "E": ("pasteur-emmanuel.mp3", "w_emmanuel.json", "PASTEUR EMMANUEL")}

def align(tid):
    W = [w for s in json.load(open(os.path.join(HERE, FILES[tid][1]), encoding="utf-8")) for w in s["words"]]
    # Whisper découpe parfois « J'ai » en « J » + « 'ai » : on recolle
    M = []
    for w in W:
        if M and (w["w"].startswith("'") or not norm(w["w"])): M[-1] = {**M[-1], "w": M[-1]["w"] + w["w"], "e": w["e"]}
        elif norm(w["w"]): M.append(dict(w))
    out = []
    for x in TXT[tid].split():                       # ponctuation isolée (« ! », « : ») rattachée au mot précédent
        if out and not norm(x): out[-1] += "\u00a0" + x
        else: out.append(x)
    RN = [norm(x) for x in out]; TN = [norm(w["w"]) for w in M]
    T = [None] * len(out)
    sm = difflib.SequenceMatcher(None, TN, RN, autojunk=False); ok = 0
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            for k in range(b1 - b0): T[b0 + k] = (M[a0 + k]["s"], M[a0 + k]["e"]); ok += 1
        elif op in ("replace", "insert") and b1 > b0:
            s = M[a0]["s"] if a1 > a0 else (M[a0 - 1]["e"] if a0 > 0 else M[0]["s"]); e = M[a1 - 1]["e"] if a1 > a0 else (M[a0]["s"] if a0 < len(M) else s + 0.3 * (b1 - b0))
            if e - s < 0.12 * (b1 - b0):  # insertion sans durée : on prend un peu sur les voisins
                s, e = s - 0.06 * (b1 - b0), e + 0.06 * (b1 - b0)
            wt = [len(RN[j]) + 2 for j in range(b0, b1)]; tot = sum(wt); acc = 0
            for j, x in zip(range(b0, b1), wt): T[j] = (s + (e - s) * acc / tot, s + (e - s) * (acc + x) / tot); acc += x
    for j in range(len(T)):   # ordre croissant garanti
        if j and T[j][0] < T[j - 1][1] - 0.02: T[j] = (T[j - 1][1], max(T[j][1], T[j - 1][1] + 0.08))
    print(tid, len(out), "mots ;", ok, "identiques à Whisper ;", len(out) - ok, "corrigés")
    return [{"m": x, "t0": round(s, 3), "t1": round(e, 3)} for x, (s, e) in zip(out, T)]

def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "audio", name), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
def wr(p, x):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
def lufs(x):
    p_ = os.path.join(ROOT, "assets", "_m.wav"); wr(p_, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", p_, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr; os.remove(p_)
    return float(r[r.rindex("I:"):].split()[1])
def at_lufs(x, target): return x * 10 ** ((target - lufs(x)) / 20)
def fade(x, f):
    x = x.copy(); n = int(f * SR); x[:n] *= np.linspace(0, 1, n); x[-n:] *= np.linspace(1, 0, n); return x

TW = {k: align(k) for k in TXT}
V = {k: load(FILES[k][0]) for k in FILES}
first = lambda k: TW[k][0]["t0"]; last = lambda k: TW[k][-1]["t1"]
# ── montage ──
OFF = 2.6                                     # vue aérienne, puis le narrateur
A_OFF = round(9.0 - first("A"), 3)            # Annabelle arrive au pupitre pendant l'ouverture et parle à 9,0 s
A_END = round(A_OFF + last("A"), 3)
AP1 = round(A_END + 0.25, 3)                  # applaudissements n° 1 (6 s), salle debout
I_OFF = round(AP1 + 6.0 + 0.1 - first("I"), 3); I_END = round(I_OFF + last("I"), 3)
AP2 = round(I_END + 0.15, 3)                  # applaudissements n° 2 : Emmanuel monte, Annabelle descend
E_OFF = round(AP2 + 6.0 + 0.35 - first("E"), 3); E_END = round(E_OFF + last("E"), 3)
AP3 = round(E_END + 0.25, 3)                  # applaudissements n° 3
LOGO = round(AP3 + 6.0, 2); SIG = round(LOGO + 4.0, 2); DUR = round(SIG + 3.0, 2)
OFFS = {"N1": OFF, "A": A_OFF, "I": I_OFF, "E": E_OFF}
words = [[w["m"], round(w["t0"] + OFFS[k], 3), round(w["t1"] + OFFS[k], 3), k] for k in ("N1", "A", "I", "E") for w in TW[k]]

# ── mixage ──
N = int(DUR * SR); voice = np.zeros(N, np.float32); fx = np.zeros(N, np.float32)
def put(buf, seg, dst):
    i = int(round(dst * SR)); buf[i:i + len(seg)] += seg[:N - i]
for k in ("N1", "A", "I", "E"):
    v = V[k]; s0 = max(0, int((first(k) - 0.25) * SR)); s1 = min(len(v), int((last(k) + 0.35) * SR))   # voix seule, sans les silences de bord
    put(voice, fade(at_lufs(v[s0:s1], -14.0), 0.03), OFFS[k] + s0 / SR)
ap = load("applaudissements.mp3")[int(1.0 * SR):int(7.0 * SR)]; ap = fade(at_lufs(ap, -18.0), 0.3)
for a in (AP1, AP2, AP3): put(fx, ap, a)
ri = load("rires-salle.mp3")
def wend(ph, who):
    q = [norm(x) for x in ph.split()]
    for i in range(len(words) - len(q)):
        if words[i][3] == who and all(norm(words[i + j][0]) == q[j] for j in range(len(q))): return words[i + len(q) - 1][2]
    raise SystemExit("phrase introuvable : " + ph)
# rires : après « comme on dit souvent au quartier » et après « notre mort ici à la MIDIGRAD »
L1 = round(wend("souvent au quartier.", "E") + 0.05, 3); L2 = round(wend("ici à la MIDIGRAD", "E") + 0.02, 3)
r1 = fade(at_lufs(ri[int(0.3 * SR):int(3.0 * SR)], -20.0), 0.3); r2 = fade(at_lufs(ri[int(6.0 * SR):int(9.2 * SR)], -20.0), 0.3)
put(fx, r1, L1); put(fx, r2, L2)
mix = voice + fx
raw = os.path.join(ROOT, "assets", "_mix.wav"); wr(raw, mix * 0.5)          # marge : on remonte au loudnorm
# loudnorm final : gain linéaire vers -14 LUFS, pics bornés à -1 dB (limiteur suréchantillonné ×4, true peak)
g = -14.0 - lufs(mix * 0.5)
af = f"volume={g:.3f}dB,aresample={SR * 4},alimiter=limit={10 ** (-1.3 / 20):.4f}:attack=1:release=50:level=false,aresample={SR}"
for _ in range(3):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-c:a", "pcm_s16le", os.path.join(ROOT, "assets", "audio.wav")], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", os.path.join(ROOT, "assets", "audio.wav"), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(r[r.rindex("I:"):].split()[1]); TPk = float(r[r.rindex("Peak:"):].split()[1])
    if abs(I + 14) < 0.15: break
    g += -14 - I; af = af.replace(af.split(",")[0], f"volume={g:.3f}dB")
print(f"mix final : {I} LUFS, true peak {TPk} dBTP")
os.remove(raw)

# ── lip-sync : niveau 0-9 + timbre par image (voix seulement) ──
hop = SR // FPS; nf = N // hop
lv = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
lv = np.clip(lv / np.percentile(lv[lv > 1e-4], 90), 0, 1); lv = np.convolve(lv, [0.25, 0.5, 0.25], "same")
lev = "".join(str(int(min(9, x * 10))) for x in lv); voc = []
for i in range(nf):
    fr = voice[i * hop:(i + 1) * hop]
    if lv[i] > 0.2 and len(fr) == hop:
        spc = np.abs(np.fft.rfft(fr * np.hanning(len(fr)))); fq = np.fft.rfftfreq(len(fr), 1 / SR); c = np.sum(spc * fq) / (np.sum(spc) + 1e-9)
        voc.append("i" if c > 2300 else "o" if c < 1150 else "a")
    else: voc.append("a")
data = {"fps": FPS, "dur": DUR, "off": OFF, "a_end": A_END, "ap": [AP1, AP2, AP3], "i0": round(I_OFF + first("I"), 3), "i_end": I_END,
        "e0": round(E_OFF + first("E"), 3), "e_end": E_END, "laugh": [L1, L2], "logo": LOGO, "sig": SIG, "words": words, "lev": lev, "voc": "".join(voc)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
json.dump({"methode": "faster-whisper small int8 (français, horodatage par mot) ; texte corrigé (noms propres, Louis Segond 1910) aligné par difflib ; secondes relatives à chaque fichier audio",
           "tours": [{"id": k, "qui": FILES[k][2], "fichier": "audio/" + FILES[k][0], "decalage": OFFS[k], "texte": TXT[k], "mots": TW[k]} for k in ("N1", "A", "I", "E")]},
          open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
print(f"Annabelle {A_OFF + first('A'):.2f}→{A_END} | ap1 {AP1} | annonce {data['i0']}→{I_END} | ap2 {AP2} | Emmanuel {data['e0']}→{E_END} | ap3 {AP3} | rires {L1} {L2} | logo {LOGO} | sig {SIG} | durée {DUR}")
