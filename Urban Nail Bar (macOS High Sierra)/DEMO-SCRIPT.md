# Urban Nail Bar — Demo Day Presentation Script

*Follow these stops in order. Everything shown comes from the seeded demo day.*
*Numbers below assume the demo staff commission rates (50% / 60% / 40%). If the demo used your real staff, the rates and splits follow their real commission settings — the walkthrough is identical.*

---

## Stop 1 — Manager Dashboard (pages/manager.html)

**Say:** "This is the manager's morning view — four live numbers."

- Today's Appointments: **6**
- Today's Revenue: **$215**
- Staff On Duty: **2**
- Avg Rating: **4.3**

**Say:** "Every one of these cards is clickable. Let's open each one."

---

## Stop 2 — Click "Today's Appointments" 📊

Point out, top to bottom:

1. **Summary chips** — 6 total, 3 appointments completed, 1 walk-in completed, 1 still pending, 1 cancelled.
2. **Appointments section** — John Doe's 9:00 AM shows *two services with a different tech on each* (Gel Manicure $35 + Spa Pedicure $50). **Say:** "Watch what that does to commission later."
3. **Walk-Ins section** — Walk-In Amy ($60, completed) and Walk-In Tom ($15, cancelled) — walk-ins are tracked separately from bookings.
4. **Completed Services Breakdown** — every service done today, times done, and dollars each.
5. **Which Staff Did Which Clients** — per-tech client and service counts.
6. **The bottom table** — Walk-Ins (2) + Appointments (4) = **Today's Total (6)**.

---

## Stop 3 — Click "Today's Revenue" 💵

1. **Top chips** — $215 gross → staff commission → salon keeps.
2. **Every Completed Transaction** — find John Doe's $85 ticket: it lists *both techs with their own share and rate* ($35 @ 50% + $50 @ 60%).
   **Say:** "Two techs, one client — the split is exact to the penny. No end-of-day arguments."
3. **Per-Staff Commission Split** — gross before commission, each tech's rate, what the tech made, what the salon made. Totals: **$120.50 staff / $94.50 salon**.
4. **Per-Service Revenue** — which services actually make the money, with % of the day.
5. **Walk-Ins vs Appointments revenue** — $60 walk-in + $155 booked = $215.

---

## Stop 4 — Click "Staff On Duty" 👥

- **2 clocked in** (at 8:55 AM and 9:05 AM), hours accumulating live, today's appointments and sales per person.
- **Say:** "This syncs from the Staff page time clock — when someone clocks in or out, this changes within seconds."

---

## Stop 5 — Click "Avg Rating" ⭐

1. **The math, shown plainly:** (5 + 4 + 3 + 5) ÷ 4 = **4.25 ★**
2. **Rating distribution bars** — two 5-star, one 4-star, one 3-star.
3. **Per-staff averages** — each tech's own ratings and average.
4. **Every review with the client's comment** — the "why" behind the number.
   **Say:** "Reviews left on the Scheduler appear here instantly."

---

## Stop 6 — Sidebar → Schedule

1. **Status chips** — Clocked In: 2, plus Late / Sick / Vacation / Called Off counters.
2. **Duty Board** — mark anyone late/sick/vacation/called-off from the dropdown; auto-late detection flags people who miss their shift start by 15 minutes.
3. **Staff Earnings Breakdown** — today / week / month / year per tech, appointments, average ticket.
4. **Shifts** — add a recurring weekly shift with one click.

---

## Stop 7 — Sidebar → Reports

1. Click **Daily Report** — the full day: walk-ins vs appointments, per-service prices, per-staff before/after commission, every transaction.
2. Click **Weekly Report** and **Monthly Report** — same detail over the wider range.
3. Click **Export to CSV** — downloads the transactions with one row per staff share.
   **Say:** "Same numbers as the dashboard, because every page reads one shared data layer."

---

## Stop 8 — Admin (pages/admin.html)

1. **Closeout Records** — after the manager submits tonight's closeout (Manager → Closeout → PIN 1111), click **View** on the record: identical per-staff split numbers, Staff Pay + Salon Cut columns.
2. **Payroll** — Generate Payroll for this week: same $215 gross / $120.50 staff / $94.50 salon, ready to save as a permanent run.
3. **Tax Center** — the year-end numbers use the same split math, so W-2/1099 estimates match payroll.

---

## Closing the demo

**Say:** "And when we're done training—" → Manager dashboard → **🧹 Clear Demo** (or Admin → Data & Backups → Remove Demo Data). All 16 demo records vanish; real data was never touched.

**Reload anytime:** double-click `seed-demo-day.html` in the project folder, or the 🪄 Demo Day button on the Manager dashboard.

---

### Cheat sheet

| What | Where | Number to expect |
|---|---|---|
| Today's appointments | Dashboard card | 6 (4 completed, 1 pending, 1 cancelled) |
| Revenue | Revenue card | $215 = $120.50 staff + $94.50 salon |
| Walk-ins vs booked | Appointments/Revenue drill-down | 2 walk-ins ($60) + 4 booked ($155) |
| Split ticket | Revenue → first transaction | $85 = $35 @ 50% + $50 @ 60% |
| Rating | Rating card | (5+4+3+5) ÷ 4 = 4.25 |
| On duty | Staff card | 2 clocked in |
| Manager/Admin PIN | Closeout submit | 1111 (manager) / 0000 (admin) |
