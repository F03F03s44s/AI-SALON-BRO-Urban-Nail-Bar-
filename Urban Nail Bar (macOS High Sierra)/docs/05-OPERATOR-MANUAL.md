# 05 — Operator Manual

← [04 — File Map](04-FILE-MAP.md) · [Manual index](README.md) · Next: [06 — Pages & Buttons](06-PAGES-AND-BUTTONS.md)

Day-to-day use after the system is running. Start first: **[01-START-HERE.md](01-START-HERE.md)**.

Detailed control labels: **[06-PAGES-AND-BUTTONS.md](06-PAGES-AND-BUTTONS.md)**.

---

## Morning open

1. Double-click the **EVERYTHING** launcher for your OS (`scripts/`).
2. Confirm:
   - Home opens at `http://localhost:3001`
   - Public booking at `http://localhost:3002`
   - Caddy/DDNS windows open for `urban-nail-bar.work.gd` (free forever), or a temp Funnel/Pinggy link for remote booking
3. Leave **server** + **tunnel** windows open.
4. On Home, log in with your staff / desk / manager / admin PIN as needed.

---

## Who does what

| Job | Where |
|---|---|
| Run the day board | **Scheduler** (manager / admin / receptionist) |
| Personal tech calendar | **My Schedule** / Staff Members → My Schedule |
| Walk-ins & new appointments | Scheduler → **Walk-In** / **New Appt** |
| Checkout & payment | Scheduler → **Checkout** (assign each service to a tech) |
| End-of-day register | Manager → **Closeout** (or Scheduler Closing Out) |
| Staff / client admin | Manager or Admin |
| Change PINs / backups | Admin → Security / Data |
| Text clients | Reminders + SMS Blast (**Alert** on Home) |
| Customer online book | Port **3002** or tunnel URL |

---

## Front desk flow (typical)

1. Open **Scheduler**.
2. Check calendar columns, **Waitlist**, and **Payment / Checkout** counts.
3. **New Appt** for booked clients; **Walk-In** for walk-ups.
4. Move appointments through the day; when done, use **Checkout**:
   - Assign **each service** to the correct technician (commission splits depend on this).
   - Take payment; ticket closes into reports / closeout math.
5. Use **Messages** / notifications for client & staff alerts.
6. Optional: **UNB AI ASSISTANT** to book / cancel / reschedule with yes/no confirm.

---

## Technician flow

1. From Home (after PIN), open **My Schedule** (not the full Scheduler).
2. **Clock In** at start of shift.
3. View your appointments; request **Time Off** as needed.
4. **Clock Out** at end of day (may require matching closeout; manager/admin can override with PIN).

---

## Manager flow

1. **Manager** → Dashboard for today’s numbers (click stat cards for drill-downs).
2. **Schedule** duty board — late / sick / vacation status.
3. **Inventory** — polish by brand / color / #.
4. **Reports** for ranges; **Closeout** at end of day:
   - Cash + card must match expected revenue.
   - Mismatch blocks submit; only **Admin PIN** can override (audited).

---

## Admin / owner flow

1. **Admin → Security** — change master + staff PINs (**before go-live**).
2. **Staff / Clients** — hire, deactivate, edit.
3. **Payroll / Tax** — generate stubs and summaries.
4. **Data** — Backup Now, export/import, demo load/clear.
5. **System / Settings** — salon name, hours, feature flags (propagate live).

---

## Customer booking (desk talking points)

1. Share **only** the public URL (`3002` or tunnel / permanent domain).
2. Client enters **phone** → checks **SMS consent** → (new clients) name.
3. Marketing (gallery / promos) appears on the **login** screen only.
4. After sign-in: appointments + book flow; pick service (add-ons under each category); special requests; **Confirm booking**.

Full detail → [08-BOOKING-AND-PUBLIC.md](08-BOOKING-AND-PUBLIC.md)

---

## Data safety habits

- Prefer running via **EVERYTHING** / `localhost:3001` so server sync is active.
- Use Admin **Backup Now** before risky clears or demos.
- Run `VALIDATE.bat` if something looks broken.
- Logging out on one staff page locks other open staff pages (shared session).

---

## Demo / training

- Load demo: Manager Demo Day, Admin Data → Demo, or `seed-demo-day.html`
- Clear demo: Manager Clear Demo / Admin Remove Demo Data
- Script: `DEMO-SCRIPT.md` · sheet: `DEMO-CHEAT-SHEET.pdf`

---

## End of day

1. Finish checkouts.
2. Manager **Closeout** (match register).
3. Optional: close tunnel + server windows (public link dies when tunnel closes).
4. Optionally leave server running for overnight remote booking.

---

## Related

- [06-PAGES-AND-BUTTONS.md](06-PAGES-AND-BUTTONS.md)  
- [07-ROLES-AND-PINS.md](07-ROLES-AND-PINS.md)  
- [09-AI-ASSISTANT.md](09-AI-ASSISTANT.md)  
- Alias: [HOW-TO-USE.md](HOW-TO-USE.md)
