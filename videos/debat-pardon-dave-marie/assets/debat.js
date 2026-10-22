// Style « LE DÉBAT » — Dave & Marie. Tout est calé sur window.DEB (temps issus de la voix off).
(function () {
  const D = window.DEB, P = window.PERSOS, DUR = D.dur;
  const tl = gsap.timeline({ paused: true });
  const $ = (s) => document.querySelector(s);
  const SFX = []; const sfx = (t, n, v) => SFX.push([+t.toFixed(2), n, v]);
  const mk = (parent, html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); const el = d.firstChild; parent.appendChild(el); return el; };
  const inUp = (el, t, o = {}) => tl.fromTo(el, { opacity: 0, y: o.y ?? 40, scale: o.s ?? 0.96 }, { opacity: 1, y: 0, scale: 1, duration: o.d ?? 0.5, ease: o.ease ?? "back.out(1.6)" }, t);
  const out = (el, t, d = 0.25) => tl.to(el, { opacity: 0, y: -16, duration: d, ease: "power2.in" }, t);

  // ── Expressions ─────────────────────────────────────────────────────
  const E = {
    neutre: { eyes: "open", brows: [0, 0, 0, 0], mouth: "neutral" },
    fuyant: { eyes: "half", look: [-9, 6], brows: [-10, -2, -10, -2], mouth: "sigh" },
    gene: { eyes: "open", look: [-8, 4], brows: [-14, -4, -14, -4], mouth: "wavy" },
    curieuse: { eyes: "open", look: [-6, 0], brows: [0, 2, 14, -14], mouth: "smirk" },
    mefiant: { eyes: "squint", look: [6, 0], brows: [12, 8, 12, 8], mouth: "flat" },
    douce: { eyes: "open", look: [-6, 0], brows: [-6, -4, -6, -4], mouth: "soft" },
    fier: { eyes: "happy", brows: [0, -10, 0, -10], mouth: "smile" },
    acquiesce: { eyes: "open", look: [-6, 2], brows: [0, -2, 0, -2], mouth: "smile" },
    ok: { eyes: "open", look: [6, 0], brows: [0, -2, 0, -2], mouth: "soft" },
    malin: { eyes: "half", look: [-8, 0], brows: [0, 2, 16, -12], mouth: "smirk" },
    perplexe: { eyes: "squint", look: [6, -2], brows: [12, 6, -10, -10], mouth: "flat" },
    rire: { eyes: "happy", brows: [0, -8, 0, -8], mouth: "laugh" },
    tendre: { eyes: "open", look: [-6, 0], brows: [-12, -4, -12, -4], mouth: "soft" },
    posee: { eyes: "open", look: [0, 0], brows: [0, 0, 0, 0], mouth: "neutral" },
    yeuxbas: { eyes: "half", look: [0, 9], brows: [-12, -2, -12, -2], mouth: "sigh" },
    boude: { eyes: "half", look: [-10, 2], brows: [10, 6, 10, 6], mouth: "pout" },
    amusee: { eyes: "happy", brows: [-6, -6, -6, -6], mouth: "grin" },
    panique: { eyes: "wide", look: [0, 0], brows: [-18, -16, -18, -16], mouth: "open" },
    detache: { eyes: "half", look: [10, -4], brows: [0, -8, 0, -8], mouth: "flat" },
    eclat: { eyes: "closed", brows: [0, -10, 0, -10], mouth: "laugh" },
    sincere: { eyes: "happy", brows: [-8, -4, -8, -4], mouth: "grin" },
    fiere: { eyes: "open", look: [-6, 0], brows: [-8, -6, -8, -6], mouth: "smile" },
    ecoute: { eyes: "open", look: [8, 0], brows: [0, 0, 0, 0], mouth: "neutral" },
  };
  const CH = { D: $("#dave"), M: $("#marie") };
  CH.D.innerHTML = P.dave(); CH.M.innerHTML = P.marie();
  const faces = { D: {}, M: {} };
  const used = { D: new Set(["neutre", "ecoute"]), M: new Set(["neutre", "ecoute"]) };
  D.lines.forEach((l) => l.ex.forEach(([, k]) => used[l.who].add(k)));
  ["D", "M"].forEach((w) => {
    const g = CH[w].querySelector(".faces");
    used[w].forEach((k) => { const f = document.createElementNS("http://www.w3.org/2000/svg", "g"); f.setAttribute("class", "x");
      f.innerHTML = P.face(w === "D" ? "dave" : "marie", E[k]); g.appendChild(f); faces[w][k] = f; });
  });
  const cur = { D: null, M: null };
  const setFace = (w, k, t) => { if (cur[w] === k) return; if (cur[w]) tl.set(faces[w][cur[w]], { opacity: 0 }, t); tl.set(faces[w][k], { opacity: 1 }, t); cur[w] = k; };
  const arms = { D: { up: CH.D.querySelector(".arms-up") }, M: { finger: CH.M.querySelector(".arms-finger"), cross: CH.M.querySelector(".arms-cross") } };
  const armOn = { D: null, M: null };
  const setArms = (w, a, t) => { if (armOn[w] === a) return; if (armOn[w]) tl.to(arms[w][armOn[w]], { opacity: 0, duration: 0.15 }, t); if (a) tl.fromTo(arms[w][a], { opacity: 0 }, { opacity: 1, duration: 0.2 }, t); armOn[w] = a; };
  setFace("D", "neutre", 0); setFace("M", "ecoute", 0);
  ["D", "M"].forEach((w) => tl.set(CH[w], { filter: "blur(7px)", scale: 0.96, opacity: 0.9 }, 0));

  // focus (net / flou) + gestes de tête
  let focus = null;
  const head = (w) => CH[w].querySelector(".head");
  const anim = (w, kind, t, d) => {
    const h = head(w);
    if (kind === "hoche") tl.to(h, { rotation: 4, y: 10, transformOrigin: "50% 80%", duration: 0.22, yoyo: true, repeat: 3, ease: "sine.inOut" }, t);
    if (kind === "rit") tl.to(CH[w], { y: -10, duration: 0.14, yoyo: true, repeat: Math.max(3, Math.round(d / 0.28) * 2 - 1), ease: "sine.inOut" }, t);
    if (kind === "fier") tl.to(h, { rotation: -5, y: -8, transformOrigin: "50% 80%", duration: 0.4, ease: "power2.out" }, t).to(h, { rotation: 0, y: 0, duration: 0.4 }, t + d);
    if (kind === "bas") tl.to(h, { rotation: 3, y: 12, transformOrigin: "50% 80%", duration: 0.4, ease: "power2.out" }, t).to(h, { rotation: 0, y: 0, duration: 0.4 }, t + d);
    if (kind === "tremble") tl.fromTo(CH[w], { x: -6 }, { x: 6, duration: 0.06, yoyo: true, repeat: Math.round(d / 0.06), ease: "none" }, t).set(CH[w], { x: 0 }, t + d);
    if (kind === "penche") tl.to(h, { rotation: -6, transformOrigin: "50% 80%", duration: 0.35, ease: "power2.out" }, t).to(h, { rotation: 0, duration: 0.35 }, t + d);
  };

  // ── Bulles karaoké ──────────────────────────────────────────────────
  const bubbles = $("#bubbles");
  let lastBub = null;
  D.lines.forEach((l, li) => {
    const w = l.who, o = w === "D" ? "M" : "D";
    const t0 = l.words[0][1];
    if (focus !== w) {
      tl.to(CH[w], { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" }, t0 - 0.25);
      tl.to(CH[o], { filter: "blur(7px)", scale: 0.96, opacity: 0.9, duration: 0.3, ease: "power2.out" }, t0 - 0.25);
      setFace(o, "ecoute", t0 - 0.1); setArms(o, null, t0 - 0.1);
      focus = w;
    }
    l.ex.forEach(([t, k, a, an, d]) => { setFace(w, k, t); if (a !== undefined) setArms(w, a || null, t); if (an) anim(w, an, t, d || 1); });
    l.pages.forEach(([i0, i1], pi) => {
      const ws = l.words.slice(i0, i1);
      const b = mk(bubbles, `<div class="bub ${w === "D" ? "L" : "R"}"><div class="who">${w === "D" ? "Dave" : "Marie"}</div><div class="tx"></div></div>`);
      const tx = b.querySelector(".tx");
      let grp = null; // mots surlignés consécutifs = un seul rectangle orange
      ws.forEach(([txt, t, hl], j) => {
        if (hl && !grp) { grp = document.createElement("span"); grp.className = "hl"; tx.appendChild(grp); tl.fromTo(grp, { "--a": 0 }, { "--a": 1, duration: 0.2, ease: "power2.out" }, t); }
        const s = document.createElement("span"); s.className = "w"; s.textContent = txt; (hl ? grp : tx).appendChild(s);
        const nextHl = j < ws.length - 1 && ws[j + 1][2];
        if (j < ws.length - 1) (hl && nextHl ? grp : tx).appendChild(document.createTextNode(" "));
        if (!hl || !nextHl) grp = null;
        tl.to(s, { color: "#1a1a1a", duration: 0.12, ease: "none" }, t);
      });
      const tb = ws[0][1] - 0.18;
      if (lastBub) out(lastBub, tb - 0.02, 0.18);
      inUp(b, tb, { y: 30, d: 0.45 });
      sfx(tb, "whoosh_court", 0.12);
      lastBub = b;
    });
  });
  out(lastBub, D.endAt, 0.3);

  // ── Zone du haut ────────────────────────────────────────────────────
  const top = $("#top");
  let shown = null;
  const swap = (el, t) => { if (shown) tl.to(shown, { opacity: 0, scale: 0.94, y: -20, duration: 0.25, ease: "power2.in" }, t); inUp(el, t + 0.1, { y: 40, s: 0.9 }); shown = el; sfx(t + 0.1, "whoosh", 0.18); };
  const avatar = `<span class="av">${P.dave()}</span>`;
  const verdict = mk(top, `<div class="card red">${avatar}<div class="k">Avis de Dave</div><div class="v">JAMAIS ?</div><div class="dots">${"<i></i>".repeat(5)}</div></div>`);
  const vdots = [...verdict.querySelectorAll(".dots i")];
  const vf = verdict.querySelector(".faces"); // visage de l'avatar : neutre
  if (vf) vf.innerHTML = P.face("dave", E.mefiant);
  D.top.forEach((ev) => {
    if (ev.k === "verdict") swap(verdict, ev.t);
    if (ev.k === "dot") { tl.to(vdots[ev.i], { backgroundColor: "#ec8a83", borderColor: "#ec8a83", scale: 1.25, duration: 0.2, ease: "back.out(3)" }, ev.t); tl.to(vdots[ev.i], { scale: 1, duration: 0.2 }, ev.t + 0.2); sfx(ev.t, "clic", 0.3); }
    if (ev.k === "verse") {
      const el = mk(top, `<div class="verse"><div class="scr"><div class="ref"><span>${ev.ref}</span><span>LSG</span></div><div class="tx${ev.small ? " s" : ""}">${ev.html}</div></div></div>`);
      swap(el, ev.t);
      (ev.hl || []).forEach(([i, t]) => tl.fromTo(el.querySelectorAll("b")[i], { "--a": 0 }, { "--a": 1, duration: 0.3, ease: "power2.out" }, t));
    }
    if (ev.k === "green") {
      const g = mk(top, `<div class="card green">${avatar}<div class="k">Avis de Dave</div><div class="v">PARDON ✓</div><div class="dots">${"<i></i>".repeat(5)}</div></div>`);
      const gf = g.querySelector(".faces"); if (gf) gf.innerHTML = P.face("dave", E.sincere);
      swap(g, ev.t); sfx(ev.t + 0.2, "impact", 0.25);
      g.querySelectorAll(".dots i").forEach((d, i) => tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, ev.t + 0.4 + i * 0.08));
    }
    if (ev.k === "end") {
      if (shown) tl.to(shown, { opacity: 0, scale: 0.94, duration: 0.3 }, ev.t);
      tl.to(["#logo", "#tag"], { opacity: 0, duration: 0.3 }, ev.t);
      tl.set("#end", { opacity: 1 }, ev.t + 0.2);
      inUp("#end .lg", ev.t + 0.25, { s: 0.6, y: 0, ease: "back.out(2)" });
      $("#end .sl").querySelectorAll("span").forEach((s, i) => inUp(s, ev.t + 0.7 + i * 0.35, { y: 30 }));
      tl.fromTo("#end .sl .o", { backgroundColor: "rgba(245,166,35,0)" }, { backgroundColor: "rgba(245,166,35,1)", duration: 0.3 }, ev.t + 1.6);
      tl.fromTo("#end .btn", { opacity: 0, y: 40, scale: 0.9, xPercent: -50 }, { opacity: 1, y: 0, scale: 1, xPercent: -50, duration: 0.5, ease: "back.out(1.8)" }, ev.t + 2.0);
      tl.to("#end .btn", { scale: 1.05, xPercent: -50, duration: 0.5, yoyo: true, repeat: 5, ease: "sine.inOut" }, ev.t + 2.6);
      sfx(ev.t + 0.25, "whoosh", 0.25); sfx(ev.t + 2.0, "notification", 0.25);
      ["D", "M"].forEach((w) => tl.to(CH[w], { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.4 }, ev.t));
      setFace("D", "sincere", ev.t); setFace("M", "fiere", ev.t); setArms("M", null, ev.t);
    }
  });
  tl.set("#end", { opacity: 0 }, 0);

  // ── Bascule : lumière douce ─────────────────────────────────────────
  const B = D.bascule;
  tl.fromTo("#glow", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.2, ease: "sine.out" }, B.t);
  tl.fromTo("#rays", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "sine.out" }, B.t);
  tl.to(["#glow", "#rays"], { opacity: 0, duration: 1.2, ease: "sine.in" }, B.t2);
  sfx(B.t, "scintillement", 0.28);

  // ── Confettis légers (réplique 19) ──────────────────────────────────
  const C = $("#confetti"); let seed = 19; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cols = ["#f5a623", "#1fa855", "#23bded", "#d93025", "#0b1b5c", "#f2c94c"];
  for (let i = 0; i < 46; i++) {
    const c = mk(C, `<i style="left:${rnd() * 1080}px;top:${-60 - rnd() * 200}px;background:${cols[i % 6]}"></i>`);
    const t = D.confetti + rnd() * 0.6, d = 2.4 + rnd() * 1.4;
    tl.fromTo(c, { opacity: 1, y: 0, x: 0, rotation: rnd() * 180 }, { y: 1100 + rnd() * 700, x: (rnd() - 0.5) * 260, rotation: 360 + rnd() * 540, duration: d, ease: "power1.in" }, t);
    tl.to(c, { opacity: 0, duration: 0.4 }, t + d - 0.4);
  }
  sfx(D.confetti, "scintillement", 0.22);

  // entrée d'ouverture
  inUp("#logo", 0.05, { s: 0.6, y: 0 }); inUp("#tag", 0.2, { y: 20 }); inUp("#brand", 0.3, { y: 20 });
  tl.fromTo([CH.D, CH.M], { y: 120 }, { y: 0, duration: 0.6, ease: "back.out(1.4)", stagger: 0.1 }, 0.1);

  tl.to({}, { duration: 0.01 }, DUR - 0.01);
  window.__deb = { tl, SFX };
})();
