#!/usr/bin/env python3
"""Moteur de rendu « Le pardon divin » ép. 1 — v3.
Usage: render.py timeline.json fmt(youtube|tiktok) t_start t_end out.mp4
Écrit des images brutes vers ffmpeg (vidéo seule)."""
import json, sys, math, subprocess, collections, os, re
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FPS = 30
REPO = "/home/user/MIDIGRAD-content-"
WORK = os.path.dirname(os.path.abspath(__file__))
FONT_SUB = WORK + "/fonts/Nunito-Black.ttf"
FONT_REF = WORK + "/fonts/Cinzel-Bold.ttf"
FONT_VERSE = WORK + "/fonts/Garamond-Medium.ttf"
GOLD = (212, 175, 55)

TL = json.load(open(sys.argv[1]))
FMT = sys.argv[2]
T0, T1 = float(sys.argv[3]), float(sys.argv[4])
OUT = sys.argv[5]
W, H = (1920, 1080) if FMT == "youtube" else (1080, 1920)

# ---------------------------------------------------------------- frames
class Clips:
    def __init__(self, keep=7):
        self.cache = collections.OrderedDict(); self.keep = keep
    def load(self, name):
        if name in self.cache:
            self.cache.move_to_end(name); return self.cache[name]
        cap = cv2.VideoCapture(f"{REPO}/clips/{name}.mp4"); fr = []
        while True:
            ok, f = cap.read()
            if not ok: break
            fr.append(cv2.imencode(".jpg", f, [cv2.IMWRITE_JPEG_QUALITY, 96])[1])
        self.cache[name] = fr
        if len(self.cache) > self.keep: self.cache.popitem(last=False)
        return fr
    def get(self, name, t):
        fr = self.load(name)
        i = int(round(t * 24)); i = max(0, min(len(fr) - 1, i))
        return cv2.imdecode(fr[i], cv2.IMREAD_COLOR)
CL = Clips()

def ease(u): return 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, u)))

def frame_from(clip, st, rect, move, u, outw, outh):
    """Récupère l'image source st (s) du clip, recadre rect=[x,y,w,h] (16:9), mouvement."""
    img = CL.get(clip, st)
    x, y, w, h = rect
    z0, z1, px0, px1, py0, py1 = move
    e = ease(u)
    z = z0 + (z1 - z0) * e
    vw, vh = w / z, h / z
    mx, my = (w - vw) / 2, (h - vh) / 2
    cx = x + w / 2 + mx * (px0 + (px1 - px0) * e)
    cy = y + h / 2 + my * (py0 + (py1 - py0) * e)
    s = outw / vw
    M = np.float32([[s, 0, outw / 2 - s * cx], [0, s, outh / 2 - s * cy]])
    return cv2.warpAffine(img, M, (outw, outh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# ---------------------------------------------------------------- grades
def lut(r, g, b):
    return np.dstack([np.clip(np.arange(256) * k + o, 0, 255) for k, o in (b, g, r)]).astype(np.uint8)[0]
GRADES = {
    "none": None,
    "eden": dict(sat=1.10, rgb=((1.04, 6), (1.01, 3), (0.95, -2)), con=1.03),
    "divin": dict(sat=1.05, rgb=((1.05, 10), (1.03, 6), (0.93, 0)), con=1.0),
    "chute": dict(sat=0.78, rgb=((0.94, -2), (0.98, 0), (1.06, 6)), con=1.06),
    "nuit": dict(sat=0.85, rgb=((0.92, -4), (0.97, -2), (1.08, 8)), con=1.05),
    "desert": dict(sat=0.9, rgb=((1.0, 2), (0.99, 0), (0.98, 0)), con=1.04),
    "dore": dict(sat=1.05, rgb=((1.06, 12), (1.03, 6), (0.90, -4)), con=1.02),
    "espace": dict(sat=0.95, rgb=((1.05, 8), (1.0, 2), (0.92, 0)), con=1.0),
    "rewind": dict(sat=0.25, rgb=((1.05, 10), (1.0, 4), (0.9, -4)), con=1.1),
}
_lut_cache = {}
def grade(img, name, amt=1.0):
    g = GRADES.get(name)
    if not g: return img
    key = name
    if key not in _lut_cache:
        tabs = []
        for k, o in g["rgb"][::-1]:  # BGR order
            v = np.arange(256, dtype=np.float32)
            v = (v - 128) * g["con"] + 128
            tabs.append(np.clip(v * k + o, 0, 255).astype(np.uint8))
        _lut_cache[key] = tabs
    tabs = _lut_cache[key]
    out = cv2.merge([cv2.LUT(c, t) for c, t in zip(cv2.split(img), tabs)])
    if g["sat"] != 1.0:
        gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)[..., None].astype(np.float32)
        out = np.clip(gray + (out.astype(np.float32) - gray) * g["sat"], 0, 255).astype(np.uint8)
    return out

# ---------------------------------------------------------------- effets
def blur_blood(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    m = (((h < 12) | (h > 165)) & (s > 80) & (v > 35) & (v < 235)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    k = max(9, img.shape[1] // 40) | 1
    m = cv2.dilate(m, np.ones((k, k), np.uint8))
    m = cv2.GaussianBlur(m, (k * 2 + 1, k * 2 + 1), 0).astype(np.float32)[..., None] / 255
    small = cv2.resize(img, (img.shape[1] // 12, img.shape[0] // 12), interpolation=cv2.INTER_AREA)
    bl = cv2.resize(cv2.GaussianBlur(small, (0, 0), 3), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)
    g = cv2.cvtColor(bl, cv2.COLOR_BGR2GRAY)[..., None].astype(np.float32)
    bl = (g * 0.75 + bl.astype(np.float32) * 0.25)  # désaturé : plus de rouge vif
    return np.clip(img * (1 - m) + bl * m, 0, 255).astype(np.uint8)

def particles(img, t, kind, seed, dens=1.0):
    h, w = img.shape[:2]
    rng = np.random.RandomState(seed)
    n = int((70 if kind == "or" else 40) * dens)
    lay = np.zeros_like(img, dtype=np.float32)
    px = rng.rand(n); py = rng.rand(n); sp = 0.02 + rng.rand(n) * 0.05
    ph = rng.rand(n) * 6.28; sz = 1 + rng.rand(n) * (3.2 if kind == "or" else 2.2)
    for i in range(n):
        yy = (py[i] - sp[i] * t) % 1.0
        xx = (px[i] + 0.015 * math.sin(t * 0.7 + ph[i])) % 1.0
        a = 0.5 + 0.5 * math.sin(t * 2.1 + ph[i])
        col = (90, 200, 255) if kind == "or" else (200, 220, 230)
        r = sz[i] * w / 1920
        cv2.circle(lay, (int(xx * w), int(yy * h)), max(1, int(r * 2.2)), tuple(c * a * 0.35 for c in col), -1, cv2.LINE_AA)
        cv2.circle(lay, (int(xx * w), int(yy * h)), max(1, int(r)), tuple(c * a for c in col), -1, cv2.LINE_AA)
    lay = cv2.GaussianBlur(lay, (0, 0), 1.2)
    return np.clip(img.astype(np.float32) + lay, 0, 255).astype(np.uint8)

def rain(img, t, seed):
    h, w = img.shape[:2]; rng = np.random.RandomState(seed)
    lay = img.copy(); n = 220
    xs = rng.rand(n); ys = rng.rand(n); sp = 1.2 + rng.rand(n)
    for i in range(n):
        y = ((ys[i] + sp[i] * t) % 1.0) * h; x = (xs[i] * w + y * 0.18) % w
        L = (18 + 14 * sp[i]) * h / 1080
        cv2.line(lay, (int(x), int(y)), (int(x + L * 0.18), int(y + L)), (215, 215, 220), 1, cv2.LINE_AA)
    return cv2.addWeighted(img, 0.72, lay, 0.28, 0)

def falling_leaves(img, t, seed):
    h, w = img.shape[:2]; rng = np.random.RandomState(seed)
    for i in range(14):
        sp = 0.06 + rng.rand() * 0.08
        y = ((rng.rand() + sp * t) % 1.1 - 0.05) * h
        x = ((rng.rand() + 0.05 * t + 0.03 * math.sin(t * 1.5 + i)) % 1.0) * w
        ang = (t * 90 * (0.5 + rng.rand()) + i * 40) % 360
        s = int((9 + rng.rand() * 8) * w / 1920)
        col = (40, 90 + int(rng.rand() * 40), 60) if rng.rand() < 0.6 else (30, 90, 150)
        cv2.ellipse(img, (int(x), int(y)), (s, max(2, s // 2)), ang, 0, 360, col, -1, cv2.LINE_AA)
    return img

def speed_lines(img, t):
    h, w = img.shape[:2]; rng = np.random.RandomState(int(t * 30))
    lay = img.copy()
    for _ in range(60):
        y = int(rng.rand() * h); x = int(rng.rand() * w); L = int(80 + rng.rand() * 300) * w // 1920
        cv2.line(lay, (x, y), (x + L, y), (255, 255, 255), max(1, int(rng.rand() * 3)), cv2.LINE_AA)
    return cv2.addWeighted(img, 0.75, lay, 0.25, 0)

def vignette(img, k=0.35):
    h, w = img.shape[:2]
    key = (h, w, k)
    if key not in _vig:
        X = np.linspace(-1, 1, w)[None, :]; Y = np.linspace(-1, 1, h)[:, None]
        _vig[key] = (1 - k * np.clip(X ** 2 + Y ** 2 - 0.25, 0, 1.5) / 1.5).astype(np.float32)[..., None]
    return (img * _vig[key]).astype(np.uint8)
_vig = {}

# ---------------------------------------------------------------- texte
_txt = {}
def text_img(lines, size, font=FONT_SUB, fill=(255, 255, 255), stroke=6, kw=(), maxw=None, align="center", spacing=1.15, shadow=True):
    key = (tuple(lines), size, font, fill, stroke, tuple(kw), maxw, align)
    if key in _txt: return _txt[key]
    f = ImageFont.truetype(font, size)
    kwset = {k.upper() for k in kw}
    # mesure
    lh = int(size * spacing)
    widths = []
    for ln in lines:
        widths.append(int(f.getlength(ln)))
    tw = max(widths) + stroke * 4 + 10; th = lh * len(lines) + stroke * 4 + 12
    im = Image.new("RGBA", (tw, th), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for li, ln in enumerate(lines):
        x = (tw - widths[li]) / 2 if align == "center" else stroke * 2
        y = stroke * 2 + li * lh
        for wi, word in enumerate(ln.split(" ")):
            clean = word.replace("\u00a0", " ").strip(" .,;:!?«»\"'()…").upper()
            col = (255, 214, 0) if clean in kwset else fill
            if shadow:
                d.text((x + 3, y + 4), word, font=f, fill=(0, 0, 0, 150), stroke_width=stroke, stroke_fill=(0, 0, 0, 150))
            d.text((x, y), word, font=f, fill=col, stroke_width=stroke, stroke_fill=(0, 0, 0))
            x += f.getlength(word + " ")
    a = np.array(im)
    _txt[key] = a
    return a

def paste(dst, rgba, cx, cy, scale=1.0, alpha=1.0):
    if scale != 1.0:
        rgba = cv2.resize(rgba, (max(1, int(rgba.shape[1] * scale)), max(1, int(rgba.shape[0] * scale))), interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_LINEAR)
    h, w = rgba.shape[:2]; x0 = int(cx - w / 2); y0 = int(cy - h / 2)
    X0, Y0 = max(0, x0), max(0, y0); X1, Y1 = min(dst.shape[1], x0 + w), min(dst.shape[0], y0 + h)
    if X1 <= X0 or Y1 <= Y0: return
    src = rgba[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    a = src[..., 3:4].astype(np.float32) / 255 * alpha
    reg = dst[Y0:Y1, X0:X1].astype(np.float32)
    dst[Y0:Y1, X0:X1] = (reg * (1 - a) + src[..., 2::-1].astype(np.float32) * a).astype(np.uint8)

def bounce(u):
    """u: secondes depuis l'apparition → échelle"""
    if u >= 0.25: return 1.0
    x = u / 0.25
    return 0.8 + 0.3 * math.sin(x * math.pi * 0.75) if x < 0.8 else 1.0 + 0.1 * (1 - x) / 0.2 * 0.5

# --------------------------------------------- cartes de versets (parchemin)
_card = {}
def card_img(ref, text, cw):
    key = (ref, text, cw)
    if key in _card: return _card[key]
    ch_guess = int(cw * 0.75)
    fsz = int(cw * 0.052); rf = ImageFont.truetype(FONT_REF, int(cw * 0.058)); vf = ImageFont.truetype(FONT_VERSE, fsz)
    # word wrap
    text = re.sub(r"« ", "«\u00a0", text); text = re.sub(r" ([»;:!?])", "\u00a0\\1", text)
    words = text.split(" "); lines = []; cur = ""
    maxw = cw * 0.80
    for w_ in words:
        t = (cur + " " + w_).strip()
        if vf.getlength(t) > maxw and cur: lines.append(cur); cur = w_
        else: cur = t
    lines.append(cur)
    while len(lines) > 9 and fsz > 18:
        fsz -= 2; vf = ImageFont.truetype(FONT_VERSE, fsz); lines = []; cur = ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if vf.getlength(t) > maxw and cur: lines.append(cur); cur = w_
            else: cur = t
        lines.append(cur)
    lh = int(fsz * 1.32)
    ch = int(cw * 0.13 + cw * 0.1 + lh * len(lines) + cw * 0.10)
    im = Image.new("RGBA", (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # parchemin: fond dégradé + bords brûlés + rouleaux
    base = np.zeros((ch, cw, 4), np.uint8)
    yy, xx = np.mgrid[0:ch, 0:cw]
    rng = np.random.RandomState(7)
    noise = cv2.GaussianBlur(rng.rand(ch, cw).astype(np.float32), (0, 0), 6) * 40
    r = 236 - noise * 0.8 - ((xx - cw / 2) ** 2 / (cw / 2) ** 2) * 30
    g = 220 - noise * 0.9 - ((xx - cw / 2) ** 2 / (cw / 2) ** 2) * 38
    b = 178 - noise - ((xx - cw / 2) ** 2 / (cw / 2) ** 2) * 50
    base[..., 0] = np.clip(r, 0, 255); base[..., 1] = np.clip(g, 0, 255); base[..., 2] = np.clip(b, 0, 255)
    roll = int(cw * 0.045)
    mask = np.zeros((ch, cw), np.uint8)
    cv2.rectangle(mask, (int(cw * 0.04), roll), (int(cw * 0.96), ch - roll), 255, -1)
    mask = cv2.GaussianBlur(mask, (0, 0), 3)
    base[..., 3] = mask
    im = Image.fromarray(base); d = ImageDraw.Draw(im)
    for yc in (roll, ch - roll):  # rouleaux
        d.rounded_rectangle([int(cw * 0.01), yc - roll, int(cw * 0.99), yc + roll], radius=roll, fill=(150, 105, 55, 255), outline=(90, 60, 25, 255), width=3)
        d.rounded_rectangle([int(cw * 0.01), yc - roll // 3, int(cw * 0.99), yc + roll // 3], radius=roll // 3, fill=(185, 140, 80, 255))
    # bord doré
    d.rectangle([int(cw * 0.07), roll + int(cw * 0.03), int(cw * 0.93), ch - roll - int(cw * 0.03)], outline=(170, 130, 50, 255), width=3)
    # référence
    y = roll + int(cw * 0.06)
    tw = rf.getlength(ref); d.text(((cw - tw) / 2, y), ref, font=rf, fill=(110, 40, 20, 255))
    y += int(cw * 0.085)
    d.line([(cw * 0.3, y), (cw * 0.7, y)], fill=(170, 130, 50, 255), width=3)
    y += int(cw * 0.03)
    for ln in lines:
        tw = vf.getlength(ln); d.text(((cw - tw) / 2, y), ln, font=vf, fill=(45, 30, 15, 255)); y += lh
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    a = np.array(im); a[..., 3] = a[..., 3]
    _card[key] = a
    return a

# -------------------------------------------------------- médaillon
_med = {}
def medallion_assets(d):
    if d in _med: return _med[d]
    S = d + 24
    yy, xx = np.mgrid[0:S, 0:S]; r = np.hypot(xx - S / 2, yy - S / 2)
    inner = np.clip(d / 2 - r + 0.5, 0, 1).astype(np.float32)
    ring = np.zeros((S, S, 4), np.uint8)
    # double bord : noir extérieur, or, noir fin
    for rad, col, wdt in ((d / 2 + 10, (0, 0, 0), 4), (d / 2 + 6, GOLD, 6), (d / 2 + 1, (0, 0, 0), 3)):
        m = np.clip(wdt / 2 - np.abs(r - rad) + 0.5, 0, 1)
        for c in range(3): ring[..., c] = np.where(m > 0, col[c], ring[..., c])
        ring[..., 3] = np.maximum(ring[..., 3], (m * 255).astype(np.uint8))
    lab = text_img(["APÔTRE PARIS TALLA"], int(d * 0.075), stroke=0, shadow=False, fill=(255, 255, 255))
    # étiquette sur bandeau noir et or
    lw, lh = lab.shape[1] + int(d * 0.12), lab.shape[0] + int(d * 0.03)
    band = Image.new("RGBA", (lw, lh), (0, 0, 0, 0)); bd = ImageDraw.Draw(band)
    bd.rounded_rectangle([0, 0, lw - 1, lh - 1], radius=lh // 2, fill=(15, 12, 8, 235), outline=GOLD + (255,), width=3)
    tmp = np.array(band)
    # incruste le texte
    ty0 = (lh - lab.shape[0]) // 2; tx0 = (lw - lab.shape[1]) // 2
    a = lab[..., 3:4].astype(np.float32) / 255
    tmp[ty0:ty0 + lab.shape[0], tx0:tx0 + lab.shape[1], :3] = (tmp[ty0:ty0 + lab.shape[0], tx0:tx0 + lab.shape[1], :3] * (1 - a) + lab[..., :3] * a).astype(np.uint8)
    _med[d] = (inner, ring, tmp)
    return _med[d]

def apostle_src(t, full=False):
    """Image 1280x720 de l'Apôtre au temps t (piste parole/silence avec fondus 3 images)."""
    segs = TL["apostle"]
    lo, hi = 0, len(segs) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if segs[mid]["t0"] <= t: lo = mid
        else: hi = mid - 1
    s = segs[lo]
    img = CL.get(s["clip"], s["src0"] + (t - s["t0"]))
    xf = 3 / FPS
    if lo > 0 and t < s["t0"] + xf:  # fondu depuis le segment précédent
        p = segs[lo - 1]
        prev = CL.get(p["clip"], p["src0"] + (t - p["t0"]))
        a = (t - s["t0"]) / xf
        img = cv2.addWeighted(prev, 1 - a, img, a, 0)
    return img

def draw_medallion(canvas, t, d, cx, cy):
    inner, ring, lbl = medallion_assets(d)
    src = apostle_src(t)
    face = src[0:400, 440:840]
    face = cv2.resize(face, (d, d), interpolation=cv2.INTER_AREA)
    S = ring.shape[0]
    x0, y0 = int(cx - S / 2), int(cy - S / 2)
    off = 12
    reg = canvas[y0 + off:y0 + off + d, x0 + off:x0 + off + d].astype(np.float32)
    m = inner[off:off + d, off:off + d][..., None]
    canvas[y0 + off:y0 + off + d, x0 + off:x0 + off + d] = (reg * (1 - m) + face * m).astype(np.uint8)
    paste(canvas, ring, cx, cy)
    paste(canvas, lbl, cx, cy + d / 2 + 6)

# --------------------------------------------------------- spéciaux
_logo = None
def logo_rgba():
    global _logo
    if _logo is None:
        im = Image.open(REPO + "/logo-midigrad.png").convert("RGBA")
        S = im.width
        disc = Image.new("RGBA", (S, S), (0, 0, 0, 0)); dd = ImageDraw.Draw(disc)
        dd.ellipse([0, 0, S - 1, S - 1], fill=(255, 255, 255, 255))
        m = Image.new("L", (S, S), 0); ImageDraw.Draw(m).ellipse([6, 6, S - 7, S - 7], fill=255)
        bg = Image.new("RGBA", (S, S), (255, 255, 255, 255)); bg.alpha_composite(im)
        out = Image.new("RGBA", (S, S), (0, 0, 0, 0)); out.paste(bg, (0, 0), m)
        ring = Image.new("RGBA", (S + 40, S + 40), (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
        rd.ellipse([4, 4, S + 35, S + 35], outline=GOLD + (255,), width=14)
        ring.alpha_composite(out, (20, 20))
        _logo = np.array(ring)
    return _logo

def logo_scene(t, dur, closing=False):
    """t: temps local. Logo qui apparaît dans une lumière dorée."""
    can = np.zeros((H, W, 3), np.uint8)
    yy, xx = np.mgrid[0:H, 0:W]
    if "glow" not in _med:
        r = np.hypot((xx - W / 2) / W, (yy - H * 0.42) / H)
        _med["glow"] = np.clip(1 - r * 1.6, 0, 1).astype(np.float32)
    g = _med["glow"]
    lum = ease(t / 1.2) * (1 - 0.15 * ease((t - 1.2) / 1.5))
    if closing: lum *= 1 - ease((t - (dur - 1.0)) / 1.0)
    base = np.dstack([g * 40, g * 120, g * 200]) * lum + np.dstack([g * 8, g * 10, g * 22])
    can = np.clip(base, 0, 255).astype(np.uint8)
    # rayons
    ang = np.arctan2(yy - H * 0.42, xx - W / 2)
    if "rays" not in _med:
        _med["rays"] = (0.5 + 0.5 * np.cos(ang * 14)).astype(np.float32) ** 6
    rays = _med["rays"] * g * 90 * lum
    can = np.clip(can + np.dstack([rays * 0.4, rays * 0.8, rays]), 0, 255).astype(np.uint8)
    can = particles(can, t + 3, "or", 11, 1.3)
    L = logo_rgba()
    target = int(min(W, H) * (0.46 if W > H else 0.70))
    sc = target / L.shape[0] * (0.6 + 0.4 * ease(t / 1.1)) * (1 + 0.03 * t / dur)
    a = ease((t - 0.2) / 0.9)
    if closing: a *= 1 - ease((t - (dur - 0.8)) / 0.8)
    cy = H * 0.42
    paste(can, L, W / 2, cy, sc, a)
    # flash
    if 0.9 < t < 1.5:
        fl = 1 - abs(t - 1.15) / 0.35
        can = cv2.addWeighted(can, 1, np.full_like(can, 255), 0.35 * max(0, fl), 0)
    ta = ease((t - 1.6) / 0.6)
    if closing: ta *= 1 - ease((t - (dur - 0.8)) / 0.8)
    fs = int(W * (0.034 if W > H else 0.058))
    tx = text_img(["EUD — CONSISTOIRE MIDIGRAD"], fs, font=FONT_REF, fill=(244, 214, 120), stroke=3)
    paste(can, tx, W / 2, cy + target * 0.62, 1.0, ta)
    if not closing:
        pa = ease((t - 2.6) / 0.6) * (1 - ease((t - (dur - 0.5)) / 0.5))
        tp = text_img(["présente"], int(fs * 0.8), font=FONT_VERSE, fill=(255, 255, 255), stroke=2)
        paste(can, tp, W / 2, cy + target * 0.62 + fs * 1.6, 1.0, pa)
    return can

def end_card(t, dur, text):
    can = np.zeros((H, W, 3), np.uint8)
    base = TL.get("_endbg")
    a = ease(t / 0.5) * (1 - ease((t - (dur - 0.4)) / 0.4))
    fs = int(W * (0.045 if W > H else 0.075))
    lines = text
    ti = text_img(lines, fs, fill=(255, 214, 0), stroke=7)
    can = particles(can, t, "or", 5)
    paste(can, ti, W / 2, H / 2, bounce(t), a)
    return can

# --------------------------------------------------------- pièces
def piece_frame(p, t, outw, outh):
    u = (t - p["t0"]) / max(1e-3, p["t1"] - p["t0"])
    lt = t - p["t0"]
    kind = p.get("kind", "clip")
    if kind == "apostle":
        img = apostle_src(t)
        x, y, w, h = p.get("rect", [0, 0, 1280, 720])
        z0, z1, px0, px1, py0, py1 = p["move"]
        e = ease(u); z = z0 + (z1 - z0) * e
        vw, vh = w / z, h / z; mx, my = (w - vw) / 2, (h - vh) / 2
        cx = x + w / 2 + mx * (px0 + (px1 - px0) * e); cy = y + h / 2 + my * (py0 + (py1 - py0) * e)
        s = outw / vw
        M = np.float32([[s, 0, outw / 2 - s * cx], [0, s, outh / 2 - s * cy]])
        img = cv2.warpAffine(img, M, (outw, outh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    elif kind == "rewind":
        # images des plans précédents qui reculent en accéléré
        srcs = p["sources"]  # [[clip, s0, s1], ...] joués à l'envers
        tot = sum(abs(s[2] - s[1]) for s in srcs)
        pos = u * tot
        for c, s0, s1 in srcs:
            d = abs(s1 - s0)
            if pos <= d or (c, s0, s1) == tuple(srcs[-1]):
                st = s1 - min(pos, d) if s1 > s0 else s1 + min(pos, d)
                img = frame_from(c, st, [0, 0, 1280, 720], (1.05, 1.15, 0, 0, 0, 0), u, outw, outh)
                break
            pos -= d
        img = speed_lines(img, t)
    else:
        st = p["src0"] + lt * p.get("speed", 1.0)
        img = frame_from(p["clip"], st, p.get("rect", [0, 0, 1280, 720]), p["move"], u, outw, outh)
    for fx in p.get("fx", []):
        if fx == "sang": img = blur_blood(img)
    img = grade(img, p.get("grade", "none"))
    for fx in p.get("fx", []):
        if fx == "or": img = particles(img, t, "or", hash(p["clip"]) % 1000 if "clip" in p else 3, 0.8)
        elif fx == "poussiere": img = particles(img, t, "poussiere", 17, 0.7)
        elif fx == "pluie": img = rain(img, t, 21)
        elif fx == "feuilles": img = falling_leaves(img, t, 33)
        elif fx == "tremble":
            if lt < 0.5:
                dx = int(6 * math.sin(lt * 80) * (1 - lt / 0.5)) * outw // 1920
                img = np.roll(img, dx, axis=1)
        elif fx == "feu":
            k = 1 + 0.06 * math.sin(t * 13) + 0.04 * math.sin(t * 29)
            img = np.clip(img.astype(np.float32) * np.array([0.97, 1.0, 1.0 + 0.05 * k]), 0, 255).astype(np.uint8)
        elif fx == "sepia":
            img = grade(img, "rewind")
    return img

PIECES = TL["pieces"]
def story_frame(t, outw, outh):
    """Image du récit (sans textes) à t, avec transitions."""
    idx = None
    for i, p in enumerate(PIECES):
        if p["t0"] <= t < p["t1"]: idx = i; break
    if idx is None: idx = len(PIECES) - 1 if t >= PIECES[-1]["t0"] else 0
    p = PIECES[idx]
    img = piece_frame(p, t, outw, outh)
    # transition entrante de la pièce suivante qui commence 3 images avant son mot
    if idx + 1 < len(PIECES):
        q = PIECES[idx + 1]
        tr = q.get("trans", "fade")
        pre = 3 / FPS
        if tr != "cut" and t >= q["t0"] - pre:
            dur = (8 if tr != "flash" else 10) / FPS
            a = (t - (q["t0"] - pre)) / dur
            img2 = piece_frame(q, t, outw, outh)
            img = cv2.addWeighted(img, 1 - a, img2, a, 0)
            if tr == "flash":
                fl = 1 - abs(a - 0.5) * 2
                img = cv2.addWeighted(img, 1, np.full_like(img, (180, 230, 255)), 0.22 * fl, 0)
    # pièce courante: fin de la transition entrante
    tr = p.get("trans", "fade")
    if idx > 0 and tr != "cut":
        pre = 3 / FPS; dur = (8 if tr != "flash" else 10) / FPS
        if t < p["t0"] - pre + dur:
            a = (t - (p["t0"] - pre)) / dur
            img0 = piece_frame(PIECES[idx - 1], t, outw, outh)
            img = cv2.addWeighted(img0, 1 - a, img, a, 0)
            if tr == "flash":
                fl = 1 - abs(a - 0.5) * 2
                img = cv2.addWeighted(img, 1, np.full_like(img, (180, 230, 255)), 0.22 * fl, 0)
    return img, p

def active(lst, t):
    return [x for x in lst if x["t0"] <= t < x["t1"]]

def render(t):
    special = None
    for s in TL["specials"]:
        if s["t0"] <= t < s["t1"]: special = s; break
    if special:
        lt = t - special["t0"]; dur = special["t1"] - special["t0"]
        if special["kind"] == "logo": can = logo_scene(lt, dur)
        elif special["kind"] == "logo_close":
            can = logo_scene(lt, dur, closing=True)
        elif special["kind"] == "endcard": can = end_card(lt, dur, special["lines"])
        else: can = np.zeros((H, W, 3), np.uint8)
        # fondu au noir final
        if special.get("fadeout") and lt > dur - 1: can = (can * max(0, (dur - lt))).astype(np.uint8)
        return can
    sw, sh = (1920, 1080) if FMT == "youtube" else (1080, 608)
    img, p = story_frame(t, sw, sh)
    cards = active(TL["cards"], t)
    if cards:  # flou du plan en cours sous la carte
        c = cards[0]; a = min(1, (t - c["t0"]) / 0.35, (c["t1"] - t) / 0.35)
        bl = cv2.GaussianBlur(cv2.resize(img, (sw // 6, sh // 6)), (0, 0), 3)
        bl = (cv2.resize(bl, (sw, sh)) * 0.75).astype(np.uint8)
        img = cv2.addWeighted(img, 1 - a, bl, a, 0)
    img = vignette(img, 0.3)
    if FMT == "youtube":
        can = img
    else:
        small = cv2.resize(img, (108, 61), interpolation=cv2.INTER_AREA)
        bg = cv2.resize(small, (int(1920 * 108 / 61) // 4, 1920 // 4), interpolation=cv2.INTER_LINEAR)
        bg = cv2.GaussianBlur(bg, (0, 0), 6)
        bg = cv2.resize(bg, (int(1920 * 108 / 61), 1920), interpolation=cv2.INTER_LINEAR)
        x0 = (bg.shape[1] - 1080) // 2
        can = (bg[:, x0:x0 + 1080] * 0.65).astype(np.uint8)
        y0 = (1920 - 608) // 2
        can[y0:y0 + 608] = img
        cv2.line(can, (0, y0 - 2), (1080, y0 - 2), GOLD[::-1], 3, cv2.LINE_AA)
        cv2.line(can, (0, y0 + 609), (1080, y0 + 609), GOLD[::-1], 3, cv2.LINE_AA)
        lab = text_img(["ÉPISODE 1 · AU COMMENCEMENT"], 40, fill=(244, 214, 120), stroke=4)
        paste(can, lab, 540, 170)
    # médaillon
    if active(TL["medallion"], t) and not cards:
        if FMT == "youtube": draw_medallion(can, t, 380, 40 + 202, 1080 - 202 - 52)
        else: draw_medallion(can, t, 460, 540, 1290 + 242)
    # titres
    for ti in active(TL["titles"], t):
        lt = t - ti["t0"]; a = min(1, lt / 0.15, (ti["t1"] - t) / 0.25)
        fs = 92 if FMT == "youtube" else 74
        im = text_img(ti["lines"], fs, fill=(255, 214, 0), stroke=8)
        if FMT == "youtube": paste(can, im, 960, 200 if not ti.get("center") else 540, bounce(lt), a)
        else: paste(can, im, 540, 656 + 608 - 110 if not ti.get("center") else 960, bounce(lt) * min(1, 1000 / im.shape[1]), a)
    # cartes
    for c in cards:
        lt = t - c["t0"]; a = min(1, lt / 0.35, (c["t1"] - t) / 0.35)
        cw = 1180 if FMT == "youtube" else 980
        im = card_img(c["ref"], c["text"], cw)
        sc = min(1.0, (H * (0.86 if FMT == "youtube" else 0.62)) / im.shape[0]) * (0.92 + 0.08 * ease(lt / 0.4)) * (1 + 0.04 * lt / max(1, c['t1'] - c['t0']))
        paste(can, im, W / 2, H / 2 if FMT == "youtube" else 1000, sc, a)
    # sous-titres
    if not cards:
        for sb in active(TL["subs"], t):
            lt = t - sb["t0"]
            fs = 56 if FMT == "youtube" else 62
            im = text_img(sb["lines"], fs, kw=sb.get("kw", []), stroke=6)
            if FMT == "youtube":
                full = sb.get("full", False)
                cx = 960 if full or not active(TL["medallion"], t) else 1060
                paste(can, im, cx, 1080 - 70 - im.shape[0] / 2, bounce(lt) * min(1, 1500 / im.shape[1]))
            else:
                paste(can, im, 540, 380, bounce(lt) * min(1, 1000 / im.shape[1]))
    return can

def main():
    n0, n1 = int(round(T0 * FPS)), int(round(T1 * FPS))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-x264-params", "threads=2", OUT]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(n0, n1):
        fr = render(n / FPS)
        pr.stdin.write(np.ascontiguousarray(fr).tobytes())
    pr.stdin.close(); pr.wait()

if __name__ == "__main__":
    main()
