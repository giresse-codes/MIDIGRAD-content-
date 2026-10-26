# Génère index.html. Usage : python3 build_index.py
import json, os, re
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.loads(re.search(r"window.FILM = (.*);", open(os.path.join(P, "assets/data.js")).read()).group(1))
F = [("Inter", 600, "inter-latin"), ("Inter", 800, "inter-latin"), ("Inter", 900, "inter-latin"), ("JetBrains Mono", 500, "jetbrains-mono-latin"), ("JetBrains Mono", 700, "jetbrains-mono-latin")]
ff = "\n".join(f'      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-{w}-normal.woff2") format("woff2"); }}\n      @font-face {{ font-family: "{n}"; font-weight: {w}; src: url("assets/fonts/{p}-ext-{w}-normal.woff2") format("woff2"); unicode-range: U+0100-024F, U+0152-0153, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF; }}' for n, w, p in F)
HOUSE = '''<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
  <defs><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6b8"/><stop offset="1" stop-color="#fff6e6"/></linearGradient></defs>
  <rect width="1080" height="1920" fill="url(#hs)"/><circle cx="820" cy="380" r="120" fill="#fff1c9"/>
  <g transform="translate(120 560)"><rect width="840" height="760" fill="#e9c9a0"/><path d="M-60 0 L420 -260 L900 0 Z" fill="#a8553a"/>
    <rect x="330" y="380" width="180" height="380" rx="10" fill="#7a4a2c"/><circle cx="480" cy="580" r="8" fill="#e7b64a"/>
    <rect x="70" y="200" width="170" height="150" rx="8" fill="#9fd0e6"/><rect x="600" y="200" width="170" height="150" rx="8" fill="#9fd0e6"/>
    <path d="M70 275 H240 M155 200 V350 M600 275 H770 M685 200 V350" stroke="#e9c9a0" stroke-width="8"/></g>
  <rect y="1320" width="1080" height="600" fill="#d9b98a"/><path d="M0 1330 H1080" stroke="#c9a676" stroke-width="8"/>
  <g fill="#6fae5a"><circle cx="70" cy="1300" r="80"/><circle cx="1010" cy="1290" r="90"/><circle cx="150" cy="1330" r="60"/></g></svg>'''
MORNING = '''<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
  <defs><radialGradient id="mg" cx="70%" cy="20%" r="80%"><stop offset="0" stop-color="#fff7d6"/><stop offset=".5" stop-color="#ffe2a8"/><stop offset="1" stop-color="#f7c98a"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#mg)"/>
  <g opacity=".5" fill="#fff8e0">''' + "".join(f'<path d="M780 200 L{-200 + i * 180} 1920 L{-120 + i * 180} 1920 Z"/>' for i in range(8)) + '''</g>
  <rect y="1560" width="1080" height="360" fill="#e8c48d"/></svg>
  <svg id="ecg2" viewBox="0 0 1080 300" width="1080" height="300" style="position:absolute;left:0;top:330px">
  <path d="M0 150 H180 l20 -10 l20 10 H260 l14 30 l22 -150 l22 200 l18 -70 H440 l24 -18 l24 18 H560 l14 30 l22 -150 l22 200 l18 -70 H740 l24 -18 l24 18 H860 l14 30 l22 -150 l22 200 l18 -70 H1080" fill="none" stroke="#3fbf6f" stroke-width="7" stroke-linejoin="round" stroke-dasharray="1600" stroke-dashoffset="1600"/></svg>'''
SKY = '''<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
  <defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3ea"/><stop offset=".55" stop-color="#ffd99a"/><stop offset="1" stop-color="#ffb870"/></linearGradient>
  <radialGradient id="su" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fffbe8"/><stop offset=".4" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#sk)"/><circle cx="540" cy="1250" r="420" fill="url(#su)"/>
  <g fill="#fff" opacity=".85"><ellipse cx="220" cy="420" rx="170" ry="50"/><ellipse cx="320" cy="390" rx="120" ry="60"/><ellipse cx="850" cy="300" rx="150" ry="44"/><ellipse cx="760" cy="280" rx="90" ry="50"/></g>
  <g opacity=".35" fill="#fff6d0">''' + "".join(f'<path d="M540 1250 L{i * 160 - 200} 0 L{i * 160 - 130} 0 Z"/>' for i in range(10)) + '''</g>
  <path d="M0 1560 Q300 1480 540 1540 T1080 1520 V1920 H0Z" fill="#c98f52" opacity=".9"/></svg>'''
html = f'''<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Ma part suffit — Annabelle, partie 2 (MIDIGRAD, 9:16)</title>
    <script src="assets/lib/gsap.min.js"></script>
    <script type="importmap">{{ "imports": {{ "three": "./assets/lib/three.module.min.js" }} }}</script>
    <link rel="stylesheet" href="assets/film.css" />
    <style>
{ff}
      #grain {{ background-image: url("assets/grain.png"); opacity: .05; }}
      #s-church .cl {{ filter: brightness(1.12) saturate(1.05); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{D['dur']}" data-width="1080" data-height="1920">
      <canvas id="gl" width="540" height="960"></canvas>
      <div id="plates"></div>
      <div id="cards"></div>
      <div id="bubbles"></div>
      <div id="narr">
        <div id="s-house" class="scene">{HOUSE}</div>
        <div id="s-morning" class="scene">{MORNING}</div>
        <div id="s-sky" class="scene">{SKY}</div>
        <div id="s-church" class="scene"></div>
        <div id="warmgrade"></div>
        <div id="subs"></div>
        <div id="grain"></div>
      </div>
      <div id="motfin">Pardonne comme Christ<br /><b>t'a pardonné.</b></div>
      <div id="hud"><div id="logo"><img src="assets/logo-midigrad.png" alt="" /></div><div id="tag">• MA PART SUFFIT · PARTIE 2</div>
        <div id="brand"><img src="assets/logo-midigrad.png" alt="" /><span class="bt"><span class="b1">EUD CONSISTOIRE</span><span class="b2">MIDIGRAD</span></span></div></div>
      <div id="white"></div>
      <audio id="voix" src="assets/audio.wav" data-start="0" data-duration="{D['dur']}" data-track-index="1" data-volume="1"></audio>
    </div>
    <script src="assets/data.js"></script>
    <script src="assets/rig.js"></script>
    <script src="assets/decor.js"></script>
    <script src="assets/film2.js"></script>
    <script type="module">
      import {{ createRoom }} from "./assets/room3d.js";
      const room = await createRoom(document.getElementById("gl"), "assets/logo-midigrad.png");
      window.startFilm(room);
    </script>
  </body>
</html>
'''
open(os.path.join(P, "index.html"), "w").write(html)
print("ok", D["dur"])
