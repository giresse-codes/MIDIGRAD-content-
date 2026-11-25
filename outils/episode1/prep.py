import json, subprocess, numpy as np
CA, CB = 21.0, 26.3; D = CB - CA
tr = json.load(open("transcript.json"))
for s in tr:
    nw = []
    for w in s["words"]:
        if 20.9 <= w["s"] < 25.5: continue
        if w["s"] >= 25.5: w["s"] = max(CA + 0.02, w["s"] - D); w["e"] = max(w["s"] + 0.05, w["e"] - D)
        nw.append(w)
    s["words"] = nw
# fusion des jetons « 'est », « -vous » avec le mot précédent
for s in tr:
    m = []
    for w in s["words"]:
        t = w["w"].strip()
        if m and (t.startswith("'") or t.startswith("-")) and not t.startswith("--"):
            m[-1]["w"] = m[-1]["w"].rstrip() + t; m[-1]["e"] = w["e"]
        else: m.append(dict(w))
    s["words"] = m
json.dump(tr, open("transcript_edit.json", "w"), ensure_ascii=False)
vad = json.load(open("vad.json"))
def sh(seg):
    out = []
    for s, e in seg:
        if e <= CA: out.append([s, e])
        elif s >= CB: out.append([s - D, e - D])
        elif s < CA: out.append([s, CA])
        elif e > CB: out.append([CA, e - D])
    return out
json.dump({"speech": sh(vad["speech"]), "pauses": [p for p in sh(vad["pauses"]) if p[1] - p[0] > 0.35]}, open("vad_edit.json", "w"))
# voix montée : 0–21,0 + 26,3–fin, fondus 15 ms
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", "/home/user/MIDIGRAD-content-/audio/ep1.mp3", "-filter_complex",
  f"[0:a]asplit[a][b];[a]atrim=0:{CA},afade=t=out:st={CA-0.015}:d=0.015[x];[b]atrim={CB},asetpts=PTS-STARTPTS,afade=t=in:d=0.015[y];[x][y]concat=n=2:v=0:a=1,aresample=48000",
  "-c:a", "pcm_s24le", "voice_edit.wav"])
print(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","voice_edit.wav"]).decode())
