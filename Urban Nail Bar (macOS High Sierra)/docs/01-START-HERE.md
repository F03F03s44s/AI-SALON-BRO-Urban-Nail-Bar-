# 01 — Start Here (One-Click)

← [Manual index](README.md) · Next: [02 — Bat & Scripts](02-BAT-AND-SCRIPTS.md)

All launchers live in **`scripts/`** (plus a root stub). Keep the whole **URBAN NAIL BAR** folder together.

**Simple guides:** root `HOW-TO-START.md` + `HOW-TO-USE.md`. **First time?** Use the short checklist → **[FIRST-LAUNCH.md](FIRST-LAUNCH.md)**

---

## Primary path: START-SALON / EVERYTHING

**For first launch, double-click START-SALON / EVERYTHING only.**

| Your computer | Double-click |
|---|---|
| **Windows** | **`START-SALON.bat`** at repo root, or `scripts\START-SALON.bat` |
| **macOS Big Sur 11.7.10** (or newer) | `scripts/EVERYTHING-MACOS-BIG-SUR-11.7.10.command` |
| **macOS High Sierra 10.13** | `scripts/EVERYTHING-MACOS-HIGH-SIERRA-10.13.command` |

**Aliases (same as START-SALON on Windows):**

- `scripts\EVERYTHING-WINDOWS.bat` → `START-SALON.bat`
- `scripts\START-ALL-WINDOWS.bat` → `START-SALON.bat`
- `START-ALL-MACOS-BIG-SUR.command` → Big Sur EVERYTHING
- `START-ALL-MACOS-HIGH-SIERRA.command` → High Sierra EVERYTHING

---

## What START-SALON / EVERYTHING does

1. Checks **Node.js**
2. Installs `server/` npm packages if missing
3. Downloads **Caddy** if missing (HTTPS proxy for the permanent domain)
4. Optionally regenerates icons/assets if Python is available
5. Starts the salon + AI server — Staff **`http://localhost:3001`** · Public booking **`http://localhost:3002`**
6. Opens **Home** + **Public booking** in the browser (prints other useful URLs)
7. Starts **Caddy** for `https://urban-nail-bar.work.gd` when DNS Exit is configured; otherwise a **temp** tunnel (Tailscale Funnel → Pinggy) — not unlimited forever

**Leave the server window and the public/Caddy window open.** Closing them stops the system and/or the public link.

---

## 1) Windows

1. Install [Node.js LTS](https://nodejs.org) if needed.
2. Double-click **`START-SALON.bat`** in the **URBAN NAIL BAR** folder (or in `scripts\`).
3. Use:
   - Staff / Home: `http://localhost:3001`
   - Online booking: `http://localhost:3002`, a temp tunnel URL, or `https://urban-nail-bar.work.gd/booking.html`

**First time on a brand-new PC (optional full setup):** run `SETUP-ALL.bat` once (icons, QR, Instagram post, npm, validate), then use START-SALON daily.

---

## 2) macOS Big Sur 11.7.10 (or newer)

**Need once:** Node.js **18** LTS — https://nodejs.org/dist/latest-v18.x/  
or `brew install node@18`

**First time only** (Terminal):

```bash
cd "/path/to/URBAN NAIL BAR/scripts"
chmod +x "EVERYTHING-MACOS-BIG-SUR-11.7.10.command" "START-ALL-MACOS-BIG-SUR.command"
```

If macOS blocks it: right-click the `.command` file → **Open** → **Open**.

**Every day:** double-click **`EVERYTHING-MACOS-BIG-SUR-11.7.10.command`**.

---

## 3) macOS High Sierra 10.13

**Need once:** Node.js **14 only** (newer Node 17+ will not run on High Sierra)  
https://nodejs.org/download/release/v14.21.3/ → `node-v14.21.3.pkg`

**First time only** (Terminal):

```bash
cd "/path/to/URBAN NAIL BAR/scripts"
chmod +x "EVERYTHING-MACOS-HIGH-SIERRA-10.13.command" "START-ALL-MACOS-HIGH-SIERRA.command"
```

If blocked: right-click → **Open** → **Open**.

**Every day:** double-click **`EVERYTHING-MACOS-HIGH-SIERRA-10.13.command`**.

---

## Which URL to use

| Who | URL |
|---|---|
| Staff / front desk / admin / website | `http://localhost:3001` → Home (`index.html`) |
| Customers on this computer | `http://localhost:3002` |
| **Online (permanent / free forever)** | `https://urban-nail-bar.work.gd` — [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md) · [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md) |
| Temporary public link (fallback) | Tailscale `*.ts.net` or Pinggy `https://…` (~60 min) — not unlimited forever |

| Permanent page | URL |
|---|---|
| Website | `https://urban-nail-bar.work.gd/pages/website.html` |
| Customer booking | `https://urban-nail-bar.work.gd/booking.html` |
| Scheduler | `https://urban-nail-bar.work.gd/pages/scheduler.html` |

Online booking sign-in is **phone number only** (no PIN). New customers enter their name the first time. SMS consent is required.

---

## Staff vs public (important)

| Port | What it is | Share? |
|---|---|---|
| **3001** | Full salon system (Scheduler, Staff, Manager, Admin, Website, in-salon Booking) | LAN / permanent domain (PIN-protected staff pages) |
| **3002** | Customer booking only (`/booking.html` on the permanent domain) | **Yes** — share booking URL with customers |

On `urban-nail-bar.work.gd`, path routing sends customer booking to **3002** and other pages to **3001**. Prefer sharing **`/booking.html`**, not Scheduler/Admin.

---

## Other start options

| Need | Script |
|---|---|
| Staff salon only (no tunnel) | `OPEN-SALON.bat` |
| Public access menu (forever vs temp) | `START-PUBLIC-FREE.bat` |
| Public tunnel (server + messaging) | `GO-PUBLIC.bat` (`START-PUBLIC.bat` aliases to it) |
| Server only | `START-KIMI-SERVER.bat` |
| Health check | `VALIDATE.bat` |
| Permanent domain (`urban-nail-bar.work.gd`) | `RUN-PERMANENT-TUNNEL.bat` as admin (DNS once: [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md)) |
| One-time Caddy + DNS Exit API key setup | `SETUP-PERMANENT-LINK.bat` |

Full list → [02-BAT-AND-SCRIPTS.md](02-BAT-AND-SCRIPTS.md)

---

## MacOS folder + Windows folder (keep in sync)

You have two copies side by side:

- `Urban Nail Bar (Windows)` — daily driver on Windows (Caddy / permanent domain)
- `Urban Nail Bar (MacOS)` — same app for Sierra 10.12.6 and Big Sur 11.7.10

**Code / files:** after any update on one computer, run **`scripts\SYNC-BOTH-FOLDERS.bat`** (Windows) or **`scripts/SYNC-BOTH-FOLDERS.command`** (Mac) so both folders match.

**Live salon data (appointments, clients, PINs):** only **one** computer should run the Node server. Other computers and phones open that server’s URL (LAN IP, Tailscale, or `https://urban-nail-bar.work.gd`). Do **not** start the server in both folders at once — that creates two databases.

Recommended launch layout:

| Machine | Role |
|---|---|
| Main Windows PC | Run `START-SALON.bat` (source of truth + permanent domain) |
| Mac Sierra / Big Sur | Browse the Windows PC’s staff/booking URLs, **or** run EVERYTHING only when that Mac is the only open server |

---

## Daily checklist

1. Run **START-SALON** (Windows) or **EVERYTHING** (macOS) from `scripts/` (or root stub).
2. Confirm Home (`3001`) + booking (`3002`) open.
3. Leave server + tunnel windows open.
4. Share the tunnel URL for remote booking.
5. End of day: close those windows (or leave running overnight if you prefer).

---

## Common fixes (quick)

| Problem | Fix |
|---|---|
| Node not found | Install the Node version for your OS (above) |
| Mac double-click does nothing | `chmod +x` that `.command` in `scripts/` |
| Mac “can’t be opened” | Right-click → Open |
| No public / domain link | Check Netgear 80/443 forward; or install Tailscale / OpenSSH for temp; local `3001`/`3002` still work |
| Port in use | Close old server windows or restart the PC |
| AI / Voice silent | Allow mic; use Chrome/Edge on localhost/HTTPS; local FAQ still works offline |

More → [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md)
