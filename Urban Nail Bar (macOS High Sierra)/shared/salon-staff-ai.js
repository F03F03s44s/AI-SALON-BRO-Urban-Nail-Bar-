/**
 * UNB AI ASSISTANT helpers — precise book / cancel / reschedule / move / rebook.
 * Used by Scheduler and floating chat on Admin / Manager / Staff pages.
 */
(function (global) {
    function pad2(n) { return String(n).padStart(2, '0'); }

    function to24h(h, m, ampm) {
        let hh = parseInt(h, 10);
        const mm = pad2(parseInt(m, 10) || 0);
        if (ampm) {
            const ap = ampm.toLowerCase();
            if (ap === 'pm' && hh < 12) hh += 12;
            if (ap === 'am' && hh === 12) hh = 0;
        }
        return pad2(hh) + ':' + mm;
    }

    function parseTime(text) {
        if (!text) return null;
        const m12 = String(text).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
        if (m12) return to24h(m12[1], m12[2] || '00', m12[3]);
        const m24 = String(text).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
        if (m24) return pad2(m24[1]) + ':' + m24[2];
        return null;
    }

    function parseDate(text, fallbackToday) {
        const lower = String(text || '').toLowerCase();
        const today = fallbackToday || new Date().toISOString().split('T')[0];
        const base = new Date(today + 'T12:00:00');
        if (lower.includes('tomorrow')) {
            base.setDate(base.getDate() + 1);
            return base.toISOString().split('T')[0];
        }
        if (lower.includes('today')) return today;
        const iso = String(text).match(/\b(20\d{2}-\d{2}-\d{2})\b/);
        if (iso) return iso[1];
        const md = String(text).match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](20\d{2}))?\b/);
        if (md) {
            const y = md[3] || String(base.getFullYear());
            return y + '-' + pad2(md[1]) + '-' + pad2(md[2]);
        }
        return null;
    }

    function findBestName(text, names) {
        const lower = String(text || '').toLowerCase();
        let best = null;
        let bestLen = 0;
        (names || []).forEach(n => {
            const nl = String(n || '').toLowerCase();
            if (nl.length >= 3 && lower.includes(nl) && nl.length > bestLen) {
                best = n;
                bestLen = nl.length;
            }
        });
        return best;
    }

    function findService(text, services) {
        const lower = String(text || '').toLowerCase();
        let best = null;
        let bestLen = 0;
        (services || []).forEach(s => {
            const name = (s && s.name) || '';
            const nl = name.toLowerCase();
            if (nl.length >= 3 && lower.includes(nl) && nl.length > bestLen) {
                best = s;
                bestLen = nl.length;
            }
        });
        return best;
    }

    function extractPolish(text) {
        if (!text) return '';
        const m = String(text).match(/(?:polish|color|gel)\s*[:\-]\s*([^\n|;]+)/i);
        return m ? m[1].trim() : '';
    }

    /**
     * Build a pending action from natural language against live salon lists.
     * ctx: { clients, staff, services, appointments, today }
     */
    function interpret(text, ctx) {
        const lower = String(text || '').toLowerCase().trim();
        const today = (ctx && ctx.today) || new Date().toISOString().split('T')[0];
        const clients = ctx.clients || [];
        const staff = ctx.staff || [];
        const services = ctx.services || [];
        const appointments = (ctx.appointments || []).filter(a => a && a.status !== 'cancelled');

        const clientNames = clients.map(c => ((c.firstName || '') + ' ' + (c.lastName || '')).trim());
        const staffNames = staff.map(s => s.name);

        // Reschedule / move existing appointment (rebook with an open appt also lands here)
        const wantsReschedule = lower.includes('reschedule') ||
            (lower.includes('move') && (lower.includes('appointment') || lower.includes('appt') || !!findBestName(text, clientNames))) ||
            (lower.includes('rebook') && !!findBestName(text, clientNames));
        if (wantsReschedule && !lower.includes('cancel')) {
            const clientName = findBestName(text, clientNames);
            const time = parseTime(text);
            const date = parseDate(text, today) || today;
            if (!clientName) {
                return { reply: '<strong>Reschedule:</strong> Tell me the client name, new date, and time. Example: "Reschedule Jane Doe to tomorrow at 2pm"' };
            }
            const client = clients.find(c => ((c.firstName || '') + ' ' + (c.lastName || '')).trim().toLowerCase() === clientName.toLowerCase())
                || clients.find(c => ((c.firstName || '') + ' ' + (c.lastName || '')).trim().toLowerCase().includes(clientName.toLowerCase()));
            const lookup = (client ? (client.firstName + ' ' + client.lastName) : clientName).toLowerCase().trim();
            const appt = appointments.find(a =>
                (a.clientName || '').toLowerCase().includes(lookup) && a.status !== 'complete'
            ) || appointments.find(a => (a.clientName || '').toLowerCase().includes(clientName.toLowerCase()));
            // rebook with no open appt → fall through to book
            if (!appt && lower.includes('rebook')) {
                // continue to book path below
            } else {
                if (!appt) return { reply: '<strong>Reschedule:</strong> No open appointment found for <strong>' + clientName + '</strong>.' };
                if (!time) return { reply: '<strong>Reschedule:</strong> What new time? Example: "Reschedule ' + clientName + ' to 2:30pm"' };
                const withMatch = text.match(/\bwith\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
                const staffMember = withMatch
                    ? staff.find(s => (s.name || '').toLowerCase().includes(withMatch[1].toLowerCase()))
                    : null;
                const pending = {
                    type: 'rescheduleAppointment',
                    apptId: appt.id,
                    clientName: appt.clientName,
                    date,
                    time,
                    oldDate: appt.date,
                    oldTime: appt.time
                };
                if (staffMember) {
                    pending.staffId = staffMember.id;
                    pending.staffName = staffMember.name;
                }
                return {
                    pending,
                    reply: '<strong>Confirm Reschedule:</strong> Move <strong>' + appt.clientName + '</strong> from ' + appt.date + ' ' + appt.time +
                        ' → <strong>' + date + ' ' + time + '</strong>' +
                        (staffMember ? ' with <strong>' + staffMember.name + '</strong>' : '') +
                        '?<br>Reply <strong>yes</strong> to confirm or <strong>no</strong> to abort.'
                };
            }
        }

        // Cancel / delete appointment
        if ((lower.includes('cancel') || lower.includes('delete') || lower.includes('remove')) &&
            (lower.includes('appointment') || lower.includes('booking') || lower.includes('appt'))) {
            const clientName = findBestName(text, clientNames);
            if (!clientName) {
                return { reply: '<strong>Cancel Appointment:</strong> Specify the client. Example: "Cancel Jane Doe appointment"' };
            }
            const date = parseDate(text, today) || today;
            const time = parseTime(text);
            let candidates = appointments.filter(a =>
                (a.clientName || '').toLowerCase().includes(clientName.toLowerCase()) && a.status !== 'complete'
            );
            if (date) candidates = candidates.filter(a => a.date === date);
            if (time) candidates = candidates.filter(a => String(a.time).slice(0, 5) === time || a.time === time);
            if (!candidates.length) {
                return { reply: '<strong>Cancel:</strong> No matching open appointment for <strong>' + clientName + '</strong>' + (date ? ' on ' + date : '') + '.' };
            }
            const appt = candidates[0];
            return {
                pending: { type: 'cancelAppointment', apptId: appt.id, clientName: appt.clientName, date: appt.date, time: appt.time },
                reply: '<strong>Confirm Cancel:</strong> Cancel <strong>' + appt.clientName + '</strong> on ' + appt.date + ' at ' + appt.time +
                    '?<br>Reply <strong>yes</strong> to confirm or <strong>no</strong> to abort.'
            };
        }

        // Walk-in (today, often no prior client record)
        const wantsWalkin = /\bwalk[\s-]?ins?\b/.test(lower) || /\bwalkin\b/.test(lower);
        if (wantsWalkin) {
            const staffName = findBestName(text, staffNames);
            const service = findService(text, services);
            const time = parseTime(text);
            const date = today;
            // Prefer an explicit name after "walk-in" / "for", else best client match
            let clientName = null;
            const named = String(text).match(/\bwalk[\s-]?in(?:\s+for)?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i)
                || String(text).match(/\b(?:add|new)\s+walk[\s-]?in\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
            if (named) clientName = named[1].trim();
            if (!clientName) clientName = findBestName(text, clientNames);
            if (!clientName) {
                return { reply: '<strong>Walk-In:</strong> Tell me the guest name, staff, service, and time. Example: "Walk-in Jane with Maria at 2pm for Gel Manicure"' };
            }
            if (!staffName) {
                return { reply: '<strong>Walk-In:</strong> Which tech for <strong>' + clientName + '</strong>? Example: "Walk-in ' + clientName + ' with Maria at 2pm"' };
            }
            const staffMember = staff.find(s => (s.name || '').toLowerCase().includes(staffName.toLowerCase()));
            if (!staffMember) {
                return { reply: '<strong>Walk-In:</strong> Could not match staff. Check the spelling and try again.' };
            }
            if (!time) {
                return { reply: '<strong>Walk-In:</strong> What time for <strong>' + clientName + '</strong>? Example: "at 2:30pm"' };
            }
            if (!service) {
                return {
                    reply: '<strong>Walk-In:</strong> Which service? Examples: ' +
                        services.slice(0, 6).map(s => s.name).join(', ') + (services.length > 6 ? '…' : '')
                };
            }
            const existing = clients.find(c => ((c.firstName || '') + ' ' + (c.lastName || '')).trim().toLowerCase().includes(clientName.toLowerCase()));
            return {
                pending: {
                    type: 'addWalkIn',
                    clientId: existing ? existing.id : null,
                    staffId: staffMember.id,
                    clientName: existing ? ((existing.firstName + ' ' + existing.lastName).trim()) : clientName,
                    staffName: staffMember.name,
                    date,
                    time,
                    serviceId: service.id,
                    serviceName: service.name,
                    price: service.price || 0,
                    duration: service.duration || 30,
                    isWalkIn: true
                },
                reply: '<strong>Confirm Walk-In:</strong> <strong>' + (existing ? ((existing.firstName + ' ' + existing.lastName).trim()) : clientName) +
                    '</strong> with <strong>' + staffMember.name + '</strong> — <strong>' + service.name +
                    '</strong> today at <strong>' + time + '</strong>?<br>Reply <strong>yes</strong> to confirm or <strong>no</strong> to abort.'
            };
        }

        // Book / add / schedule / rebook new appointment
        if ((lower.includes('book') || lower.includes('schedule') || lower.includes('rebook') ||
            (lower.includes('add') && lower.includes('appointment')) || lower.includes('create appointment') ||
            lower.includes('new appointment'))) {
            const clientName = findBestName(text, clientNames);
            const staffName = findBestName(text, staffNames);
            const service = findService(text, services);
            const time = parseTime(text);
            const date = parseDate(text, today) || today;
            const polish = extractPolish(text);

            if (!clientName) {
                return { reply: '<strong>Book:</strong> Specify client and staff (and time if known). Example: "Book Jane Doe with Maria at 2pm for Gel Manicure". For walk-ins say "Walk-in …".' };
            }
            if (!staffName) {
                return { reply: '<strong>Book:</strong> Which staff member for <strong>' + clientName + '</strong>? Example: "Book ' + clientName + ' with Maria at 2pm"' };
            }
            const client = clients.find(c => ((c.firstName || '') + ' ' + (c.lastName || '')).trim().toLowerCase().includes(clientName.toLowerCase()));
            const staffMember = staff.find(s => (s.name || '').toLowerCase().includes(staffName.toLowerCase()));
            if (!client || !staffMember) {
                return { reply: '<strong>Book:</strong> Could not match client/staff precisely. Check the spelling and try again. New guests: use "Walk-in Name with Tech at time for Service".' };
            }
            if (!time) {
                return { reply: '<strong>Book:</strong> What time for <strong>' + client.firstName + ' ' + client.lastName + '</strong> with <strong>' + staffMember.name + '</strong>? Example: "at 2:30pm"' };
            }
            if (!service) {
                return {
                    reply: '<strong>Book:</strong> Which service? Examples from menu: ' +
                        services.slice(0, 6).map(s => s.name).join(', ') + (services.length > 6 ? '…' : '')
                };
            }
            return {
                pending: {
                    type: 'addAppointment',
                    clientId: client.id,
                    staffId: staffMember.id,
                    clientName: (client.firstName + ' ' + client.lastName).trim(),
                    staffName: staffMember.name,
                    date,
                    time,
                    serviceId: service.id,
                    serviceName: service.name,
                    price: service.price || 0,
                    duration: service.duration || 30,
                    polishColor: polish
                },
                reply: '<strong>Confirm Book:</strong> <strong>' + (client.firstName + ' ' + client.lastName).trim() + '</strong> with <strong>' +
                    staffMember.name + '</strong> — <strong>' + service.name + '</strong> on <strong>' + date + '</strong> at <strong>' + time +
                    '</strong>' + (polish ? ' (polish : ' + polish + ')' : '') +
                    '?<br>Reply <strong>yes</strong> to confirm or <strong>no</strong> to abort.'
            };
        }

        return null;
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

    global.SalonStaffAI = {
        parseTime,
        parseDate,
        findBestName,
        findService,
        extractPolish,
        interpret,
        formatTime12
    };
})(typeof window !== 'undefined' ? window : globalThis);
