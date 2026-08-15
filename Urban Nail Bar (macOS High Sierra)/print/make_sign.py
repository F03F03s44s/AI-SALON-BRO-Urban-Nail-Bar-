"""Printable counter/mirror sign: client QR code for the Book Now app.
Letter-size PDF, white background (prints cleanly), gold/black salon branding."""
import socket
from pathlib import Path

import segno
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).parent
OUT_PDF = ROOT / "booking-qr-sign.pdf"
ICON = ROOT.parent / "assets" / "pwa" / "booking-icon-512.png"

GOLD = HexColor("#b8860b")      # printer-friendly darker gold
GOLD_BRIGHT = HexColor("#fbbf24")
INK = HexColor("#1a1a1a")
GRAY = HexColor("#555555")


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "192.168.0.163"
    finally:
        s.close()
    return ip


def booking_url():
    # If a permanent public link has been set up, use it on the sign.
    override = ROOT / "public-url.txt"
    if override.exists():
        url = override.read_text(encoding="utf-8").strip()
        if url:
            return url
    return f"http://{lan_ip()}:3001/pages/booking.html"


URL = booking_url()
print("QR target:", URL)

# --- QR image (high-res PNG) ---
qr_png = ROOT / "_qr_tmp.png"
segno.make(URL, error="m").save(qr_png, scale=20, border=2, dark="#1a1a1a", light="white")

W, H = letter  # 612 x 792 pt
c = canvas.Canvas(str(OUT_PDF), pagesize=letter)

# --- gold double frame ---
c.setStrokeColor(GOLD)
c.setLineWidth(4)
c.roundRect(24, 24, W - 48, H - 48, 18)
c.setLineWidth(1)
c.roundRect(34, 34, W - 68, H - 68, 12)

# --- header: icon + salon name ---
if ICON.exists():
    c.drawImage(ImageReader(str(ICON)), W / 2 - 0.45 * inch, H - 1.75 * inch,
                width=0.9 * inch, height=0.9 * inch, mask="auto")
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 34)
c.drawCentredString(W / 2, H - 2.35 * inch, "URBAN NAIL BAR")
c.setFillColor(GRAY)
c.setFont("Helvetica", 12)
c.drawCentredString(W / 2, H - 2.62 * inch, "9290 E Vía de Ventura Ste 103, Scottsdale, AZ 85258  ·  (480) 291-5440")

# --- headline ---
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 44)
c.drawCentredString(W / 2, H - 3.55 * inch, "SCAN TO BOOK")
c.setFillColor(INK)
c.setFont("Helvetica", 14)
c.drawCentredString(W / 2, H - 3.92 * inch, "Book your appointment in under a minute — no app store needed.")

# --- QR ---
qr_size = 3.6 * inch
c.drawImage(ImageReader(str(qr_png)), W / 2 - qr_size / 2, H - 3.95 * inch - qr_size,
            width=qr_size, height=qr_size)

# --- URL ---
c.setFillColor(GRAY)
c.setFont("Courier-Bold", 11)
c.drawCentredString(W / 2, H - 7.9 * inch, URL)

# --- steps ---
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 15)
c.drawCentredString(W / 2, H - 8.35 * inch, "1.  Point your phone camera at the code")
c.drawCentredString(W / 2, H - 8.62 * inch, "2.  Tap the link, then \u201cAdd to Home Screen\u201d")
c.drawCentredString(W / 2, H - 8.89 * inch, "3.  Book anytime — pick a service, pick a time, done!")

# --- footer strip ---
c.setFillColor(GOLD)
c.roundRect(24, 24, W - 48, 0.72 * inch, 18)
c.setFillColor(HexColor("#000000"))
c.setFont("Helvetica-Bold", 13)
c.drawCentredString(W / 2, 24 + 0.28 * inch, "Walk-ins welcome  ·  manicure  ·  pedicure  ·  dip powder  ·  gel-x  ·  nail art")

c.showPage()
c.save()
qr_png.unlink()
print("PDF written:", OUT_PDF)
