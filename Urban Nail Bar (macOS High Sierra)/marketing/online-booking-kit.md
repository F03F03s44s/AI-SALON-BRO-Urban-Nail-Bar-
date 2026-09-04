# 📣 Online Booking — Marketing Kit (Urban Nail Bar)

Everything below is copy-paste ready. Replace **`{{BOOKING_LINK}}`** with your public booking link:

- **Permanent (recommended, free forever):** fix Netgear 80/443 → PC, then `SETUP-PERMANENT-LINK.bat` once and share `https://urban-nail-bar.work.gd/booking.html` (see `docs/GO-ONLINE-FREE.md`).
- **Today (no port-forward):** run `START-PUBLIC-FREE.bat` → option **2** (or `GO-PUBLIC.bat`). Prefer the Tailscale `*.ts.net` URL; Pinggy is TEMP (~60 min) only. Fine for stories/texts — not for Google Business. Public link is **customer booking only**; staff stays on the salon PC via `OPEN-SALON.bat`.

---

## 1. Google Business Profile (the big one)

**Steps:** business.google.com → your profile → **Edit profile** → **Booking** (or "Booking links") → paste **`{{BOOKING_LINK}}`** → Save.

**Also add a Google Post (Update):**
> ✨ Now booking online! Skip the wait — pick your service, pick your time, done in under a minute. Manicures, pedicures, dip powder, gel-x & nail art at Urban Nail Bar, Scottsdale. Tap "Book online" or call (480) 291-5440. Walk-ins always welcome!
>
> Button: **Book now** → **`{{BOOKING_LINK}}`**

---

## 2. Instagram

**Bio (edit profile → Website):** paste **`{{BOOKING_LINK}}`**
**Bio text:**
> 💅 Urban Nail Bar | Scottsdale
> ✨ Now booking online — tap below 👇
> 📍 9290 E Vía de Ventura #103 · 📞 (480) 291-5440

**Caption A (with the post image `ig-booking-post.png`):**
> BIG NEWS ✨ You can now book your nail appointments ONLINE! 💅📲
> No more waiting, no more phone tag — pick your service, pick your time, done in under a minute.
> Scan the code or tap the link in bio 🔗
> Walk-ins still always welcome 💛
> #UrbanNailBar #ScottsdaleNails #NailSalon #OnlineBooking #Manicure #Pedicure #DipPowder #GelX #NailArt #ScottsdaleAZ #NailTech #BookNow

**Caption B (short & punchy):**
> Your next set is 3 taps away 💅📲 Book online now — link in bio! #ScottsdaleNails #UrbanNailBar #NailAppointment

**Caption C (promo angle):**
> ✨ $5 OFF any Mani + Pedi combo — and now you can book it ONLINE! Tap the link in bio, pick your time, and we'll have the polish ready 💛 #UrbanNailBar #ScottsdaleNails #ManiPedi

**Story idea:** post the same image with a **Link sticker** pointing at **`{{BOOKING_LINK}}`** and a "Book here 👆" text.

---

## 3. Facebook post

> ✨ We’re online! Booking your nail appointment at Urban Nail Bar just got easier — no calls needed. Pick your service, pick your time, get confirmed — all in under a minute, right from your phone. Walk-ins welcome as always!
> 📅 Book here: **`{{BOOKING_LINK}}`**
> 📍 9290 E Vía de Ventura Ste 103, Scottsdale · 📞 (480) 291-5440

---

## 4. Text message to existing clients

> Hi! Great news from Urban Nail Bar 💅 You can now book your appointments online — takes under a minute: **`{{BOOKING_LINK}}`** Save it to your home screen for next time! See you soon ✨

---

## 5. Front-desk script (for staff)

> "You can book your next visit online now — just scan this code (point at counter sign) and tap **Add to Home Screen**. Next time it takes less than a minute, and you can even pick your polish color ahead of time."

---

## 6. In-shop materials (already done ✅)

- Counter/mirror sign: `print/booking-qr-sign.pdf`
- Phone Setup QR panel on the home page (staff + client codes)
- Instagram post image: `marketing/ig-booking-post.png` (regenerate with `python marketing/_make_ig_post.py` after your permanent link is set — it reads `print/public-url.txt`)

---

## Rollout order we recommend

1. **Today:** Google Business booking link (quick-tunnel link) + texts to regulars.
2. **This week:** run `SETUP-PERMANENT-LINK.bat` → update Google + IG bio with the permanent link → post the IG image.
3. **Ongoing:** front-desk script with every checkout; monthly Google Post.
