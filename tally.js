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

  // bar width = how much of that collection's catalogue is in hand
  document.querySelectorAll('[data-bar]').forEach(function (el) {
    var key = el.getAttribute('data-bar');
    var have = value(key + '.have');
    var cards = value(key + '.cards');
    var fill = el.querySelector('i');
    if (!fill || have === null || !cards) return;
    fill.style.width = Math.min(100, (have / cards) * 100).toFixed(1) + '%';
  });
})();
