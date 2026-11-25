import json, subprocess, shutil
tr = json.load(open("v2/transcript.json"))
for s in tr:
    m = []
    for w in s["words"]:
        t = w["w"].strip()
        if m and (t.startswith("'") or t.startswith("-")) and not t.startswith("--"):
            m[-1]["w"] = m[-1]["w"].rstrip() + t; m[-1]["e"] = w["e"]
        else: m.append(dict(w))
    s["words"] = m
json.dump(tr, open("transcript_edit.json", "w"), ensure_ascii=False)
shutil.copy("v2/vad.json", "vad_edit.json")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", "/home/user/MIDIGRAD-content-/audio/voix-apotre-v2.wav", "-af", "aresample=48000:resampler=soxr", "-c:a", "pcm_s24le", "voice_edit.wav"])
