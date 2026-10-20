# Génère index.html : vidéos des 5 extraits, voix, SFX (liste exportée par le moteur JS).
import json, os, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CL = [(3.6, 121.4), (126.59, 66.41), (194.60, 82.23), (278.42, 66.62), (346.64, 66.92)]
DUR = 420
sfx = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else []
LEN = {"whoosh": 0.9, "whoosh_court": 0.5, "impact": 1.8, "scintillement": 3.2, "montee": 2.5, "page": 0.35, "clic": 0.12, "notification": 0.7}
v4 = open(os.path.join(P, "../meditation-promesse-v4/index.html")).read()
style = v4[v4.index("    <style>"):v4.index("    </style>") + 13]
vid = lambda pre, cls, src, tr: "\n".join(f'      <video id="{pre}{i+1}" class="{cls}" src="assets/clips/{src}{i+1}.mp4" muted playsinline data-start="{s}" data-duration="{d}" data-track-index="{tr}"></video>' for i, (s, d) in enumerate(CL))
# pistes SFX : une piste par son, nouvelle piste si chevauchement
tracks, au, base = {}, [], 4
ends = {}
for k, (t, n, v) in enumerate(sorted(sfx)):
    d = LEN[n]; tr = base
    while ends.get(tr, -1) > t: tr += 1
    ends[tr] = t + d
    au.append(f'      <audio id="sfx-{k:03d}-{n}" src="assets/sfx/{n}.wav" data-start="{t}" data-duration="{d:.2f}" data-track-index="{tr}" data-volume="{v}"></audio>')
html = f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1440, height=1080" />
    <title>Une fleur pour se venger — Méditation MIDIGRAD (4:3)</title>
    <script src="assets/lib/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/m43.css" />
{style}
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1440" data-height="1080">
{vid("bg", "clip bgv", "bg", 0)}
      <div id="bgshade"></div>
      <div id="spk"><div id="frame">
{vid("v", "clip", "clip", 1)}
      </div></div>
      <div id="kins"></div>
      <div id="pills"></div>
      <div id="stage"></div>
      <div id="pip">
{vid("p", "clip", "clip", 2)}
      </div>
      <div id="fulls"></div>
      <div id="brand"><span class="dot"></span><strong>MIDIGRAD</strong><span>Méditation · Apôtre Paris Talla</span></div>
      <div id="caps"></div>
      <audio id="voix" src="assets/voix-apotre.wav" data-start="0" data-duration="{DUR}" data-track-index="3" data-volume="1"></audio>
{chr(10).join(au)}
    </div>
    <script src="assets/caps.js"></script>
    <script src="assets/m43.js"></script>
    <script>
      window.__timelines["main"] = window.__m43.tl;
    </script>
  </body>
</html>
'''
open(os.path.join(P, "index.html"), "w").write(html)
print(len(au), "sfx")
