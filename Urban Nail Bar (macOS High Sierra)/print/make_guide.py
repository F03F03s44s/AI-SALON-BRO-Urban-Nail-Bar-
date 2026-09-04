"""Front Desk Guide — one-page training sheet for new receptionists.
Every screen, PIN rule, and the daily routine. Letter size, two columns."""
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

ROOT = Path(__file__).parent
OUT = ROOT / "front-desk-guide.pdf"

GOLD = HexColor("#b8860b")
INK = HexColor("#1a1a1a")
GRAY = HexColor("#555555")
LIGHT = HexColor("#f7f3ea")

W, H = letter
c = canvas.Canvas(str(OUT), pagesize=letter)

M = 36          # margin
COL_GAP = 22
COL_W = (W - 2 * M - COL_GAP) / 2
LEFT_X = M
RIGHT_X = M + COL_W + COL_GAP

c.setTitle("Front Desk Guide - Urban Nail Bar")

# ---------- header ----------
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 22)
c.drawString(M, H - 46, "FRONT DESK GUIDE")
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 12)
c.drawString(M, H - 64, "Urban Nail Bar — new receptionist one-pager")
c.setFillColor(GRAY)
c.setFont("Helvetica", 8.5)
c.drawString(M, H - 78, "Keep this at the desk. Ask Lance, Keith, or Sky when anything looks unfamiliar.")
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

# --- start of day ---
y = section(LEFT_X, y, "1 · Start of day (every morning)")
y = bullet(LEFT_X, y, "Double-click OPEN-SALON.bat on the salon PC.")
y = bullet(LEFT_X, y, "Two windows must stay open: the black server window + your browser.")
y = bullet(LEFT_X, y, "Open the Front Desk dashboard in the browser — it refreshes itself.")
y = bullet(LEFT_X, y, "Check Today’s Schedule + the 8:47 reminder notification.")
y -= 8

# --- the screens ---
y = section(LEFT_X, y, "2 · The screens (home page tiles)")
y = body(LEFT_X, y, "PUBLIC (clients can see these):", bold=True)
y = bullet(LEFT_X, y, "Website — our public site. Booking — clients book here.")
y -= 2
y = body(LEFT_X, y, "STAFF (PIN required — never leave unlocked):", bold=True)
y = bullet(LEFT_X, y, "Scheduler — the main book: calendar, check-in, checkout.")
y = bullet(LEFT_X, y, "My Schedule — a tech’s own day only. Staff — clock in/out.")
y = bullet(LEFT_X, y, "Manager / Admin — management only.")
y = bullet(LEFT_X, y, "SMS Blast — text clients the booking link.")
y = bullet(LEFT_X, y, "Reminders — tomorrow’s clients, one-tap reminder texts.")
y -= 8

# --- daily routine ---
y = section(LEFT_X, y, "3 · Daily routine")
y = bullet(LEFT_X, y, "MORNING — open salon, check dashboard, tap Remind for")
y = body(LEFT_X + 9, y - 11, "each client on the Reminders page (texts pre-fill).")
y = bullet(LEFT_X, y - 22, "DAY — walk-ins go on the Scheduler; online bookings")
y = body(LEFT_X + 9, y - 33, "appear by themselves within seconds — confirm at check-in.")
y = bullet(LEFT_X, y - 44, "CLOSE — finish checkouts on the Scheduler, glance at")
y = body(LEFT_X + 9, y - 55, "Revenue (manager PIN), run the closeout on Manager.")
y -= 8

# --- online booking ---
y = section(LEFT_X, y, "4 · Online booking (clients, anywhere)")
y = bullet(LEFT_X, y, "Run START-PUBLIC.bat → it shows the public booking link.")
y = bullet(LEFT_X, y, "Share it by text/Instagram/Google — clients create an")
y = body(LEFT_X + 9, y - 11, "account with phone + PIN, then book. It lands on the")
y = body(LEFT_X + 9, y - 22, "Scheduler automatically. The link works while both")
y = body(LEFT_X + 9, y - 33, "windows stay open on the salon PC.")
y -= 8

# ===================== RIGHT COLUMN =====================
y = H - 108

# --- PIN rules ---
y = section(RIGHT_X, y, "5 · PINs — who opens what")
rows = [
    ("Page", "Who may enter"),
    ("Scheduler", "Manager, Admin, Front Desk"),
    ("My Schedule", "Any tech (own day only)"),
    ("Staff / SMS / Reminders", "Any staff PIN"),
    ("Manager", "Manager + Admin"),
    ("Admin", "Admin only"),
    ("Revenue & Payroll widgets", "Manager/Admin PIN"),
]
c.setFillColor(LIGHT)
c.rect(RIGHT_X, y - 8, COL_W, 15 * len(rows) + 10, fill=1, stroke=0)
ty = y
for i, (a, b) in enumerate(rows):
    c.setFillColor(INK if i else GOLD)
    c.setFont("Helvetica-Bold" if i == 0 else "Helvetica", 8.5)
    c.drawString(RIGHT_X + 6, ty - 12, a)
    c.drawString(RIGHT_X + COL_W * 0.44, ty - 12, b)
    ty -= 15
y = ty - 6
y = bullet(RIGHT_X, y, "Your Front Desk PIN comes from the owner — do not share it.")
y = bullet(RIGHT_X, y, "Master Admin PIN is NOT printed here — ask Lance/Keith/Sky.")
y = bullet(RIGHT_X, y, "Log out when you leave the desk (one tap locks every page).")
y -= 8

# --- phone apps ---
y = section(RIGHT_X, y, "6 · Phone apps (30 seconds to install)")
y = bullet(RIGHT_X, y, "Home page → Phone Setup panel → scan your code:")
y = bullet(RIGHT_X, y, "  Staff: My Schedule (your day, own appointments only).")
y = bullet(RIGHT_X, y, "  Clients: Book Now (for the mirror/sign and their phones).")
y = bullet(RIGHT_X, y, "Log in with your PIN → Add to Home Screen → done.")
y -= 8

# --- dashboard widgets ---
y = section(RIGHT_X, y, "7 · Front Desk dashboard")
y = bullet(RIGHT_X, y, "Today’s Schedule — who’s next, live statuses, progress.")
y = bullet(RIGHT_X, y, "Tomorrow’s Appointments — who needs a reminder text.")
y = bullet(RIGHT_X, y, "Week at a Glance — how busy the next 7 days look.")
y = bullet(RIGHT_X, y, "Revenue + Payroll — MANAGER/ADMIN PIN required.")
y = bullet(RIGHT_X, y, "All refresh every 30 min; digest alert at 8:47 AM.")
y -= 8

# --- troubleshooting ---
y = section(RIGHT_X, y, "8 · If something looks wrong")
y = bullet(RIGHT_X, y, "Page blank or old → hard refresh: Ctrl + F5.")
y = bullet(RIGHT_X, y, "Data not updating → server window closed? Re-run OPEN-SALON.bat.")
y = bullet(RIGHT_X, y, "Online link dead → re-run START-PUBLIC.bat for a new link.")
y = bullet(RIGHT_X, y, "Locked out → log in again; if PIN changed, ask Admin.")
y = bullet(RIGHT_X, y, "Still stuck → ask in Cursor on this PC (or call your tech contact).")

# ---------- footer ----------
c.setFillColor(GOLD)
c.roundRect(M, 24, W - 2 * M, 0.5 * inch, 10, fill=1, stroke=0)
c.setFillColor(HexColor("#000000"))
c.setFont("Helvetica-Bold", 9)
c.drawCentredString(W / 2, 24 + 0.2 * inch, "Urban Nail Bar · 9290 E Vía de Ventura Ste 103, Scottsdale, AZ 85258 · (480) 291-5440")

c.showPage()
c.save()
print("PDF written:", OUT)
