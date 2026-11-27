"""Mixage d'une prédication courte.
Usage : python3 mixer.py <dossier prédication> <pNN.json> <sortie.wav>
Voix normalisée à -14 LUFS / crête -1 dBTP ; musique douce (piano) à ~9 % avec baisse automatique sous la voix ;
petits sons doux à 20-30 %. Les bruitages sont listés dans BRUITAGES (temps = ancre + décalage)."""
import json, subprocess, sys, re, os
dossier, pjson, sortie = sys.argv[1:4]
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(pjson))) + "/.."
SONS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../sons"))
d = json.load(open(pjson)); A = d["ancres"]; fin_voix = d["finVoix"]
CARTE = fin_voix + 0.25; DUREE = CARTE + 3
voix = next(os.path.join(dossier, f) for f in ("voix.wav", "voix.mp3") if os.path.exists(os.path.join(dossier, f)))

# (fichier, instant, durée max, volume linéaire, fondu de sortie)
BRUITAGES = [
    ("coeur", A["serrecoeur"] - 0.1, 2.4, 0.25, 0.8),        # le cœur se serre
    ("magie-lumiere", A["verset1"] + 0.3, 3.0, 0.22, 1.0),   # rayon de lumière (Colossiens)
    ("magie-lumiere", A["regarde"], 3.0, 0.22, 1.0),         # la croix apparaît
    ("magie-lumiere", A["regarder"] + 0.2, 3.0, 0.2, 1.0),   # regarder à Dieu : lumière
    ("magie-lumiere", A["benis"], 2.5, 0.18, 1.0),           # bénédiction finale
    ("logo-reveal", CARTE, 3.0, 0.22, 1.2),                  # carte MIDIGRAD
    # MANQUANTS (voir sons/LISTE.md) : chaine.mp3 (≈ A["serre"]), chaine-brisee.mp3 (≈ A["liberer"])
]

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True)

# 1) voix : loudnorm en deux passes → -14 LUFS, -1 dBTP
r = run(["ffmpeg", "-hide_banner", "-i", voix, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")

entrees = ["-i", voix, "-stream_loop", "-1", "-i", f"{SONS}/musique.mp3"]
for b in BRUITAGES: entrees += ["-i", f"{SONS}/{b[0]}.mp3"]
f = [f"[0:a]aresample=48000,{ln},apad=whole_dur={DUREE},asplit=2[v][sc]",
     # musique : ~9 %, fondu d'entrée, ducking sous la voix, fondu de sortie avec la carte
     f"[1:a]aresample=48000,atrim=0:{DUREE},volume=0.09,afade=t=in:d=1.5,afade=t=out:st={CARTE + 1.4}:d=1.6[mu]",
     "[mu][sc]sidechaincompress=threshold=0.03:ratio=4:attack=60:release=600:makeup=1[mud]"]
noms = ["[v]", "[mud]"]
for i, (n, t0, dur, vol, fo) in enumerate(BRUITAGES):
    k = i + 2
    f.append(f"[{k}:a]aresample=48000,atrim=0:{dur},afade=t=in:d=0.05,afade=t=out:st={max(0, dur - fo)}:d={fo},"
             f"volume={vol},adelay={int(t0 * 1000)}:all=1[s{i}]")
    noms.append(f"[s{i}]")
f.append(f"{''.join(noms)}amix=inputs={len(noms)}:normalize=0:duration=first,atrim=0:{DUREE},"
         "volume=-0.3dB,alimiter=limit=0.891:attack=5:release=50:level=false[out]")
run(["ffmpeg", "-y", "-hide_banner"] + entrees + ["-filter_complex", ";".join(f), "-map", "[out]", "-ac", "2", "-ar", "48000", sortie])
r = run(["ffmpeg", "-hide_banner", "-i", sortie, "-af", "loudnorm=print_format=json", "-f", "null", "-"])
m2 = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S).group(0))
print(f"mix : {m2['input_i']} LUFS, crête {m2['input_tp']} dBTP, durée {DUREE:.2f} s")
