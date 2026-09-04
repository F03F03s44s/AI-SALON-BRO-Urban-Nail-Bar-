"""Instagram post image (1080x1080) announcing online booking.
Dark + gold salon branding, big QR code. Re-run anytime:
- uses print/public-url.txt if it exists (permanent link),
  otherwise the shop LAN booking link."""
import socket
from pathlib import Path

import segno
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
PRINT_DIR = ROOT.parent / "print"
OUT = ROOT / "ig-booking-post.png"

GOLD = (251, 191, 36)
GOLD_DARK = (184, 134, 11)
INK = (10, 10, 10)
CARD = (20, 20, 20)
GRAY = (156, 163, 175)


def booking_url():
    f = PRINT_DIR / "public-url.txt"
    if f.exists() and f.read_text(encoding="utf-8").strip():
        return f.read_text(encoding="utf-8").strip()
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "192.168.0.163"
    finally:
        s.close()
    return f"http://{ip}:3001/pages/booking.html"


def font(size, bold=True):
    for name in ("arialbd.ttf" if bold else "arial.ttf", "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


URL = booking_url()
print("QR target:", URL)

# QR image
qr_png = ROOT / "_qr_tmp.png"
segno.make(URL, error="m").save(qr_png, scale=24, border=2, dark="#1a1a1a", light="white")

S = 1080
img = Image.new("RGB", (S, S), INK)
d = ImageDraw.Draw(img)

# gold double frame
d.rounded_rectangle([28, 28, S - 28, S - 28], radius=26, outline=GOLD_DARK, width=6)
d.rounded_rectangle([44, 44, S - 44, S - 44], radius=18, outline=GOLD_DARK, width=2)

# header
f_big = font(72); f_mid = font(40); f_small = font(30); f_tiny = font(26)
d.text((S // 2, 120), "URBAN NAIL BAR", font=f_big, fill=GOLD, anchor="mm")
d.text((S // 2, 175), "9290 E Via de Ventura #103, Scottsdale  ·  (480) 291-5440", font=f_tiny, fill=GRAY, anchor="mm")

# headline
d.text((S // 2, 268), "NOW BOOKING ONLINE", font=font(64), fill=(255, 255, 255), anchor="mm")
d.text((S // 2, 322), "manicure · pedicure · dip powder · gel-x · nail art", font=f_tiny, fill=GOLD, anchor="mm")

# QR card
qr = Image.open(qr_png).convert("RGB").resize((420, 420))
card_x, card_y = S // 2, 560
d.rounded_rectangle([card_x - 230, card_y - 230, card_x + 230, card_y + 230], radius=24, fill=(255, 255, 255))
img.paste(qr, (card_x - 210, card_y - 210))

# CTA
d.text((S // 2, 845), "SCAN TO BOOK", font=font(56), fill=GOLD, anchor="mm")
d.text((S // 2, 900), "or tap the link in our bio", font=f_small, fill=(255, 255, 255), anchor="mm")

# footer strip
d.rounded_rectangle([28, S - 118, S - 28, S - 44], radius=20, fill=GOLD_DARK)
d.text((S // 2, S - 81), "book in under a minute — pick a service, pick a time, done!", font=f_tiny, fill=(0, 0, 0), anchor="mm")

img.save(OUT, "PNG")
qr_png.unlink()
print("written:", OUT)
