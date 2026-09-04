# Go online free — Urban Nail Bar

Honest map of what is free forever vs temporary.

---

## Unlimited forever + custom domain

**Path:** Caddy + DNS Exit A record → `https://urban-nail-bar.work.gd`

This is the only **unlimited, forever, no-pay, custom-domain** path already in this repo.

| Need | Why |
|---|---|
| DNS Exit A record | Points `urban-nail-bar.work.gd` at your public IP (DDNS keeps it updated) |
| Caddy on the salon PC | Free HTTPS (Let’s Encrypt) + reverse proxy to ports 3001/3002 |
| Router port-forward **TCP 80 + 443** → salon PC | Without this, the internet cannot reach Caddy |
| Run as Administrator | Windows usually needs elevation to bind 80/443 |

**Blocked today only by the Netgear not forwarding 80/443** (or ISP CGNAT). No Cloudflare required.

Full DNS + Caddy steps: [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md)  
Netgear R6700v3 steps: section below in that same doc (**Netgear R6700v3 port forward**).

### Start (permanent domain)

1. One-time: `scripts\SETUP-PERMANENT-LINK.bat`
2. Fix router (80 + 443 → this PC); disable remote management on 80/443 if it conflicts
3. **Right-click → Run as administrator:** `START-SALON.bat` or `scripts\RUN-PERMANENT-TUNNEL.bat`
4. Share: `https://urban-nail-bar.work.gd/booking.html`

---

## Free public URL without port-forward

**Path:** Tailscale Funnel (preferred) → Pinggy only as TEMP last resort

| Tool | Cost | Stays up | Custom domain | Notes |
|---|---|---|---|---|
| **Tailscale Funnel** | Free Personal account | While PC + Tailscale stay on | No (`*.ts.net` only) | Bandwidth-limited; Personal plan is marketed for **non-commercial** use |
| **Pinggy (free)** | Free | **~60 minutes**, URL changes | No | TEMP only — never call this unlimited |

### Start (no port-forward)

1. Double-click **`scripts\START-PUBLIC-FREE.bat`** → option **2**, or `GO-PUBLIC.bat` / `START-SALON.bat` when Caddy is not ready
2. Scripts try **Tailscale Funnel** first, then **Pinggy TEMP**
3. Or run `scripts\START-FREE-TUNNEL.bat` after the salon server is already up
4. Install Tailscale once: https://tailscale.com/download/windows → sign in → re-run

---

## What is NOT free forever here

- Free Pinggy — temporary (~60 min)
- Tailscale Funnel — longer than Pinggy, but `*.ts.net` only, bandwidth-limited, Personal plan not for commercial salon use
- Cloudflare Tunnel — **removed** from this project (do not reinstall for this salon)
- Paid VPS / paid tunnels — not required if you fix the router

True “free forever + `urban-nail-bar.work.gd` without port-forward” is not available in this stack. **Fix the Netgear forward** (see [DNS-EXIT-DOMAIN.md](DNS-EXIT-DOMAIN.md)).
