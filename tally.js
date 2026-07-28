// Fills the homepage counts from data/stats.js, so the numbers track the
// spreadsheet instead of being typed into the page by hand.
//
// The HTML ships with the last-synced figures already in it, so the page reads
// correctly even if this never runs — this only overwrites them when fresher
// numbers are available.
(function () {
  var s = window.P4K_STATS;
  if (!s) return;

  function value(path) {
    var parts = path.split('.');
    var v = s;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return null;
      v = v[parts[i]];
    }
    return typeof v === 'number' ? v : null;
  }

  // 12156 -> "12,156"
  function comma(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  document.querySelectorAll('[data-stat]').forEach(function (el) {
    var n = value(el.getAttribute('data-stat'));
    if (n !== null) el.textContent = comma(n);
  });

  // The bar splits the WANT LIST - in hand vs still hunting - not the whole
  // catalogue. A player collection has no finish line, so measuring against
  // every card ever catalogued would invent one.
  document.querySelectorAll('[data-bar]').forEach(function (el) {
    var key = el.getAttribute('data-bar');
    var have = value(key + '.have');
    var want = value(key + '.want');
    var got = el.querySelector('.got');
    var need = el.querySelector('.need');
    if (!got || !need || have === null || want === null) return;
    var list = have + want;
    if (!list) return;
    got.style.width = ((have / list) * 100).toFixed(1) + '%';
    need.style.width = ((want / list) * 100).toFixed(1) + '%';
  });
})();
