# 06 — Pages & Buttons

← [05 — Operator Manual](05-OPERATOR-MANUAL.md) · [Manual index](README.md) · Next: [07 — Roles & PINs](07-ROLES-AND-PINS.md)

What each page is for, and the main navigation / controls.

Shared chrome on staff pages: **Home** first, then role-aware tabs (Scheduler **or** My Schedule, Admin, Manager, Staff Members, Booking, Website) via `shared/app-nav.js`. Live sync chip shows when data sync is healthy.

---

## Home (`index.html`) — `http://localhost:3001`

Central portal. Log in with PIN; tiles adjust by role.

| Control | Purpose |
|---|---|
| **Book Appointment** | Opens public booking (`http://localhost:3002/`) |
| **Website** | Marketing site |
| **Website** card | Same |
| **Online Booking** card | Public booking on 3002 |
| **Scheduler** | Full day board — shown for desk roles / when logged out (unlock on open) |
| **My Schedule** | Tech personal calendar — shown for technician-only sessions |
| **Staff Members** | Staff portal (hidden when tech already has My Schedule tile) |
| **SMS Blast** / **Reminders** | **Alert** tools (receptionist / manager / admin) |
| **Manager** / **Admin** | Ops & owner tools |
| Session line | Shows who is logged in · **Log out** |
| Phone setup QR block | Staff My Schedule URL + client booking URL |

Role rules: techs → My Schedule; desk → Scheduler + Alert.

---

## Website (`pages/website.html`)

Public marketing on port 3001: About, salon vs work galleries, services, reviews, policy, contact / map.

| Control | Purpose |
|---|---|
| **Book Now** / booking CTAs | Send customers to online booking |
| Nav sections | Jump to site content |
| **UNB AI ASSISTANT** ✨ FAB | Black/gold chat; **Voice** for speak + listen |

---

## Booking (`pages/booking.html`) — port 3001

In-salon / staff-origin booking. Same product rules as public.

| Step / control | Purpose |
|---|---|
| Phone + **SMS consent** | Required to continue |
| Login marketing block | Galleries / promo — **login screen only** |
| After sign-in | Appointments list + book UI (no marketing clutter) |
| Service cards + **Add-ons** under category | Per-category add-ons (no Combos tab) |
| Date / tech / time | Slot picking |
| Special requests | Notes |
| **Confirm booking** | Final submit (enabled when service + date + time set) |
| UNB AI ✨ | Helps pick service/date/tech/time |

---

## Public Booking (`pages/public-booking.html`) — port 3002 / tunnel

Customer-facing booking. Share this URL only. Phone login; public-safe APIs.

Same flow pattern as Booking: marketing on login → appointments after sign-in → confirm. UNB AI with public-safe profile.

---

## Confirm Appointment (`pages/confirm-appointment.html`)

Client landing for confirm links (2-hour / reminder cadence). Confirms attendance via public API.

---

## Scheduler (`pages/scheduler.html`)

**PIN:** admin, manager, receptionist. Technicians are redirected to My Schedule.

### Top bar (high traffic)

| Button | Purpose |
|---|---|
| **Checkout** | Payment / ticket section |
| **New Appt** | Book a scheduled appointment |
| **Walk-In** | Add walk-in |
| Notifications | Client / staff / deleted notif tabs |
| Messages | Message center |
| UNB AI dropdown | Book / cancel / reschedule / move with confirm; **Voice** (black/gold) |

### Stats / header panels

| Panel | Purpose |
|---|---|
| Waitlist / other day stats | Counts; click to open filtered lists |
| Ready for Checkout | Tickets waiting for payment |
| Calendar pills (e.g. Payment) | Jump to checkout filter |

### Sidebar

| Item | Purpose |
|---|---|
| **Home** | Back to portal |
| **Calendar** | Day board |
| **Clients** | Client table |
| **Staff** | Staff list / status |
| **Messages** | Inbox |
| **Checkout** | Full checkout UI |
| **POS Tickets** | Open / closed tickets |
| **Closing Out** | Register closeout modal |
| **Services** | Menu editor view |
| **Inventory** | Stock |
| **Gift Cards** | Gift card tools |
| **Marketing** | Promo tools |
| **Analytics** | Charts / stats |
| **Expenses** | Expense log |
| **Reminder Outbox** | Outbound reminder queue |
| **Settings** | Scheduler settings |
| **Time Clock** | Desk time clock |
| **Reviews** | Review list |
| **Reward Stats** | Competition / rewards |

### Checkout essentials

Search client → ready list → assign **each service to a tech** → discounts / tender → complete. Walk-In client button available inside checkout.

---

## Staff Members & My Schedule (`pages/staff.html`)

Any active staff PIN. Techs land on **My Schedule**.

| Sidebar / control | Purpose |
|---|---|
| **My Schedule** | Personal appointments |
| **Time Clock** | Clock in/out / breaks |
| Clock In / Out | Shift tracking (clock-out may need closeout match) |
| **Request Time Off** | Vacation / emergency request |
| Performance periods | Today / week / month / year stats |
| UNB AI widget | Scoped to **your** schedule only |

Standalone phone PWA: `pages/my-schedule.html` (+ manifest / service worker).

---

## Manager (`pages/manager.html`)

**PIN:** manager or admin.

| Sidebar | Purpose |
|---|---|
| **Dashboard** | Today’s KPIs + drill-downs |
| **Schedule** | Duty board (late / sick / vacation) |
| **Staff** | Staff table |
| **Clients** | Client table |
| **Reports** | Range reports |
| **Closeout** | End-of-day register gate |
| **Inventory** | Polish / stock (Quick Add Polish) |

Also: Demo Day / Clear Demo when present on dashboard.

---

## Admin (`pages/admin.html`)

**PIN:** admin master only for full page.

| Sidebar | Purpose |
|---|---|
| **Overview** | Snapshot |
| **Staff** | Hire / edit / roles / PINs |
| **Clients** | Full client admin |
| **Closeouts** | History + variance / override flags |
| **Payroll** | Generate / print stubs |
| **Tax** | Tax center |
| **Notifications** | Notification settings |
| **Security** | Master PINs, access policy |
| **Data** | Backups, export/import, demo, danger zone |
| **System** | System / salon settings |

---

## Alert — Reminders (`pages/reminders.html`)

**PIN:** admin, manager, receptionist.  
Appointment reminder tooling / cadence UI (ties to client SMS settings in DataManager).

---

## Alert — SMS Blast (`pages/sms-blast.html`)

**PIN:** admin, manager, receptionist.  
Compose and send bulk SMS campaigns to clients.

---

## Global navigation notes

- **Home** appears on every staff app header/sidebar when possible.
- Logged-in **technician-only** users see **My Schedule** instead of **Scheduler** in nav.
- Public tunnel nav is booking-only (no staff links).
- Logging out revokes the shared staff session across tabs.

---

## Related

- [05-OPERATOR-MANUAL.md](05-OPERATOR-MANUAL.md)  
- [08-BOOKING-AND-PUBLIC.md](08-BOOKING-AND-PUBLIC.md)  
- [09-AI-ASSISTANT.md](09-AI-ASSISTANT.md)
