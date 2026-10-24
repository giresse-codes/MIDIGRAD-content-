// Décors plats : église MIDIGRAD (Douala, après le culte) en 3 plans + scènes de narration.
// Coordonnées monde = écran 1080×1920 au plan large ; les calques débordent pour la parallaxe.
(function () {
  const chair = (x, y, s = 1, rot = 0, col = "#f4f1ea", back = true) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    ${back ? `<path d="M-50 -120 Q0 -132 50 -120 L54 -20 L-54 -20 Z" fill="${col}" stroke="#d6cfc1" stroke-width="3"/>` : ""}
    <path d="M-62 -22 L62 -22 L66 -6 L-66 -6 Z" fill="${col}" stroke="#d6cfc1" stroke-width="3"/>
    <path d="M-54 -6 L-62 70 M54 -6 L62 70 M-36 -6 L-30 64 M36 -6 L30 64" stroke="#c9c1b2" stroke-width="7" stroke-linecap="round"/></g>`;
  const win = (x) => `<g transform="translate(${x} 470)">
    <path d="M0 80 Q0 0 80 0 Q160 0 160 80 L160 400 L0 400 Z" fill="#bfe6f5"/><path d="M0 80 Q0 0 80 0 Q160 0 160 80 L160 400 L0 400 Z" fill="none" stroke="#a7875e" stroke-width="12"/>
    <path d="M80 0 V400 M0 200 H160" stroke="#a7875e" stroke-width="8"/><path d="M14 380 L60 120" stroke="#fff" stroke-width="10" opacity=".45"/>
    <rect x="-14" y="400" width="188" height="16" rx="4" fill="#c9a676"/></g>`;
  const fan = (x, id) => `<g transform="translate(${x} 0)"><rect x="-4" y="-200" width="8" height="380" fill="#6d665c"/>
    <ellipse cx="0" cy="186" rx="26" ry="12" fill="#5d564d"/><g transform="translate(0 196) scale(1 .22)"><g id="${id}" class="fanblades">
    ${[0, 120, 240].map((a) => `<path d="M0 0 L150 -16 Q180 0 150 16 Z" fill="#8a8073" transform="rotate(${a})"/>`).join("")}<circle r="20" fill="#4d473f"/></g></g></g>`;

  const CHURCH_BG = `<svg viewBox="-260 -200 1600 2300" width="1600" height="2300" style="position:absolute;left:-260px;top:-200px">
    <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ead8b8"/><stop offset="1" stop-color="#f4e8d2"/></linearGradient>
      <linearGradient id="ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff3cf" stop-opacity="0"/></linearGradient></defs>
    <rect x="-260" y="-200" width="1600" height="1500" fill="url(#wall)"/>
    <rect x="-260" y="-200" width="1600" height="230" fill="#d9c29b"/>
    ${[-200, 60, 320, 580, 840, 1100].map((x) => `<rect x="${x}" y="10" width="40" height="40" fill="#c4a87c"/>`).join("")}
    <rect x="-260" y="30" width="1600" height="22" fill="#b89567"/>
    <g transform="translate(0 70)">${win(-150)}${win(1070)}${win(40)}${win(880)}</g>
    <g transform="translate(540 452)"><rect x="-370" y="-62" width="740" height="124" rx="16" fill="#2e3192"/><rect x="-360" y="-52" width="720" height="104" rx="12" fill="none" stroke="#f7941d" stroke-width="5"/>
      <text x="0" y="22" text-anchor="middle" font-family="Inter" font-weight="900" font-size="66" letter-spacing="10" fill="#fff">MIDIGRAD</text>
      <path d="M-370 -62 L-400 -90 M370 -62 L400 -90" stroke="#6d665c" stroke-width="4"/></g>
    <g transform="translate(540 560)"><rect x="-22" y="0" width="44" height="250" rx="6" fill="#a8743f"/><rect x="-100" y="70" width="200" height="40" rx="6" fill="#a8743f"/>
      <rect x="-22" y="0" width="12" height="300" fill="#c8915a"/><rect x="-100" y="70" width="200" height="10" fill="#c8915a"/></g>
    <rect x="-260" y="1060" width="1600" height="1040" fill="#e3dccd"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${-260 + i * 120} 1060 L${-700 + i * 190} 2100" stroke="#d3cab8" stroke-width="3"/>`).join("")}
    ${[1140, 1260, 1420, 1640, 1920].map((y) => `<path d="M-260 ${y} H1340" stroke="#d3cab8" stroke-width="3"/>`).join("")}
    <g class="rays">
      <path d="M-150 590 L50 590 L520 1420 L160 1500 Z" fill="url(#ray)"/><path d="M40 590 L200 590 L700 1300 L420 1380 Z" fill="url(#ray)" opacity=".8"/>
      <path d="M1230 590 L1070 590 L640 1380 L940 1460 Z" fill="url(#ray)"/><path d="M1040 590 L880 590 L460 1300 L720 1360 Z" fill="url(#ray)" opacity=".8"/>
    </g></svg>`;

  const CHURCH_MID = `<svg viewBox="-260 -200 1600 2300" width="1600" height="2300" style="position:absolute;left:-260px;top:-200px">
    ${fan(260, "fanA")}${fan(820, "fanB")}
    <g><rect x="-80" y="960" width="1240" height="30" fill="#b98a55"/><rect x="-80" y="990" width="1240" height="90" fill="#9a6d3e"/>
      <path d="M-80 1000 H1160" stroke="#86592e" stroke-width="4"/>
      <rect x="-80" y="944" width="1240" height="20" fill="#7b1f2b"/></g>
    <g transform="translate(150 800)"><rect x="0" y="40" width="210" height="34" rx="6" fill="#222"/><rect x="8" y="46" width="194" height="18" fill="#f4f1ea"/>
      ${Array.from({ length: 13 }, (_, i) => `<rect x="${14 + i * 14.5}" y="46" width="8" height="11" fill="#222"/>`).join("")}
      <path d="M40 74 L20 150 M170 74 L190 150 M40 74 L190 150 M170 74 L20 150" stroke="#555" stroke-width="7"/></g>
    <g transform="translate(860 820)"><circle cx="0" cy="80" r="68" fill="#f4f1ea" stroke="#2e3192" stroke-width="12"/><circle cx="0" cy="80" r="20" fill="#e7e0d2"/>
      <ellipse cx="-74" cy="10" rx="40" ry="16" fill="#2e3192"/><ellipse cx="60" cy="0" rx="38" ry="15" fill="#2e3192"/>
      <path d="M-120 -60 L-120 140 M120 -70 L120 140" stroke="#777" stroke-width="5"/><ellipse cx="-120" cy="-62" rx="56" ry="9" fill="#e2b84a"/><ellipse cx="120" cy="-72" rx="56" ry="9" fill="#e2b84a"/></g>
    <g transform="translate(540 760)"><path d="M-110 0 L110 0 L90 210 L-90 210 Z" fill="#9a6d3e"/><path d="M-130 -16 L130 -16 L118 10 L-118 10 Z" fill="#b98a55"/>
      <circle cx="0" cy="100" r="42" fill="#fff"/><text x="0" y="114" text-anchor="middle" font-family="Inter" font-weight="900" font-size="38" fill="#2e3192">M</text>
      <path d="M-70 210 L-70 196 M70 210 L70 196" stroke="#7d5530" stroke-width="10"/></g>
    ${chair(80, 1210, 0.9)}${chair(240, 1214, 0.9)}${chair(420, 1206, 0.9, -8)}${chair(600, 1212, 0.9)}${chair(800, 1208, 0.9, 10)}${chair(980, 1212, 0.9)}
    ${chair(-30, 1330, 1)}${chair(150, 1340, 1, 6)}${chair(700, 1350, 1, -14)}${chair(1090, 1336, 1)}
    ${chair(520, 1400, 0.95, 24, "#f4f1ea", false)}
  </svg>`;

  // ── Narration ──────────────────────────────────────────────────────
  const HOME = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <rect width="1080" height="1920" fill="#1b2235"/><rect y="1380" width="1080" height="540" fill="#151a28"/>
    <g transform="translate(560 420)"><rect x="0" y="0" width="420" height="640" rx="10" fill="#0d1426"/>
      <circle cx="300" cy="140" r="54" fill="#e9eef5" opacity=".9"/><circle cx="318" cy="130" r="54" fill="#0d1426"/>
      ${Array.from({ length: 18 }, (_, i) => `<rect x="${20 + (i * 47) % 380}" y="${380 + (i * 71) % 220}" width="${14 + (i % 3) * 8}" height="${10 + (i % 4) * 6}" fill="#f2c14e" opacity="${0.35 + (i % 3) * 0.2}"/>`).join("")}
      <path d="M210 0 V640 M0 320 H420" stroke="#3a4560" stroke-width="12"/><rect x="0" y="0" width="420" height="640" fill="none" stroke="#3a4560" stroke-width="16"/>
      <path d="M-40 -30 Q30 300 -10 700 L-60 700 L-60 -30 Z" fill="#5a1f24" opacity=".9"/></g>
    <path d="M560 1060 L980 1060 L1180 1700 L380 1700 Z" fill="#9fb4d8" opacity=".08"/>
    <g transform="translate(120 1120)"><rect x="0" y="0" width="300" height="20" rx="6" fill="#2a3047"/><rect x="40" y="20" width="16" height="260" fill="#2a3047"/><rect x="240" y="20" width="16" height="260" fill="#2a3047"/>
      <rect x="60" y="-70" width="70" height="70" rx="8" fill="#e9eef5" opacity=".2"/></g>
  </svg>`;
  const ECG = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <rect width="1080" height="1920" fill="#0e1420"/>
    <g transform="translate(110 520)"><rect width="860" height="560" rx="40" fill="#1d2433"/><rect x="40" y="40" width="780" height="480" rx="20" fill="#05090f"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M${40 + i * 65} 40 V520" stroke="#0f2a1c" stroke-width="2"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<path d="M40 ${40 + i * 60} H820" stroke="#0f2a1c" stroke-width="2"/>`).join("")}
      <path id="ecgline" d="M40 300 H200 l20 -10 l20 10 H300 l14 30 l22 -170 l22 220 l18 -80 H470 l24 -20 l24 20 H640 l14 30 l22 -170 l22 220 l18 -80 H820" fill="none" stroke="#3ee07a" stroke-width="6" stroke-linejoin="round" stroke-dasharray="2200" stroke-dashoffset="2200"/>
      <text x="80" y="110" font-family="JetBrains Mono" font-weight="700" font-size="34" fill="#3ee07a">♥ 48</text><text x="660" y="110" font-family="JetBrains Mono" font-size="28" fill="#2b8a50">ECG</text></g>
  </svg>`;
  const STREET = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <rect width="1080" height="1920" fill="#3c4a63"/><rect y="0" width="1080" height="900" fill="#55698a"/>
    <g transform="translate(460 520)"><rect width="560" height="900" fill="#d9cdb6"/><rect x="0" y="0" width="560" height="40" fill="#b9a988"/>
      <rect x="70" y="110" width="420" height="96" rx="10" fill="#2e3192"/><text x="280" y="178" text-anchor="middle" font-family="Inter" font-weight="900" font-size="58" letter-spacing="8" fill="#fff">MIDIGRAD</text>
      <rect x="190" y="560" width="180" height="340" rx="8" fill="#f2c14e" opacity=".9"/><rect x="190" y="560" width="180" height="340" rx="8" fill="none" stroke="#7d5a2b" stroke-width="10"/>
      <rect x="40" y="300" width="110" height="150" fill="#f2c98a" opacity=".7"/><rect x="410" y="300" width="110" height="150" fill="#f2c98a" opacity=".7"/></g>
    <rect y="1420" width="1080" height="500" fill="#2f394d"/><path d="M0 1500 H1080" stroke="#4a566e" stroke-width="6"/>
  </svg>`;
  const CORRIDOR = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <defs><radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe3a8"/><stop offset=".5" stop-color="#f2b25e"/><stop offset="1" stop-color="#f2b25e" stop-opacity="0"/></radialGradient></defs>
    <rect width="1080" height="1920" fill="#262b38"/>
    <path d="M0 0 L420 640 L420 1240 L0 1920 Z" fill="#323848"/><path d="M1080 0 L660 640 L660 1240 L1080 1920 Z" fill="#2c3241"/>
    <path d="M0 1920 L420 1240 L660 1240 L1080 1920 Z" fill="#3a4152"/><path d="M0 0 L420 640 L660 640 L1080 0 Z" fill="#20242f"/>
    <rect x="420" y="640" width="240" height="600" fill="#f7cf86"/><circle cx="540" cy="940" r="420" fill="url(#warm)" opacity=".75"/>
    <g class="apotre" transform="translate(540 1240)"><path d="M-46 0 L-40 -190 Q-40 -236 0 -240 Q40 -236 40 -190 L46 0 Z" fill="#1a1612"/><circle cx="0" cy="-270" r="34" fill="#1a1612"/>
      <path d="M-44 -200 L-64 -60 M44 -200 L64 -60" stroke="#1a1612" stroke-width="24" stroke-linecap="round"/></g>
  </svg>`;
  window.DECOR = { CHURCH_BG, CHURCH_MID, HOME, ECG, STREET, CORRIDOR };
})();
