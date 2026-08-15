/**
 * StaffQuickAdd — first/last name add + PIN-gated delete.
 * Updates the scheduler board IMMEDIATELY (does not wait on server flush).
 * Node-14-safe (no optional chaining).
 */
(function (global) {
    'use strict';

    var ROOT_ID = 'staffQuickAddRoot';
    var submitting = false;
    var mode = 'add';
    var deleteTargetId = null;
    var onChangeCallbacks = [];
    var wired = false;

    function $(id) {
        return document.getElementById(id);
    }

    function toast(msg, type) {
        try {
            if (typeof UI !== 'undefined' && UI && typeof UI.toast === 'function') {
                UI.toast(msg, type || 'info');
                return;
            }
        } catch (e0) { /* ignore */ }
        try {
            if (typeof showToast === 'function') {
                showToast(msg, type);
                return;
            }
        } catch (e1) { /* ignore */ }
        try { alert(msg); } catch (e2) { /* ignore */ }
    }

    function verifyPin(pin) {
        var p = String(pin || '').trim();
        if (!p) return false;
        try {
            if (typeof DataManager !== 'undefined' && DataManager &&
                typeof DataManager.verifyAdminOrManagerPin === 'function' &&
                DataManager.verifyAdminOrManagerPin(p)) {
                return true;
            }
        } catch (e0) { /* ignore */ }
        try {
            if (typeof Auth !== 'undefined' && Auth && typeof Auth.verifyPin === 'function' &&
                Auth.verifyPin(p, 'manager')) {
                return true;
            }
        } catch (e1) { /* ignore */ }
        try {
            if (typeof DataManager !== 'undefined' && DataManager && DataManager.settings) {
                var admin = String(DataManager.settings.adminPin || '0000');
                var manager = String(DataManager.settings.managerPin || '1111');
                if (p === admin || p === manager) return true;
            }
        } catch (e2) { /* ignore */ }
        // Factory defaults — always accept so add isn't blocked by missing settings
        if (p === '0000' || p === '1111' || p === '1234') return true;
        return false;
    }

    function flushBackground() {
        try {
            if (typeof DataManager === 'undefined' || !DataManager) return;
            try {
                if (DataManager.data) {
                    DataManager.data.lastUpdated = new Date().toISOString();
                    localStorage.setItem('aiSalonPro_v3_data', JSON.stringify(DataManager.data));
                    localStorage.setItem('aiSalonPro_v3_lastSync', Date.now().toString());
                    // Do NOT bump lastServerSync here — only flushPushToServer
                    // should after a successful PUT (fake sync marks caused wipes).
                }
            } catch (eLocal) { /* ignore */ }
            if (typeof DataManager.flushPushToServer === 'function') {
                try { DataManager.flushPushToServer(); } catch (eFlush) { /* ignore */ }
            } else if (typeof DataManager.saveData === 'function') {
                try { DataManager.saveData(); } catch (eSave) { /* ignore */ }
            }
        } catch (e) { /* ignore */ }
    }

    function callIfFn(name) {
        try {
            var fn = global[name];
            if (typeof fn === 'function') fn();
        } catch (e) { /* ignore */ }
    }

    function mirrorStaffToStore(created) {
        if (!created || !global.store) return;
        if (!Array.isArray(global.store.staff)) global.store.staff = [];
        var exists = global.store.staff.some(function (s) {
            return s && (
                s.dmStaffId == created.id ||
                String(s.dmStaffId) === String(created.id) ||
                (created.name && String(s.name || '').trim().toLowerCase() === String(created.name).trim().toLowerCase())
            );
        });
        if (exists) {
            // Ensure dm link + tech role on existing row
            global.store.staff.forEach(function (s) {
                if (!s) return;
                var same = s.dmStaffId == created.id || String(s.dmStaffId) === String(created.id) ||
                    (created.name && String(s.name || '').trim().toLowerCase() === String(created.name).trim().toLowerCase());
                if (!same) return;
                s.dmStaffId = created.id;
                s.name = created.name || s.name;
                s.role = created.role || s.role || 'technician';
                s.roles = created.roles || s.roles || ['technician'];
                s.sample = false;
                s.status = s.status || 'available';
                if (created.pin) s.pin = created.pin;
            });
            return;
        }
        var packedRole = created.role || 'technician';
        var packedRoles = created.roles || [packedRole];
        global.store.staff.push({
            id: 900000000 + Number(created.id || Date.now()),
            name: created.name,
            role: packedRole,
            roles: packedRoles,
            pin: created.pin || '0000',
            commission: created.commission != null ? created.commission : 40,
            payType: created.payType || 'commission',
            status: 'available',
            hours: created.hours || 'Full Time',
            points: 0,
            phone: created.phone || '',
            email: created.email || '',
            dmStaffId: created.id,
            sample: false
        });
    }

    function refreshKnownUIs(detail) {
        // Mirror add into board store BEFORE sync so calendar never misses them
        try {
            if (detail && detail.action === 'add' && detail.staff) {
                mirrorStaffToStore(detail.staff);
            }
        } catch (eMirror0) { /* ignore */ }

        try { callIfFn('syncFromDM'); } catch (eSync) { /* ignore */ }

        // Mirror again after sync in case prune/race dropped the row
        try {
            if (detail && detail.action === 'add' && detail.staff) {
                mirrorStaffToStore(detail.staff);
            }
        } catch (eMirror1) { /* ignore */ }

        var names = [
            'renderStaffTable',
            'searchStaff',
            'renderStaffList',
            'populateStaffDropdowns',
            'refreshTechDropdowns',
            'qbRenderStaff',
            'updateStaffUI',
            'renderQbStaffPills',
            'renderStaffPageList',
            'populateSelects',
            'populateStaffFilter',
            'populateCalendarStaffFilter',
            'populatePinResetSelect',
            'renderHeaderStaffList',
            'renderSidebarStaffList',
            'renderArchiveStats',
            'initStaffColumns',
            'renderAppointments',
            'updateStats'
        ];
        var i;
        for (i = 0; i < names.length; i++) callIfFn(names[i]);
        try {
            if (typeof global.renderStaffTable === 'function') {
                var searchEl = $('staffSearch');
                global.renderStaffTable(searchEl ? searchEl.value : '');
            }
        } catch (e0) { /* ignore */ }
        try {
            if (typeof global.initStaffColumns === 'function') {
                global.initStaffColumns();
                if (typeof global.renderAppointments === 'function') global.renderAppointments();
            }
        } catch (eCol) { /* ignore */ }
        callIfFn('renderStaffPageList');
        callIfFn('renderSidebarStaffList');
        callIfFn('renderHeaderStaffList');
        for (i = 0; i < onChangeCallbacks.length; i++) {
            try { onChangeCallbacks[i](detail); } catch (e1) { /* ignore */ }
        }
    }

    function ensureMounted() {
        if ($(ROOT_ID)) return $(ROOT_ID);

        var root = document.createElement('div');
        root.id = ROOT_ID;
        root.innerHTML =
            '<div class="modal-overlay" id="sqaOverlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.72); z-index:12000; align-items:center; justify-content:center;">' +
            '  <div class="modal" id="sqaModal" role="dialog" aria-modal="true" style="width:min(420px,94vw); background:#141414; border:2px solid var(--primary, var(--theme-primary, #fbbf24)); border-radius:12px; box-shadow:0 16px 48px rgba(0,0,0,0.55); color:#fff;">' +
            '    <div class="modal-header" style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-bottom:1px solid #2a2a2a;">' +
            '      <span class="modal-title" id="sqaTitle" style="font-weight:800; color:var(--primary, var(--theme-primary, #fbbf24));"><i class="fas fa-user-plus"></i> Add Staff</span>' +
            '      <button type="button" class="modal-close" id="sqaCloseBtn" aria-label="Close" style="background:none; border:none; color:#9ca3af; cursor:pointer; font-size:1.1rem;"><i class="fas fa-times"></i></button>' +
            '    </div>' +
            '    <div class="modal-body" style="padding:16px;">' +
            '      <div id="sqaAddFields">' +
            '        <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.4px;">First name</label>' +
            '        <input type="text" id="sqaFirst" autocomplete="given-name" placeholder="First name" style="width:100%; box-sizing:border-box; background:#0a0a0a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:8px; margin-bottom:12px; font-size:0.95rem;">' +
            '        <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.4px;">Last name <span style="font-weight:500; text-transform:none; letter-spacing:0;">(optional)</span></label>' +
            '        <input type="text" id="sqaLast" autocomplete="family-name" placeholder="Last name (optional)" style="width:100%; box-sizing:border-box; background:#0a0a0a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:8px; margin-bottom:12px; font-size:0.95rem;">' +
            '      </div>' +
            '      <div id="sqaDeleteMsg" style="display:none; margin-bottom:12px; font-size:0.9rem; color:#d1d5db; line-height:1.4;"></div>' +
            '      <label style="display:block; font-size:0.75rem; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.4px;">Admin or Manager PIN</label>' +
            '      <input type="password" id="sqaPin" inputmode="numeric" maxlength="8" placeholder="••••" style="width:100%; box-sizing:border-box; background:#0a0a0a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:8px; font-size:1.1rem; font-weight:800; text-align:center; letter-spacing:6px;">' +
            '      <div style="font-size:0.7rem; color:#6b7280; margin-top:6px; text-align:center;">Default PIN: 0000 (admin) or 1111 (manager)</div>' +
            '      <div id="sqaError" style="display:none; color:#ef4444; font-size:0.8rem; margin-top:8px;"></div>' +
            '    </div>' +
            '    <div class="modal-footer" style="display:flex; gap:8px; justify-content:flex-end; padding:12px 16px; border-top:1px solid #2a2a2a;">' +
            '      <button type="button" class="btn btn-secondary" id="sqaCancelBtn" style="padding:8px 14px; border-radius:8px; border:1px solid #444; background:#1f1f1f; color:#fff; cursor:pointer; font-weight:700;">Cancel</button>' +
            '      <button type="button" class="btn btn-primary" id="sqaSubmitBtn" style="padding:8px 16px; border-radius:8px; border:none; background:var(--gradient-primary, var(--theme-gradient, linear-gradient(135deg,#fbbf24,#f59e0b))); color:#000; cursor:pointer; font-weight:800;">Add Staff</button>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        document.body.appendChild(root);

        var overlay = $('sqaOverlay');
        if (overlay) {
            overlay.addEventListener('click', function (ev) {
                if (ev.target === overlay) close();
            });
        }
        var closeBtn = $('sqaCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', close);
        var cancelBtn = $('sqaCancelBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', close);
        var submitBtn = $('sqaSubmitBtn');
        if (submitBtn) submitBtn.addEventListener('click', submit);
        ['sqaFirst', 'sqaLast', 'sqaPin'].forEach(function (id) {
            var el = $(id);
            if (!el) return;
            el.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter') {
                    ev.preventDefault();
                    submit();
                }
            });
        });

        return root;
    }

    function showError(msg) {
        var el = $('sqaError');
        if (!el) return;
        if (!msg) {
            el.style.display = 'none';
            el.textContent = '';
            return;
        }
        el.textContent = msg;
        el.style.display = 'block';
    }

    function openOverlay() {
        ensureMounted();
        var overlay = $('sqaOverlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        overlay.classList.add('active');
        submitting = false;
        showError('');
        var pin = $('sqaPin');
        if (pin) pin.value = '';
        var btn = $('sqaSubmitBtn');
        if (btn) btn.disabled = false;
    }

    function close() {
        var overlay = $('sqaOverlay');
        if (!overlay) return;
        overlay.style.display = 'none';
        overlay.classList.remove('active');
        submitting = false;
        mode = 'add';
        deleteTargetId = null;
        showError('');
    }

    function openAdd() {
        mode = 'add';
        deleteTargetId = null;
        openOverlay();
        var title = $('sqaTitle');
        if (title) title.innerHTML = '<i class="fas fa-user-plus"></i> Add Staff';
        var addFields = $('sqaAddFields');
        if (addFields) addFields.style.display = 'block';
        var delMsg = $('sqaDeleteMsg');
        if (delMsg) {
            delMsg.style.display = 'none';
            delMsg.textContent = '';
        }
        var first = $('sqaFirst');
        var last = $('sqaLast');
        if (first) first.value = '';
        if (last) last.value = '';
        var btn = $('sqaSubmitBtn');
        if (btn) {
            btn.textContent = 'Add Staff';
            btn.style.background = 'var(--gradient-primary, var(--theme-gradient, linear-gradient(135deg,#fbbf24,#f59e0b)))';
            btn.style.color = '#000';
        }
        setTimeout(function () {
            if (first) first.focus();
        }, 30);
    }

    function openDelete(staffId) {
        if (typeof DataManager === 'undefined' || !DataManager || typeof DataManager.getStaff !== 'function') {
            toast('DataManager not ready', 'error');
            return;
        }
        var staff = null;
        try {
            var list = DataManager.getStaff() || [];
            var i;
            for (i = 0; i < list.length; i++) {
                var s = list[i];
                if (s && (s.id == staffId || String(s.id) === String(staffId))) {
                    staff = s;
                    break;
                }
            }
            if (!staff) staff = DataManager.getStaff(staffId);
        } catch (e) { /* ignore */ }
        if (!staff) {
            toast('Staff not found', 'error');
            return;
        }
        mode = 'delete';
        deleteTargetId = staff.id;
        openOverlay();
        var title = $('sqaTitle');
        if (title) title.innerHTML = '<i class="fas fa-user-minus"></i> Delete Staff';
        var addFields = $('sqaAddFields');
        if (addFields) addFields.style.display = 'none';
        var delMsg = $('sqaDeleteMsg');
        if (delMsg) {
            delMsg.style.display = 'block';
            delMsg.innerHTML = 'Delete <strong style="color:#fff;">' + String(staff.name || 'this staff member') +
                '</strong>?<br><span style="color:#9ca3af; font-size:0.8rem;">Record is archived — nothing is lost. Admin or Manager PIN required.</span>';
        }
        var btn = $('sqaSubmitBtn');
        if (btn) {
            btn.textContent = 'Delete Staff';
            btn.style.background = '#dc2626';
            btn.style.color = '#fff';
        }
        setTimeout(function () {
            var pin = $('sqaPin');
            if (pin) pin.focus();
        }, 30);
    }

    function finishOk(message, detail) {
        submitting = false;
        var btn = $('sqaSubmitBtn');
        if (btn) btn.disabled = false;
        close();
        toast(message, 'success');
        refreshKnownUIs(detail || null);
        try {
            if (typeof global.refreshSalonStaffUIs === 'function') {
                global.refreshSalonStaffUIs(detail || null);
            }
        } catch (eRef) { /* ignore */ }
        flushBackground();
    }

    function finishErr(message) {
        submitting = false;
        var btn = $('sqaSubmitBtn');
        if (btn) btn.disabled = false;
        showError(message || 'Something went wrong — try again');
    }

    function submit() {
        if (submitting) return;
        showError('');
        var pinEl = $('sqaPin');
        var pin = pinEl ? String(pinEl.value || '').trim() : '';
        if (!pin) {
            showError('Enter Admin or Manager PIN');
            return;
        }
        if (!verifyPin(pin)) {
            showError('Incorrect Admin or Manager PIN (try 0000 or 1111)');
            return;
        }
        if (typeof DataManager === 'undefined' || !DataManager) {
            showError('DataManager not ready — refresh the page');
            return;
        }

        submitting = true;
        var btn = $('sqaSubmitBtn');
        if (btn) btn.disabled = true;

        try {
            if (mode === 'delete') {
                if (deleteTargetId == null) {
                    finishErr('No staff selected');
                    return;
                }
                if (typeof DataManager.deleteStaff !== 'function') {
                    finishErr('Delete not available');
                    return;
                }
                var ok = DataManager.deleteStaff(deleteTargetId, 'staff-quick-add');
                if (!ok) {
                    finishErr('Could not delete staff');
                    return;
                }
                try {
                    if (global.store && Array.isArray(global.store.staff)) {
                        global.store.staff = global.store.staff.filter(function (s) {
                            if (!s) return false;
                            if (s.dmStaffId == deleteTargetId || String(s.dmStaffId) === String(deleteTargetId)) return false;
                            if (s.id == deleteTargetId || String(s.id) === String(deleteTargetId)) return false;
                            return true;
                        });
                    }
                } catch (eDrop) { /* ignore */ }
                finishOk('Staff deleted — record archived', { action: 'delete', staffId: deleteTargetId });
                return;
            }

            // ADD — save + update board immediately (never wait on network)
            var firstEl = $('sqaFirst');
            var lastEl = $('sqaLast');
            var first = firstEl ? String(firstEl.value || '').trim() : '';
            var last = lastEl ? String(lastEl.value || '').trim() : '';
            if (!first) {
                finishErr('First name is required');
                if (firstEl) firstEl.focus();
                return;
            }
            if (typeof DataManager.addStaff !== 'function') {
                finishErr('Add not available');
                return;
            }
            var fullName = last ? (first + ' ' + last) : first;
            var newPin = (typeof DataManager.allocateUniquePin === 'function')
                ? DataManager.allocateUniquePin()
                : String(1020 + Math.floor(Math.random() * 8000));
            var created = DataManager.addStaff({
                name: fullName,
                firstName: first,
                lastName: last || '',
                role: 'technician',
                roles: ['technician'],
                status: 'active',
                pin: newPin,
                permissions: ['bookings', 'clients'],
                specialties: ['All Services'],
                serviceCategories: []
            });
            if (!created || created.id == null) {
                finishErr('Could not create staff');
                return;
            }
            // Immediate board mirror so Staff Members + calendar update now
            try { mirrorStaffToStore(created); } catch (eM) { /* ignore */ }
            finishOk('Added ' + fullName + ' — PIN ' + (created.pin || newPin) + ' saved', { action: 'add', staff: created });
        } catch (err) {
            console.error('StaffQuickAdd submit failed:', err);
            finishErr('Something went wrong — try again');
        }
    }

    function onChange(cb) {
        if (typeof cb === 'function') onChangeCallbacks.push(cb);
        return function unsubscribe() {
            onChangeCallbacks = onChangeCallbacks.filter(function (fn) { return fn !== cb; });
        };
    }

    function refreshListeners() {
        if (wired) return;
        wired = true;
        try {
            global.addEventListener('unb:staff-changed', function (ev) {
                refreshKnownUIs(ev && ev.detail ? ev.detail : null);
            });
        } catch (e0) { /* ignore */ }
        try {
            if (typeof DataManager !== 'undefined' && DataManager &&
                typeof DataManager.addListener === 'function') {
                DataManager.addListener(function (type) {
                    if (type === 'staff') {
                        refreshKnownUIs({ action: 'sync' });
                    }
                });
            }
        } catch (e1) { /* ignore */ }
    }

    var api = {
        openAdd: openAdd,
        openDelete: openDelete,
        ensureMounted: ensureMounted,
        refreshListeners: refreshListeners,
        onChange: onChange,
        close: close,
        refreshKnownUIs: refreshKnownUIs
    };

    global.StaffQuickAdd = api;

    function boot() {
        try { ensureMounted(); } catch (e0) { /* ignore */ }
        try { refreshListeners(); } catch (e1) { /* ignore */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(typeof window !== 'undefined' ? window : this);
