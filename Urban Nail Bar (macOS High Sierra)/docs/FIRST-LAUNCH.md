# First Launch Checklist

← [Manual index](README.md) · [01 — Start Here](01-START-HERE.md)

Use this once on a new PC (or after a fresh copy of the folder).

---

## 1) Install Node.js

- **Windows / macOS Big Sur+:** [Node.js LTS](https://nodejs.org)
- **macOS High Sierra 10.13 only:** Node **14** (`node-v14.21.3`)

Confirm in a terminal: `node -v`

---

## 2) One-click start

**For first launch, double-click START-SALON / EVERYTHING only.**

| Computer | Double-click |
|---|---|
| **Windows** | `START-SALON.bat` (repo root) **or** `scripts\START-SALON.bat` |
| **Windows (alias)** | `scripts\EVERYTHING-WINDOWS.bat` (same as START-SALON) |
| **macOS Big Sur 11+** | `scripts/EVERYTHING-MACOS-BIG-SUR-11.7.10.command` |
| **macOS High Sierra** | `scripts/EVERYTHING-MACOS-HIGH-SIERRA-10.13.command` |

Leave the **server** window and the **tunnel** window open.

---

## 3) Confirm URLs

| Who | URL |
|---|---|
| Staff Home | `http://localhost:3001/index.html` |
| Public booking | `http://localhost:3002/` |
| Customers anywhere | Permanent: `https://urban-nail-bar.work.gd/booking.html` · Temp: Tailscale `*.ts.net` or Pinggy (~60 min) |

---

## 4) Change PINs before real use

Open **Admin → Security** and change every default PIN.  
See [07-ROLES-AND-PINS.md](07-ROLES-AND-PINS.md).

---

## 5) Book a test appointment

1. On public booking (`3002`), pick a service → date → time → confirm with phone + SMS consent.
2. On Scheduler (`3001`), confirm the appointment appears.

---

## 6) AI + Voice smoke test

1. Open Website or Public booking → tap the gold **✨** FAB → tap **Voice**.
2. Allow the microphone when the browser asks.
3. Say “What are your hours?” — you should get a spoken/typed answer.
4. On Scheduler, try: `Book [Client] with [Tech] at 2pm for [Service]` → reply **yes**.

If Voice fails: use Chrome/Edge, stay on `localhost` or HTTPS (tunnel), allow mic, or type instead. Local FAQ still answers hours/services even if the cloud AI key is offline.

---

## Optional first-time extras

| Need | Script |
|---|---|
| Icons / QR / Instagram kit regen | `scripts\SETUP-ALL.bat` |
| Health check | `scripts\VALIDATE.bat` |
| Permanent domain (Caddy + DNS Exit) | `SETUP-PERMANENT-LINK.bat` then `RUN-PERMANENT-TUNNEL.bat` as admin |

Full daily ops → [05-OPERATOR-MANUAL.md](05-OPERATOR-MANUAL.md)
