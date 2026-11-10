/* Admin dashboard: edit listings, reels, locality reports and site settings,
   then publish. Only the site owner and editors can open it. */
(function () {
  'use strict';
  var WF = window.WF, esc = WF.esc;
  var TYPES = ['Apartment', 'Builder floor', 'Villa', 'Plot', 'Commercial'];
  var STATUSES = ['Ready to move', 'Under construction', 'New launch'];
  var TABS = [['overview', 'Overview'], ['properties', 'Properties'], ['reels', 'Reels'], ['reports', 'Locality reports'], ['site', 'Site details'], ['backup', 'Backup']];
  var MAX_UPLOAD = 20 * 1024 * 1024;

  var root = null, access = null, draft = null, dirty = false;
  var tab = 'overview', editing = null, confirmDel = null, note = null, busy = false;
  var caps = { assets: undefined };

  /* ---------- small storage helpers (never required for the page to work) ---------- */
  function ssGet(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
  function baseStamp() { return (WF.published && WF.published.updatedAt) || 'initial'; }
  function saveDraft() { if (dirty) ssSet('wf-draft', { base: baseStamp(), draft: draft }); else ssDel('wf-draft'); ssSet('wf-tab', tab); }
  function uid(p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function touch(msg) { dirty = true; note = msg ? { kind: 'ok', text: msg } : null; saveDraft(); render(); }

  function use(name) {
    if (!window.claude || !window.claude.use) return Promise.resolve(null);
    return window.claude.use(name).catch(function () { return null; });
  }
  function checkAccess() {
    return new Promise(function (resolve) {
      var done = false;
      function fin(v) { if (!done) { done = true; clearTimeout(timer); resolve(v); } }
      var timer = setTimeout(function () { fin(false); }, 10000);
      use('user').then(function (u) { return u ? u.canEdit() : false; }).then(function (ok) { fin(!!ok); }, function () { fin(false); });
    });
  }

  /* ---------- mount ---------- */
  function mount(app) {
    root = app;
    if (access === null) {
      root.innerHTML = shellHTML('<div class="adm-gate"><h1>Admin</h1><p>Checking your access.</p></div>', true);
      checkAccess().then(function (ok) {
        access = ok;
        if (ok) use('assets').then(function (a) { caps.assets = a; if (location.hash === '#admin') render(); });
        if (location.hash === '#admin') mount(app);
      });
      return;
    }
    if (!access) {
      root.innerHTML = shellHTML('<div class="adm-gate"><h1>Admin is for the site team</h1>' +
        '<p>Only the owner and editors of this site can manage listings, reels and reports. Sign in to Claude with the account that owns the site, then open this page again.</p>' +
        '<a class="btn" href="#top">Back to the site</a></div>', true);
      return;
    }
    if (!draft) {
      var saved = ssGet('wf-draft');
      if (saved && saved.base === baseStamp() && saved.draft && saved.draft.v) { draft = saved.draft; dirty = true; }
      else draft = WF.clone(WF.content);
      var t = ssGet('wf-tab'); if (t && TABS.some(function (x) { return x[0] === t; })) tab = t;
    }
    if (!root.dataset.admBound) { root.dataset.admBound = '1'; root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit); root.addEventListener('input', onInput); }
    render();
  }

  function shellHTML(body, bare) {
    return '<div class="adm">' +
      '<header class="adm-top"><div class="adm-top-row"><a class="logo" href="#top"><span class="logo-mark" aria-hidden="true"></span>' + esc((WF.CFG.brand || {}).name || 'Site') + '<span class="adm-badge">Admin</span></a>' +
      '<a class="link" href="#top">View site</a></div></header>' +
      (bare ? '<div class="adm-bare">' + body + '</div>' : body) + '</div>';
  }

  function render() {
    if (!root || location.hash !== '#admin' || !access) return;
    var bar = '<div class="adm-pub ' + (dirty ? 'dirty' : '') + '"><div class="adm-pub-row"><span>' +
      (dirty ? '<strong>Unpublished changes.</strong> Visitors still see the last published version.' : 'Everything is published.' + (WF.published && WF.published.updatedAt ? ' Last published ' + esc(new Date(WF.published.updatedAt).toLocaleString('en-IN')) + '.' : '')) +
      '</span><span class="adm-pub-btns">' + (dirty ? '<button class="btn ghost small" data-act="discard"' + (busy ? ' disabled' : '') + '>Discard</button><button class="btn small" data-act="publish"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Publishing' : 'Publish changes') + '</button>' : '') + '</span></div>' +
      (note ? '<p class="adm-note ' + note.kind + '" role="status">' + esc(note.text) + '</p>' : '') + '</div>';
    var nav = '<nav class="adm-nav" aria-label="Admin sections">' + TABS.map(function (t) {
      return '<button type="button" data-act="tab" data-tab="' + t[0] + '" aria-current="' + (t[0] === tab ? 'page' : 'false') + '">' + t[1] + '</button>';
    }).join('') + '</nav>';
    var panes = { overview: overview, properties: properties, reels: reels, reports: reports, site: site, backup: backup };
    root.innerHTML = shellHTML(bar + '<div class="adm-body">' + nav + '<section class="adm-main">' + panes[tab]() + '</section></div>');
  }

  /* ---------- Overview ---------- */
  function count(list, fn) { return list.filter(fn).length; }
  function overview() {
    var p = draft.properties, r = draft.reels, l = draft.localities;
    var tiles = [
      ['Listings', p.length, count(p, function (x) { return x.visible !== false; }) + ' visible'],
      ['Featured', count(p, function (x) { return x.featured; }), 'shown first'],
      ['Reels', r.length, count(r, function (x) { return x.assetId; }) + ' with video'],
      ['Locality reports', l.length, 'on the site']
    ];
    var total = p.reduce(function (s, x) { return s + (Number(x.price) || 0); }, 0);
    function breakdown(title, keys, field) {
      var max = Math.max.apply(null, keys.map(function (k) { return count(p, function (x) { return x[field] === k; }); }).concat([1]));
      return '<div class="adm-card"><h3>' + title + '</h3>' + keys.map(function (k) {
        var n = count(p, function (x) { return x[field] === k; });
        return '<div class="bar-row"><span class="bar-label">' + esc(k) + '</span><span class="bar-track"><span class="bar-fill brand" style="width:' + (n / max * 100) + '%"></span></span><span class="bar-val">' + n + '</span></div>';
      }).join('') + '</div>';
    }
    var samples = count(p, isSample) + count(r, isSample) + count(l, isSample);
    var checks = [
      [!!String(WF.setting('whatsappNumber', draft)).replace(/\D/g, ''), 'WhatsApp number is set', 'Add your WhatsApp number in Site details. Until then the chat buttons open WhatsApp without a recipient.'],
      [samples === 0, 'No sample content left', samples + ' sample item' + (samples === 1 ? '' : 's') + ' still showing. Replace them with real ones, or remove them all below.'],
      [count(p, function (x) { return !x.photo; }) === 0, 'Every listing has a photo', count(p, function (x) { return !x.photo; }) + ' listing(s) have no photo yet.'],
      [count(r, function (x) { return !x.assetId && !x.link; }) === 0, 'Every reel has a video or link', count(r, function (x) { return !x.assetId && !x.link; }) + ' reel(s) have no video yet.']
    ];
    return '<h1>Overview</h1>' +
      '<div class="adm-tiles">' + tiles.map(function (t) { return '<div class="adm-tile"><span class="adm-tile-label">' + t[0] + '</span><span class="adm-tile-num">' + t[1] + '</span><span class="adm-tile-sub">' + t[2] + '</span></div>'; }).join('') + '</div>' +
      '<div class="adm-two">' + breakdown('Listings by status', STATUSES, 'status') + breakdown('Listings by type', TYPES, 'type') + '</div>' +
      '<div class="adm-card"><h3>Launch checklist</h3><ul class="adm-checks">' + checks.map(function (c) {
        return '<li class="' + (c[0] ? 'done' : 'todo') + '"><span class="chk" aria-hidden="true">' + (c[0] ? '\u2713' : '!') + '</span>' + esc(c[0] ? c[1] : c[2]) + '</li>';
      }).join('') + '</ul>' +
      (samples ? '<button class="btn ghost small" data-act="clear-samples">Remove all sample content</button>' : '') + '</div>' +
      '<p class="adm-hint">Total value of all listings: <strong>' + WF.fmtPrice(total) + '</strong></p>';
  }
  function isSample(x) { return !!x.sample; }

  /* ---------- Properties ---------- */
  function sel(id, list, cur) {
    return '<select id="' + id + '" name="' + id.replace(/^pf-/, '') + '">' + list.map(function (v) { return '<option' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select>';
  }
  function fileNote() { return caps.assets ? '' : '<p class="adm-hint">Uploads are not available in this view. Open the site on claude.ai with the owner account to upload files.</p>'; }
  function properties() {
    var form = '';
    if (editing && editing.kind === 'prop') {
      var p = editing.id ? draft.properties.filter(function (x) { return x.id === editing.id; })[0] : null;
      p = p || { title: '', type: 'Apartment', bhk: 3, area: '', price: '', locality: '', status: 'Ready to move', rera: '', description: '', featured: false, visible: true, photo: '' };
      form = '<form class="adm-card adm-form" id="prop-form"><h3>' + (editing.id ? 'Edit property' : 'Add a property') + '</h3><div class="adm-fields">' +
        '<label class="wide">Title<input id="pf-title" name="title" required value="' + esc(p.title) + '" placeholder="3 BHK apartment with park view"></label>' +
        '<label>Type' + sel('pf-type', TYPES, p.type) + '</label>' +
        '<label>Status' + sel('pf-status', STATUSES, p.status) + '</label>' +
        '<label>Locality<input id="pf-locality" name="locality" required value="' + esc(p.locality) + '" placeholder="Sector 56"></label>' +
        '<label>Price in lakh (\u20B9)<input id="pf-price" name="price" type="number" min="1" step="0.5" required value="' + esc(p.price) + '" placeholder="215 means \u20B92.15 Cr"></label>' +
        '<label>Bedrooms (0 for plot or office)<input id="pf-bhk" name="bhk" type="number" min="0" max="12" value="' + esc(p.bhk) + '"></label>' +
        '<label>Area in sq ft<input id="pf-area" name="area" type="number" min="1" required value="' + esc(p.area) + '"></label>' +
        '<label>RERA registration no. (optional)<input id="pf-rera" name="rera" value="' + esc(p.rera || '') + '"></label>' +
        '<label>Photo' + (p.photo ? ' (one is uploaded; choose a file to replace it)' : '') + '<input id="pf-photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp"' + (caps.assets ? '' : ' disabled') + '></label>' +
        '<label class="wide">Description<textarea id="pf-description" name="description" rows="3">' + esc(p.description || '') + '</textarea></label>' +
        '<label class="check"><input id="pf-featured" name="featured" type="checkbox"' + (p.featured ? ' checked' : '') + '> Featured (shown first)</label>' +
        '<label class="check"><input id="pf-visible" name="visible" type="checkbox"' + (p.visible !== false ? ' checked' : '') + '> Visible on the site</label>' +
        '</div>' + fileNote() + '<div class="adm-actions"><button class="btn small" type="submit"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Saving' : 'Save property') + '</button><button class="btn ghost small" type="button" data-act="cancel-edit">Cancel</button></div></form>';
    }
    var rows = draft.properties.map(function (p) {
      var del = confirmDel === p.id
        ? '<span class="adm-confirm">Delete? <button class="btn danger small" data-act="del-prop-yes" data-id="' + p.id + '">Yes, delete</button><button class="btn ghost small" data-act="del-cancel">Keep</button></span>'
        : '<button class="btn ghost small" data-act="edit-prop" data-id="' + p.id + '">Edit</button><button class="btn ghost small" data-act="del" data-id="' + p.id + '">Delete</button>';
      return '<tr data-search="' + esc((p.title + ' ' + p.locality + ' ' + p.type + ' ' + p.status).toLowerCase()) + '"><td><strong>' + esc(p.title) + '</strong>' + (p.sample ? ' <span class="tag sample">Sample</span>' : '') + (p.photo ? '' : ' <span class="tag">No photo</span>') + '<br><span class="muted">' + esc(p.type) + ' \u00B7 ' + esc(p.locality) + '</span></td>' +
        '<td class="num">' + WF.fmtPrice(p.price) + '</td><td><span class="chip status inline">' + esc(p.status) + '</span></td>' +
        '<td><button class="toggle" data-act="toggle-prop" data-id="' + p.id + '" data-field="featured" aria-pressed="' + (p.featured ? 'true' : 'false') + '">' + (p.featured ? 'Featured' : 'Standard') + '</button></td>' +
        '<td><button class="toggle" data-act="toggle-prop" data-id="' + p.id + '" data-field="visible" aria-pressed="' + (p.visible !== false ? 'true' : 'false') + '">' + (p.visible !== false ? 'Visible' : 'Hidden') + '</button></td>' +
        '<td class="adm-row-actions">' + del + '</td></tr>';
    }).join('');
    return '<div class="adm-head"><h1>Properties</h1><button class="btn small" data-act="add-prop">Add property</button></div>' + form +
      '<div class="adm-toolbar"><label class="sr" for="adm-prop-q">Search listings</label><input id="adm-prop-q" type="search" placeholder="Search by title, locality, type or status" data-filter="prop-table"></div>' +
      (draft.properties.length ? '<div class="table-wrap"><table class="adm-table" id="prop-table"><thead><tr><th>Property</th><th class="num">Price</th><th>Status</th><th>Placement</th><th>On site</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty"><p><strong>No properties yet.</strong></p><p>Use Add property to create your first listing.</p></div>');
  }

  /* ---------- Reels ---------- */
  function reels() {
    var form = '<form class="adm-card adm-form" id="reel-form"><h3>Add a reel</h3><div class="adm-fields">' +
      '<label>Title<input id="rf-title" name="title" required placeholder="Sector 56 walk-through"></label>' +
      '<label>Caption<input id="rf-caption" name="caption" placeholder="One line about the video"></label>' +
      '<label>Video file (MP4 or WebM, up to 20 MB)<input id="rf-file" name="file" type="file" accept="video/mp4,video/webm"' + (caps.assets ? '' : ' disabled') + '></label>' +
      '<label>Or a link to the reel (Instagram, YouTube)<input id="rf-link" name="link" type="url" placeholder="https://"></label>' +
      '</div>' + fileNote() + '<p class="adm-hint">An uploaded video plays inside the slider. A link shows a card that opens the reel in a new tab.</p>' +
      '<div class="adm-actions"><button class="btn small" type="submit"' + (busy ? ' disabled' : '') + '>' + (busy ? 'Uploading' : 'Add reel') + '</button></div></form>';
    var list = draft.reels.map(function (r, i) {
      var del = confirmDel === r.id
        ? '<span class="adm-confirm">Delete? <button class="btn danger small" data-act="del-reel-yes" data-id="' + r.id + '">Yes, delete</button><button class="btn ghost small" data-act="del-cancel">Keep</button></span>'
        : '<button class="btn ghost small" data-act="del" data-id="' + r.id + '">Delete</button>';
      return '<li class="adm-reel"><span class="adm-order">' + (i + 1) + '</span><div class="adm-reel-info"><strong>' + esc(r.title) + '</strong>' + (r.sample ? ' <span class="tag sample">Sample</span>' : '') +
        '<br><span class="muted">' + (r.assetId ? 'Uploaded video' : r.link ? 'Link: ' + esc(r.link) : 'No video yet') + (r.caption ? ' \u00B7 ' + esc(r.caption) : '') + '</span></div>' +
        '<div class="adm-row-actions"><button class="icon-btn" data-act="move-reel" data-id="' + r.id + '" data-dir="-1" aria-label="Move earlier"' + (i === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button class="icon-btn" data-act="move-reel" data-id="' + r.id + '" data-dir="1" aria-label="Move later"' + (i === draft.reels.length - 1 ? ' disabled' : '') + '>&darr;</button>' +
        '<button class="toggle" data-act="toggle-reel" data-id="' + r.id + '" aria-pressed="' + (r.visible !== false ? 'true' : 'false') + '">' + (r.visible !== false ? 'Visible' : 'Hidden') + '</button>' + del + '</div></li>';
    }).join('');
    return '<h1>Reels</h1><p class="adm-lede">Reels appear in the slider on the home page, in the order shown here.</p>' + form +
      (draft.reels.length ? '<ol class="adm-reels">' + list + '</ol>' : '<div class="empty"><p><strong>No reels yet.</strong></p><p>Add the first one with the form above.</p></div>');
  }

  /* ---------- Locality reports ---------- */
  function reports() {
    var form = '';
    if (editing && editing.kind === 'loc') {
      var l = editing.id ? draft.localities.filter(function (x) { return x.id === editing.id; })[0] : null;
      l = l || { name: '', city: 'Gurugram', updated: '', summary: '', scores: { safety: 70, amenities: 70, connectivity: 70, sentiment: 70 }, events: [] };
      form = '<form class="adm-card adm-form" id="loc-form"><h3>' + (editing.id ? 'Edit report' : 'Add a locality report') + '</h3><div class="adm-fields">' +
        '<label>Locality<input id="lf-name" name="name" required value="' + esc(l.name) + '" placeholder="Sector 56"></label>' +
        '<label>City<input id="lf-city" name="city" value="' + esc(l.city || '') + '"></label>' +
        WF.SCORE_KEYS.map(function (k) { return '<label>' + k[1] + ' (0 to 100)<input id="lf-' + k[0] + '" name="' + k[0] + '" type="number" min="0" max="100" required value="' + esc((l.scores || {})[k[0]]) + '"></label>'; }).join('') +
        '<label>Last refreshed<input id="lf-updated" name="updated" value="' + esc(l.sample ? '' : (l.updated || '')) + '" placeholder="November 2026"></label>' +
        '<label class="wide">Summary<textarea id="lf-summary" name="summary" rows="3">' + esc(l.summary || '') + '</textarea></label>' +
        '<label class="wide">Recent events, one per line<textarea id="lf-events" name="events" rows="4">' + esc((l.events || []).join('\n')) + '</textarea></label>' +
        '</div><div class="adm-actions"><button class="btn small" type="submit">Save report</button><button class="btn ghost small" type="button" data-act="cancel-edit">Cancel</button></div></form>';
    }
    var rows = draft.localities.map(function (l) {
      var o = WF.overall(l), g = WF.grade(o);
      var del = confirmDel === l.id
        ? '<span class="adm-confirm">Delete? <button class="btn danger small" data-act="del-loc-yes" data-id="' + l.id + '">Yes, delete</button><button class="btn ghost small" data-act="del-cancel">Keep</button></span>'
        : '<button class="btn ghost small" data-act="edit-loc" data-id="' + l.id + '">Edit</button><button class="btn ghost small" data-act="del" data-id="' + l.id + '">Delete</button>';
      return '<tr><td><strong>' + esc(l.name) + '</strong>' + (l.sample ? ' <span class="tag sample">Sample</span>' : '') + '<br><span class="muted">' + esc(l.city || '') + '</span></td>' +
        '<td class="num"><span class="pill ' + g[1] + '">' + o + ' \u00B7 ' + g[0] + '</span></td>' +
        WF.SCORE_KEYS.map(function (k) { return '<td class="num">' + esc((l.scores || {})[k[0]]) + '</td>'; }).join('') +
        '<td class="adm-row-actions">' + del + '</td></tr>';
    }).join('');
    return '<div class="adm-head"><h1>Locality reports</h1><button class="btn small" data-act="add-loc">Add report</button></div>' +
      '<p class="adm-lede">The overall score is the average of the four category scores. The first report in this list is the one shown at the top of the home page.</p>' + form +
      (draft.localities.length ? '<div class="table-wrap"><table class="adm-table"><thead><tr><th>Locality</th><th class="num">Overall</th>' + WF.SCORE_KEYS.map(function (k) { return '<th class="num">' + k[1] + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty"><p><strong>No reports yet.</strong></p><p>Add a locality to show its scorecard on the site.</p></div>');
  }

  /* ---------- Site details ---------- */
  function site() {
    function v(k) { return esc(WF.setting(k, draft)); }
    return '<h1>Site details</h1><p class="adm-lede">Contact details and headline text. Services, plans and questions are edited in the site settings file.</p>' +
      '<form class="adm-card adm-form" id="site-form"><div class="adm-fields">' +
      '<label>WhatsApp number (country code + number, digits only)<input id="sf-whatsappNumber" name="whatsappNumber" inputmode="numeric" pattern="[0-9+ ]*" value="' + v('whatsappNumber') + '" placeholder="919812345678"></label>' +
      '<label>Phone shown on the site<input id="sf-phone" name="phone" value="' + v('phone') + '"></label>' +
      '<label>Email shown on the site<input id="sf-email" name="email" type="email" value="' + v('email') + '"></label>' +
      '<label>Office hours<input id="sf-hours" name="hours" value="' + v('hours') + '"></label>' +
      '<label class="wide">Message pre-typed in WhatsApp<textarea id="sf-whatsappMessage" name="whatsappMessage" rows="2">' + v('whatsappMessage') + '</textarea></label>' +
      '<label class="wide">Office address<textarea id="sf-address" name="address" rows="3">' + v('address') + '</textarea></label>' +
      '<label class="wide">Home page headline<input id="sf-heroHeadline" name="heroHeadline" value="' + v('heroHeadline') + '"></label>' +
      '<label class="wide">Text under the headline<textarea id="sf-heroSub" name="heroSub" rows="3">' + v('heroSub') + '</textarea></label>' +
      '<label class="wide">Announcement bar (leave empty to hide)<input id="sf-announcement" name="announcement" value="' + v('announcement') + '" placeholder="New launch in Sector 82: site visits this weekend"></label>' +
      '</div><div class="adm-actions"><button class="btn small" type="submit">Save details</button></div></form>';
  }

  /* ---------- Backup ---------- */
  function backup() {
    return '<h1>Backup</h1><p class="adm-lede">A copy of everything managed from this page. Keep it somewhere safe before making large changes.</p>' +
      '<div class="adm-card adm-form"><h3>Current content</h3><label class="sr" for="bk-out">Content as text</label><textarea id="bk-out" rows="10" readonly spellcheck="false">' + esc(JSON.stringify(draft, null, 1)) + '</textarea>' +
      '<div class="adm-actions"><button class="btn small" data-act="copy-backup">Copy</button></div></div>' +
      '<form class="adm-card adm-form" id="restore-form"><h3>Restore from a copy</h3><label class="sr" for="bk-in">Paste a saved copy</label><textarea id="bk-in" name="json" rows="6" spellcheck="false" placeholder="Paste a copy saved earlier" required></textarea>' +
      '<div class="adm-actions"><button class="btn ghost small" type="submit">Load into draft</button></div><p class="adm-hint">Nothing changes for visitors until you press Publish changes.</p></form>';
  }

  /* ---------- events ---------- */
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function remove(list, id) { return list.filter(function (x) { return x.id !== id; }); }

  function onInput(e) {
    var t = e.target; if (!t.dataset || !t.dataset.filter) return;
    var q = t.value.trim().toLowerCase(), rows = document.querySelectorAll('#' + t.dataset.filter + ' tbody tr');
    for (var i = 0; i < rows.length; i++) rows[i].hidden = !!q && rows[i].dataset.search.indexOf(q) < 0;
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b || location.hash !== '#admin') return;
    var act = b.dataset.act, id = b.dataset.id, x;
    if (act === 'tab') { tab = b.dataset.tab; editing = null; confirmDel = null; note = null; ssSet('wf-tab', tab); render(); }
    else if (act === 'publish') publish();
    else if (act === 'discard') { draft = WF.clone(WF.content); dirty = false; editing = null; note = { kind: 'ok', text: 'Changes discarded.' }; saveDraft(); render(); }
    else if (act === 'add-prop') { editing = { kind: 'prop', id: null }; render(); focus('pf-title'); }
    else if (act === 'edit-prop') { editing = { kind: 'prop', id: id }; render(); focus('pf-title'); }
    else if (act === 'add-loc') { editing = { kind: 'loc', id: null }; render(); focus('lf-name'); }
    else if (act === 'edit-loc') { editing = { kind: 'loc', id: id }; render(); focus('lf-name'); }
    else if (act === 'cancel-edit') { editing = null; render(); }
    else if (act === 'del') { confirmDel = id; render(); }
    else if (act === 'del-cancel') { confirmDel = null; render(); }
    else if (act === 'del-prop-yes') { draft.properties = remove(draft.properties, id); confirmDel = null; touch('Property deleted.'); }
    else if (act === 'del-reel-yes') { draft.reels = remove(draft.reels, id); confirmDel = null; touch('Reel deleted.'); }
    else if (act === 'del-loc-yes') { draft.localities = remove(draft.localities, id); confirmDel = null; touch('Report deleted.'); }
    else if (act === 'toggle-prop') { x = byId(draft.properties, id); if (x) { var f = b.dataset.field; x[f] = f === 'visible' ? x.visible === false : !x.featured; touch(); } }
    else if (act === 'toggle-reel') { x = byId(draft.reels, id); if (x) { x.visible = x.visible === false; touch(); } }
    else if (act === 'move-reel') {
      var i = draft.reels.indexOf(byId(draft.reels, id)), j = i + Number(b.dataset.dir);
      if (i >= 0 && j >= 0 && j < draft.reels.length) { x = draft.reels[i]; draft.reels[i] = draft.reels[j]; draft.reels[j] = x; touch(); }
    }
    else if (act === 'clear-samples') {
      draft.properties = draft.properties.filter(function (p) { return !p.sample; });
      draft.reels = draft.reels.filter(function (p) { return !p.sample; });
      draft.localities = draft.localities.filter(function (p) { return !p.sample; });
      touch('Sample content removed from the draft.');
    }
    else if (act === 'copy-backup') {
      var ta = document.getElementById('bk-out');
      var done = function () { note = { kind: 'ok', text: 'Copied.' }; render(); };
      var fallback = function () { ta.focus(); ta.select(); note = { kind: 'warn', text: 'Press Ctrl+C or Cmd+C to copy the selected text.' }; };
      try { navigator.clipboard.writeText(ta.value).then(done, fallback); } catch (err) { fallback(); }
    }
  }
  function focus(id) { var el = document.getElementById(id); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } }
  function val(form, name) { var el = form.elements[name]; return el ? String(el.value).trim() : ''; }

  function upload(file) {
    if (!caps.assets) return Promise.reject({ code: 'unavailable' });
    return caps.assets.upload(file);
  }
  function uploadError(e) {
    var c = e && e.code;
    return c === 'unavailable' || c === 'not_granted' ? 'Uploads are not available in this view.'
      : c === 'too_large' ? 'That file is too large. The limit is 20 MB.'
      : c === 'rate_limited' ? 'Too many uploads at once. Wait a minute and try again.'
      : 'The upload did not finish. Check the file type and try again.';
  }

  function onSubmit(e) {
    var f = e.target; if (location.hash !== '#admin') return;
    e.preventDefault();
    if (busy) return;
    if (f.id === 'prop-form') {
      var data = {
        title: val(f, 'title'), type: val(f, 'type'), status: val(f, 'status'), locality: val(f, 'locality'),
        price: Number(val(f, 'price')) || 0, bhk: Number(val(f, 'bhk')) || 0, area: Number(val(f, 'area')) || 0,
        rera: val(f, 'rera'), description: val(f, 'description'), featured: f.elements.featured.checked, visible: f.elements.visible.checked
      };
      var file = f.elements.photo.files && f.elements.photo.files[0];
      var finish = function (photoId) {
        var p = editing && editing.id ? byId(draft.properties, editing.id) : null;
        if (!p) { p = { id: uid('p'), photo: '' }; draft.properties.unshift(p); }
        Object.keys(data).forEach(function (k) { p[k] = data[k]; });
        if (photoId) p.photo = photoId;
        delete p.sample; editing = null; busy = false; touch('Property saved to the draft.');
      };
      if (file) {
        if (file.size > MAX_UPLOAD) { note = { kind: 'bad', text: 'That photo is larger than 20 MB. Choose a smaller file.' }; render(); return; }
        busy = true; f.querySelector('[type=submit]').disabled = true; f.querySelector('[type=submit]').textContent = 'Uploading photo';
        upload(file).then(function (r) { finish(r.id); }, function (err) { busy = false; note = { kind: 'bad', text: uploadError(err) }; var b = f.querySelector('[type=submit]'); b.disabled = false; b.textContent = 'Save property'; showNote(); });
      } else finish('');
    }
    else if (f.id === 'reel-form') {
      var rfile = f.elements.file.files && f.elements.file.files[0], link = val(f, 'link');
      if (!rfile && !link) { note = { kind: 'bad', text: 'Choose a video file or paste a link to the reel.' }; showNote(); return; }
      if (link && !/^https:\/\//i.test(link)) { note = { kind: 'bad', text: 'The link must start with https://' }; showNote(); return; }
      var reel = { id: uid('r'), title: val(f, 'title'), caption: val(f, 'caption'), assetId: '', link: link, visible: true };
      var add = function () { draft.reels.unshift(reel); busy = false; touch('Reel added to the draft. It is first in the slider.'); };
      if (rfile) {
        if (rfile.size > MAX_UPLOAD) { note = { kind: 'bad', text: 'That video is larger than 20 MB. Export a shorter or lower-resolution version, or paste a link instead.' }; showNote(); return; }
        busy = true; var sb = f.querySelector('[type=submit]'); sb.disabled = true; sb.textContent = 'Uploading video';
        upload(rfile).then(function (r) { reel.assetId = r.id; add(); }, function (err) { busy = false; sb.disabled = false; sb.textContent = 'Add reel'; note = { kind: 'bad', text: uploadError(err) }; showNote(); });
      } else add();
    }
    else if (f.id === 'loc-form') {
      var l = editing && editing.id ? byId(draft.localities, editing.id) : null;
      if (!l) { l = { id: uid('l') }; draft.localities.push(l); }
      l.name = val(f, 'name'); l.city = val(f, 'city'); l.updated = val(f, 'updated'); l.summary = val(f, 'summary');
      l.scores = {}; WF.SCORE_KEYS.forEach(function (k) { l.scores[k[0]] = Math.max(0, Math.min(100, Math.round(Number(val(f, k[0])) || 0))); });
      l.events = val(f, 'events').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      delete l.sample; editing = null; touch('Report saved to the draft.');
    }
    else if (f.id === 'site-form') {
      WF.SETTING_KEYS.forEach(function (k) {
        var v = val(f, k); if (k === 'whatsappNumber') v = v.replace(/\D/g, '');
        if (v === String(WF.configValue(k))) delete draft.settings[k]; else draft.settings[k] = v;
      });
      touch('Details saved to the draft.');
    }
    else if (f.id === 'restore-form') {
      try {
        var d = JSON.parse(val(f, 'json'));
        if (!d || !d.v || !Array.isArray(d.properties) || !Array.isArray(d.reels) || !Array.isArray(d.localities)) throw new Error('shape');
        d.settings = d.settings || {}; draft = d; touch('Copy loaded into the draft. Review it, then publish.');
      } catch (err) { note = { kind: 'bad', text: 'That text is not a valid copy. Paste the full text exactly as it was copied.' }; showNote(); }
    }
  }
  function showNote() {
    var bar = root.querySelector('.adm-pub'); if (!bar) return render();
    var p = bar.querySelector('.adm-note') || bar.appendChild(document.createElement('p'));
    p.className = 'adm-note ' + note.kind; p.setAttribute('role', 'status'); p.textContent = note.text;
    bar.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- publish: re-save the page with the new content inside it ---------- */
  var RESET = ':root{color-scheme:light;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
  function fullDocument(content) {
    var first = document.head && document.head.querySelector('style');
    var reset = (first && first.textContent) || RESET;
    var json = JSON.stringify(content).replace(/</g, '\\u003c');
    return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' + reset + '</style></head><body>' + window.WF_SHELL(json) + '</body></html>';
  }
  function publish() {
    if (busy) return;
    busy = true; note = null; render();
    use('artifact').then(function (art) {
      if (!art) throw { code: 'not_granted' };
      var out = WF.clone(draft); out.updatedAt = new Date().toISOString();
      ssDel('wf-draft'); ssSet('wf-tab', tab);
      return art.publish(fullDocument(out)).then(function () {
        WF.published = out; WF.content = out; draft = WF.clone(out); dirty = false; busy = false;
        note = { kind: 'ok', text: 'Published. The site is reloading with your changes.' }; render();
      });
    }).catch(function (e) {
      var c = e && e.code; busy = false;
      if (c !== 'conflict') ssSet('wf-draft', { base: baseStamp(), draft: draft });
      note = { kind: 'bad', text:
        c === 'conflict' ? 'Someone else published while you were editing. The page is reloading with their version; make your changes again on top of it.'
        : c === 'not_writer' || c === 'not_granted' || c === 'capability_disabled' || c === 'not_declared' ? 'This view cannot publish. Open the site on claude.ai signed in as the owner or an editor.'
        : c === 'too_large' ? 'The content is too large to publish. Shorten long descriptions and try again.'
        : c === 'rate_limited' ? 'Too many saves in a short time. Wait a minute, then publish again.'
        : 'Publishing did not go through. Your changes are still here; try again.' };
      render();
    });
  }

  window.WFAdmin = { mount: mount };
})();
