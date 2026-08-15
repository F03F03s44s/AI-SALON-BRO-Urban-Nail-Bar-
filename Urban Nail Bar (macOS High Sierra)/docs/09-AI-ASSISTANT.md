# 09 — AI Assistant (UNB AI)

← [08 — Booking & Public](08-BOOKING-AND-PUBLIC.md) · [Manual index](README.md) · Next: [10 — Troubleshooting](10-TROUBLESHOOTING.md)

---

## Branding

| Element | Spec |
|---|---|
| Name | **UNB AI ASSISTANT** |
| FAB / mark | ✨ |
| Voice control | Single **Voice** button — black background, gold text/border |
| Not used | Separate Talk / Speak buttons (legacy Speak is hidden) |

Shared code: `shared/unb-ai-assist.js`  
Staff floating widget: `shared/staff-ai-widget.js` + `shared/salon-staff-ai.js`  
Server routes: `/api/salon-chat` (staff), `/api/client-chat` (customers — also on port **3002**)

Requires the salon server running (`START-SALON.bat` / EVERYTHING). API keys stay in `server/.env` only.  
If the cloud key is missing/offline, **local FAQ + command parsers still answer** hours/services and book/cancel/reschedule keywords.

---

## Voice

- One control: tap **Voice** to listen (mic) and speak replies (TTS).
- The Voice click unlocks browser speech (required on Chrome/Windows).
- Mic errors show a short toast in the chat panel (allow mic in the address bar).
- Use **Chrome or Edge** on `localhost` or HTTPS (tunnel). Unsupported browsers: type instead.

---

## Per-page behavior

| Page | What UNB AI does |
|---|---|
| **Website** | Salon Q&A (hours, services, policy, reviews). Guides to Book Now — does not change bookings here. |
| **Booking** | Help select service / party size / date / tech / time on the form; salon Q&A; discounts. Respects SMS consent. |
| **Public booking** | Same as booking, public-safe answers only (same-origin `/api/client-chat` on port 3002). |
| **Scheduler** | **Book / walk-in / cancel / reschedule / rebook / move** — confirm with yes/no. Look up clients, staff, board. |
| **Staff / My Schedule** | Scoped to **this** tech: own schedule, clock, own appointments. Does not manage other techs’ books. |
| **Admin** | Ops help + book / cancel / reschedule / walk-in with confirmation. |
| **Manager** | Ops / staff help + book / cancel / reschedule / walk-in with confirmation. |

Always: nail / wax / lash salon — declines hair services; does not invent availability.

---

## How staff should use it (desk)

1. Open Scheduler AI panel or the floating widget.
2. Type or tap **Voice**: e.g. “Book Jane with Amy at 2pm tomorrow for gel manicure.”
3. Walk-in example: “Walk-in Sam with Maria at 3pm for Gel Manicure.”
4. Confirm when asked (yes/no).
5. Verify the board updated.

---

## Troubleshooting AI

| Issue | Fix |
|---|---|
| No reply / network error | Server window open? Ports 3001/3002 up? Local FAQ should still work |
| Voice fails | Allow mic; Chrome/Edge; localhost or HTTPS; or type |
| Public booking AI dead on phone | Must use tunnel URL (not salon PC localhost). Same-origin `/api/client-chat` on 3002 |
| Wrong page capabilities | Expected — website cannot book; staff AI won’t edit other techs |
| Stale answers | Hard refresh; ensure you’re on `localhost`, not `file://` |

More → [10-TROUBLESHOOTING.md](10-TROUBLESHOOTING.md)

---

## Related

- [03-SYSTEM-OVERVIEW.md](03-SYSTEM-OVERVIEW.md)  
- [06-PAGES-AND-BUTTONS.md](06-PAGES-AND-BUTTONS.md)  
- [FIRST-LAUNCH.md](FIRST-LAUNCH.md)
