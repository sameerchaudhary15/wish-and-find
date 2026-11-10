/* Public site: reads site-config.js plus published content and draws the pages. */
(function () {
  'use strict';
  var CFG = window.SITE_CONFIG || {};
  var app = document.getElementById('app');

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function sample(list) { return clone(list || []).map(function (x) { x.sample = true; return x; }); }

  function defaults() {
    return {
      v: 1, updatedAt: null, settings: {},
      properties: sample(CFG.sampleProperties),
      reels: sample(CFG.sampleReels),
      localities: sample(CFG.sampleLocalities)
    };
  }
  function loadPublished() {
    try {
      var d = JSON.parse(document.getElementById('wf-content').textContent.trim() || 'null');
      if (d && d.v) {
        d.settings = d.settings || {}; d.properties = d.properties || [];
        d.reels = d.reels || []; d.localities = d.localities || [];
        return d;
      }
    } catch (e) { /* fall through to defaults */ }
    return null;
  }

  var SETTING_PATH = {
    whatsappNumber: ['contact', 'whatsappNumber'], whatsappMessage: ['contact', 'whatsappMessage'],
    phone: ['contact', 'phone'], email: ['contact', 'email'], address: ['contact', 'address'],
    hours: ['contact', 'hours'], heroHeadline: ['hero', 'headline'], heroSub: ['hero', 'sub'],
    announcement: ['announcement']
  };
  function configValue(key) {
    var p = SETTING_PATH[key], v = CFG;
    for (var i = 0; p && i < p.length; i++) v = v ? v[p[i]] : '';
    return v == null ? '' : v;
  }
  function setting(key, content) {
    var s = (content || WF.content).settings || {};
    return Object.prototype.hasOwnProperty.call(s, key) ? s[key] : configValue(key);
  }
  function waLink(message, content) {
    var num = String(setting('whatsappNumber', content) || '').replace(/\D/g, '');
    var text = encodeURIComponent(message || setting('whatsappMessage', content) || '');
    return 'https://wa.me/' + num + (text ? '?text=' + text : '');
  }
  function fmtPrice(lakh) {
    var n = Number(lakh) || 0;
    if (n >= 100) return '\u20B9' + (n / 100).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    return '\u20B9' + n.toLocaleString('en-IN') + ' L';
  }
  function fmtArea(a) { return (Number(a) || 0).toLocaleString('en-IN') + ' sq ft'; }
  function specLine(p) {
    return (p.bhk > 0 ? p.bhk + ' BHK \u00B7 ' : '') + fmtArea(p.area);
  }
  var SCORE_KEYS = [['safety', 'Safety'], ['amenities', 'Amenities'], ['connectivity', 'Connectivity'], ['sentiment', 'Community sentiment']];
  function overall(l) {
    var s = l.scores || {}, t = 0;
    SCORE_KEYS.forEach(function (k) { t += Number(s[k[0]]) || 0; });
    return Math.round(t / SCORE_KEYS.length);
  }
  function grade(n) {
    return n >= 80 ? ['Strong', 'good'] : n >= 65 ? ['Good', 'good'] : n >= 50 ? ['Mixed', 'warn'] : ['Weak', 'bad'];
  }
  function assetUrl(id) { return '/_blob/' + encodeURIComponent(id); }

  var WA_ICON = '<svg class="wa-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 5h16v11H10l-6 4z"/></svg>';

  /* ---------- shared pieces ---------- */
  function reportHTML(l, compact) {
    var o = overall(l), g = grade(o);
    var bars = SCORE_KEYS.map(function (k) {
      var v = Math.max(0, Math.min(100, Number((l.scores || {})[k[0]]) || 0));
      return '<div class="bar-row"><span class="bar-label">' + k[1] + '</span>' +
        '<span class="bar-track"><span class="bar-fill ' + grade(v)[1] + '" style="width:' + v + '%"></span></span>' +
        '<span class="bar-val">' + v + '</span></div>';
    }).join('');
    var events = (l.events || []).filter(Boolean);
    return '<article class="report' + (compact ? ' compact' : '') + '">' +
      '<header class="report-head"><div><p class="kicker">Neighbourhood report' + (l.sample ? ' <span class="tag sample">Sample</span>' : '') + '</p>' +
      '<h3>' + esc(l.name) + '</h3><p class="muted">' + esc(l.city || '') + '</p></div>' +
      '<div class="score ' + g[1] + '"><span class="score-num">' + o + '</span><span class="score-of">/100</span><span class="score-word">' + g[0] + '</span></div></header>' +
      '<div class="bars">' + bars + '</div>' +
      (compact ? '' : '<p class="report-summary">' + esc(l.summary || '') + '</p>' +
        (events.length ? '<div class="events"><h4>Recent in the area</h4><ul>' + events.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '') +
        '<footer class="report-foot"><span>Sources: public reviews, local news, community discussion</span><span>Last refreshed: ' + esc(l.updated || 'not set') + '</span></footer>') +
      '</article>';
  }

  function propertyCard(p) {
    var msg = 'Hello Wish & Find, I would like details of this property: ' + p.title + ' (' + p.locality + ', ' + fmtPrice(p.price) + ').';
    var media = p.photo
      ? '<img src="' + assetUrl(p.photo) + '" alt="' + esc(p.title) + '" loading="lazy">'
      : '<div class="ph"><span class="ph-type">' + esc(p.type) + '</span><span class="ph-spec">' + esc(specLine(p)) + '</span></div>';
    return '<article class="card prop">' +
      '<div class="prop-media">' + media + '<span class="chip status">' + esc(p.status) + '</span>' +
      (p.sample ? '<span class="tag sample on-media">Sample listing</span>' : '') + '</div>' +
      '<div class="prop-body"><p class="prop-loc">' + esc(p.locality) + (p.featured ? ' <span class="tag">Featured</span>' : '') + '</p>' +
      '<h3>' + esc(p.title) + '</h3>' +
      '<p class="prop-spec">' + esc(p.type) + ' \u00B7 ' + esc(specLine(p)) + '</p>' +
      '<p class="prop-desc">' + esc(p.description || '') + '</p>' +
      (p.rera ? '<p class="prop-rera">RERA: ' + esc(p.rera) + '</p>' : '') +
      '<div class="prop-foot"><span class="price">' + fmtPrice(p.price) + '</span>' +
      '<a class="btn small wa" target="_blank" rel="noopener" href="' + esc(waLink(msg)) + '">' + WA_ICON + 'Enquire</a></div></div></article>';
  }

  function reelCard(r, i) {
    var inner;
    if (r.assetId) {
      inner = '<video src="' + assetUrl(r.assetId) + '" controls playsinline preload="metadata"></video>';
    } else {
      inner = '<div class="reel-ph tone' + (i % 4) + '"><span class="reel-mark" aria-hidden="true"></span>' +
        (r.link ? '<a class="btn small ghost-light" target="_blank" rel="noopener" href="' + esc(r.link) + '">Watch reel</a>' : '<span class="reel-soon">Video coming soon</span>') + '</div>';
    }
    return '<article class="reel"><div class="reel-frame">' + inner +
      (r.sample ? '<span class="tag sample on-media">Sample</span>' : '') + '</div>' +
      '<h3>' + esc(r.title) + '</h3><p>' + esc(r.caption || '') + '</p></article>';
  }

  /* ---------- public site ---------- */
  var ui = { q: '', type: '', status: '', budget: '', loc: null };
  var BUDGETS = [['', 'Any budget'], ['0-100', 'Under \u20B91 Cr'], ['100-200', '\u20B91 Cr to \u20B92 Cr'], ['200-400', '\u20B92 Cr to \u20B94 Cr'], ['400-999999', 'Above \u20B94 Cr']];

  function visibleProps() {
    var c = WF.content, q = ui.q.trim().toLowerCase();
    var range = ui.budget ? ui.budget.split('-').map(Number) : null;
    return c.properties.filter(function (p) {
      if (p.visible === false) return false;
      if (ui.type && p.type !== ui.type) return false;
      if (ui.status && p.status !== ui.status) return false;
      if (range && !(p.price >= range[0] && p.price < range[1])) return false;
      if (q && (p.title + ' ' + p.locality + ' ' + p.type).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
  }
  function options(list, cur, anyLabel) {
    return '<option value="">' + anyLabel + '</option>' + list.map(function (v) {
      return '<option' + (v === cur ? ' selected' : '') + '>' + esc(v) + '</option>';
    }).join('');
  }
  function uniq(key) {
    var seen = {}, out = [];
    WF.content.properties.forEach(function (p) { if (p.visible !== false && p[key] && !seen[p[key]]) { seen[p[key]] = 1; out.push(p[key]); } });
    return out;
  }

  function drawProps() {
    var list = visibleProps(), el = document.getElementById('prop-grid');
    if (!el) return;
    el.innerHTML = list.length ? list.map(propertyCard).join('')
      : '<div class="empty"><p><strong>No properties match these filters.</strong></p><p>Clear a filter, or tell us what you are looking for and we will search for you.</p>' +
        '<a class="btn wa" target="_blank" rel="noopener" href="' + esc(waLink('Hello Wish & Find, I am looking for a property and could not find a match on the website.')) + '">' + WA_ICON + 'Ask on WhatsApp</a></div>';
    var n = document.getElementById('prop-count');
    if (n) n.textContent = list.length + (list.length === 1 ? ' property' : ' properties');
  }
  function drawReport() {
    var c = WF.content, el = document.getElementById('report-panel');
    if (!el) return;
    var l = c.localities.filter(function (x) { return x.id === ui.loc; })[0] || c.localities[0];
    if (!l) { el.innerHTML = '<div class="empty"><p><strong>Reports are being prepared.</strong></p><p>Message us with the sector you are considering.</p></div>'; return; }
    ui.loc = l.id;
    el.innerHTML = reportHTML(l, false);
    var tabs = document.querySelectorAll('#loc-tabs button');
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute('aria-pressed', tabs[i].dataset.loc === l.id ? 'true' : 'false');
  }

  function renderSite() {
    var c = WF.content, B = CFG.brand || {}, H = CFG.hero || {};
    var announce = setting('announcement');
    var first = c.localities[0];
    var reels = c.reels.filter(function (r) { return r.visible !== false; });
    var address = String(setting('address') || '');
    var phone = setting('phone'), email = setting('email');
    var nav = [['reports', 'Reports'], ['properties', 'Properties'], ['reels', 'Reels'], ['services', 'Services'], ['plans', 'Plans'], ['contact', 'Contact']];

    app.innerHTML =
      (announce ? '<div class="announce"><div class="wrap">' + esc(announce) + '</div></div>' : '') +
      '<header class="site-head"><div class="wrap head-row">' +
        '<a class="logo" href="#top"><span class="logo-mark" aria-hidden="true"></span>' + esc(B.name || 'Wish & Find') + '</a>' +
        '<nav class="nav" aria-label="Main">' + nav.map(function (n) { return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</nav>' +
        '<a class="btn small wa" target="_blank" rel="noopener" href="' + esc(waLink()) + '">' + WA_ICON + '<span>WhatsApp</span></a>' +
      '</div></header>' +

      '<main id="top">' +
      '<section class="hero"><div class="wrap hero-grid">' +
        '<div class="hero-copy"><p class="kicker">' + esc(H.eyebrow || '') + '</p>' +
          '<h1>' + esc(setting('heroHeadline')) + '</h1>' +
          '<p class="lead">' + esc(setting('heroSub')) + '</p>' +
          '<form class="search" id="hero-search" role="search"><label class="sr" for="hero-q">Search a locality</label>' +
            '<input id="hero-q" type="search" placeholder="' + esc(H.searchPlaceholder || 'Search a locality') + '" autocomplete="off">' +
            '<button class="btn" type="submit">Search</button></form>' +
          '<p class="hero-links"><a class="btn wa" target="_blank" rel="noopener" href="' + esc(waLink()) + '">' + WA_ICON + 'Chat on WhatsApp to learn more</a>' +
            '<a class="link" href="#properties">Browse properties</a></p></div>' +
        '<div class="hero-report">' + (first ? reportHTML(first, true) : '') + '</div>' +
      '</div></section>' +

      '<section class="band" id="reports"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">Neighbourhood reports</p><h2>One scorecard for every locality</h2></div>' +
          '<p class="sec-note">Four scores out of 100, the reasons behind them, and what has changed recently.</p></div>' +
        '<div class="loc-tabs" id="loc-tabs" role="group" aria-label="Choose a locality">' +
          c.localities.map(function (l) { return '<button type="button" data-loc="' + esc(l.id) + '" aria-pressed="false">' + esc(l.name) + ' <span class="loc-score">' + overall(l) + '</span></button>'; }).join('') + '</div>' +
        '<div id="report-panel"></div>' +
      '</div></section>' +

      '<section class="band alt" id="properties"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">Properties</p><h2>Homes we have checked ourselves</h2></div>' +
          '<p class="sec-note" id="prop-count"></p></div>' +
        '<form class="filters" id="prop-filters">' +
          '<label class="sr" for="f-q">Search properties</label><input id="f-q" type="search" placeholder="Search title or locality" value="' + esc(ui.q) + '">' +
          '<label class="sr" for="f-type">Type</label><select id="f-type">' + options(uniq('type'), ui.type, 'All types') + '</select>' +
          '<label class="sr" for="f-status">Status</label><select id="f-status">' + options(uniq('status'), ui.status, 'Any status') + '</select>' +
          '<label class="sr" for="f-budget">Budget</label><select id="f-budget">' + BUDGETS.map(function (b) { return '<option value="' + b[0] + '"' + (b[0] === ui.budget ? ' selected' : '') + '>' + b[1] + '</option>'; }).join('') + '</select>' +
        '</form>' +
        '<div class="prop-grid" id="prop-grid"></div>' +
      '</div></section>' +

      '<section class="band" id="reels"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">Reels</p><h2>Walk the area before you visit</h2></div>' +
          '<div class="slider-btns"><button type="button" class="icon-btn" id="reel-prev" aria-label="Previous reels">&larr;</button><button type="button" class="icon-btn" id="reel-next" aria-label="Next reels">&rarr;</button></div></div>' +
        (reels.length ? '<div class="reel-track" id="reel-track" tabindex="0" aria-label="Reels">' + reels.map(reelCard).join('') + '</div>'
          : '<div class="empty"><p><strong>Reels will appear here.</strong></p><p>Short videos of localities and site visits are added from the Admin page.</p></div>') +
      '</div></section>' +

      '<section class="band alt" id="services"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">Why ' + esc(B.name || 'Wish & Find') + '</p><h2>A real estate firm that shows its working</h2></div></div>' +
        '<div class="svc-grid">' + (CFG.services || []).map(function (s) { return '<div class="svc"><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div>'; }).join('') + '</div>' +
        '<h3 class="steps-title">How it works</h3>' +
        '<ol class="steps">' + (CFG.steps || []).map(function (s) { return '<li><h4>' + esc(s.title) + '</h4><p>' + esc(s.text) + '</p></li>'; }).join('') + '</ol>' +
      '</div></section>' +

      '<section class="band" id="plans"><div class="wrap">' +
        '<div class="sec-head"><div><p class="kicker">Plans</p><h2>Start free, pay when you are serious</h2></div></div>' +
        '<div class="plan-grid">' + (CFG.plans || []).map(function (p) {
          return '<div class="plan' + (p.highlight ? ' hl' : '') + '"><p class="plan-note">' + esc(p.note || '') + '</p><h3>' + esc(p.name) + '</h3><p class="plan-price">' + esc(p.price) + '</p>' +
            '<ul>' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
            '<a class="btn ' + (p.highlight ? 'wa' : 'ghost') + '" target="_blank" rel="noopener" href="' + esc(waLink('Hello Wish & Find, I would like to know more about the ' + p.name + ' plan.')) + '">' + (p.highlight ? WA_ICON : '') + 'Ask about ' + esc(p.name) + '</a></div>';
        }).join('') + '</div>' +
        '<div class="faq"><h3>Questions buyers ask</h3>' + (CFG.faqs || []).map(function (f) { return '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join('') + '</div>' +
      '</div></section>' +

      '<section class="band contact" id="contact"><div class="wrap contact-grid">' +
        '<div><p class="kicker">Contact</p><h2>Talk to us on WhatsApp</h2>' +
          '<p class="lead">Tell us the sector or the budget you have in mind. We reply with the reports and the properties that fit.</p>' +
          '<a class="btn wa big" target="_blank" rel="noopener" href="' + esc(waLink()) + '">' + WA_ICON + 'Open WhatsApp chat</a></div>' +
        '<dl class="contact-list">' +
          '<div><dt>Office</dt><dd>' + esc(address).replace(/\n/g, '<br>') + '<br><a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent((CFG.contact || {}).mapsQuery || address) + '">Open in Google Maps</a></dd></div>' +
          '<div><dt>Hours</dt><dd>' + esc(setting('hours')) + '</dd></div>' +
          (phone ? '<div><dt>Phone</dt><dd class="sel">' + esc(phone) + '</dd></div>' : '') +
          (email ? '<div><dt>Email</dt><dd class="sel">' + esc(email) + '</dd></div>' : '') +
        '</dl>' +
      '</div></section>' +
      '</main>' +

      '<footer class="site-foot"><div class="wrap foot-row"><div><strong>' + esc(B.name || '') + '</strong><p>' + esc(B.footerNote || '') + '</p></div>' +
        '<p class="foot-links">' + nav.map(function (n) { return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<a href="#admin">Admin</a></p></div></footer>' +
      '<a class="wa-float" target="_blank" rel="noopener" href="' + esc(waLink()) + '" aria-label="Chat on WhatsApp">' + WA_ICON + '<span>Chat with us</span></a>';

    drawReport(); drawProps(); bindSite();
  }

  function bindSite() {
    var tabs = document.getElementById('loc-tabs');
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-loc]'); if (!b) return;
      ui.loc = b.dataset.loc; drawReport();
    });
    var f = document.getElementById('prop-filters');
    function read() {
      ui.q = document.getElementById('f-q').value; ui.type = document.getElementById('f-type').value;
      ui.status = document.getElementById('f-status').value; ui.budget = document.getElementById('f-budget').value; drawProps();
    }
    f.addEventListener('input', read); f.addEventListener('change', read);
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    document.getElementById('hero-search').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = document.getElementById('hero-q').value.trim(), ql = q.toLowerCase();
      var hit = ql && WF.content.localities.filter(function (l) { return l.name.toLowerCase().indexOf(ql) >= 0; })[0];
      ui.q = q; document.getElementById('f-q').value = q; drawProps();
      if (hit) { ui.loc = hit.id; drawReport(); }
      scrollToId(hit ? 'reports' : 'properties');
    });
    var track = document.getElementById('reel-track');
    function slide(dir) { if (track) track.scrollBy({ left: dir * Math.max(240, track.clientWidth * 0.8), behavior: 'smooth' }); }
    document.getElementById('reel-prev').addEventListener('click', function () { slide(-1); });
    document.getElementById('reel-next').addEventListener('click', function () { slide(1); });
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- routing ---------- */
  var view = '';
  function route() {
    var h = (location.hash || '').replace(/^#/, '');
    if (h === 'admin') {
      view = 'admin';
      if (window.WFAdmin) window.WFAdmin.mount(app); else app.innerHTML = '<p class="boot">Admin could not load.</p>';
      window.scrollTo(0, 0);
      return;
    }
    if (view !== 'site') { view = 'site'; renderSite(); }
    if (h && h !== 'top') setTimeout(function () { scrollToId(h); }, 30); else if (h === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.WF = {
    CFG: CFG, published: loadPublished(), content: null, defaults: defaults,
    esc: esc, clone: clone, setting: setting, configValue: configValue, waLink: waLink,
    fmtPrice: fmtPrice, overall: overall, grade: grade, assetUrl: assetUrl, SCORE_KEYS: SCORE_KEYS,
    SETTING_KEYS: Object.keys(SETTING_PATH), route: route
  };
  WF.content = WF.published || defaults();

  window.addEventListener('hashchange', route);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else route();
})();
