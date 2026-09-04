# 04 — File Map

← [03 — System Overview](03-SYSTEM-OVERVIEW.md) · [Manual index](README.md) · Next: [05 — Operator Manual](05-OPERATOR-MANUAL.md)

What the main folders and files are for. Docs-only map — runtime code is not listed exhaustively.

---

## Top-level layout

```
URBAN NAIL BAR/
├── README.md             ← Folder overview (Windows or MacOS copy)
├── HOW-TO-START.md       ← How to start THIS computer
├── HOW-TO-USE.md         ← Day-to-day how to use
├── START-SALON.bat       ← Windows one-click (Windows copy)
├── docs/                 ← Full manual (start at docs/README.md)
├── scripts/              ← All .bat / .command launchers
├── pages/                ← App HTML + PWA manifests / service workers
├── shared/               ← Shared JS + CSS used by all pages
├── server/               ← Node proxy, data store, Caddy, AI APIs
├── assets/               ← Brand, gallery, images, PWA icons
├── marketing/            ← IG post kit + generator
├── print/                ← QR sign / guide PDF generators
├── index.html            ← Home / portal
├── seed-demo-day.html    ← Demo data loader
├── validate.js           ← System health checker
├── static-server.js      ← Optional simple static serve (`npm run dev`)
├── setup-assets.py       ← Generate icons / placeholders
├── package.json          ← Root scripts (`dev`, `validate`)
└── requirements.txt      ← Python: Pillow, segno, reportlab
```

---

## `scripts/` — launchers

See **[02-BAT-AND-SCRIPTS.md](02-BAT-AND-SCRIPTS.md)** for every file.  
Primary: `EVERYTHING-WINDOWS.bat` / `EVERYTHING-MACOS-*.command`.

---

## `pages/` — applications

| File | Task |
|---|---|
| `website.html` | Public marketing site |
| `booking.html` | In-salon / port-3001 booking (phone login, marketing on login) |
| `public-booking.html` | Customer booking (served primarily via port 3002) |
| `confirm-appointment.html` | Client appointment confirmation |
| `scheduler.html` | Front-desk calendar, waitlist, checkout, POS |
| `staff.html` | Staff Members + My Schedule (`#myschedule`) |
| `my-schedule.html` | Standalone tech PWA schedule |
| `manager.html` | Manager dashboard & ops |
| `admin.html` | Admin / owner control center |
| `reminders.html` | Alert — reminders |
| `sms-blast.html` | Alert — SMS blast |
| `manifest-*.webmanifest` / `sw-*.js` | PWA install for booking / myschedule / public |

---

## `shared/` — core JS

| File | Task |
|---|---|
| `data-manager.js` | Salon data model, defaults, sync, backups, demo |
| `auth.js` | PIN auth + page guards |
| `app-nav.js` | Shared navigation |
| `utils.js` | Helpers; menu categories; add-on detection |
| `site-content.js` | Editable site/booking content helpers |
| `styles.css` | Shared styles / theme variables |
| `unb-ai-assist.js` | UNB AI ASSISTANT + Voice |
| `staff-ai-widget.js` | Floating AI widget |
| `salon-staff-ai.js` | Appointment actions for staff AI |
| `reminders.js` | Reminder utilities |
| `vendor/xlsx.full.min.js` | Excel import/export support |

---

## `server/` — backend

| File / folder | Task |
|---|---|
| `kimi-proxy-server.js` | Main Node server (3001 + 3002) |
| `package.json` | express, cors, dotenv, node-fetch (+ nodemon dev) |
| `data-store.json` | Live shared dataset |
| `.env` | Secrets / API keys (do not commit / share) |
| `caddy.exe` | Free HTTPS reverse proxy for `urban-nail-bar.work.gd` |
| `Caddyfile` | Path routing: booking → 3002, everything else → 3001 |
| `dnsexit.env` | DNS Exit API key for Dynamic DNS (gitignored) |
| `dnsexit.env.example` | Template for DNS Exit API key |
| `snapshot-*.json` | Optional business snapshot history |

---

## `assets/` — media

| Folder | Task |
|---|---|
| `brand/` | Logo, hero images, thumbs |
| `gallery/` | Salon / nail work galleries (+ thumbs) |
| `images/` | Icons, avatars, website imagery |
| `pwa/` | App icons (192 / 512 / Apple touch) |

---

## Packages

### Root `package.json` (`ai-salon-pro`)

| Script / dep | Purpose |
|---|---|
| `npm run dev` | `node static-server.js` (simple static; prefer Kimi server for full features) |
| `xlsx` | Spreadsheet support |

### `server/package.json` (`kimi-salon-proxy`)

| Dep | Purpose |
|---|---|
| `express` | HTTP server |
| `cors` | Cross-origin for APIs |
| `dotenv` | Load `.env` |
| `node-fetch` | Upstream AI / HTTP calls |
| `nodemon` (dev) | Auto-reload while developing |

### Python (`requirements.txt`)

Pillow, segno, reportlab — icons, QR codes, PDFs (`setup-assets.py`, `print/`, `marketing/`).

---

## Other useful roots

| Path | Task |
|---|---|
| `validate.js` / `VALIDATE.bat` | Health / integrity checks |
| `validation-log.txt` / `validation-history.json` | Validator history |
| `DEMO-SCRIPT.md` / `DEMO-CHEAT-SHEET.pdf` | Presenter materials |
| `marketing/` | Online booking kit + IG image generator |
| `print/` | Front-desk / manager / tech guides + QR sign |
| `tools/` | Optional checks (e.g. `verify-no-old-domain.py`) — not needed for daily ops |

---

## Related

- [03-SYSTEM-OVERVIEW.md](03-SYSTEM-OVERVIEW.md)  
- [01-START-HERE.md](01-START-HERE.md)
