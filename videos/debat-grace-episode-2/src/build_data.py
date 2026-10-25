# Épisode 2 — calage mot à mot : chaque réplique est répartie sur les zones de parole détectées dans sa fenêtre audio.
# Les temps des répliques sont relevés sur la voix off (nouvelle version du 25/10) ; la piste est décalée de OFF s (intro).
# Les pauses longues sont raccourcies (src/tighten.py → src/cuts.json).
# Usage : python3 build_data.py regions.json ../assets/data.js
import json, re, sys
OFF = 10.0
import os
CUTS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "cuts.json")))  # pauses retirées (tighten.py)
def M(t):  # temps de la voix d'origine -> temps de la voix resserrée
    return t - sum(min(b, max(t, a)) - a for a, b in CUTS)
REG = [[M(a) + OFF, M(b) + OFF] for a, b in json.load(open(sys.argv[1]))]
# (qui, début, fin, texte ; *mot* = surligné, | = changement de bulle, expressions [(fraction, clé, bras, anim, durée)])
L = [
 ("M", 0.10, 4.29, "Waouh, Dave ! Pourquoi tu *souris* comme ça aujourd'hui ?", [(0, "amusee", None, "penche", 2)]),
 ("D", 5.20, 12.55, "Je regarde une vidéo de mon papa, l'apôtre *Paris* *Talla.* | Je l'aime, tu sais. L'Esprit de Dieu est en lui.", [(0, "attendri"), (0.6, "sincere", None, "hoche", 1)]),
 ("M", 13.37, 19.69, "Je vois ça ! Alors… tu as parlé à *Jorvis* hier ?", [(0, "douce"), (0.4, "curieuse", None, "penche", 1.5)]),
 ("D", 20.46, 23.77, "Oui, oui, je l'ai fait. Et je lui ai *pardonné.*", [(0, "fier", None, "fier", 2)]),
 ("M", 24.62, 27.98, "Super ! Je suis *contente* que tu lui aies pardonné.", [(0, "fiere", None, "hoche", 1)]),
 ("D", 28.81, 34.39, "Ouais. Et en plus, j'en ai profité pour *demander* *pardon* à Dieu… | parce que j'avais pensé du mal de Jorvis.", [(0, "fier"), (0.62, "gene", None, "bas", 2)]),
 ("M", 35.51, 36.78, "Comment ça, « *demander* *pardon* » ?", [(0, "curieuse", None, "penche", 1.5)]),
 ("D", 37.67, 44.72, "Bah… j'ai péché, donc je demande pardon. C'est *simple.* | T'as un problème avec le fait de demander pardon à Dieu ?", [(0, "ok"), (0.5, "mefiant")]),
 ("M", 46.57, 63.99, "Tu as *péché,* tu dis ? | Je pensais que Jésus-Christ était mort pour nos péchés… Première épître de Pierre, chapitre trois, verset dix-huit : | « Christ aussi a souffert *une* *fois* pour les péchés, lui juste pour des injustes, afin de nous amener à Dieu. » | C'est pas ça ?", [(0, "malin"), (0.3, "posee", "finger"), (0.9, "malin", None)]),
 ("D", 64.83, 70.10, "Ouais, c'est ça. | Mais n'empêche, je commets des péchés *tous* *les* *jours.* Donc je dois demander pardon. C'est logique, non ?", [(0, "ok", None, "hoche", 1), (0.25, "perplexe")]),
 ("M", 70.95, 75.90, "Mais si tu demandes pardon, tu dis indirectement à Dieu que ce que Christ a fait sur la croix *ne* *suffit* *pas.*", [(0, "posee"), (0.6, "tendre")]),
 ("D", 76.64, 91.22, "Wooh, Marie ! J'ai jamais dit ça ! | Mais la réalité, c'est que je mens, je fais des choses pas bien… et je me sens *coupable.* | Alors je demande pardon.", [(0, "panique", None, "tremble", 0.6), (0.32, "triste", None, "bas", 3), (0.85, "inquiet")]),
 ("M", 92.21, 100.26, "Dave… En vrai, tu n'écoutes pas vraiment le message que prêche l'apôtre Paris Talla. | Et tu ne lis même pas ta *Bible.*", [(0, "malin"), (0.75, "amusee")]),
 ("M", 101.03, 122.92, "Sinon, tu aurais compris que ce que tu appelles « péché », | c'est en fait la manifestation de ta *nature* *charnelle.* Romains huit, verset trois : | « Car chose impossible à la loi, parce que la *chair* la rendait sans force, | Dieu a condamné le péché dans la chair, | en envoyant, à cause du péché, *son* *propre* *Fils* dans une chair semblable à celle du péché. »", [(0, "posee"), (0.3, "posee", "finger"), (0.95, "douce", None)]),
 ("M", 123.71, 142.43, "Et d'ailleurs, tu ne vas pas en enfer parce que tu voles ou parce que tu mens. | Romains cinq, verset seize : « C'est après une seule offense que le jugement est devenu condamnation, | tandis que le *don* *gratuit* devient *justification* après plusieurs offenses. »", [(0, "tendre"), (0.35, "posee")]),
 ("M", 143.58, 164.17, "Et Romains cinq, verset dix-huit : | « Ainsi donc, comme par une seule offense la condamnation a atteint tous les hommes, | de même par un seul acte de justice la justification qui donne la vie s'étend à *tous* *les* *hommes.* »", [(0, "posee", "finger"), (0.8, "fiere", None)]),
 ("M", 165.05, 178.45, "Tu vois ? Tu n'étais pas condamné parce que tu avais péché, mais à cause d'*Adam.* | Et tu n'es pas justifié parce que tu obéis à la loi, ce qui est impossible d'ailleurs. | Mais parce que *Christ* est mort pour nos péchés.", [(0, "douce"), (0.4, "posee"), (0.8, "tendre")]),
 ("D", 179.49, 192.24, "Marie, je vais pas te mentir. | Ma tête, elle *chauffe* ! Il faut que tu m'expliques. J'ai peur d'être dans *l'erreur* depuis le tout début.", [(0, "gene"), (0.22, "depasse", "up", "tremble", 0.5), (0.62, "inquiet", "")]),
 ("M", 193.16, 198.27, "Tu es dans l'erreur. | Mais t'inquiète pas, on en *reparlera.*", [(0, "malin", None, "penche", 1.5)]),
 ("D", 198.78, 200.53, "Euh… on peut pas le faire *maintenant* ?", [(0, "inquiet")]),
 ("M", 201.28, 208.58, "Non, non, je dois y aller. | Mais je te promets : quand on se reverra, nous nous *édifierons* davantage.", [(0, "douce"), (0.4, "tendre"), (0.8, "fiere")]),
]

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
    a, b = M(a) + OFF, M(b) + OFF
    pages, words = [], []
    for part in txt.split("|"):
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

def wt(n, word, k=0):  # n = numéro de réplique (1-21)
    c = 0
    for w in lines[n - 1]["words"]:
        if word in w[0]:
            if c == k: return w[1]
            c += 1
    raise KeyError(word)

V = lambda t, ref, html, hl, small=False: {"k": "verse", "t": round(t, 2), "ref": ref, "html": html, "hl": hl, "small": small}
L1, L5, L16, L21 = lines[0], lines[4], lines[15], lines[20]
top = [
 {"k": "phone", "t": 0.3}, {"k": "thumb", "t": L1["a"] - 0.4}, {"k": "phoneout", "t": L5["a"] - 0.3},
 {"k": "verdict", "t": lines[5]["a"] - 0.3}, {"k": "dot", "i": 0, "t": wt(6, "demander")},
 V(wt(9, "Première") - 0.3, "1 Pierre 3 : 18", "Christ aussi a souffert <b>une fois</b> pour les péchés, lui juste pour des injustes, afin de nous amener à Dieu…", [[0, wt(9, "une")]]),
 {"k": "verdict", "t": lines[10]["a"] - 0.3}, {"k": "dot", "i": 1, "t": wt(11, "suffit")},
 V(wt(14, "Romains") - 0.3, "Romains 8 : 3", "Car chose impossible à la loi, parce que la <b>chair</b> la rendait sans force, Dieu a condamné le péché dans la chair, en envoyant, à cause du péché, <b>son propre Fils</b> dans une chair semblable à celle du péché,", [[0, wt(14, "chair")], [1, wt(14, "son")]], True),
 V(wt(15, "Romains") - 0.3, "Romains 5 : 16", "… c'est après une seule offense que le jugement est devenu condamnation, tandis que le <b>don gratuit</b> devient <b>justification</b> après plusieurs offenses.", [[0, wt(15, "don")], [1, wt(15, "justification")]]),
 {"k": "compare", "t": wt(16, "Romains") - 0.3,
  "r1": [wt(16, "comme"), wt(16, "hommes", 0)], "r2": [wt(16, "même"), wt(16, "hommes", 1)], "tous": wt(16, "tous", 1),
  "adam": wt(17, "Adam"), "christ": wt(17, "Christ")},
 {"k": "suite", "t": L21["b"] + 0.5},
]
fx = [
 {"k": "shake", "t": wt(12, "Wooh")},
 {"k": "smoke", "t": wt(18, "chauffe") - 0.3, "t2": wt(18, "m'expliques")},
 {"k": "step", "t": wt(21, "aller.") - 0.2}, {"k": "leave", "t": L21["b"] + 0.3},
]
end = L21["b"] + 3.2
data = {"dur": round(end + 5.2, 2), "endAt": L21["b"] + 0.2, "lines": lines, "top": top, "fx": fx, "end": round(end, 2),
        "bascule": {"t": wt(16, "tous", 1) - 0.3, "t2": L16["b"] + 1.5}}
open(sys.argv[2], "w").write("window.DEB = " + json.dumps(data, ensure_ascii=False) + ";\n")
print("ok dur", data["dur"], "end", data["end"], "bascule", data["bascule"])
