#!/usr/bin/env python3
"""3 extraits TikTok (45-60 s) découpés dans sorties/episode-1-tiktok.mp4, terminés par « ÉPISODE COMPLET SUR NOTRE PAGE ».

Usage : python3 montage/extraits.py WORK_DIR
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOOK = 4.0
CARD = 2.5

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr[-3000:])

def card(path):
    W, H = 1080, 1920
    im = Image.new("RGB", (W, H), (10, 8, 5)); d = ImageDraw.Draw(im)
    for r in range(1100, 0, -8):
        c = int(55 * (1 - r / 1100)); d.ellipse((W/2-r, H/2-r, W/2+r, H/2+r), fill=(10+c, 8+int(c*.75), 5+int(c*.3)))
    f = ImageFont.truetype(os.path.join(ROOT, "fonts", "Fredoka-Bold.ttf"), 96)
    g = ImageFont.truetype(os.path.join(ROOT, "fonts", "Fredoka-Bold.ttf"), 58)
    y = H/2 - 200
    for ln, col in [("ÉPISODE", (255, 255, 255)), ("COMPLET", (255, 229, 0)), ("SUR NOTRE PAGE", (255, 255, 255))]:
        d.text((W/2, y), ln, font=f, fill=col, anchor="mm", stroke_width=6, stroke_fill=(0, 0, 0)); y += 135
    d.text((W/2, y + 60), "« LE PARDON DIVIN » · ÉPISODE 1", font=g, fill=(212, 175, 55), anchor="mm")
    logo = Image.open(os.path.join(ROOT, "logo-midigrad.png")).convert("RGBA").resize((260, 260), Image.LANCZOS)
    im.paste(logo, ((W-260)//2, 260), logo)
    im.save(path)

def main():
    work = sys.argv[1]
    a = json.load(open(os.path.join(work, "ancres.json")))["a"]
    t = lambda k: float(a[k]) + HOOK
    src = os.path.join(ROOT, "sorties", "episode-1-tiktok.mp4")
    png = os.path.join(work, "carte_episode_complet.png"); card(png)
    clips = [
        ("extrait-1-serpent-et-fruit", t("unjour") - 0.4, t("beaucoup") - 0.3),
        ("extrait-2-ou-es-tu-accusation", t("entendent") - 0.4, t("consequences") - 0.3),
        ("extrait-3-habits-de-peau", t("habits") - 0.4, t("prochain") - 0.3),
    ]
    for name, s, e in clips:
        d = e - s
        out = os.path.join(ROOT, "sorties", name + ".mp4")
        fl = (f"[0:v]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS,fade=out:st={d-0.4:.3f}:d=0.4,setsar=1[v0];"
              f"[1:v]scale=1080:1920,fps=30,format=yuv420p,fade=in:st=0:d=0.3,setsar=1[v1];"
              f"[v0][v1]concat=n=2:v=1:a=0[v];"
              f"[0:a]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS,afade=in:st=0:d=0.3,afade=out:st={d-0.8:.3f}:d=0.8,"
              f"apad=pad_dur={CARD}[a]")
        run(["ffmpeg", "-v", "error", "-y", "-i", src, "-loop", "1", "-t", str(CARD), "-i", png, "-filter_complex", fl,
             "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
             "-r", "30", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{d + CARD:.3f}", "-movflags", "+faststart", out])
        print(f"{name}: {d + CARD:.1f} s")

if __name__ == "__main__":
    main()
