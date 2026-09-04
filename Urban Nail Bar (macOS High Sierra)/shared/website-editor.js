/**
 * Urban Nail Bar — Website & Home content editor
 * Mounted from Admin → Website & Home. Edits SiteContent (localStorage)
 * and can upload images via POST /api/upload-image.
 */
(function (global) {
    'use strict';

    const SECTIONS = [
        { id: 'home', label: 'Salon Home', icon: 'fa-home' },
        { id: 'hero', label: 'Website Hero', icon: 'fa-image' },
        { id: 'about', label: 'About', icon: 'fa-info-circle' },
        { id: 'promos', label: 'Promos', icon: 'fa-tags' },
        { id: 'pictures', label: 'Pictures', icon: 'fa-camera' },
        { id: 'contact', label: 'Contact', icon: 'fa-map-marker-alt' },
        { id: 'reviews', label: 'Reviews', icon: 'fa-star' }
    ];

    let rootEl = null;
    let activeSection = 'home';
    let draft = null;
    let dirty = false;

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function content() {
        return (global.SiteContent && SiteContent.get()) || {};
    }

    function ensureDraft() {
        if (!draft) draft = JSON.parse(JSON.stringify(content()));
        return draft;
    }

    function markDirty() {
        dirty = true;
        const badge = rootEl && rootEl.querySelector('[data-dirty-badge]');
        if (badge) badge.style.display = '';
    }

    function clearDirty() {
        dirty = false;
        const badge = rootEl && rootEl.querySelector('[data-dirty-badge]');
        if (badge) badge.style.display = 'none';
    }

    function field(label, key, opts) {
        opts = opts || {};
        const type = opts.type || 'text';
        const val = ensureDraft()[key];
        const rows = opts.rows || 3;
        const hint = opts.hint ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;">${esc(opts.hint)}</div>` : '';
        if (type === 'textarea') {
            return `<div class="form-group">
                <label class="form-label">${esc(label)}</label>
                <textarea class="form-input" data-field="${esc(key)}" rows="${rows}" style="resize:vertical;min-height:${rows * 22}px;">${esc(val || '')}</textarea>
                ${hint}
            </div>`;
        }
        return `<div class="form-group">
            <label class="form-label">${esc(label)}</label>
            <input type="${esc(type)}" class="form-input" data-field="${esc(key)}" value="${esc(val || '')}">
            ${hint}
        </div>`;
    }

    function renderNav() {
        return SECTIONS.map((s) => `
            <button type="button" class="btn ${activeSection === s.id ? 'btn-primary' : 'btn-secondary'}"
                data-section="${s.id}" style="font-size:0.78rem;">
                <i class="fas ${s.icon}"></i> ${s.label}
            </button>
        `).join('');
    }

    function renderHome() {
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-home"></i> Salon Home Screen</div>
                <div class="card-subtitle" style="margin-bottom:14px;">Shown on the staff home page (index.html)</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    ${field('Salon name', 'salonName')}
                    ${field('Home tagline', 'homeTagline')}
                    ${field('Clients section label', 'homeClientsLabel')}
                    ${field('Staff section label', 'homeStaffLabel')}
                    ${field('Phone', 'salonPhone')}
                    ${field('Address', 'salonAddress')}
                </div>
            </div>`;
    }

    function renderHero() {
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-image"></i> Website Hero &amp; Branding</div>
                <div class="card-subtitle" style="margin-bottom:14px;">Public website hero, logo, and jingle</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    ${field('Jingle', 'siteJingle')}
                    ${field('Jingle sub-line', 'siteJingleSub')}
                    ${field('Hero title', 'siteHeroTitle')}
                    ${field('Tagline', 'siteTagline')}
                </div>
                ${field('Hero subtitle', 'siteHeroSubtitle', { type: 'textarea', rows: 3 })}
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px;">
                    ${imageUrlField('Logo image', 'siteLogo')}
                    ${imageUrlField('Hero background image', 'siteHeroImage')}
                </div>
                ${field('Footer copyright', 'siteFooterCopyright')}
                ${field('Services intro', 'siteServicesIntro', { type: 'textarea', rows: 3 })}
            </div>`;
    }

    function renderAbout() {
        const why = Array.isArray(ensureDraft().siteWhyChooseUs) ? ensureDraft().siteWhyChooseUs : [];
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-info-circle"></i> About Section</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    ${field('About title', 'siteAboutTitle')}
                    ${field('About lead', 'siteAboutLead')}
                </div>
                ${field('About body', 'siteAboutBody', { type: 'textarea', rows: 4 })}
                ${field('About story', 'siteAboutStory', { type: 'textarea', rows: 4 })}
                <div class="form-group">
                    <label class="form-label">Why choose us (one point per line)</label>
                    <textarea class="form-input" data-list-field="siteWhyChooseUs" rows="5" style="resize:vertical;">${esc(why.join('\n'))}</textarea>
                </div>
            </div>`;
    }

    function renderPromos() {
        const ads = Array.isArray(ensureDraft().discountAds) ? ensureDraft().discountAds : [];
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-tags"></i> Announcement &amp; Discounts</div>
                ${field('Promo banner', 'siteAnnouncement', { hint: 'Scrolling/top promo line above the discount cards' })}
                <div style="margin-top:12px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <label class="form-label" style="margin:0;">Discount cards</label>
                        <button type="button" class="btn btn-sm btn-secondary" data-add-ad><i class="fas fa-plus"></i> Add</button>
                    </div>
                    <div data-ads-list style="display:flex;flex-direction:column;gap:10px;">
                        ${ads.map((ad, i) => `
                            <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:8px;align-items:end;padding:10px;border:1px solid var(--border-color);border-radius:8px;" data-ad-row="${i}">
                                <div class="form-group" style="margin:0;">
                                    <label class="form-label">Title</label>
                                    <input class="form-input" data-ad-title value="${esc(ad.title || '')}">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label class="form-label">Text</label>
                                    <input class="form-input" data-ad-text value="${esc(ad.text || '')}">
                                </div>
                                <button type="button" class="btn btn-sm btn-danger" data-remove-ad="${i}" title="Remove"><i class="fas fa-trash"></i></button>
                            </div>
                        `).join('') || '<p style="color:var(--text-secondary);font-size:0.85rem;">No discount cards yet.</p>'}
                    </div>
                </div>
            </div>`;
    }

    function imageUrlField(label, key) {
        const val = ensureDraft()[key] || '';
        return `<div class="form-group">
            <label class="form-label">${esc(label)}</label>
            <div style="display:flex;gap:8px;align-items:center;">
                <input type="text" class="form-input" data-field="${esc(key)}" value="${esc(val)}" style="flex:1;">
                <label class="btn btn-sm btn-secondary" style="margin:0;cursor:pointer;">
                    <i class="fas fa-upload"></i> Upload
                    <input type="file" accept="image/*" data-upload-for="${esc(key)}" style="display:none;">
                </label>
            </div>
            ${val ? `<img src="${esc(val)}" alt="" style="margin-top:8px;max-height:72px;border-radius:8px;border:1px solid var(--border-color);background:#111;" onerror="this.style.display='none'">` : ''}
        </div>`;
    }

    function galleryEditor(title, key) {
        const list = Array.isArray(ensureDraft()[key]) ? ensureDraft()[key] : [];
        return `
            <div class="card" style="margin-top:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;">
                    <div>
                        <div class="card-title" style="margin:0;"><i class="fas fa-images"></i> ${esc(title)}</div>
                        <div class="card-subtitle">URL + caption · upload replaces the image path</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-secondary" data-add-gallery="${esc(key)}"><i class="fas fa-plus"></i> Add photo</button>
                </div>
                <div data-gallery="${esc(key)}" style="display:flex;flex-direction:column;gap:10px;">
                    ${list.map((item, i) => `
                        <div style="display:grid;grid-template-columns:84px 1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid var(--border-color);border-radius:8px;" data-gallery-row="${i}">
                            <div style="width:84px;height:64px;border-radius:6px;overflow:hidden;background:#111;border:1px solid var(--border-color);">
                                <img src="${esc(item.url || '')}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.opacity=0.2">
                            </div>
                            <div style="display:grid;gap:6px;">
                                <input class="form-input" data-g-url placeholder="Image URL (../assets/images/...)" value="${esc(item.url || '')}">
                                <input class="form-input" data-g-caption placeholder="Caption" value="${esc(item.caption || '')}">
                                <label class="btn btn-sm btn-secondary" style="width:fit-content;cursor:pointer;margin:0;">
                                    <i class="fas fa-upload"></i> Replace photo
                                    <input type="file" accept="image/*" data-gallery-upload="${esc(key)}" data-gallery-index="${i}" style="display:none;">
                                </label>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:4px;">
                                <button type="button" class="btn btn-sm btn-secondary" data-g-up="${esc(key)}" data-i="${i}" title="Move up"><i class="fas fa-arrow-up"></i></button>
                                <button type="button" class="btn btn-sm btn-secondary" data-g-down="${esc(key)}" data-i="${i}" title="Move down"><i class="fas fa-arrow-down"></i></button>
                                <button type="button" class="btn btn-sm btn-danger" data-g-remove="${esc(key)}" data-i="${i}" title="Remove"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('') || '<p style="color:var(--text-secondary);font-size:0.85rem;">No photos yet — click Add photo.</p>'}
                </div>
            </div>`;
    }

    function renderPictures() {
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-camera"></i> Pictures &amp; Galleries</div>
                <div class="card-subtitle" style="margin-bottom:8px;">
                    Edit salon interiors and nail-work photos. Upload writes into <code>assets/images</code> (and mirrors to gallery).
                    <button type="button" class="btn btn-sm btn-secondary" data-refresh-library style="margin-left:8px;"><i class="fas fa-folder-open"></i> Browse library</button>
                </div>
                <div data-image-library style="display:none;margin-top:10px;padding:10px;border:1px solid var(--border-color);border-radius:8px;max-height:180px;overflow:auto;"></div>
            </div>
            ${galleryEditor('Inside the salon', 'siteSalonGallery')}
            <div class="card" style="margin-top:14px;">
                <div class="card-title"><i class="fas fa-quote-left"></i> Our Salon Section Copy</div>
                ${field('Section title', 'siteSalonSectionTitle')}
                ${field('Family line', 'siteSalonFamily')}
                ${field('Welcome message', 'siteSalonWelcome', { type: 'textarea', rows: 3 })}
                ${field('Subhead', 'siteSalonSubhead')}
                ${field('Subnote', 'siteSalonSubnote')}
            </div>
            ${galleryEditor('Nail work gallery', 'siteWorkGallery')}
        `;
    }

    function renderContact() {
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-map-marker-alt"></i> Contact &amp; Hours</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    ${field('Contact title', 'siteContactTitle')}
                    ${field('Contact subtitle', 'siteContactSubtitle')}
                    ${field('Phone (website)', 'sitePhone')}
                    ${field('Email (optional)', 'siteEmail')}
                    ${field('Weekday hours label', 'siteHoursWeekdayLabel')}
                    ${field('Weekday hours', 'siteHoursWeekday')}
                    ${field('Sunday hours label', 'siteHoursSundayLabel')}
                    ${field('Sunday hours', 'siteHoursSunday')}
                    ${field('Open time (Mon–Sat)', 'openTime', { type: 'time' })}
                    ${field('Close time (Mon–Sat)', 'closeTime', { type: 'time' })}
                </div>
                ${field('Map link', 'siteMapUrl')}
                ${field('Directions link', 'siteDirectionsUrl')}
                ${field('Map embed URL', 'siteMapEmbedUrl', { type: 'textarea', rows: 2 })}
                ${field('CTA title', 'siteContactCtaTitle')}
                ${field('CTA body', 'siteContactCtaBody', { type: 'textarea', rows: 3 })}
                ${field('CTA button text', 'siteContactCtaBtn')}
            </div>`;
    }

    function renderReviews() {
        const list = Array.isArray(ensureDraft().siteTestimonials) ? ensureDraft().siteTestimonials : [];
        return `
            <div class="card">
                <div class="card-title"><i class="fas fa-star"></i> Reviews &amp; Testimonials</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    ${field('Rating', 'siteRating', { type: 'number' })}
                    ${field('Review count', 'siteReviewCount', { type: 'number' })}
                </div>
                <div style="margin-top:12px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                        <label class="form-label" style="margin:0;">Testimonials</label>
                        <button type="button" class="btn btn-sm btn-secondary" data-add-testimonial><i class="fas fa-plus"></i> Add</button>
                    </div>
                    <div data-testimonials style="display:flex;flex-direction:column;gap:10px;">
                        ${list.map((t, i) => `
                            <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;padding:10px;border:1px solid var(--border-color);border-radius:8px;" data-t-row="${i}">
                                <input class="form-input" data-t-name placeholder="Name" value="${esc(t.name || '')}">
                                <input class="form-input" data-t-date placeholder="Date" value="${esc(t.date || '')}">
                                <button type="button" class="btn btn-sm btn-danger" data-remove-testimonial="${i}"><i class="fas fa-trash"></i></button>
                                <textarea class="form-input" data-t-text rows="2" style="grid-column:1 / -1;resize:vertical;">${esc(t.text || '')}</textarea>
                            </div>
                        `).join('') || '<p style="color:var(--text-secondary);font-size:0.85rem;">No testimonials yet.</p>'}
                    </div>
                </div>
            </div>`;
    }

    function renderSectionBody() {
        switch (activeSection) {
            case 'home': return renderHome();
            case 'hero': return renderHero();
            case 'about': return renderAbout();
            case 'promos': return renderPromos();
            case 'pictures': return renderPictures();
            case 'contact': return renderContact();
            case 'reviews': return renderReviews();
            default: return '';
        }
    }

    function collectFromDom() {
        const d = ensureDraft();
        rootEl.querySelectorAll('[data-field]').forEach((el) => {
            const key = el.getAttribute('data-field');
            if (!key) return;
            if (el.type === 'number') {
                const n = parseFloat(el.value);
                d[key] = Number.isFinite(n) ? n : el.value;
            } else {
                d[key] = el.value;
            }
        });
        rootEl.querySelectorAll('[data-list-field]').forEach((el) => {
            const key = el.getAttribute('data-list-field');
            d[key] = String(el.value || '').split('\n').map((s) => s.trim()).filter(Boolean);
        });

        // Galleries
        ['siteSalonGallery', 'siteWorkGallery'].forEach((key) => {
            const box = rootEl.querySelector(`[data-gallery="${key}"]`);
            if (!box) return;
            const rows = [];
            box.querySelectorAll('[data-gallery-row]').forEach((row) => {
                rows.push({
                    url: (row.querySelector('[data-g-url]') || {}).value || '',
                    caption: (row.querySelector('[data-g-caption]') || {}).value || ''
                });
            });
            d[key] = rows;
        });

        // Discount ads
        const adsBox = rootEl.querySelector('[data-ads-list]');
        if (adsBox) {
            const ads = [];
            adsBox.querySelectorAll('[data-ad-row]').forEach((row) => {
                ads.push({
                    title: (row.querySelector('[data-ad-title]') || {}).value || '',
                    text: (row.querySelector('[data-ad-text]') || {}).value || '',
                    icon: 'fa-tags'
                });
            });
            d.discountAds = ads;
        }

        // Testimonials
        const tBox = rootEl.querySelector('[data-testimonials]');
        if (tBox) {
            const list = [];
            tBox.querySelectorAll('[data-t-row]').forEach((row) => {
                list.push({
                    name: (row.querySelector('[data-t-name]') || {}).value || '',
                    date: (row.querySelector('[data-t-date]') || {}).value || '',
                    text: (row.querySelector('[data-t-text]') || {}).value || ''
                });
            });
            d.siteTestimonials = list;
        }

        d.siteGallery = (d.siteSalonGallery || []).concat(d.siteWorkGallery || []);
        return d;
    }

    function paint() {
        if (!rootEl) return;
        rootEl.innerHTML = `
            <div class="card" style="margin-bottom:14px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
                    <div>
                        <div class="card-title" style="margin:0;"><i class="fas fa-globe"></i> Website &amp; Home Editor</div>
                        <div class="card-subtitle">
                            Edit salon home copy, website text, pictures, hours, and map. Save applies live on open website/booking tabs.
                            <br><strong style="color:var(--primary);">How to open:</strong> Admin PIN → Admin → <strong>Website &amp; Home</strong> in the left sidebar
                            (or from the website header “Edit Website” when signed in as Admin).
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                        <span data-dirty-badge style="display:${dirty ? '' : 'none'};font-size:0.75rem;color:#fbbf24;font-weight:700;">Unsaved edits</span>
                        <a class="btn btn-sm btn-secondary" href="website.html" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Preview site</a>
                        <a class="btn btn-sm btn-secondary" href="../index.html" target="_blank" rel="noopener"><i class="fas fa-home"></i> Preview home</a>
                        <button type="button" class="btn btn-sm btn-secondary" data-reset-section><i class="fas fa-undo"></i> Reload</button>
                        <button type="button" class="btn btn-sm btn-primary" data-save-all><i class="fas fa-save"></i> Save changes</button>
                    </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;" data-section-nav>
                    ${renderNav()}
                </div>
            </div>
            <div data-section-body>${renderSectionBody()}</div>
        `;
        bind();
    }

    function uploadFile(file, preferredName) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error('No file'));
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                const base = (preferredName || file.name || 'upload').replace(/\.[^.]+$/, '');
                const safe = base.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 60) + '-' + Date.now();
                fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataUrl, filename: safe, folder: 'images' })
                })
                    .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
                    .then(({ ok, j }) => {
                        if (!ok || !j.url) throw new Error((j && j.error) || 'Upload failed');
                        resolve(j);
                    })
                    .catch(reject);
            };
            reader.onerror = () => reject(new Error('Could not read file'));
            reader.readAsDataURL(file);
        });
    }

    function toast(msg, type) {
        if (global.UI && UI.toast) UI.toast(msg, type || 'success');
        else alert(msg);
    }

    function bind() {
        rootEl.querySelectorAll('[data-section]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                activeSection = btn.getAttribute('data-section');
                paint();
            });
        });

        rootEl.querySelectorAll('[data-field], [data-list-field], [data-g-url], [data-g-caption], [data-ad-title], [data-ad-text], [data-t-name], [data-t-date], [data-t-text]').forEach((el) => {
            el.addEventListener('input', markDirty);
            el.addEventListener('change', markDirty);
        });

        const saveBtn = rootEl.querySelector('[data-save-all]');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const d = collectFromDom();
                if (!global.SiteContent) {
                    toast('SiteContent not loaded', 'error');
                    return;
                }
                SiteContent.update(d);
                draft = JSON.parse(JSON.stringify(SiteContent.get()));
                clearDirty();
                toast('Website & home content saved', 'success');
                paint();
            });
        }

        const reloadBtn = rootEl.querySelector('[data-reset-section]');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                draft = JSON.parse(JSON.stringify(content()));
                clearDirty();
                paint();
                toast('Reloaded from saved content', 'info');
            });
        }

        // Brand image uploads
        rootEl.querySelectorAll('[data-upload-for]').forEach((input) => {
            input.addEventListener('change', async () => {
                const key = input.getAttribute('data-upload-for');
                const file = input.files && input.files[0];
                if (!file) return;
                try {
                    toast('Uploading…', 'info');
                    const result = await uploadFile(file, key);
                    collectFromDom();
                    ensureDraft()[key] = result.url;
                    markDirty();
                    paint();
                    toast('Image uploaded — click Save changes', 'success');
                } catch (e) {
                    toast(e.message || 'Upload failed', 'error');
                }
            });
        });

        // Gallery uploads
        rootEl.querySelectorAll('[data-gallery-upload]').forEach((input) => {
            input.addEventListener('change', async () => {
                const key = input.getAttribute('data-gallery-upload');
                const idx = Number(input.getAttribute('data-gallery-index'));
                const file = input.files && input.files[0];
                if (!file) return;
                try {
                    toast('Uploading…', 'info');
                    const result = await uploadFile(file, key + '-' + (idx + 1));
                    collectFromDom();
                    const list = ensureDraft()[key] || [];
                    if (list[idx]) list[idx].url = result.url;
                    markDirty();
                    paint();
                    toast('Photo replaced — click Save changes', 'success');
                } catch (e) {
                    toast(e.message || 'Upload failed', 'error');
                }
            });
        });

        rootEl.querySelectorAll('[data-add-gallery]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                const key = btn.getAttribute('data-add-gallery');
                ensureDraft()[key] = ensureDraft()[key] || [];
                ensureDraft()[key].push({ url: '../assets/images/gallery-1.png', caption: 'New photo' });
                markDirty();
                paint();
            });
        });

        rootEl.querySelectorAll('[data-g-remove]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                const key = btn.getAttribute('data-g-remove');
                const i = Number(btn.getAttribute('data-i'));
                ensureDraft()[key].splice(i, 1);
                markDirty();
                paint();
            });
        });

        rootEl.querySelectorAll('[data-g-up]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                const key = btn.getAttribute('data-g-up');
                const i = Number(btn.getAttribute('data-i'));
                const list = ensureDraft()[key];
                if (i <= 0 || !list) return;
                const tmp = list[i - 1];
                list[i - 1] = list[i];
                list[i] = tmp;
                markDirty();
                paint();
            });
        });

        rootEl.querySelectorAll('[data-g-down]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                const key = btn.getAttribute('data-g-down');
                const i = Number(btn.getAttribute('data-i'));
                const list = ensureDraft()[key];
                if (!list || i >= list.length - 1) return;
                const tmp = list[i + 1];
                list[i + 1] = list[i];
                list[i] = tmp;
                markDirty();
                paint();
            });
        });

        const addAd = rootEl.querySelector('[data-add-ad]');
        if (addAd) {
            addAd.addEventListener('click', () => {
                collectFromDom();
                ensureDraft().discountAds = ensureDraft().discountAds || [];
                ensureDraft().discountAds.push({ title: 'New offer', text: 'Describe the deal', icon: 'fa-tags' });
                markDirty();
                paint();
            });
        }
        rootEl.querySelectorAll('[data-remove-ad]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                ensureDraft().discountAds.splice(Number(btn.getAttribute('data-remove-ad')), 1);
                markDirty();
                paint();
            });
        });

        const addT = rootEl.querySelector('[data-add-testimonial]');
        if (addT) {
            addT.addEventListener('click', () => {
                collectFromDom();
                ensureDraft().siteTestimonials = ensureDraft().siteTestimonials || [];
                ensureDraft().siteTestimonials.push({ name: '', date: '', text: '' });
                markDirty();
                paint();
            });
        }
        rootEl.querySelectorAll('[data-remove-testimonial]').forEach((btn) => {
            btn.addEventListener('click', () => {
                collectFromDom();
                ensureDraft().siteTestimonials.splice(Number(btn.getAttribute('data-remove-testimonial')), 1);
                markDirty();
                paint();
            });
        });

        const libBtn = rootEl.querySelector('[data-refresh-library]');
        if (libBtn) {
            libBtn.addEventListener('click', async () => {
                const box = rootEl.querySelector('[data-image-library]');
                if (!box) return;
                box.style.display = '';
                box.innerHTML = '<span style="color:var(--text-secondary);font-size:0.8rem;">Loading…</span>';
                try {
                    const res = await fetch('/api/list-images?folder=images', { cache: 'no-store' });
                    const data = await res.json();
                    const files = (data && data.files) || [];
                    if (!files.length) {
                        box.innerHTML = '<span style="color:var(--text-secondary);">No images found in assets/images.</span>';
                        return;
                    }
                    box.innerHTML = `<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">Click an image to copy its path, then paste into a photo URL field.</div>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${files.map((f) => `
                            <button type="button" class="btn btn-sm btn-secondary" data-copy-url="${esc(f.url)}" title="${esc(f.name)}"
                                style="padding:4px;width:64px;height:64px;overflow:hidden;">
                                <img src="${esc(f.url)}" alt="${esc(f.name)}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;">
                            </button>
                        `).join('')}
                        </div>`;
                    box.querySelectorAll('[data-copy-url]').forEach((b) => {
                        b.addEventListener('click', async () => {
                            const url = b.getAttribute('data-copy-url');
                            try {
                                await navigator.clipboard.writeText(url);
                                toast('Copied: ' + url, 'success');
                            } catch (e) {
                                toast(url, 'info');
                            }
                        });
                    });
                } catch (e) {
                    box.innerHTML = '<span style="color:var(--danger);">Could not load library — is START-SALON running?</span>';
                }
            });
        }
    }

    function mount(targetId) {
        rootEl = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
        if (!rootEl) return;
        draft = JSON.parse(JSON.stringify(content()));
        clearDirty();
        paint();
    }

    global.WebsiteEditor = { mount, refresh: mount };
})(window);
