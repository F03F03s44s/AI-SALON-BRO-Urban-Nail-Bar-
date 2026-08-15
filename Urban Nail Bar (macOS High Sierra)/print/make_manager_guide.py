"""Manager & Admin Guide — one-page training sheet for leadership.
Payroll, closeouts, staff & PIN management, money panels. Letter, two columns."""
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

ROOT = Path(__file__).parent
OUT = ROOT / "manager-guide.pdf"

GOLD = HexColor("#b8860b")
INK = HexColor("#1a1a1a")
GRAY = HexColor("#555555")
LIGHT = HexColor("#f7f3ea")

W, H = letter
c = canvas.Canvas(str(OUT), pagesize=letter)
c.setTitle("Manager & Admin Guide - Urban Nail Bar")

M = 36
COL_GAP = 22
COL_W = (W - 2 * M - COL_GAP) / 2
LEFT_X = M
RIGHT_X = M + COL_W + COL_GAP

# ---------- header ----------
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 22)
c.drawString(M, H - 46, "MANAGER & ADMIN GUIDE")
c.setFillColor(GOLD)
c.setFont("Helvetica-Bold", 12)
c.drawString(M, H - 64, "Urban Nail Bar — one-pager for leadership")
c.setFillColor(GRAY)
c.setFont("Helvetica", 8.5)
c.drawString(M, H - 78, "Payroll, closeouts, staff & PINs, and the money panels — in one place.")
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

# --- access ---
y = section(LEFT_X, y, "1 · Your access")
rows = [
    ("Manager PIN opens", "Admin PIN opens"),
    ("Scheduler", "Scheduler"),
    ("Manager page", "Manager page"),
    ("Revenue & Payroll widgets", "Admin page"),
    ("Staff, SMS, Reminders", "Revenue & Payroll widgets"),
    ("", "Staff PINs & security"),
]
c.setFillColor(LIGHT)
c.rect(LEFT_X, y - 8, COL_W, 15 * len(rows) + 10, fill=1, stroke=0)
ty = y
for i, (a, b) in enumerate(rows):
    c.setFillColor(INK if i else GOLD)
    c.setFont("Helvetica-Bold" if i == 0 else "Helvetica", 8.5)
    c.drawString(LEFT_X + 6, ty - 12, a)
    c.drawString(LEFT_X + COL_W * 0.52, ty - 12, b)
    ty -= 15
y = ty - 6
y = bullet(LEFT_X, y, "Only Admin can set or reset Manager/Admin PINs.")
y = bullet(LEFT_X, y, "Log out everywhere when you step away — one tap locks all.")
y -= 8

# --- money panels ---
y = section(LEFT_X, y, "2 · Money panels (Front Desk dashboard)")
y = bullet(LEFT_X, y, "Revenue Today — live day total, checkouts, avg ticket,")
y = body(LEFT_X + 9, y - 11, "top services. Unlock with your PIN; techs see only a lock.")
y = bullet(LEFT_X, y - 22, "Payroll This Week — live estimate per tech:")
y = body(LEFT_X + 9, y - 33, "commission on completed sales, hourly + overtime.")
y = bullet(LEFT_X, y - 44, "Both refresh every 30 min from the shared system.")
y -= 8

# --- payroll ---
y = section(LEFT_X, y, "3 · Payroll (weekly routine)")
y = bullet(LEFT_X, y, "Check the week’s estimate on the Payroll widget any time.")
y = bullet(LEFT_X, y, "End of week: Manager page → Payroll → review per-tech")
y = body(LEFT_X + 9, y - 11, "numbers (sales x commission, or clocked hours x rate).")
y = bullet(LEFT_X, y - 22, "Save the run, pay the team, then Mark Paid — saved runs")
y = body(LEFT_X + 9, y - 33, "and archives are permanent for taxes (W-2 / 1099).")
y -= 8

# --- closeout ---
y = section(LEFT_X, y, "4 · Daily closeout")
y = bullet(LEFT_X, y, "Finish all checkouts on the Scheduler first.")
y = bullet(LEFT_X, y, "Manager page → Closeout → verify cash vs card totals,")
y = body(LEFT_X + 9, y - 11, "submit — Admin receives it; records are archived forever.")
y = bullet(LEFT_X, y - 22, "Compare with Revenue Today on the dashboard — they")
y = body(LEFT_X + 9, y - 33, "should match. Differences usually mean an open ticket.")

# ===================== RIGHT COLUMN =====================
y = H - 108

# --- staff management ---
y = section(RIGHT_X, y, "5 · Staff & PINs")
y = bullet(RIGHT_X, y, "Add staff: Admin/Manager → Staff → name, role, 4-digit PIN.")
y = bullet(RIGHT_X, y, "Roles: admin, manager, receptionist (Scheduler access),")
y = body(RIGHT_X + 9, y - 11, "nail tech (own schedule only). Pay type: commission or hourly.")
y = bullet(RIGHT_X, y - 22, "Reset a PIN: Admin page → staff list → new PIN — the old")
y = body(RIGHT_X + 9, y - 33, "one stops working on every page instantly.")
y = bullet(RIGHT_X, y - 44, "Deactivate (never hard-delete): history, appointments,")
y = body(RIGHT_X + 9, y - 55, "and payroll stay archived and searchable forever.")
y -= 8

# --- reports ---
y = section(RIGHT_X, y, "6 · Reports, inventory & clients")
y = bullet(RIGHT_X, y, "Manager page → Reports: revenue, top services, tech")
y = body(RIGHT_X + 9, y - 11, "performance — every table exports to CSV.")
y = bullet(RIGHT_X, y - 22, "Inventory: polish-level alerts show before you run out.")
y = bullet(RIGHT_X, y - 33, "Client list: visit history, totals, notes — searchable")
y = body(RIGHT_X + 9, y - 44, "from any staff page header. Admin exports full backups")
y = body(RIGHT_X + 9, y - 55, "(JSON) — grab one monthly to a USB drive.")
y -= 8

# --- demo day ---
y = section(RIGHT_X, y, "7 · Demo Day (training mode)")
y = bullet(RIGHT_X, y, "Manager page → Demo Day loads a full fake day:")
y = body(RIGHT_X + 9, y - 11, "appointments, reviews, clock-ins — great for training.")
y = bullet(RIGHT_X, y - 22, "Everything demo is tagged; Remove Demo Data wipes it")
y = body(RIGHT_X + 9, y - 33, "without touching a single real record.")
y -= 8

# --- toolbox ---
y = section(RIGHT_X, y, "8 · The toolbox (.bat files on the salon PC)")
rows2 = [
    ("OPEN-SALON.bat", "Daily start: server + browser"),
    ("START-PUBLIC.bat", "Online booking link (changes each run)"),
    ("SETUP-PERMANENT-LINK.bat", "One-time: permanent booking URL"),
    ("RUN-PERMANENT-TUNNEL.bat", "Daily online booking (after setup)"),
    ("UPDATE-SALON.bat", "Refresh cache after system updates"),
]
c.setFillColor(LIGHT)
c.rect(RIGHT_X, y - 8, COL_W, 15 * len(rows2) + 10, fill=1, stroke=0)
ty = y
for i, (a, b) in enumerate(rows2):
    c.setFillColor(INK if i else GOLD)
    c.setFont("Helvetica-Bold" if i == 0 else "Helvetica", 7.5)
    c.drawString(RIGHT_X + 6, ty - 12, a)
    c.drawString(RIGHT_X + COL_W * 0.5, ty - 12, b)
    ty -= 15
y = ty - 6
y = bullet(RIGHT_X, y, "Rule of thumb: if it looks stuck, restart the bat — data is safe.")

# ---------- footer ----------
c.setFillColor(GOLD)
c.roundRect(M, 24, W - 2 * M, 0.5 * inch, 10, fill=1, stroke=0)
c.setFillColor(HexColor("#000000"))
c.setFont("Helvetica-Bold", 9)
c.drawCentredString(W / 2, 24 + 0.2 * inch, "Urban Nail Bar · 9290 E Vía de Ventura Ste 103, Scottsdale, AZ 85258 · (480) 291-5440")

c.showPage()
c.save()
print("PDF written:", OUT)
