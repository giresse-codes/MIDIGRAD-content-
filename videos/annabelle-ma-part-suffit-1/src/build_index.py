# Génère index.html (+ texture de grain). Usage : python3 build_index.py
import json, os, re
import numpy as np
from PIL import Image
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.loads(re.search(r"window.FILM = (.*);", open(os.path.join(P, "assets/data.js")).read()).group(1))
g = np.random.default_rng(5).normal(128, 60, (256, 256)).clip(0, 255).astype(np.uint8)
Image.fromarray(g, "L").save(os.path.join(P, "assets/grain.png"))
F = [("Inter", 600, "inter-latin"), ("Inter", 800, "inter-latin"), ("Inter", 900, "inter-latin"), ("JetBrains Mono", 500, "jetbrains-mono-latin"), ("JetBrains Mono", 700, "jetbrains-mono-latin")]
ff = "\n".join(f'      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-{w}-normal.woff2") format("woff2"); }}\n      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-ext-{w}-normal.woff2") format("woff2"); unicode-range: U+0100-024F, U+0152-0153, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF; }}' for n, w, p in F)
html = f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Ma part suffit — Annabelle, partie 1 (MIDIGRAD, 9:16)</title>
    <script src="assets/lib/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/film.css" />
    <style>
{ff}
      #grain {{ background-image: url("assets/grain.png"); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{D['dur']}" data-width="1080" data-height="1920">
      <div id="world"><div id="bg" class="layer"><div id="dust"></div></div><div id="mid" class="layer"></div><div id="front" class="layer"></div></div>
      <div id="grade"><div id="warm"></div><div id="cool"></div></div>
      <div id="cards"></div>
      <div id="bubbles"></div>
      <div id="hud"><div id="logo"><img src="assets/logo-midigrad.png" alt="" /></div><div id="tag">• LE DÉBAT</div><div id="brand"><img src="assets/logo-midigrad.png" alt="" />MIDIGRAD</div></div>
      <div id="narr">
        <div id="s-home" class="scene"></div><div id="s-ecg" class="scene"></div><div id="s-street" class="scene"></div><div id="s-corr" class="scene"></div>
        <div id="cold"></div>
        <div id="typed"></div>
        <div id="diag"><div class="k">DIAGNOSTIC</div><div class="v">INSUFFISANCE CARDIAQUE</div></div>
        <div id="suite">À SUIVRE…</div>
        <div id="subs"></div>
        <div id="grain"></div>
        <div class="bar t"></div><div class="bar b"></div>
      </div>
      <div id="fin"><img src="assets/logo-midigrad.png" alt="" /></div>
      <div id="black"></div>
      <audio id="voix" src="assets/audio.wav" data-start="0" data-duration="{D['dur']}" data-track-index="1" data-volume="1"></audio>
    </div>
    <script src="assets/data.js"></script>
    <script src="assets/rig.js"></script>
    <script src="assets/decor.js"></script>
    <script src="assets/film.js"></script>
    <script>
      window.__timelines = window.__timelines || {{}};
      window.__timelines["main"] = window.__film.tl;
    </script>
  </body>
</html>
'''
open(os.path.join(P, "index.html"), "w").write(html)
print("ok", D["dur"])
