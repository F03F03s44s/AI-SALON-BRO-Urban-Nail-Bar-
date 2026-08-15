/**
 * Live sync — keep every open page / OS package paired every 30 seconds.
 * Pulls from server hub, reloads sibling-tab changes, then notifies UIs.
 */
(function (global) {
    'use strict';

    var INTERVAL_MS = 30000;
    var timer = null;
    var ticking = false;

    function dm() {
        return global.DataManager || null;
    }

    function ensureSettings(manager) {
        if (!manager.settings) manager.settings = {};
        manager.settings.autoSync = true;
        manager.settings.syncInterval = INTERVAL_MS;
    }

    function emitLiveSync() {
        try {
            global.dispatchEvent(new CustomEvent('unb:live-sync', {
                detail: { at: Date.now(), intervalMs: INTERVAL_MS }
            }));
        } catch (eEvt) { /* ignore */ }
    }

    function tick() {
        if (ticking) return;
        try {
            if (typeof document !== 'undefined' && document.body && document.body.classList.contains('is-appt-dragging')) return;
        } catch (eDrag) { /* ignore */ }
        var manager = dm();
        if (!manager) return;
        ticking = true;
        ensureSettings(manager);

        var done = function () {
            ticking = false;
            emitLiveSync();
        };

        try {
            var p;
            if (typeof manager.checkForUpdates === 'function') {
                p = Promise.resolve(manager.checkForUpdates());
            } else if (typeof manager.pullFromServer === 'function') {
                p = Promise.resolve(manager.pullFromServer());
            } else {
                p = Promise.resolve();
            }
            p.then(done).catch(function (err) {
                console.warn('[live-sync] tick failed:', err);
                done();
            });
        } catch (eTick) {
            console.warn('[live-sync] tick failed:', eTick);
            ticking = false;
        }
    }

    function start() {
        var manager = dm();
        if (!manager) return false;
        ensureSettings(manager);
        try {
            if (typeof manager.startSync === 'function') manager.startSync();
            if (typeof manager.watchStorage === 'function') manager.watchStorage();
        } catch (eStart) { /* ignore */ }
        if (timer) clearInterval(timer);
        timer = setInterval(tick, INTERVAL_MS);
        global._unbLiveSyncTimer = timer;
        // First pull after the calendar paints (avoid fighting first render)
        setTimeout(tick, 4000);
        return true;
    }

    function boot() {
        if (start()) return;
        var tries = 0;
        var wait = setInterval(function () {
            tries += 1;
            if (start() || tries > 40) clearInterval(wait);
        }, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    global.UnbLiveSync = { start: start, tick: tick, intervalMs: INTERVAL_MS };
})(typeof window !== 'undefined' ? window : this);
