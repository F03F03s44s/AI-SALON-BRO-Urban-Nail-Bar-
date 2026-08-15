/**
 * Urban Nail Bar — Shared staff navigation (single source of truth)
 *
 * Defines labels, order, hrefs, and icons for top nav + sidebar "All Pages"
 * so Scheduler, Admin, Manager, Staff, Booking, Website stay in sync.
 *
 * Final menu (staff / private origin) — labels are ALL CAPS in the UI:
 *   1. DIRECTORY          → index.html (app directory / home)
 *   2. SCHEDULER          → scheduler.html
 *      (or MY SCHEDULE    → staff.html#myschedule when technician-only)
 *   3. ADMIN              → admin.html
 *   4. MANAGER            → manager.html
 *   5. STAFF MEMBERS      → staff.html
 *   6. ONLINE BOOKING     → booking.html
 *   7. WEBSITE            → website.html
 *   8. HOW TO USE         → guide.html
 *
 * BOOKING (calendar board) is a separate chrome control (e.g. next to
 * MESSAGES on the scheduler toolbar) → scheduler.html#calendar — not this
 * first top-nav slot.
 *
 * Logo/brand also links to index via indexHref().
 *
 * On the PUBLIC origin (port 3002 / Pinggy / Tailscale Funnel / public-booking shim),
 * staff portal links are never shown — only customer-safe Booking.
 *
 * Load AFTER data-manager.js + utils.js (auth.js optional).
 */
(function () {
    /** Cross-page staff menu — edit HERE only; top nav + sidebars read this. */
    const BASE_PAGES = [
        { id: 'scheduler', href: 'scheduler.html', icon: 'fa-calendar-alt',   label: 'SCHEDULER',      staff: true },
        { id: 'admin',     href: 'admin.html',     icon: 'fa-shield-alt',     label: 'ADMIN',          staff: true },
        { id: 'manager',   href: 'manager.html',   icon: 'fa-user-tie',       label: 'MANAGER',        staff: true },
        { id: 'staff',     href: 'staff.html',     icon: 'fa-users',          label: 'STAFF MEMBERS',  staff: true },
        { id: 'booking',   href: 'booking.html',   icon: 'fa-calendar-check', label: 'ONLINE BOOKING', staff: false },
        { id: 'website',   href: 'website.html',   icon: 'fa-globe',          label: 'WEBSITE',        staff: false },
        { id: 'guide',     href: 'guide.html',     icon: 'fa-book-open',     label: 'HOW TO USE',     staff: false }
    ];

    /** Customer-only nav for the public tunnel / port 3002 whitelist.
     *  Empty on purpose — booking page header is brand + tagline only (no loud SCHEDULE pill). */
    const PUBLIC_PAGES = [];

    /** First nav slot: DIRECTORY → index.html (adjacent to SCHEDULER). */
    const HOME = {
        id: 'home',
        icon: 'fa-th-large',
        label: 'DIRECTORY',
        staff: false
    };

    /** Scheduler toolbar Booking calendar control (not the top-nav DIRECTORY slot). */
    const BOOKING_CAL = {
        id: 'booking-cal',
        icon: 'fa-calendar-alt',
        label: 'CALENDAR',
        staff: false
    };

    function isPublicMode() {
        try {
            const host = (location.hostname || '').toLowerCase();
            const port = String(location.port || '');
            const path = (location.pathname || '').toLowerCase();
            if (host.includes('pinggy') || host.includes('loca.lt') || host.endsWith('.ts.net')) return true;
            if (port === '3002') return true;
            if (path.includes('public-booking')) return true;
            if (window.DataManager && DataManager._isPublic === true) return true;
        } catch (e) { /* ignore */ }
        return false;
    }

    /** In /pages/* → prefix; at project root → as-is. Absolute paths unchanged. */
    function resolveHref(href) {
        if (!href) return href;
        if (href.charAt(0) === '/' || /^https?:/i.test(href)) return href;
        try {
            const path = (location.pathname || '').replace(/\\/g, '/');
            if (path.indexOf('/pages/') !== -1 || /\/pages\/[^/]+$/i.test(path)) {
                return href; // already relative to /pages/
            }
            // From project root (e.g. index.html)
            if (href.indexOf('pages/') === 0 || href.indexOf('../') === 0) return href;
            return 'pages/' + href;
        } catch (e) {
            return href;
        }
    }

    /** Project index / DIRECTORY landing page (logo/brand). */
    function indexHref() {
        try {
            const path = (location.pathname || '').replace(/\\/g, '/');
            if (path.indexOf('/pages/') !== -1 || /\/pages\/[^/]+$/i.test(path)) {
                return '../index.html';
            }
        } catch (e) { /* ignore */ }
        return 'index.html';
    }

    /** @deprecated Prefer indexHref(); homeHref() is the DIRECTORY (index). */
    function homeHref() {
        return indexHref();
    }

    /**
     * Role-aware calendar entry:
     *   canAccessScheduler → Scheduler (full board)
     *   technician-only    → My Schedule (personal)
     *   otherwise          → Scheduler (default / pre-login)
     */
    function calendarNavEntry() {
        const auth = window.SalonAuth;
        if (auth && typeof auth.isTechnicianOnly === 'function' && auth.isTechnicianOnly()) {
            return {
                id: 'scheduler',
                href: 'staff.html#myschedule',
                icon: 'fa-calendar',
                label: 'MY SCHEDULE',
                staff: true
            };
        }
        // Prefer explicit scheduler access when available
        if (auth && typeof auth.canAccessScheduler === 'function' && !auth.canAccessScheduler()
            && typeof auth.current === 'function' && auth.current()) {
            // Logged in but no scheduler access → personal schedule
            return {
                id: 'scheduler',
                href: 'staff.html#myschedule',
                icon: 'fa-calendar',
                label: 'MY SCHEDULE',
                staff: true
            };
        }
        return {
            id: 'scheduler',
            href: 'scheduler.html',
            icon: 'fa-calendar-alt',
            label: 'SCHEDULER',
            staff: true
        };
    }

    /** Booking nav slot → scheduler calendar board (or tech My Schedule). */
    function bookingCalendarHref() {
        const entry = calendarNavEntry();
        const raw = entry.href || 'scheduler.html';
        if (raw.indexOf('#') !== -1) return resolveHref(raw);
        return resolveHref('scheduler.html') + '#calendar';
    }

    function buildPages() {
        return BASE_PAGES.map(p => (p.id === 'scheduler' ? calendarNavEntry() : Object.assign({}, p)));
    }

    let PAGES = buildPages();

    function navPages() {
        return isPublicMode() ? PUBLIC_PAGES : PAGES;
    }

    /** Full ordered menu including DIRECTORY slot (staff mode). */
    function getMenu() {
        if (isPublicMode()) {
            return PUBLIC_PAGES.map(p => Object.assign({}, p, { href: resolveHref(p.href) }));
        }
        const pages = navPages().map(p => Object.assign({}, p, { href: resolveHref(p.href) }));
        return [{ id: HOME.id, href: indexHref(), icon: HOME.icon, label: HOME.label, staff: HOME.staff }].concat(pages);
    }

    function currentPageId() {
        const file = (location.pathname.split('/').pop() || '').toLowerCase();
        if (!file || file === 'index.html') {
            return isPublicMode() ? 'booking' : 'home';
        }
        if (file === 'booking.html' || file === 'public-booking.html') return 'booking';
        if (file === 'staff.html') {
            const hash = (location.hash || '').replace(/^#/, '').toLowerCase();
            if (hash === 'myschedule' || hash === 'schedule') {
                const auth = window.SalonAuth;
                if (auth && typeof auth.isTechnicianOnly === 'function' && auth.isTechnicianOnly()) {
                    return 'scheduler';
                }
            }
            return 'staff';
        }
        const pages = navPages();
        const hit = pages.find(p => {
            const hrefFile = (p.href || '').split('#')[0].split('/').pop();
            return hrefFile === file || p.href === file || p.href.endsWith('/' + file);
        });
        if (hit) return hit.id;
        const allHit = BASE_PAGES.find(p => p.href === file);
        return allHit ? allHit.id : file.replace('.html', '');
    }

    function isBookingCalendarActive() {
        try {
            const file = (location.pathname.split('/').pop() || '').toLowerCase();
            const hash = (location.hash || '').replace(/^#/, '').toLowerCase();
            if (file === 'scheduler.html') {
                return !hash || hash === 'calendar';
            }
            if (file === 'staff.html' && (hash === 'myschedule' || hash === 'schedule')) {
                const auth = window.SalonAuth;
                if (auth && typeof auth.isTechnicianOnly === 'function' && auth.isTechnicianOnly()) {
                    return true;
                }
            }
        } catch (e) { /* ignore */ }
        return false;
    }

    function homeLinkHtml(activeId) {
        const active = activeId === 'home' ? ' active' : '';
        return `<a href="${indexHref()}" class="home-link nav-tab${active}" data-app-nav="home" title="App directory">` +
            `<i class="fas ${HOME.icon}"></i> ${HOME.label}</a>`;
    }

    function ensureStyles() {
        if (document.getElementById('app-nav-styles')) return;
        const s = document.createElement('style');
        s.id = 'app-nav-styles';
        s.textContent = `
            .nav-tabs .nav-tab { white-space: nowrap; }
            .app-sync-chip {
                display: inline-flex; align-items: center; gap: 6px;
                flex-shrink: 0;
                font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2px;
                color: #86efac; background: rgba(22,163,74,0.12);
                border: 1px solid rgba(22,163,74,0.35); border-radius: 999px;
                padding: 3px 10px; margin-left: 8px;
                white-space: nowrap !important;
                word-break: keep-all;
                overflow: hidden;
            }
            .app-sync-chip .sync-label { white-space: nowrap; word-break: keep-all; }
            #salonAuthChipHost {
                display: inline-flex; align-items: center; margin-left: 8px;
            }
            #salonAuthChipHost #salonAuthChip {
                position: static !important; left: auto !important; right: auto !important; top: auto !important; bottom: auto !important;
            }
            .app-sync-chip .dot {
                width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
                box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
                animation: appSyncPulse 2s ease-out infinite;
            }
            @keyframes appSyncPulse {
                0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
                70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
                100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
            }
            .app-nav-bar {
                display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
                padding: 8px 12px; background: #111; border-bottom: 1px solid #2a2a2a;
                position: sticky; top: 0; z-index: 900;
            }
            .app-nav-bar a {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 6px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 700;
                color: #ffffff; text-decoration: none; border: 1px solid transparent;
            }
            .app-nav-bar a:hover { background: transparent; border-color: #ffe566; color: #ffe566; }
            .app-nav-bar a.active {
                background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000; border-color: transparent;
            }
            .app-nav-bar .home-link,
            .nav-tabs .home-link {
                color: #ffffff !important;
                border: 1px solid rgba(251,191,36,0.35) !important;
                font-weight: 800 !important;
            }
            .app-nav-bar .home-link:hover,
            .nav-tabs .home-link:hover {
                background: transparent !important;
                color: #ffe566 !important;
                border-color: #ffe566 !important;
                box-shadow: none !important;
            }
            .app-nav-bar .home-link:hover i,
            .nav-tabs .home-link:hover i {
                color: #ffe566 !important;
            }
            .app-nav-bar .home-link.active,
            .nav-tabs .home-link.active,
            .app-nav-bar .home-link.active:hover,
            .nav-tabs .home-link.active:hover,
            .app-nav-bar .home-link.active:hover i,
            .nav-tabs .home-link.active:hover i {
                background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
                color: #000 !important;
                border-color: transparent !important;
            }
            .app-nav-bar .spacer { flex: 1; }
            .sidebar-btn.app-nav-active,
            a.sidebar-btn.app-nav-active {
                background: linear-gradient(90deg, var(--theme-primary, #fbbf24), var(--theme-primary-dark, #f59e0b)) !important;
                color: #000 !important;
                font-weight: 800 !important;
                border-color: var(--theme-primary, #fbbf24) !important;
            }
            a.sidebar-btn[data-app-nav="home"] {
                background: rgba(251,191,36,0.12) !important;
                border: 1px solid rgba(251,191,36,0.4) !important;
                color: #fbbf24 !important;
                font-weight: 800 !important;
            }
            a.app-brand-home {
                text-decoration: none;
                color: inherit;
                cursor: pointer;
            }
            a.app-brand-home:hover .logo-text h1,
            a.app-brand-home:hover {
                opacity: 0.92;
            }
            @media (max-width: 900px) {
                .app-nav-bar { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
            }
        `;
        document.head.appendChild(s);
    }

    function tabHtml(p, activeId) {
        const active = p.id === activeId ? ' active' : '';
        const lock = p.staff ? ' <i class="fas fa-lock" style="font-size :0.65em;opacity:0.7;"></i>' : '';
        return `<a href="${resolveHref(p.href)}" class="nav-tab${active}" data-app-nav="${p.id}">` +
            `<i class="fas ${p.icon}"></i> ${p.label}${lock}</a>`;
    }

    function fillNavTabs(nav, activeId) {
        const home = isPublicMode() ? '' : homeLinkHtml(activeId);
        nav.innerHTML = home + navPages().map(p => tabHtml(p, activeId)).join('');
    }

    function injectBar(activeId) {
        const publicMode = isPublicMode();
        const pages = navPages();
        let bar = document.getElementById('appNavBar');
        if (bar) bar.remove();
        bar = document.createElement('div');
        bar.id = 'appNavBar';
        bar.className = 'app-nav-bar';
        const home = publicMode ? '' : homeLinkHtml(activeId);
        const chip = publicMode ? '' : `<span class="spacer"></span><span class="app-sync-chip" id="appSyncChip" title="Shared data is live across all pages"><span class="dot"></span><span class="sync-label">LIVE\u00a0SYNC</span></span><span id="salonAuthChipHost"></span>`;
        bar.innerHTML =
            home +
            pages.map(p => {
                const active = p.id === activeId ? ' active' : '';
                return `<a href="${resolveHref(p.href)}" class="${active}" data-app-nav="${p.id}"><i class="fas ${p.icon}"></i> ${p.label}</a>`;
            }).join('') +
            chip;
        document.body.insertBefore(bar, document.body.firstChild);
        const host = document.getElementById('salonAuthChipHost');
        const authChip = document.getElementById('salonAuthChip');
        if (host && authChip) {
            authChip.classList.add('sac-in-nav');
            host.appendChild(authChip);
        }
    }

    function addSyncChip() {
        if (document.getElementById('appSyncChip')) return;
        const chip = document.createElement('span');
        chip.id = 'appSyncChip';
        chip.className = 'app-sync-chip';
        chip.innerHTML = '<span class="dot"></span><span class="sync-label">LIVE\u00a0SYNC</span>';
        chip.title = 'Shared data is live across all pages';
        const menu = document.querySelector('.app-header .user-menu') || document.querySelector('.app-header');
        if (menu) {
            menu.querySelectorAll('[data-app-nav="home"]').forEach((el) => el.remove());
            menu.appendChild(chip);
            if (!document.getElementById('salonAuthChipHost')) {
                const host = document.createElement('span');
                host.id = 'salonAuthChipHost';
                menu.appendChild(host);
            }
        }
    }

    function sidebarBtnHtml(item, activeId) {
        // Use app-nav-active only — never "active" (page tools clear that via UI.setActiveSidebar)
        const active = item.id === activeId ? ' app-nav-active' : '';
        return `<a class="sidebar-btn${active}" href="${item.href}" data-app-nav="${item.id}" style="text-decoration:none;display:flex;">` +
            `<i class="fas ${item.icon}"></i> ${item.label}</a>`;
    }

    /**
     * Fill #sidebarAppPortal (or create All Pages section) from getMenu().
     * Same labels/order/hrefs as top nav on every staff page.
     */
    function renderSidebar(activeId) {
        if (isPublicMode()) return;
        // Staff page: no ALL PAGES (Directory / My Schedule / Admin / Manager)
        try {
            const file = (location.pathname.split('/').pop() || '').toLowerCase();
            if (file === 'staff.html') {
                const existing = document.getElementById('sidebarAppPortalSection');
                if (existing) existing.remove();
                const portal = document.getElementById('sidebarAppPortal');
                if (portal) {
                    const section = portal.closest('.sidebar-section');
                    if (section) section.remove();
                    else portal.remove();
                }
                return;
            }
        } catch (eStaff) { /* continue */ }
        const menu = getMenu();
        const id = activeId != null ? activeId : currentPageId();
        const html = menu.map(item => sidebarBtnHtml(item, id)).join('');

        let portal = document.getElementById('sidebarAppPortal');
        if (portal) {
            portal.innerHTML = html;
            return;
        }

        const sidebar = document.getElementById('mainSidebar')
            || document.querySelector('aside.sidebar')
            || document.querySelector('.sidebar');
        if (!sidebar) return;

        const section = document.createElement('div');
        section.className = 'sidebar-section';
        section.id = 'sidebarAppPortalSection';
        section.innerHTML =
            `<div class="sidebar-title" onclick="typeof toggleSidebarSection==='function'&&toggleSidebarSection(this)">ALL PAGES <i class="fas fa-chevron-down arrow"></i></div>` +
            `<div class="sidebar-content" id="sidebarAppPortal" style="max-height:480px;">${html}</div>`;

        // Prefer after first section (Quick Actions / page tools), else prepend
        const first = sidebar.querySelector('.sidebar-section');
        if (first && first.nextSibling) sidebar.insertBefore(section, first.nextSibling);
        else if (first) sidebar.appendChild(section);
        else sidebar.insertBefore(section, sidebar.firstChild);
    }

    function ensureHomeEverywhere(activeId) {
        if (isPublicMode()) return;
        if (!document.querySelector('[data-app-nav="home"]')) {
            if (document.getElementById('appNavBar')) return;
            const fab = document.createElement('a');
            fab.href = indexHref();
            fab.setAttribute('data-app-nav', 'home');
            fab.className = 'home-link';
            fab.title = 'App directory';
            fab.innerHTML = `<i class="fas ${HOME.icon}"></i> ${HOME.label}`;
            fab.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99998;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;padding:10px 14px;border-radius:999px;font-weight:800;font-size:0.8rem;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
            document.body.appendChild(fab);
        }
    }

    /** If already on scheduler, Booking switches to the calendar section instead of reloading. */
    function goBookingCalendar(e) {
        try {
            const file = (location.pathname.split('/').pop() || '').toLowerCase();
            if (file === 'scheduler.html') {
                if (e) e.preventDefault();
                if (typeof window.showSection === 'function') {
                    window.showSection('calendar');
                }
                if ((location.hash || '') !== '#calendar') {
                    try { history.replaceState(null, '', '#calendar'); } catch (err) { location.hash = 'calendar'; }
                }
                return false;
            }
        } catch (err) { /* fall through to normal navigation */ }
        return true;
    }

    function wireBookingCalendarLinks() {
        document.querySelectorAll('a[data-app-nav="booking-cal"]').forEach((a) => {
            if (a.__bookingCalWired) return;
            a.__bookingCalWired = true;
            a.href = bookingCalendarHref();
            a.addEventListener('click', goBookingCalendar);
        });
    }

    /** Sync hardcoded DIRECTORY anchors to index.html + DIRECTORY label. */
    function syncHardcodedHomeLinks() {
        if (isPublicMode()) return;
        const href = indexHref();
        document.querySelectorAll(
            'a[data-app-nav="home"], a[data-section="home"], a[title="App directory"]'
        ).forEach((a) => {
            // Never rewrite brand logo or booking-calendar chrome
            if (a.classList.contains('app-brand-home')) return;
            if (a.getAttribute('data-app-nav') === 'booking-cal') return;
            a.href = href;
            if (!a.getAttribute('data-app-nav')) a.setAttribute('data-app-nav', 'home');
            a.title = 'App directory';
            const icon = a.querySelector('i.fas, i.fa');
            if (icon && a.childNodes.length <= 3) {
                a.innerHTML = '';
                a.appendChild(icon);
                icon.className = 'fas ' + HOME.icon;
                a.appendChild(document.createTextNode(' ' + HOME.label));
            }
        });
    }

    /** Sync hardcoded CALENDAR chrome (Messages-adjacent) to calendar href + label. */
    function syncBookingCalendarLinks() {
        if (isPublicMode()) return;
        const href = bookingCalendarHref();
        document.querySelectorAll('a[data-app-nav="booking-cal"], a[title="Booking calendar"]').forEach((a) => {
            if (a.classList.contains('app-brand-home')) return;
            if (a.getAttribute('data-app-nav') === 'home') return;
            a.href = href;
            a.setAttribute('data-app-nav', 'booking-cal');
            a.title = 'Calendar';
            const icon = a.querySelector('i.fas, i.fa');
            if (icon && a.childNodes.length <= 3) {
                a.innerHTML = '';
                a.appendChild(icon);
                icon.className = 'fas ' + BOOKING_CAL.icon;
                a.appendChild(document.createTextNode(' ' + BOOKING_CAL.label));
            }
        });
    }

    /** Logo / brand → index.html (DIRECTORY home). */
    function ensureBrandLinksToIndex() {
        if (isPublicMode()) return;
        const href = indexHref();
        document.querySelectorAll('a.app-brand-home').forEach((a) => {
            a.href = href;
        });
        document.querySelectorAll('.logo-section').forEach((el) => {
            if (el.closest('a.app-brand-home')) return;
            if (el.tagName === 'A') {
                el.classList.add('app-brand-home');
                el.href = href;
                el.title = el.title || 'Urban Nail Bar Home';
                return;
            }
            const wrap = document.createElement('a');
            wrap.href = href;
            wrap.className = (el.className || '') + ' app-brand-home';
            wrap.title = 'Urban Nail Bar Home';
            wrap.style.cssText = el.style.cssText || '';
            // Move children into the anchor, then replace
            while (el.firstChild) wrap.appendChild(el.firstChild);
            el.parentNode.insertBefore(wrap, el);
            el.parentNode.removeChild(el);
        });
    }

    function mount() {
        ensureStyles();
        PAGES = buildPages();
        const activeId = currentPageId();
        const publicMode = isPublicMode();
        const nav = document.querySelector('header.app-header nav.nav-tabs, .app-header .nav-tabs, nav.nav-tabs');
        if (nav) {
            fillNavTabs(nav, activeId);
            if (!publicMode) {
                addSyncChip();
                const host = document.getElementById('salonAuthChipHost');
                const authChip = document.getElementById('salonAuthChip');
                if (host && authChip) {
                    authChip.classList.add('sac-in-nav');
                    host.appendChild(authChip);
                }
            }
        } else if (!publicMode) {
            injectBar(activeId);
        }
        if (!publicMode) {
            renderSidebar(activeId);
            syncHardcodedHomeLinks();
            syncBookingCalendarLinks();
            ensureBrandLinksToIndex();
            wireBookingCalendarLinks();
        }
        ensureHomeEverywhere(activeId);

        if (!publicMode && window.DataManager && DataManager.addListener && !mount._listening) {
            mount._listening = true;
            DataManager.addListener(() => {
                const chip = document.getElementById('appSyncChip');
                if (!chip) return;
                chip.style.borderColor = '#fbbf24';
                chip.style.color = '#fbbf24';
                setTimeout(() => {
                    chip.style.borderColor = '';
                    chip.style.color = '';
                }, 800);
            });
        }
    }

    if (!window.__appNavSessionWired) {
        window.__appNavSessionWired = true;
        window.addEventListener('storage', (e) => {
            if (e.key === (window.SALON_SESSION_KEY || 'aiSalonPro_v3_session')) {
                try { mount(); } catch (err) { /* ignore */ }
            }
        });
        window.addEventListener('hashchange', () => {
            try { mount(); } catch (err) { /* ignore */ }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }

    window.AppNav = {
        get PAGES() { return PAGES; },
        get BASE_PAGES() { return BASE_PAGES; },
        HOME,
        BOOKING_CAL,
        PUBLIC_PAGES,
        isPublicMode,
        remount: mount,
        mount,
        currentPageId,
        homeHref,
        indexHref,
        bookingCalendarHref,
        resolveHref,
        calendarNavEntry,
        getMenu,
        renderSidebar,
        fillNavTabs,
        goBookingCalendar,
        isBookingCalendarActive
    };
})();
