"""Generate missing PWA icons and gallery placeholders for Urban Nail Bar.
Run once after sync: python3 setup-assets.py

Compatible with older Python 3 (no star-unpacking in literals) and older Pillow.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
PWA = ROOT / "assets" / "pwa"
GALLERY = ROOT / "assets" / "gallery"
THUMBS = GALLERY / "thumbs"

GOLD = (251, 191, 36)
GOLD_DARK = (184, 134, 11)
INK = (10, 10, 10)
CARD = (26, 26, 26)
WHITE = (255, 255, 255)
GRAY = (120, 120, 120)

CAPTIONS = [
    "Pedi row & the mani bar",
    "Pipe-less pedi chairs",
    "The welcome desk",
    "The polish wall",
    "The rinse bar",
    "Inside the salon",
    "The details",
    "The space",
]

try:
    RESAMPLE = Image.Resampling.LANCZOS
except AttributeError:
    RESAMPLE = getattr(Image, "LANCZOS", Image.ANTIALIAS)


def rgba(rgb, a=255):
    """Build RGBA tuple without star-unpacking (breaks older Python)."""
    return (rgb[0], rgb[1], rgb[2], a)


def font(size, bold=True):
    for name in ("arialbd.ttf" if bold else "arial.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_rect(draw, box, radius, fill):
    if hasattr(draw, "rounded_rectangle"):
        draw.rounded_rectangle(box, radius=radius, fill=fill)
    else:
        draw.rectangle(box, fill=fill)


def draw_nail_icon(draw, cx, cy, r, fill=GOLD):
    """Simple stylized nail shape."""
    draw.ellipse([cx - r, cy - r * 1.4, cx + r, cy + r * 0.3], fill=fill)
    rounded_rect(
        draw,
        [cx - r * 0.55, cy - r * 0.1, cx + r * 0.55, cy + r * 1.1],
        int(r * 0.3),
        fill,
    )


def make_pwa_icon(path, size, label, accent=GOLD, bg=INK, maskable=False):
    img = Image.new("RGBA", (size, size), rgba(bg, 255))
    d = ImageDraw.Draw(img)
    pad = int(size * 0.12) if maskable else int(size * 0.06)
    if maskable:
        rounded_rect(d, [pad, pad, size - pad, size - pad], int(size * 0.18), rgba(CARD, 255))
    draw_nail_icon(d, size // 2, int(size * 0.42), int(size * 0.14), fill=accent)
    f = font(max(10, size // 14))
    try:
        d.text((size // 2, int(size * 0.78)), label, font=f, fill=accent, anchor="mm")
    except TypeError:
        # Older Pillow has no anchor=
        d.text((size // 2 - 20, int(size * 0.72)), label, font=f, fill=accent)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")
    print("  + " + str(path.relative_to(ROOT)))


def make_gallery(n, caption):
    w, h = 1200, 800
    img = Image.new("RGB", (w, h), CARD)
    d = ImageDraw.Draw(img)
    for i in range(h):
        t = i / float(h)
        c = tuple(int(CARD[j] * (1 - t * 0.3) + INK[j] * t * 0.3) for j in range(3))
        d.line([(0, i), (w, i)], fill=c)
    draw_nail_icon(d, w // 2, h // 2 - 40, 70, fill=GOLD_DARK)
    draw_nail_icon(d, w // 2 - 120, h // 2 + 20, 50, fill=GOLD)
    draw_nail_icon(d, w // 2 + 120, h // 2 + 20, 50, fill=GOLD)
    title = "Urban Nail Bar — Photo " + str(n)
    try:
        d.text((w // 2, h - 80), title, font=font(36), fill=GOLD, anchor="mm")
        d.text((w // 2, h - 35), caption, font=font(24, bold=False), fill=GRAY, anchor="mm")
    except TypeError:
        d.text((w // 2 - 200, h - 100), title, font=font(36), fill=GOLD)
        d.text((w // 2 - 200, h - 50), caption, font=font(24, bold=False), fill=GRAY)
    full = GALLERY / ("nail-" + str(n) + ".jpg")
    thumb = THUMBS / ("nail-" + str(n) + ".jpg")
    full.parent.mkdir(parents=True, exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)
    img.save(full, "JPEG", quality=88)
    img.resize((360, 240), RESAMPLE).save(thumb, "JPEG", quality=82)
    print("  + " + str(full.relative_to(ROOT)))


def main():
    print("Generating PWA icons...")
    specs = [
        ("icon-192.png", 192, "UNB"),
        ("icon-512.png", 512, "UNB"),
        ("icon-512-maskable.png", 512, "UNB", True),
        ("apple-touch-icon.png", 180, "UNB"),
        ("booking-icon-192.png", 192, "BOOK"),
        ("booking-icon-512.png", 512, "BOOK"),
        ("booking-icon-512-maskable.png", 512, "BOOK", True),
        ("booking-apple-touch-icon.png", 180, "BOOK"),
    ]
    for spec in specs:
        name, size, label = spec[0], spec[1], spec[2]
        maskable = spec[3] if len(spec) > 3 else False
        make_pwa_icon(PWA / name, size, label, maskable=maskable)

    print("Generating gallery placeholders (replace with real salon photos anytime)...")
    for i, cap in enumerate(CAPTIONS, 1):
        make_gallery(i, cap)

    print("Done — assets ready.")


if __name__ == "__main__":
    main()
