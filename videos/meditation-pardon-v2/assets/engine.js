// Moteur de scènes : monde 3D en mouvement permanent, widgets, titres cinétiques, sous-titres, SFX.
// Tout est fonction du temps t (déterministe, compatible seek image par image).
(function () {
  const S = window.MG; // données : SCENES, CAPS, CAM, SFX, DUR
  const world = document.getElementById("world");
  const heads = document.getElementById("heads");
  const capsEl = document.getElementById("caps");
  const blobs = [...document.querySelectorAll(".blob")];
  const tl = gsap.timeline({ paused: true });
  const clocks = [];
  let uid = 0;

  // ── Widgets ──────────────────────────────────────────────────────────
  const W = {
    blank: (o) => `<div class="w ${o.tone || "blank-l"}" style="width:${o.w || 260}px;height:${o.h || 260}px;border-radius:${o.r || 44}px"></div>`,
    clock: () => {
      let h = '<div class="w light clock"><div class="face">';
      for (let i = 0; i < 60; i++) if (i % 5) h += `<i class="tick" style="transform:rotate(${i * 6}deg) translateY(-150px)"></i>`;
      for (let i = 1; i <= 12; i++) {
        const a = (i * 30 * Math.PI) / 180;
        h += `<b class="n" style="left:${164 + Math.sin(a) * 128}px;top:${164 - Math.cos(a) * 128}px">${i}</b>`;
      }
      return h + '<i class="hand hh"></i><i class="hand mh"></i><i class="hand sh"></i><i class="pin"></i></div></div>';
    },
    tag: (o) => `<div class="w ${o.tone || "dark"} tag"><div class="k">${o.k}</div><div class="big">${o.big}</div><div class="s">${o.s || ""}</div></div>`,
    weather: (o) => `<div class="w ${o.tone || "storm"} weather"><div class="loc">${o.loc}</div><div class="deg">${o.deg}</div>${o.icon || ""}<div class="cond">${o.cond}</div></div>`,
    msg: (o) => `<div class="w dark msg"><div class="hd"><span class="av">${(o.av || []).map((a) => `<span style="background:${a[1]}">${a[0]}</span>`).join("")}</span>${o.title}<span class="t">maintenant</span></div>${o.lines.map((l, i) => l === "..." ? `<div class="typing m-${i}"><i></i><i></i><i></i></div>` : `<div class="b ${l[0] === ">" ? "r" : ""} m-${i}">${l.replace(/^>/, "")}</div>`).join("")}</div>`,
    search: (o) => `<div class="w light search"><span class="mag"></span><span class="q">${o.q}</span><span class="caret"></span></div>`,
    bible: (o) => `<div class="w light bible"><div class="hd"><span class="book"></span>LA BIBLE</div><div class="ref">${o.ref}</div><div class="vs">${o.vs}</div><div class="ver">${o.ver || "Louis Segond 1910"}</div></div>`,
    vs: (o) => `<div class="w ${o.tone} vs-card"><div class="k">${o.k}</div><div class="big">${o.big}</div><div class="mark" style="background:${o.mc};color:#fff">${o.mark}</div></div>`,
    icon: (o) => `<div class="w ${o.tone} icon"><i class="${o.ic}"></i></div>`,
    stat: (o) => `<div class="w ${o.tone || "blue"} stat"><div class="k">${o.k}</div><div class="big">${o.big}</div><div class="s">${o.s || ""}</div><div class="bars">${(o.bars || []).map((b, i) => `<i class="${i === o.on ? "on" : ""}" style="height:${b}%"></i>`).join("")}</div></div>`,
    phone: (o) => `<div class="phone"><div class="scr"><div class="isl"></div><div class="sb"><span>9:41</span><span>●●●</span></div>${o.screen}</div></div>`,
    mirror: () => `<div class="mirror"><div class="w light mface"><div class="mk">REGARDE-TOI</div><div class="mbig">Le visage</div><span class="eye"></span></div><div class="w light mface refl"><div class="mk">REGARDE-TOI</div><div class="mbig">Le visage</div><span class="eye"></span></div><div class="water"></div></div>`,
    text: (o) => `<div class="w ${o.tone || "light"}" style="padding:${o.pad || "34px 40px"};border-radius:${o.r || 40}px;white-space:nowrap;font:${(o.font || '700 44px "Montserrat"').replace(/"/g, "'")};${o.color ? "color:" + o.color : ""}">${o.html}</div>`,
  };

  // ── Placement d'une carte dans le monde ─────────────────────────────
  function card(sc, c, i) {
    const id = "c" + uid++;
    const outer = document.createElement("div");
    outer.className = "pl";
    outer.id = id;
    outer.innerHTML = `<div class="fl" id="${id}-f">${W[c.type](c)}</div>`;
    world.appendChild(outer);
    const inner = outer.firstChild.firstChild;
    const rect = { w: inner.offsetWidth || c.w || 300, h: inner.offsetHeight || c.h || 300 };
    gsap.set(outer, { transformOrigin: "50% 50%", x: c.x - rect.w / 2, y: c.y - rect.h / 2, z: c.z || 0, rotationY: c.ry || 0, rotationX: c.rx || 0, rotation: c.rz || 0, opacity: 0 });
    if (c.blur) inner.style.filter = `blur(${c.blur}px)`;
    if (c.type === "clock") clocks.push(outer);

    const tIn = sc.t0 + (c.d ?? i * 0.12);
    const from = c.from || "deep";
    const fromV = {
      deep: { z: (c.z || 0) - 1100, rotationY: (c.ry || 0) + (c.x < 540 ? -35 : 35), rotationX: (c.rx || 0) + 18, opacity: 0 },
      left: { x: c.x - rect.w / 2 - 900, rotationY: (c.ry || 0) - 30, opacity: 0 },
      right: { x: c.x - rect.w / 2 + 900, rotationY: (c.ry || 0) + 30, opacity: 0 },
      up: { y: c.y - rect.h / 2 + 900, rotationX: (c.rx || 0) - 30, opacity: 0 },
      down: { y: c.y - rect.h / 2 - 900, rotationX: (c.rx || 0) + 30, opacity: 0 },
      pop: { scale: (c.s || 1) * 0.6, opacity: 0 },
    }[from];
    const toV = { x: c.x - rect.w / 2, y: c.y - rect.h / 2, z: c.z || 0, rotationY: c.ry || 0, rotationX: c.rx || 0, scale: c.s || 1, opacity: 1 };
    tl.fromTo(outer, { ...toV, ...fromV }, { ...toV, duration: c.dur || 1.25, ease: from === "pop" ? "back.out(1.6)" : "power3.out" }, tIn);

    // flottement continu (amplitude et phase dérivées de l'index : déterministe)
    const tOut = sc.t1 + (c.out ?? 0);
    const span = tOut - tIn;
    const per = 3.2 + (i % 3) * 0.7;
    const reps = Math.max(0, Math.floor(span / per) - 1);
    tl.fromTo("#" + id + "-f", { y: -10 - (i % 2) * 6, rotation: -0.8 }, { y: 10 + (i % 2) * 6, rotation: 0.8, duration: per / 2, ease: "sine.inOut", yoyo: true, repeat: reps * 2 + 1 }, tIn);

    // sortie : la carte passe devant la caméra / s'éloigne
    if (!c.keep) {
      const exitV = c.exit === "back" ? { z: (c.z || 0) - 1400, opacity: 0 } : { z: (c.z || 0) + 700, opacity: 0, rotationY: (c.ry || 0) + (c.x < 540 ? 25 : -25) };
      tl.to(outer, { ...exitV, duration: 0.9, ease: "power2.in" }, tOut - 0.45);
    }
    if (c.anim) c.anim(tl, outer, tIn, tOut, id);
    return outer;
  }

  // ── Titres cinétiques (mot par mot, mot-clé en couleur) ─────────────
  function headline(h) {
    const el = document.createElement("div");
    el.className = "head" + (h.big ? " big" : "") + (h.pos ? " " + h.pos : "");
    el.innerHTML = h.words.map((w, i) => `<span class="hw${h.key && h.key.includes(i) ? " key" : ""}">${w}</span>`).join(" ");
    heads.appendChild(el);
    const ws = el.querySelectorAll(".hw");
    ws.forEach((w, i) => {
      const at = h.at ? h.at[i] : h.t0 + i * (h.step || 0.14);
      tl.fromTo(w, { opacity: 0, y: 34, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, at);
    });
    tl.to(el, { opacity: 0, y: -26, filter: "blur(12px)", duration: 0.45, ease: "power2.in" }, h.t1 - 0.45);
  }

  // ── Sous-titres ─────────────────────────────────────────────────────
  const KEY = /(pardon\w*|Christ|Bible|bien-aimé|Colossiens|Dieu|Jésus)/gi;
  S.CAPS.forEach(([a, b, txt, verse], i) => {
    const p = document.createElement("p");
    p.className = "cap" + (verse ? " verse" : "");
    p.innerHTML = `<span>${txt.replace(KEY, "<em>$1</em>")}</span>`;
    capsEl.appendChild(p);
    tl.fromTo(p, { opacity: 0, y: 14, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.3, ease: "power2.out" }, a);
    tl.to(p, { opacity: 0, y: -6, duration: 0.18, ease: "power1.in" }, Math.max(a + 0.32, b - 0.1));
  });

  S.SCENES.forEach((sc) => {
    (sc.cards || []).forEach((c, i) => card(sc, c, i));
    (sc.heads || []).forEach(headline);
    if (sc.extra) sc.extra(tl, sc);
  });

  // ── Caméra + éléments pilotés image par image ───────────────────────
  const smooth = (x) => x * x * (3 - 2 * x);
  function camAt(t) {
    const k = S.CAM;
    let a = k[0], b = k[k.length - 1], u = 0;
    for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { a = k[i - 1]; b = k[i]; u = smooth(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))); break; }
    if (t > k[k.length - 1][0]) { a = b; u = 0; }
    const v = a[1].map((x, j) => x + (b[1][j] - x) * u);
    // micro-dérive permanente façon caméra à l'épaule
    v[0] += Math.sin(t * 0.31) * 18 + Math.sin(t * 0.83) * 6;
    v[1] += Math.sin(t * 0.27 + 1.3) * 14 + Math.sin(t * 0.71) * 5;
    v[3] += Math.sin(t * 0.23) * 2.2;
    v[4] += Math.sin(t * 0.19 + 0.7) * 3.0;
    return v; // x, y, z, rx, ry, rz
  }
  function frame(t) {
    const [x, y, z, rx, ry, rz] = camAt(t);
    world.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    const sec = 9 * 3600 + 41 * 60 + t * 60; // horloge accélérée : 1 s = 1 min
    for (const c of clocks) {
      const q = (s) => c.querySelector(s);
      q(".hh").style.transform = `rotate(${(sec / 120) % 360}deg)`;
      q(".mh").style.transform = `rotate(${(sec / 10) % 360}deg)`;
      q(".sh").style.transform = `rotate(${(t * 360) % 360}deg)`;
    }
    blobs.forEach((b, i) => {
      b.style.transform = `translate(${Math.sin(t * (0.07 + i * 0.03) + i * 2) * 220}px, ${Math.cos(t * (0.05 + i * 0.02) + i) * 260}px)`;
    });
    if (S.onFrame) S.onFrame(t);
  }
  const drv = {};
  let tNow = 0;
  Object.defineProperty(drv, "t", { get: () => tNow, set: (v) => { tNow = v; frame(v); } });
  tl.fromTo(drv, { t: 0 }, { t: S.DUR, duration: S.DUR, ease: "none" }, 0);
  frame(0);

  // signature + fondus globaux
  tl.fromTo("#brand", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, 0.8);
  tl.to("#brand", { opacity: 0, duration: 0.5 }, S.DUR - 4.4);
  if (S.finale) S.finale(tl);

  window.__mgTl = tl;
})();
