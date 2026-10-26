# Correction de la voix off : suppression de la réplique 08 (dite par erreur avec la voix du pasteur,
# précédée de l'étiquette « Annabelle » lue à voix haute), fondu enchaîné de 30 ms, ~0,5 s de silence entre 07 et 09.
# Usage : python3 corriger_audio.py <voix.mp3> → ../audio/voixoff-corrigee.wav, ../timings.json, ../audio/extrait-coupure.wav
import json, os, subprocess, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.sys.argv[1]
FIN07, DEBUT09 = 93.48, 101.90          # fin de « es-tu réellement sauvée ? », début de « Être sauvé »
A, B = FIN07 + 0.25, DEBUT09 - 0.25      # 0,5 s de silence naturel au total
XF = 0.03
tmp = os.path.join(ROOT, "audio", "_src.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-ac", "1", "-c:a", "pcm_s16le", tmp], check=True)
w = wave.open(tmp); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close(); os.remove(tmp)
n = int(XF * sr); a, b = int(A * sr), int(B * sr)
fade = np.linspace(0, 1, n)
y = np.concatenate([x[:a - n], x[a - n:a] * (1 - fade) + x[b:b + n] * fade, x[b + n:]])
def wr(p, d):
    o = wave.open(p, "wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(np.clip(d, -32768, 32767).astype(np.int16).tobytes()); o.close()
wr(os.path.join(ROOT, "audio", "voixoff-corrigee.wav"), y)
CUT = A - XF; SHIFT = B - A + XF
wr(os.path.join(ROOT, "audio", "extrait-coupure.wav"), y[int((CUT - 5) * sr):int((CUT + 5) * sr)])
T = [("01", "ANNABELLE", 0.13, 3.43), ("02", "PASTEUR YANNICK", 3.84, 7.03), ("03", "ANNABELLE", 7.47, 27.84), ("04", "PASTEUR YANNICK", 28.28, 51.68),
     ("05", "PASTEUR YANNICK", 52.34, 79.47), ("06", "ANNABELLE", 80.02, 89.45), ("07", "PASTEUR YANNICK", 89.74, 93.48), ("09", "PASTEUR YANNICK", 101.90, 125.46),
     ("10", "PASTEUR YANNICK", 126.01, 159.25), ("11", "PASTEUR YANNICK", 159.76, 185.45), ("12", "PASTEUR YANNICK", 185.88, 215.07), ("13", "PASTEUR YANNICK", 215.64, 244.13),
     ("14", "ANNABELLE", 244.52, 254.53), ("15", "PASTEUR YANNICK", 254.84, 277.96), ("16", "PASTEUR YANNICK", 278.50, 301.48), ("17", "ANNABELLE", 301.85, 303.85),
     ("18", "NARRATEUR", 304.09, 314.32), ("19", "NARRATEUR", 314.71, 319.73), ("20", "NARRATEUR", 320.05, 332.73), ("21", "NARRATEUR", 333.03, 345.33), ("22", "NARRATEUR", 345.74, 362.78)]
M = lambda t: round(t if t <= CUT else t - SHIFT, 2)
out = {"fichier": "audio/voixoff-corrigee.wav", "duree": round(len(y) / sr, 2),
       "coupure": {"retire_dans_l_original": [round(A, 2), round(B, 2)], "contenu_retire": "« Annabelle » (étiquette lue) + réplique 08 « Mais bien sûr ! … et j'y crois. »",
                   "position_dans_le_fichier_corrige": round(CUT, 2), "fondu_ms": 30, "silence_entre_07_et_09_s": round(M(DEBUT09) - FIN07, 2)},
       "methode": "Whisper medium (sherpa-onnx) phrase par phrase + détection des pauses ; temps en secondes dans le fichier corrigé",
       "repliques": [{"n": k, "qui": q, "debut": M(a), "fin": M(b)} for k, q, a, b in T]}
json.dump(out, open(os.path.join(ROOT, "timings.json"), "w"), ensure_ascii=False, indent=1)
print("coupure à", round(CUT, 2), "s ; durée", out["duree"])
for r in out["repliques"]: print(r["n"], r["qui"], r["debut"], "→", r["fin"])
