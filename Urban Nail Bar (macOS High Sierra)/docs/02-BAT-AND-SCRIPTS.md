# 02 — Bat Files & Scripts

← [01 — Start Here](01-START-HERE.md) · [Manual index](README.md) · Next: [03 — System Overview](03-SYSTEM-OVERVIEW.md)

All `.bat` and `.command` files live in **`scripts/`**, plus an optional root stub.  
They `cd` to the repo root automatically — safe to double-click from `scripts/` or root.

**Primary path:** [START-SALON / EVERYTHING](01-START-HERE.md) · [FIRST-LAUNCH.md](FIRST-LAUNCH.md)

**For first launch, double-click START-SALON / EVERYTHING only.**

---

## One-click “everything”

| File | OS | What it does |
|---|---|---|
| **`START-SALON.bat`** | Windows | **Canonical** one-click: Node → npm if needed → Caddy → optional assets → AI/salon server (3001+3002) → open Home + public booking → Caddy domain or temp tunnel (Tailscale Funnel → Pinggy) |
| `EVERYTHING-WINDOWS.bat` | Windows | Alias → `START-SALON.bat` |
| `START-ALL-WINDOWS.bat` | Windows | Alias → `START-SALON.bat` |
| `../START-SALON.bat` | Windows | Root stub → `scripts\START-SALON.bat` (easiest double-click) |
| `EVERYTHING-MACOS-BIG-SUR-11.7.10.command` | macOS Big Sur 11+ | Same flow; Tailscale Funnel if present, else Pinggy TEMP |
| `EVERYTHING-MACOS-HIGH-SIERRA-10.13.command` | macOS High Sierra 10.13 | Same flow; tuned for Node 14; Pinggy TEMP via ssh |
| `START-ALL-MACOS-BIG-SUR.command` | macOS | Alias → Big Sur EVERYTHING |
| `START-ALL-MACOS-HIGH-SIERRA.command` | macOS | Alias → High Sierra EVERYTHING |

---

## Day-to-day helpers

| File | What it does |
|---|---|
| `START-KIMI-SERVER.bat` | Starts Node only: `server/kimi-proxy-server.js` (ports **3001** + **3002**). Kills anything already listening on 3001. Used by other launchers. **Keep this window open.** |
| `OPEN-SALON.bat` | Staff salon only (no public tunnel). Starts server minimized, opens `http://localhost:3001/index.html` |
| `GO-PUBLIC.bat` | Server + Home + public booking + permanent Caddy if configured, else `START-FREE-TUNNEL.bat` |
| `START-PUBLIC.bat` | Alias → `GO-PUBLIC.bat` |
| `START-PUBLIC-FREE.bat` | Menu: permanent Caddy / temp tunnel / setup wizard — see [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md) |
| `START-FREE-TUNNEL.bat` | Temp only: Tailscale Funnel if ready, else Pinggy (~60 min) |
| `START-TAILSCALE-FUNNEL.bat` | Expose port 3002 via Tailscale Funnel (`*.ts.net`) |
| `VALIDATE.bat` | Runs `node validate.js` health check from repo root |
| `SYNC-BOTH-FOLDERS.bat` / `.command` | Keep **Urban Nail Bar (Windows)** and **(MacOS)** folders identical after edits |
| `SYNC-FOLDERS.ps1` | Engine used by SYNC-BOTH-FOLDERS (copy code, assets, data, secrets; skips `node_modules` / `.git`) |
| `SETUP-ALL.bat` | First-time Windows setup: Python packages, `setup-assets.py`, Caddy, `npm install` in `server/`, QR sign + IG post regen, validate |
| `UPDATE-SALON.bat` | Cache-bust bump for pages (calls an external `bump_version.py` if present; falls back to system Python) |
| `SETUP-PERMANENT-LINK.bat` | One-time Caddy + `dnsexit.env` setup for `urban-nail-bar.work.gd` (see [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md)) |
| `RUN-PERMANENT-TUNNEL.bat` | Starts server + DNS Exit DDNS + **Caddy** for `https://urban-nail-bar.work.gd` (run as Administrator) |
| `UPDATE-DNSEXIT-IP.bat` | Keeps the DNS Exit A record pointed at your current public IP |
| `ENSURE-CADDY.bat` | Downloads `server\caddy.exe` if missing |
| `FREE-PORTS-FOR-CADDY.bat` | Stops IIS / frees ports 80–443 so Caddy can bind (run as admin) |

---

## How paths work

Every script starts with:

- **Windows:** `cd /d "%~dp0.."` → repo root (root stub uses `%~dp0scripts\`)
- **macOS:** `ROOT="$(cd "$(dirname "$0")/.." && pwd)"`

So `server/`, `pages/`, `assets/`, and `validate.js` resolve correctly when you launch from `scripts/` or the root stub.

---

## Inventory (on disk)

```
START-SALON.bat                 ← root stub (calls scripts\)
scripts/
  START-SALON.bat               ← canonical Windows one-click
  EVERYTHING-WINDOWS.bat        ← alias → START-SALON
  EVERYTHING-MACOS-BIG-SUR-11.7.10.command
  EVERYTHING-MACOS-HIGH-SIERRA-10.13.command
  START-ALL-WINDOWS.bat
  START-ALL-MACOS-BIG-SUR.command
  START-ALL-MACOS-HIGH-SIERRA.command
  START-KIMI-SERVER.bat
  OPEN-SALON.bat
  GO-PUBLIC.bat
  START-PUBLIC.bat              ← alias → GO-PUBLIC
  START-PUBLIC-FREE.bat         ← free forever vs temp menu
  START-FREE-TUNNEL.bat         ← Tailscale Funnel → Pinggy
  START-TAILSCALE-FUNNEL.bat
  VALIDATE.bat
  SETUP-ALL.bat
  UPDATE-SALON.bat
  SETUP-PERMANENT-LINK.bat
  RUN-PERMANENT-TUNNEL.bat
  UPDATE-DNSEXIT-IP.bat
  ENSURE-CADDY.bat
  FREE-PORTS-FOR-CADDY.bat
```

---

## Related

- [01-START-HERE.md](01-START-HERE.md) — when to use which OS launcher  
- [FIRST-LAUNCH.md](FIRST-LAUNCH.md) — first-time checklist  
- [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md) — tunnel / port / Node failures  
- Alias: [BAT-FILES.md](BAT-FILES.md)
