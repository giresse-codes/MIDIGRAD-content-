# Calage mot à mot : chaque réplique est répartie sur les zones de parole détectées dans sa fenêtre audio.
# Usage : python3 build_data.py regions.json ../assets/data.js
import json, re, sys
REG = json.load(open(sys.argv[1]))
# (qui, début, fin, texte ; *mot* = surligné, | = changement de bulle, expressions [(fraction, clé, bras, anim, durée)])
L = [
 ("D", 1.54, 8.33, "Hier soir, j'ai écouté la prédication de l'apôtre Paris Talla sur YouTube… | Franchement, ça m'a *touché.*", [(0, "fuyant", None, "bas", 2.5)]),
 ("D", 9.83, 17.71, "Mais je vais pas te mentir, Marie. | *Pardonner* à Jorvis, après tout le mal qu'il m'a fait ? | Non. J'ai pas envie.", [(0, "gene")]),
 ("M", 18.68, 21.52, "Okayyy… Je peux te poser une *question* ?", [(0, "curieuse", None, "penche", 2)]),
 ("D", 22.44, 23.17, "Ouais, vas-y.", [(0, "mefiant")]),
 ("M", 23.86, 26.97, "Tu dis que Dieu t'a *pardonné,* c'est bien ça ?", [(0, "douce")]),
 ("D", 27.70, 37.55, "Ouaip. Romains 6:23 : | « Car le salaire du péché, c'est la mort ; mais le *don* *gratuit* de Dieu, | c'est la vie éternelle en Jésus-Christ notre Seigneur. »", [(0, "fier", None, "fier", 2.5)]),
 ("M", 38.32, 43.34, "D'accord. Donc ce pardon, il était gratuit. | *Complètement* *gratuit.*", [(0, "acquiesce", None, "hoche", 1)]),
 ("D", 45.11, 46.45, "Oui, c'est ça.", [(0, "ok")]),
 ("M", 47.21, 68.03, "Et tu l'as pas *mérité.* Éphésiens 2:8-9 : | « Car c'est par la *grâce* que vous êtes sauvés, par le moyen de la foi. | Et cela ne vient pas de vous, c'est le don de Dieu. | Ce n'est point par les œuvres, afin que personne ne se glorifie. » | C'est bien ça ?", [(0, "malin", "finger"), (0.97, "malin", None)]),
 ("D", 69.03, 72.05, "Oui… mais je vois pas trop où tu veux en venir.", [(0, "perplexe")]),
 ("M", 72.94, 84.47, "Je sais que Jorvis t'a vraiment *blessé.* | Il n'est même pas venu s'excuser, et ça fait mal. | Je comprends que tu penses qu'il ne mérite pas ton pardon.", [(0, "rire", None, "rit", 0.9), (0.1, "tendre")]),
 ("M", 85.37, 104.95, "Mais regarde : Dieu n'a pas attendu tes excuses. | Il t'a choisi avant la fondation du monde, Éphésiens 1:4. | Et Romains 5:8 : « Lorsque nous étions encore des pécheurs, Christ est mort pour nous. » | Il t'a pardonné *avant* *même* *que* *tu* *naisses.*", [(0, "posee")]),
 ("D", 105.33, 109.82, "Pfff… T'as raison, c'est vrai. | Mais j'ai quand même pas *envie* de lui pardonner.", [(0, "yeuxbas", None, "bas", 2), (0.45, "boude")]),
 ("M", 110.51, 125.95, "Ah bon ? Et c'est toi qui dis avoir reçu la vie de Christ ? | Éphésiens 5:1 : « Soyez les *imitateurs* de Dieu. » | Et Galates 2:20 : « Ce n'est plus moi qui vis, c'est *Christ* qui vit en moi. » | Si tu l'as reçu, bien sûr…", [(0, "amusee"), (0.1, "tendre"), (0.9, "rire", None, "rit", 1.2)]),
 ("D", 126.61, 133.05, "Attends… Tu es en train de me dire que j'ai peut-être pas reçu le *salut* ?! | Genre… par hasard ?!", [(0, "panique", None, "tremble", 0.6), (0.7, "panique", None, "tremble", 0.5)]),
 ("M", 133.87, 149.85, "Bahhh… ça, on en parlera plus tard. | D'abord, va voir Jorvis et parle-lui, avec le *pardon* déjà dans ton cœur. | Colossiens 3:13 : « De même que Christ vous a pardonné, pardonnez-vous aussi. » | On ne peut pardonner que parce qu'on a été *pardonné.*", [(0, "malin"), (0.2, "douce")]),
 ("D", 150.63, 155.05, "Okay, j'ai compris, bufff… | De toute façon, j'étais même pas *fâché* contre lui.", [(0, "detache", "up")]),
 ("M", 157.30, 159.50, "Dave, c'est pas bien de *mentir,* tu sais ! 🤣", [(0, "eclat", "cross", "rit", 2)]),
 ("D", 160.24, 163.04, "…Bon. Je l'appelle *ce* *soir.*", [(0, "sincere", None, "rit", 0.8)]),
 ("M", 163.76, 166.00, "Voilà. Là, je suis *fière* de toi.", [(0, "fiere")]),
]
LAUGH_M18 = 155.29  # éclat de rire de Marie avant sa réplique

def speech(a, b):
    out = []
    for r0, r1 in REG:
        s, e = max(a, r0), min(b, r1)
        if e - s > 0.02: out.append([s, e])
    return out or [[a, b]]

def place(words, a, b):
    reg = speech(a, b); tot = sum(e - s for s, e in reg)
    wt = [len(re.sub(r"[^\wÀ-ÿœ]", "", w)) + 2.5 for w in words]; W = sum(wt)
    times, acc = [], 0
    for x in wt:
        pos = acc / W * tot; acc += x
        for s, e in reg:  # position dans le temps de parole -> temps réel
            if pos <= e - s + 1e-6: times.append(round(s + pos, 3)); break
            pos -= e - s
    return times

lines = []
for who, a, b, txt, ex in L:
    raw = txt.replace("🤣", "").strip()
    pages, words = [], []
    for part in raw.split("|"):
        ws = part.split(); i0 = len(words)
        for w in ws: words.append([w.replace("*", ""), 0, 1 if "*" in w else 0])
        pages.append([i0, len(words)])
    ts = place([w[0] for w in words], a, b)
    for w, t in zip(words, ts): w[1] = t
    exo = []
    for e in ex:
        f, k = e[0], e[1]; t = round(a + (b - a) * f - (0.15 if f == 0 else 0), 2)
        item = [t, k]
        if len(e) > 2: item.append(e[2] or "")
        if len(e) > 3: item += [e[3], e[4]]
        exo.append(item)
    lines.append({"who": who, "a": a, "b": b, "words": words, "pages": pages, "ex": exo})
lines[17]["ex"][0][0] = LAUGH_M18 - 0.1  # Marie rit dès 155,3 s
for l in lines: l["words"][-1][0] += " 🤣" if False else ""

def wt(li, word, n=0):
    k = 0
    for w in lines[li]["words"]:
        if word in w[0]:
            if k == n: return w[1]
            k += 1
    raise KeyError(word)

V = lambda t, ref, html, hl, small=False: {"k": "verse", "t": round(t, 2), "ref": ref, "html": html, "hl": hl, "small": small}
top = [
 {"k": "verdict", "t": 0.5}, {"k": "dot", "i": 0, "t": 1.4},
 V(wt(5, "6:23") - 0.3, "Romains 6 : 23", "Car le salaire du péché, c'est la mort ; mais le <b>don gratuit</b> de Dieu, c'est la vie éternelle en Jésus-Christ notre Seigneur.", [[0, wt(5, "don")]]),
 {"k": "verdict", "t": lines[6]["a"] - 0.3}, {"k": "dot", "i": 1, "t": wt(6, "Complètement")},
 V(wt(8, "Éphésiens") - 0.3, "Éphésiens 2 : 8-9", "Car c'est par la <b>grâce</b> que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu. Ce n'est point par les œuvres, afin que personne ne se glorifie.", [[0, wt(8, "grâce")]], True),
 {"k": "verdict", "t": lines[9]["a"] - 0.3}, {"k": "dot", "i": 2, "t": lines[9]["a"] + 0.3},
 V(wt(11, "Éphésiens") - 0.6, "Éphésiens 1 : 4", "En lui Dieu nous a élus <b>avant la fondation du monde</b>, pour que nous soyons saints et irrépréhensibles devant lui.", [[0, wt(11, "Éphésiens") - 0.3]]),
 V(wt(11, "Romains") - 0.3, "Romains 5 : 8", "Mais Dieu prouve son amour envers nous, en ce que, lorsque nous étions encore des pécheurs, <b>Christ est mort pour nous</b>.", [[0, wt(11, "Christ")]]),
 {"k": "verdict", "t": lines[12]["a"] - 0.3}, {"k": "dot", "i": 3, "t": lines[12]["a"] + 0.2},
 V(wt(13, "Éphésiens") - 0.3, "Éphésiens 5 : 1", "Devenez donc les <b>imitateurs de Dieu</b>, comme des enfants bien-aimés.", [[0, wt(13, "imitateurs")]]),
 V(wt(13, "Galates") - 0.3, "Galates 2 : 20", "J'ai été crucifié avec Christ ; et si je vis, ce n'est plus moi qui vis, <b>c'est Christ qui vit en moi</b>…", [[0, wt(13, "Christ", 1)]]),
 {"k": "verdict", "t": lines[14]["a"] - 0.3},
 V(wt(15, "Colossiens") - 0.3, "Colossiens 3 : 13", "Supportez-vous les uns les autres, et, si l'un a sujet de se plaindre de l'autre, pardonnez-vous réciproquement. De même que <b>Christ vous a pardonné</b>, pardonnez-vous aussi.", [[0, wt(15, "Christ")]], True),
 {"k": "verdict", "t": lines[16]["a"] - 0.3}, {"k": "dot", "i": 4, "t": lines[16]["a"] + 0.2},
 {"k": "green", "t": lines[19]["a"] - 0.3},
 {"k": "end", "t": 166.4},
]
data = {"dur": 173, "endAt": 166.2, "lines": lines, "top": top,
        "bascule": {"t": wt(11, "avant", 1) - 0.4, "t2": lines[11]["b"] + 1.0}, "confetti": wt(18, "soir") - 0.2}
open(sys.argv[2], "w").write("window.DEB = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("ok", data["bascule"], data["confetti"])
