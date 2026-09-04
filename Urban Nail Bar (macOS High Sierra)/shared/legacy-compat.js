/**
 * Urban Nail Bar — tiny runtime shims for macOS Sierra / Safari 10–12.
 * Load FIRST on public + home pages. Cannot polyfill parse-time syntax
 * (optional chaining / nullish coalescing) — those are rewritten in source.
 */
(function (w) {
    'use strict';

    // NodeList.forEach — Safari 10+ has it; keep for older WebKit builds
    if (w.NodeList && w.NodeList.prototype && !w.NodeList.prototype.forEach) {
        w.NodeList.prototype.forEach = Array.prototype.forEach;
    }

    // Element.closest — Safari 9+; shim for edge WebKit
    if (w.Element && w.Element.prototype && !w.Element.prototype.closest) {
        w.Element.prototype.closest = function (sel) {
            var el = this;
            while (el && el.nodeType === 1) {
                if (el.matches && el.matches(sel)) return el;
                if (el.msMatchesSelector && el.msMatchesSelector(sel)) return el;
                if (el.webkitMatchesSelector && el.webkitMatchesSelector(sel)) return el;
                el = el.parentElement || el.parentNode;
            }
            return null;
        };
    }

    // Object.assign — Safari 9+
    if (typeof Object.assign !== 'function') {
        Object.assign = function (target) {
            if (target == null) throw new TypeError('Cannot convert undefined or null to object');
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var src = arguments[i];
                if (src == null) continue;
                for (var key in src) {
                    if (Object.prototype.hasOwnProperty.call(src, key)) to[key] = src[key];
                }
            }
            return to;
        };
    }

    // String.padStart — Safari 10+
    if (!String.prototype.padStart) {
        String.prototype.padStart = function (targetLength, padString) {
            var str = String(this);
            targetLength = targetLength >> 0;
            padString = String(padString !== undefined ? padString : ' ');
            if (str.length >= targetLength) return str;
            targetLength = targetLength - str.length;
            if (targetLength > padString.length) {
                padString += padString.repeat
                    ? padString.repeat(targetLength / padString.length)
                    : Array(Math.ceil(targetLength / padString.length) + 1).join(padString);
            }
            return padString.slice(0, targetLength) + str;
        };
    }
    if (typeof w.__salonNullish !== 'function') {
        w.__salonNullish = function (a, b) { return a != null ? a : b; };
    }
})(typeof window !== 'undefined' ? window : this);
