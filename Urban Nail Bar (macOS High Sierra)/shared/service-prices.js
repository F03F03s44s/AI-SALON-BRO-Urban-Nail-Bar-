/**
 * Urban Nail Bar — Service menu manager (Admin + Manager)
 * Add / edit / delete services and categories; edit prices; syncs via DataManager.
 */
(function (global) {
    'use strict';

    const ESC = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    function toast(msg, type) {
        if (typeof UI !== 'undefined' && UI.toast) UI.toast(msg, type || 'success');
        else if (typeof console !== 'undefined') console.log('[ServicePrices]', msg);
    }

    function allServices() {
        if (typeof DataManager === 'undefined' || !DataManager.getServices) return [];
        return DataManager.getServices() || [];
    }

    function normalizeCat(cat) {
        if (typeof Utils !== 'undefined' && Utils.normalizeCategory) return Utils.normalizeCategory(cat);
        return String(cat || 'Other').trim() || 'Other';
    }

    function customCategories() {
        try {
            const s = (typeof DataManager !== 'undefined' && DataManager.getSettings)
                ? DataManager.getSettings() : {};
            const list = (s && Array.isArray(s.customServiceCategories)) ? s.customServiceCategories : [];
            return list.map(normalizeCat).filter(Boolean);
        } catch (e) { return []; }
    }

    function saveCustomCategories(list) {
        if (typeof DataManager === 'undefined' || !DataManager.updateSettings) return;
        const cleaned = [...new Set((list || []).map(normalizeCat).filter(Boolean))];
        DataManager.updateSettings({ customServiceCategories: cleaned });
    }

    function knownCategories() {
        const fromServices = (typeof Utils !== 'undefined' && Utils.serviceCategories)
            ? Utils.serviceCategories(allServices())
            : [...new Set(allServices().map(s => normalizeCat(s.category)))];
        const custom = customCategories();
        const base = (typeof SERVICE_CATEGORY_ORDER !== 'undefined') ? SERVICE_CATEGORY_ORDER.slice() : ['General', 'Manicure', 'Pedicure', 'Nail Enhancements', 'Dip Powder', 'Waxing', 'Lashes', 'Fix & Removal', 'Kid Menu'];
        const seen = new Set();
        const out = [];
        base.concat(fromServices).concat(custom).forEach(c => {
            const n = normalizeCat(c);
            if (!n || n === 'Add-ons' || n === 'Combos' || seen.has(n)) return;
            seen.add(n);
            out.push(n);
        });
        return out;
    }

    function groupsFor(list) {
        if (typeof Utils !== 'undefined' && Utils.groupServicesByCategory) {
            return Utils.groupServicesByCategory(list, { includeHidden: true });
        }
        const map = {};
        (list || []).forEach(s => {
            const cat = normalizeCat(s && s.category);
            (map[cat] = map[cat] || []).push(s);
        });
        return Object.keys(map).sort().map(category => ({ category, services: map[category] }));
    }

    function isAddon(s) {
        if (typeof Utils !== 'undefined' && Utils.isServiceAddon) return Utils.isServiceAddon(s);
        return (s && (s.duration || 0) === 0) || false;
    }

    function parsePrice(raw) {
        const n = parseFloat(String(raw == null ? '' : raw).replace(/[^0-9.-]/g, ''));
        if (!isFinite(n) || n < 0) return null;
        return Math.round(n * 100) / 100;
    }

    function parseDuration(raw, asAddon) {
        if (asAddon) return 0;
        const n = parseInt(String(raw == null ? '' : raw).replace(/[^0-9]/g, ''), 10);
        if (!isFinite(n) || n < 0) return 30;
        return n;
    }

    function ensureModal() {
        let overlay = document.getElementById('svcMenuModal');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'svcMenuModal';
        overlay.innerHTML =
            '<div class="modal" style="max-width:520px;">'
            + '<div class="modal-header">'
            + '<span class="modal-title" id="svcMenuModalTitle"><i class="fas fa-plus"></i> Add Service</span>'
            + '<button type="button" class="modal-close" data-svc-modal-close><i class="fas fa-times"></i></button>'
            + '</div>'
            + '<div class="modal-body">'
            + '<input type="hidden" id="svcEditId">'
            + '<div class="form-group"><label class="form-label">Service name</label>'
            + '<input type="text" class="form-input" id="svcName" placeholder="e.g. Gel Manicure"></div>'
            + '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">'
            + '<div class="form-group"><label class="form-label">Category</label>'
            + '<select class="form-input" id="svcCategory"></select></div>'
            + '<div class="form-group"><label class="form-label">Or new category</label>'
            + '<input type="text" class="form-input" id="svcNewCategory" placeholder="Type to create…"></div>'
            + '</div>'
            + '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">'
            + '<div class="form-group"><label class="form-label">Price ($)</label>'
            + '<input type="number" class="form-input" id="svcPrice" min="0" step="0.01" value="0"></div>'
            + '<div class="form-group"><label class="form-label">Duration (min)</label>'
            + '<input type="number" class="form-input" id="svcDuration" min="0" step="5" value="30"></div>'
            + '<div class="form-group"><label class="form-label">Price note</label>'
            + '<input type="text" class="form-input" id="svcPriceNote" maxlength="4" placeholder="+"></div>'
            + '</div>'
            + '<label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.85rem; margin:4px 0 12px;">'
            + '<input type="checkbox" id="svcIsAddon"> This is an add-on (0 min)</label>'
            + '<div class="form-group"><label class="form-label">Description (optional)</label>'
            + '<textarea class="form-input" id="svcDescription" rows="2" placeholder="Shown on booking / website"></textarea></div>'
            + '</div>'
            + '<div class="modal-footer" style="display:flex; gap:8px; justify-content:flex-end;">'
            + '<button type="button" class="btn btn-secondary" data-svc-modal-close>Cancel</button>'
            + '<button type="button" class="btn btn-primary" id="svcMenuSaveBtn"><i class="fas fa-save"></i> Save Service</button>'
            + '</div></div>';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        overlay.querySelectorAll('[data-svc-modal-close]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });
        const addon = overlay.querySelector('#svcIsAddon');
        const dur = overlay.querySelector('#svcDuration');
        if (addon && dur) {
            addon.addEventListener('change', () => {
                if (addon.checked) { dur.value = '0'; dur.disabled = true; }
                else { dur.disabled = false; if (Number(dur.value) === 0) dur.value = '30'; }
            });
        }
        const saveBtn = overlay.querySelector('#svcMenuSaveBtn');
        if (saveBtn) saveBtn.addEventListener('click', commitServiceForm);
        return overlay;
    }

    function fillCategorySelect(selected) {
        const sel = document.getElementById('svcCategory');
        if (!sel) return;
        const cats = knownCategories();
        const cur = normalizeCat(selected || cats[0] || 'Other');
        if (cur && !cats.includes(cur)) cats.push(cur);
        sel.innerHTML = cats.map(c =>
            '<option value="' + ESC(c) + '"' + (c === cur ? ' selected' : '') + '>' + ESC(c) + '</option>'
        ).join('');
    }

    function openModal(mode, service) {
        ensureModal();
        const overlay = document.getElementById('svcMenuModal');
        const title = document.getElementById('svcMenuModalTitle');
        const idEl = document.getElementById('svcEditId');
        document.getElementById('svcName').value = service ? (service.name || '') : '';
        document.getElementById('svcPrice').value = service && service.price != null ? service.price : 0;
        document.getElementById('svcPriceNote').value = service ? (service.priceNote || '') : '';
        document.getElementById('svcDescription').value = service ? (service.description || '') : '';
        document.getElementById('svcNewCategory').value = '';
        const addon = document.getElementById('svcIsAddon');
        const dur = document.getElementById('svcDuration');
        const isAdd = service ? isAddon(service) : false;
        addon.checked = isAdd;
        dur.value = service ? String(service.duration || 0) : '30';
        dur.disabled = isAdd;
        idEl.value = service && service.id != null ? String(service.id) : '';
        fillCategorySelect(service ? service.category : null);
        if (title) {
            title.innerHTML = mode === 'edit' ? '<i class="fas fa-edit"></i> Edit Service' : '<i class="fas fa-plus"></i> Add Service';
        }
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const n = document.getElementById('svcName');
            if (n) n.focus();
        }, 50);
    }

    function closeModal() {
        const overlay = document.getElementById('svcMenuModal');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function commitServiceForm() {
        if (typeof DataManager === 'undefined') {
            toast('Data manager not ready', 'error');
            return;
        }
        const name = String(document.getElementById('svcName').value || '').trim();
        if (!name) { toast('Enter a service name', 'error'); return; }

        let category = String(document.getElementById('svcNewCategory').value || '').trim();
        if (!category) category = String(document.getElementById('svcCategory').value || '').trim();
        category = normalizeCat(category);
        if (!category) { toast('Choose or type a category', 'error'); return; }

        const price = parsePrice(document.getElementById('svcPrice').value);
        if (price === null) { toast('Enter a valid price', 'error'); return; }

        const asAddon = !!document.getElementById('svcIsAddon').checked;
        const duration = parseDuration(document.getElementById('svcDuration').value, asAddon);
        const priceNoteRaw = String(document.getElementById('svcPriceNote').value || '').trim();
        const priceNote = priceNoteRaw === '+' ? '+' : (priceNoteRaw || '');
        const description = String(document.getElementById('svcDescription').value || '').trim();

        // Remember brand-new categories so they show on every menu immediately
        if (typeof DataManager !== 'undefined' && DataManager.addServiceCategory) {
            DataManager.addServiceCategory(category);
        } else {
            const customs = customCategories();
            const base = (typeof SERVICE_CATEGORY_ORDER !== 'undefined') ? SERVICE_CATEGORY_ORDER : [];
            if (!base.includes(category) && !customs.includes(category)) {
                saveCustomCategories(customs.concat([category]));
            }
        }

        const editId = document.getElementById('svcEditId').value;
        const payload = { name, category, price, duration, priceNote, description };

        if (editId) {
            const updated = DataManager.updateService(Number(editId), payload);
            if (!updated) { toast('Service not found', 'error'); return; }
            toast('Service updated: ' + name, 'success');
        } else {
            const dup = allServices().find(s =>
                String(s.name || '').toLowerCase() === name.toLowerCase()
                && normalizeCat(s.category) === category
            );
            if (dup && !confirm('A service named "' + name + '" already exists in ' + category + '. Add another anyway?')) {
                return;
            }
            DataManager.addService(payload);
            toast('Service added: ' + name, 'success');
        }
        closeModal();
        refreshMounted();
    }

    function addCategoryFlow(container) {
        const name = prompt('New category name:');
        if (name == null) return;
        const cat = (typeof DataManager !== 'undefined' && DataManager.addServiceCategory) ? DataManager.addServiceCategory(name) : normalizeCat(name);
        if (!cat) { toast('Category name required', 'error'); return; }
        toast('Category ready: ' + cat + ' — add a service to it', 'success');
        openModal('add', { name: '', category: cat, price: 0, duration: 30, priceNote: '', description: '' });
        fillCategorySelect(cat);
        document.getElementById('svcNewCategory').value = '';
        const sel = document.getElementById('svcCategory');
        if (sel) sel.value = cat;
    }

    function renameCategoryFlow(oldName) {
        const from = normalizeCat(oldName);
        if (!from) return;
        const next = prompt('Rename category "' + from + '" to:', from);
        if (next == null) return;
        const to = normalizeCat(next);
        if (!to || to === from) return;

        const n = (typeof DataManager !== 'undefined' && DataManager.renameServiceCategory)
            ? DataManager.renameServiceCategory(from, to)
            : 0;

        // Update staff serviceCategories that referenced the old name
        try {
            const staff = DataManager.getStaff ? DataManager.getStaff() : [];
            (staff || []).forEach(st => {
                if (!Array.isArray(st.serviceCategories)) return;
                let changed = false;
                const mapped = st.serviceCategories.map(c => {
                    if (normalizeCat(c) === from) { changed = true; return to; }
                    return c;
                });
                if (changed && DataManager.updateStaff) {
                    DataManager.updateStaff(st.id, { serviceCategories: mapped, specialties: mapped.slice() });
                }
            });
        } catch (e) { /* ignore */ }

        toast(n ? ('Renamed ' + from + ' → ' + to + ' (' + n + ' services)') : ('Category saved as ' + to), 'success');
        refreshMounted();
    }

    function deleteCategoryFlow(catName) {
        const cat = normalizeCat(catName);
        const inCat = allServices().filter(s => normalizeCat(s.category) === cat);
        const msg = inCat.length
            ? 'Delete category "' + cat + '" and permanently remove its ' + inCat.length + ' service(s)? They will disappear from booking, website, and scheduler.'
            : 'Remove empty category "' + cat + '"?';
        if (!confirm(msg)) return;
        if (typeof DataManager !== 'undefined' && DataManager.deleteServiceCategory) {
            DataManager.deleteServiceCategory(cat);
        } else {
            inCat.forEach(s => DataManager.deleteService(s.id));
            saveCustomCategories(customCategories().filter(c => c !== cat));
        }
        toast('Category removed: ' + cat, 'success');
        refreshMounted();
    }

    function deleteServiceFlow(id) {
        const svc = allServices().find(s => String(s.id) === String(id));
        if (!svc) return;
        if (!confirm('Delete service "' + (svc.name || '') + '"? This cannot be undone.')) return;
        DataManager.deleteService(Number(id));
        toast('Service deleted', 'success');
        refreshMounted();
    }

    function rowEls(container, id) {
        const row = container.querySelector('[data-svc-price-row="' + id + '"]');
        if (!row) return null;
        return {
            row,
            price: row.querySelector('[data-field="price"]'),
            note: row.querySelector('[data-field="priceNote"]'),
            status: row.querySelector('[data-svc-status]')
        };
    }

    function setStatus(els, text, ok) {
        if (!els || !els.status) return;
        els.status.textContent = text || '';
        els.status.style.color = ok ? 'var(--success, #22c55e)' : 'var(--text-muted, #9ca3af)';
    }

    function saveOne(container, id, opts) {
        const silent = opts && opts.silent;
        const els = rowEls(container, id);
        if (!els || !els.price) return false;
        const price = parsePrice(els.price.value);
        if (price === null) {
            if (!silent) toast('Enter a valid price', 'error');
            setStatus(els, 'Invalid', false);
            return false;
        }
        const noteRaw = els.note ? String(els.note.value || '').trim() : '';
        const priceNote = noteRaw === '+' ? '+' : (noteRaw || '');
        const updated = DataManager.updateService(Number(id), { price, priceNote });
        if (!updated) {
            if (!silent) toast('Service not found', 'error');
            setStatus(els, 'Failed', false);
            return false;
        }
        els.price.value = String(updated.price);
        if (els.note) els.note.value = updated.priceNote || '';
        setStatus(els, 'Saved', true);
        if (!silent) toast('Price updated: ' + (updated.name || 'Service'), 'success');
        return true;
    }

    function saveAll(container) {
        const rows = container.querySelectorAll('[data-svc-price-row]');
        let n = 0;
        rows.forEach(row => {
            const id = row.getAttribute('data-svc-price-row');
            if (saveOne(container, id, { silent: true })) n++;
        });
        toast(n ? ('Saved ' + n + ' service price' + (n === 1 ? '' : 's')) : 'No prices saved', n ? 'success' : 'info');
        return n;
    }

    function bindRow(container, row) {
        const id = row.getAttribute('data-svc-price-row');
        const price = row.querySelector('[data-field="price"]');
        const note = row.querySelector('[data-field="priceNote"]');
        const btn = row.querySelector('[data-action="save"]');
        const editBtn = row.querySelector('[data-action="edit"]');
        const delBtn = row.querySelector('[data-action="delete"]');
        const onSave = () => saveOne(container, id);
        if (btn) btn.addEventListener('click', onSave);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const svc = allServices().find(s => String(s.id) === String(id));
                if (svc) openModal('edit', svc);
            });
        }
        if (delBtn) delBtn.addEventListener('click', () => deleteServiceFlow(id));
        [price, note].forEach(el => {
            if (!el) return;
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onSave();
                }
            });
            el.addEventListener('blur', () => {
                const svc = allServices().find(s => String(s.id) === String(id));
                if (!svc) return;
                const p = parsePrice(price && price.value);
                const noteVal = note ? String(note.value || '').trim() : '';
                const curNote = svc.priceNote || '';
                if (p !== null && (p !== Number(svc.price) || noteVal !== curNote)) onSave();
            });
        });
    }

    function renderList(container, filter) {
        const listEl = container.querySelector('[data-svc-price-list]');
        const countEl = container.querySelector('[data-svc-price-count]');
        if (!listEl) return;

        let services = allServices().slice();
        const q = String(filter || '').trim();
        if (q && typeof Utils !== 'undefined' && Utils.serviceMatchesQuery) {
            services = services.filter(s => Utils.serviceMatchesQuery(s, q));
        } else if (q) {
            const ql = q.toLowerCase();
            services = services.filter(s =>
                String(s.name || '').toLowerCase().includes(ql) ||
                String(s.category || '').toLowerCase().includes(ql)
            );
        }

        if (countEl) {
            const total = allServices().length;
            const cats = knownCategories().length;
            countEl.textContent = q
                ? (services.length + ' of ' + total + ' services')
                : (total + ' services · ' + cats + ' categories');
        }

        // Empty categories (custom, no services yet) still listed when not searching
        const groups = groupsFor(services);
        if (!q) {
            const present = new Set(groups.map(g => g.category));
            knownCategories().forEach(c => {
                if (!present.has(c)) groups.push({ category: c, services: [] });
            });
        }

        if (!services.length && !groups.length) {
            listEl.innerHTML = '<p style="color:var(--text-secondary); padding:16px 0;">No services yet. Click <strong>Add Service</strong> or <strong>Add Category</strong> to build your menu.</p>';
            return;
        }

        let html = '';
        groups.forEach(g => {
            html += '<div class="svc-price-cat" style="margin-bottom:18px;" data-svc-cat="' + ESC(g.category) + '">';
            html += '<div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin:4px 0 8px; padding-bottom:4px; border-bottom:1px solid var(--border-color);">'
                + '<div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:var(--primary); flex:1; min-width:140px;">'
                + ESC(g.category) + ' <span style="color:var(--text-muted); font-weight:600;">(' + g.services.length + ')</span></div>'
                + '<button type="button" class="btn btn-sm btn-secondary" data-action="add-in-cat" data-cat="' + ESC(g.category) + '"><i class="fas fa-plus"></i> Add</button>'
                + '<button type="button" class="btn btn-sm btn-secondary" data-action="rename-cat" data-cat="' + ESC(g.category) + '"><i class="fas fa-i-cursor"></i> Rename</button>'
                + '<button type="button" class="btn btn-sm btn-danger" data-action="delete-cat" data-cat="' + ESC(g.category) + '"><i class="fas fa-trash"></i></button>'
                + '</div>';

            if (!g.services.length) {
                html += '<p style="color:var(--text-secondary); font-size:0.85rem; padding:6px 0 10px;">No services in this category yet.</p></div>';
                return;
            }

            const mains = g.services.filter(s => !isAddon(s));
            const addons = g.services.filter(s => isAddon(s));
            const sections = (typeof Utils !== 'undefined' && Utils.servicesMenuSections)
                ? Utils.servicesMenuSections(mains)
                : [{ label: '', services: (typeof Utils !== 'undefined' && Utils.sortServicesForMenu) ? Utils.sortServicesForMenu(mains) : mains }];

            html += '<div style="overflow-x:auto;"><table class="data-table" style="width:100%;"><thead><tr>'
                + '<th>Service</th><th style="width:90px;">Duration</th><th style="width:120px;">Price ($)</th>'
                + '<th style="width:72px;">Note</th><th style="width:200px;">Actions</th></tr></thead><tbody>';

            const renderSvcRow = (s) => {
                const addon = isAddon(s);
                const dur = (s.duration || 0) === 0 ? 'Add-on' : ((s.duration || 0) + ' min');
                return '<tr data-svc-price-row="' + ESC(s.id) + '"'
                    + (addon ? ' style="background:rgba(251,191,36,0.04);"' : '') + '>'
                    + '<td><strong style="color:#ffe566;">' + ESC((typeof Utils !== 'undefined' && Utils.serviceDisplayName) ? Utils.serviceDisplayName(s) : s.name) + '</strong>'
                    + (addon ? ' <span style="font-size:0.65rem; color:var(--primary); font-weight:700; text-transform:uppercase;">Add-on</span>' : '')
                    + '</td>'
                    + '<td style="color:#fff; font-size:0.85rem;"><span style="display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border:1px solid #ffe566;border-radius:999px;font-size:0.72rem;font-weight:700;white-space:nowrap;line-height:1.2;">' + ESC(dur) + '</span></td>'
                    + '<td><input type="number" class="form-input" data-field="price" step="0.01" min="0" value="'
                    + ESC(s.price != null ? s.price : 0) + '" style="width:100%; max-width:110px; font-weight:700;"></td>'
                    + '<td><input type="text" class="form-input" data-field="priceNote" maxlength="4" placeholder="+" value="'
                    + ESC(s.priceNote || '') + '" title="Optional price note (e.g. +)" style="width:100%; max-width:64px; text-align:center;"></td>'
                    + '<td style="white-space:nowrap;">'
                    + '<button type="button" class="btn btn-sm btn-primary" data-action="save" title="Save price"><i class="fas fa-save"></i></button> '
                    + '<button type="button" class="btn btn-sm btn-secondary" data-action="edit" title="Edit service"><i class="fas fa-edit"></i></button> '
                    + '<button type="button" class="btn btn-sm btn-danger" data-action="delete" title="Delete service"><i class="fas fa-trash"></i></button> '
                    + '<span data-svc-status style="font-size:0.7rem; margin-left:4px;"></span></td>'
                    + '</tr>';
            };

            sections.forEach(sec => {
                if (sec.label) {
                    html += '<tr class="svc-family-row"><td colspan="5" style="padding:10px 8px 4px; font-size:0.68rem; font-weight:900; letter-spacing:0.5px; text-transform:uppercase; color:#ffffff; background:linear-gradient(90deg, rgba(255,255,255,0.06), transparent 70%); border-top:1px solid rgba(255,255,255,0.18);">'
                        + ESC(sec.label) + '</td></tr>';
                }
                (sec.services || []).forEach(s => { html += renderSvcRow(s); });
            });
            if (addons.length) {
                html += '<tr class="svc-family-row"><td colspan="5" style="padding:10px 8px 4px; font-size:0.68rem; font-weight:900; letter-spacing:0.5px; text-transform:uppercase; color:#9ca3af; border-top:1px solid #333;">Add-ons</td></tr>';
                ((typeof Utils !== 'undefined' && Utils.sortServicesForMenu) ? Utils.sortServicesForMenu(addons) : addons)
                    .forEach(s => { html += renderSvcRow(s); });
            }

            html += '</tbody></table></div></div>';
        });

        listEl.innerHTML = html;
        listEl.querySelectorAll('[data-svc-price-row]').forEach(row => bindRow(container, row));
        listEl.querySelectorAll('[data-action="add-in-cat"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-cat');
                openModal('add', { name: '', category: cat, price: 0, duration: 30 });
            });
        });
        listEl.querySelectorAll('[data-action="rename-cat"]').forEach(btn => {
            btn.addEventListener('click', () => renameCategoryFlow(btn.getAttribute('data-cat')));
        });
        listEl.querySelectorAll('[data-action="delete-cat"]').forEach(btn => {
            btn.addEventListener('click', () => deleteCategoryFlow(btn.getAttribute('data-cat')));
        });
    }

    const mounted = new Set();

    function refreshMounted() {
        mounted.forEach(idOrEl => {
            const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
            if (!el) return;
            const searchEl = el.querySelector('[data-svc-price-search]');
            renderList(el, searchEl ? searchEl.value : '');
        });
    }

    function mount(containerOrId) {
        const container = typeof containerOrId === 'string'
            ? document.getElementById(containerOrId)
            : containerOrId;
        if (!container) return null;

        ensureModal();

        if (!container.getAttribute('data-svc-prices-ready')) {
            container.setAttribute('data-svc-prices-ready', '1');
            container.innerHTML =
                '<div class="card">'
                + '<div class="card-header" style="flex-wrap:wrap; gap:10px;">'
                + '<div>'
                + '<div class="card-title"><i class="fas fa-tags"></i> Services &amp; Categories</div>'
                + '<div class="card-subtitle">Add categories and services, edit prices, rename or delete. Changes sync to booking, website, and scheduler.</div>'
                + '</div>'
                + '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">'
                + '<button type="button" class="btn btn-primary" data-action="add-service"><i class="fas fa-plus"></i> Add Service</button>'
                + '<button type="button" class="btn btn-secondary" data-action="add-category"><i class="fas fa-folder-plus"></i> Add Category</button>'
                + '<button type="button" class="btn btn-primary" data-action="save-all"><i class="fas fa-save"></i> Save All Prices</button>'
                + '<button type="button" class="btn btn-secondary" data-action="reload"><i class="fas fa-sync"></i> Reload</button>'
                + '</div></div>'
                + '<div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin:12px 0;">'
                + '<input type="search" class="form-input" data-svc-price-search placeholder="Search services by name or category..." style="flex:1; min-width:220px;">'
                + '<span data-svc-price-count style="font-size:0.75rem; color:var(--text-secondary);"></span>'
                + '</div>'
                + '<div data-svc-price-list></div>'
                + '</div>';

            const search = container.querySelector('[data-svc-price-search]');
            if (search) {
                let t = null;
                search.addEventListener('input', () => {
                    clearTimeout(t);
                    t = setTimeout(() => renderList(container, search.value), 120);
                });
            }
            const addSvc = container.querySelector('[data-action="add-service"]');
            if (addSvc) addSvc.addEventListener('click', () => openModal('add'));
            const addCat = container.querySelector('[data-action="add-category"]');
            if (addCat) addCat.addEventListener('click', () => addCategoryFlow(container));
            const saveAllBtn = container.querySelector('[data-action="save-all"]');
            if (saveAllBtn) saveAllBtn.addEventListener('click', () => saveAll(container));
            const reloadBtn = container.querySelector('[data-action="reload"]');
            if (reloadBtn) {
                reloadBtn.addEventListener('click', () => {
                    if (typeof DataManager !== 'undefined' && DataManager.refresh) {
                        try { DataManager.refresh(); } catch (e) { /* ignore */ }
                    }
                    const q = search ? search.value : '';
                    renderList(container, q);
                    toast('Menu reloaded', 'info');
                });
            }
        }

        const key = container.id || container;
        mounted.add(key);

        const searchEl = container.querySelector('[data-svc-price-search]');
        renderList(container, searchEl ? searchEl.value : '');
        return {
            refresh() {
                const q = searchEl ? searchEl.value : '';
                renderList(container, q);
            },
            saveAll() { return saveAll(container); },
            openAdd() { openModal('add'); },
            openAddCategory() { addCategoryFlow(container); }
        };
    }

    global.ServicePrices = {
        mount,
        render: mount,
        saveOne,
        saveAll,
        refreshAll: refreshMounted,
        knownCategories
    };
})(typeof window !== 'undefined' ? window : this);
