/**
 * Floating UNB AI ASSISTANT for Admin / Manager / Staff pages.
 * Book / cancel / reschedule via DataManager + SalonStaffAI. Single Voice control.
 */
(function (global) {
    if (global.__staffAiWidgetMounted) return;

    const BRAND = (global.UnbAiAssist && UnbAiAssist.BRAND) || 'UNB AI ASSISTANT';
    const FAB_EMOJI = (global.UnbAiAssist && UnbAiAssist.FAB_EMOJI) || '\u2728';
    const BRAND_TITLE = (global.UnbAiAssist && UnbAiAssist.BRAND_TITLE) || (FAB_EMOJI + ' ' + BRAND);

    function pageKey() {
        if (global.UnbAiAssist && UnbAiAssist.detectPageKey) return UnbAiAssist.detectPageKey();
        const p = String((global.location && location.pathname) || '').toLowerCase();
        if (p.indexOf('admin') >= 0) return 'admin';
        if (p.indexOf('manager') >= 0) return 'manager';
        return 'staff';
    }

    function pageProfile() {
        if (global.UnbAiAssist && UnbAiAssist.getPageProfile) return UnbAiAssist.getPageProfile(pageKey());
        return {
            welcomeHtml: 'I\'m <strong>' + BRAND + '</strong>. Tap <strong>Voice</strong> or type.',
            contextExtra: '',
            placeholder: 'Ask me anything…'
        };
    }

    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }

    function currentStaffId() {
        try {
            if (typeof global.currentStaffId !== 'undefined' && global.currentStaffId != null) return global.currentStaffId;
            if (typeof SalonAuth !== 'undefined' && SalonAuth.current) {
                const u = SalonAuth.current();
                if (u && u.staffId) return u.staffId;
            }
            if (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.staffId) {
                return Auth.currentUser.staffId;
            }
        } catch (e) {}
        return null;
    }

    function getCtx() {
        if (typeof DataManager === 'undefined') {
            return { clients: [], staff: [], services: [], appointments: [], today: todayStr(), page: pageKey() };
        }
        const staff = (DataManager.getStaff() || []).filter(s => {
            if (typeof Utils !== 'undefined' && Utils.isTechnician) return Utils.isTechnician(s);
            const roles = Array.isArray(s.roles) ? s.roles : [s.role];
            return roles.some(r => String(r || '').toLowerCase().includes('tech')) || !s.role;
        });
        let appointments = (DataManager.getAppointments() || []).filter(a => a.status !== 'cancelled');
        const key = pageKey();
        const sid = currentStaffId();
        if (key === 'staff' && sid != null) {
            appointments = appointments.filter(a => String(a.staffId) === String(sid));
        }
        return {
            clients: DataManager.getClients() || [],
            staff: staff.length ? staff : (DataManager.getStaff() || []),
            services: DataManager.getServices() || [],
            appointments: appointments,
            today: todayStr(),
            page: key,
            staffId: sid
        };
    }

    function execute(action) {
        try {
            if (typeof DataManager === 'undefined') return '<strong>Error:</strong> Shared data not loaded.';
            if (pageKey() === 'staff') {
                return '<strong>Staff scope:</strong> Schedule changes for the whole salon are done on Scheduler / Manager. ' +
                    'I can help you with <strong>your</strong> appointments and questions — ask about your day or clock.';
            }
            if (action.type === 'addAppointment' || action.type === 'addWalkIn') {
                const staff = (DataManager.getStaff() || []).find(s => s.id === action.staffId);
                const service = (DataManager.getServices() || []).find(s => s.id === action.serviceId)
                    || (DataManager.getServices() || []).find(s => s.name === action.serviceName);
                let client = action.clientId
                    ? (DataManager.getClients() || []).find(c => c.id === action.clientId)
                    : null;
                if (!client && action.type === 'addWalkIn' && action.clientName) {
                    // Walk-ins may not exist yet — create a light client record
                    const parts = String(action.clientName).trim().split(/\s+/);
                    const created = DataManager.addClient({
                        firstName: parts[0] || 'Walk-In',
                        lastName: parts.slice(1).join(' ') || '',
                        phone: action.phone || '',
                        notes: 'Created via UNB AI walk-in'
                    });
                    client = created || { id: null, firstName: parts[0], lastName: parts.slice(1).join(' ') };
                }
                if ((!client && action.type !== 'addWalkIn') || !staff || !service || !action.time) {
                    return '<strong>Error:</strong> Incomplete booking details — nothing was changed.';
                }
                const conflict = (DataManager.getAppointments() || []).find(a =>
                    a.status !== 'cancelled' && a.status !== 'complete' &&
                    a.staffId === staff.id && a.date === action.date &&
                    String(a.time).slice(0, 5) === String(action.time).slice(0, 5)
                );
                if (conflict) {
                    return '<strong>Blocked:</strong> That staff/time slot is already taken.';
                }
                const cName = client
                    ? (((client.firstName || '') + ' ' + (client.lastName || '')).trim() || action.clientName)
                    : action.clientName;
                DataManager.addAppointment({
                    clientId: client ? client.id : null,
                    staffId: staff.id,
                    serviceId: service.id,
                    date: action.date,
                    time: action.time,
                    duration: action.duration || service.duration || 30,
                    price: service.price || 0,
                    status: action.type === 'addWalkIn' ? 'late' : 'booked',
                    source: 'unb-ai-assistant',
                    isWalkIn: action.type === 'addWalkIn' || !!action.isWalkIn,
                    notes: action.polishColor ? ('Polish: ' + action.polishColor) : '',
                    polishColor: action.polishColor || '',
                    clientName: cName,
                    services: [{ name: service.name, price: service.price || 0, duration: service.duration || 30, staffId: staff.id, staffName: staff.name }]
                });
                const label = action.type === 'addWalkIn' ? 'Walk-in added' : 'Booked';
                return '<strong>Done!</strong> ' + label + ': <strong>' + cName + '</strong> with <strong>' + action.staffName +
                    '</strong> for <strong>' + service.name + '</strong> on <strong>' + action.date + '</strong> at <strong>' + action.time + '</strong>.';
            }
            if (action.type === 'cancelAppointment' || action.type === 'deleteAppointment') {
                const appt = (DataManager.getAppointments() || []).find(a => a.id === action.apptId);
                if (!appt) return '<strong>Error:</strong> Appointment not found.';
                DataManager.updateAppointment(appt.id, { status: 'cancelled' });
                return '<strong>Done!</strong> Cancelled <strong>' + (action.clientName || appt.clientName) + '</strong> (' +
                    (action.date || appt.date) + ' ' + (action.time || appt.time) + ').';
            }
            if (action.type === 'rescheduleAppointment') {
                const appt = (DataManager.getAppointments() || []).find(a => a.id === action.apptId);
                if (!appt || !action.date || !action.time) return '<strong>Error:</strong> Could not reschedule.';
                const staffId = action.staffId || appt.staffId;
                const conflict = (DataManager.getAppointments() || []).find(a =>
                    a.id !== appt.id && a.status !== 'cancelled' && a.status !== 'complete' &&
                    a.staffId === staffId && a.date === action.date &&
                    String(a.time).slice(0, 5) === String(action.time).slice(0, 5)
                );
                if (conflict) return '<strong>Blocked:</strong> New slot is taken.';
                const patch = {
                    date: action.date,
                    time: action.time,
                    clientConfirmed: false,
                    clientConfirmedAt: null,
                    reminders: Object.assign({}, appt.reminders || {}, { d3: false, h24: false, h2: false, confirmed: false })
                };
                if (action.staffId) {
                    patch.staffId = action.staffId;
                    if (action.staffName) patch.staffName = action.staffName;
                }
                DataManager.updateAppointment(appt.id, patch);
                return '<strong>Done!</strong> Rescheduled <strong>' + appt.clientName + '</strong> → <strong>' +
                    action.date + ' ' + action.time + '</strong>' +
                    (action.staffName ? ' with <strong>' + action.staffName + '</strong>' : '') + '.';
            }
            return '<strong>Error:</strong> Unsupported action on this page.';
        } catch (e) {
            return (global.UnbAiAssist && UnbAiAssist.safeUserMessage)
                ? UnbAiAssist.safeUserMessage('I couldn\'t complete that action. Nothing was changed — try again or use the page controls.')
                : '<strong>Error:</strong> Action failed. Nothing was changed.';
        }
    }

    function staffLocalHelp(text, ctx) {
        const lower = String(text || '').toLowerCase();
        const mine = ctx.appointments || [];
        if (/\b(my|today|schedule|appointments?|book(ed|ings)?)\b/.test(lower)) {
            const today = mine.filter(a => a.date === ctx.today && a.status !== 'complete');
            if (!today.length) {
                return 'You have <strong>no open appointments</strong> on your book for <strong>' + ctx.today + '</strong>.';
            }
            const lines = today.slice(0, 12).map(a =>
                '<strong>' + (a.time || '') + '</strong> — ' + (a.clientName || 'Client') +
                (a.services && a.services[0] ? ' (' + a.services[0].name + ')' : '')
            );
            return '<strong>Your schedule today</strong> (' + today.length + '):<br>' + lines.join('<br>');
        }
        if (/\bclock\b/.test(lower)) {
            return 'Use the <strong>Clock In / Clock Out</strong> control on this Staff page. I can\'t toggle clock from chat for safety.';
        }
        return null;
    }

    async function answer(text) {
        try {
            const lower = String(text || '').toLowerCase().trim();
            if (!lower) {
                return (global.UnbAiAssist && UnbAiAssist.safeUserMessage)
                    ? UnbAiAssist.safeUserMessage('Type a question or tap Voice to speak.')
                    : 'Please type a question.';
            }
            const pending = global.__staffAiPending;
            const key = pageKey();
            if (pending) {
                if (/^(yes|y|confirm|ok|okay|sure|do it|proceed)\b/i.test(lower) || lower === 'yes') {
                    global.__staffAiPending = null;
                    return execute(pending);
                }
                if (/^(no|n|abort|nevermind|never mind)\b/i.test(lower) || lower === 'no') {
                    global.__staffAiPending = null;
                    return '<strong>Action Cancelled.</strong> No changes were made.';
                }
                return '<strong>Pending action:</strong> Reply <strong>yes</strong> or <strong>no</strong>.';
            }

            const ctx = getCtx();
            if (key === 'staff') {
                const local = staffLocalHelp(text, ctx);
                if (local) return local;
            }

            if (key !== 'staff' && typeof SalonStaffAI !== 'undefined' && SalonStaffAI.interpret) {
                const interpreted = SalonStaffAI.interpret(text, ctx);
                if (interpreted) {
                    if (interpreted.pending) global.__staffAiPending = interpreted.pending;
                    return interpreted.reply;
                }
            }

            if (global.UnbAiAssist && UnbAiAssist.tryLocalFaq) {
                const faq = UnbAiAssist.tryLocalFaq(text);
                if (faq) return faq;
            }

            const profile = pageProfile();
            const context = [
                'You are ' + BRAND + ' for Urban Nail Bar.',
                profile.contextExtra || '',
                'Today: ' + ctx.today,
                'Appointments in scope: ' + ctx.appointments.length,
                'Clients: ' + ctx.clients.length,
                'Staff: ' + ctx.staff.map(s => s.name).join(', '),
                'Services sample: ' + ctx.services.slice(0, 10).map(s => s.name).join('; ')
            ].filter(Boolean).join('\n');

            try {
                const r = await fetch('/api/salon-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, context, history: [] })
                });
                if (r.ok) {
                    const data = await r.json();
                    const reply = data.reply || data.message ||
                        (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
                    if (reply) return reply;
                }
            } catch (e) {}

            if (key === 'staff') {
                return '<strong>' + BRAND + ':</strong> Ask about <strong>your schedule today</strong>, an appointment on your book, or clock help. Salon-wide booking is on Scheduler.';
            }
            return '<strong>' + BRAND + ':</strong> I can book, walk-in, cancel, reschedule, or rebook. Example: "Book Jane Doe with Maria at 2pm for Gel Manicure" or "Walk-in Sam with Maria at 3pm for Gel Manicure".';
        } catch (e) {
            return (global.UnbAiAssist && UnbAiAssist.safeUserMessage)
                ? UnbAiAssist.safeUserMessage('I hit a snag answering that. Please try again or rephrase.')
                : 'Sorry — please try again.';
        }
    }

    function mount() {
        if (global.__staffAiWidgetMounted) return;
        global.__staffAiWidgetMounted = true;
        if (global.UnbAiAssist && UnbAiAssist.injectSharedCss) UnbAiAssist.injectSharedCss();

        const profile = pageProfile();
        const style = document.createElement('style');
        style.textContent = `
            #staffAiFab{position:fixed;right:18px;bottom:18px;z-index:99999;width:56px;height:56px;background:#000;color:#fbbf24;border:2px solid #fbbf24;border-radius:999px;padding:0;font-size:1.45rem;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.55),0 0 12px rgba(251,191,36,.25);display:flex;align-items:center;justify-content:center;line-height:1}
            #staffAiFab:hover{transform:scale(1.05);box-shadow:0 8px 28px rgba(0,0,0,.6),0 0 16px rgba(251,191,36,.4)}
            #staffAiPanel{position:fixed;right:18px;bottom:84px;width:min(380px,calc(100vw - 24px));height:440px;z-index:99999;background:#111;border:2px solid #fbbf24;border-radius:14px;display:none;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.55)}
            #staffAiPanel.open{display:flex}
            #staffAiHead{background:#1a1a1a;color:#fbbf24;padding:10px 12px;font-weight:800;display:flex;justify-content:space-between;align-items:center;gap:8px}
            #staffAiMsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
            .staff-ai-msg{padding:8px 10px;border-radius:8px;font-size:0.8rem;line-height:1.4;max-width:92%}
            .staff-ai-msg.user{align-self:flex-end;background:#fbbf24;color:#000}
            .staff-ai-msg.bot{align-self:flex-start;background:#1f1f1f;color:#e5e7eb;border:1px solid #333}
            #staffAiForm{display:flex;gap:6px;padding:10px;border-top:1px solid #333;background:#0a0a0a;align-items:center;flex-wrap:wrap}
            #staffAiInput{flex:1;min-width:120px;background:#141414;border:1px solid #333;color:#fff;border-radius:8px;padding:8px 10px;font-size:0.8rem}
            #staffAiSend{background:linear-gradient(135deg,#fbbf24,#f59e0b);border:none;border-radius:8px;padding:8px 12px;font-weight:800;cursor:pointer;color:#000}
            #staffAiVoice{background:#000;color:#fbbf24;border-color:#fbbf24}
        `;
        document.head.appendChild(style);
        const fab = document.createElement('button');
        fab.id = 'staffAiFab';
        fab.type = 'button';
        fab.setAttribute('aria-label', BRAND_TITLE);
        fab.title = BRAND_TITLE;
        fab.innerHTML = '<span class="unb-ai-fab-emoji" aria-hidden="true">' + FAB_EMOJI + '</span>';
        const panel = document.createElement('div');
        panel.id = 'staffAiPanel';
        panel.innerHTML = `
            <div id="staffAiHead">
                <span class="unb-ai-badge">${BRAND_TITLE}</span>
                <button type="button" id="staffAiClose" style="background:transparent;border:none;color:#fbbf24;font-size:1.1rem;cursor:pointer;" aria-label="Close">&times;</button>
            </div>
            <div id="staffAiMsgs"><div class="staff-ai-msg bot">${profile.welcomeHtml}</div></div>
            <div id="staffAiToast" style="display:none;margin:0 10px 6px;padding:6px 8px;border-radius:6px;background:#3f1d1d;border:1px solid #f87171;color:#fecaca;font-size:0.72rem;"></div>
            <form id="staffAiForm">
                <button type="button" id="staffAiVoice" class="unb-ai-voice-btn" title="Voice" aria-label="Voice"><i class="fas fa-microphone"></i> <span class="unb-ai-btn-label">Voice</span></button>
                <input id="staffAiInput" placeholder="${profile.placeholder || 'Ask me anything…'}" autocomplete="off" aria-label="Message ${BRAND}" />
                <button id="staffAiSend" type="submit">Send</button>
            </form>
        `;
        document.body.appendChild(fab);
        document.body.appendChild(panel);
        fab.onclick = () => panel.classList.toggle('open');
        panel.querySelector('#staffAiClose').onclick = () => panel.classList.remove('open');

        const input = panel.querySelector('#staffAiInput');
        const msgs = panel.querySelector('#staffAiMsgs');
        const toastEl = panel.querySelector('#staffAiToast');
        let voice = null;

        async function handleSend(text) {
            try {
                const t = String(text || '').trim();
                if (!t) return;
                if (voice) voice.stopSpeak();
                const u = document.createElement('div');
                u.className = 'staff-ai-msg user';
                u.textContent = t;
                msgs.appendChild(u);
                input.value = '';
                const b = document.createElement('div');
                b.className = 'staff-ai-msg bot';
                b.textContent = 'Thinking…';
                msgs.appendChild(b);
                msgs.scrollTop = msgs.scrollHeight;
                const reply = await answer(t);
                b.innerHTML = reply;
                msgs.scrollTop = msgs.scrollHeight;
                if (voice) voice.maybeAutoSpeak(reply);
            } catch (e) {
                const b = document.createElement('div');
                b.className = 'staff-ai-msg bot';
                b.textContent = 'Sorry — something went wrong. Please try again.';
                msgs.appendChild(b);
            }
        }

        if (global.UnbAiAssist && UnbAiAssist.wireChatVoice) {
            voice = UnbAiAssist.wireChatVoice({
                input: input,
                voiceBtn: panel.querySelector('#staffAiVoice'),
                autoSpeak: true,
                placeholder: profile.placeholder || 'Ask me anything…',
                errorEl: toastEl,
                onSend: function () {
                    const t = input.value.trim();
                    if (t) handleSend(t);
                }
            });
        }

        panel.querySelector('#staffAiForm').onsubmit = async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            if (voice) voice.stopSpeak();
            await handleSend(text);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})(typeof window !== 'undefined' ? window : globalThis);
