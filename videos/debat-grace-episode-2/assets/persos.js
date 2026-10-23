// Personnages plats (SVG) : Dave et Marie, visages à expressions interchangeables.
(function () {
  const SKIN = { dave: "#6e3f22", marie: "#7d4a2b" }, SK2 = { dave: "#5a311a", marie: "#663a20" };
  const HAIR = "#1a1210";

  // ── Visage ──────────────────────────────────────────────────────────
  // e : { eyes, look:[dx,dy], brows:[gaucheAngle, gaucheDy, droiteAngle, droiteDy], mouth }
  function face(who, e) {
    const [lx, ly] = e.look || [0, 0];
    const eye = (cx) => {
      const cy = 236;
      switch (e.eyes) {
        case "closed": return `<path d="M${cx - 20} ${cy + 2} Q${cx} ${cy - 16} ${cx + 20} ${cy + 2}" fill="none" stroke="#1a1210" stroke-width="7" stroke-linecap="round"/>`;
        case "happy": return `<path d="M${cx - 20} ${cy + 6} Q${cx} ${cy - 18} ${cx + 20} ${cy + 6}" fill="none" stroke="#1a1210" stroke-width="8" stroke-linecap="round"/>`;
        case "half": return `<circle cx="${cx}" cy="${cy}" r="19" fill="#fff"/><circle cx="${cx + lx}" cy="${cy + 4 + ly}" r="10" fill="#1a1210"/><path d="M${cx - 22} ${cy - 22} H${cx + 22} V${cy - 1} H${cx - 22} Z" fill="${SKIN[who]}"/><path d="M${cx - 21} ${cy - 1} H${cx + 21}" stroke="#1a1210" stroke-width="5" stroke-linecap="round"/>`;
        case "squint": return `<ellipse cx="${cx}" cy="${cy}" rx="19" ry="9" fill="#fff"/><circle cx="${cx + lx}" cy="${cy + ly * 0.4}" r="8" fill="#1a1210"/><path d="M${cx - 21} ${cy - 8} Q${cx} ${cy - 14} ${cx + 21} ${cy - 8}" stroke="#1a1210" stroke-width="5" fill="none" stroke-linecap="round"/>`;
        case "wide": return `<circle cx="${cx}" cy="${cy}" r="25" fill="#fff"/><circle cx="${cx + lx}" cy="${cy + ly}" r="9" fill="#1a1210"/>`;
        default: return `<circle cx="${cx}" cy="${cy}" r="20" fill="#fff"/><circle cx="${cx + lx}" cy="${cy + ly}" r="11" fill="#1a1210"/><circle cx="${cx + lx + 4}" cy="${cy + ly - 4}" r="3.2" fill="#fff"/>`;
      }
    };
    const b = e.brows || [0, 0, 0, 0];
    const brow = (cx, ang, dy, side) => `<path d="M${cx - 24} 196 Q${cx} 186 ${cx + 24} 196" transform="translate(0 ${dy}) rotate(${side * ang} ${cx} 194)" fill="none" stroke="#1a1210" stroke-width="10" stroke-linecap="round"/>`;
    const M = {
      neutral: `<path d="M228 306 Q250 312 272 306" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      flat: `<path d="M230 308 H270" stroke="#3a1a10" stroke-width="7" stroke-linecap="round"/>`,
      smile: `<path d="M222 300 Q250 326 278 300" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      soft: `<path d="M228 304 Q250 318 272 304" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      grin: `<path d="M220 296 Q250 300 280 296 Q276 334 250 336 Q224 334 220 296 Z" fill="#3a1410"/><path d="M226 298 Q250 302 274 298 L272 308 Q250 311 228 308 Z" fill="#fff"/>`,
      laugh: `<path d="M216 292 Q250 296 284 292 Q280 346 250 348 Q220 346 216 292 Z" fill="#3a1410"/><path d="M222 294 Q250 298 278 294 L276 306 Q250 309 224 306 Z" fill="#fff"/><ellipse cx="250" cy="334" rx="16" ry="8" fill="#c2463c"/>`,
      frown: `<path d="M226 314 Q250 298 274 314" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      wavy: `<path d="M226 308 Q238 300 250 308 T274 306" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      open: `<ellipse cx="250" cy="314" rx="16" ry="21" fill="#3a1410"/><ellipse cx="250" cy="324" rx="10" ry="7" fill="#c2463c"/>`,
      pout: `<ellipse cx="250" cy="310" rx="13" ry="9" fill="#5b2318"/><path d="M240 307 Q250 302 260 307" stroke="#3a1a10" stroke-width="4" fill="none"/>`,
      smirk: `<path d="M228 308 Q256 314 276 296" stroke="#3a1a10" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      sigh: `<ellipse cx="250" cy="310" rx="10" ry="8" fill="#3a1410"/>`,
    };
    const lips = who === "marie" ? `<g opacity=".0"></g>` : "";
    return `${eye(205)}${eye(295)}${brow(205, b[0], b[1], 1)}${brow(295, b[2], b[3], -1)}
      <path d="M244 254 Q238 276 244 282 Q250 286 258 282" fill="none" stroke="${SK2[who]}" stroke-width="6" stroke-linecap="round"/>${M[e.mouth || "neutral"]}${lips}`;
  }

  // ── Corps ───────────────────────────────────────────────────────────
  const wax = (id, base, a, b, c) => `<pattern id="${id}" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="${base}"/>
    <circle cx="14" cy="14" r="11" fill="${a}"/><circle cx="14" cy="14" r="5" fill="${c}"/><circle cx="42" cy="42" r="11" fill="${b}"/><circle cx="42" cy="42" r="4.5" fill="${c}"/>
    <path d="M42 6 l6 8 -6 8 -6 -8 z" fill="${c}" opacity=".9"/><path d="M14 34 l6 8 -6 8 -6 -8 z" fill="${a}" opacity=".9"/></pattern>`;

  function dave() {
    const s = SKIN.dave;
    return `<svg viewBox="0 0 500 680"><defs>${wax("wd", "#2b4fb8", "#f5a623", "#f2c94c", "#16307a")}<clipPath id="cd"><path d="M40 700 L40 480 Q40 396 150 378 L250 368 L350 378 Q460 396 460 480 L460 700 Z"/></clipPath></defs>
      <g class="body">
        <path d="M40 700 L40 480 Q40 396 150 378 L250 368 L350 378 Q460 396 460 480 L460 700 Z" fill="#2b4fb8"/>
        <g clip-path="url(#cd)"><rect x="0" y="470" width="500" height="58" fill="url(#wd)"/><rect x="0" y="466" width="500" height="6" fill="#16307a"/><rect x="0" y="526" width="500" height="6" fill="#16307a"/></g>
        <rect x="140" y="580" width="220" height="110" rx="26" fill="#2446a6"/>
        <path d="M150 380 Q250 440 350 380 Q340 360 250 352 Q160 360 150 380 Z" fill="#203f98"/>
        <path d="M222 412 L216 470 M278 412 L284 470" stroke="#f3f1ec" stroke-width="6" stroke-linecap="round"/><circle cx="216" cy="474" r="7" fill="#f3f1ec"/><circle cx="284" cy="474" r="7" fill="#f3f1ec"/>
        <g class="arms-def"></g>
        <g class="x arms-up"><path d="M60 520 Q40 440 70 380" stroke="#2b4fb8" stroke-width="64" stroke-linecap="round" fill="none"/><path d="M440 520 Q460 440 430 380" stroke="#2b4fb8" stroke-width="64" stroke-linecap="round" fill="none"/>
          <g fill="${s}"><rect x="40" y="300" width="60" height="78" rx="28"/><rect x="400" y="300" width="60" height="78" rx="28"/><rect x="36" y="282" width="16" height="44" rx="8"/><rect x="448" y="282" width="16" height="44" rx="8"/></g></g>
      </g>
      <rect x="212" y="320" width="76" height="66" rx="20" fill="${s}"/>
      <g class="head">
        <ellipse cx="146" cy="246" rx="22" ry="30" fill="${s}"/><ellipse cx="354" cy="246" rx="22" ry="30" fill="${s}"/>
        <ellipse cx="250" cy="236" rx="106" ry="122" fill="${s}"/>
        <path d="M144 214 Q140 104 250 100 Q360 104 356 214 Q350 172 322 156 Q250 140 178 156 Q150 172 144 214 Z" fill="${HAIR}"/>
        <path d="M150 210 Q146 150 178 150" stroke="${HAIR}" stroke-width="5" fill="none" opacity=".5"/>
        <g class="faces"></g>
      </g></svg>`;
  }

  function marie() {
    const s = SKIN.marie;
    let braids = "";
    for (let i = 0; i < 7; i++) {
      const xl = 134 + i * 9, xr = 366 - i * 9, len = 300 + (i % 3) * 30;
      braids += `<rect x="${xl - 9}" y="200" width="18" height="${len}" rx="9" fill="${HAIR}"/><rect x="${xr - 9}" y="200" width="18" height="${len}" rx="9" fill="${HAIR}"/>`;
      for (let y = 220; y < 200 + len; y += 22) braids += `<path d="M${xl - 7} ${y} q7 8 14 0 M${xr - 7} ${y} q7 8 14 0" stroke="#3a2a24" stroke-width="3" fill="none"/>`;
    }
    let rows = "";
    for (let i = 0; i < 9; i++) rows += `<path d="M${168 + i * 21} ${150 - Math.abs(i - 4) * 4} Q${170 + i * 20} 110 ${250} 104" stroke="#3a2a24" stroke-width="3" fill="none"/>`;
    return `<svg viewBox="0 0 500 680"><defs>${wax("wm", "#d8a21e", "#8f2d1c", "#2f7d4a", "#f6e7c1")}</defs>
      <g class="body">
        <path d="M54 700 L54 486 Q56 400 160 384 L250 376 L340 384 Q444 400 446 486 L446 700 Z" fill="url(#wm)"/>
        <path d="M200 384 L250 452 L300 384 Z" fill="${s}"/>
        <path d="M196 382 L250 456 L304 382" stroke="#8f2d1c" stroke-width="10" fill="none" stroke-linejoin="round"/>
        <rect x="54" y="620" width="392" height="22" fill="#8f2d1c" opacity=".9"/>
        <g class="x arms-finger"><path d="M420 560 Q470 470 420 400" stroke="#d8a21e" stroke-width="62" stroke-linecap="round" fill="none"/>
          <g fill="${s}"><rect x="384" y="330" width="62" height="74" rx="28"/><rect x="420" y="250" width="18" height="96" rx="9"/></g></g>
        <g class="x arms-cross"><path d="M70 600 Q150 520 400 560" stroke="#c48f14" stroke-width="66" stroke-linecap="round" fill="none"/><path d="M430 590 Q350 520 100 560" stroke="#d8a21e" stroke-width="66" stroke-linecap="round" fill="none"/>
          <g fill="${s}"><ellipse cx="400" cy="556" rx="34" ry="28"/><ellipse cx="102" cy="560" rx="34" ry="28"/></g></g>
      </g>
      <rect x="214" y="318" width="72" height="66" rx="20" fill="${s}"/>
      <g class="braids">${braids}</g>
      <g class="head">
        <ellipse cx="148" cy="248" rx="21" ry="29" fill="${s}"/><ellipse cx="352" cy="248" rx="21" ry="29" fill="${s}"/>
        <ellipse cx="250" cy="238" rx="102" ry="120" fill="${s}"/>
        <path d="M146 220 Q136 96 250 92 Q364 96 354 220 Q340 160 312 150 Q250 136 188 150 Q160 160 146 220 Z" fill="${HAIR}"/>${rows}
        <circle cx="146" cy="300" r="17" fill="none" stroke="#e8b330" stroke-width="6"/><circle cx="354" cy="300" r="17" fill="none" stroke="#e8b330" stroke-width="6"/>
        <g class="faces"></g>
      </g></svg>`;
  }

  window.PERSOS = { face, dave, marie };
})();
