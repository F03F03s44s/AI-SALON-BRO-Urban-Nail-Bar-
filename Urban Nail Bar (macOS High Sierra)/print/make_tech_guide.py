"""Tech Guide — one-page training sheet for nail techs.
My Schedule, clock-in, your day, your pay. Letter size, two columns."""
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

ROOT = Path(__file__).parent
OUT = ROOT / "tech-guide.pdf"

GOLD = HexColor("#b8860b")
INK = HexColor("#1a1a1a")
GRAY = HexColor("#555555")
LIGHT = HexColor("#f7f3ea")

W, H = letter
c = canvas.Canvas(str(OUT), pagesize=letter)
c.setTitle("Tech Guide - Urban Nail Bar")

M = 36
COL_GAP = 22
COL_W = (W - 2 * M - COL_GAP) / 2
LEFT_X = M
RIGHT_X = M + COL_W + COL_GAP

# ---------- header ----------
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 22)
c.drawString(M, H - 46, "TECH GUIDE")
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 12)
c.drawString(M, H - 64, "Urban Nail Bar — one-pager for nail techs")
c.setFillColor(GRAY)
c.setFont("Helvetica", 8.5)
c.drawString(M, H - 78, "Everything you need for your day: your schedule, clock-in, and your pay.")
c.setStrokeColor(GOLD)
c.setLineWidth(2)
c.line(M, H - 86, W - M, H - 86)


def section(x, y, title):
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 10.5)
    c.drawString(x, y, title.upper())
    return y - 12


def body(x, y, text, size=8.5, leading=11, bold=False, color=INK):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    for line in text.split("\n"):
        c.drawString(x, y, line)
        y -= leading
    return y


def bullet(x, y, text, size=8.5, leading=11):
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, "•")
    c.setFillColor(INK)
    c.setFont("Helvetica", size)
    c.drawString(x + 9, y, text)
    return y - leading


# ===================== LEFT COLUMN =====================
y = H - 108

# --- your phone app ---
y = section(LEFT_X, y, "1 · My Schedule on your phone (do this once)")
y = bullet(LEFT_X, y, "Salon PC home page → Phone Setup panel → scan the")
y = body(LEFT_X + 9, y - 11, "STAFF code (My Schedule) with your phone camera.")
y = bullet(LEFT_X, y - 22, "Log in with YOUR personal 4-digit PIN.")
y = bullet(LEFT_X, y - 33, "Tap Add to Home Screen — now it’s one icon on your phone.")
y = bullet(LEFT_X, y - 44, "Works on shop Wi-Fi; ask the owner for the public link")
y = body(LEFT_X + 9, y - 55, "to check your day from home.")
y -= 8

# --- your day ---
y = section(LEFT_X, y, "2 · Your day, your appointments — nothing else")
y = bullet(LEFT_X, y, "My Schedule shows ONLY your bookings for the day:")
y = body(LEFT_X + 9, y - 11, "time, service, and client first name — color-coded.")
y = bullet(LEFT_X, y - 22, "Swipe days with the arrows; Today jumps back.")
y = bullet(LEFT_X, y - 33, "New bookings appear by themselves — no refresh needed.")
y = bullet(LEFT_X, y - 44, "Client phone numbers and other techs’ days stay private.")
y -= 8

# --- clock in/out ---
y = section(LEFT_X, y, "3 · Clock in & out (Staff page)")
y = bullet(LEFT_X, y, "Open Staff from the home page and log in with your PIN.")
y = bullet(LEFT_X, y, "Tap Clock In when you arrive, Clock Out when you leave.")
y = bullet(LEFT_X, y, "Hourly staff: your hours drive your pay — don’t forget")
y = body(LEFT_X + 9, y - 11, "to clock out. Commission staff: sales drive your pay.")
y -= 8

# --- colors key ---
y = section(LEFT_X, y, "4 · What the colors mean on your schedule")
rows = [
    ("Blue", "Booked — confirmed for later"),
    ("Green", "Arrived — client is in the salon"),
    ("Red", "Late — client hasn’t shown yet"),
    ("Orange", "Ready — checkout time"),
    ("Gray", "Done — completed"),
]
c.setFillColor(LIGHT)
c.rect(LEFT_X, y - 8, COL_W, 15 * len(rows) + 10, fill=1, stroke=0)
ty = y
for a, b in rows:
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(LEFT_X + 6, ty - 12, a)
    c.setFont("Helvetica", 8.5)
    c.drawString(LEFT_X + COL_W * 0.3, ty - 12, b)
    ty -= 15
y = ty - 6

# ===================== RIGHT COLUMN =====================
y = H - 108

# --- your pay ---
y = section(RIGHT_X, y, "5 · Your pay")
y = bullet(RIGHT_X, y, "Commission techs: you earn your % of every completed")
y = body(RIGHT_X + 9, y - 11, "service — see it live on your Staff dashboard.")
y = bullet(RIGHT_X, y - 22, "Hourly staff: hours from clock-in/out x your rate")
y = body(RIGHT_X + 9, y - 33, "(overtime past 40 hrs when eligible).")
y = bullet(RIGHT_X, y - 44, "Managers see the week’s payroll estimate on the")
y = body(RIGHT_X + 9, y - 55, "dashboard; questions about pay go to Lance/Keith/Sky.")
y -= 8

# --- client flow ---
y = section(RIGHT_X, y, "6 · When a client arrives")
y = bullet(RIGHT_X, y, "Front desk marks them Arrived — your block turns green.")
y = bullet(RIGHT_X, y, "Do your thing; the desk moves clients to Ready at the end.")
y = bullet(RIGHT_X, y, "Payment happens at the desk — you never need to ring up.")
y = bullet(RIGHT_X, y, "Clients can book you by name online — tell your regulars!")
y = bullet(RIGHT_X, y, "They can even pick a polish color when they book — it")
y = body(RIGHT_X + 9, y - 11, "shows in the appointment notes before they arrive.")
y -= 8

# --- PIN rules ---
y = section(RIGHT_X, y, "7 · Your PIN — what it opens (and what it won’t)")
rows = [
    ("Opens for you", "Stays locked"),
    ("My Schedule", "Scheduler"),
    ("Staff (clock in/out)", "Manager"),
    ("", "Admin"),
    ("", "Revenue & Payroll"),
]
c.setFillColor(LIGHT)
c.rect(RIGHT_X, y - 8, COL_W, 15 * len(rows) + 10, fill=1, stroke=0)
ty = y
for i, (a, b) in enumerate(rows):
    c.setFillColor(INK if i else GOLD)
    c.setFont("Helvetica-Bold" if i == 0 else "Helvetica", 8.5)
    c.drawString(RIGHT_X + 6, ty - 12, a)
    c.drawString(RIGHT_X + COL_W * 0.5, ty - 12, b)
    ty -= 15
y = ty - 6
y = bullet(RIGHT_X, y, "Never share your PIN — it’s your signature on the system.")
y = bullet(RIGHT_X, y, "PIN lost or changed? Admin can reset it in one minute.")
y -= 8

# --- troubleshooting ---
y = section(RIGHT_X, y, "8 · Quick fixes")
y = bullet(RIGHT_X, y, "Schedule looks old → pull up the page again; it syncs itself.")
y = bullet(RIGHT_X, y, "Can’t log in → caps? digits? still stuck → ask the desk.")
y = bullet(RIGHT_X, y, "Booking looks wrong → tell the front desk, they’ll fix it.")
y = bullet(RIGHT_X, y, "Anything weird → ask in Cursor on the salon PC (or call your tech contact).")

# ---------- footer ----------
c.setFillColor(GOLD)
c.roundRect(M, 24, W - 2 * M, 0.5 * inch, 10, fill=1, stroke=0)
c.setFillColor(HexColor("#000000"))
c.setFont("Helvetica-Bold", 9)
c.drawCentredString(W / 2, 24 + 0.2 * inch, "Urban Nail Bar · 9290 E Vía de Ventura Ste 103, Scottsdale, AZ 85258 · (480) 291-5440")

c.showPage()
c.save()
print("PDF written:", OUT)
