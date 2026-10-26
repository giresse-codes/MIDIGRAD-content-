// Personnages articulés (SVG plat). Chaque pièce est un <g> animable : jambes, bassin, torse, bras/avant-bras/mains,
// cou, tête, yeux (blanc, pupille, paupière), sourcils, bouche (formes), larme.
// Repère : boîte 600×900, personnage tourné vers la droite (flip = -1 pour le regarder vers la gauche).
// L'état complet est une fonction pure du temps : RIG.make(...).set(state) applique un état, rien n'est mémorisé.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const HIP = [300, 600], SHA = [225, 365], SHB = [375, 365], UA = 125, FA = 115, NECK = [300, 330];
  const r = (n) => Math.round(n * 100) / 100;

  // pagne bordeaux et or
  const wax = (id, base, a, b) => `<pattern id="${id}" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="${base}"/>
    <path d="M22 4 l9 18 -9 18 -9 -18 z" fill="${a}" opacity=".9"/><circle cx="22" cy="22" r="4" fill="${base}"/><circle cx="0" cy="0" r="6" fill="${b}"/><circle cx="44" cy="44" r="6" fill="${b}"/><circle cx="0" cy="44" r="6" fill="${b}"/><circle cx="44" cy="0" r="6" fill="${b}"/></pattern>`;

  const MOUTHS = {
    // formes de lip-sync
    closed: `<path d="M-18 0 Q0 3 18 0" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    mi: `<path d="M-17 -2 Q0 -5 17 -2 Q0 12 -17 -2 Z" fill="#4a1a14"/><path d="M-10 4 Q0 7 10 4" stroke="#c96a5a" stroke-width="3" fill="none"/>`,
    open: `<path d="M-18 -4 Q0 -8 18 -4 Q14 20 0 22 Q-14 20 -18 -4 Z" fill="#4a1a14"/><path d="M-10 14 Q0 9 10 14 Q0 21 -10 14Z" fill="#c96a5a"/><rect x="-11" y="-5" width="22" height="5" rx="2" fill="#fff"/>`,
    o: `<ellipse cx="0" cy="5" rx="10" ry="13" fill="#4a1a14"/><ellipse cx="0" cy="11" rx="6" ry="4" fill="#c96a5a"/>`,
    i: `<path d="M-21 -2 Q0 -5 21 -2 Q0 9 -21 -2 Z" fill="#4a1a14"/><rect x="-14" y="-3" width="28" height="4" rx="2" fill="#fff"/>`,
    // formes d'expression (bouche au repos)
    smile: `<path d="M-20 -3 Q0 14 20 -3" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    soft: `<path d="M-16 0 Q0 8 16 0" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    pinch: `<path d="M-11 1 Q0 -2 11 1" stroke="#3a1610" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-14 -1 l3 2" stroke="#3a1610" stroke-width="3"/>`,
    frown: `<path d="M-17 5 Q0 -5 17 5" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    tight: `<path d="M-15 1 L15 1" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    // pleurs : lèvres qui frémissent, sanglot retenu, sourire à travers les larmes
    quiver: `<path d="M-17 5 Q-9 -2 -3 1 Q2 -3 6 1 Q11 -2 17 5" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M-9 8 Q0 11 9 8" stroke="#5a2a20" stroke-width="2.5" fill="none" opacity=".6"/>`,
    sob: `<path d="M-17 4 Q0 -6 17 4 Q10 13 0 13 Q-10 13 -17 4 Z" fill="#4a1a14"/><path d="M-17 4 Q0 -6 17 4" stroke="#3a1610" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    smileT: `<path d="M-18 -1 Q0 10 18 -1" stroke="#3a1610" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-8 7 Q0 9 8 7" stroke="#5a2a20" stroke-width="2.5" fill="none" opacity=".5"/>`,
  };

  function make(kind, uid, opt = {}) {
    const A = kind === "annabelle";
    const skin = A ? "#7a4a2c" : "#6a3f25", skinD = A ? "#633a21" : "#56321c";
    const PAL = opt.pal || ["#7b1f2b", "#e7b64a", "#b8862f"], GOWN = "#b9d7e6";
    const H = !A && opt.husband;
    const sleeveU = A ? (opt.gown ? GOWN : `url(#wx${uid})`) : H ? `url(#wx${uid})` : "#1b2647", sleeveF = A ? skin : H ? skin : "#1b2647";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 600 900"); svg.setAttribute("class", "rig " + kind);
    const hand = (cls, extra = "") => `<g class="${cls}"><circle r="23" fill="${skin}"/><ellipse cx="-14" cy="-8" rx="9" ry="13" fill="${skin}" transform="rotate(-30 -14 -8)"/>${extra}</g>`;
    const cuff = A || H ? "" : `<rect x="-22" y="-34" width="44" height="12" rx="5" fill="#e9eef5"/>`;
    const arm = (s, cls, ring) => `<g class="${cls}" data-sx="${s[0]}" data-sy="${s[1]}">
        <path d="M${s[0]} ${s[1]} L${s[0]} ${s[1] + UA}" stroke="${sleeveU}" stroke-width="48" stroke-linecap="round"/>
        ${A ? `<path d="M${s[0] - 24} ${s[1] + 70} L${s[0] + 24} ${s[1] + 70}" stroke="#e7b64a" stroke-width="6"/>` : ""}
        <g class="fa" data-sx="${s[0]}" data-sy="${s[1] + UA}">
          <path d="M${s[0]} ${s[1] + UA} L${s[0]} ${s[1] + UA + FA}" stroke="${sleeveF}" stroke-width="${A ? 36 : H ? 38 : 42}" stroke-linecap="round"/>
          <g transform="translate(${s[0]} ${s[1] + UA + FA + 12})">${cuff}${hand("hand", ring ? `<circle cx="10" cy="-12" r="5" fill="none" stroke="#f2c14e" stroke-width="3.5"/>` : "")}
            ${cls === "armA" && opt.propA ? `<g class="propA">${opt.propA}</g>` : ""}${cls === "armB" && opt.propB ? `<g class="propB">${opt.propB}</g>` : ""}
            ${!A && !H && cls === "armB" ? `<g class="bibHand"><rect x="-30" y="-20" width="60" height="82" rx="6" fill="#141414"/><rect x="-26" y="-16" width="4" height="74" fill="#2a2a2a"/><path d="M4 0 v26 M-6 9 h20" stroke="#c9a14a" stroke-width="4"/></g>` : ""}
            ${A && cls === "armB" && !opt.propB ? `<g class="bagHand"><path d="M-28 10 Q0 -40 28 10" stroke="#3a1a12" stroke-width="7" fill="none"/><rect x="-46" y="8" width="92" height="66" rx="14" fill="#5a1f24"/><rect x="-46" y="30" width="92" height="8" fill="#e7b64a"/></g>` : ""}
          </g>
        </g></g>`;

    // tête
    const fx = 12; // décalage des traits vers le côté regardé (3/4)
    const eye = (cx, side) => `<g class="eye ${side}" data-cx="${cx + fx}" data-cy="232">
        <clipPath id="ec${side}${uid}"><ellipse cx="${cx + fx}" cy="232" rx="18" ry="14"/></clipPath>
        <ellipse cx="${cx + fx}" cy="232" rx="18" ry="14" fill="#fff"/>
        <g clip-path="url(#ec${side}${uid})"><g class="pupil"><circle cx="${cx + fx}" cy="232" r="9" fill="#24130c"/><circle class="shine" cx="${cx + fx + 3}" cy="228" r="3" fill="#fff"/></g>
          <rect class="lid" x="${cx + fx - 20}" y="216" width="40" height="34" fill="${skinD}"/><rect class="lidlo" x="${cx + fx - 20}" y="246" width="40" height="0" fill="${skinD}"/></g>
        <path class="wetline" d="M${cx + fx - 15} 241 Q${cx + fx} 249 ${cx + fx + 15} 241" stroke="#eaf8ff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0"/>
        <path d="M${cx + fx - 18} 232 Q${cx + fx} 214 ${cx + fx + 18} 232" stroke="#24130c" stroke-width="3" fill="none" class="lash"/>
      </g>`;
    const redEye = (cx) => `<ellipse class="red" cx="${cx + fx}" cy="238" rx="30" ry="22" fill="url(#rd${uid})" opacity="0"/>`;
    const drop = (cx, k) => `<g class="drop d${k}" opacity="0"><path class="trail" d="M${cx + fx - 6} 247 Q${cx + fx - 12} 285 ${cx + fx - 4} 330" stroke="#dff3ff" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="90" stroke-dashoffset="90" opacity=".55"/>
        <path class="trail2" d="M${cx + fx - 5} 247 Q${cx + fx - 11} 285 ${cx + fx - 3} 330" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-dasharray="90" stroke-dashoffset="90" opacity=".8"/>
        <g class="bead"><path d="M0 -8 Q6 2 4 6 Q0 10 -4 6 Q-6 2 0 -8Z" fill="url(#dr${uid})"/><circle cx="-1.5" cy="2" r="1.6" fill="#fff"/></g></g>`;
    const brow = (cx, side) => `<g class="brow ${side}" data-cx="${cx + fx}" data-cy="203"><path d="M${cx + fx - 17} 205 Q${cx + fx} 196 ${cx + fx + 17} 203" stroke="#1d110b" stroke-width="${A ? 6 : 8}" fill="none" stroke-linecap="round"/></g>`;
    const mouths = Object.entries(MOUTHS).map(([k, v]) => `<g class="m m-${k}" style="display:none">${v}</g>`).join("");
    const hair = A
      ? `<path d="M212 200 Q206 112 300 104 Q394 112 388 200 Q380 160 300 150 Q220 160 212 200Z" fill="#1a1210"/>
         ${opt.gown ? `<circle cx="300" cy="104" r="34" fill="#1a1210"/>` : `<g class="wrap"><path d="M206 176 Q200 70 300 58 Q402 70 394 176 Q380 128 300 124 Q220 128 206 176Z" fill="url(#wx${uid})"/>
         <path d="M300 60 Q252 18 236 54 Q262 76 300 70 Q338 76 364 54 Q348 18 300 60Z" fill="${PAL[0]}"/><circle cx="300" cy="62" r="13" fill="${PAL[1]}"/>
         <path d="M206 176 Q300 150 394 176" stroke="${PAL[1]}" stroke-width="7" fill="none"/></g>`}
         ${opt.elder ? `<path d="M212 206 Q214 186 222 176 M388 206 Q386 186 378 176" stroke="#cfcac4" stroke-width="7" fill="none"/>` : ""}`
      : H ? `<path d="M216 206 Q210 122 300 116 Q392 122 386 206 Q378 160 300 152 Q222 160 216 206Z" fill="#151010"/>`
      : `<path d="M216 210 Q210 126 300 120 Q392 126 386 210 Q378 168 300 160 Q222 168 216 210Z" fill="#221814"/>
         <path d="M216 210 Q214 178 226 160" stroke="#8d8a86" stroke-width="7" fill="none"/><path d="M386 210 Q388 178 376 160" stroke="#8d8a86" stroke-width="7" fill="none"/>`;
    const beard = A ? "" : H ? `<path d="M226 262 Q232 326 306 330 Q372 326 380 262 Q368 300 306 302 Q240 300 226 262Z" fill="#1d1612" opacity=".85"/>` : `<path d="M222 252 Q226 330 306 336 Q378 330 384 252 Q372 300 306 304 Q236 300 222 252Z" fill="#3b3430"/>
      <path d="M240 280 Q300 320 368 280" stroke="#9b9690" stroke-width="3" fill="none" opacity=".7"/><path d="M262 300 Q306 316 350 300" stroke="#a7a29c" stroke-width="3" fill="none" opacity=".6"/>`;
    const glasses = A || H ? "" : `<g fill="none" stroke="#2a2a2a" stroke-width="4"><rect x="${255 + fx - 24}" y="216" width="48" height="34" rx="12"/><rect x="${345 + fx - 24}" y="216" width="48" height="34" rx="12"/><path d="M${255 + fx + 24} 228 Q${300 + fx} 220 ${345 + fx - 24} 228"/></g>`;
    const earrings = A ? `<circle cx="220" cy="270" r="8" fill="#f2c14e"/><circle cx="220" cy="286" r="5" fill="#f2c14e"/>` : "";

    // torse
    const torso = A && opt.gown
      ? `<path d="M206 360 Q300 330 394 360 L414 600 Q300 636 186 600 Z" fill="${GOWN}"/>
         <path d="M258 344 Q300 392 342 344" stroke="#8fb6cc" stroke-width="7" fill="none"/>
         ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${240 + (i % 3) * 60}" cy="${430 + Math.floor(i / 3) * 80}" r="5" fill="#8fb6cc"/>`).join("")}`
      : A
      ? `<path d="M206 360 Q300 330 394 360 L414 600 Q300 636 186 600 Z" fill="url(#wx${uid})"/>
         <path d="M262 342 Q300 380 338 342" stroke="${PAL[1]}" stroke-width="7" fill="none"/>
         <path d="M196 520 Q300 548 404 520" stroke="${PAL[0]}" stroke-width="16" fill="none"/>`
      : H ? `<path d="M200 362 Q300 330 400 362 L416 600 Q300 630 184 600 Z" fill="url(#wx${uid})"/><path d="M262 342 L300 392 L338 342" stroke="${PAL[1]}" stroke-width="7" fill="none"/>
         <path d="M300 392 L300 600" stroke="${PAL[1]}" stroke-width="4"/><circle cx="300" cy="440" r="4" fill="${PAL[1]}"/><circle cx="300" cy="500" r="4" fill="${PAL[1]}"/>`
      : `<path d="M200 362 Q300 330 400 362 L416 600 Q300 630 184 600 Z" fill="#1b2647"/>
         <path d="M268 340 L300 470 L332 340 Z" fill="#e9eef5"/><path d="M300 470 L300 600" stroke="#141c36" stroke-width="3"/>
         <path d="M268 340 L300 470 L250 400 Z" fill="#26335c"/><path d="M332 340 L300 470 L350 400 Z" fill="#26335c"/>
         <circle cx="304" cy="510" r="5" fill="#0f1529"/><circle cx="304" cy="556" r="5" fill="#0f1529"/>`;
    // jambes assises / debout
    const legsSeat = A
      ? `<path d="M232 560 L470 584 Q492 600 488 640 L500 852 L400 852 L410 650 L240 660 Z" fill="url(#wx${uid})"/><path d="M402 830 L500 830" stroke="#e7b64a" stroke-width="6"/>
         <ellipse cx="470" cy="866" rx="40" ry="16" fill="#3a1a12"/>`
      : `<path d="M230 560 L460 580 Q486 590 484 630 L486 846 L424 846 L424 650 L240 660 Z" fill="#17203d"/>
         <ellipse cx="470" cy="862" rx="46" ry="17" fill="#111"/>`;
    const legStand = (x, cls) => A
      ? `<g class="${cls}" data-sx="${x}" data-sy="470"><path d="M${x - 40} 470 L${x + 40} 470 L${x + 54} 850 L${x - 50} 850 Z" fill="url(#wx${uid})"/><ellipse cx="${x + 14}" cy="864" rx="36" ry="14" fill="#3a1a12"/></g>`
      : `<g class="${cls}" data-sx="${x}" data-sy="470"><path d="M${x - 36} 470 L${x + 36} 470 L${x + 30} 846 L${x - 26} 846 Z" fill="#17203d"/><ellipse cx="${x + 18}" cy="860" rx="42" ry="16" fill="#111"/></g>`;
    const chair = `<g class="chair"><path d="M180 380 Q300 360 420 380 L430 590 L170 590 Z" fill="${opt.chair || "#f4f1ea"}" stroke="#d9d3c6" stroke-width="4"/>
      <path d="M150 586 L470 586 L480 616 L140 616 Z" fill="${opt.chair || "#f4f1ea"}" stroke="#d9d3c6" stroke-width="4"/>
      <path d="M160 616 L140 870 M450 616 L470 870 M200 616 L214 860 M410 616 L396 860" stroke="#cfc8ba" stroke-width="12" stroke-linecap="round"/></g>`;
    const bibOpen = A || H ? "" : `<g class="bibOpen"><path d="M300 470 L392 452 L392 520 L300 540 L208 520 L208 452 Z" fill="#141414"/>
      <path d="M300 466 L386 450 L386 512 L300 530 Z" fill="#fbf7ee"/><path d="M300 466 L214 450 L214 512 L300 530 Z" fill="#f2ecdf"/>
      <path d="M232 470 L286 478 M232 482 L286 490 M232 494 L280 501 M314 478 L370 470 M314 490 L370 482 M314 501 L362 494" stroke="#b7ad9b" stroke-width="3"/></g>`;
    const bibLap = A || H ? "" : `<g class="bibLap"><rect x="322" y="520" width="96" height="66" rx="6" fill="#141414" transform="rotate(-6 370 553)"/><path d="M372 532 v34 M360 544 h24" stroke="#c9a14a" stroke-width="4"/></g>`;
    const bagLap = A ? `<g class="bagLap"><path d="M370 540 Q410 490 450 540" stroke="#3a1a12" stroke-width="7" fill="none"/><rect x="346" y="536" width="128" height="80" rx="16" fill="#5a1f24"/><rect x="346" y="562" width="128" height="9" fill="#e7b64a"/></g>` : "";

    svg.innerHTML = `<defs>${wax("wx" + uid, PAL[0], PAL[1], PAL[2])}
        <radialGradient id="rd${uid}"><stop offset="0" stop-color="#c8484a" stop-opacity=".9"/><stop offset="1" stop-color="#c8484a" stop-opacity="0"/></radialGradient>
        <linearGradient id="dr${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#bfe6fb"/><stop offset="1" stop-color="#7cc3ea"/></linearGradient></defs>
      ${opt.noChair ? "" : chair}
      <g class="root">
        ${opt.noLegs ? "" : `<g class="legsSeat">${legsSeat}</g>`}
        <g class="legsStand">${opt.noLegs ? "" : legStand(285, "legA") + legStand(318, "legB")}</g>
        <g class="upper">
          <g class="torso">
            <g class="breath">${torso}</g>
            ${bagLap}${bibLap}
            <rect x="276" y="296" width="50" height="62" rx="18" fill="${skin}"/><ellipse class="swallow" cx="302" cy="338" rx="9" ry="6" fill="${skinD}" opacity="0"/>
            <g class="head">
              <ellipse cx="216" cy="240" rx="16" ry="24" fill="${skin}"/>
              <ellipse cx="300" cy="236" rx="${A ? 84 : 88}" ry="${A ? 98 : 100}" fill="${skin}"/>
              ${hair}
              <g class="feat">
                ${redEye(255)}${redEye(345)}<circle class="rednose" cx="${300 + fx + 9}" cy="266" r="15" fill="url(#rd${uid})" opacity="0"/>
                ${eye(255, "l")}${eye(345, "r")}${brow(255, "l")}${brow(345, "r")}
                <path d="M${300 + fx + 6} 248 Q${300 + fx + 16} 270 ${300 + fx} 274" stroke="${skinD}" stroke-width="5" fill="none" stroke-linecap="round"/>
                <g class="chin" opacity="0" stroke="${skinD}" stroke-width="3" fill="none" stroke-linecap="round"><path d="M${300 + fx - 12} 322 Q${300 + fx - 6} 326 ${300 + fx - 2} 321"/><path d="M${300 + fx + 3} 321 Q${300 + fx + 8} 326 ${300 + fx + 13} 322"/><path d="M${300 + fx - 7} 329 Q${300 + fx} 333 ${300 + fx + 8} 329"/></g>
                ${beard}
                <g class="mouth" transform="translate(${300 + fx} 298)">${mouths}</g>
                <path class="tear" d="M${255 + fx + 4} 250 q-7 12 0 16 q7 -4 0 -16Z" fill="#9fd8f5" opacity="0"/>
                ${A ? drop(255, 0) + drop(345, 1) + drop(262, 2) : ""}
                ${glasses}
              </g>
              ${earrings}
            </g>
            ${opt.blanket ? `<g class="drap"><path d="M120 560 Q300 520 520 556 L560 900 L80 900 Z" fill="#f7f6f2"/><path d="M120 560 Q300 520 520 556" stroke="#dcd8cf" stroke-width="6" fill="none"/>
              <path d="M170 640 Q260 700 250 860 M380 620 Q440 700 470 860" stroke="#e4e0d6" stroke-width="5" fill="none"/>
              <g transform="translate(470 610) rotate(-12)"><rect x="-56" y="-18" width="112" height="40" rx="14" fill="url(#wx${uid})"/><rect x="-56" y="-2" width="112" height="6" fill="${PAL[1]}"/></g></g>` : ""}
            ${arm(SHA, "armA", A)}${arm(SHB, "armB", false)}
            ${bibOpen}
          </g>
        </g>
      </g>`;
    const q = (s) => svg.querySelector(s), qa = (s) => [...svg.querySelectorAll(s)];
    const P = {
      root: q(".root"), seat: q(".legsSeat"), stand: q(".legsStand"), legA: q(".legA"), legB: q(".legB"), upper: q(".upper"), torso: q(".torso"), breath: q(".breath"),
      head: q(".head"), feat: q(".feat"), armA: q(".armA"), armB: q(".armB"), faA: q(".armA .fa"), faB: q(".armB .fa"),
      pupils: qa(".pupil"), lids: qa(".lid"), lashes: qa(".lash"), browL: q(".brow.l"), browR: q(".brow.r"), tear: q(".tear"), chair: q(".chair"),
      m: Object.fromEntries(Object.keys(MOUTHS).map((k) => [k, q(".m-" + k)])),
      lidlo: qa(".lidlo"), wet: qa(".wetline"), shines: qa(".shine"), red: qa(".red"), rednose: q(".rednose"), chin: q(".chin"), swallow: q(".swallow"),
      drops: qa(".drop").map((d) => ({ g: d, t: d.querySelector(".trail"), t2: d.querySelector(".trail2"), b: d.querySelector(".bead") })),
      propA: q(".propA"), propB: q(".propB"), mouthG: q(".mouth"),
      bibHand: q(".bibHand"), bibOpen: q(".bibOpen"), bibLap: q(".bibLap"), bagLap: q(".bagLap"), bagHand: q(".bagHand"),
    };
    let lastMouth = null;
    const rot = (el, a, cx, cy) => el.setAttribute("transform", `rotate(${r(a)} ${cx} ${cy})`);
    const vis = (el, on) => { if (el) el.style.display = on ? "" : "none"; };

    function set(s) {
      // s : x, y, sc, flip, stand(0/1), walk(phase rad), lean, head, nod, turn, arms[uaA,faA,uaB,faB], gx, gy, lid, bin, bfr, bup, mouth, tear, bib, bag, chairOn
      const flip = s.flip ?? 1, sc = s.sc ?? 1;
      P.root.setAttribute("transform", `translate(${r(s.x || 0)} ${r(s.y || 0)}) translate(300 0) scale(${r(flip * sc)} ${r(sc)}) translate(-300 0)`);
      const st = s.stand || 0;
      if (P.seat) P.seat.style.opacity = r(1 - st); P.stand.style.opacity = r(st);
      const sw = s.walk ? Math.sin(s.walk) * 16 : 0;
      if (P.legA) { rot(P.legA, sw, 285, 470); rot(P.legB, -sw, 318, 470); }
      const bob = s.walk ? Math.abs(Math.cos(s.walk)) * -8 : 0;
      P.upper.setAttribute("transform", `translate(0 ${r(-130 * st + bob)})`);
      rot(P.torso, (s.lean || 0), HIP[0], HIP[1]);
      P.breath.setAttribute("transform", `translate(0 ${HIP[1]}) scale(1 ${r(1 + (s.breathe || 0))}) translate(0 ${-HIP[1]})`);
      P.head.setAttribute("transform", `translate(0 ${r(s.nod || 0)}) rotate(${r(s.head || 0)} ${NECK[0]} ${NECK[1]})`);
      const turn = s.turn || 0;
      P.feat.setAttribute("transform", `translate(${r(turn * 26)} 0) scale(${r(1 - turn * 0.18)} 1)`);
      P.feat.style.transformOrigin = "330px 240px";
      const a = s.arms || [0, 0, 0, 0];
      rot(P.armA, a[0], SHA[0], SHA[1]); rot(P.faA, a[1], SHA[0], SHA[1] + UA);
      rot(P.armB, a[2], SHB[0], SHB[1]); rot(P.faB, a[3], SHB[0], SHB[1] + UA);
      const gx = (s.gx || 0) * 7, gy = (s.gy || 0) * 5;
      P.pupils.forEach((p) => p.setAttribute("transform", `translate(${r(gx)} ${r(gy)})`));
      const lid = Math.max(0, Math.min(1, s.lid || 0));
      P.lids.forEach((l) => l.setAttribute("height", r(2 + lid * 32)));
      P.lashes.forEach((l) => l.setAttribute("transform", `translate(0 ${r(lid * 26)}) scale(1 ${r(1 - lid * 0.9)})`));
      P.lashes.forEach((l) => (l.style.transformBox = "fill-box", l.style.transformOrigin = "50% 100%"));
      const bin = s.bin || 0, bfr = s.bfr || 0, bup = s.bup || 0;
      // sourcil gauche : bord intérieur à droite
      P.browL.setAttribute("transform", `translate(0 ${r(-bup * 9 - bin * 3 + bfr * 4)}) rotate(${r(-bin * 13 + bfr * 12)} ${P.browL.dataset.cx} ${P.browL.dataset.cy})`);
      P.browR.setAttribute("transform", `translate(0 ${r(-bup * 9 - bin * 3 + bfr * 4)}) rotate(${r(bin * 13 - bfr * 12)} ${P.browR.dataset.cx} ${P.browR.dataset.cy})`);
      const m = s.mouth || "closed";
      if (m !== lastMouth) { if (lastMouth) vis(P.m[lastMouth], false); vis(P.m[m], true); lastMouth = m; }
      // réalisme : yeux humides, rougeur, paupière inférieure, menton, déglutition, lèvres qui frémissent, larmes 3 canaux
      const wet = s.wet || 0, red = s.red || 0;
      P.wet.forEach((e) => e.setAttribute("opacity", r(wet * 0.9))); P.shines.forEach((e) => e.setAttribute("r", r(3 + wet * 1.8)));
      P.red.forEach((e) => e.setAttribute("opacity", r(red * 0.55))); if (P.rednose) P.rednose.setAttribute("opacity", r(red * 0.6));
      P.lidlo.forEach((e) => { const h = (s.lidlo || 0) * 10; e.setAttribute("height", r(h)); e.setAttribute("y", r(246 - h)); });
      if (P.chin) P.chin.setAttribute("opacity", r((s.chin || 0) * 0.85));
      if (P.swallow) { const sw = s.swallow || 0; P.swallow.setAttribute("opacity", r(Math.sin(sw * Math.PI) * 0.7)); P.swallow.setAttribute("cy", r(334 + sw * 20)); }
      const mj = s.mj || [0, 0, 1, 1]; P.mouthG.setAttribute("transform", `translate(${r(300 + fx + mj[0])} ${r(298 + mj[1])}) scale(${r(mj[2])} ${r(mj[3])})`);
      (s.drops || []).forEach((d, k) => {
        const D = P.drops[k]; if (!D) return; const [p, tr0] = d;
        D.g.setAttribute("opacity", r(Math.max(p > 0 && p < 1 ? 1 : 0, tr0))); const off = 90 * (1 - Math.min(1, p));
        D.t.setAttribute("stroke-dashoffset", r(off)); D.t2.setAttribute("stroke-dashoffset", r(off));
        D.t.setAttribute("opacity", r(0.55 * Math.max(tr0, p > 0 ? 1 : 0))); D.t2.setAttribute("opacity", r(0.8 * Math.max(tr0, p > 0 ? 1 : 0)));
        const pe = Math.min(1, p), bx = (D.g.dataset.x ||= D.t.getAttribute("d").match(/M([\d.]+)/)[1]);
        const y = 249 + pe * 80, x = +bx - 6 * Math.sin(pe * Math.PI) + 2 * pe;
        D.b.setAttribute("transform", `translate(${r(x)} ${r(y)}) scale(${r(1 + 0.25 * pe)})`); D.b.style.opacity = p > 0 && p < 1 ? 1 : 0;
      });
      for (let k = (s.drops || []).length; k < P.drops.length; k++) P.drops[k].g.setAttribute("opacity", 0);
      if (P.propA) vis(P.propA, s.propA !== false); if (P.propB) vis(P.propB, s.propB !== false);
      const tr = s.tear || 0;
      P.tear.setAttribute("opacity", r(Math.min(1, tr * 1.5) * (tr < 0.9 ? 1 : (1 - tr) * 10)));
      P.tear.setAttribute("transform", `translate(0 ${r(tr * 34)})`);
      if (!A && !H) { vis(P.bibHand, s.bib === "hand"); vis(P.bibOpen, s.bib === "open"); vis(P.bibLap, s.bib === "lap"); }
      else if (A) { vis(P.bagLap, s.bag === "lap"); vis(P.bagHand, s.bag === "hand"); }
      if (P.chair) vis(P.chair, s.chair !== false);
    }
    return { svg, set };
  }
  window.RIG = { make };
})();
