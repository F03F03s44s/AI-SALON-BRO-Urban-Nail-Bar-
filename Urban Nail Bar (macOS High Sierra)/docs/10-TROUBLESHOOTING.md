# 10 — Troubleshooting

← [09 — AI Assistant](09-AI-ASSISTANT.md) · [Manual index](README.md)

Run `scripts/VALIDATE.bat` first when something looks wrong — it points at specific files.

---

## Node.js

| Symptom | Fix |
|---|---|
| “Node is not installed” / `node` not found | Install Node for your OS ([01-START-HERE.md](01-START-HERE.md)): Windows LTS, Big Sur **18**, Sierra **14.21.3** |
| Sierra crashes on start | Downgrade to Node 14 — Node 17+ is usually too new |
| `npm install` fails | Check internet; run from `server/`; retry EVERYTHING or `SETUP-ALL.bat` |

---

## Ports 3001 / 3002

| Symptom | Fix |
|---|---|
| Page won’t load | Confirm server window is open (`START-KIMI-SERVER` / EVERYTHING) |
| “Port in use” / old instance | Close old “Kimi AI Server” windows; Windows launcher kills listeners on 3001; Mac EVERYTHING frees 3001/3002 |
| Booking on wrong port | Customers → **3002** or tunnel; staff → **3001** |
| Using `file://` | Don’t — open via `http://localhost:3001` so sync + PWA work |

---

## Public link / permanent domain

| Symptom | Fix |
|---|---|
| No temp URL | Install Tailscale (Funnel) or OpenSSH Client (Pinggy); check internet |
| Pinggy link changed / timed out | Expected (~60 min) — use Caddy + DNS Exit for free forever domain |
| WAN 80 = router login | Netgear Remote Management still on 80 — disable it ([DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md)) |
| WAN 443 refused | Add TCP 443 port forward to salon PC LAN IP |
| Tunnel / Caddy window closed | Public remote booking stops; local 3001/3002 may still work |
| Permanent domain not loading | Set DNS Exit **A** record + port-forward 80/443 per [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md); run `RUN-PERMANENT-TUNNEL.bat` as admin |
| `urban-nail-bar.work.gd` → `0.0.0.0` or wrong IP | Set DNS Exit **A** record to your public IP; confirm DDNS is running |
| HTTPS / cert errors | Run Caddy as Administrator; confirm router forwards 80 + 443 |
| Customers see staff tools | Share **`/booking.html`** only (port 3002 path); do not send clients to Scheduler/Admin |

---

## Hard refresh / cache

After code updates, browsers can keep old JS/CSS:

- Windows: **Ctrl+F5** (or Ctrl+Shift+R)
- Mac: **Cmd+Shift+R**
- Optional: run `UPDATE-SALON.bat` to bump cache-bust query strings

---

## Sync / data

| Symptom | Fix |
|---|---|
| Phones don’t see desk changes | Both must use HTTP via the salon server (`localhost:3001` or LAN IP); public booking uses server data-store |
| Changes vanish after restart | Confirm `server/data-store.json` is updating; don’t clear browser storage casually |
| Two PCs diverge | Only one “source of truth” server should own `data-store.json`; prefer single salon PC + tunnel |
| Need undo | Admin → Data → snapshots / Backup Now / import |

---

## Login / PIN / booking auth

| Symptom | Fix |
|---|---|
| Invalid PIN | Check Admin Security / staff PIN; defaults in [07-ROLES-AND-PINS.md](07-ROLES-AND-PINS.md) |
| Tech can’t open Scheduler | By design — use **My Schedule** |
| Phone sign-in fails | Use public booking URL; full phone digits; check SMS consent box |
| Locked out after PIN change | Expected — log in with the new PIN |

---

## AI

| Symptom | Fix |
|---|---|
| Assistant silent | Server running; `.env` configured; hard refresh |
| Voice broken | Mic permission; HTTPS or localhost; type as fallback |

See [09-AI-ASSISTANT.md](09-AI-ASSISTANT.md).

---

## macOS launcher issues

| Symptom | Fix |
|---|---|
| Double-click does nothing | `chmod +x` the `.command` file in `scripts/` |
| “Cannot be opened” / quarantine | Right-click → **Open** → Open; or remove quarantine on downloaded binaries |
| Wrong EVERYTHING for OS | Big Sur → Big Sur script; Sierra → Sierra script (Node versions differ) |

---

## Validation

```text
scripts/VALIDATE.bat
```

or from repo root:

```bash
node validate.js
```

Green = healthy. Any ✗ line names the problem file.

---

## Still stuck?

1. Close all salon/server/tunnel windows.  
2. Rerun the correct **EVERYTHING** script.  
3. Open only `http://localhost:3001` and `http://localhost:3002`.  
4. Hard refresh.  
5. Run **VALIDATE**.  

Back to [README.md](README.md) · [01-START-HERE.md](01-START-HERE.md)
