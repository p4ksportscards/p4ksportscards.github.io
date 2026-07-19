// Checklist page: collection switching, filters, and rendering.
(function () {
  var PAGE = 300; // rows rendered at a time, so thousands of rows never hit the page at once

  var COLLECTIONS = {
    shaq:    { global: 'SHAQ_DATA',    file: 'data/shaq.js',    multiPlayer: false },
    rookies: { global: 'ROOKIES_DATA', file: 'data/rookies.js', multiPlayer: true },
    ej:      { global: 'EJ_DATA',      file: 'data/ej.js',      multiPlayer: true }
  };

  var q = document.getElementById('q');
  var playerSel = document.getElementById('player');
  var seasonSel = document.getElementById('season');
  var mftSel = document.getElementById('mft');
  var setSel = document.getElementById('set');
  var settypeSel = document.getElementById('settype');
  var countEl = document.getElementById('count');
  var listEl = document.getElementById('list');
  var moreBtn = document.getElementById('more');
  var clearBtn = document.getElementById('clear');
  var ownChips = document.querySelectorAll('.chip[data-own]');
  var flagChips = document.querySelectorAll('.chip[data-flag]');
  var collChips = document.querySelectorAll('.chip[data-coll]');

  var current = 'shaq';
  var data = window.SHAQ_DATA || [];
  var ownMode = 'all';
  var flags = { sn: false, graded: false, intl: false };
  var shown = PAGE;

  function seasonLabel(s) {
    return s.replace(/-000$/, '');
  }

  function fill(sel, values) {
    var currentVal = sel.value;
    while (sel.options.length > 1) sel.remove(1);
    values.forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = sel === seasonSel ? seasonLabel(v) : v;
      sel.appendChild(o);
    });
    sel.value = values.indexOf(currentVal) !== -1 ? currentVal : '';
  }

  function uniq(arr, key) {
    var seen = {};
    var out = [];
    arr.forEach(function (c) {
      var v = c[key];
      if (v && !seen[v]) { seen[v] = true; out.push(v); }
    });
    return out;
  }

  function matches(c) {
    if (playerSel.value && c.player !== playerSel.value) return false;
    if (seasonSel.value && c.season !== seasonSel.value) return false;
    if (mftSel.value && c.mft !== mftSel.value) return false;
    if (setSel.value && c.set !== setSel.value) return false;
    if (settypeSel.value && c.settype !== settypeSel.value) return false;
    if (ownMode === 'have' && !c.have) return false;
    if (ownMode === 'want' && !c.want) return false;
    if (flags.sn && !(c.sn || c.snt)) return false;
    if (flags.graded && !c.graded) return false;
    if (flags.intl && !c.natl) return false;
    if (q.value) {
      var hay = (c.player + ' ' + c.season + ' ' + c.mft + ' ' + c.set + ' ' + c.num + ' ' +
                 c.type + ' ' + c.feat + ' ' + c.team + ' ' + c.natl + ' ' + c.settype).toLowerCase();
      var words = q.value.toLowerCase().split(/\s+/);
      for (var i = 0; i < words.length; i++) {
        if (hay.indexOf(words[i]) === -1) return false;
      }
    }
    return true;
  }

  function badge(text, cls) {
    return '<span class="badge' + (cls ? ' ' + cls : '') + '">' + text + '</span>';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function rowHtml(c) {
    var badges = '';
    if (c.type) badges += badge(esc(c.type), 'b-sn');
    if (c.sn) badges += badge('/' + esc(c.sn), 'b-sn');
    else if (c.snt) badges += badge('serial #’d', 'b-sn');
    if (c.print && !c.sn) badges += badge('print run ' + esc(c.print), '');
    if (c.graded) badges += badge('graded', 'b-graded');
    if (c.natl) badges += badge(esc(c.natl), 'b-intl');
    if (c.auto) badges += badge('auto', 'b-sn');
    if (c.settype && c.settype !== 'Base') badges += badge(esc(c.settype), '');
    var own = c.have ? '<span class="pill pill-have">have' + (c.have > 1 ? ' ×' + esc(c.have) : '') + '</span>'
            : c.want ? '<span class="pill pill-want">want</span>' : '';
    var title = esc(c.set) + (c.num ? ' #' + esc(c.num) : '');
    if (COLLECTIONS[current].multiPlayer && c.player) {
      title = esc(c.player) + ' — ' + title;
    }
    return '<div class="check-row">' +
      '<div class="check-main">' +
        '<strong>' + title + '</strong>' +
        '<span class="check-sub">' + esc(seasonLabel(c.season)) + (c.mft ? ' · ' + esc(c.mft) : '') +
          (c.team ? ' · ' + esc(c.team) : '') + '</span>' +
        (badges ? '<span class="check-badges">' + badges + '</span>' : '') +
      '</div>' + own + '</div>';
  }

  function render() {
    var filtered = data.filter(matches);
    // Set dropdown narrows to whatever the other filters allow
    var forSets = data.filter(function (c) {
      return (!playerSel.value || c.player === playerSel.value) &&
             (!seasonSel.value || c.season === seasonSel.value) &&
             (!mftSel.value || c.mft === mftSel.value);
    });
    fill(setSel, uniq(forSets, 'set').sort());

    var have = 0, want = 0;
    filtered.forEach(function (c) { if (c.have) have++; else if (c.want) want++; });
    countEl.textContent = filtered.length.toLocaleString() + ' cards · ' +
      have.toLocaleString() + ' in the collection · ' + want.toLocaleString() + ' wanted';

    listEl.innerHTML = filtered.slice(0, shown).map(rowHtml).join('');
    moreBtn.hidden = filtered.length <= shown;

    // Light up the Clear button only when a filter is active
    var anyFilter = !!(q.value || playerSel.value || seasonSel.value || mftSel.value ||
      setSel.value || settypeSel.value || ownMode !== 'all' || flags.sn || flags.graded || flags.intl);
    clearBtn.classList.toggle('armed', anyFilter);
  }

  function reset() { shown = PAGE; render(); }

  function clearFilters() {
    q.value = '';
    [playerSel, seasonSel, mftSel, setSel, settypeSel].forEach(function (s) { s.value = ''; });
    ownMode = 'all';
    ownChips.forEach(function (c) { c.classList.toggle('chip-active', c.getAttribute('data-own') === 'all'); });
    flags = { sn: false, graded: false, intl: false };
    flagChips.forEach(function (c) { c.classList.remove('chip-active'); });
    reset();
  }

  function initDropdowns() {
    var multi = COLLECTIONS[current].multiPlayer;
    playerSel.hidden = !multi;
    if (multi) fill(playerSel, uniq(data, 'player').sort());
    fill(seasonSel, uniq(data, 'season'));
    fill(mftSel, uniq(data, 'mft').sort());
    fill(settypeSel, uniq(data, 'settype').sort());
  }

  function activate(key) {
    current = key;
    data = window[COLLECTIONS[key].global] || [];
    collChips.forEach(function (c) { c.classList.toggle('chip-active', c.getAttribute('data-coll') === key); });
    initDropdowns();
    clearFilters();
  }

  function switchCollection(key) {
    var cfg = COLLECTIONS[key];
    if (window[cfg.global]) { activate(key); return; }
    countEl.textContent = 'loading…';
    var s = document.createElement('script');
    s.src = cfg.file;
    s.onload = function () { activate(key); };
    s.onerror = function () { countEl.textContent = 'could not load this collection — try refreshing the page.'; };
    document.body.appendChild(s);
  }

  collChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      switchCollection(chip.getAttribute('data-coll'));
    });
  });

  [playerSel, seasonSel, mftSel, setSel, settypeSel].forEach(function (s) {
    s.addEventListener('change', reset);
  });
  q.addEventListener('input', reset);

  ownChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      ownChips.forEach(function (c) { c.classList.remove('chip-active'); });
      chip.classList.add('chip-active');
      ownMode = chip.getAttribute('data-own');
      reset();
    });
  });

  flagChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-flag');
      flags[f] = !flags[f];
      chip.classList.toggle('chip-active', flags[f]);
      reset();
    });
  });

  clearBtn.addEventListener('click', clearFilters);

  moreBtn.addEventListener('click', function () {
    shown += PAGE;
    render();
  });

  initDropdowns();
  render();
})();
