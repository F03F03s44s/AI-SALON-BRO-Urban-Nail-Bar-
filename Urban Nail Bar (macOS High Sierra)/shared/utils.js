/**
 * Urban Nail Bar - Shared Utilities
 * Common functions used across all 6 pages
 */

// ===== STAFF ROLES (technician / manager / admin / receptionist) =====
// Staff may hold multiple roles via staff.roles[]; staff.role is the primary.
const STAFF_ROLE_LABELS = {
    technician: 'Technician',
    manager: 'Manager',
    admin: 'Admin',
    receptionist: 'Receptionist'
};

// ===== SERVICE MENU CATEGORIES (shared order across every page) =====
// Order matches live Mango online booking categories
const SERVICE_CATEGORY_ORDER = [
    'Manicure',
    'Pedicure',
    'Nail Enhancements',
    'Dip Powder',
    'Waxing',
    'Lashes',
    'Fix & Removal',
    'Kid Menu'
];

// Categories shown on Edit Staff → Staff's Services (same order as menu catalog)
const STAFF_SERVICE_CATEGORY_ORDER = [
    'Manicure',
    'Pedicure',
    'Nail Enhancements',
    'Dip Powder',
    'Waxing',
    'Lashes',
    'Fix & Removal',
    'Kid Menu'
];

// Legacy combined staff pick — expand to Lashes + Fix & Removal (never a menu category)
const LEGACY_LASHES_FIX_COMBO = 'Lashes Fix and Removal';

const SERVICE_CATEGORY_ALIASES = {
    'Pedicures': 'Pedicure',
    'Fix & Removal Only': 'Fix & Removal',
    'Fix and Removal': 'Fix & Removal',
    'Kids': 'Kid Menu',
    'Kid': 'Kid Menu',
    'Acrylic': 'Nail Enhancements',
    'Acrylics': 'Nail Enhancements',
    'Gel-X': 'Nail Enhancements',
    'Gel X': 'Nail Enhancements',
    // Legacy combined staff skill → keep recognizable so getStaffServiceCategories can expand
    'Lashes Fix and removal': LEGACY_LASHES_FIX_COMBO,
    'Lashes / Fix & Removal': LEGACY_LASHES_FIX_COMBO,
    'Lash Fix and Removal': LEGACY_LASHES_FIX_COMBO,
    'Add Ons': 'Add-ons',
    'Addons': 'Add-ons',
    'Add-On': 'Add-ons',
    'Add-Ons': 'Add-ons'
};

// ===== FORMATTING UTILITIES =====

const Utils = {
    // Normalize category labels so "Pedicures" / "Fix & Removal Only" match the menu
    normalizeCategory(cat) {
        const c = String(cat || 'Other').trim();
        if (!c || /^general$/i.test(c)) return 'Other';
        return SERVICE_CATEGORY_ALIASES[c] || c;
    },

    // Menu tab category — real parent category (add-ons nest under their section)
    displayCategory(s) {
        if (!s) return 'Other';
        const cat = this.normalizeCategory(s.category);
        return /^general$/i.test(cat) ? 'Other' : cat;
    },

    // Ordered unique categories from a services list (unknown cats go last)
    serviceCategories(services) {
        const hidden = new Set(['Add-ons', 'Combos', 'General', 'Other']);
        const present = new Set(
            (services || []).map(s => this.displayCategory(s)).filter(c => c && !hidden.has(c))
        );
        const ordered = SERVICE_CATEGORY_ORDER.filter(c => present.has(c));
        const extras = [...present].filter(c => !SERVICE_CATEGORY_ORDER.includes(c)).sort();
        return ordered.concat(extras);
    },

    // Stable key so duplicate catalog rows (ticket-sync copies, Kind|Variant renames) collapse
    serviceIdentityKey(s) {
        const name = String(this.cleanServiceName((s && s.name) || '', (s && s.category) || '') || (s && s.name) || '')
            .trim().toLowerCase().replace(/\s+/g, ' ');
        const cat = String(this.normalizeCategory((s && s.category) || '') || '').trim().toLowerCase();
        const price = Number(s && s.price) || 0;
        const dur = Number(s && s.duration) || 0;
        return cat + '|' + name + '|' + price + '|' + dur;
    },

    uniqueServices(list) {
        const out = [];
        const byId = new Set();
        const byKey = new Set();
        (list || []).slice().sort((a, b) => {
            const ia = Number(a && a.id) || 0;
            const ib = Number(b && b.id) || 0;
            const aMapped = ia >= 900000000;
            const bMapped = ib >= 900000000;
            if (aMapped !== bMapped) return aMapped ? 1 : -1;
            return ia - ib;
        }).forEach(s => {
            if (!s) return;
            const id = Number(s.id);
            if (id && byId.has(id)) return;
            const key = this.serviceIdentityKey(s);
            if (key && byKey.has(key)) return;
            if (id) byId.add(id);
            if (key) byKey.add(key);
            out.push(s);
        });
        return out.sort((a, b) => (Number(a && a.id) || 0) - (Number(b && b.id) || 0));
    },

    findMatchingService(list, hint) {
        const rows = list || [];
        if (!hint || !rows.length) return null;
        const n = (v) => Number(v);
        if (hint.dmServiceId != null && hint.dmServiceId !== '') {
            const byDm = rows.find(s => n(s.id) === n(hint.dmServiceId));
            if (byDm) return byDm;
        }
        const hid = n(hint.id);
        if (hid && hid >= 900000000) {
            const mapped = rows.find(s => n(s.id) === (hid - 900000000));
            if (mapped) return mapped;
        }
        if (hid && hid < 900000000) {
            const byId = rows.find(s => n(s.id) === hid);
            if (byId) return byId;
        }
        const wantName = String(hint.name || '').trim().toLowerCase();
        const wantClean = String(this.cleanServiceName(hint.name || '', hint.category || '') || '').trim().toLowerCase();
        const wantCat = String(this.normalizeCategory(hint.category || '') || '').trim().toLowerCase();
        if (wantName) {
            const exact = rows.find(s => String(s.name || '').trim().toLowerCase() === wantName
                && (!wantCat || String(this.normalizeCategory(s.category) || '').trim().toLowerCase() === wantCat));
            if (exact) return exact;
            const exactAny = rows.find(s => String(s.name || '').trim().toLowerCase() === wantName);
            if (exactAny) return exactAny;
        }
        if (wantClean) {
            const cleaned = rows.filter(s =>
                String(this.cleanServiceName(s.name, s.category) || '').trim().toLowerCase() === wantClean);
            if (wantCat) {
                const inCat = cleaned.filter(s => String(this.normalizeCategory(s.category) || '').trim().toLowerCase() === wantCat);
                if (inCat.length) return inCat[0];
            }
            if (cleaned.length === 1) return cleaned[0];
            if (cleaned.length) return cleaned[0];
        }
        return null;
    },

    // Group services by category in display order
    // opts.includeHidden — keep Add-ons / Combos groups (useful for search results)
    groupServicesByCategory(services, opts) {
        const groups = {};
        (services || []).forEach(s => {
            const cat = this.displayCategory(s);
            (groups[cat] = groups[cat] || []).push(s);
        });
        const includeHidden = opts && opts.includeHidden;
        let cats = this.serviceCategories(services);
        if (includeHidden) {
            const extras = Object.keys(groups).filter(c => !cats.includes(c) && c !== 'Combos');
            cats = cats.concat(extras);
        }
        return cats.map(cat => ({
            category: cat,
            services: this.sortServicesForMenu(groups[cat] || [])
        })).filter(g => g.services.length);
    },

    // Family key so Fullsets / Fills / Lash sets / etc. sit together in booking menus
    // Works with both legacy names and Kind | Variant labels ("Fullset | Gel X", "Pedicure | Spa").
    serviceFamilyKey(s) {
        const raw = String((s && s.name) || '');
        const n = raw.toLowerCase();
        const cat = String(this.displayCategory(s) || '').toLowerCase();
        const kindLeft = (n.split('|')[0] || '').trim();
        const isKindFullset = /^(fullsets?|full\s*sets?)$/.test(kindLeft) || /^fullset\b|^full\s*set\b/.test(n);
        const isKindFill = /^fills?$/.test(kindLeft) || /(^|\s)fill(\s|\||$)/.test(n);
        const isKindPedi = /^pedicures?$/.test(kindLeft) || /pedicure/.test(n);
        const isKindMani = /^manicures?$/.test(kindLeft) || /manicure/.test(n);

        // Lashes — Full Sets, then Fills, then care/removal
        if (cat === 'lashes' || /\b(classic|hybrid|volume|dramatic)\b/.test(n) || /\blash/.test(n)) {
            if (isKindFullset || /full\s*set|fullset/.test(n)) return 'lash-fullset';
            if (isKindFill || /\bfill\b/.test(n)) return 'lash-fill';
            return 'lash-care';
        }

        // Nail Enhancements — all Fullsets together, then all Fills
        if (cat === 'nail enhancements' || /acrylic|gel\s*x|gel-x|polygel|liquid\s*gel/.test(n)) {
            if (isKindFullset || /fullset|full set/.test(n)) return 'enh-fullset';
            if (isKindFill || /\bfill\b/.test(n)) return 'enh-fill';
            return 'enh-other';
        }

        // Dip Powder
        if (cat === 'dip powder' || /^dip\b|dip powder|dip with|dip overlay|dip\s*\|/.test(n)) {
            if (/tips|fullset|full set/.test(n)) return 'dip-full';
            return 'dip-overlay';
        }

        // Manicure
        if (cat === 'manicure' || (isKindMani && cat !== 'kid menu')) {
            if (/polish change/.test(n)) return 'mani-polish';
            return 'mani';
        }

        // Pedicure
        if (cat === 'pedicure' || (isKindPedi && cat !== 'kid menu')) {
            if (/toes?\s+(fullset|fill)|big toe|toes with gel|\|\s*toes/.test(n)) return 'pedi-toes';
            if (/polish change/.test(n)) return 'pedi-polish';
            if (/massage|trim only|toenail trim/.test(n)) return 'pedi-extra';
            return 'pedi';
        }

        // Waxing
        if (cat === 'waxing') {
            if (/eyebrow|lips?|chin|sideburn|full face|brown tint/.test(n)) return 'wax-face';
            if (/bikini|brazilian/.test(n)) return 'wax-intimate';
            return 'wax-body';
        }

        // Fix & Removal
        if (cat === 'fix & removal' || /fix/.test(cat)) {
            if (/repair/.test(n)) return 'fix-repair';
            if (/removal/.test(n)) return 'fix-removal';
            return 'fix';
        }

        // Kid Menu
        if (cat === 'kid menu') {
            if (/polish change/.test(n)) return 'kid-polish';
            if (isKindMani || /manicur|^manicure$|^gel manicure$|manicure\s*\|/.test(n)) return 'kid-mani';
            if (isKindPedi || /pedicur|^pedicure$|^gel pedicure$|pedicure\s*\|/.test(n)) return 'kid-pedi';
            if (isKindFullset || /fullset|full set|with tips|dip\s*\|\s*with tips/.test(n)) return 'kid-fullset';
            if (isKindFill || /\bfill\b|overlay|dip\s*\|\s*overlay/.test(n)) return 'kid-fill';
            return 'kid-other';
        }

        if (isKindFill || /\bfill\b/.test(n)) return 'fill-other';
        if (isKindFullset || /fullset|full set/.test(n)) return 'fullset-other';
        return 'other';
    },

    serviceFamilyRank(s) {
        const order = [
            'enh-fullset', 'enh-fill', 'enh-other',
            'dip-full', 'dip-overlay',
            'mani', 'mani-polish',
            'pedi', 'pedi-polish', 'pedi-toes', 'pedi-extra',
            'lash-fullset', 'lash-fill', 'lash-care',
            'wax-face', 'wax-body', 'wax-intimate',
            'fix-repair', 'fix-removal', 'fix',
            'kid-mani', 'kid-pedi', 'kid-fullset', 'kid-fill', 'kid-polish', 'kid-other',
            'fullset-other', 'fill-other', 'other'
        ];
        const key = this.serviceFamilyKey(s);
        const i = order.indexOf(key);
        return i < 0 ? 999 : i;
    },

    // Product line order inside a family (Acrylic → Gel X → Polygel → Liquid Gel; Classic → Hybrid → Volume)
    serviceProductRank(s) {
        const n = String((s && s.name) || '').toLowerCase();
        if (/acrylic/.test(n)) return 0;
        if (/gel\s*x|gel-x/.test(n)) return 1;
        if (/polygel/.test(n)) return 2;
        if (/liquid\s*gel/.test(n)) return 3;
        if (/classic/.test(n)) return 10;
        if (/hybrid/.test(n)) return 11;
        if (/volume/.test(n)) return 12;
        if (/dramatic/.test(n)) return 13;
        if (/\bspa\b|pedicure\s*\|\s*spa/.test(n)) return 20;
        if (/silken/.test(n)) return 21;
        if (/pedicure\s*\|\s*gel|manicure\s*\|\s*gel|gel pedicure|gel manicure|^gel$/.test(n)) return 22;
        if (/exfoliat/.test(n)) return 23;
        if (/detox/.test(n)) return 24;
        if (/jelly/.test(n)) return 25;
        if (/\bregular\b|manicure\s*\|\s*regular/.test(n)) return 26;
        return 50;
    },

    // Fullset before Fill within the same family (mostly unused when families already split)
    serviceKindRank(s) {
        const n = String((s && s.name) || '').toLowerCase();
        const kindLeft = (n.split('|')[0] || '').trim();
        if (/^(fullsets?|full\s*sets?)$/.test(kindLeft) || /fullset|full set/.test(n)) return 0;
        if (/^fills?$/.test(kindLeft) || /\bfill\b/.test(n)) return 1;
        if (/overlay|with tips/.test(n)) return 2;
        if (/polish change/.test(n)) return 3;
        return 4;
    },

    sortServicesForMenu(list) {
        return (list || []).slice().sort((a, b) => {
            const fa = this.serviceFamilyRank(a);
            const fb = this.serviceFamilyRank(b);
            if (fa !== fb) return fa - fb;
            const pa = this.serviceProductRank(a);
            const pb = this.serviceProductRank(b);
            if (pa !== pb) return pa - pb;
            const ka = this.serviceKindRank(a);
            const kb = this.serviceKindRank(b);
            if (ka !== kb) return ka - kb;
            const na = String(this.serviceDisplayName(a) || (a && a.name) || '').toLowerCase();
            const nb = String(this.serviceDisplayName(b) || (b && b.name) || '').toLowerCase();
            if (na < nb) return -1;
            if (na > nb) return 1;
            return (Number(a && a.id) || 0) - (Number(b && b.id) || 0);
        });
    },

    serviceFamilyLabel(s) {
        const key = this.serviceFamilyKey(s);
        const labels = {
            'enh-fullset': 'Fullsets',
            'enh-fill': 'Fills',
            'enh-other': 'Other',
            'dip-full': 'With Tips',
            'dip-overlay': 'Overlay',
            mani: 'Manicures',
            'mani-polish': 'Polish Change',
            pedi: 'Pedicures',
            'pedi-polish': 'Polish Change',
            'pedi-toes': 'Toes Enhancements',
            'pedi-extra': 'Extras',
            'lash-fullset': 'Full Sets',
            'lash-fill': 'Fills',
            'lash-care': 'Lash Care',
            'wax-face': 'Face',
            'wax-body': 'Body',
            'wax-intimate': 'Bikini & Brazilian',
            'fix-repair': 'Nail Repair',
            'fix-removal': 'Removal',
            fix: 'Fix & Removal',
            'kid-mani': 'Manicure',
            'kid-pedi': 'Pedicure',
            'kid-fullset': 'Fullsets',
            'kid-fill': 'Fills',
            'kid-polish': 'Polish Change',
            'kid-other': 'Other',
            'fullset-other': 'Fullsets',
            'fill-other': 'Fills',
            other: ''
        };
        return labels[key] || '';
    },

    // [{ label, services }] for professional sectioned menus
    servicesMenuSections(list) {
        const sorted = this.sortServicesForMenu(list || []);
        const sections = [];
        let cur = null;
        sorted.forEach(s => {
            const label = this.serviceFamilyLabel(s) || '';
            if (!cur || cur.label !== label) {
                cur = { label, services: [] };
                sections.push(cur);
            }
            cur.services.push(s);
        });
        return sections;
    },

    // Render sorted service rows with family section labels (Fullsets / Fills / Lashes…)
    servicesMenuHtml(list, rowHtmlFn) {
        const sections = this.servicesMenuSections(list);
        let html = '';
        sections.forEach(sec => {
            if (sec.label) {
                html += '<div class="sch-qb-family-label qb-family-label">' + sec.label + '</div>';
            }
            sec.services.forEach(s => { html += rowHtmlFn(s); });
        });
        return html;
    },

    // True for add-on style rows within a parent category (duration 0 / Add / Soak Off)
    isServiceAddon(s) {
        if (!s) return false;
        if ((s.duration || 0) === 0) return true;
        const n = String(s.name || '');
        return /^(add |soak off|extra tip|shape$)/i.test(n);
    },

    // Service menu search — all whitespace-separated tokens must match (order-independent)
    serviceMatchesQuery(s, q) {
        const raw = String(q || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!raw) return true;
        if (!s) return false;
        const hay = [
            s.name,
            this.displayCategory(s),
            s.category,
            s.description,
            s.priceNote,
            (s.popular ? 'popular' : '')
        ].filter(Boolean).join(' ').toLowerCase();
        return raw.split(' ').every(tok => tok && hay.includes(tok));
    },

    // Party / group booking helpers — +N = additional guests beyond the primary
    partySizeOf(appt) {
        if (!appt) return 1;
        const raw = Number(appt.partySize || appt.clientCount || 0);
        if (raw > 1) return raw;
        const partyArr = Array.isArray(appt.party) ? appt.party.filter(Boolean) : [];
        if (partyArr.length > 1) return partyArr.length;
        const guests = Array.isArray(appt.guestNames) ? appt.guestNames.filter(n => String(n || '').trim()) : [];
        if (guests.length) return guests.length + 1;
        const guestList = Array.isArray(appt.guests) ? appt.guests : [];
        if (guestList.length) return guestList.length + 1;
        return Math.max(1, raw || 1);
    },

    partyExtraCount(appt) {
        return Math.max(0, this.partySizeOf(appt) - 1);
    },

    /**
     * Strip seat suffixes/prefixes for display when #N or P-badge is shown separately.
     * "Sean #2" / "Sean (P2)" / "#2 Sean" → "Sean"
     */
    partyBaseDisplayName(name) {
        let s = String(name == null ? '' : name).trim();
        if (!s) return '';
        s = s.replace(/^\?+\s*/, '');
        s = s.replace(/^\s*#\d+\s+/i, '');
        s = s.replace(/\s*\(P\d+\)\s*$/i, '');
        s = s.replace(/\s*#\d+\s*$/i, '');
        s = s.trim();
        if (!s || /^Guest\s*\d+$/i.test(s)) return '';
        return s;
    },

    /** Booker keeps base name; seats 2+ → "Sean #2", "Sean #3" (not "Guest 2"). index0Based: 0 = booker. */
    partySeatName(baseName, index0Based) {
        const base = this.capsName(this.partyBaseDisplayName(baseName) || String(baseName || '').trim() || 'Client');
        const idx = Number(index0Based);
        if (!idx || idx < 1 || Number.isNaN(idx)) return base;
        return base + ' #' + (idx + 1);
    },

    isGenericPartyGuestName(name) {
        return !String(name || '').trim() || /^Guest\s*\d+$/i.test(String(name).trim());
    },

    /** Prefer typed name; rewrite blank / "Guest N" / "Name (P2)" to booker-based seat labels. */
    resolvePartySeatName(baseName, index0Based, explicitName) {
        const explicit = String(explicitName || '').trim();
        const pn = explicit.match(/^(.+?)\s*\(P(\d+)\)$/i);
        if (pn) {
            const fromPn = Number(pn[2]) - 1;
            return this.partySeatName(pn[1].trim() || baseName, Number.isNaN(fromPn) ? index0Based : fromPn);
        }
        // Explicit "Sean #2" with known seat → keep as seat label for storage; callers that
        // prefix #N should use partyBaseDisplayName for UI.
        if (explicit && !this.isGenericPartyGuestName(explicit)) {
            const stripped = this.partyBaseDisplayName(explicit);
            // If explicit was only a seat suffix, fall through to generated seat name
            if (!stripped) return this.partySeatName(baseName, index0Based);
            const seatM = explicit.match(/#(\d+)\s*$/);
            if (seatM && Number(index0Based) >= 1) {
                // Normalize to "Base #N" without double suffix
                return this.partySeatName(stripped, index0Based);
            }
            return explicit.replace(/\s*\(P\d+\)\s*$/i, '').trim() || this.partySeatName(baseName, index0Based);
        }
        return this.partySeatName(baseName, index0Based);
    },

    partyBadgeHtml(appt) {
        // High-contrast chip: white on black (ASCII-only labels for Sierra Safari)
        var chip = 'display:inline-block;vertical-align:middle;margin-left:4px;padding:2px 6px;border-radius:4px;background:#000;color:#fff;font-size:0.65rem;font-weight:800;line-height:1.35;letter-spacing:0.03em;white-space:nowrap;text-transform:none;border:1px solid #fff;box-shadow:none;';

        // Multi-service split (same client, one service per calendar block)
        var svcCount = Number(appt && appt.serviceCount) || 0;
        var svcIdx = (appt && appt.serviceIndex != null && appt.serviceIndex !== '') ? Number(appt.serviceIndex) : NaN;
        if (svcCount > 1 && !isNaN(svcIdx) && svcIdx >= 0) {
            var sn = svcIdx + 1;
            return ' <span class="party-badge party-service" title="Service ' + sn + ' of ' + svcCount + '" style="' + chip + '">S' + sn + '</span>';
        }

        // Party badge only for 2+ clients — never show for a solo booking
        var total = this.partySizeOf(appt);
        if (!(total >= 2)) return '';

        // Linked multi-appointment parties: show P1 / P2 / P3 by seat when known
        if (appt && appt.partyId) {
            var idx = (appt.partyIndex != null && appt.partyIndex !== '' && !isNaN(Number(appt.partyIndex))) ? (Number(appt.partyIndex) + 1) : total;
            return ' <span class="party-badge party-linked" title="Party of ' + total + ' - Client ' + idx + '" style="' + chip + '">P' + idx + '</span>';
        }
        var n = total - 1;
        if (n < 1) return '';
        return ' <span class="party-badge" title="Party of ' + total + '" style="' + chip + '">+' + n + '</span>';
    },

    // ---- Staff roles ----
    normalizeRole(role) {
        const s = String(role || '').toLowerCase().trim();
        if (!s) return '';
        if (s === 'tech' || s === 'technician' || s === 'nail tech' || s === 'nail technician'
            || s === 'senior tech' || s === 'senior technician' || s.includes('tech')) {
            return 'technician';
        }
        if (s.includes('manager')) return 'manager';
        if (s.includes('admin')) return 'admin';
        if (s.includes('reception')) return 'receptionist';
        return s;
    },

    getStaffRoles(staff) {
        if (!staff) return [];
        const raw = [];
        if (Array.isArray(staff.roles)) raw.push(...staff.roles);
        else if (typeof staff.roles === 'string' && staff.roles.trim()) {
            raw.push(...staff.roles.split(/[,|/]/).map(x => x.trim()).filter(Boolean));
        }
        if (staff.role) raw.push(staff.role);
        return [...new Set(raw.map(r => this.normalizeRole(r)).filter(Boolean))];
    },

    // Highest-privilege role for PIN / page access
    primaryRole(staffOrRoles) {
        const roles = Array.isArray(staffOrRoles)
            ? staffOrRoles.map(r => this.normalizeRole(r))
            : this.getStaffRoles(staffOrRoles);
        for (const r of ['admin', 'manager', 'receptionist', 'technician']) {
            if (roles.includes(r)) return r;
        }
        return roles[0] || 'technician';
    },

    isTechnician(staff) {
        const roles = this.getStaffRoles(staff);
        // No role listed → treat as technician (public booking staff often ship id+name only)
        if (!roles.length) return true;
        return roles.includes('technician');
    },

    formatRoleLabel(roleOrStaff) {
        if (roleOrStaff && typeof roleOrStaff === 'object') {
            const roles = this.getStaffRoles(roleOrStaff);
            if (!roles.length) return 'Technician';
            return roles.map(r => STAFF_ROLE_LABELS[r] || r).join(' + ');
        }
        const n = this.normalizeRole(roleOrStaff);
        return STAFF_ROLE_LABELS[n] || roleOrStaff || 'Technician';
    },

    // Active staff who take clients (booking, schedule columns, up-next)
    getBookableStaff(staffList) {
        return (staffList || []).filter(s => {
            const st = String(s.status || 'active').toLowerCase();
            if (st === 'inactive' || st === 'deleted') return false;
            return this.isTechnician(s);
        });
    },

    // Expand legacy combined staff skill into separate Lashes + Fix & Removal
    expandStaffServiceCategory(cat) {
        const n = this.normalizeCategory(cat);
        if (n === LEGACY_LASHES_FIX_COMBO) return ['Lashes', 'Fix & Removal'];
        return n ? [n] : [];
    },

    // Categories a tech is trained for. Empty / missing = all menu categories.
    getStaffServiceCategories(staff) {
        if (!staff) return [];
        const raw = Array.isArray(staff.serviceCategories) ? staff.serviceCategories : [];
        const expanded = [];
        raw.forEach(c => expanded.push(...this.expandStaffServiceCategory(c)));
        return [...new Set(expanded.filter(Boolean))];
    },

    staffCanDoService(staff, serviceOrCategory) {
        const cats = this.getStaffServiceCategories(staff);
        if (!cats.length) return true; // unset = all services
        let cat = '';
        if (typeof serviceOrCategory === 'string') cat = this.normalizeCategory(serviceOrCategory);
        else if (serviceOrCategory && serviceOrCategory.category) cat = this.normalizeCategory(serviceOrCategory.category);
        if (!cat) return true;
        if (cats.includes(cat)) return true;
        // Legacy combined value (if not yet expanded) still covers both menu cats
        if (cats.includes(LEGACY_LASHES_FIX_COMBO) && (cat === 'Lashes' || cat === 'Fix & Removal')) return true;
        return false;
    },

    staffWhoCanDoService(staffList, serviceOrCategory) {
        return this.getBookableStaff(staffList).filter(s => this.staffCanDoService(s, serviceOrCategory));
    },

    formatStaffServiceLabels(staff) {
        const cats = this.getStaffServiceCategories(staff);
        if (!cats.length) return 'All Services';
        return cats.map(c => (c === 'Fix & Removal' ? 'Fix and Removal' : c)).join(', ');
    },

    // Build / fill checkbox group for service categories (edit staff modals)
    fillServiceCategoryCheckboxes(rootId, selected) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return;
        // Expand legacy "Lashes Fix and Removal" → both Lashes and Fix & Removal checked
        const selectedSet = new Set();
        (selected || []).forEach(c => {
            this.expandStaffServiceCategory(c).forEach(x => selectedSet.add(x));
        });
        // Built-in order + any live/custom categories from the menu
        const cats = STAFF_SERVICE_CATEGORY_ORDER.slice();
        const seen = new Set(cats);
        try {
            const live = (typeof DataManager !== 'undefined' && DataManager.getServices) ? this.serviceCategories(DataManager.getServices()) : [];
            const custom = (typeof DataManager !== 'undefined' && DataManager.getSettings)
                ? ((DataManager.getSettings().customServiceCategories) || []) : [];
            live.concat(custom).forEach(c => {
                const n = this.normalizeCategory(c);
                if (n && !seen.has(n) && n !== 'Add-ons' && n !== 'Combos' && !/^general$/i.test(n) && n !== 'Other') {
                    seen.add(n);
                    cats.push(n);
                }
            });
        } catch (e) { /* ignore */ }
        root.innerHTML = cats.map(cat => {
            const id = 'svcCat_' + cat.replace(/[^a-z0-9]+/gi, '_');
            const checked = selectedSet.size === 0 ? false : selectedSet.has(cat);
            const label = cat === 'Fix & Removal' ? 'Fix and Removal' : cat;
            return `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.78rem;white-space:nowrap;">
                <input type="checkbox" data-service-category="${cat}" id="${id}" ${checked ? 'checked' : ''}> ${label}
            </label>`;
        }).join('');
        // If none selected historically (= all services), leave unchecked and note in UI
        root.dataset.emptyMeansAll = selectedSet.size === 0 ? '1' : '0';
    },

    readServiceCategoryCheckboxes(rootId) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return [];
        return Array.from(root.querySelectorAll('input[data-service-category]:checked'))
            .map(cb => this.normalizeCategory(cb.getAttribute('data-service-category')))
            .filter(Boolean);
    },

    // Build { roles, role } from checkbox / array input
    packRoles(roles) {
        const normalized = [...new Set((roles || []).map(r => this.normalizeRole(r)).filter(Boolean))];
        if (!normalized.length) normalized.push('technician');
        return { roles: normalized, role: this.primaryRole(normalized) };
    },

    readRoleCheckboxes(rootId) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return this.packRoles(['technician']);
        const picked = [...root.querySelectorAll('input[data-role]:checked')].map(i => i.dataset.role);
        return this.packRoles(picked);
    },

    setRoleCheckboxes(rootId, staffOrRoles) {
        const root = typeof rootId === 'string' ? document.getElementById(rootId) : rootId;
        if (!root) return;
        const roles = Array.isArray(staffOrRoles)
            ? staffOrRoles.map(r => this.normalizeRole(r))
            : this.getStaffRoles(staffOrRoles);
        root.querySelectorAll('input[data-role]').forEach(i => {
            i.checked = roles.includes(i.dataset.role);
        });
    },

    roleCheckboxesHtml(rootId, hint) {
        const note = hint || 'Only Technicians appear on booking and the schedule grid.';
        return `<div class="form-group" id="${rootId}">
            <label class="form-label">Roles <span style="font-weight:500;opacity:.7;">(select all that apply)</span></label>
            <div style="display:flex;flex-wrap:wrap;gap:12px 16px;margin-top:6px;">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="technician" checked> Technician</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="manager"> Manager</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="admin"> Admin</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.85rem;"><input type="checkbox" data-role="receptionist"> Receptionist</label>
            </div>
            <div style="font-size:0.7rem;color:var(--text-secondary,#9ca3af);margin-top:6px;">${note}</div>
        </div>`;
    },

    // Format currency
    formatCurrency(amount, currency = '$') {
        if (amount === undefined || amount === null) return `${currency}0.00`;
        return `${currency}${parseFloat(amount).toFixed(2)}`;
    },
    
    // Format date
    formatDate(date, format = 'mdy') {
        if (!date) return '-';
        // Plain 'YYYY-MM-DD' strings are LOCAL calendar dates — parsing them as
        // UTC midnight (the default) shifts the display back one day in US timezones.
        const d = (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? new Date(date + 'T00 :00:00')
            : new Date(date);
        if (isNaN(d.getTime())) return date;
        
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        
        switch(format) {
            case 'mdy': return `${month}/${day}/${year}`;
            case 'dmy': return `${day}/${month}/${year}`;
            case 'ymd': return `${year}-${month}-${day}`;
            default: return `${month}/${day}/${year}`;
        }
    },
    
    // Format time — always 12-hour (AM/PM) for display
    formatTime(time, format = '12') {
        if (!time) return '-';
        // Intentionally ignore 24h requests — salon UI is 12-hour only
        format = '12';
        const raw = String(time).trim();
        if (/\b(am|pm)\b/i.test(raw)) {
            const m = raw.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
            if (m) return (parseInt(m[1], 10) || 12) + ':' + m[2] + ' ' + m[3].toUpperCase();
            return raw;
        }
        const [hours, minutes] = raw.split(':');
        let h = parseInt(hours, 10);
        const m = (minutes || '00').slice(0, 2);
        if (isNaN(h)) return raw;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${m} ${ampm}`;
    },
    
    // Digits-only phone (strips leading US country code 1). Returns '' if not 10 digits.
    phoneDigits(phone) {
        if (phone == null || phone === '') return '';
        let d = String(phone).replace(/\D/g, '');
        if (d.length === 11 && d[0] === '1') d = d.slice(1);
        return d.length === 10 ? d : '';
    },

    // Normalize for storage: 10 digits when possible, else trimmed original.
    normalizePhone(phone) {
        if (phone == null) return '';
        const trimmed = String(phone).trim();
        if (!trimmed) return '';
        const d = Utils.phoneDigits(trimmed);
        return d || trimmed;
    },

    // Format phone for display — US style (XXX) XXX-XXXX
    formatPhone(phone) {
        if (phone == null || phone === '') return '-';
        const cleaned = String(phone).replace(/\D/g, '');
        let d = cleaned;
        if (d.length === 11 && d[0] === '1') d = d.slice(1);
        if (d.length === 10) {
            return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
        }
        return String(phone);
    },

    // Alias used by display sites
    formatPhoneDisplay(phone) {
        return Utils.formatPhone(phone);
    },

    // Menu / ticket labels: "Fullset | Acrylic Color Powder", "Pedicure | Spa",
    // "Full Set | Classic", "Fill | Volume" — kind first so lists are easy to scan.
    cleanServiceName(name, category) {
        let n = String(name == null ? '' : name).trim();
        if (!n) return '';
        n = n.replace(/\bW\s*\/\s*/gi, 'with ');
        n = n.replace(/\s+/g, ' ').trim();
        const cat = this.normalizeCategory(category);
        const isKid = /kid/i.test(cat);
        const isPedi = /pedicure/i.test(cat);
        const isMani = /manicure/i.test(cat) && !isKid;
        const isLash = /lash/i.test(cat);
        const isEnh = /nail enhanc/i.test(cat);
        const isDip = /dip/i.test(cat);
        const isFix = /fix|removal/i.test(cat);

        const pipe = (kind, rest) => {
            const k = String(kind || '').trim();
            const r = String(rest || '').replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim();
            if (!k) return r || n;
            if (!r) return k;
            return k + ' | ' + r;
        };

        // Already Kind | Variant — normalize spacing only
        if (/\s*\|\s*/.test(n)) {
            const parts = n.split(/\s*\|\s*/);
            if (parts.length >= 2) {
                const left = parts[0].trim();
                const right = parts.slice(1).join(' ').trim();
                // "Fullset Acrylic | Color Powder" → "Fullset | Acrylic Color Powder"
                const enhLeft = left.match(/^(Fullset|Fill)\s+(.+)$/i)
                    || left.match(/^(Full\s+Sets?)\s+(.+)$/i);
                if (enhLeft) {
                    const kindRaw = enhLeft[1];
                    const kind = /^full\s+sets?$/i.test(kindRaw) ? 'Full Set'
                        : /^fill$/i.test(kindRaw) ? 'Fill'
                        : 'Fullset';
                    return pipe(kind, (enhLeft[2] + ' ' + right).trim());
                }
                // "Nail Repair | 1+ Weeks" / "Fullset | Gel X" / "Full Set | Classic"
                if (/^nail repair$/i.test(left) || /^full\s+set$/i.test(left) || /^(fullsets?|fill|pedicure|manicure|dip)$/i.test(left)) {
                    let kindNorm;
                    if (/^full\s+set$/i.test(left) || /^fullsets?$/i.test(left)) {
                        const lashVariant = /\b(classic|hybrid|volume|dramatic)\b/i.test(right);
                        kindNorm = (isLash || lashVariant) ? 'Full Set' : 'Fullset';
                    } else if (/^fill$/i.test(left)) kindNorm = 'Fill';
                    else if (/^pedicure$/i.test(left)) kindNorm = 'Pedicure';
                    else if (/^manicure$/i.test(left)) kindNorm = 'Manicure';
                    else if (/^dip$/i.test(left)) kindNorm = 'Dip';
                    else kindNorm = left;
                    return pipe(kindNorm, right);
                }
                return pipe(left, right);
            }
        }

        // Lashes: Classic Full Set → Full Set | Classic ; Volume Fill → Fill | Volume
        if (isLash || ((/\b(classic|hybrid|volume|dramatic)\b/i.test(n) || /\blash\b/i.test(n)) && !isEnh && !isKid && !isPedi && !isMani && !isDip)) {
            let m = n.match(/^(Classic|Hybrid|Volume|Dramatic)\s+Full\s+Sets?$/i)
                || n.match(/^(Classic|Hybrid|Volume|Dramatic)\s+Fullsets?$/i);
            if (m) return pipe('Full Set', m[1]);
            m = n.match(/^(Classic|Hybrid|Volume|Dramatic)\s+Fill$/i);
            if (m) return pipe('Fill', m[1]);
            m = n.match(/^Full\s+Sets?\s*\|\s*(.+)$/i);
            if (m) return pipe('Full Set', m[1]);
            m = n.match(/^Fullsets?\s*\|\s*(.+)$/i);
            if (m && /\b(classic|hybrid|volume|dramatic)\b/i.test(m[1])) return pipe('Full Set', m[1]);
            m = n.match(/^Fill\s*\|\s*(.+)$/i);
            if (m) return pipe('Fill', m[1]);
            // Lash Lift / Removal / Brow — leave readable
            return n;
        }

        // Pedicure: Spa Pedicure → Pedicure | Spa
        if (isPedi || /pedicure/i.test(n)) {
            const pediTypes = ['Spa', 'Silken', 'Exfoliating', 'Detox', 'Jelly', 'Gel'];
            for (let i = 0; i < pediTypes.length; i++) {
                const t = pediTypes[i];
                if (new RegExp('^' + t + '\\s+Pedicures?$', 'i').test(n) || new RegExp('^Pedicures?\\s+' + t + '$', 'i').test(n)) {
                    return pipe('Pedicure', t);
                }
            }
            if (/^pedicures?$/i.test(n)) return 'Pedicure';
            // Toes Fullset / Fill keep kind first
            let m = n.match(/^Toes\s+(Fullset|Fill)\s*(.*)$/i);
            if (m) return pipe(m[1].replace(/^fullset$/i, 'Fullset').replace(/^fill$/i, 'Fill'),
                ('Toes ' + (m[2] || '')).replace(/\s+/g, ' ').trim());
            m = n.match(/^(Fullset|Fill)\s+2\s+Big\s+Toe\s*(.*)$/i);
            if (m) return pipe(m[1].replace(/^fullset$/i, 'Fullset').replace(/^fill$/i, 'Fill'),
                ('2 Big Toe ' + (m[2] || '')).replace(/\s+/g, ' ').trim());
        }

        // Manicure: Gel Manicure → Manicure | Gel
        if (isMani || (/manicure/i.test(n) && !isKid)) {
            if (/^(Regular|Gel)\s+Manicures?$/i.test(n)) {
                return pipe('Manicure', n.replace(/\s+Manicures?$/i, '').trim());
            }
            if (/^Manicures?\s+(Regular|Gel)$/i.test(n)) {
                return pipe('Manicure', n.replace(/^Manicures?\s+/i, '').trim());
            }
        }

        // Kid menu: Acrylic Fullset → Fullset | Acrylic ; Gel X Fill → Fill | Gel X
        if (isKid) {
            let m = n.match(/^(Acrylic|Polygel|Gel\s*X|Liquid\s+Gel)\s+(Fullset|Fill)$/i);
            if (m) {
                const kind = /fill/i.test(m[2]) ? 'Fill' : 'Fullset';
                return pipe(kind, m[1].replace(/gel\s*x/i, 'Gel X'));
            }
            m = n.match(/^(Fullset|Fill)\s+(Acrylic|Polygel|Gel\s*X|Liquid\s+Gel)\b(.*)$/i);
            if (m) {
                const kind = /fill/i.test(m[1]) ? 'Fill' : 'Fullset';
                return pipe(kind, (m[2] + ' ' + (m[3] || '')).replace(/gel\s*x/i, 'Gel X').trim());
            }
            m = n.match(/^Toes\s+(Fullset|Fill)\s*(.*)$/i);
            if (m) {
                const kind = /fill/i.test(m[1]) ? 'Fill' : 'Fullset';
                return pipe(kind, ('Toes ' + (m[2] || '')).replace(/\s+/g, ' ').trim());
            }
            m = n.match(/^(Fullset|Fill)\s+2\s+Big\s+Toe\s*(.*)$/i);
            if (m) {
                const kind = /fill/i.test(m[1]) ? 'Fill' : 'Fullset';
                return pipe(kind, ('2 Big Toe ' + (m[2] || '')).replace(/\s+/g, ' ').trim());
            }
            if (/^(Regular|Gel)\s+Manicures?$/i.test(n)) return pipe('Manicure', n.replace(/\s+Manicures?$/i, ''));
            if (/^(Regular|Gel)\s+Pedicures?$/i.test(n)) return pipe('Pedicure', n.replace(/\s+Pedicures?$/i, ''));
            if (/^Manicures?$/i.test(n)) return 'Manicure';
            if (/^Pedicures?$/i.test(n)) return 'Pedicure';
        }

        // Nail enhancements / generic fullset-fill
        if (isEnh || /^(Fullset|Fill)\b/i.test(n) || /acrylic|gel\s*x|polygel|liquid\s*gel/i.test(n)) {
            let m = n.match(/^(Fullset|Fill)\s+(Acrylic|Polygel|Gel\s*X|Liquid\s+Gel)\b(?:\s*\|\s*|\s+)?(.*)$/i);
            if (m) {
                const kind = /fill/i.test(m[1]) ? 'Fill' : 'Fullset';
                const prod = m[2].replace(/gel\s*x/i, 'Gel X');
                const rest = (m[3] || '').replace(/^\|\s*/, '').trim();
                return pipe(kind, (prod + (rest ? ' ' + rest : '')).trim());
            }
            m = n.match(/^(Acrylic|Polygel|Gel\s*X|Liquid\s+Gel)\s+(Fullset|Fill)\b(.*)$/i);
            if (m) {
                const kind = /fill/i.test(m[2]) ? 'Fill' : 'Fullset';
                const prod = m[1].replace(/gel\s*x/i, 'Gel X');
                const rest = (m[3] || '').replace(/^\|\s*/, '').trim();
                return pipe(kind, (prod + (rest ? ' ' + rest : '')).trim());
            }
        }

        // Dip
        if (isDip || /^dip\b/i.test(n)) {
            if (/^dip\s*(with|w\/)?\s*tips$/i.test(n) || /^dip\s+with\s+tips$/i.test(n)) return pipe('Dip', 'With Tips');
            if (/^dip\s+overlay$/i.test(n)) return pipe('Dip', 'Overlay');
        }

        // Fix & Removal — keep pipe style
        if (isFix) {
            if (/^nail repair\s*\|\s*/i.test(n)) return n.replace(/\s*\|\s*/g, ' | ').replace(/\s+/g, ' ').trim();
            if (/^nail repair\b/i.test(n)) {
                const rest = n.replace(/^nail repair\s*/i, '').replace(/^\|\s*/, '').trim();
                return rest ? pipe('Nail Repair', rest) : 'Nail Repair';
            }
        }

        // Short pedi/mani keys from tickets
        const pediShort = { spa: 'Spa', silken: 'Silken', exfoliating: 'Exfoliating', detox: 'Detox', jelly: 'Jelly', gel: 'Gel' };
        const maniShort = { regular: 'Regular', gel: 'Gel' };
        const key = n.toLowerCase();
        if (pediShort[key] && (isPedi || (!isMani && !isKid && key !== 'gel' && key !== 'regular'))) {
            if (isPedi || (key !== 'gel' && key !== 'regular')) return pipe('Pedicure', pediShort[key]);
        }
        if (maniShort[key] && isMani) return pipe('Manicure', maniShort[key]);
        if (/^gel$/i.test(n)) {
            if (isMani) return pipe('Manicure', 'Gel');
            if (isPedi) return pipe('Pedicure', 'Gel');
        }

        n = n.replace(/\bwith\s+with\b/gi, 'with');
        n = n.replace(/\s+/g, ' ').trim();
        return n || String(name).trim();
    },

    // Resolve category/id so short ticket names (Spa, Gel, …) become full display labels
    resolveServiceMeta(s) {
        if (s == null || typeof s === 'string') {
            return { name: s == null ? '' : s, category: '', id: null, price: null };
        }
        let name = s.name;
        let category = s.category || '';
        let id = s.id != null ? s.id : null;
        let price = s.price != null ? s.price : null;
        const catalog = (typeof window !== 'undefined' && window.DataManager && DataManager.data && DataManager.data.services)
            ? DataManager.data.services
            : [];
        const norm = (nm) => String(nm || '').trim().toLowerCase();
        const bare = norm(name);
        const shortKeys = new Set(['gel', 'spa', 'silken', 'exfoliating', 'detox', 'jelly', 'regular']);
        let found = null;
        if (id != null && catalog.length) {
            found = catalog.find(x => Number(x.id) === Number(id)) || null;
        }
        if (!found && catalog.length && bare) {
            if (price != null && price !== '') {
                found = catalog.find(x =>
                    Number(x.price) === Number(price) &&
                    (norm(x.name) === bare || norm(x.name).startsWith(bare + ' '))
                ) || null;
            }
            if (!found) {
                found = catalog.find(x => norm(x.name) === bare) ||
                    catalog.find(x => shortKeys.has(bare) && norm(x.name).startsWith(bare + ' ')) ||
                    null;
            }
        }
        if (found) {
            if (!category) category = found.category || '';
            if (id == null) id = found.id;
            if (price == null) price = found.price;
            // Prefer catalog full name when ticket still has the short label
            if (shortKeys.has(bare) && found.name && norm(found.name) !== bare) name = found.name;
            else if (shortKeys.has(bare) && found.category) category = found.category;
        }
        if (shortKeys.has(bare) && !category) {
            if (Number(id) === 33 || Number(id) === 32) category = 'Manicure';
            if ([44, 45, 47, 48, 49, 50].includes(Number(id))) category = 'Pedicure';
            if (bare === 'regular' && Number(price) === 30) category = 'Manicure';
            if (bare === 'spa' || bare === 'silken' || bare === 'exfoliating' || bare === 'detox' || bare === 'jelly') {
                category = 'Pedicure';
            }
            if (bare === 'gel') {
                if (Number(price) === 40) category = 'Manicure';
                else if (Number(price) === 53) category = 'Pedicure';
            }
        }
        return { name, category, id, price };
    },

    serviceDisplayName(s) {
        if (s == null) return '';
        if (typeof s === 'string') return this.cleanServiceName(s);
        const meta = this.resolveServiceMeta(s);
        return this.cleanServiceName(meta.name, meta.category);
    },

    // Escape + paint "|" separators gold for service menus / tickets
    serviceDisplayNameHtml(s) {
        const cleaned = this.serviceDisplayName(s);
        return this.formatServicePipeHtml(cleaned);
    },

    formatServicePipeHtml(text) {
        const esc = String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        return esc.replace(/\s*\|\s*/g, ' <span class="svc-pipe" aria-hidden="true">|</span> ');
    },

    // Appointment-block service label
    formatApptServiceHtml(nameOrSvc, category) {
        if (nameOrSvc == null || nameOrSvc === '') return '';
        const cleaned = (typeof nameOrSvc === 'object')
            ? this.serviceDisplayName(nameOrSvc)
            : this.cleanServiceName(nameOrSvc, category);
        return this.formatServicePipeHtml(cleaned);
    },
    
    // Format duration
    formatDuration(minutes) {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    },

    // Staff + client names are always ALL CAPS (stored and displayed)
    capsName(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().toUpperCase();
    },

    capsPerson(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        if (obj.firstName != null && obj.firstName !== '') obj.firstName = this.capsName(obj.firstName);
        if (obj.lastName != null && obj.lastName !== '') obj.lastName = this.capsName(obj.lastName);
        if (obj.name != null && obj.name !== '') obj.name = this.capsName(obj.name);
        else if (obj.firstName || obj.lastName) {
            obj.name = this.capsName(((obj.firstName || '') + ' ' + (obj.lastName || '')).trim());
        }
        if (obj.clientName != null && obj.clientName !== '') obj.clientName = this.capsName(obj.clientName);
        if (obj.staffName != null && obj.staffName !== '') obj.staffName = this.capsName(obj.staffName);
        if (obj.lastStaff != null && obj.lastStaff !== '') obj.lastStaff = this.capsName(obj.lastStaff);
        if (obj.lastStaffName != null && obj.lastStaffName !== '') obj.lastStaffName = this.capsName(obj.lastStaffName);
        return obj;
    },
    
    // Truncate text
    truncate(text, length = 50) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Deep clone
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Get initials from name — one letter if single name; first+last if both present
    getInitials(name) {
        if (!name) return '?';
        const parts = String(name).trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '?';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    // Format 24h "HH:MM" (or ISO) → 12h display — always AM/PM
    formatTime12(t) {
        if (t == null || t === '') return '';
        if (t instanceof Date && !isNaN(t.getTime())) {
            const h = t.getHours();
            return (h % 12 || 12) + ':' + String(t.getMinutes()).padStart(2, '0') + ' ' + (h >= 12 ? 'PM' : 'AM');
        }
        const raw = String(t).trim();
        const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)\b/i);
        if (ampmMatch) {
            let h = parseInt(ampmMatch[1], 10) || 12;
            if (h > 12) h = h % 12 || 12;
            return h + ':' + ampmMatch[2] + ' ' + ampmMatch[3].toUpperCase();
        }
        if (/[T-]/.test(raw) && raw.length > 8) {
            const d = new Date(raw);
            if (!isNaN(d.getTime())) {
                const h = d.getHours();
                return (h % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + (h >= 12 ? 'PM' : 'AM');
            }
        }
        const parts = raw.split(':');
        let h = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        if (isNaN(h)) return raw;
        if (isNaN(m)) m = 0;
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return h + ':' + String(m).padStart(2, '0') + ' ' + ap;
    },

    // Weekly work schedule for Meet the Team (uses staff.workSchedule or salon hours)
    getStaffWeekSchedule(staff) {
        const st = (typeof DataManager !== 'undefined' && DataManager.settings) ? DataManager.settings : {};
        const open = st.openTime || '09:30';
        const close = st.closeTime || '18:30';
        const sunOpen = st.sunOpenTime || '11:00';
        const sunClose = st.sunCloseTime || '17:00';
        const days = [
            { key: 'mon', label: 'Mon' },
            { key: 'tue', label: 'Tue' },
            { key: 'wed', label: 'Wed' },
            { key: 'thu', label: 'Thu' },
            { key: 'fri', label: 'Fri' },
            { key: 'sat', label: 'Sat' },
            { key: 'sun', label: 'Sun' }
        ];
        const custom = (staff && (staff.workSchedule || staff.schedule)) || null;
        return days.map(d => {
            if (custom && custom[d.key]) {
                const c = custom[d.key];
                const on = c.on !== false && c.off !== true;
                return {
                    label: d.label,
                    on: on,
                    open: c.open || (d.key === 'sun' ? sunOpen : open),
                    close: c.close || (d.key === 'sun' ? sunClose : close)
                };
            }
            // Default: match salon hours every day
            return {
                label: d.label,
                on: true,
                open: d.key === 'sun' ? sunOpen : open,
                close: d.key === 'sun' ? sunClose : close
            };
        });
    },

    formatStaffScheduleHtml(staff) {
        const week = this.getStaffWeekSchedule(staff);
        const working = week.filter(d => d.on);
        const off = week.filter(d => !d.on);
        const fmt = (d) => d.label + ' ' + this.formatTime12(d.open) + ' – ' + this.formatTime12(d.close);
        // Group consecutive days with same hours
        const groups = [];
        working.forEach(d => {
            const key = d.open + '|' + d.close;
            const last = groups[groups.length - 1];
            if (last && last.key === key) {
                last.days.push(d.label);
            } else {
                groups.push({ key: key, days: [d.label], open: d.open, close: d.close });
            }
        });
        const workLines = groups.map(g => {
            const dayStr = g.days.length === 1 ? g.days[0]
                : (g.days[0] + ' – ' + g.days[g.days.length - 1]);
            return dayStr + ' · ' + this.formatTime12(g.open) + ' – ' + this.formatTime12(g.close);
        });
        const offLine = off.length ? off.map(d => d.label).join(', ') : '';
        return { workLines: workLines, offLine: offLine };
    },
    
    // Calculate time difference
    timeDiff(start, end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        return (eh * 60 + em) - (sh * 60 + sm);
    },
    
    // Get today's date string
    today() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    
    // Get current time string
    now() {
        const d = new Date();
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    },
    
    // Parse CSV
    parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            const values = lines[i].split(',');
            const obj = {};
            headers.forEach((h, j) => {
                obj[h] = values[j] ? values[j].trim() : '';
            });
            result.push(obj);
        }
        return result;
    },
    
    // Export to CSV
    exportCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.csv';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Validate phone
    isValidPhone(phone) {
        return phone.replace(/\D/g, '').length >= 10;
    },
    
    // Generate random color
    randomColor() {
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// ===== UI UTILITIES =====

const UI = {
    // Show toast notification
    toast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `<span style="font-size:1.1rem;">${icons[type] || 'ℹ'}</span> ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        if (window.confirm(message)) {
            if (typeof onConfirm === 'function') onConfirm();
        } else {
            if (typeof onCancel === 'function') onCancel();
        }
    },
    
    // Show loading
    showLoading(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;padding:40px;"><div class="loading-spinner"></div></div>';
        }
    },
    
    // Set active nav tab
    setActiveNav(tabId) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
    },
    
    // Set active sidebar button
    setActiveSidebar(buttonId) {
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            // Cross-page links from AppNav use data-app-nav — leave their highlight alone
            if (btn.hasAttribute('data-app-nav')) return;
            btn.classList.toggle('active', btn.dataset.page === buttonId);
        });
    },
    
    // Animate number counter
    animateNumber(element, target, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + range * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },
    
    // Create searchable dropdown
    createSearchDropdown(input, data, onSelect) {
        let dropdown = input.nextElementSibling;
        if (!dropdown || !dropdown.classList.contains('search-dropdown')) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-dropdown';
            dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#1a1a1a;border:1px solid #333;border-radius:8px;max-height:200px;overflow-y:auto;z-index:100;display:none;margin-top:4px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(dropdown);
        }
        
        input.addEventListener('input', Utils.debounce(() => {
            const term = input.value.toLowerCase();
            if (!term) {
                dropdown.style.display = 'none';
                return;
            }
            
            const filtered = data.filter(item =>
                (item.name && item.name.toLowerCase().includes(term)) ||
                (item.phone && item.phone.includes(term))
            );
            
            if (filtered.length === 0) {
                dropdown.style.display = 'none';
                return;
            }
            
            dropdown.innerHTML = filtered.map(item => `
                <div class="search-item" style="padding:8px 12px;cursor:pointer;font-size:0.85rem;border-bottom:1px solid #2a2a2a;transition:background 0.2s;" 
                     onmouseover="this.style.background='#252525'" 
                     onmouseout="this.style.background=''"
                     data-id="${item.id}">
                    <div style="font-weight:600;color:#e5e7eb;">${item.name}</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">${item.phone ? Utils.formatPhone(item.phone) : ''}</div>
                </div>
            `).join('');
            
            dropdown.querySelectorAll('.search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = parseInt(item.dataset.id);
                    const selected = data.find(d => d.id === id);
                    if (typeof onSelect === 'function') onSelect(selected);
                    dropdown.style.display = 'none';
                });
            });
            
            dropdown.style.display = 'block';
        }, 200));
        
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
};

// ===== AUTH UTILITIES =====

const Auth = {
    currentUser: null,
    
    // Login with PIN — master admin/manager PINs first, then personal staff PINs
    login(pin) {
        pin = String(pin || '').trim();
        const settings = (typeof DataManager !== 'undefined' && DataManager.settings) || {};
        
        if (pin && pin === String(settings.adminPin || '')) {
            this.currentUser = { role: 'admin', name: 'Admin', pin: pin, via: 'adminPin' };
            return { success: true, role: 'admin', name: 'Admin' };
        }
        if (pin && pin === String(settings.managerPin || '')) {
            this.currentUser = { role: 'manager', name: 'Manager', pin: pin, via: 'managerPin' };
            return { success: true, role: 'manager', name: 'Manager' };
        }
        
        const list = (typeof DataManager !== 'undefined' && DataManager.getStaff) ? (DataManager.getStaff() || []) : [];
        const staff = list.find(s => s && String(s.pin || '') === pin);
        if (staff) {
            const st = String(staff.status || 'active').toLowerCase();
            if (st === 'inactive' || st === 'deleted') {
                return { success: false, message: 'This PIN is disabled' };
            }
            const primary = (typeof Utils !== 'undefined' && Utils.primaryRole)
                ? Utils.primaryRole(staff)
                : String(staff.role || 'staff').toLowerCase();
            this.currentUser = { role: primary, name: staff.name, pin: pin, staffId: staff.id, via: 'staffPin' };
            return { success: true, role: primary, name: staff.name, staffId: staff.id };
        }
        
        return { success: false, message: 'Invalid PIN' };
    },
    
    // Logout
    logout() {
        this.currentUser = null;
    },
    
    // Check if logged in
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    // Check role
    hasRole(role) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'admin') return true; // Admin can do everything
        if (role === 'manager' && this.currentUser.role === 'manager') return true;
        if (role === 'staff' && ['manager', 'nail tech', 'admin'].includes(this.currentUser.role)) return true;
        return this.currentUser.role === role;
    },
    
    // Get current user
    getUser() {
        return this.currentUser;
    },
    
    // Verify PIN for action — uses live DataManager so changed PINs work immediately
    verifyPin(pin, requiredRole) {
        try {
            if (typeof DataManager !== 'undefined' && DataManager) {
                if (requiredRole === 'admin' && typeof DataManager.verifyAdminPin === 'function') {
                    return DataManager.verifyAdminPin(pin);
                }
                if (requiredRole === 'manager' && typeof DataManager.verifyAdminOrManagerPin === 'function') {
                    return DataManager.verifyAdminOrManagerPin(pin);
                }
            }
        } catch (e) { /* fall through */ }
        const prev = this.currentUser;
        const result = this.login(pin);
        this.currentUser = prev;
        if (!result.success) return false;
        if (requiredRole === 'admin') return result.role === 'admin';
        if (requiredRole === 'manager') return result.role === 'admin' || result.role === 'manager';
        return true;
    }
};

// ===== CALENDAR UTILITIES =====

const CalendarUtils = {
    // Get days in month
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    // Get first day of month
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },
    
    // Get month name
    getMonthName(month) {
        const names = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return names[month];
    },
    
    // Get day name
    getDayName(day) {
        const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return names[day];
    },
    
    // Get short day name
    getShortDayName(day) {
        return this.getDayName(day).slice(0, 3);
    },
    
    // Generate time slots
    generateTimeSlots(startTime, endTime, interval = 15) {
        const slots = [];
        let [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        
        while (sh < eh || (sh === eh && sm < em)) {
            slots.push(`${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`);
            sm += interval;
            if (sm >= 60) {
                sh += Math.floor(sm / 60);
                sm = sm % 60;
            }
        }
        return slots;
    },
    
    // Check if date is today
    isToday(date) {
        return date === Utils.today();
    },
    
    // Check if date is past
    isPast(date) {
        return new Date(date) < new Date(Utils.today());
    },
    
    // Get week dates
    getWeekDates(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const week = [];
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(d.setDate(diff + i));
            week.push(dayDate.toISOString().split('T')[0]);
        }
        return week;
    }
};

// ===== AI UTILITIES (routed through local salon server — Cursor AI; no API keys in frontend) =====

const GeminiAI = {
    // Same-origin by default so public booking (port 3002 / tunnel) hits /api/client-chat
    // on THIS host — never hardcode localhost:3001 (breaks phones + public tunnels).
    get proxyUrl() {
        try {
            const stored = localStorage.getItem('salonServerUrl') || localStorage.getItem('kimiProxyUrl');
            if (stored && String(stored).trim()) return String(stored).replace(/\/$/, '');
        } catch (e) {}
        return '';
    },
    history: [], // {role, content} — kept for multi-turn conversation

    async generateResponse(prompt, context = '') {
        try {
            const base = this.proxyUrl;
            const url = (base || '') + '/api/client-chat';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: prompt,
                    history: this.history.slice(-20),
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data && data.error && !data.choices) {
                throw new Error(typeof data.error === 'string' ? data.error : 'AI unavailable');
            }
            const reply = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
                || data.reply || data.message;
            if (!reply) throw new Error('Bad response from AI server');

            this.history.push({ role: 'user', content: prompt }, { role: 'assistant', content: reply });
            return reply;
        } catch (error) {
            console.error('Salon AI proxy error:', error);
            // Throw so callers can fall back to local FAQ / command parsers
            throw error;
        }
    },
    
    // Voice recognition setup
    setupVoiceRecognition(onResult, onError) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (typeof onError === 'function') onError('Speech recognition not supported in this browser');
            return null;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (typeof onResult === 'function') onResult(transcript);
        };
        
        recognition.onerror = (event) => {
            if (typeof onError === 'function') onError(event.error);
        };
        
        return recognition;
    },
    
    // Text to speech
    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }
};

// Make utilities globally available
window.Utils = Utils;
window.UI = UI;
window.Auth = Auth;
window.CalendarUtils = CalendarUtils;
window.GeminiAI = GeminiAI;

// ===== SALON BRAND (internal / public pages) =====
// Salon name synced from Admin settings. Page headers show:
// Urban Nail Bar logo + name + Powered by Urban Nail Bar with AI Integration
// (Full Urban Nail Bar system title stays on the home page only.)
(function () {
    function applySalonNameTag() {
        if (typeof DataManager === 'undefined' || !DataManager.settings) return;
        const name = DataManager.settings.salonName || 'Urban Nail Bar';
        document.querySelectorAll('.brand-salon-name').forEach(function (el) {
            el.textContent = name;
        });
        document.querySelectorAll('.salon-name-tag').forEach(function (el) {
            if (el.classList.contains('brand-salon-name')) return;
            el.textContent = '· ' + name;
        });
        if (document.querySelector('.brand-salon-name, .salon-name-tag')) {
            const base = document.title.replace(/\s*·\s*[^·]+$/, '');
            if (document.title !== base + ' · ' + name) {
                document.title = base + ' · ' + name;
            }
        }
    }
    document.addEventListener('DOMContentLoaded', applySalonNameTag);
    if (typeof DataManager !== 'undefined' && DataManager.addListener) {
        DataManager.addListener(function (type) { if (type === 'settings') applySalonNameTag(); });
    }
    window.applySalonNameTag = applySalonNameTag;
})();

// Clicking any date number / date field opens the native calendar picker
(function wireGoldDatePickers() {
    function openNativeDatePicker(el, ev) {
        if (!el || el.disabled || el.readOnly) return false;
        try {
            if (typeof el.showPicker === 'function') {
                if (ev) {
                    try { ev.preventDefault(); } catch (ePrev) {}
                }
                el.showPicker();
                return true;
            }
        } catch (errShow) { /* fall through */ }
        try { el.focus(); } catch (errFocus) {}
        return false;
    }
    window.openNativeDatePicker = openNativeDatePicker;

    function fromEvent(ev) {
        const t = ev && ev.target;
        if (!t || t.tagName !== 'INPUT') return;
        if (String(t.type || '').toLowerCase() !== 'date') return;
        openNativeDatePicker(t, ev);
    }

    document.addEventListener('pointerdown', fromEvent, true);
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('input[type="date"]').forEach(function (el) {
            if (!el.classList.contains('gold-date')) el.classList.add('gold-date');
        });
    });
})();

/** Press Enter to confirm the active modal / dialog primary action (all pages). */
(function wireEnterToConfirm() {
    if (typeof window === 'undefined' || window._unbEnterConfirmWired) return;
    window._unbEnterConfirmWired = true;

    function isVisible(el) {
        if (!el || !el.getBoundingClientRect) return false;
        const st = window.getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || Number(st.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    function activeOverlay() {
        const nodes = Array.from(document.querySelectorAll('.modal-overlay.active, .modal-overlay.show, [data-modal].active'));
        for (let i = nodes.length - 1; i >= 0; i--) {
            if (isVisible(nodes[i])) return nodes[i];
        }
        return null;
    }

    function tryPickFirstSearchResult(scope) {
        const root = scope || document;
        const lists = root.querySelectorAll(
            '.search-results.active, #apptClientResults.active, #globalSearchResults.active, #headerSearchResults, #walkinClientResults, #bookClientResults, #checkoutClientResults'
        );
        for (let i = 0; i < lists.length; i++) {
            const list = lists[i];
            if (!isVisible(list) && !(list.classList && list.classList.contains('active'))) continue;
            if (list.style && list.style.display === 'none') continue;
            const item = list.querySelector('.search-result-item, [onclick*="select"], [onclick*="pick"], [role="option"]');
            if (item) {
                item.click();
                return true;
            }
        }
        return false;
    }

    function findConfirmButton(overlay) {
        if (!overlay) return null;
        const preferred = overlay.querySelector(
            'button[data-enter-confirm], [data-enter-confirm].btn, .btn-row .btn-primary, .modal-footer .btn-primary'
        );
        if (preferred && !preferred.disabled && isVisible(preferred)) return preferred;
        const buttons = Array.from(overlay.querySelectorAll('button.btn-primary, button.btn-success, button[type="submit"]'));
        for (let i = buttons.length - 1; i >= 0; i--) {
            const b = buttons[i];
            if (!b || b.disabled || !isVisible(b)) continue;
            const label = String(b.textContent || '').toLowerCase();
            if (/cancel|close|back|delete|remove|clear/.test(label) && !/confirm|save|book|add|create|submit|ok|yes|pay|check/.test(label)) continue;
            return b;
        }
        return null;
    }

    document.addEventListener('keydown', function (e) {
        if (!e || e.key !== 'Enter' || e.defaultPrevented) return;
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.isComposing) return;
        const t = e.target;
        if (!t) return;
        const tag = String(t.tagName || '').toUpperCase();
        if (tag === 'TEXTAREA' || t.isContentEditable) return;
        if (t.getAttribute && t.getAttribute('data-enter-skip') != null) return;
        if (t.id === 'aiChatInput') return;
        if (tag === 'BUTTON' || (tag === 'INPUT' && /^(submit|button|checkbox|radio|file)$/i.test(t.type || ''))) return;
        if (tag === 'A' && t.href) return;

        const overlay = activeOverlay();
        if (overlay) {
            if (tryPickFirstSearchResult(overlay)) {
                e.preventDefault();
                return;
            }
            const btn = findConfirmButton(overlay);
            if (btn) {
                e.preventDefault();
                try { btn.click(); } catch (errClick) {}
                return;
            }
        }

        // No modal: still allow Enter to pick open client search dropdowns (header / global)
        if (tryPickFirstSearchResult(document)) {
            e.preventDefault();
        }
    }, true);
})();
