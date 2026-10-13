// Moteur v3 : ordinateur portable dans une pièce, caméra continue, interface animée dans l'écran.
(function () {
  const D = window.V3;
  const tl = gsap.timeline({ paused: true });
  const rig = document.getElementById("rig");
  const smooth = (x) => x * x * (3 - 2 * x);

  // ── Caméra (fonction pure du temps) ─────────────────────────────────
  function camAt(t) {
    const k = D.CAM;
    let a = k[0], b = k[0], u = 0;
    for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { a = k[i - 1]; b = k[i]; u = smooth(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])))); break; }
    if (t > k[k.length - 1][0]) { a = b = k[k.length - 1]; }
    const v = a[1].map((x, j) => x + (b[1][j] - x) * u);
    v[0] += Math.sin(t * 0.29) * 10 + Math.sin(t * 0.77) * 3;
    v[1] += Math.sin(t * 0.23 + 1.1) * 8 + Math.sin(t * 0.69) * 3;
    v[3] += Math.sin(t * 0.21) * 1.2;
    v[4] += Math.sin(t * 0.17 + 0.6) * 1.8;
    return v; // x, y, scale, rx, ry, rz
  }
  const bokeh = [...document.querySelectorAll(".bokeh")];
  function frame(t) {
    const [x, y, s, rx, ry, rz] = camAt(t);
    rig.style.transform = `translate3d(${x}px,${y}px,0) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    bokeh.forEach((b, i) => { b.style.transform = `translate(${Math.sin(t * (0.05 + i * 0.013) + i) * 40}px, ${Math.cos(t * (0.04 + i * 0.011) + i * 2) * 30}px)`; });
    document.getElementById("live-dot").style.opacity = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4));
  }
  const drv = {}; let tNow = 0;
  Object.defineProperty(drv, "t", { get: () => tNow, set: (v) => { tNow = v; frame(v); } });
  tl.fromTo(drv, { t: 0 }, { t: D.DUR, duration: D.DUR, ease: "none" }, 0);
  frame(0);

  // ── Titres cinétiques ───────────────────────────────────────────────
  const heads = document.getElementById("heads");
  D.HEADS.forEach((h) => {
    const el = document.createElement("div");
    el.className = "head";
    el.innerHTML = h.w.split(" ").map((w, i) => `<span class="hw${(h.k || []).includes(i) ? " key" : ""}">${w}</span>`).join(" ");
    heads.appendChild(el);
    el.querySelectorAll(".hw").forEach((w, i) => tl.fromTo(w, { opacity: 0, y: 30, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, h.a + i * 0.12));
    tl.to(el, { opacity: 0, y: -20, filter: "blur(10px)", duration: 0.4, ease: "power2.in" }, h.b - 0.4);
  });

  // ── Sous-titres ─────────────────────────────────────────────────────
  const KEY = /(promesse\w*|Dieu|Abraham|foi|Seigneur|Jésus|Christ|Bible|bien-aimés?|doute\w*)/gi;
  const capsEl = document.getElementById("caps");
  D.CAPS.forEach(([a, b, txt, verse]) => {
    const p = document.createElement("p");
    p.className = "cap" + (verse ? " verse" : "");
    p.innerHTML = `<span>${txt.replace(KEY, "<em>$1</em>")}</span>`;
    capsEl.appendChild(p);
    tl.fromTo(p, { opacity: 0, y: 12, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(2)" }, a);
    tl.to(p, { opacity: 0, duration: 0.15 }, Math.max(a + 0.3, b - 0.08));
  });

  // ── Mots-clés dans le panneau latéral ───────────────────────────────
  const kwBox = document.getElementById("kwbox");
  D.KW.forEach(([a, b, txt, tone], i) => {
    const el = document.createElement("div");
    el.className = "kw " + (tone || "a");
    el.textContent = txt;
    el.style.top = (i % 3) * 58 + "px";
    kwBox.appendChild(el);
    tl.fromTo(el, { opacity: 0, x: 40, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.8)" }, a);
    tl.to(el, { opacity: 0, x: -30, duration: 0.3, ease: "power2.in" }, b);
  });

  // ── Chapitres, badge de nom, barre de progression ──────────────────
  D.CLIPS.forEach((c, i) => {
    tl.fromTo(`#hl-${i}`, { opacity: 0 }, { opacity: 1, duration: 0.4 }, c.s);
    tl.to(`#hl-${i}`, { opacity: 0, duration: 0.4 }, c.s + c.d);
    tl.fromTo("#bar", { scaleX: 0 }, { scaleX: 1, duration: c.d, ease: "none", immediateRender: i === 0 }, c.s);
    tl.fromTo("#namepill", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, c.s + 0.8);
    tl.to("#namepill", { opacity: 0, y: 10, duration: 0.4 }, c.s + 6.5);
  });

  if (D.extra) D.extra(tl);
  tl.fromTo("#brand", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 3.8);
  tl.to("#brand", { opacity: 0, duration: 0.5 }, D.DUR - 4.6);
  window.__v3tl = tl;
})();
