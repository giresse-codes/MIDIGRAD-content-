import json, sys, time
from faster_whisper import WhisperModel
t=time.time()
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
prompt = open(sys.argv[2]).read()[:800]
import numpy as np
audio=np.fromfile("voice16k.f32",dtype=np.float32)
segs, info = m.transcribe(audio, language="fr", word_timestamps=True, beam_size=5, initial_prompt=prompt, vad_filter=False)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in s.words]})
    print(f"{s.start:7.2f} {s.text}", flush=True)
json.dump(out, open("transcript.json","w"), ensure_ascii=False, indent=1)
print("DONE", time.time()-t)
