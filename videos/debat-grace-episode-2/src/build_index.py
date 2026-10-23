import json, os, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sfx = json.load(open(sys.argv[1])) if len(sys.argv) > 1 else []
LEN = {"whoosh": 0.9, "whoosh_court": 0.5, "impact": 1.8, "scintillement": 3.2, "montee": 2.5, "clic": 0.12, "notification": 0.7}
import re
D = json.loads(re.search(r"window.DEB = (.*);", open(os.path.join(P, "assets/data.js")).read()).group(1))
DUR = D["dur"]
F = [("Inter", 600, "inter-latin"), ("Inter", 800, "inter-latin"), ("Inter", 900, "inter-latin"), ("JetBrains Mono", 500, "jetbrains-mono-latin"), ("JetBrains Mono", 700, "jetbrains-mono-latin")]
ff = "\n".join(f'      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-{w}-normal.woff2") format("woff2"); }}\n      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-ext-{w}-normal.woff2") format("woff2"); unicode-range: U+0100-024F, U+0152-0153, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF; }}' for n, w, p in F)
ends, au = {}, []
for k, (t, n, v) in enumerate(sorted(sfx)):
    tr = 4
    while ends.get(tr, -1) > t: tr += 1
    ends[tr] = t + LEN[n]
    au.append(f'      <audio id="sfx-{k:03d}-{n}" src="assets/sfx/{n}.wav" data-start="{t}" data-duration="{LEN[n]:.2f}" data-track-index="{tr}" data-volume="{v}"></audio>')
html = f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Le Débat · Ép. 2 — Demander pardon à Dieu ? (MIDIGRAD, 9:16)</title>
    <script src="assets/lib/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/debat.css" />
    <style>
{ff}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
      <div id="glow"></div><div id="rays"></div>
      <div id="logo"><img src="assets/logo.png" alt="" /></div>
      <div id="tag">• LE DÉBAT · ÉP. 2</div>
      <div id="phone"><div class="scr"><video id="apotre" class="clip" src="assets/clips/apotre.mp4" muted playsinline data-start="0" data-duration="{round(D['top'][2]['t'] + 0.5, 2)}" data-track-index="0"></video><i class="cam"></i></div><div class="lbl">Apôtre Paris Talla</div></div>
      <div id="top"></div>
      <div id="end"><div class="lg"><img src="assets/logo.png" alt="" /></div><div class="sl"><span>Pas par tes œuvres.</span> <span>Par Sa</span> <span class="o">grâce.</span></div>
        <div class="btn"><span class="ic"><svg viewBox="0 0 48 48" width="34" height="34" fill="#1fa855"><path d="M16 10l24 14-24 14z"/></svg></span><span class="t">Abonne-toi à MIDIGRAD</span></div></div>
      <div id="dave" class="chr"></div>
      <div id="marie" class="chr"></div>
      <div id="bubbles"></div>
      <div id="brand"><img src="assets/logo.png" alt="" />MIDIGRAD</div>
      <audio id="voix" src="assets/dialogue.wav" data-start="0" data-duration="244" data-track-index="3" data-volume="1"></audio>
{chr(10).join(au)}
    </div>
    <script src="assets/data.js"></script>
    <script src="assets/persos.js"></script>
    <script src="assets/debat.js"></script>
    <script>
      window.__timelines["main"] = window.__deb.tl;
    </script>
  </body>
</html>
'''
open(os.path.join(P, "index.html"), "w").write(html)
print(len(au), "sfx")
