# « Ma part suffit » partie 2 — calage mot à mot, montage audio, lip-sync.
# Usage : python3 build_data.py  (lit ../audio/voixoff-corrigee.wav et ../timings.json)
#   → ../assets/data.js, ../assets/audio.wav (non versionné), ../src/regions.json
import json, os, re, subprocess, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FPS, SR = 30, 48000
OFF = 2.0      # travelling depuis la porte avant la première réplique
GAP = 2.2      # après la réplique 17 : recul de la caméra + fondu vers le blanc chaud
TJ = json.load(open(os.path.join(ROOT, "timings.json")))
T = {int(r["n"]): (r["debut"], r["fin"]) for r in TJ["repliques"]}
TEXT = {
 1: ("A", "Pasteur Yannick, bonjour, et merci d'être venu."),
 2: ("P", "Bonjour, ma précieuse sœur. Comment vas-tu aujourd'hui ?"),
 3: ("A", "Je suis extrêmement confuse. | Je me retrouve aujourd'hui avec une *insuffisance* *cardiaque,* et tous les jours, ça ne fait qu'empirer. | Ma belle-mère est passée me voir aujourd'hui… elle n'a même pas tenu compte de mon état et s'est mise à m'insulter. | Au point où j'en suis, je ne ressens plus rien. | Juste… *pourquoi* *Dieu* prend-il du plaisir à me faire souffrir ?"),
 4: ("P", "Hummmm… Job, chapitre deux, verset dix : | Quoi ! nous recevons de Dieu le bien, et nous ne recevrions pas aussi *le* *mal* ! | Ma sœur, j'aimerais vraiment te consoler, te dire que ça va aller, pleurer avec toi, maudire ta belle-mère avec toi, | mais j'ai un fardeau en mon cœur, et je ne peux te mentir en quoi que ce soit. | Je me dois de te dire *la* *vérité,* aussi cruelle soit-elle."),
 5: ("P", "Tu es ici pour une seule raison : | c'est parce que tu en veux tellement à ta belle-mère, et cela a créé une douleur en toi. | Une très grande douleur, parce qu'aussi tu as refusé d'accepter que *pardonner* était la seule solution. | Tu as préféré la haine ? Tu as préféré lui souhaiter du mal, et aujourd'hui Dieu t'a mise dans cet état. | Première épître aux Thessaloniciens, chapitre cinq, verset dix-huit : | Rendez grâces *en* *toutes* *choses,* car c'est à votre égard la volonté de Dieu en Jésus-Christ."),
 6: ("A", "Dieu s'acharne sur moi, me fait souffrir juste parce que j'ai refusé d'accepter toutes ces insultes ? | Oui, j'ai médité du mal d'elle, mais comprenez-moi…"),
 7: ("P", "J'aimerais te poser une question, ma sœur : es-tu *réellement* *sauvée* ?"),
 9: ("P", "Être sauvé, ce n'est pas simplement reconnaître tout cela, mais c'est manifester la *nature* *de* *Christ.* | Jésus-Christ ne nous a pas juste pardonné, il s'est donné pour nous. | Il s'est donné entièrement, afin que par sa mort nous ayons la vie, et afin que par sa résurrection nous vivions éternellement. | Alors, si tu as cru, du moins, tu as reçu l'Esprit de Christ. Tu devrais manifester cela."),
 10: ("P", "Je ne te dis pas que tu es assez forte. | Je reconnais bien évidemment qu'à cause de la chair, et à cause de ses désirs contraires à ceux de l'Esprit… | Romains, chapitre sept, verset quinze : | Car je ne sais pas ce que je fais : je ne fais point ce que je veux, et je fais ce que je hais. | Et Romains sept, versets vingt-quatre et vingt-cinq, poursuivent en disant : | Misérable que je suis ! Qui me délivrera du corps de cette mort ?… | Grâces soient rendues à Dieu par Jésus-Christ notre Seigneur !… | Ainsi donc, moi-même, je suis par l'entendement esclave de la loi de Dieu, | et je suis par la chair esclave de la loi du péché."),
 11: ("P", "Alors, ma sœur, j'aimerais que tu comprennes quelque chose de très important ici. | Pour pouvoir réellement pardonner, il faudrait en premier reconnaître que tu n'es *pas* *différente* de celui qui t'offense. | L'apôtre Paris Talla, notre papa, a parlé du fondement de l'homme : *l'homme* *est* *faux.* | Si tu avais réellement compris ce message, si tu l'avais réellement accepté dans ton cœur, | alors ta belle-mère, ta belle-famille, ton mari n'auraient pas été le problème."),
 12: ("P", "Pourquoi est-ce que Dieu a permis cette situation ? | En réalité, Dieu a permis cette situation premièrement parce qu'il voulait que tu arrives à la *repentance,* | parce qu'il voulait que tu te reconnaisses en ta belle-mère qui t'accuse et qui t'insulte tous les jours. | Mais au lieu de ça, tu l'indexes, bien-aimée, comme une sorcière ? | Tu portes une rancune envers elle, parce que quelque part, tu te dis que tu ne pourrais pas être comme elle. | Tu t'es crue tellement bonne, suffisamment bonne pour condamner ta belle-mère, | qui est comme toi soumise à la vanité de la chair."),
 13: ("P", "Au lieu de ça, tu aurais dû dire : « Seigneur, ah Papa ! | Je comprends réellement que tu m'as enseigné que je ne suis pas différente d'elle, que je peux faire pire qu'elle. » | Alors le pardon n'aurait pas été un problème à ce moment-là, si tu avais réellement compris cela, | car la Bible nous demande d'être des *imitateurs* *de* *Christ.* | Est-ce que tu t'es posé la question : qu'est-ce que Jésus-Christ aurait fait dans cette situation ? | Tu ne l'as pas fait. Tu as condamné ta belle-mère, et aujourd'hui, à cause de cela, tu souffres."),
 14: ("A", "Ah, pasteur Yannick, je vous dis réellement merci, car en réalité, je ne suis pas différente d'elle. | Aujourd'hui, je peux réellement dire que *je* *lui* *ai* *pardonné.*"),
 15: ("P", "Amen, ma sœur. Nous rendons grâce à Dieu. | Mais aujourd'hui, je ne te demande pas juste de lui pardonner. | J'aimerais que, quand ton état va s'améliorer, ou alors si elle passe te rendre visite, | tu lui *présentes* *des* *excuses* et que tu acceptes : | « Oui, maman, vous avez raison, ce que vous avez dit sur moi est tellement vrai, | et je m'excuse de ne pas avoir donné d'enfants à votre fils. Je prie que Dieu m'aide. »"),
 16: ("P", "Oui, tu dois aller vers elle, et tu dois présenter tes excuses. Tu dois lui *demander* *pardon.* | Tu ne dois pas juste l'excuser, mais tu dois aller lui demander pardon, | et je crois en Dieu que ton état s'améliorera. Rien n'est impossible. | La Bible dit que Dieu ne tarde pas dans l'accomplissement de sa promesse, | mais qu'il use de patience envers nous, afin qu'aucun ne périsse, mais que nous arrivions tous à la repentance."),
 17: ("A", "Amen, amen, pasteur."),
 18: ("N", "Quelques mois plus tard, | Annabelle est allée auprès de sa belle-mère, auprès de sa belle-famille, | et elle a demandé réellement *pardon* et s'est excusée. | Elle a reconnu. Elle a accepté la parole."),
 19: ("N", "Deux ans plus tard, après quelques traitements, | aujourd'hui, elle a retrouvé une *santé* *optimale.*"),
 20: ("N", "Ah, bien-aimés ! | Dieu voudrait qu'en *toute* *chose,* qu'elle soit bonne ou pas, nous tendions vers lui. | Que nous reconnaissions que celui qui fait vivre et qui fait mourir, | celui qui donne, celui qui reprend, c'est lui."),
 21: ("N", "Dieu voudrait que, quand nous sommes affligés, quand quelqu'un nous offense, | nous regardions non pas cette personne, mais que nous regardions à nous, | car au travers de cela, Dieu nous rappelle une seule chose : | nous ne sommes *pas* *différents.*"),
 22: ("N", "Mais malgré tout, il n'a pas regardé à cela, | mais il a fait de son Fils unique le premier-né d'entre nous, afin que nous ayons la vie, | et qu'à cause de cela, nous pratiquions la vie de Christ, | que nous *pardonnions* comme Christ nous a pardonné, | et que ce message que prêche notre apôtre Paris Talla prenne vie dans notre cœur."),
}
SPLIT = (T[17][1] + T[18][0]) / 2
M = lambda t: OFF + t + (GAP if t > SPLIT else 0)

# voix corrigée → 48 kHz mono
tmp = os.path.join(ROOT, "assets", "_v.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(ROOT, "audio", "voixoff-corrigee.wav"), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", tmp], check=True)
w = wave.open(tmp); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; w.close(); os.remove(tmp)
# zones de parole (10 ms)
n = SR // 100; db = 20 * np.log10(np.sqrt((v[:len(v) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
sp = db > max(np.percentile(db, 20) + 8, -45); REG, i = [], 0
while i < len(sp):
    if sp[i]:
        j = i
        while j < len(sp) and sp[j]: j += 1
        if REG and i / 100 - REG[-1][1] < 0.12: REG[-1][1] = j / 100
        else: REG.append([i / 100, j / 100])
        i = j
    else: i += 1
json.dump(REG, open(os.path.join(HERE, "regions.json"), "w"))
def place(words, a, b):
    reg = [[max(a, r0), min(b, r1)] for r0, r1 in REG if min(b, r1) - max(a, r0) > 0.02] or [[a, b]]
    tot = sum(e - s for s, e in reg); wt = [len(re.sub(r"[^\wÀ-ÿœ]", "", x)) + 2.5 for x in words]; W = sum(wt); out, acc = [], 0
    for x in wt:
        pos = acc / W * tot; acc += x
        for s, e in reg:
            if pos <= e - s + 1e-6: out.append(s + pos); break
            pos -= e - s
    return out
lines = []
for k, (who, txt) in TEXT.items():
    pages, words = [], []
    for part in txt.split("|"):
        ws = part.split(); i0 = len(words)
        for x in ws: words.append([x.replace("*", ""), 0, 1 if "*" in x else 0])
        pages.append([i0, len(words)])
    a0, b0 = T[k]
    for x, t in zip(words, place([x[0] for x in words], a0, b0)): x[1] = round(M(t), 3)
    lines.append({"n": k, "who": who, "a": round(M(a0), 3), "b": round(M(b0), 3), "words": words, "pages": pages})
END17 = M(T[17][1]); NARR = M(T[18][0]); FIN = round(M(T[22][1]) + 1.2, 2); DUR = round(FIN + 4.0, 2)

# ── mixage : voix + bip discret du moniteur (dialogue) + nappe de piano (narration) ──
N = int(DUR * SR); voice = np.zeros(N, np.float32)
def put(a, b, dst):
    seg = v[int(a * SR):int(b * SR)].copy(); f = int(0.02 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    i = int(dst * SR); voice[i:i + len(seg)] += seg[:N - i]
put(0, SPLIT, OFF); put(SPLIT, len(v) / SR, OFF + SPLIT + GAP)
t_ax = np.arange(N) / SR
beep = np.zeros(N, np.float32); bt = 0.6
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
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))
vr = rms(voice); beep *= vr * 10 ** (-28 / 20) / rms(beep); pad *= vr * 10 ** (-28 / 20) / rms(pad)
mix = voice + beep + pad
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
data = {"fps": FPS, "dur": DUR, "off": OFF, "end17": round(END17, 2), "narr": round(NARR, 2), "fin": FIN, "lines": lines, "lev": "".join(lev), "voc": "".join(voc)}
open(os.path.join(ROOT, "assets", "data.js"), "w").write("window.FILM = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("durée", DUR, "| narration", round(NARR, 2), "| logo", FIN)
