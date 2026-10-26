// Décors des nouvelles scènes (SVG plat, même style que la narration) : rue de Douala, couloir d'hôpital, porte de la chambre,
// salon familial lumineux (naissance). Les éléments animés (motos, passants, porte, rayons) portent une classe.
(function () {
  const rng = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  // ── Rue : façades de l'autre côté de la chaussée (calque arrière), chaussée (milieu), trottoir (avant) ──
  const COLS = ["#e8c07a", "#8fc1b5", "#e7a4a0", "#f2e2c4", "#b9c7e0", "#e9b36a", "#c9d9a6", "#f0cfa0"];
  const SIGNS = [["ALIMENTATION", "#c0392b"], ["CALL BOX", "#1f6fb2"], ["COIFFURE DAMES", "#8e44ad"], ["QUINCAILLERIE", "#2e7d32"],
    ["PHARMACIE", "#1b9e5a"], ["BOUTIQUE MODE", "#d35400"], ["CHEZ MAMA", "#7b1f2b"], ["BOULANGERIE", "#a0522d"]];
  let fac = "", x = -120;
  for (let i = 0; i < 9; i++) {
    const w = 230 + Math.round(rng() * 70), h = 420 + Math.round(rng() * 230), c = COLS[i % COLS.length], [sg, sc] = SIGNS[i % SIGNS.length], top = 1010 - h;
    fac += `<g transform="translate(${x} ${top})"><rect width="${w}" height="${h}" fill="${c}"/><rect width="${w}" height="16" fill="#00000018"/>`;
    for (let r = 0; r < Math.floor((h - 230) / 110); r++) for (let k = 0; k < 2; k++)
      fac += `<rect x="${30 + k * (w / 2)}" y="${40 + r * 110}" width="${w / 2 - 60}" height="70" rx="4" fill="#5b6f86" opacity=".75"/><rect x="${30 + k * (w / 2)}" y="${104 + r * 110}" width="${w / 2 - 60}" height="8" fill="#ffffff55"/>`;
    if (i % 3 === 1) fac += `<rect x="${w - 70}" y="60" width="44" height="30" rx="3" fill="#dcdcdc"/><rect x="${w - 66}" y="64" width="36" height="22" fill="#bdbdbd"/>`;
    fac += `<rect x="12" y="${h - 230}" width="${w - 24}" height="54" rx="6" fill="#fff"/><text x="${w / 2}" y="${h - 192}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${sg.length > 12 ? 21 : 26}" letter-spacing="1.5" fill="${sc}">${sg}</text>`;
    if (sg === "PHARMACIE") fac += `<g transform="translate(${w - 36} ${h - 203})"><rect x="-6" y="-18" width="12" height="36" fill="#1b9e5a"/><rect x="-18" y="-6" width="36" height="12" fill="#1b9e5a"/></g>`;
    fac += `<path d="M0 ${h - 168} H${w} L${w - 14} ${h - 128} H14 Z" fill="${sc}"/>`;
    for (let k = 0; k < w; k += 36) fac += `<path d="M${k} ${h - 168} H${k + 18} L${k + 16} ${h - 128} H${k + 2} Z" fill="#ffffff" opacity=".55"/>`;
    fac += `<rect x="24" y="${h - 126}" width="${w - 48}" height="126" fill="#2b2622"/><rect x="34" y="${h - 112}" width="${w / 2 - 44}" height="96" fill="#6d5844"/>`;
    for (let k = 0; k < 5; k++) fac += `<rect x="${40 + k * 18}" y="${h - 100 + (k % 2) * 30}" width="14" height="22" fill="${COLS[(i + k) % COLS.length]}"/>`;
    fac += `</g>`;
    x += w + 6;
  }
  const palm = (px, s) => `<g transform="translate(${px} 1010) scale(${s})"><path d="M0 0 Q-10 -200 14 -380" stroke="#7a5b3a" stroke-width="18" fill="none"/>
    ${[-70, -30, 10, 50, 90, 140].map((a) => `<path d="M14 -380 q${Math.cos((a * Math.PI) / 180) * 70} ${-40 + Math.sin((a * Math.PI) / 180) * 50} ${Math.cos((a * Math.PI) / 180) * 160} ${Math.sin((a * Math.PI) / 180) * 120}" stroke="#3f8a4a" stroke-width="16" fill="none" stroke-linecap="round"/>`).join("")}</g>`;
  const wires = `<path d="M-200 300 Q500 380 1900 290" stroke="#2a2a2a" stroke-width="3" fill="none"/><path d="M-200 340 Q500 420 1900 330" stroke="#2a2a2a" stroke-width="2" fill="none"/>`;
  const STREET_BACK = `<svg viewBox="-200 0 2100 1920" width="2100" height="1920" style="position:absolute;left:-200px;top:0">
    ${fac}${palm(560, 1)}${palm(1320, 0.9)}${wires}
    <rect x="-200" y="1010" width="2100" height="26" fill="#cbbfa8"/><rect x="-200" y="1036" width="2100" height="10" fill="#9a8f7c"/></svg>`;
  const moto = (cls, col, back) => `<g class="${cls}"><circle cx="-46" cy="0" r="26" fill="#1c1c1c"/><circle cx="-46" cy="0" r="10" fill="#777"/><circle cx="50" cy="0" r="26" fill="#1c1c1c"/><circle cx="50" cy="0" r="10" fill="#777"/>
    <path d="M-60 -20 L-10 -44 L40 -44 L64 -16 L30 -10 L-30 -10 Z" fill="${col}"/><path d="M40 -44 L58 -78" stroke="#333" stroke-width="7"/><path d="M50 -78 h20" stroke="#333" stroke-width="7" stroke-linecap="round"/>
    <path d="M-6 -46 Q-8 -110 14 -132 Q34 -112 30 -46 Z" fill="#3a4a6a"/><circle cx="14" cy="-150" r="20" fill="${back ? "#c0392b" : "#e7b64a"}"/><path d="M26 -110 L56 -80" stroke="#3a4a6a" stroke-width="14" stroke-linecap="round"/>
    ${back ? `<path d="M-46 -46 Q-50 -104 -30 -122 Q-12 -104 -14 -46 Z" fill="#7b1f2b"/><circle cx="-30" cy="-140" r="18" fill="#4a2c1c"/>` : ""}</g>`;
  const taxi = `<g class="taxi"><path d="M-150 -20 L-130 -70 L-60 -110 L70 -110 L120 -70 L160 -60 L160 -10 L-150 -10 Z" fill="#f2c318"/><path d="M-50 -100 L60 -100 L100 -70 L-110 -70 Z" fill="#7fa6c4"/>
    <rect x="-150" y="-40" width="310" height="8" fill="#1c1c1c" opacity=".7"/><circle cx="-90" cy="-6" r="28" fill="#1c1c1c"/><circle cx="100" cy="-6" r="28" fill="#1c1c1c"/><circle cx="-90" cy="-6" r="11" fill="#888"/><circle cx="100" cy="-6" r="11" fill="#888"/>
    <rect x="-20" y="-126" width="54" height="16" rx="4" fill="#fff"/><text x="7" y="-113" text-anchor="middle" font-family="Inter" font-weight="900" font-size="12" fill="#222">TAXI</text></g>`;
  const STREET_ROAD = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0;overflow:visible">
    <rect x="-600" y="1046" width="2400" height="250" fill="#5d5a57"/><path d="M-600 1170 H1800" stroke="#e9e3d2" stroke-width="8" stroke-dasharray="70 60"/>
    <g transform="translate(0 1150)">${moto("m1", "#c0392b", true)}</g><g transform="translate(0 1250)">${taxi}</g><g transform="translate(0 1140)">${moto("m2", "#2e5aa8", false)}</g><g transform="translate(0 1260)">${moto("m3", "#e7b64a", true)}</g></svg>`;
  let slabs = ""; for (let k = -600; k < 2400; k += 180) slabs += `<path d="M${k} 1330 L${k - 60} 1920" stroke="#bdb3a2" stroke-width="4"/>`;
  const STREET_FRONT = `<svg viewBox="-200 0 2400 1920" width="2400" height="1920" style="position:absolute;left:-200px;top:0">
    <rect x="-200" y="1296" width="2400" height="40" fill="#a59c8c"/><rect x="-200" y="1336" width="2400" height="600" fill="#d8cfbd"/>${slabs}
    <rect x="-200" y="1296" width="2400" height="10" fill="#8a8173"/>
    <g transform="translate(1380 1330)"><rect x="-8" y="-640" width="16" height="660" fill="#6c6c6c"/><rect x="-60" y="-660" width="120" height="70" rx="8" fill="#1f6fb2"/><text x="0" y="-614" text-anchor="middle" font-family="Inter" font-weight="900" font-size="26" fill="#fff">ARRÊT</text></g>
    <g transform="translate(1860 1500)"><rect x="-80" y="-120" width="160" height="10" fill="#7a4a2c"/><rect x="-70" y="-110" width="10" height="110" fill="#7a4a2c"/><rect x="60" y="-110" width="10" height="110" fill="#7a4a2c"/>
      <circle cx="-40" cy="-136" r="18" fill="#f2a33a"/><circle cx="-4" cy="-136" r="18" fill="#e74c3c"/><circle cx="32" cy="-136" r="18" fill="#f2c14e"/></g></svg>`;
  const SKY = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0"><defs>
    <linearGradient id="stsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fcdf0"/><stop offset=".6" stop-color="#d9eef7"/><stop offset="1" stop-color="#fde9c0"/></linearGradient>
    <radialGradient id="stsun"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#fff1b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></radialGradient></defs>
    <rect width="1080" height="1920" fill="url(#stsky)"/><circle cx="900" cy="230" r="260" fill="url(#stsun)"/><circle cx="900" cy="230" r="70" fill="#fffbe8"/>
    <g fill="#fff" opacity=".8"><ellipse cx="220" cy="300" rx="160" ry="40"/><ellipse cx="320" cy="280" rx="100" ry="46"/></g></svg>`;
  const passer = (cls, body, head) => `<g class="${cls}"><path d="M-40 0 L-30 -220 Q-30 -260 0 -262 Q30 -260 30 -220 L40 0 Z" fill="${body}"/><circle cx="0" cy="-300" r="36" fill="${head}"/>
    <path class="pa" d="M-28 -230 L-60 -110" stroke="${body}" stroke-width="22" stroke-linecap="round"/><path class="pb" d="M28 -230 L60 -110" stroke="${body}" stroke-width="22" stroke-linecap="round"/>
    <path class="la" d="M-16 -10 L-26 140" stroke="#2b2b3a" stroke-width="28" stroke-linecap="round"/><path class="lb" d="M16 -10 L26 140" stroke="#2b2b3a" stroke-width="28" stroke-linecap="round"/></g>`;
  const BIBLE = `<g><rect x="-34" y="-46" width="68" height="92" rx="7" fill="#141414"/><rect x="-30" y="-42" width="5" height="84" fill="#2a2a2a"/><path d="M6 -14 v30 M-6 -2 h24" stroke="#c9a14a" stroke-width="5"/></g>`;

  // ── Couloir d'hôpital (perspective centrale) ──
  const doors = (side) => [0, 1, 2, 3].map((i) => {
    const t = [0.16, 0.42, 0.62, 0.76][i], s = 1 - t, X = side < 0 ? 540 - 540 * s : 540 + 540 * s, w = 120 * s, top = 760 - 560 * s, bot = 1180 + 600 * s;
    const x0 = side < 0 ? X + 40 * s : X - 40 * s - w;
    return `<path d="M${x0} ${top + 120 * s} L${x0 + w} ${top + (side < 0 ? 150 : 90) * s} L${x0 + w} ${bot - (side < 0 ? 90 : 40) * s} L${x0} ${bot - 60 * s} Z" fill="${["#7fa8c9", "#c9a27a"][i % 2]}"/>
      <rect x="${x0 + w * 0.3}" y="${top + 60 * s}" width="${w * 0.4}" height="${26 * s}" rx="4" fill="#fff"/><text x="${x0 + w * 0.5}" y="${top + 80 * s}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${18 * s}" fill="#335">${10 + i * 2 + (side > 0 ? 1 : 0)}</text>`;
  }).join("");
  let lights = ""; for (let i = 0; i < 6; i++) { const s = 1 - [0, 0.3, 0.5, 0.64, 0.74, 0.81][i]; lights += `<rect x="${540 - 170 * s}" y="${700 - 640 * s}" width="${340 * s}" height="${44 * s}" rx="${8 * s}" fill="#fbfdff"/>`; }
  let refl = ""; for (let i = 0; i < 6; i++) { const s = 1 - [0, 0.3, 0.5, 0.64, 0.74, 0.81][i]; refl += `<ellipse cx="540" cy="${1240 + 620 * s}" rx="${170 * s}" ry="${30 * s}" fill="#ffffff" opacity=".35"/>`; }
  const CORRIDOR2 = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <defs><linearGradient id="cflo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d4d2"/><stop offset="1" stop-color="#e3e9e7"/></linearGradient></defs>
    <rect width="1080" height="1920" fill="#e6f0ec"/>
    <path d="M0 0 L470 700 L470 1180 L0 1920 Z" fill="#dcebe5"/><path d="M1080 0 L610 700 L610 1180 L1080 1920 Z" fill="#d3e4dd"/>
    <path d="M0 0 L470 700 L610 700 L1080 0 Z" fill="#f4f7f6"/><path d="M0 1920 L470 1180 L610 1180 L1080 1920 Z" fill="url(#cflo)"/>
    <path d="M0 1500 L470 1050 M1080 1500 L610 1050" stroke="#9fb9b0" stroke-width="10"/><path d="M0 1560 L470 1080 M1080 1560 L610 1080" stroke="#b9cdc6" stroke-width="4"/>
    ${lights}${refl}${doors(-1)}${doors(1)}
    <rect x="470" y="700" width="140" height="480" fill="#fdfbf2"/>
    <g transform="translate(540 610)"><rect x="-150" y="-36" width="300" height="60" rx="8" fill="#1f6fb2"/><text x="0" y="6" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" letter-spacing="3" fill="#fff">CARDIOLOGIE</text></g>
    <g opacity=".5" transform="translate(500 1180) scale(.28)">${passer("nurse", "#9fd0c6", "#5a3a26")}</g></svg>`;
  const DOOR = `<svg viewBox="0 0 1080 1920" width="1080" height="1920" style="position:absolute;inset:0">
    <rect width="1080" height="1920" fill="#dcebe5"/><rect x="200" y="300" width="680" height="1500" fill="#fffaf0"/>
    <rect x="160" y="270" width="760" height="40" fill="#b9cdc6"/><rect x="160" y="270" width="40" height="1650" fill="#b9cdc6"/><rect x="880" y="270" width="40" height="1650" fill="#b9cdc6"/>
    <g class="leaf"><rect x="200" y="310" width="680" height="1610" fill="#7fa8c9"/><rect x="250" y="370" width="580" height="560" rx="10" fill="#8fb6d4"/><rect x="250" y="1000" width="580" height="800" rx="10" fill="#8fb6d4"/>
      <rect x="440" y="440" width="200" height="70" rx="8" fill="#fff"/><text x="540" y="488" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#335">CHAMBRE 12</text>
      <rect x="800" y="1040" width="30" height="120" rx="12" fill="#c9ced6"/><rect x="760" y="1080" width="70" height="24" rx="10" fill="#e9edf2"/></g>
    <rect x="0" y="1800" width="1080" height="120" fill="#c9d4d2"/></svg>`;

  // ── Salon familial lumineux (naissance) ──
  let rays = ""; for (let i = 0; i < 7; i++) rays += `<path d="M870 420 L${-200 + i * 170} 1920 L${-120 + i * 170} 1920 Z" fill="#fff4cc"/>`;
  const BABYROOM = `<svg viewBox="-80 0 1240 1920" width="1240" height="1920" style="position:absolute;left:-80px;top:0">
    <defs><linearGradient id="brw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d79c"/><stop offset="1" stop-color="#f0c27a"/></linearGradient>
      <radialGradient id="brg" cx="70%" cy="22%" r="70%"><stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <rect x="-80" width="1240" height="1920" fill="url(#brw)"/>
    <g transform="translate(700 250)"><rect width="340" height="520" rx="10" fill="#fff8e2"/><path d="M170 0 V520 M0 260 H340" stroke="#e9c48a" stroke-width="14"/><rect width="340" height="520" rx="10" fill="none" stroke="#c99a5a" stroke-width="16"/>
      <path d="M-40 -20 Q20 260 -30 560 L-90 560 L-90 -20 Z" fill="#7b1f2b"/><path d="M380 -20 Q320 260 370 560 L430 560 L430 -20 Z" fill="#7b1f2b"/>
      <path d="M-40 -20 Q20 260 -30 560" stroke="#e7b64a" stroke-width="8" fill="none"/><path d="M380 -20 Q320 260 370 560" stroke="#e7b64a" stroke-width="8" fill="none"/></g>
    <g transform="translate(70 330)"><rect width="180" height="140" rx="8" fill="#8a5a32"/><rect x="14" y="14" width="152" height="112" fill="#f3e2c0"/><circle cx="70" cy="70" r="26" fill="#7a4a2c"/><circle cx="112" cy="74" r="24" fill="#5a3a26"/></g>
    <g transform="translate(300 380)"><rect width="140" height="110" rx="8" fill="#8a5a32"/><rect x="12" y="12" width="116" height="86" fill="#f3e2c0"/><path d="M40 80 Q70 30 100 80" fill="#e7b64a"/></g>
    <g class="rays" opacity=".45">${rays}</g><rect x="-80" width="1240" height="1920" fill="url(#brg)"/>
    <rect x="-80" y="1500" width="1240" height="420" fill="#c98f52"/><path d="M-80 1500 H1160" stroke="#b07a42" stroke-width="10"/>
    <g transform="translate(160 1180)"><rect width="800" height="250" rx="40" fill="#8a3a2a"/><rect x="0" y="-150" width="800" height="200" rx="60" fill="#a0483a"/></g></svg>`;
  const BABY = `<svg viewBox="-110 -80 220 160" width="220" height="160" style="overflow:visible"><defs>${""}<pattern id="bbw" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#7b1f2b"/><path d="M15 3 l6 12 -6 12 -6 -12z" fill="#e7b64a"/></pattern></defs>
    <path d="M-100 0 Q-96 -46 -40 -52 L70 -40 Q104 -30 100 4 Q96 44 40 50 L-50 50 Q-100 44 -100 0Z" fill="url(#bbw)"/><path d="M-100 0 Q-96 -46 -40 -52" stroke="#e7b64a" stroke-width="5" fill="none"/>
    <ellipse cx="62" cy="-6" rx="34" ry="32" fill="#8a5434"/><path d="M40 -32 Q64 -52 92 -26 Q72 -40 40 -32Z" fill="#f2e2c4"/>
    <path d="M52 -8 q5 4 10 0 M70 -8 q5 4 10 0" stroke="#3a1a10" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M62 10 q4 3 8 0" stroke="#5a2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="80" cy="4" r="5" fill="#c86a5a" opacity=".35"/><g class="bhand"><circle cx="26" cy="-30" r="9" fill="#8a5434"/></g></svg>`;
  window.SCENES = { SKY, STREET_BACK, STREET_ROAD, STREET_FRONT, passer, BIBLE, CORRIDOR2, DOOR, BABYROOM, BABY };
})();
