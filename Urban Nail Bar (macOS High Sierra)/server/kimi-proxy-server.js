const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Kimi Proxy Server Running', timestamp: new Date().toISOString() });
});

// Kimi Chat API Proxy
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, stream = false, model = 'kimi-k3' } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        const apiKey = process.env.MOONSHOT_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'MOONSHOT_API_KEY not configured' });
        }

        const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: stream,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: errorData });
        }

        // For streaming, pipe the response directly
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            response.body.pipe(res);
            response.body.on('error', (err) => {
                console.error('Stream error:', err);
                res.end();
            });
        } else {
            const data = await response.json();
            res.json(data);
        }

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Salon-specific AI endpoint with system prompt
app.post('/api/salon-chat', async (req, res) => {
    try {
        const { message, history = [], context = '' } = req.body;

        const systemPrompt = `You are UNB AI ASSISTANT for Urban Nail Bar, built into Urban Nail Bar.
You are talking to the salon's STAFF (not customers). You help them with:
- Book / add / new appointments, walk-ins, cancel, reschedule, rebook, move (the app executes structured actions after yes/no confirm)
- Questions about appointments, clients, staff, revenue, services, inventory
- Nail care advice, service recommendations, and salon operations
- Training staff on booking flows (how to use Scheduler, walk-in button, Voice)

Be professional, friendly, and concise. Keep answers short (2-4 sentences) unless more detail is asked for.
Use HTML <strong> tags for emphasis since your replies render as HTML.
When staff want to change the schedule, prefer clear confirmation steps over vague suggestions.
Guide examples: "Book Jane with Maria at 2pm for Gel Manicure", "Walk-in Sam with Maria at 3pm for Pedicure", "Cancel Jane appointment", "Reschedule Jane to tomorrow at 2pm".
Current date: ${new Date().toLocaleDateString()}.
${context ? `\nLIVE SALON DATA (use this to answer accurately):\n${context}` : ''}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: message }
        ];

        const apiKey = process.env.MOONSHOT_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                error: 'MOONSHOT_API_KEY not configured',
                reply: null,
                fallback: true
            });
        }

        const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'kimi-k3',
                messages: messages,
                stream: false,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: errorData, fallback: true });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Salon chat error:', error);
        res.status(500).json({ error: error.message, fallback: true });
    }
});

// Customer-facing AI endpoint (public pages: website, booking)
// NOTE: only public-safe context (services, prices, hours) — never send internal data here
async function clientChatHandler(req, res) {
    try {
        const { message, history = [], context = '' } = req.body;

        const systemPrompt = `You are UNB AI ASSISTANT for Urban Nail Bar, a professional nail salon in Scottsdale.
You are talking to CUSTOMERS. Help them with:
- Booking on this page: pick service, party size, date, technician preference, time, then confirm (name + phone + SMS consent)
- Services, prices, and recommendations (manicures, pedicures, nail art, acrylics, gel, waxing, lashes)
- Salon hours, address, phone, policies, discounts/promos
- Walk-in vs online booking guidance; cancel/reschedule by calling the salon
- Nail care advice

Be warm, welcoming, and concise (2-3 sentences unless more detail is needed).
Never reveal internal operations data (staff status, revenue, internal schedules).
If asked about hair services, politely explain Urban Nail Bar is a nail-focused salon.
Never invent prices or hours that contradict SALON INFO.
Current date: ${new Date().toLocaleDateString()}.
${context ? `\nSALON INFO:\n${context}` : ''}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-20),
            { role: 'user', content: message }
        ];

        const apiKey = process.env.MOONSHOT_API_KEY;
        if (!apiKey) {
            return res.status(503).json({
                error: 'MOONSHOT_API_KEY not configured',
                reply: null,
                fallback: true
            });
        }

        const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'kimi-k3',
                messages: messages,
                stream: false,
                temperature: 0.7,
                max_tokens: 512
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            return res.status(response.status).json({ error: errorData, fallback: true });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Client chat error:', error);
        res.status(500).json({ error: error.message, fallback: true });
    }
}
app.post('/api/client-chat', clientChatHandler);

// ===== Shared salon data store (multi-device sync hub) =====
// Every page on the http(s) origin syncs through here, so the front-desk PC
// and phones running the My Schedule app all share ONE live dataset.
// The file lives in server/ which is blocked from static serving below.
const DATA_FILE = path.join(__dirname, 'data-store.json');

app.get('/api/salon-data', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) return res.status(404).json({ empty: true });
        res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/salon-data', (req, res) => {
    try {
        const { data, settings, savedAt } = req.body || {};
        if (!data || !savedAt) return res.status(400).json({ error: 'data and savedAt required' });
        // Keep the previous blob as .bak before overwriting (never lose data)
        if (fs.existsSync(DATA_FILE)) {
            try { fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak'); } catch (e) {}
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify({ data, settings, savedAt }));
        res.json({ ok: true, savedAt });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ===== LAN info (powers the Phone Setup QR code on the home page) =====
// Returns this PC's local network addresses so phones on the same Wi-Fi
// can reach the salon app without anyone typing an IP.
const os = require('os');
app.get('/api/lan-info', (req, res) => {
    const ips = [];
    Object.values(os.networkInterfaces()).forEach((list) => {
        (list || []).forEach((i) => {
            if ((i.family === 'IPv4' || i.family === 4) && !i.internal) ips.push(i.address);
        });
    });
    // Prefer typical home/shop LAN ranges first
    const rank = (ip) =>
        ip.startsWith('192.168.') ? 0 :
        ip.startsWith('10.') ? 1 :
        /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ? 2 : 3;
    ips.sort((a, b) => rank(a) - rank(b));
    res.json({ ips, port: PORT, publicPort: Number(process.env.PUBLIC_PORT || 3002) });
});

// ===== Static hosting for the salon app (needed for the My Schedule PWA) =====
// Serves the project root so pages work over http://localhost:3001 instead of file://
// Security: never serve the server/ folder (holds .env with the API key) or dotfiles.
const PROJECT_ROOT = path.join(__dirname, '..');

app.use((req, res, next) => {
    if (req.path.toLowerCase().startsWith('/server')) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
});
app.use(express.static(PROJECT_ROOT, { dotfiles: 'ignore', index: 'index.html' }));

// =====================================================================
//  PUBLIC APP (port 3002) — the ONLY part safe to expose on the internet
//  Serves just the public booking page + a public-safe API.
//  Never serves: staff pages, /api/salon-data, server files, or any data
//  beyond the menu, hours, and taken time slots.
// =====================================================================
const publicApp = express();
const PUBLIC_PORT = process.env.PUBLIC_PORT || 3002;
publicApp.use(cors());
publicApp.use(express.json({ limit: '1mb' }));

function readStore() {
    try {
        if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {}
    return null;
}

// Factory defaults extracted from shared/data-manager.js, so the public
// booking page works even before the shop's first sync (fresh PC, store
// not created yet). Re-read on every server start — never drifts.
const FACTORY = { data: {}, settings: {} };
try {
    const dmSrc = fs.readFileSync(path.join(PROJECT_ROOT, 'shared', 'data-manager.js'), 'utf8');
    const dataMatch = dmSrc.match(/const DEFAULT_SALON_DATA = (\{[\s\S]*?\n\});/);
    const setMatch = dmSrc.match(/const DEFAULT_SETTINGS = (\{[\s\S]*?\n\});/);
    if (dataMatch) FACTORY.data = eval('(' + dataMatch[1] + ')');
    if (setMatch) FACTORY.settings = eval('(' + setMatch[1] + ')');
} catch (e) {
    console.error('Factory defaults load failed:', e.message);
}

// The shared dataset, falling back to factory defaults when it doesn't
// exist yet or has no services (public page must never show an empty menu)
function normalizeStaffRole(role) {
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
}
function getStaffRoles(staff) {
    if (!staff) return [];
    const raw = [];
    if (Array.isArray(staff.roles)) raw.push(...staff.roles);
    else if (typeof staff.roles === 'string' && staff.roles.trim()) {
        raw.push(...staff.roles.split(/[,|/]/).map(x => x.trim()).filter(Boolean));
    }
    if (staff.role) raw.push(staff.role);
    return [...new Set(raw.map(normalizeStaffRole).filter(Boolean))];
}
function isTechnicianStaff(staff) {
    return getStaffRoles(staff).includes('technician');
}

function normalizeServiceCategory(cat) {
    const aliases = {
        'Pedicures': 'Pedicure',
        'Fix & Removal Only': 'Fix & Removal',
        'Fix and Removal': 'Fix & Removal',
        'Kids': 'Kid Menu',
        'Kid': 'Kid Menu',
        'Lashes Fix and removal': 'Lashes Fix and Removal',
        'Lashes / Fix & Removal': 'Lashes Fix and Removal',
        'Lash Fix and Removal': 'Lashes Fix and Removal',
        'Add Ons': 'Add-ons',
        'Addons': 'Add-ons',
        'Add-On': 'Add-ons',
        'Add-Ons': 'Add-ons'
    };
    const c = String(cat || 'Other').trim();
    return aliases[c] || c;
}

/** Expand legacy combined staff skill into menu categories. */
function expandStaffServiceCategories(cats) {
    const out = [];
    (cats || []).forEach(c => {
        const n = normalizeServiceCategory(c);
        if (n === 'Lashes Fix and Removal') out.push('Lashes', 'Fix & Removal');
        else if (n) out.push(n);
    });
    return [...new Set(out)];
}

function isAddonService(s) {
    if (!s) return false;
    if ((s.duration || 0) === 0) return true;
    return /^(add |soak off|extra tip|shape$)/i.test(String(s.name || ''));
}

// Parent categories for add-on rows previously migrated into a global Add-ons tab
const ADDON_PARENT_BY_ID = {
    11: 'Nail Enhancements', 12: 'Nail Enhancements', 13: 'Nail Enhancements',
    14: 'Nail Enhancements', 15: 'Nail Enhancements', 16: 'Nail Enhancements',
    17: 'Nail Enhancements', 18: 'Nail Enhancements', 19: 'Nail Enhancements',
    22: 'Dip Powder', 23: 'Dip Powder', 24: 'Dip Powder', 25: 'Dip Powder',
    26: 'Dip Powder', 27: 'Dip Powder', 28: 'Dip Powder', 29: 'Dip Powder',
    30: 'Dip Powder', 31: 'Dip Powder',
    34: 'Manicure', 37: 'Manicure', 38: 'Manicure', 39: 'Manicure',
    40: 'Manicure', 41: 'Manicure', 42: 'Manicure',
    43: 'Pedicure', 53: 'Pedicure', 54: 'Pedicure', 55: 'Pedicure',
    56: 'Pedicure', 57: 'Pedicure', 58: 'Pedicure', 59: 'Pedicure',
    60: 'Pedicure', 61: 'Pedicure', 64: 'Pedicure', 67: 'Pedicure', 68: 'Pedicure',
    104: 'Kid Menu', 105: 'Kid Menu',
    109: 'Kid Menu', 110: 'Kid Menu', 111: 'Kid Menu', 112: 'Kid Menu',
    113: 'Kid Menu', 114: 'Kid Menu', 115: 'Kid Menu', 116: 'Kid Menu',
    117: 'Kid Menu', 119: 'Kid Menu', 120: 'Kid Menu', 121: 'Kid Menu', 122: 'Kid Menu'
};

function healServicesIfNeeded(store) {
    if (!store || !store.data) return store;
    let svc = store.data.services || [];
    let changed = false;

    // Normalize legacy category labels in place (never wipes shop edits)
    svc = svc.map(s => {
        const norm = normalizeServiceCategory(s.category);
        if (norm !== s.category) { changed = true; return { ...s, category: norm }; }
        return s;
    });

    // Strip Combos category/services
    const beforeCombo = svc.length;
    svc = svc.filter(s => String(s.category || '').toLowerCase() !== 'combos' && s.id !== 132);
    if (svc.length !== beforeCombo) changed = true;

    // Restore global Add-ons rows back to parent categories
    const factorySvc = (FACTORY.data && FACTORY.data.services) || [];
    const parentFromFactory = {};
    factorySvc.forEach(f => {
        if (isAddonService(f)) parentFromFactory[f.id] = f.category;
    });
    svc = svc.map(s => {
        if (normalizeServiceCategory(s.category) !== 'Add-ons') return s;
        const parent = parentFromFactory[s.id] || ADDON_PARENT_BY_ID[s.id];
        if (!parent) return s;
        changed = true;
        return { ...s, category: parent };
    });

    // Honor shop deletes (Admin/Manager) — never resurrect factory ids that were removed
    const removed = new Set(
        ((((store.settings || {}).removedServiceIds) || []).map(Number))
    );
    if (removed.size) {
        const beforeTomb = svc.length;
        svc = svc.filter(s => !removed.has(Number(s.id)));
        if (svc.length !== beforeTomb) changed = true;
    }

    if (factorySvc.length) {
        const byId = new Map(svc.map(s => [s.id, s]));
        factorySvc.forEach(f => {
            // Do NOT re-insert missing factory services — shop deletes must stick.
            if (!byId.has(f.id)) return;
            const cur = byId.get(f.id);
            const norm = normalizeServiceCategory(cur.category);
            if (cur.category !== norm) { cur.category = norm; changed = true; }
            if (norm === 'Add-ons') {
                const parent = f.category || ADDON_PARENT_BY_ID[f.id];
                if (parent && parent !== 'Add-ons') {
                    cur.category = parent;
                    changed = true;
                }
            }
        });
        svc = Array.from(byId.values());
    }

    // Only full-replace when the menu is clearly an old demo/generic catalog
    const cats = new Set(svc.map(s => normalizeServiceCategory(s.category)));
    const looksLikeOldDemo = svc.length > 0 && svc.length <= 45 &&
        svc.some(s => s.name === 'Classic Manicure') && !cats.has('Nail Enhancements');
    if (looksLikeOldDemo && factorySvc.length >= 120) {
        store.data.services = JSON.parse(JSON.stringify(factorySvc));
        store.savedAt = Date.now();
        try { writeStore(store); } catch (e) {}
        console.log('🔧 Replaced old demo menu with factory catalog (' + factorySvc.length + ' items)');
        return store;
    }

    if (changed) {
        store.data.services = svc;
        store.savedAt = Date.now();
        try { writeStore(store); } catch (e) {}
        console.log('🔧 Normalized service menu (shop add/delete preserved)');
    }
    return store;
}

function readStoreOrFactory() {
    const store = readStore();
    if (store && store.data && Array.isArray(store.data.services) && store.data.services.length) {
        return healServicesIfNeeded(store);
    }
    return { data: FACTORY.data, settings: FACTORY.settings, savedAt: 0 };
}

function writeStore(store) {
    if (fs.existsSync(DATA_FILE)) {
        try { fs.copyFileSync(DATA_FILE, DATA_FILE + '.bak'); } catch (e) {}
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store));
}

// Defaults used when no shared dataset exists yet (mirrors shared/data-manager.js)
const PUBLIC_DEFAULT_SETTINGS = {
    salonName: 'Urban Nail Bar',
    salonAddress: '9290 East Vía de Ventura Ste 103, Scottsdale, AZ 85258',
    salonPhone: '(480) 291-5440',
    openTime: '09:30', closeTime: '18:30', interval: 15,
    minBookingNotice: 0, maxBookingAdvance: 30
};

// --- Public bootstrap: menu, hours, team (names only — NEVER pins/emails) ---
const PUBLIC_SETTING_KEYS = [
    'salonName', 'salonAddress', 'salonPhone', 'salonEmail', 'salonWebsite',
    'openTime', 'closeTime', 'sunOpenTime', 'sunCloseTime',
    'interval', 'defaultDuration', 'allowOnlineBooking',
    'minBookingNotice', 'maxBookingAdvance',
    'currency', 'timeFormat', 'dateFormat'
];
publicApp.get('/api/public/bootstrap', (req, res) => {
    const store = readStoreOrFactory();
    const merged = { ...PUBLIC_DEFAULT_SETTINGS, ...((store && store.settings) || {}) };
    const settings = {};
    PUBLIC_SETTING_KEYS.forEach(k => { if (merged[k] !== undefined) settings[k] = merged[k]; });
    const data = (store && store.data) || {};
    res.json({
        settings,
        services: (data.services || []).map(s => ({
            id: s.id, name: s.name, price: s.price, duration: s.duration,
            category: normalizeServiceCategory(s.category),
            description: s.description, priceNote: s.priceNote, popular: s.popular
        })),
        // Public booking + Meet the Team: technicians only (managers/admins hidden unless also techs)
        staff: (data.staff || [])
            .filter(s => {
                const st = String(s.status || 'active').toLowerCase();
                return st === 'active' && isTechnicianStaff(s);
            })
            .map(s => ({
                id: s.id,
                name: s.name,
                role: 'technician',
                roles: ['technician'],
                status: 'active',
                // Empty serviceCategories = can do all services
                serviceCategories: Array.isArray(s.serviceCategories) ? s.serviceCategories : [],
                specialties: Array.isArray(s.specialties) ? s.specialties : []
            }))
    });
});

// --- Public availability: taken slots for a date range (NO client info) ---
publicApp.get('/api/public/availability', (req, res) => {
    const store = readStoreOrFactory();
    const appts = ((store && store.data && store.data.appointments) || [])
        .filter(a => a.status !== 'cancelled' && a.status !== 'noshow')
        .map(a => ({ date: a.date, time: a.time, duration: a.duration || 30, staffId: a.staffId }));
    res.json({ taken: appts });
});

// --- Client accounts: phone + 4-digit PIN, like the salon's booking platform ---
// Clients must log in before booking. PINs are salted+hashed; sessions are
// HMAC-signed tokens (30 days). Credentials live only in data-store.json —
// never exposed by any public GET endpoint.
const crypto = require('crypto');

const SECRET_FILE = path.join(__dirname, '.auth-secret');
let AUTH_SECRET = '';
try {
    if (fs.existsSync(SECRET_FILE)) {
        AUTH_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    } else {
        AUTH_SECRET = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(SECRET_FILE, AUTH_SECRET, { mode: 0o600 });
    }
} catch (e) {
    AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-' + (process.env.PORT || 3001);
}

function hashPin(pin, salt) {
    return crypto.pbkdf2Sync(String(pin), salt, 10000, 32, 'sha256').toString('hex');
}

// base64url helpers — Node 14 (macOS Sierra) has no Buffer 'base64url' encoding
function b64urlEncode(buf) {
    return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function b64urlDecode(str) {
    const s = String(str || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    return Buffer.from(s + pad, 'base64');
}

function makeToken(clientId, phone) {
    const payload = b64urlEncode(JSON.stringify({ cid: clientId, ph: phone, exp: Date.now() + 30 * 24 * 3600 * 1000 }));
    const sig = b64urlEncode(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest());
    return payload + '.' + sig;
}

function verifyToken(req) {
    try {
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer ') ? h.slice(7) : (req.query.token || '');
        const [payload, sig] = String(token || '').split('.');
        if (!payload || !sig) return null;
        const expect = b64urlEncode(crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest());
        const a = Buffer.from(sig);
        const b = Buffer.from(expect);
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
        const data = JSON.parse(b64urlDecode(payload).toString('utf8'));
        if (!data.exp || data.exp < Date.now()) return null;
        return data; // { cid, ph, exp }
    } catch (e) {
        return null;
    }
}

function clientAuthMap(store) {
    store.data.clientAuth = store.data.clientAuth || {};
    return store.data.clientAuth;
}

const authRate = {}; // ip -> [timestamps]
function authThrottle(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    authRate[ip] = (authRate[ip] || []).filter(t => now - t < 600000);
    if (authRate[ip].length >= 15) {
        res.status(429).json({ error: 'Too many attempts — please wait a few minutes.' });
        return false;
    }
    authRate[ip].push(now);
    return true;
}

publicApp.post('/api/public/auth/signup', (req, res) => {
    try {
        if (!authThrottle(req, res)) return;
        const { firstName, lastName, phone, pin } = req.body || {};
        if (!firstName || !phone || !pin) return res.status(400).json({ error: 'Name, phone, and a 4-digit PIN are required.' });
        if (!/^\d{4,6}$/.test(String(pin))) return res.status(400).json({ error: 'PIN must be 4–6 digits.' });
        const clean = (s, n) => String(s || '').replace(/[<>&"']/g, '').trim().slice(0, n);
        const phoneClean = clean(phone, 20);

        const store = readStoreOrFactory();
        store.data.clients = store.data.clients || [];
        const auth = clientAuthMap(store);
        if (auth[phoneClean]) return res.status(409).json({ error: 'This phone already has an account — log in instead.' });

        let client = store.data.clients.find(c => c.phone === phoneClean);
        if (!client) {
            const newClientId = Math.max(0, ...store.data.clients.map(c => c.id || 0)) + 1;
            client = {
                id: newClientId, firstName: clean(firstName, 40), lastName: clean(lastName, 40),
                phone: phoneClean, email: '', createdAt: new Date().toISOString(),
                points: 0, totalVisits: 0, totalAmount: 0, totalAmountByYear: 0
            };
            store.data.clients.push(client);
        }
        const salt = crypto.randomBytes(8).toString('hex');
        auth[phoneClean] = { clientId: client.id, salt, pinHash: hashPin(pin, salt), createdAt: new Date().toISOString() };
        store.savedAt = Date.now();
        writeStore(store);
        console.log(`👤 Client account created: ${client.firstName} (${phoneClean.slice(0, 4)}…)`);
        res.json({ ok: true, token: makeToken(client.id, phoneClean), firstName: client.firstName });
    } catch (e) {
        console.error('Signup error:', e);
        res.status(500).json({ error: 'Could not create account — please try again.' });
    }
});

publicApp.post('/api/public/auth/login', (req, res) => {
    try {
        if (!authThrottle(req, res)) return;
        const { phone, pin } = req.body || {};
        const store = readStoreOrFactory();
        const auth = clientAuthMap(store);
        const rec = auth[String(phone || '').trim()];
        if (!rec || rec.pinHash !== hashPin(pin, rec.salt)) {
            return res.status(401).json({ error: 'Wrong phone number or PIN.' });
        }
        const client = (store.data.clients || []).find(c => c.id === rec.clientId);
        res.json({ ok: true, token: makeToken(rec.clientId, String(phone).trim()), firstName: client ? client.firstName : '' });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Login failed — please try again.' });
    }
});

// Phone-only sign-in: the phone number IS the account — no PIN, no password.
// Finds the client by phone digits (works for existing salon clients), or
// creates a new account on the spot when a first name is provided.
publicApp.post('/api/public/auth/phone', (req, res) => {
    try {
        if (!authThrottle(req, res)) return;
        const { firstName, lastName, phone } = req.body || {};
        const clean = (s, n) => String(s || '').replace(/[<>&"']/g, '').trim().slice(0, n);
        let digits = String(phone || '').replace(/\D/g, '');
        // US numbers: keep last 10 digits when country code 1 is included
        if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
        if (digits.length < 7 || digits.length > 15) {
            return res.status(400).json({ error: 'Enter a valid phone number.' });
        }

        const store = readStoreOrFactory();
        store.data.clients = store.data.clients || [];
        const auth = clientAuthMap(store);

        // Match by digits so "(480) 291-5440" and "4802915440" are the same person
        const phoneDigitsOf = (p) => {
            let d = String(p || '').replace(/\D/g, '');
            if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
            return d;
        };
        let client = store.data.clients.find(c => phoneDigitsOf(c.phone) === digits);
        if (!client) {
            if (!String(firstName || '').trim()) {
                return res.status(404).json({ needName: true, error: 'New here? Tell us your name.' });
            }
            const ids = store.data.clients.map(c => c.id || 0);
            const newClientId = (ids.length ? Math.max.apply(null, ids) : 0) + 1;
            client = {
                id: newClientId, firstName: clean(firstName, 40), lastName: clean(lastName, 40),
                phone: digits, email: '', createdAt: new Date().toISOString(),
                points: 0, totalVisits: 0, totalAmount: 0, totalAmountByYear: 0
            };
            store.data.clients.push(client);
        }
        // Keep auth keyed by digits; migrate any legacy formatted-phone keys
        if (!auth[digits]) {
            const legacyKey = Object.keys(auth).find(k => phoneDigitsOf(k) === digits);
            if (legacyKey && legacyKey !== digits) {
                auth[digits] = auth[legacyKey];
                delete auth[legacyKey];
            } else {
                auth[digits] = { clientId: client.id, salt: null, pinHash: null, createdAt: new Date().toISOString() };
            }
        } else if (auth[digits].clientId !== client.id) {
            auth[digits].clientId = client.id;
        }
        store.savedAt = Date.now();
        writeStore(store);
        console.log(`👤 Phone sign-in: ${client.firstName} (${digits.slice(0, 4)}…)`);
        res.json({ ok: true, token: makeToken(client.id, digits), firstName: client.firstName || 'there' });
    } catch (e) {
        console.error('Phone sign-in error:', e);
        res.status(500).json({ error: 'Could not sign in — please try again.' });
    }
});

// Client's own appointments (requires login token)
publicApp.get('/api/public/my-bookings', (req, res) => {
    const sess = verifyToken(req);
    if (!sess) return res.status(401).json({ error: 'Please log in.' });
    const store = readStoreOrFactory();
    const today = new Date().toISOString().split('T')[0];
    const mine = ((store && store.data && store.data.appointments) || [])
        .filter(a => a.clientId === sess.cid && a.date >= today && a.status !== 'cancelled')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .map(a => {
            const svc = (store.data.services || []).find(s => s.id === a.serviceId);
            const stf = (store.data.staff || []).find(s => s.id === a.staffId);
            return {
                id: a.id, date: a.date, time: a.time, duration: a.duration,
                serviceName: a.serviceName || (svc && svc.name) || 'Service',
                staffName: stf ? stf.name : 'First available',
                status: a.status,
                partySize: a.partySize || 1,
                guestNames: Array.isArray(a.guestNames) ? a.guestNames : []
            };
        });
    res.json({ bookings: mine });
});

// --- Public booking: requires a client login token (like the salon's platform) ---
// Rate-limited and validated. Writes into the same shared dataset the shop uses.
const bookRate = {}; // ip -> [timestamps]
publicApp.post('/api/public/book', (req, res) => {
    try {
        const sess = verifyToken(req);
        if (!sess) return res.status(401).json({ error: 'Please log in or create an account to book.' });

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        bookRate[ip] = (bookRate[ip] || []).filter(t => now - t < 3600000);
        if (bookRate[ip].length >= 10) {
            return res.status(429).json({ error: 'Too many bookings from this device — please call the salon.' });
        }

        const { serviceId, serviceIds, staffId, date, time, notes, partySize, guestNames, party: partyBody } = req.body || {};
        if ((!serviceId && !(Array.isArray(serviceIds) && serviceIds.length)) || !date || !time) {
            return res.status(400).json({ error: 'Missing required booking details.' });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({ error: 'Invalid date or time format.' });
        }
        const clean = (s, n) => String(s || '').replace(/[<>&"']/g, '').trim().slice(0, n);

        const store = readStoreOrFactory();
        store.data = store.data || {};
        store.data.clients = store.data.clients || [];
        store.data.appointments = store.data.appointments || [];
        store.data.services = store.data.services || [];
        store.data.staff = store.data.staff || [];

        // Identity comes from the login session — never from the request body
        const client = store.data.clients.find(c => c.id === sess.cid);
        if (!client) return res.status(401).json({ error: 'Account not found — please log in again.' });

        const ids = (Array.isArray(serviceIds) && serviceIds.length)
            ? serviceIds.map(Number)
            : [Number(serviceId)];
        const picked = ids.map(id => store.data.services.find(s => s.id === id)).filter(Boolean);
        if (!picked.length) return res.status(400).json({ error: 'Unknown service.' });
        const service = picked[0];
        const pickedById = (id) => store.data.services.find(s => Number(s.id) === Number(id));

        const toMin = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + m; };
        const fromMin = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        };
        const start = toMin(time);
        const conflictAt = (sid, startMin, dur) => store.data.appointments.some(a =>
            a.staffId === sid && a.date === date && a.status !== 'cancelled' &&
            startMin < toMin(a.time) + (a.duration || 30) && startMin + dur > toMin(a.time));
        const conflictDur = (sid, dur) => conflictAt(sid, start, dur);

        const staffCanDoList = (s, svcList) => {
            const cats = Array.isArray(s.serviceCategories) ? s.serviceCategories : [];
            if (!cats.length) return true;
            const allowed = expandStaffServiceCategories(cats);
            return svcList.every(svc => allowed.includes(normalizeServiceCategory(svc.category)));
        };

        const party = Math.min(6, Math.max(1, Number(partySize) || 1));
        const guests = Array.isArray(guestNames)
            ? guestNames.map(n => clean(n, 40)).filter(Boolean).slice(0, Math.max(0, party - 1))
            : [];
        const bookerBase = (client.firstName + ' ' + (client.lastName || '')).trim() || 'Client';
        // Seats 2+ → "Sean #2" (not "Guest 2")
        const partySeatName = (base, index0) => {
            const b = String(base || 'Client').trim() || 'Client';
            if (!index0 || index0 < 1) return b;
            return b + ' #' + (index0 + 1);
        };
        const resolveSeatName = (index0, explicit) => {
            const e = String(explicit || '').trim();
            if (e && !/^Guest\s*\d+$/i.test(e)) return clean(e, 40);
            return clean(partySeatName(bookerBase, index0), 40);
        };

        // Normalize per-guest party assignments (optional)
        let partyMembers = [];
        if (Array.isArray(partyBody) && partyBody.length) {
            partyMembers = partyBody.slice(0, party).map((p, idx) => {
                const svcIds = Array.isArray(p.serviceIds) && p.serviceIds.length
                    ? p.serviceIds.map(Number).filter(id => picked.some(s => Number(s.id) === id))
                    : ids.slice();
                const guestSvcs = svcIds.map(pickedById).filter(Boolean);
                const useSvcs = guestSvcs.length ? guestSvcs : picked;
                let prefStaff = (p.staffId === 'any' || p.staffId == null || p.staffId === '')
                    ? null : Number(p.staffId);
                if (prefStaff && Number.isNaN(prefStaff)) prefStaff = null;
                return {
                    name: idx === 0
                        ? bookerBase
                        : resolveSeatName(idx, p.name || guests[idx - 1] || ''),
                    staffId: prefStaff,
                    explicitStaff: prefStaff != null,
                    serviceIds: useSvcs.map(s => s.id),
                    services: useSvcs
                };
            });
            while (partyMembers.length < party) {
                const idx = partyMembers.length;
                partyMembers.push({
                    name: idx === 0
                        ? bookerBase
                        : resolveSeatName(idx, guests[idx - 1] || ''),
                    staffId: null,
                    explicitStaff: false,
                    serviceIds: ids.slice(),
                    services: picked
                });
            }
        } else {
            partyMembers = [{
                name: bookerBase,
                staffId: staffId ? Number(staffId) : null,
                explicitStaff: !!staffId,
                serviceIds: ids.slice(),
                services: picked
            }];
            for (let i = 1; i < party; i++) {
                partyMembers.push({
                    name: resolveSeatName(i, guests[i - 1] || ''),
                    staffId: staffId ? Number(staffId) : null,
                    explicitStaff: !!staffId,
                    serviceIds: ids.slice(),
                    services: picked
                });
            }
        }

        // Primary uses request staffId as fallback preferred tech
        if (!partyMembers[0].staffId && staffId) {
            partyMembers[0].staffId = Number(staffId);
            partyMembers[0].explicitStaff = true;
        }

        // Prefer distinct techs for party > 1; same explicit tech is kept (times stagger later)
        const wantLinked = party > 1;
        const claimed = new Set();
        const resolveForGuest = (member, preferDistinct) => {
            const svcList = member.services.length ? member.services : picked;
            const dur = Math.max(15, svcList.reduce((sum, s) => sum + (s.duration || 0), 0) || 30);
            const canDo = (s) => staffCanDoList(s, svcList);
            const active = store.data.staff.filter(s => s.status === 'active' && isTechnicianStaff(s) && canDo(s));
            let sid = member.staffId ? Number(member.staffId) : null;
            const explicit = !!member.explicitStaff && !!sid;
            if (sid) {
                const chosen = store.data.staff.find(s => s.id === sid);
                if (!chosen || !isTechnicianStaff(chosen) || !canDo(chosen)) {
                    sid = null;
                } else if (preferDistinct && claimed.has(sid)) {
                    // Keep explicit same-tech choice (stagger); otherwise try another tech
                    if (!explicit) sid = null;
                } else if (conflictDur(sid, dur)) {
                    sid = null;
                }
            }
            if (!sid) {
                const free = active.find(s => !conflictDur(s.id, dur) && !(preferDistinct && claimed.has(s.id)));
                if (free) {
                    sid = free.id;
                } else {
                    // Same start slot busy / no other tech: share a party tech (stagger on create)
                    const sharedFree = active.find(s => !conflictDur(s.id, dur));
                    const reuseClaimed = preferDistinct ? active.find(s => claimed.has(s.id)) : null;
                    const pick = sharedFree || reuseClaimed;
                    if (!pick) return null;
                    sid = pick.id;
                }
            }
            if (preferDistinct) claimed.add(sid);
            const stf = store.data.staff.find(s => s.id === sid);
            return {
                staffId: sid,
                staffName: stf ? stf.name : '',
                duration: dur,
                price: svcList.reduce((sum, s) => sum + (s.price || 0), 0),
                services: svcList
            };
        };

        const resolved = partyMembers.map(m => resolveForGuest(m, wantLinked));
        if (resolved.some(r => !r)) {
            return res.status(409).json({ error: 'That time was just taken — please pick another.' });
        }

        const partyPayload = partyMembers.map((m, i) => ({
            name: m.name,
            staffId: resolved[i].staffId,
            staffName: resolved[i].staffName,
            serviceIds: resolved[i].services.map(s => s.id)
        }));
        const guestNamesOut = partyPayload.slice(1).map(p => p.name).filter(Boolean);

        // Always one appointment block per guest when party > 1
        const useLinked = party > 1;
        let nextId = Math.max(0, ...store.data.appointments.map(a => a.id || 0)) + 1;
        const partyId = useLinked ? ('party_' + Date.now().toString(36) + '_' + nextId) : null;
        const created = [];

        if (useLinked) {
            const staffNextStart = {};
            for (let i = 0; i < partyMembers.length; i++) {
                const r = resolved[i];
                let startMin = start;
                if (staffNextStart[r.staffId] != null) startMin = staffNextStart[r.staffId];
                // Re-check after prior inserts in this batch (staggered when same staff)
                if (conflictAt(r.staffId, startMin, r.duration)) {
                    return res.status(409).json({ error: 'That time was just taken — please pick another.' });
                }
                const guestTime = fromMin(startMin);
                staffNextStart[r.staffId] = startMin + r.duration;
                const servicesPayload = r.services.map(s => ({
                    id: s.id, serviceId: s.id, name: s.name,
                    price: s.price || 0, duration: s.duration || 0,
                    staffId: r.staffId, staffName: r.staffName, guestIndex: i
                }));
                const appt = {
                    id: nextId++,
                    clientId: client.id,
                    clientName: i === 0
                        ? bookerBase
                        : resolveSeatName(i, partyMembers[i].name || ''),
                    staffId: r.staffId,
                    serviceId: r.services[0].id,
                    serviceName: r.services.map(s => s.name).join(' + '),
                    services: servicesPayload,
                    date,
                    time: guestTime,
                    duration: r.duration,
                    price: r.price,
                    partySize: party,
                    guestNames: guestNamesOut,
                    party: partyPayload,
                    partyId,
                    partyIndex: i,
                    status: 'booked',
                    source: 'online-account',
                    notes: clean(notes, 300),
                    createdAt: new Date().toISOString()
                };
                store.data.appointments.push(appt);
                created.push(appt);
            }
        } else {
            const primary = resolved[0];
            const duration = Math.max(15, picked.reduce((sum, s) => sum + (s.duration || 0), 0) || (service.duration || 30));
            const price = partyPayload.reduce((sum, m, i) => sum + (resolved[i] ? resolved[i].price : 0), 0)
                || picked.reduce((sum, s) => sum + (s.price || 0), 0);
            const servicesPayload = [];
            partyMembers.forEach((m, i) => {
                resolved[i].services.forEach(s => {
                    servicesPayload.push({
                        id: s.id, serviceId: s.id, name: s.name,
                        price: s.price || 0, duration: s.duration || 0,
                        staffId: resolved[i].staffId, staffName: resolved[i].staffName, guestIndex: i
                    });
                });
            });
            if (!servicesPayload.length) {
                picked.forEach(s => servicesPayload.push({
                    id: s.id, serviceId: s.id, name: s.name,
                    price: s.price || 0, duration: s.duration || 0,
                    staffId: primary.staffId, staffName: primary.staffName, guestIndex: 0
                }));
            }
            if (conflictDur(primary.staffId, duration)) {
                return res.status(409).json({ error: 'That time was just taken — please pick another.' });
            }
            const appointment = {
                id: nextId,
                clientId: client.id,
                clientName: (client.firstName + ' ' + (client.lastName || '')).trim(),
                staffId: primary.staffId,
                serviceId: service.id,
                serviceName: picked.map(s => s.name).join(' + '),
                services: servicesPayload,
                date, time,
                duration,
                price,
                partySize: party,
                guestNames: guestNamesOut,
                party: partyPayload,
                status: 'booked',
                source: 'online-account',
                notes: clean(notes, 300),
                createdAt: new Date().toISOString()
            };
            store.data.appointments.push(appointment);
            created.push(appointment);
        }

        store.savedAt = now;
        writeStore(store);

        bookRate[ip].push(now);
        const first = created[0];
        console.log(`📅 Public booking: ${first.clientName} — ${first.serviceName} ${date} ${time} (staff #${first.staffId}${party > 1 ? ', party ' + party : ''}${useLinked ? ', linked ' + created.length : ''})`);
        res.json({
            ok: true,
            appointment: { id: first.id, date, time, serviceName: first.serviceName, partySize: party, partyId: partyId || undefined },
            appointments: created.map(a => ({ id: a.id, staffId: a.staffId, time: a.time, partyIndex: a.partyIndex, clientName: a.clientName }))
        });
    } catch (e) {
        console.error('Public booking error:', e);
        res.status(500).json({ error: 'Booking failed — please call the salon.' });
    }
});

// Public AI assistant (same customer-safe endpoint as the main app)
publicApp.post('/api/client-chat', clientChatHandler);

// --- Client appointment confirmation (2-hour reminder link) ---
function findApptByConfirmToken(store, token) {
    if (!store || !store.data || !token) return null;
    return (store.data.appointments || []).find(a => a && a.confirmToken === token) || null;
}

publicApp.get('/api/public/confirm-info', (req, res) => {
    try {
        const token = String((req.query && req.query.token) || '').trim();
        if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
        const store = readStore();
        if (!store || !store.data) return res.status(404).json({ ok: false, error: 'Salon data not available yet' });
        const appt = findApptByConfirmToken(store, token);
        if (!appt) return res.status(404).json({ ok: false, error: 'Invalid or expired confirmation link' });
        if (appt.status === 'cancelled') return res.status(410).json({ ok: false, error: 'This appointment was cancelled' });
        res.json({
            ok: true,
            already: !!appt.clientConfirmed,
            clientName: appt.clientName || 'Client',
            date: appt.date || '',
            time: appt.time || ''
        });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

publicApp.post('/api/public/confirm', (req, res) => {
    try {
        const token = String((req.body && req.body.token) || '').trim();
        if (!token) return res.status(400).json({ ok: false, error: 'Missing token' });
        const store = readStore();
        if (!store || !store.data) return res.status(404).json({ ok: false, error: 'Salon data not available yet' });
        const appt = findApptByConfirmToken(store, token);
        if (!appt) return res.status(404).json({ ok: false, error: 'Invalid or expired confirmation link' });
        if (appt.status === 'cancelled') return res.status(410).json({ ok: false, error: 'This appointment was cancelled' });
        if (!appt.clientConfirmed) {
            appt.clientConfirmed = true;
            appt.clientConfirmedAt = new Date().toISOString();
            appt.reminders = appt.reminders || {};
            appt.reminders.confirmed = true;
            if (!store.data.notifications) store.data.notifications = [];
            store.data.notifications.push({
                id: Date.now(),
                type: 'booking',
                title: 'Client Confirmed',
                message: (appt.clientName || 'Client') + ' confirmed they are coming ? ' + (appt.date || '') + ' ' + (appt.time || ''),
                time : new Date().toLocaleTimeString(),
                read: false,
                createdAt: new Date().toISOString()
            });
            store.savedAt = Date.now();
            writeStore(store);
        }
        res.json({
            ok: true,
            appointment: { id: appt.id, clientName: appt.clientName, date: appt.date, time: appt.time }
        });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// --- Public static: ONLY the whitelist below, nothing else ---
const PAGES_DIR = path.join(PROJECT_ROOT, 'pages');
const PUBLIC_FILES = {
    '/': path.join(PAGES_DIR, 'public-booking.html'),
    '/booking.html': path.join(PAGES_DIR, 'public-booking.html'),
    '/index.html': path.join(PAGES_DIR, 'public-booking.html'),
    '/confirm.html': path.join(PAGES_DIR, 'confirm-appointment.html'),
    '/confirm-appointment.html': path.join(PAGES_DIR, 'confirm-appointment.html'),
    '/manifest.webmanifest': path.join(PAGES_DIR, 'manifest-public.webmanifest'),
    '/sw.js': path.join(PAGES_DIR, 'sw-public.js'),
    '/shared/styles.css': path.join(PROJECT_ROOT, 'shared', 'styles.css'),
    '/shared/legacy-compat.js': path.join(PROJECT_ROOT, 'shared', 'legacy-compat.js'),
    '/shared/utils.js': path.join(PROJECT_ROOT, 'shared', 'utils.js'),
    '/shared/site-content.js': path.join(PROJECT_ROOT, 'shared', 'site-content.js'),
    '/shared/app-nav.js': path.join(PROJECT_ROOT, 'shared', 'app-nav.js'),
    '/shared/unb-ai-assist.js': path.join(PROJECT_ROOT, 'shared', 'unb-ai-assist.js')
};
Object.entries(PUBLIC_FILES).forEach(([route, file]) => {
    publicApp.get(route, (req, res) => res.sendFile(file));
});
publicApp.use('/assets/pwa', express.static(path.join(PROJECT_ROOT, 'assets', 'pwa')));
publicApp.use('/assets/images', express.static(path.join(PROJECT_ROOT, 'assets', 'images'), { maxAge: '1d' }));
publicApp.use('/assets/gallery', express.static(path.join(PROJECT_ROOT, 'assets', 'gallery'), { maxAge: '1d' }));
publicApp.use('/assets/brand', express.static(path.join(PROJECT_ROOT, 'assets', 'brand'), { maxAge: '1d' }));
// Fallback: brand copies under gallery/brand (works even if /assets/brand mount is missing)
publicApp.get('/assets/brand/:file', (req, res, next) => {
    const safe = path.basename(req.params.file || '');
    const primary = path.join(PROJECT_ROOT, 'assets', 'brand', safe);
    const fallback = path.join(PROJECT_ROOT, 'assets', 'gallery', 'brand', safe);
    const flatFallback = path.join(PROJECT_ROOT, 'assets', 'gallery', 'brand-' + safe);
    if (fs.existsSync(primary)) return res.sendFile(primary);
    if (fs.existsSync(fallback)) return res.sendFile(fallback);
    if (fs.existsSync(flatFallback)) return res.sendFile(flatFallback);
    next();
});
// Fallback for images (logo/hero/gallery) when static mount is stale
publicApp.get('/assets/images/:file', (req, res, next) => {
    const safe = path.basename(req.params.file || '');
    const primary = path.join(PROJECT_ROOT, 'assets', 'images', safe);
    const galleryTwin = path.join(PROJECT_ROOT, 'assets', 'gallery', safe);
    if (fs.existsSync(primary)) return res.sendFile(primary);
    if (fs.existsSync(galleryTwin)) return res.sendFile(galleryTwin);
    next();
});
publicApp.use((req, res) => res.status(404).json({ error: 'Not found' }));

publicApp.listen(PUBLIC_PORT, () => {
    console.log(`🌍 Public booking app on http://localhost:${PUBLIC_PORT}  (safe to tunnel)`);
});

app.listen(PORT, () => {
    console.log(`✅ Kimi Proxy Server running on http://localhost:${PORT}`);
    console.log(`📡 Endpoints:`);
    console.log(`   POST /api/chat        - General Kimi API proxy`);
    console.log(`   POST /api/salon-chat  - UNB AI ASSISTANT (staff)`);
    console.log(`   POST /api/client-chat - UNB AI ASSISTANT (customers)`);
    console.log(`🌐 Salon app:`);
    console.log(`   http://localhost:${PORT}/index.html`);
    console.log(`   http://localhost:${PORT}/pages/staff.html  (staff members — schedule + tools)`);
});
