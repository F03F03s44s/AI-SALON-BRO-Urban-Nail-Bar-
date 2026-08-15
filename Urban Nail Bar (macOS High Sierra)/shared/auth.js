/**
 * Urban Nail Bar - Shared Access Control (SalonAuth)
 * Load AFTER data-manager.js and utils.js.
 *
 * Gates staff-only pages (e.g. the Scheduler) so only the roles you allow
 * (Manager, Admin, Receptionist) can get in. The login session is shared
 * across every open page through localStorage, and it is continuously
 * re-validated against live data:
 *   - If a staff member's PIN or role is changed, or they are
 *     deactivated/deleted, their access is revoked on ALL pages instantly.
 *   - If the admin/manager master PINs change, those sessions are revoked too.
 *   - Logging out on one page locks every other open staff page.
 *
 * Usage on a restricted page (in <head>, right after utils.js):
 *   <script src="../shared/auth.js?v=20260728"></script>
 *   <script>SalonAuth.guardPage(['admin','manager','receptionist'], { pageName: 'Scheduler' });</script>
 */

const SALON_SESSION_KEY = 'aiSalonPro_v3_session';
const SALON_SESSION_MAX_AGE = 12 * 60 * 60 * 1000; // 12-hour front-desk shift

const SalonAuth = {
    SESSION_KEY: SALON_SESSION_KEY,

    // Full multi-staff Scheduler (day board). Technicians use Staff → My Schedule instead.
    // Receptionist kept: front-desk PIN needs the board; pure technicians do not.
    SCHEDULER_ROLES: ['admin', 'manager', 'receptionist'],

    _gateEl: null,
    _chipEl: null,
    _watching: false,
    _failCount: 0,
    _cooldownUntil: 0,
    _guardRoles: null,
    _guardOpts: null,

    // ===================== SESSION =====================

    _readSession() {
        try {
            const raw = localStorage.getItem(SALON_SESSION_KEY);
            if (!raw) return null;
            const sess = JSON.parse(raw);
            if (!sess || !sess.user || !sess.at) return null;
            if (Date.now() - sess.at > SALON_SESSION_MAX_AGE) {
                this._clearSession();
                return null;
            }
            return sess;
        } catch (e) {
            return null;
        }
    },

    _writeSession(user) {
        try {
            localStorage.setItem(SALON_SESSION_KEY, JSON.stringify({ user, at: Date.now() }));
        } catch (e) { /* storage full/blocked — session just won't persist */ }
    },

    _clearSession() {
        try { localStorage.removeItem(SALON_SESSION_KEY); } catch (e) {}
    },

    // Is the session's credential still valid against LIVE data?
    _stillValid(user) {
        if (!user) return false;
        const settings = DataManager.settings || {};
        if (user.via === 'adminPin')   return user.pin === settings.adminPin;
        if (user.via === 'managerPin') return user.pin === settings.managerPin;
        if (user.via === 'staffPin') {
            const staff = DataManager.getStaff().find(s => s.id === user.staffId || String(s.id) === String(user.staffId));
            const st = String((staff && staff.status) || 'active').toLowerCase();
            if (!staff || st === 'inactive' || st === 'deleted' || String(staff.pin || '') !== String(user.pin || '')) return false;
            const roles = (typeof Utils !== 'undefined' && Utils.getStaffRoles) ? Utils.getStaffRoles(staff) : [(staff.role || '').toLowerCase()];
            const primary = (typeof Utils !== 'undefined' && Utils.primaryRole) ? Utils.primaryRole(staff) : (staff.role || '').toLowerCase();
            // Accept if session role matches primary OR any of the staff's roles
            return roles.includes(String(user.role || '').toLowerCase())
                || String(user.role || '').toLowerCase() === primary;
        }
        return false;
    },

    // Currently logged-in user (validated), or null
    current() {
        const sess = this._readSession();
        if (!sess) return null;
        if (!this._stillValid(sess.user)) {
            this._clearSession();
            return null;
        }
        return sess.user;
    },

    // Does the current user hold one of the allowed roles?
    // Pass ['*'] to allow any authenticated staff member.
    hasAccess(roles) {
        const user = this.current();
        if (!user) return false;
        if (roles.includes('*')) return true;
        const allowed = roles.map(r => String(r).toLowerCase());
        // Master PINs / session primary role
        if (allowed.includes((user.role || '').toLowerCase())) return true;
        // Multi-role staff: check all roles on the live staff record
        if (user.via === 'staffPin' && user.staffId != null) {
            const staff = DataManager.getStaff().find(s => s.id === user.staffId);
            if (staff && typeof Utils !== 'undefined' && Utils.getStaffRoles) {
                return Utils.getStaffRoles(staff).some(r => allowed.includes(r));
            }
        }
        return false;
    },

    /** Manager / admin / receptionist — full multi-staff Scheduler. */
    canAccessScheduler() {
        return this.hasAccess(this.SCHEDULER_ROLES);
    },

    /**
     * Logged-in staff whose roles are technician-only (no manager/admin/receptionist).
     * Used to send them to personal My Schedule instead of the full board.
     */
    isTechnicianOnly() {
        const user = this.current();
        if (!user) return false;
        if (this.canAccessScheduler()) return false;
        return this.hasAccess(['*']);
    },

    // ===================== LOGIN / LOGOUT =====================

    login(pin) {
        pin = String(pin || '').trim();
        if (!pin) return { success: false, message: 'Please enter your PIN' };

        const settings = DataManager.settings || {};

        if (pin === settings.adminPin) {
            return this._establish({ role: 'admin', name: 'Admin', via: 'adminPin', pin });
        }
        if (pin === settings.managerPin) {
            return this._establish({ role: 'manager', name: 'Manager', via: 'managerPin', pin });
        }

        const staff = DataManager.getStaff().find(s => {
            if (!s || String(s.pin || '') !== pin) return false;
            const st = String(s.status || 'active').toLowerCase();
            return st !== 'inactive' && st !== 'deleted';
        });
        if (staff) {
            const primary = (typeof Utils !== 'undefined' && Utils.primaryRole) ? Utils.primaryRole(staff) : (staff.role || 'staff').toLowerCase();
            return this._establish({
                role: primary,
                name: staff.name,
                staffId: staff.id,
                via: 'staffPin',
                pin
            });
        }

        return { success: false, message: 'Invalid PIN' };
    },

    _establish(user) {
        this._writeSession(user);
        try {
            if (window.AppNav && typeof AppNav.remount === 'function') AppNav.remount();
        } catch (e) { /* nav optional */ }
        return { success: true, role: user.role, name: user.name };
    },

    _audit(action, message) {
        try {
            if (DataManager.logAudit) DataManager.logAudit(action, message);
        } catch (e) {}
    },

    logout() {
        const user = this.current();
        this._clearSession();
        try {
            if (typeof Auth !== 'undefined' && Auth) Auth.currentUser = null;
        } catch (e) {}
        try {
            if (window.AppNav && typeof AppNav.remount === 'function') AppNav.remount();
        } catch (e) { /* nav optional */ }
        if (user) this._audit('staff_logout', `${user.name} (${user.role}) logged out of a staff-only page.`);
    },

    // ===================== PAGE GATE =====================

    /**
     * Block the page behind a PIN lock until someone with an allowed role
     * logs in. Call from <head> so the page never flashes its content.
     *
     * @param {string[]} roles   e.g. ['admin','manager','receptionist']
     * @param {object}   opts    { pageName, homeHref, chip, deniedRedirect }
     *   deniedRedirect — if a logged-in user (or valid PIN) lacks the role,
     *   send them here instead of showing “no access” (e.g. techs → My Schedule).
     */
    guardPage(roles, opts = {}) {
        roles = roles.map(r => String(r).toLowerCase());
        opts = Object.assign({}, opts);
        opts.pageName = opts.pageName || document.title || 'This page';
        opts.homeHref = opts.homeHref || '../index.html';
        this._guardRoles = roles;
        this._guardOpts = opts;

        // Hide the page immediately so restricted content never flashes
        const hideStyle = document.createElement('style');
        hideStyle.id = 'salonAuthHide';
        hideStyle.textContent = 'html.salon-auth-locked body{visibility:hidden!important;}';
        document.head.appendChild(hideStyle);

        const boot = () => {
            if (this.hasAccess(roles)) {
                this._unlock(roles, opts);
                return;
            }
            // Already signed in as a role that cannot use this page (e.g. technician
            // opening Scheduler) → send them to their personal schedule.
            if (opts.deniedRedirect && this.current()) {
                try {
                    location.replace(opts.deniedRedirect);
                    return;
                } catch (e) {
                    location.href = opts.deniedRedirect;
                    return;
                }
            }
            document.documentElement.classList.add('salon-auth-locked');
            this._buildGate(roles, opts);
            // Overlay is opaque and covers everything — safe to unhide beneath it
            document.documentElement.classList.remove('salon-auth-locked');
            this._startWatchers(roles, opts);
        };

        if (document.body) boot();
        else document.addEventListener('DOMContentLoaded', boot);
    },

    _unlock(roles, opts) {
        document.documentElement.classList.remove('salon-auth-locked');
        document.body.style.visibility = '';
        if (this._gateEl) { this._gateEl.remove(); this._gateEl = null; }
        const hideStyle = document.getElementById('salonAuthHide');
        if (hideStyle) hideStyle.remove();
        this.syncLegacyAuth();
        if (opts.chip !== false) this._showChip(roles);
        this._startWatchers(roles, opts);
        if (typeof opts.onUnlock === 'function') {
            try { opts.onUnlock(this.current()); } catch (e) {}
        }
    },

    // Bridge the shared session into the page's legacy per-page Auth object
    // (shared/utils.js) so protected features work without a second login.
    // Header Login/Logout buttons stay hidden — the auth chip is the only logout.
    syncLegacyAuth() {
        try {
            const user = this.current();
            if (!user || typeof Auth === 'undefined' || !Auth) return;
            Auth.currentUser = { role: user.role, name: user.name, pin: user.pin, staffId: user.staffId };
            const nameEl = document.getElementById('currentUserName');
            if (nameEl) { nameEl.textContent = user.name; nameEl.style.color = 'var(--primary)'; }
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.style.display = 'none';
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.style.display = 'none';
        } catch (e) {}
    },

    _relock(roles, opts) {
        opts = opts || this._guardOpts || {};
        roles = roles || this._guardRoles || [];
        if (this._gateEl) return; // already locked
        if (this._chipEl) { this._chipEl.remove(); this._chipEl = null; }
        try {
            if (typeof Auth !== 'undefined' && Auth) Auth.currentUser = null;
        } catch (e) {}
        if (typeof opts.onLock === 'function') {
            try { opts.onLock(); } catch (e) {}
        }
        const nameEl = document.getElementById('currentUserName');
        if (nameEl) {
            nameEl.textContent = 'Not logged in';
            nameEl.style.color = 'var(--text-secondary)';
        }
        this._buildGate(roles, opts);
    },

    // Keep the lock state in sync with data changes and other tabs
    _startWatchers(roles, opts) {
        if (this._watching) return;
        this._watching = true;

        DataManager.addListener(() => {
            if (!this.hasAccess(roles)) this._relock(roles, opts);
        });

        // Logout / login in another tab takes effect here instantly
        window.addEventListener('storage', (e) => {
            if (e.key === SALON_SESSION_KEY) {
                if (this.hasAccess(roles)) {
                    if (this._gateEl) this._unlock(roles, opts);
                    else this._showChip(roles);
                } else {
                    this._relock(roles, opts);
                }
            }
        });
    },

    // ===================== GATE UI =====================

    _buildGate(roles, opts = {}) {
        if (this._gateEl) return;

        const pageName = opts.pageName || document.title || 'This page';
        const homeHref = opts.homeHref || '../index.html';
        const roleLabel = roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
        const brand = (DataManager.settings && DataManager.settings.salonName) || 'Urban Nail Bar';

        const gate = document.createElement('div');
        gate.id = 'salonAuthGate';
        gate.innerHTML = `
            <div class="sag-card" id="sagCard">
                <div class="sag-lock">🔒</div>
                <div class="sag-brand">💅 ${brand}</div>
                <h2 class="sag-title">Staff Access Only</h2>
                <p class="sag-sub"><b>${pageName}</b> is restricted to <b>${roleLabel}</b>.<br>Enter your staff PIN to continue.</p>
                <input type="password" id="sagPin" class="sag-input" maxlength="6"
                       inputmode="numeric" autocomplete="off" placeholder="••••">
                <div class="sag-error" id="sagError"></div>
                <button class="sag-btn" id="sagUnlock">Unlock</button>
                <a class="sag-home" href="${homeHref}">← Back to Home</a>
                <div class="sag-note">Access is logged · Synced across all pages</div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #salonAuthGate{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;
                visibility:visible!important;
                background:radial-gradient(circle at 50% 30%, #1c1508 0%, #0a0a0a 70%);
                font-family:'Inter',-apple-system,'Segoe UI',sans-serif;padding:20px;}
            #salonAuthGate .sag-card{width:100%;max-width:360px;background:#141414;border:1px solid rgba(251,191,36,.45);
                border-radius:18px;padding:34px 28px 26px;text-align:center;
                box-shadow:0 0 60px rgba(251,191,36,.18),0 20px 60px rgba(0,0,0,.6);}
            #salonAuthGate .sag-lock{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;
                background:linear-gradient(135deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;
                font-size:1.7rem;box-shadow:0 0 30px rgba(251,191,36,.45);}
            #salonAuthGate .sag-brand{color:#fbbf24;font-weight:800;font-size:.8rem;letter-spacing:2px;
                text-transform:uppercase;margin-bottom:6px;}
            #salonAuthGate .sag-title{color:#fff;font-size:1.4rem;font-weight:800;margin:0 0 8px;}
            #salonAuthGate .sag-sub{color:#9ca3af;font-size:.85rem;line-height:1.55;margin:0 0 20px;}
            #salonAuthGate .sag-sub b{color:#fbbf24;}
            #salonAuthGate .sag-input{width:100%;box-sizing:border-box;background:#0a0a0a;border:2px solid #333;color:#fff;
                padding:13px;border-radius:10px;font-size:1.35rem;font-weight:800;text-align:center;letter-spacing:10px;
                outline:none;transition:border-color .2s;}
            #salonAuthGate .sag-input:focus{border-color:#fbbf24;box-shadow:0 0 18px rgba(251,191,36,.25);}
            #salonAuthGate .sag-error{color:#f87171;font-size:.78rem;font-weight:700;min-height:20px;margin:8px 0 2px;}
            #salonAuthGate .sag-btn{width:100%;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;border:none;
                padding:13px;border-radius:10px;font-size:.95rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;
                cursor:pointer;transition:transform .15s,box-shadow .15s;margin-top:4px;}
            #salonAuthGate .sag-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(251,191,36,.35);}
            #salonAuthGate .sag-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
            #salonAuthGate .sag-home{display:inline-block;margin-top:16px;color:#6b7280;font-size:.8rem;text-decoration:none;}
            #salonAuthGate .sag-home:hover{color:#fbbf24;}
            #salonAuthGate .sag-note{margin-top:14px;color:#4b5563;font-size:.68rem;letter-spacing:.5px;}
            @keyframes sagShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}
            #salonAuthGate .sag-shake{animation:sagShake .4s ease;}
        `;

        document.head.appendChild(style);
        document.body.appendChild(gate);
        this._gateEl = gate;

        const input = gate.querySelector('#sagPin');
        const error = gate.querySelector('#sagError');
        const btn = gate.querySelector('#sagUnlock');
        const card = gate.querySelector('#sagCard');

        const attempt = () => {
            if (Date.now() < this._cooldownUntil) {
                const secs = Math.ceil((this._cooldownUntil - Date.now()) / 1000);
                error.textContent = `Too many tries — wait ${secs}s`;
                return;
            }
            const result = this.login(input.value);
            if (result.success && this.hasAccess(roles)) {
                this._failCount = 0;
                this._audit('staff_login', `${result.name} (${result.role}) unlocked the ${pageName} page.`);
                // Pass full opts so onUnlock / chip settings survive PIN unlock
                this._unlock(roles, opts);
            } else if (result.success) {
                // Valid PIN, wrong role (e.g. a nail tech on Scheduler)
                this._failCount++;
                this._audit('access_denied', `${result.name} (${result.role}) tried to open the restricted ${pageName} page.`);
                if (opts.deniedRedirect) {
                    // Keep session so My Schedule / Staff portal can load as them
                    try {
                        location.replace(opts.deniedRedirect);
                        return;
                    } catch (e) {
                        location.href = opts.deniedRedirect;
                        return;
                    }
                }
                this._clearSession();
                error.textContent = 'Your role does not have access to this page';
                input.value = '';
                card.classList.remove('sag-shake'); void card.offsetWidth;
                card.classList.add('sag-shake');
            } else {
                this._failCount++;
                error.textContent = result.message || 'Invalid PIN';
                input.value = '';
                card.classList.remove('sag-shake'); void card.offsetWidth;
                card.classList.add('sag-shake');
                if (this._failCount >= 5) {
                    this._failCount = 0;
                    this._cooldownUntil = Date.now() + 30000;
                    error.textContent = 'Too many tries — wait 30s';
                }
            }
            input.focus();
        };

        btn.addEventListener('click', attempt);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
        setTimeout(() => input.focus(), 60);
    },

    // ===================== USER CHIP =====================

    // Badge: who is logged in + logout. Sits top-right, to the right of Live sync.
    // This is the single logout control for staff pages (header Logout is hidden).
    _showChip(roles) {
        const user = this.current();
        if (!user || this._chipEl) return;
        const opts = this._guardOpts || {};

        const chip = document.createElement('div');
        chip.id = 'salonAuthChip';
        chip.innerHTML = `
            <span class="sac-avatar">${(user.name || '?').trim().charAt(0).toUpperCase()}</span>
            <span class="sac-meta">
                <span class="sac-name">${user.name}</span>
                <span class="sac-role">${user.role}</span>
            </span>
            <button class="sac-logout" title="Log out of all staff pages">Log out</button>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #salonAuthChip{display:flex;align-items:center;gap:8px;z-index:99990;
                background:#141414;border:1px solid rgba(251,191,36,.5);border-radius:40px;padding:5px 12px 5px 5px;
                font-family:'Inter',-apple-system,'Segoe UI',sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);}
            /* Fallback if nav host is missing: top-right */
            #salonAuthChip:not(.sac-in-nav){position:fixed;right:14px;top:8px;}
            #salonAuthChip .sac-avatar{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);
                color:#000;font-weight:800;font-size:.8rem;display:flex;align-items:center;justify-content:center;}
            #salonAuthChip .sac-meta{display:flex;flex-direction:column;line-height:1.15;}
            #salonAuthChip .sac-name{color:#fff;font-size:.72rem;font-weight:700;}
            #salonAuthChip .sac-role{color:#fbbf24;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;}
            #salonAuthChip .sac-logout{background:transparent;border:1px solid #444;color:#9ca3af;font-size:.65rem;
                font-weight:700;padding:5px 10px;border-radius:20px;cursor:pointer;transition:all .2s;}
            #salonAuthChip .sac-logout:hover{border-color:#f87171;color:#f87171;}
        `;

        document.head.appendChild(style);
        const host = document.getElementById('salonAuthChipHost');
        if (host) {
            chip.classList.add('sac-in-nav');
            host.appendChild(chip);
        } else {
            document.body.appendChild(chip);
        }
        this._chipEl = chip;

        chip.querySelector('.sac-logout').addEventListener('click', () => {
            this.logout();
            this._relock(roles, opts);
        });
    }
};

// Make available globally
window.SalonAuth = SalonAuth;
window.SALON_SESSION_KEY = SALON_SESSION_KEY;
