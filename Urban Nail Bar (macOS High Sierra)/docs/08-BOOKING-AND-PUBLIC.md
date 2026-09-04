# 08 — Booking & Public

← [07 — Roles & PINs](07-ROLES-AND-PINS.md) · [Manual index](README.md) · Next: [09 — AI Assistant](09-AI-ASSISTANT.md)

Customer booking surfaces and what staff should tell clients.

---

## Two booking URLs

| Surface | URL | Audience |
|---|---|---|
| **Public booking** | `http://localhost:3002/` or tunnel / permanent domain | Customers — **share this** |
| **In-salon booking** | `http://localhost:3001/pages/booking.html` | Same PC / staff origin |

Public port is intentionally booking-only (no Scheduler, Admin, or salon-data API).

---

## Client flow

1. Open public booking link.
2. **Login screen**
   - Enter phone number (no password / PIN).
   - Check **SMS consent** (required).
   - New clients: enter name when prompted.
   - **Marketing** (salon/work galleries, promo banner, contact) shows **here only**.
3. After sign-in
   - Marketing hidden.
   - See **appointments** and book UI.
4. Pick a **service** (categories with **add-ons listed under that category** — no Combos tab, no global Add-ons tab).
5. Choose date, technician (or open), time.
6. Optional special requests / notes.
7. Tap **Confirm booking** (enabled when service + date + time are set).

Confirm-appointment links (from reminders) use `pages/confirm-appointment.html` + public confirm APIs.

---

## SMS consent & reminders

- Consent checkbox must be checked before phone auth continues.
- Reminder cadence settings live in DataManager (e.g. 3 days, 24 hours, 2-hour confirm) — manage via Admin / Reminders tools.
- Desk **Alert** pages: Reminders + SMS Blast for outbound messaging.

---

## Marketing on login only

Intentional UX:

- Login = brand story + promo + galleries.
- Post-login = clean booking / appointments (less clutter, faster book).

Promo copy is content-driven (site content / banners); default example includes mani+pedi promo text where configured.

---

## Menu rules (booking)

- Services grouped by category (enhancements, dip, manicure, pedicure, kids, waxing, lashes, etc.).
- **Add-ons** appear under their parent category (`Utils.isServiceAddon`).
- Categories named **Combos** or global **Add-ons** are hidden from category tabs.

---

## Going public

| Method | Script | Link type |
|---|---|---|
| **Permanent (free forever)** | `RUN-PERMANENT-TUNNEL.bat` / `START-SALON.bat` as admin | `https://urban-nail-bar.work.gd/booking.html` |
| Temporary (longer) | `START-PUBLIC-FREE.bat` → 2 / Funnel | Tailscale `*.ts.net` (not custom domain) |
| Temporary (last resort) | Pinggy via `START-FREE-TUNNEL.bat` | `https://…` (changes; ~60 min) |

DNS Exit **A record** + Netgear port forward (one-time): [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md) · [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md).

| Page | Permanent URL |
|---|---|
| Customer booking | `https://urban-nail-bar.work.gd/booking.html` |
| Website | `https://urban-nail-bar.work.gd/pages/website.html` |
| Scheduler | `https://urban-nail-bar.work.gd/pages/scheduler.html` |

Print / QR: `print/` generators + `marketing/online-booking-kit.md`.

**Do not** point customers at old salon domains — this system is the live website + booking.

---

## Staff tips

- Never share port **3001** publicly.
- If booking looks blank/unstyled, the server is not running or the wrong URL was used (`file://` breaks sync / PWA).
- Hard-refresh (Ctrl+F5) after updates if the browser caches old JS.
- UNB AI on booking helps pick services; it will not skip SMS consent.

---

## Related

- [01-START-HERE.md](01-START-HERE.md)  
- [06-PAGES-AND-BUTTONS.md](06-PAGES-AND-BUTTONS.md)  
- [09-AI-ASSISTANT.md](09-AI-ASSISTANT.md)  
- [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md)
