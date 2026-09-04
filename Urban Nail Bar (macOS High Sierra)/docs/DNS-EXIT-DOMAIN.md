# Permanent domain — urban-nail-bar.work.gd (DNS Exit + Caddy)

This salon uses **free Caddy** (HTTPS reverse proxy) plus **DNS Exit Dynamic DNS** so `https://urban-nail-bar.work.gd` reaches the PC running Urban Nail Bar.

**No Cloudflare.** This is the only honest **unlimited + forever + free + custom domain** path in the project. It needs router port-forward TCP **80** and **443** → the salon PC.

Short comparison (domain vs Funnel vs temp): [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md)

DNS for `*.work.gd` is managed at **[DNS Exit](https://dnsexit.com/)**.

---

## Exact DNS record (DNS Exit)

Create **one A record** (Dynamic DNS will keep the IP current):

| Field | Value |
|---|---|
| **Type** | `A` |
| **Name / Host** | `urban-nail-bar` (or `urban-nail-bar.work.gd` if the UI wants the FQDN) |
| **Value / Points to** | Your salon PC’s **public IPv4** (see below) |
| **TTL** | 300 or Automatic |

**Delete** any old CNAME to Cloudflare / `cfargotunnel.com` / trycloudflare leftovers.

### How to get your public IP

1. On the salon PC, open https://api.ipify.org in a browser, **or**
2. Run `scripts\SETUP-PERMANENT-LINK.bat` — it prints the current public IP.

### Dynamic DNS (required if your ISP changes IP)

1. At DNS Exit → **Settings** → create an **API Key**.
2. Copy `server\dnsexit.env.example` → `server\dnsexit.env`.
3. Paste the API key into `DNSEXIT_API_KEY=…`.
4. `scripts\RUN-PERMANENT-TUNNEL.bat` / `START-SALON.bat` start `UPDATE-DNSEXIT-IP.bat`, which refreshes the A record about every 5 minutes.

Do **not** point the domain at a temporary tunnel URL.

---

## Netgear R6700v3 — port forward (exact steps)

Your domain stays dark until the router sends internet traffic on 80/443 to this PC.

**Current failure pattern:** WAN **443** = connection refused (no forward); WAN **80** = Netgear login page (Remote Management stealing port 80). Both must be fixed below.

1. Find the salon PC’s **LAN IPv4** (e.g. `192.168.1.50`):
   - Windows: open Command Prompt → `ipconfig` → **IPv4 Address** under your Wi‑Fi/Ethernet adapter  
   - Or: Settings → Network → your connection → Properties
2. On a phone/PC on the same Wi‑Fi, open the router admin page (usually `http://192.168.1.1` or `http://www.routerlogin.net`).
3. Sign in (Netgear default is often on the router sticker; change it if still default).
4. Go to **Advanced** → **Advanced Setup** → **Port Forwarding / Port Triggering**.
5. Choose **Port Forwarding** → **Add Custom Service** (wording may vary slightly by firmware).
6. Create **two** rules (or one rule covering both ports if your UI allows a range):

| Service name | External port | Internal port | Internal IP | Protocol |
|---|---|---|---|---|
| UNB-HTTP | **80** | **80** | *(salon PC LAN IP)* | **TCP** |
| UNB-HTTPS | **443** | **443** | *(salon PC LAN IP)* | **TCP** |

7. **Apply / Save**.
8. **Disable remote management on 80/443** so it does not steal those ports:
   - **Advanced** → **Remote Management** (or **Administration** → **Remote Management**)
   - Turn **Remote Management OFF**, **or** set it to a high port that is **not** 80 or 443
9. Optional but recommended: give the salon PC a **reserved/static DHCP lease** (LAN Setup / Address Reservation) so the internal IP does not change after a reboot.
10. Windows Firewall: allow inbound TCP **80** and **443** for `server\caddy.exe` (or Private/Public inbound rules for those ports).
11. Test: run `START-SALON.bat` **as Administrator**, leave Caddy open, then from a phone on **cellular data** (not Wi‑Fi) open `https://urban-nail-bar.work.gd/booking.html`.

If visitors still cannot connect after DNS shows your public IP, your ISP may use **CGNAT** (no real public IPv4). Ask the ISP for a public IP / disable CGNAT, or use Tailscale Funnel meanwhile ([GO-ONLINE-FREE.md](GO-ONLINE-FREE.md)).

---

## How traffic is routed (after DNS + Caddy are up)

| URL | Goes to | What it is |
|---|---|---|
| `https://urban-nail-bar.work.gd/` | Port **3001** | Staff Home |
| `https://urban-nail-bar.work.gd/pages/website.html` | Port **3001** | Public website |
| `https://urban-nail-bar.work.gd/pages/scheduler.html` | Port **3001** | Scheduler |
| `https://urban-nail-bar.work.gd/pages/booking.html` | Port **3001** | In-salon booking |
| `https://urban-nail-bar.work.gd/booking.html` | Port **3002** | Customer-safe online booking (share this) |
| `https://urban-nail-bar.work.gd/confirm.html` | Port **3002** | Appointment confirm links |

Staff pages stay PIN-protected. Prefer sharing **`/booking.html`** with customers (not Scheduler / Admin).

---

## How to start

1. Run **`scripts\SETUP-PERMANENT-LINK.bat`** once (downloads Caddy, creates `dnsexit.env`, prints IP).
2. Set the DNS Exit **A** record (above) and **Netgear** port forwards.
3. **Right-click → Run as administrator:** **`scripts\RUN-PERMANENT-TUNNEL.bat`**  
   — or **`START-SALON.bat`** as admin (uses Caddy when `dnsexit.env` is configured).
4. Leave open: **server** window, **DDNS** window, and **Caddy** window.

Local URLs still work: `http://localhost:3001` (staff) · `http://localhost:3002` (booking).

Chooser: **`scripts\START-PUBLIC-FREE.bat`** (permanent vs temp). Overview: [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md).

---

## Verify DNS

```text
nslookup urban-nail-bar.work.gd
```

You should see **your public IPv4**, not `0.0.0.0`.

Then open:

- Website: `https://urban-nail-bar.work.gd/pages/website.html`
- Booking: `https://urban-nail-bar.work.gd/booking.html`
- Scheduler: `https://urban-nail-bar.work.gd/pages/scheduler.html`

---

## Without port-forward (not the permanent domain)

| Option | Script | Reality |
|---|---|---|
| **Tailscale Funnel** | `START-PUBLIC-FREE.bat` → 2 / `START-FREE-TUNNEL.bat` | Free Personal `*.ts.net`; longer than Pinggy; not commercial Personal terms; not `work.gd` |
| **Pinggy TEMP** | same if Tailscale missing | ~**60 minutes**, URL changes — not unlimited |

See [GO-ONLINE-FREE.md](GO-ONLINE-FREE.md).

---

## Blockers / troubleshooting

| Symptom | Likely cause |
|---|---|
| Site never loads / `0.0.0.0` | A record not set (or still parked) at DNS Exit |
| HTTPS / Let’s Encrypt fails | Ports 80/443 not forwarded, or bat not run as Administrator |
| Connection times out after DNS looks right | Netgear forward missing / remote management on 80/443 / CGNAT / firewall / Caddy closed |
| Booking blank / API errors | Server not running (need ports 3001 **and** 3002) |
| DDNS errors | Bad/missing `server\dnsexit.env` API key |
| Port 80 “forbidden by its access permissions” | IIS / HTTP.sys — run `scripts\FREE-PORTS-FOR-CADDY.bat` as admin |

**Secrets:** `server\dnsexit.env` stays on this PC (gitignored). Do not commit or paste the API key into chat.

This app **is** the live website — do not point customers at old Urban Nail Bar domains.
