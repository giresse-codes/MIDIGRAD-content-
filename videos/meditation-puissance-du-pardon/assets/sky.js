// Ciel cinématographique procédural (WebGL2) — orage → percée de lumière.
// Rendu 100 % déterministe : chaque image ne dépend que du temps t.
(function () {
  const W = 540, H = 960;          // rendu principal (mis à l'échelle ×2 en CSS)
  const DW = 270, DH = 480;        // carte de densité des nuages

  // ── Ambiance (temps vidéo, en secondes) ──────────────────────────────
  // storm : couverture/obscurité, rain : pluie, sun : percée du soleil,
  // rays : rayons divins, cross : apparition de la croix, flash : éclair,
  // zoom / tilt : caméra, leak : fuite de lumière chaude.
  const KEYS = {
    storm: [[0, 0.18], [10.0, 0.2], [12.6, 0.82], [33.0, 0.9], [36.0, 0.72], [52, 0.68], [55.5, 0.64], [61.0, 0.38], [70, 0.34]],
    rain:  [[0, 0], [11.0, 0], [12.8, 0.75], [33.0, 0.85], [36.0, 0.45], [54.5, 0.4], [58.5, 0], [70, 0]],
    sun:   [[0, 0.42], [10.0, 0.42], [12.4, 0.04], [48, 0.06], [55.0, 0.16], [61.0, 1.0], [70, 1.0]],
    rays:  [[0, 0.35], [10.0, 0.35], [12.4, 0.0], [48, 0.04], [55.0, 0.1], [61.0, 1.0], [70, 1.0]],
    cross: [[0, 0], [56.5, 0], [62.0, 1], [70, 1]],
    zoom:  [[0, 1.0], [12, 1.04], [34, 1.09], [56, 1.12], [65, 1.05], [70, 1.03]],
    tilt:  [[0, 0.0], [12, -0.01], [56.5, -0.015], [63, 0.035], [70, 0.04]],
    leak:  [[0, 0.2], [10, 0.2], [12.3, 0.0], [56, 0.0], [61, 0.35], [70, 0.45]],
  };
  const FLASHES = [12.3, 14.45];   // éclairs discrets sur « offensé » / « blessé »

  const smooth = (x) => x * x * (3 - 2 * x);
  function val(name, t) {
    const k = KEYS[name];
    if (t <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const a = k[i - 1], b = k[i];
        return a[1] + (b[1] - a[1]) * smooth((t - a[0]) / (b[0] - a[0]));
      }
    }
    return k[k.length - 1][1];
  }
  function flash(t) {
    let f = 0;
    for (const s of FLASHES) {
      const d = t - s;
      if (d >= 0 && d < 0.6) f = Math.max(f, Math.exp(-d * 9) + 0.35 * Math.exp(-Math.abs(d - 0.18) * 30));
    }
    return f;
  }

  const COMMON = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT, uStorm, uRain, uSun, uRays, uCross, uZoom, uTilt, uFlash, uLeak;
const float HOR = 0.335;
const vec2 SUN = vec2(0.60, 0.555);
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ v+=a*noise(p); p=m*p; a*=.5; } return v; }
vec2 cam(vec2 uv){
  vec2 p = (uv-.5)/uZoom + .5;
  p += vec2(sin(uT*.37)*.0022 + sin(uT*1.3)*.0006, sin(uT*.23+1.)*.0018 + sin(uT*1.7)*.0005);
  p.y += uTilt; return p;
}
float density(vec2 q){
  float d = q.y - HOR; if (d <= 0.) return 0.;
  vec2 P = vec2((q.x-.5)/(d+.05), 1./(d+.05)) * .38;
  float wind = 1. + uStorm*1.6;
  P += vec2(uT*.018*wind, uT*.05*wind);
  vec2 w = vec2(fbm(P*.55 + uT*.012), fbm(P*.55 + 7.3 - uT*.01));
  float n = fbm(P*.9 + w*1.6);
  float c = mix(.40, .80, uStorm);
  float dens = smoothstep(1.-c, 1.-c+.38, n);
  vec2 ds = (q-SUN)*vec2(.62,1.);
  dens *= 1. - uSun*.45*exp(-dot(ds,ds)*16.);
  return dens * smoothstep(0., .05, d);
}
`;

  const DENS_FS = COMMON + `
out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = cam(uv);
  if (q.y < HOR) q.y = 2.*HOR - q.y + .004;           // reflet de la mer
  float d = density(q);
  vec2 toSun = normalize(SUN - q) * .022;
  float dl = density(q + toSun);
  o = vec4(d, dl, 0., 1.);
}`;

  const MAIN_FS = COMMON + `
uniform sampler2D uDens; uniform vec2 uDensRes;
out vec4 o;
vec3 skyCol(vec2 q, vec2 dd){
  float h = clamp((q.y-HOR)/(1.-HOR), 0., 1.);
  vec3 zD = vec3(.07,.13,.40), mD = vec3(.30,.52,.82), hD = vec3(1.,.66,.36);
  vec3 zS = vec3(.035,.045,.065), mS = vec3(.13,.155,.19), hS = vec3(.30,.32,.35);
  vec3 dawn = mix(hD, mix(mD, zD, smoothstep(.25,1.,h)), smoothstep(0.,.32,h));
  vec3 storm = mix(hS, mix(mS, zS, smoothstep(.2,1.,h)), smoothstep(0.,.35,h));
  vec3 sky = mix(dawn, storm, uStorm);
  vec2 sd = (q-SUN)*vec2(.5625,1.); float r = length(sd);
  vec3 sunC = vec3(1.,.86,.62);
  float vis = (1.-dd.x*.92);
  sky += sunC * (exp(-r*8.)*.75 + exp(-r*38.)*1.4) * (.35+uSun*.8) * vis;
  sky += sunC * smoothstep(.018,.012,r) * 4. * vis * uSun;
  float light = clamp((dd.x-dd.y)*3.2 + .45, 0., 1.);
  vec3 lit = mix(vec3(1.,.80,.58), vec3(.44,.47,.52), uStorm);
  vec3 sh  = mix(vec3(.30,.30,.44), vec3(.055,.065,.085), uStorm);
  vec3 cc = mix(sh, lit, light);
  cc += sunC * exp(-r*3.2) * (1.-dd.x) * dd.x * 9. * (.15+uSun);
  cc += vec3(.75,.82,1.) * uFlash * (.6+light);
  return mix(sky, cc, dd.x);
}
float hills(float x){
  float b = .014 + .03*noise(vec2(x*3.1, 1.)) + .012*noise(vec2(x*9., 3.)) + .004*noise(vec2(x*31., 5.)) + .0015*noise(vec2(x*90., 7.));
  b += .05*exp(-pow((x-SUN.x)/.13, 2.)) * (1. + .15*noise(vec2(x*14., 9.)));
  return HOR + b;
}
float farRidge(float x){
  return HOR + .024 + .03*noise(vec2(x*2.2+4., 2.)) + .01*noise(vec2(x*7.+1., 6.)) + .003*noise(vec2(x*28., 8.));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = cam(uv);
  vec2 dd = texture(uDens, uv).rg;
  float asp = uRes.x/uRes.y;
  vec3 col;
  float hy = hills(q.x);
  vec3 hazeH = mix(vec3(.30,.22,.24), vec3(.14,.15,.17), uStorm);
  if (q.y >= HOR) {
    col = skyCol(q, dd);
    // rayons divins : marche vers le soleil dans la carte de densité
    vec2 sunUV = (SUN - vec2(0., uTilt) - .5)*uZoom + .5;
    vec2 st = (sunUV - uv) / 34.; vec2 p = uv + st*hash(gl_FragCoord.xy + 3.7); float acc = 0., wgt = 1.;
    for (int i=0;i<34;i++){ p += st; float dn = texture(uDens, p + vec2((hash(vec2(float(i), gl_FragCoord.y + uv.x*97.))-.5)*.016, 0.)).r; acc += (1.-dn)*wgt; wgt *= .965; }
    acc /= 18.;
    float rd = length((uv-sunUV)*vec2(asp,1.));
    col += vec3(1.,.78,.48) * acc * uRays * .24 * (1.-dd.x*.4) * smoothstep(.85,.0,rd);
    // collines + croix en silhouette
    float x = q.x;
    float cw = .005/asp, ch = .085, cy0 = hills(SUN.x) - .004;
    float ax = abs(x - SUN.x);
    float cr = step(ax, cw) * step(cy0, q.y) * step(q.y, cy0+ch)
             + step(ax, cw*6.2) * step(abs(q.y-(cy0+ch*.70)), .005);
    vec3 silC = mix(hazeH*.55, vec3(.05,.045,.06), .6) ;
    float atm = smoothstep(HOR, HOR+.09, q.y);
    float fr = farRidge(x);
    if (q.y < fr) col = mix(col, mix(hazeH, col, .25) * .85, .78);
    if (q.y < hy) col = mix(silC, col, .12*(1.-smoothstep(HOR, hy, q.y)));
    col = mix(col, vec3(.035,.03,.04) + vec3(1.,.7,.4)*uSun*.05, clamp(cr,0.,1.)*uCross);
    // halo autour de la croix
    col += vec3(1.,.8,.5) * uCross * uSun * .25 * exp(-length((q-vec2(SUN.x, cy0+ch*.6))*vec2(asp*1.6,1.))*22.);
  } else {
    // mer : reflet du ciel avec ondulations
    float dep = HOR - q.y;
    vec2 rq = vec2(q.x + (noise(vec2(q.x*40., dep*260. - uT*1.4))-.5)*.006*(1.+uStorm*2.), 2.*HOR - q.y);
    col = skyCol(rq, dd) * mix(vec3(.36,.40,.50), vec3(.28,.32,.38), uStorm);
    float hyr = 2.*HOR - hills(rq.x);
    if (q.y > hyr) col = mix(col, vec3(.05,.05,.07), .85);
    float open = q.y > hyr ? 0. : 1.;
    float sp = smoothstep(.82, 1., noise(vec2(q.x*150., dep*620. - uT*2.6))) * exp(-pow((q.x-SUN.x)*6., 2.)) * smoothstep(.0,.05,dep) * open;
    col += vec3(1.,.82,.55) * sp * 1.6 * (.15 + uSun);
    col += vec3(1.,.8,.55) * exp(-pow((q.x-SUN.x)*9., 2.)) * exp(-dep*9.) * .35 * uSun;
    col *= 1. - smoothstep(0., .34, dep)*.5;
  }
  // pluie (3 couches en parallaxe)
  vec2 s = vec2(uv.x*asp, uv.y);
  for (int L=0; L<3; L++){
    float fl = float(L);
    vec2 g = s*vec2(70.+fl*45., 5.5+fl*3.) + vec2(s.y*(1.6+fl*.6), uT*(9.+fl*5.)) + fl*17.3;
    vec2 id = floor(g), f = fract(g);
    float rn = hash(id);
    float on = step(rn, uRain*(.42+fl*.1));
    float cx = .5 + (hash(id+3.1)-.5)*.6;
    float ln = smoothstep(.09, .0, abs(f.x-cx)) * smoothstep(.0,.35,f.y) * smoothstep(1.,.55,f.y);
    col += vec3(.72,.78,.86) * ln * on * (.16 - fl*.035);
  }
  col *= 1. - uRain*.16;
  // poussières dans la lumière
  vec2 dg = s*vec2(9.,9.) + vec2(uT*.05, uT*.09);
  vec2 di = floor(dg), df = fract(dg);
  vec2 dp = vec2(hash(di), hash(di+5.7));
  float dm = smoothstep(.06, .0, length(df-dp)) * step(.55, hash(di+9.1));
  col += vec3(1.,.86,.62) * dm * uSun * uRays * .5 * smoothstep(.9,.2,length((uv-vec2(.6,.55))*vec2(asp,1.)));
  // fuite de lumière chaude (coin supérieur)
  vec2 lk = uv - vec2(1.05 + sin(uT*.21)*.08, 1.02);
  col += vec3(1.,.55,.22) * uLeak * .45 * exp(-dot(lk,lk)*3.2);
  col += vec3(.9,.5,.2) * uLeak * .12 * exp(-pow((uv.x+.05),2.)*12.);
  // étalonnage filmique
  col *= 1.0;
  col = (col*(2.51*col+.03))/(col*(2.43*col+.59)+.14);
  col = mix(col, col*col*(3.-2.*col), .35);
  col *= mix(vec3(1.), vec3(1.07,.96,.80), uSun*uRays*.75);
  float lum = dot(col, vec3(.299,.587,.114));
  col = mix(col, col*vec3(.92,1.,1.08), (1.-lum)*.35);
  col = mix(col, col*vec3(1.06,1.,.92), lum*.3);
  float vg = length((uv-.5)*vec2(1.,.8)); col *= 1. - smoothstep(.35, .95, vg)*.55;
  col += (hash(gl_FragCoord.xy + floor(uT*24.)*13.7) - .5) * .045;
  o = vec4(pow(clamp(col,0.,1.), vec3(1./1.05)), 1.);
}`;

  const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

  const canvas = document.getElementById("sky-canvas");
  canvas.width = W; canvas.height = H;
  const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false });

  function prog(fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }
  const pDens = prog(DENS_FS), pMain = prog(MAIN_FS);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, DW, DH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

  function setU(p, t, res) {
    const u = (n) => gl.getUniformLocation(p, n);
    gl.uniform2f(u("uRes"), res[0], res[1]);
    gl.uniform1f(u("uT"), t);
    for (const k of ["storm", "rain", "sun", "rays", "cross", "zoom", "tilt", "leak"])
      gl.uniform1f(u("u" + k[0].toUpperCase() + k.slice(1)), val(k, t));
    gl.uniform1f(u("uFlash"), flash(t));
  }

  let last = -1;
  function draw(t) {
    if (t === last) return; last = t;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, DW, DH);
    gl.useProgram(pDens); setU(pDens, t, [DW, DH]); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.useProgram(pMain); setU(pMain, t, [W, H]);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(pMain, "uDens"), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  window.__skyDraw = draw;
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
  draw(0);
})();
