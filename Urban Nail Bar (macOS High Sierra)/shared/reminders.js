/**
 * Client appointment reminder runner (3-day / 24h / 2h confirm).
 * Runs in the scheduler (and any page that includes it) while staff is online.
 */
(function (global) {
    const ReminderEngine = {
        _timer: null,
        publicBaseUrl: '',

        start(opts) {
            if (opts && opts.publicBaseUrl) this.publicBaseUrl = opts.publicBaseUrl;
            this.tick();
            if (this._timer) clearInterval(this._timer);
            this._timer = setInterval(() => this.tick(), 60 * 1000);
        },

        tick() {
            if (typeof DataManager === 'undefined' || !DataManager.processAppointmentReminders) return;
            try {
                const result = DataManager.processAppointmentReminders({
                    publicBaseUrl: this.publicBaseUrl || this.detectPublicBase()
                });
                if (result && result.sent > 0 && typeof global.showToast === 'function') {
                    global.showToast(result.sent + ' client reminder(s) queued');
                }
                if (typeof global.renderHeaderNotifications === 'function') {
                    try { global.renderHeaderNotifications(); } catch (e) {}
                }
                if (typeof global.renderReminderOutbox === 'function') {
                    try { global.renderReminderOutbox(); } catch (e) {}
                }
            } catch (e) {
                console.warn('ReminderEngine:', e);
            }
        },

        detectPublicBase() {
            try {
                const host = (location.hostname || '').toLowerCase();
                if (!host || host === 'localhost' || host === '127.0.0.1') {
                    return location.protocol + '//' + host + ':3002';
                }
                // Permanent domain / temp tunnels: confirm + booking share same host
                // (Caddy path routing sends /confirm.html and /booking.html to port 3002)
                if (host === 'urban-nail-bar.work.gd' || host.endsWith('.work.gd')
                    || host.includes('pinggy') || host.includes('loca.lt')
                    || host.endsWith('.ts.net')) {
                    return location.origin;
                }
                // LAN staff origin on :3001 → public booking on :3002
                return location.origin.replace(':3001', ':3002');
            } catch (e) {
                return '';
            }
        },

        /** Build sms: link for the device Messages app (works without Twilio). */
        smsLink(phone, body) {
            const p = String(phone || '').replace(/[^\d+]/g, '');
            return 'sms:' + encodeURIComponent(p) + '?&body=' + encodeURIComponent(body || '');
        },

        getQueued() {
            if (typeof DataManager === 'undefined') return [];
            return (DataManager.data.reminderOutbox || []).filter(r => r.status === 'queued');
        },

        markSent(id) {
            if (typeof DataManager === 'undefined') return;
            const item = (DataManager.data.reminderOutbox || []).find(r => r.id === id);
            if (!item) return;
            item.status = 'sent';
            item.sentAt = new Date().toISOString();
            DataManager.saveData();
        }
    };

    global.ReminderEngine = ReminderEngine;
})(typeof window !== 'undefined' ? window : globalThis);
