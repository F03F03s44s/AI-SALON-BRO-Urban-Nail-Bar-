# 07 — Roles & PINs

← [06 — Pages & Buttons](06-PAGES-AND-BUTTONS.md) · [Manual index](README.md) · Next: [08 — Booking & Public](08-BOOKING-AND-PUBLIC.md)

---

## ⚠ Change before go-live

Default master and demo PINs below ship in `shared/data-manager.js` for setup and demos.  
**Change every PIN in Admin → Security (and staff records) before real customer use.**  
Anyone who knows the defaults can open Admin, override closeouts, or clock as staff.

---

## Roles

| Role | Typical access |
|---|---|
| **admin** | Everything: Admin page, Scheduler, Manager, Alert, overrides, danger-zone clears |
| **manager** | Manager page, Scheduler, Alert, most ops; cannot change another manager/admin PIN (admin only) |
| **receptionist** | Scheduler + Alert (Reminders, SMS Blast); Front Desk account |
| **technician** | Staff Members / **My Schedule**, clock, own appointments — **not** the multi-staff Scheduler |

Multi-role staff are supported (`roles[]`). Primary role is the highest of admin → manager → receptionist → technician.

Customers on online booking: **phone only** — no staff PIN.

---

## Who can open what

| Page | Allowed |
|---|---|
| Home / Website / Booking pages | Open; staff tiles unlock by PIN |
| Scheduler | admin, manager, receptionist |
| My Schedule / Staff | any active staff PIN |
| Manager | manager or admin PIN |
| Admin | admin master PIN |
| Reminders / SMS Blast (Alert) | admin, manager, receptionist |
| Public booking (3002) | customers (phone + SMS consent) |

`SalonAuth.guardPage([...])` enforces this; wrong-role PIN shows “role does not have access.”

---

## Default master PINs

| PIN | Role | Notes |
|---|---|---|
| `0000` | **Admin** | Full control; only PIN that can force a mismatched closeout |
| `1111` | **Manager** | Manager tools + closeouts |

Stored as `adminPin` / `managerPin` in settings (change in Admin → Security).

---

## Default staff PINs (seed data)

| PIN | Name | Seed role |
|---|---|---|
| `1001` | Lance | manager |
| `1002` | Keith | admin |
| `1003` | Sky | admin |
| `1004` | Amy | technician |
| `1005` | Kathy | technician |
| `1006` | Danley | technician |
| `1007` | Kelly | technician |
| `1008` | Addison | technician |
| `1009` | Paula | technician |
| `1010` | Front Desk | receptionist (auto-created once if missing) |
| `9999` | Demo staff | Only after loading demo day |

Front Desk auto-create is one-time (`aiSalonPro_frontdesk_v1`). If you delete that account on purpose, it is not recreated.

---

## PIN change rules

- Changing any staff PIN requires admin or manager master PIN.
- **Only admin** may change a manager’s or admin staff member’s PIN.
- New PINs must be exactly **4 digits**.
- Changing master or staff PINs **revokes** existing sessions that used the old PIN.

---

## Session behavior

- One shared staff session across tabs/pages.
- Logout on one staff page re-locks others.
- Customers stay on phone session for booking only (separate from staff PIN).

---

## Related

- [05-OPERATOR-MANUAL.md](05-OPERATOR-MANUAL.md)  
- [06-PAGES-AND-BUTTONS.md](06-PAGES-AND-BUTTONS.md)  
- Admin Security UI on `pages/admin.html`
