"""Génère les éléments graphiques fixes (médaillon, cartes parchemin, cartes de fin)."""
import os, random, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = lambda n: os.path.join(ROOT, "fonts", n)
GOLD = (212, 175, 55); DARK = (20, 14, 8)

def font(name, size): return ImageFont.truetype(F(name), size)

def medallion(d, out_ring, out_mask, label_size):
    """Anneau (double bord noir + doré) + étiquette, et masque circulaire."""
    pad = 10; lab_h = int(label_size * 1.9)
    W = d + 2 * pad; H = d + 2 * pad + lab_h
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(ring)
    b = max(4, d // 40)
    dr.ellipse((pad - b * 2, pad - b * 2, pad + d + b * 2, pad + d + b * 2), outline=(0, 0, 0, 255), width=b * 2)
    dr.ellipse((pad - b, pad - b, pad + d + b, pad + d + b), outline=GOLD + (255,), width=b)
    dr.ellipse((pad, pad, pad + d, pad + d), outline=(0, 0, 0, 255), width=max(2, b // 2))
    fnt = font("Fredoka-Bold.ttf", label_size); txt = "APÔTRE PARIS TALLA"
    tw = dr.textlength(txt, font=fnt); bx = (W - tw) / 2 - label_size * 0.6; by = pad + d - label_size * 0.4
    dr.rounded_rectangle((bx, by, W - bx, by + lab_h * 0.8), radius=lab_h * 0.3, fill=(0, 0, 0, 235), outline=GOLD + (255,), width=max(2, b // 2))
    dr.text((W / 2, by + lab_h * 0.4), txt, font=fnt, fill=GOLD + (255,), anchor="mm")
    ring.save(out_ring)
    m = Image.new("L", (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255); m.save(out_mask)

def parchment(w, h, seed=7):
    rng = np.random.default_rng(seed)
    base = np.zeros((h, w, 3), np.float32); base[:] = (232, 214, 172)
    # bruit multi-échelle pour la texture
    tex = np.zeros((h, w), np.float32)
    for s, a in [(4, 22), (16, 14), (64, 8)]:
        n = rng.random((h // s + 2, w // s + 2)).astype(np.float32)
        n = np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255 - 0.5
        tex += n * a
    base += tex[..., None] * np.array([1.0, 0.9, 0.7])
    yy, xx = np.mgrid[0:h, 0:w]; cx, cy = w / 2, h / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    vig = np.clip((r - 0.55) / 0.6, 0, 1) ** 1.6
    base = base * (1 - vig[..., None] * np.array([0.45, 0.55, 0.7]))
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert("RGBA")
    # bords irréguliers
    mask = Image.new("L", (w, h), 0); md = ImageDraw.Draw(mask)
    pts = []; N = 220
    for i in range(N):
        t = i / N * 2 * math.pi
        ex, ey = math.cos(t), math.sin(t)
        # rectangle arrondi paramétrique (superellipse)
        px = cx + (w / 2 - 18) * np.sign(ex) * abs(ex) ** 0.12
        py = cy + (h / 2 - 18) * np.sign(ey) * abs(ey) ** 0.12
        j = rng.normal(0, 4); pts.append((px + j * ex, py + j * ey))
    md.polygon(pts, fill=255); mask = mask.filter(ImageFilter.GaussianBlur(2.5))
    img.putalpha(mask)
    return img

def wrap(dr, text, fnt, maxw):
    words = text.split(); lines = []; cur = ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if dr.textlength(t, font=fnt) <= maxw: cur = t
        else: lines.append(cur); cur = wd
    if cur: lines.append(cur)
    return lines

def verse_card(W, H, ref, text, out):
    """Carte plein cadre transparente : parchemin centré, référence en haut."""
    vertical = H > W
    pw = int(W * (0.88 if vertical else 0.62)); ph_max = int(H * (0.62 if vertical else 0.84))
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    tmp = ImageDraw.Draw(canvas)
    size = 58 if vertical else 50
    while True:
        fnt = font("EBGaramond-Medium.ttf", size)
        lines = wrap(tmp, "« " + text + " »", fnt, pw * 0.80)
        lh = size * 1.28; body = len(lines) * lh
        ph = int(body + size * 4.6)
        if ph <= ph_max or size <= 30: break
        size -= 2
    ph = max(ph, int(pw * 0.42))
    p = parchment(pw, ph, seed=abs(hash(ref)) % 1000)
    d = ImageDraw.Draw(p)
    rf = font("Cinzel-Bold.ttf", int(size * 0.95))
    d.text((pw / 2, size * 1.25), ref, font=rf, fill=(110, 30, 20, 255), anchor="mm")
    yl = size * 2.05; d.line((pw * 0.3, yl, pw * 0.7, yl), fill=(140, 100, 40, 255), width=3)
    y = size * 2.75
    for ln in lines:
        d.text((pw / 2, y + lh / 2), ln, font=fnt, fill=(45, 28, 12, 255), anchor="mm"); y += lh
    sh = Image.new("RGBA", (pw + 60, ph + 60), (0, 0, 0, 0))
    sh.paste((0, 0, 0, 150), (30, 36), p.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(14))
    x0 = (W - pw) // 2; y0 = (H - ph) // 2
    canvas.alpha_composite(sh, (x0 - 30, y0 - 30)); canvas.alpha_composite(p, (x0, y0))
    canvas.save(out)

def end_cards(W, H, outdir):
    vertical = H > W; s = W / 1080 if vertical else H / 1080
    # 1. À suivre
    im = Image.new("RGB", (W, H), (10, 8, 5)); d = ImageDraw.Draw(im)
    for r in range(int(max(W, H) * 0.7), 0, -6):
        c = int(60 * (1 - r / (max(W, H) * 0.7)))
        d.ellipse((W / 2 - r, H / 2 - r, W / 2 + r, H / 2 + r), fill=(10 + c, 8 + int(c * 0.75), 5 + int(c * 0.3)))
    f1 = font("Fredoka-Bold.ttf", int(70 * s)); f2 = font("Cinzel-Bold.ttf", int((84 if vertical else 96) * s))
    d.text((W / 2, H / 2 - 150 * s), "À SUIVRE", font=f1, fill=(255, 255, 255), anchor="mm", stroke_width=int(4 * s), stroke_fill=(0, 0, 0))
    d.text((W / 2, H / 2 - 40 * s), "ÉPISODE 2", font=f1, fill=GOLD, anchor="mm", stroke_width=int(4 * s), stroke_fill=(0, 0, 0))
    t = "LE SANG DES SACRIFICES"
    lines = wrap(d, t, f2, W * 0.86)
    y = H / 2 + 90 * s
    for ln in lines:
        d.text((W / 2, y), ln, font=f2, fill=(255, 214, 90), anchor="mm", stroke_width=int(5 * s), stroke_fill=(0, 0, 0)); y += 110 * s
    im.save(os.path.join(outdir, "fin1.png"))
    # 2. Logo
    im = Image.new("RGB", (W, H), (0, 0, 0)); logo = Image.open(os.path.join(ROOT, "logo-midigrad.png")).convert("RGBA")
    L = int(min(W, H) * 0.62); logo = logo.resize((L, L), Image.LANCZOS)
    im.paste(logo, ((W - L) // 2, (H - L) // 2), logo); im.save(os.path.join(outdir, "fin2.png"))
    # 3. EUD
    im = Image.new("RGB", (W, H), (10, 8, 5)); d = ImageDraw.Draw(im)
    f3 = font("Cinzel-Bold.ttf", int(120 * s)); f4 = font("Fredoka-Bold.ttf", int(64 * s))
    d.text((W / 2, H / 2 - 60 * s), "EUD", font=f3, fill=GOLD, anchor="mm")
    d.line((W / 2 - 200 * s, H / 2 + 20 * s, W / 2 + 200 * s, H / 2 + 20 * s), fill=GOLD, width=int(4 * s))
    d.text((W / 2, H / 2 + 100 * s), "Consistoire MIDIGRAD", font=f4, fill=(240, 230, 210), anchor="mm")
    im.save(os.path.join(outdir, "fin3.png"))

if __name__ == "__main__":
    import json
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    verses = json.load(open(os.path.join(ROOT, "montage", "versets.json")))
    for fmt, (W, H, md, ls) in {"tiktok": (1080, 1920, 300, 30), "youtube": (1920, 1080, 210, 22)}.items():
        o = os.path.join(out, fmt); os.makedirs(o, exist_ok=True)
        medallion(md, os.path.join(o, "medaillon_bord.png"), os.path.join(o, "medaillon_masque.png"), ls)
        for v in verses: verse_card(W, H, v["ref"], v["texte"], os.path.join(o, f"verset_{v['id']}.png"))
        end_cards(W, H, o)
