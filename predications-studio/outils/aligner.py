"""Alignement forcé (wav2vec2 français, CTC) du texte d'écran sur la voix → horodatage mot à mot précis (~20 ms).
Usage : python3 aligner.py voix.(wav|mp3) texte-ecran.txt sortie-mots.json"""
import sys, re, json, subprocess, unicodedata
import numpy as np, torch, torchaudio.functional as F
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
voix, texte, sortie = sys.argv[1:4]
MOD = "jonatasgrosman/wav2vec2-large-xlsr-53-french"
CH = {"3": "trois", "13": "treize", "50": "cinquante", "20": "vingt"}
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", voix, "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32)
proc = Wav2Vec2Processor.from_pretrained(MOD); model = Wav2Vec2ForCTC.from_pretrained(MOD).eval()
vocab = proc.tokenizer.get_vocab()
mots = []
for l in open(texte, encoding="utf-8"):
    if not l.strip() or l.startswith("#"): continue
    for tok in l.split("::", 1)[1].replace("/", " ").split():
        tok = re.sub(r"^[rovbg]:", "", tok).split("@")[0]
        parle = CH.get(re.sub(r"\D", "", tok), None) if re.search(r"\d", tok) else tok
        s = parle.lower().replace("œ", "oe").replace("’", "'")
        ids = [vocab[c] for c in s if c in vocab and c not in "|"]
        if not ids:  # essai sans accents
            s2 = "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")
            ids = [vocab[c] for c in s2 if c in vocab]
        if ids: mots.append((tok, ids))
with torch.inference_mode():
    em = torch.log_softmax(model(torch.from_numpy(audio.copy())[None]).logits, -1)
cible = [i for _, ids in mots for i in ids]
ali, _ = F.forced_align(em, torch.tensor([cible], dtype=torch.int32), blank=proc.tokenizer.pad_token_id)
ali = ali[0].tolist()
dt = len(audio) / 16000 / em.shape[1]
# méthode robuste : segments de répétitions
segs, t = [], 0
while t < len(ali):
    a = ali[t]; t0 = t
    while t < len(ali) and ali[t] == a: t += 1
    if a != proc.tokenizer.pad_token_id: segs.append((t0, t))
# segs correspond 1:1 aux jetons cibles (sauf lettres doublées fusionnées, gérées par CTC via blanc obligatoire)
assert len(segs) == len(cible), (len(segs), len(cible))
out, i = [], 0
for tok, ids in mots:
    s0, s1 = segs[i][0], segs[i + len(ids) - 1][1]; i += len(ids)
    out.append({"w": tok, "s": round(s0 * dt, 3), "e": round(s1 * dt, 3)})
json.dump(out, open(sortie, "w"), ensure_ascii=False, indent=0)
print(len(out), "mots alignés ; dernier :", out[-1])
