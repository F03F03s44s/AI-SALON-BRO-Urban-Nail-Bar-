/**
 * Shared appointment + staff live status — used across Scheduler / Manager / Admin / Staff.
 *
 * Appointment statuses:
 *   booked         → blue · Booked
 *   notcheckedin   → red   · Not Checked In (at appointment time)
 *   late           → red   · Late (+15 min past start)
 *   checkedin      → green · Checked-In
 *   underway       → blue  · In-Service
 *   checkout       → gold · Checkout
 *   processing     → Open · black + gold + green border
 *   complete       → Closed · black + gold + red border
 *   noshow         → red   · No Show (+30 min past start)
 *
 * Staff live (from appointments):
 *   Busy      → red    · currently working with a client
 *   Booked    → blue   · has an open appointment
 *   Available → green  · no open appointments
 */
(function (global) {
    'use strict';

    var COLORS = {
        booked: '#2563eb',
        notcheckedin: '#dc2626',
        late: '#ef4444',
        checkedin: '#4ade80',
        underway: '#60a5fa',
        checkout: '#ffe566',
        processing: '#ffe566',
        complete: '#ffe566',
        cancelled: '#dc2626',
        noshow: '#dc2626',
        blocked: '#a1a1aa',
        pending: '#f87171'
    };

    var FILL = {
        booked: '#2563eb',
        notcheckedin: '#dc2626',
        late: '#dc2626',
        checkedin: '#16a34a',
        underway: '#2563eb',
        checkout: '#ffe566',
        processing: '#000000',
        complete: '#000000',
        cancelled: '#991b1b',
        noshow: '#991b1b',
        blocked: '#52525b',
        pending: '#dc2626'
    };

    var BLOCK_LABELS = {
        booked: 'Booked',
        notcheckedin: 'Not Checked-In',
        late: 'Late',
        checkedin: 'Checked-In',
        underway: 'In-Service',
        checkout: 'Checkout',
        processing: 'Open',
        complete: 'Closed',
        noshow: 'No Show',
        blocked: 'Blocked',
        cancelled: 'Cancelled',
        pending: 'Awaiting Approval'
    };

    var STAFF_LIVE = {
        available: { key: 'available', label: 'Available', color: '#22c55e' },
        booked: { key: 'booked', label: 'Booked', color: '#3b82f6' },
        busy: { key: 'busy', label: 'Busy', color: '#ef4444' },
        break: { key: 'break', label: 'Break', color: '#f97316' },
        off: { key: 'off', label: 'Off', color: '#fca5a5' }
    };

    function pad2(n) { return String(n).padStart(2, '0'); }

    function localDateStr(d) {
        var dt = d instanceof Date ? d : new Date(d || Date.now());
        if (isNaN(dt.getTime())) dt = new Date();
        return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
    }

    function timeToMinutes(t) {
        if (t == null || t === '') return 0;
        if (typeof t === 'number') return t;
        var parts = String(t).split(':');
        return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }

    function normalizeId(id) {
        if (id == null || id === '') return null;
        var n = Number(id);
        return isNaN(n) ? String(id) : n;
    }

    function sameId(a, b) {
        if (a == null || b == null) return false;
        return String(a) === String(b);
    }

    function normalize(st) {
        var s = String(st == null ? 'booked' : st).toLowerCase().trim();
        if (s === 'confirmed' || s === 'next' || s === 'default' || s === 'scheduled' || s === '') return 'booked';
        if (s === 'not-checked-in' || s === 'not_checked_in' || s === 'not checked in') return 'notcheckedin';
        if (s === 'queued') return 'checkedin';
        if (s === 'waiting' || s === 'in-progress' || s === 'inprogress' || s === 'in-service' || s === 'inservice' || s === 'in_service') return 'underway';
        if (s === 'ready') return 'checkout';
        if (s === 'completed' || s === 'finalize') return 'complete';
        if (s === 'no-show' || s === 'no_show') return 'noshow';
        if (Object.prototype.hasOwnProperty.call(COLORS, s)) return s;
        return s;
    }

    function label(st) {
        var key = normalize(st);
        if (key === 'pending') return BLOCK_LABELS.pending;
        return BLOCK_LABELS[key] || String(st || '').toUpperCase();
    }

    function color(st) {
        var key = normalize(st);
        return COLORS[key] || '#9ca3af';
    }

    function fill(st) {
        var key = normalize(st);
        return FILL[key] || '#4b5563';
    }

    function badgeStyle(st) {
        var key = normalize(st);
        var c = color(key);
        if (key === 'complete') {
            return 'background:#000;color:#ffe566;border:1px solid #dc2626;';
        }
        if (key === 'processing') {
            return 'background:#000;color:#ffe566;border:1px solid #16a34a;';
        }
        return 'background:' + c + '22;color:' + c + ';border:1px solid ' + c + '66;';
    }

    function badgeClass(st) {
        return 'badge badge-appt badge-appt-' + normalize(st);
    }

    function badgeHtml(st) {
        return '<span class="' + badgeClass(st) + '">' + label(st) + '</span>';
    }

    function colorMap() {
        var map = {};
        Object.keys(COLORS).forEach(function (k) { map[k] = COLORS[k]; });
        map.confirmed = COLORS.booked;
        map.queued = COLORS.checkedin;
        map.waiting = COLORS.underway;
        map['in-progress'] = COLORS.underway;
        map.ready = COLORS.checkout;
        map.completed = COLORS.complete;
        return map;
    }

    function isWalkIn(a) {
        if (!a) return false;
        if (a.isWalkIn === true) return true;
        var src = String(a.source || a.type || '').toLowerCase();
        return src === 'walkin' || src === 'walk-in' || src === 'walk_in';
    }

    function typeBadgeHtml(a) {
        if (isWalkIn(a)) {
            return '<span class="badge" style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#000;border:1px solid #d97706;font-weight:800;">Walk-in</span>';
        }
        return '<span class="badge" style="background:#000;color:#fbbf24;border:1px solid #fbbf24;font-weight:800;">Appt</span>';
    }

    function isClosedAppt(a) {
        var st = normalize((a && a.status) || '');
        return st === 'complete' || st === 'noshow' || st === 'cancelled' || st === 'blocked';
    }

    function isWorkingStatus(a) {
        var st = normalize((a && a.status) || '');
        return st === 'checkedin' || st === 'underway' || st === 'checkout'
            || st === 'processing' || !!(a && a.checkedIn);
    }

    function staffOwnsAppt(a, staffId) {
        if (!a || staffId == null) return false;
        if (sameId(a.staffId, staffId)) return true;
        if (Array.isArray(a.staffIds)) {
            for (var i = 0; i < a.staffIds.length; i++) {
                if (sameId(a.staffIds[i], staffId)) return true;
            }
        }
        return false;
    }

    /**
     * Staff live status from appointments.
     * options: { appointments, date, now, offInfo: { off, label } }
     */
    function getStaffLiveStatus(staff, options) {
        options = options || {};
        if (!staff) return Object.assign({}, STAFF_LIVE.available);

        var offInfo = options.offInfo;
        if (offInfo && offInfo.off) {
            return { key: 'off', label: offInfo.label || 'OFF', color: STAFF_LIVE.off.color };
        }
        if (staff.status === 'break') return Object.assign({}, STAFF_LIVE.break);
        if (staff.status === 'off') return Object.assign({}, STAFF_LIVE.off);

        var day = options.date || localDateStr(new Date());
        var today = localDateStr(options.now || new Date());
        var appointments = options.appointments || [];
        var sid = staff.id;

        var dayAppts = appointments.filter(function (a) {
            return a && a.date === day && staffOwnsAppt(a, sid) && !isClosedAppt(a);
        });

        if (day === today) {
            var now = options.now instanceof Date ? options.now : new Date();
            var nowMin = now.getHours() * 60 + now.getMinutes();
            var workingNow = dayAppts.some(function (a) {
                if (!isWorkingStatus(a) || !a.time) return false;
                var start = timeToMinutes(a.time);
                var end = start + (Number(a.duration) || 30);
                return nowMin >= start && nowMin < end;
            });
            if (workingNow) return Object.assign({}, STAFF_LIVE.busy);
        }

        if (dayAppts.length > 0) return Object.assign({}, STAFF_LIVE.booked);
        return Object.assign({}, STAFF_LIVE.available);
    }

    function staffLiveBadgeStyle(live) {
        var c = (live && live.color) || STAFF_LIVE.available.color;
        if (live && live.key === 'available') {
            return 'background:#22c55e;color:#fff;border:1px solid #16a34a;';
        }
        if (live && live.key === 'busy') {
            return 'background:rgba(239,68,68,0.2);color:#ef4444;border:1px solid #ef4444;';
        }
        if (live && live.key === 'booked') {
            return 'background:rgba(59,130,246,0.2);color:#3b82f6;border:1px solid #3b82f6;';
        }
        return 'background:' + c + '22;color:' + c + ';border:1px solid ' + c + '66;';
    }

    function staffLiveBadgeHtml(live) {
        var L = live || STAFF_LIVE.available;
        return '<span class="badge" style="' + staffLiveBadgeStyle(L) + '">' + (L.label || 'Available') + '</span>';
    }

    var api = {
        COLORS: COLORS,
        FILL: FILL,
        BLOCK_LABELS: BLOCK_LABELS,
        STAFF_LIVE: STAFF_LIVE,
        normalize: normalize,
        normalizeApptStatus: normalize,
        label: label,
        apptBlockLabel: label,
        apptStatusLabel: label,
        color: color,
        fill: fill,
        badgeStyle: badgeStyle,
        badgeClass: badgeClass,
        badgeHtml: badgeHtml,
        colorMap: colorMap,
        isWalkIn: isWalkIn,
        typeBadgeHtml: typeBadgeHtml,
        isClosedAppt: isClosedAppt,
        isWorkingStatus: isWorkingStatus,
        staffOwnsAppt: staffOwnsAppt,
        getStaffLiveStatus: getStaffLiveStatus,
        staffLiveBadgeStyle: staffLiveBadgeStyle,
        staffLiveBadgeHtml: staffLiveBadgeHtml,
        localDateStr: localDateStr,
        timeToMinutes: timeToMinutes
    };

    global.ApptStatus = api;

    if (typeof global.normalizeApptStatus !== 'function') {
        global.normalizeApptStatus = normalize;
    }
    if (typeof global.apptBlockLabel !== 'function') {
        global.apptBlockLabel = label;
    }
    if (typeof global.apptStatusLabel !== 'function') {
        global.apptStatusLabel = label;
    }
    if (typeof global.getStaffLiveStatus !== 'function') {
        global.getStaffLiveStatus = function (staff, opts) {
            return getStaffLiveStatus(staff, opts);
        };
    }
})(typeof window !== 'undefined' ? window : globalThis);
