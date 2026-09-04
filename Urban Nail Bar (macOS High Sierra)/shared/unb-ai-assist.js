/**
 * UNB AI ASSISTANT — shared branding, salon knowledge, single Voice control (mic + TTS).
 * Used by website, booking, public-booking, scheduler, and staff AI widget.
 */
(function (global) {
    const BRAND = 'UNB AI ASSISTANT';
    const FAB_EMOJI = '\u2728';
    const BRAND_TITLE = FAB_EMOJI + ' ' + BRAND;

    const PAGE_PROFILES = {
        website: {
            welcomeHtml:
                'Hello! I\'m <strong>' + BRAND_TITLE + '</strong>. Ask about our salon, hours, services, policies, reviews, or how to book. Tap <strong>Voice</strong> to speak, or type.',
            contextExtra:
                'PAGE: Website (customers). Capabilities: answer about the salon, hours, address, phone, services/prices, policies, reviews, contact. ' +
                'When they want an appointment, guide them to Book Now (online booking). Do not claim to change bookings from this page.',
            placeholder: 'Ask about hours, services, booking…'
        },
        booking: {
            welcomeHtml:
                'Hi! I\'m <strong>' + BRAND_TITLE + '</strong>. I can help you pick a <strong>service</strong>, <strong>date</strong>, <strong>tech</strong>, or <strong>time</strong> on this booking form, plus salon Q&amp;A and discounts. Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Online booking form. Help the customer select service/date/technician/time and complete the form. ' +
                'Answer salon Q&A and discount questions. Never skip SMS consent or invent availability.',
            placeholder: 'Ask or say a service…'
        },
        'public-booking': {
            welcomeHtml:
                'Hi! I\'m <strong>' + BRAND_TITLE + '</strong>. Ask about the salon or say a service to select it on this public booking form. Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Public online booking. Help select service/date/time on this form. Answer salon hours, location, services, and discounts. Keep answers public-safe.',
            placeholder: 'Ask or say a service…'
        },
        scheduler: {
            welcomeHtml:
                'Hello! I\'m <strong>' + BRAND_TITLE + '</strong>. I can <strong>book</strong>, <strong>walk-in</strong>, <strong>cancel</strong>, <strong>reschedule</strong>, or <strong>rebook</strong> — confirm with yes/no. Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Receptionist Scheduler. Capabilities: book/walk-in/cancel/reschedule/move/rebook with yes/no confirmation; look up clients, staff, services, today\'s board.',
            placeholder: 'Book Jane with Maria at 2pm…'
        },
        staff: {
            welcomeHtml:
                'Hi! I\'m <strong>' + BRAND_TITLE + '</strong> for <strong>your</strong> staff dashboard — own schedule, clock, and your appointments. Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Staff (technician). Scope: THIS staff member\'s schedule, clock in/out, and their own appointments only. ' +
                'Do not manage other technicians\' books. For salon-wide booking, send them to Scheduler/Manager.',
            placeholder: 'Ask about my schedule…'
        },
        admin: {
            welcomeHtml:
                'I\'m <strong>' + BRAND_TITLE + '</strong> for Admin. Ask about salon ops, or <strong>book / cancel / reschedule / move</strong> (confirm yes/no). Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Admin. Capabilities: salon operations help plus book/cancel/reschedule/move with confirmation.',
            placeholder: 'Book Jane with Maria at 2pm…'
        },
        manager: {
            welcomeHtml:
                'I\'m <strong>' + BRAND_TITLE + '</strong> for Manager. Ask about ops, staff, or <strong>book / cancel / reschedule / move</strong> (confirm yes/no). Tap <strong>Voice</strong> or type.',
            contextExtra:
                'PAGE: Manager. Capabilities: salon ops help plus book/cancel/reschedule/move with confirmation.',
            placeholder: 'Book Jane with Maria at 2pm…'
        }
    };

    function detectPageKey() {
        const p = String((global.location && location.pathname) || '').toLowerCase();
        if (p.indexOf('public-booking') >= 0) return 'public-booking';
        if (p.indexOf('booking') >= 0) return 'booking';
        if (p.indexOf('website') >= 0) return 'website';
        if (p.indexOf('scheduler') >= 0) return 'scheduler';
        if (p.indexOf('admin') >= 0) return 'admin';
        if (p.indexOf('manager') >= 0) return 'manager';
        if (p.indexOf('staff') >= 0) return 'staff';
        return 'website';
    }

    function getPageProfile(pageKey) {
        const key = pageKey || detectPageKey();
        return PAGE_PROFILES[key] || PAGE_PROFILES.website;
    }

    function stripHtml(html) {
        const d = document.createElement('div');
        d.innerHTML = String(html || '');
        return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function formatTime12(t) {
        if (!t) return '';
        const m = String(t).match(/^(\d{1,2}):(\d{2})/);
        if (!m) return t;
        let h = parseInt(m[1], 10);
        const min = m[2];
        const ap = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + min + ' ' + ap;
    }

    /**
     * Public-safe salon facts for customer-facing AI (website / booking).
     */
    function buildSalonContext(extra) {
        const c = (global.SiteContent && SiteContent.get && SiteContent.get()) || {};
        const settings = (global.DataManager && DataManager.settings) || {};
        const name = settings.salonName || c.salonName || 'Urban Nail Bar';
        const phone = settings.salonPhone || c.sitePhone || c.salonPhone || '(480) 291-5440';
        const address = settings.salonAddress || c.salonAddress || '';
        const open = settings.openTime || c.openTime || '09:30';
        const close = settings.closeTime || c.closeTime || '18:30';
        const sunOpen = settings.sunOpenTime || c.sunOpenTime || '11:00';
        const sunClose = settings.sunCloseTime || c.sunCloseTime || '17:00';

        let services = '';
        try {
            const list = (global.DataManager && DataManager.getServices && DataManager.getServices()) || [];
            services = list.slice(0, 40).map(s => s.name + (s.price != null ? ' ($' + s.price + ')' : '')).join('; ');
        } catch (e) {}

        let discounts = '';
        try {
            const promos = (global.DataManager && DataManager.getDiscounts && DataManager.getDiscounts()) ||
                (settings.discounts) || [];
            if (Array.isArray(promos) && promos.length) {
                discounts = promos.slice(0, 8).map(function (d) {
                    return (d.name || d.code || 'Promo') +
                        (d.percent != null ? ' ' + d.percent + '%' : '') +
                        (d.amount != null ? ' $' + d.amount : '');
                }).join('; ');
            }
        } catch (e) {}

        const policies = (c.sitePolicies || []).slice(0, 6)
            .map(p => (p.title || '') + ': ' + String(p.body || '').slice(0, 220))
            .join(' | ');

        const about = [c.siteAboutLead, c.siteAboutBody, c.siteAboutStory]
            .filter(Boolean).join(' ').slice(0, 600);

        const parts = [
            'You are ' + BRAND + ' for ' + name + ', a nail salon (manicures, pedicures, enhancements, waxing, lashes). We do NOT offer hair services.',
            'Always answer from the LIVE SALON INFO below when possible. If unsure, say so and offer phone ' + phone + '.',
            'Phone: ' + phone,
            'Address: ' + address,
            'Hours Mon–Sat: ' + formatTime12(open) + ' – ' + formatTime12(close) + '; Sunday: ' + formatTime12(sunOpen) + ' – ' + formatTime12(sunClose),
            services ? 'Services : ' + services : '',
            discounts ? 'Discounts/promos : ' + discounts : '',
            about ? 'About : ' + about : '',
            policies ? 'Policies : ' + policies : '',
            'Help with booking appointments, services, prices, hours, location, and policies. Be warm, concise, and accurate. Use HTML <strong> for emphasis when helpful.',
            'Never invent prices or hours that contradict LIVE SALON INFO. Never crash or mention internal system errors — apologize briefly and suggest calling or trying again.',
            extra || ''
        ];
        return parts.filter(Boolean).join('\n');
    }

    /**
     * Offline / API-fallback answers for common salon FAQs (never throws).
     */
    function tryLocalFaq(question) {
        try {
            const q = String(question || '').toLowerCase().trim();
            if (!q) return null;
            const c = (global.SiteContent && SiteContent.get && SiteContent.get()) || {};
            const settings = (global.DataManager && DataManager.settings) || {};
            const phone = settings.salonPhone || c.sitePhone || c.salonPhone || '(480) 291-5440';
            const address = settings.salonAddress || c.salonAddress || 'See Contact on our website';
            const open = settings.openTime || c.openTime || '09:30';
            const close = settings.closeTime || c.closeTime || '18:30';
            const sunOpen = settings.sunOpenTime || c.sunOpenTime || '11:00';
            const sunClose = settings.sunCloseTime || c.sunCloseTime || '17:00';
            const name = settings.salonName || c.salonName || 'Urban Nail Bar';

            if (/\b(hour|open|close|when.*(open|close)|what time)\b/.test(q)) {
                return '<strong>' + name + '</strong> hours: <strong>Mon–Sat ' + formatTime12(open) + ' – ' +
                    formatTime12(close) + '</strong>; <strong>Sunday ' + formatTime12(sunOpen) + ' – ' +
                    formatTime12(sunClose) + '</strong>. Call <strong>' + phone + '</strong> with questions.';
            }
            if (/\b(phone|call|number|contact)\b/.test(q)) {
                return 'You can reach <strong>' + name + '</strong> at <strong>' + phone + '</strong>.';
            }
            if (/\b(address|where|location|direction|map)\b/.test(q)) {
                return 'We\'re at <strong>' + address + '</strong>. Phone: <strong>' + phone + '</strong>.';
            }
            if (/\b(hair|haircut|color(ing)? hair|blowout)\b/.test(q)) {
                return 'We\'re a <strong>nail salon</strong> — we don\'t offer hair services. We do manicures, pedicures, enhancements, waxing, and lashes.';
            }
            if (/\b(service|menu|price|cost|how much|gel|acrylic|mani|pedi|wax|lash)\b/.test(q)) {
                let list = [];
                try {
                    list = (global.DataManager && DataManager.getServices && DataManager.getServices()) || [];
                } catch (e) {}
                if (list.length) {
                    const sample = list.slice(0, 12).map(function (s) {
                        return '<strong>' + s.name + '</strong>' + (s.price != null ? ' ($' + s.price + ')' : '');
                    }).join(', ');
                    return 'Popular services include: ' + sample +
                        (list.length > 12 ? '…' : '') + '. Ask about a specific service, or book online.';
                }
            }
            if (/\b(book|appointment|reserv|schedule)\b/.test(q)) {
                return 'You can book online on our booking page — pick a service, date, and time, then confirm. Need help? Call <strong>' + phone + '</strong>.';
            }
            if (/\b(party|group|how many|guests?|people)\b/.test(q)) {
                return 'For a <strong>party</strong>, set party size on the booking form (or tell the front desk). Each guest can pick services; we\'ll seat you with available techs. Call <strong>' + phone + '</strong> for large groups.';
            }
            if (/\b(walk[\s-]?in|walkin)\b/.test(q)) {
                return 'Walk-ins are welcome when chairs are free — call <strong>' + phone + '</strong> or stop by. Online booking locks in a time in advance.';
            }
            if (/\b(discount|promo|coupon|deal|special)\b/.test(q)) {
                let promoLine = '';
                try {
                    const promos = (global.DataManager && DataManager.getDiscounts && DataManager.getDiscounts()) ||
                        (settings.discounts) || [];
                    if (Array.isArray(promos) && promos.length) {
                        promoLine = promos.slice(0, 6).map(function (d) {
                            return (d.name || d.code || 'Promo') +
                                (d.percent != null ? ' ' + d.percent + '%' : '') +
                                (d.amount != null ? ' $' + d.amount : '');
                        }).join('; ');
                    }
                } catch (e) {}
                if (promoLine) {
                    return 'Current promos: <strong>' + promoLine + '</strong>. Ask the front desk to apply an eligible discount at checkout.';
                }
                return 'Ask the front desk about current promos, or check the booking page for listed discounts. Call <strong>' + phone + '</strong>.';
            }
            if (/\b(cancel|reschedule|rebook|move)\b/.test(q)) {
                return 'To <strong>cancel or reschedule</strong>, call <strong>' + phone + '</strong> or ask the front desk. Online, open your booking confirmation if available.';
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function safeUserMessage(msg) {
        return '<strong>' + BRAND_TITLE + ':</strong> ' + String(msg || 'Something went wrong. Please try again or type your question.');
    }

    // ===== Voice: single control = mic listen + speak replies =====
    function unlockSpeechSynthesis() {
        // Chrome blocks TTS until a user gesture; empty utterance unlocks the pipeline.
        if (!global.speechSynthesis) return;
        try {
            global.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(' ');
            u.volume = 0;
            u.rate = 10;
            u.lang = 'en-US';
            global.speechSynthesis.speak(u);
            global.speechSynthesis.cancel();
        } catch (e) {}
    }

    function createVoiceController(opts) {
        opts = opts || {};
        const onTranscript = opts.onTranscript || function () {};
        const onListeningChange = opts.onListeningChange || function () {};
        const onVoiceModeChange = opts.onVoiceModeChange || opts.onSpeakChange || function () {};
        const onError = opts.onError || function () {};
        const autoSend = opts.autoSend !== false;
        const silenceMs = opts.silenceMs || 1400;

        let recognition = null;
        let listening = false;
        let silenceTimer = null;
        let voiceMode = opts.voiceMode !== false && opts.autoSpeak !== false;
        let speaking = false;
        let lastTranscript = '';
        let ttsUnlocked = false;

        const SpeechRecognition = global.SpeechRecognition || global.webkitSpeechRecognition;
        const hasMic = !!SpeechRecognition;
        const hasTts = !!(global.speechSynthesis);
        const hasVoice = hasMic; // Voice control requires mic; TTS is optional bonus

        if (hasMic) {
            try {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                recognition.maxAlternatives = 1;

                recognition.onresult = function (event) {
                    try {
                        let transcript = '';
                        let anyFinal = false;
                        for (let i = 0; i < event.results.length; i++) {
                            transcript += event.results[i][0].transcript;
                            if (event.results[i].isFinal) anyFinal = true;
                        }
                        lastTranscript = transcript;
                        onTranscript(transcript, anyFinal);
                        if (silenceTimer) clearTimeout(silenceTimer);
                        if (autoSend) {
                            silenceTimer = setTimeout(function () {
                                if (listening) {
                                    const finalText = String(lastTranscript || '').trim();
                                    stopListen();
                                    if (finalText) {
                                        onTranscript(finalText, true, true);
                                    } else {
                                        onError('I didn\'t catch that. Tap Voice and try again, or type your question.');
                                    }
                                }
                            }, silenceMs);
                        }
                    } catch (e) {
                        onError('Voice had a glitch. Please type your question.');
                        stopListen();
                    }
                };

                recognition.onerror = function (event) {
                    try {
                        const err = (event && event.error) || '';
                        if (err === 'aborted') {
                            stopListen();
                            return;
                        }
                        if (err === 'no-speech') {
                            if (listening) onError('No speech heard. Tap Voice and try again.');
                            stopListen();
                            return;
                        }
                        if (err === 'not-allowed' || err === 'service-not-allowed') {
                            onError('Microphone blocked. Allow mic access in the browser address bar, then tap Voice again — or type instead.');
                        } else if (err === 'network') {
                            onError('Voice network error. Use Chrome/Edge on localhost or HTTPS, or type instead.');
                        } else if (err === 'audio-capture') {
                            onError('No microphone found. Plug in a mic or type instead.');
                        } else {
                            onError('Voice error: ' + err + '. You can type instead.');
                        }
                        stopListen();
                    } catch (e) {
                        stopListen();
                    }
                };

                recognition.onend = function () {
                    if (listening) {
                        try { recognition.start(); } catch (e) { stopListen(); }
                    }
                };
            } catch (e) {
                recognition = null;
            }
        }

        function ensureTtsUnlocked() {
            if (ttsUnlocked || !hasTts) return;
            unlockSpeechSynthesis();
            ttsUnlocked = true;
            voiceMode = true;
            onVoiceModeChange(true);
        }

        function startListen() {
            if (!hasMic || !recognition) {
                onError('Voice not supported in this browser. Please use Chrome or Edge, or type instead.');
                return false;
            }
            ensureTtsUnlocked();
            stopSpeak();
            listening = true;
            lastTranscript = '';
            voiceMode = true;
            onListeningChange(true);
            onVoiceModeChange(true);
            try {
                recognition.start();
                return true;
            } catch (e) {
                // Often "already started" — retry once after stop
                try {
                    recognition.stop();
                } catch (e2) {}
                setTimeout(function () {
                    if (!listening) return;
                    try {
                        recognition.start();
                    } catch (e3) {
                        stopListen();
                        onError('Could not start microphone. Check browser permissions, or type instead.');
                    }
                }, 120);
                return true;
            }
        }

        function stopListen() {
            listening = false;
            onListeningChange(false);
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
            if (recognition) {
                try { recognition.stop(); } catch (e) {}
            }
        }

        function toggleVoice() {
            if (listening) {
                stopListen();
                return false;
            }
            return startListen();
        }

        function speak(text) {
            if (!hasTts) return false;
            const plain = stripHtml(text);
            if (!plain) return false;
            ensureTtsUnlocked();
            try { global.speechSynthesis.cancel(); } catch (e) {}
            try {
                // Chrome sometimes stays in paused state after cancel
                try { if (global.speechSynthesis.paused) global.speechSynthesis.resume(); } catch (e) {}
                const u = new SpeechSynthesisUtterance(plain);
                u.rate = 1;
                u.pitch = 1;
                u.lang = 'en-US';
                speaking = true;
                onVoiceModeChange(true);
                u.onend = function () {
                    speaking = false;
                    onVoiceModeChange(voiceMode);
                };
                u.onerror = function () {
                    speaking = false;
                    onVoiceModeChange(voiceMode);
                };
                global.speechSynthesis.speak(u);
                // Nudge resume if browser parked the queue
                setTimeout(function () {
                    try {
                        if (global.speechSynthesis.paused) global.speechSynthesis.resume();
                    } catch (e) {}
                }, 50);
                return true;
            } catch (e) {
                speaking = false;
                return false;
            }
        }

        function stopSpeak() {
            if (hasTts) {
                try { global.speechSynthesis.cancel(); } catch (e) {}
            }
            speaking = false;
            onVoiceModeChange(voiceMode);
        }

        function maybeAutoSpeak(text) {
            if (voiceMode && hasTts) speak(text);
        }

        // Legacy aliases kept so older call sites don't throw
        function startTalk() { return startListen(); }
        function stopTalk() { stopListen(); }
        function toggleTalk() { return toggleVoice(); }
        function toggleSpeakMode() {
            if (speaking) {
                stopSpeak();
                return { speaking: false, autoSpeak: voiceMode };
            }
            voiceMode = !voiceMode;
            onVoiceModeChange(voiceMode);
            return { speaking: speaking, autoSpeak: voiceMode };
        }

        return {
            brand: BRAND,
            hasTalk: hasMic,
            hasSpeak: hasTts,
            hasVoice: hasVoice,
            hasMic: hasMic,
            hasTts: hasTts,
            isListening: function () { return listening; },
            isSpeaking: function () { return speaking; },
            getVoiceMode: function () { return voiceMode; },
            setVoiceMode: function (v) { voiceMode = !!v; onVoiceModeChange(voiceMode); },
            getAutoSpeak: function () { return voiceMode; },
            setAutoSpeak: function (v) { voiceMode = !!v; },
            startListen: startListen,
            stopListen: stopListen,
            toggleVoice: toggleVoice,
            startTalk: startTalk,
            stopTalk: stopTalk,
            toggleTalk: toggleTalk,
            speak: speak,
            stopSpeak: stopSpeak,
            toggleSpeakMode: toggleSpeakMode,
            maybeAutoSpeak: maybeAutoSpeak,
            stripHtml: stripHtml
        };
    }

    /**
     * Attach a single Voice control next to an input row.
     * opts: { input, onSend, voiceBtn, autoSpeak/voiceMode, placeholder }
     * Legacy: talkBtn is accepted as alias for voiceBtn; speakBtn is ignored if present.
     */
    function wireChatVoice(opts) {
        opts = opts || {};
        const input = opts.input;
        const onSend = opts.onSend;
        const voiceBtn = opts.voiceBtn || opts.talkBtn;
        // If a leftover Speak button exists, hide it so UX is one control
        if (opts.speakBtn) {
            try {
                opts.speakBtn.style.display = 'none';
                opts.speakBtn.setAttribute('aria-hidden', 'true');
            } catch (e) {}
        }

        const defaultPlaceholder = opts.placeholder || 'Ask me anything…';

        function notify(msg, type) {
            try {
                if (opts.onNotify) {
                    opts.onNotify(msg, type || 'error');
                    return;
                }
                if (opts.errorEl) {
                    const el = opts.errorEl;
                    el.textContent = String(msg || '');
                    el.style.display = msg ? 'block' : 'none';
                    if (msg) {
                        clearTimeout(el.__unbToastTimer);
                        el.__unbToastTimer = setTimeout(function () {
                            el.style.display = 'none';
                            el.textContent = '';
                        }, 4200);
                    }
                    return;
                }
                if (typeof global.UI !== 'undefined' && UI.toast) UI.toast(msg, type || 'error');
                else if (input && msg) {
                    const prev = input.placeholder;
                    input.placeholder = msg;
                    setTimeout(function () {
                        if (input.placeholder === msg) input.placeholder = prev || defaultPlaceholder;
                    }, 3200);
                } else {
                    console.warn(msg);
                }
            } catch (e) {
                console.warn(msg);
            }
        }

        const voice = createVoiceController({
            voiceMode: opts.voiceMode !== false && opts.autoSpeak !== false,
            onTranscript: function (text, isFinal, shouldSend) {
                try {
                    if (input) input.value = text;
                    if (shouldSend && text && onSend) {
                        voice.stopSpeak();
                        onSend();
                    }
                } catch (e) {
                    notify('Could not send voice message. Please type instead.');
                }
            },
            onListeningChange: function (on) {
                if (!voiceBtn) return;
                try {
                    voiceBtn.classList.toggle('listening', on);
                    voiceBtn.classList.toggle('voice-on', voice.getVoiceMode());
                    voiceBtn.setAttribute('aria-pressed', on || voice.getVoiceMode() ? 'true' : 'false');
                    voiceBtn.title = on ? 'Stop listening' : (voice.getVoiceMode() ? 'Voice on — tap to speak' : 'Voice');
                    const label = voiceBtn.querySelector('.unb-ai-btn-label');
                    if (label) label.textContent = on ? 'Voice…' : 'Voice';
                    if (input) input.placeholder = on ? 'Listening… speak now' : defaultPlaceholder;
                } catch (e) {}
            },
            onVoiceModeChange: function () {
                if (!voiceBtn) return;
                try {
                    const speaking = voice.isSpeaking();
                    const mode = voice.getVoiceMode();
                    const on = voice.isListening();
                    voiceBtn.classList.toggle('speaking', speaking);
                    voiceBtn.classList.toggle('voice-on', mode && !on);
                    voiceBtn.setAttribute('aria-pressed', (on || mode) ? 'true' : 'false');
                    if (!on) {
                        voiceBtn.title = speaking ? 'Stop speaking (or tap to talk again)' : (mode ? 'Voice on — tap to speak' : 'Voice');
                        const label = voiceBtn.querySelector('.unb-ai-btn-label');
                        if (label && !on) label.textContent = speaking ? 'Voice…' : 'Voice';
                    }
                } catch (e) {}
            },
            onError: function (msg) {
                notify(msg, 'error');
            }
        });

        if (voiceBtn) {
            voiceBtn.type = 'button';
            voiceBtn.setAttribute('aria-label', 'Voice');
            const label = voiceBtn.querySelector('.unb-ai-btn-label');
            if (label) label.textContent = 'Voice';
            if (!voice.hasVoice) {
                voiceBtn.disabled = true;
                voiceBtn.title = 'Voice not supported in this browser';
                voiceBtn.setAttribute('aria-disabled', 'true');
            } else {
                voiceBtn.title = 'Voice';
            }
            voiceBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    // User gesture: unlock TTS so replies can speak after recognition
                    unlockSpeechSynthesis();
                    if (voice.isSpeaking()) voice.stopSpeak();
                    if (!voice.hasVoice) {
                        notify('Voice not supported in this browser. Use Chrome or Edge, or type.');
                        return;
                    }
                    voice.toggleVoice();
                } catch (err) {
                    notify('Voice could not start. Please type instead.');
                }
            });
            voiceBtn.classList.toggle('voice-on', voice.getVoiceMode());
            voiceBtn.setAttribute('aria-pressed', voice.getVoiceMode() ? 'true' : 'false');
        }

        return voice;
    }

    const sharedCss = `
        .unb-ai-badge{font-weight:800;letter-spacing:0.02em;font-size:0.78rem;text-transform:uppercase}
        .unb-ai-fab-emoji{font-size:1.45rem;line-height:1;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 1px #fbbf24)}
        .unb-ai-voice-btn{background:#000;border:1.5px solid #fbbf24;color:#fbbf24;border-radius:8px;padding:6px 10px;cursor:pointer;font-weight:800;font-size:0.72rem;display:inline-flex;align-items:center;gap:4px;min-width:64px;justify-content:center;opacity:1;box-shadow:none}
        .unb-ai-voice-btn .unb-ai-btn-label{color:inherit;font-weight:800}
        .unb-ai-voice-btn i{color:inherit}
        .unb-ai-voice-btn.listening{background:#000;border-color:#fbbf24;color:#fbbf24;animation:unbAiPulse 1s infinite}
        .unb-ai-voice-btn.speaking{background:#111;border-color:#fbbf24;color:#fff}
        .unb-ai-voice-btn.voice-on{background:#000;border-color:#fbbf24;color:#fbbf24;box-shadow:0 0 0 2px rgba(251,191,36,0.35)}
        .unb-ai-voice-btn:not(.voice-on):not(.listening):not(.speaking){opacity:1}
        .unb-ai-voice-btn:disabled{opacity:0.4;cursor:not-allowed}
        @keyframes unbAiPulse{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0.55)}50%{box-shadow:0 0 0 6px rgba(251,191,36,0)}}
    `;

    function injectSharedCss() {
        if (document.getElementById('unbAiAssistCss')) return;
        const s = document.createElement('style');
        s.id = 'unbAiAssistCss';
        s.textContent = sharedCss;
        document.head.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectSharedCss);
    } else {
        injectSharedCss();
    }

    global.UnbAiAssist = {
        BRAND: BRAND,
        BRAND_TITLE: BRAND_TITLE,
        FAB_EMOJI: FAB_EMOJI,
        PAGE_PROFILES: PAGE_PROFILES,
        detectPageKey: detectPageKey,
        getPageProfile: getPageProfile,
        stripHtml: stripHtml,
        formatTime12: formatTime12,
        buildSalonContext: buildSalonContext,
        tryLocalFaq: tryLocalFaq,
        safeUserMessage: safeUserMessage,
        unlockSpeechSynthesis: unlockSpeechSynthesis,
        createVoiceController: createVoiceController,
        wireChatVoice: wireChatVoice,
        injectSharedCss: injectSharedCss
    };
})(typeof window !== 'undefined' ? window : globalThis);
