// The Rotation — favourite Shaqs on the homepage.
//
// Card details come from data/favs.js, which tools/build-favs.ps1 generates by
// looking each card up in the spreadsheet export. Nothing here is hand-typed,
// so a resync keeps the serial numbers and grades honest.
//
// Only the visible card's full-size image is ever fetched; thumbnails are
// separate small files. Loading all seven stages up front would be ~600 KB on
// the front door to show one card.
(function () {
  var F = window.P4K_FAVS;
  var stage = document.getElementById('rotStage');
  if (!F || !F.length || !stage) return;

  var info   = document.getElementById('rotInfo');
  var card   = document.getElementById('rotCard');
  var thumbs = document.getElementById('rotThumbs');
  var i = 0;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  thumbs.innerHTML = F.map(function (c, j) {
    return '<button type="button" data-i="' + j + '" aria-label="' + esc(c.season + ' ' + c.set) + '">' +
           '<img src="images/favs/t-' + esc(c.slug) + '.jpg" alt="" loading="lazy"></button>';
  }).join('');

  function paint() {
    var c = F[i];
    card.src = 'images/favs/' + c.slug + '.jpg';
    card.alt = c.season + ' ' + c.set + (c.num ? ' #' + c.num : '') + ', Shaquille O’Neal';

    var tags = '';
    if (c.sn)     tags += '<span class="rot-tag sn">' + esc(c.sn) + '</span>';
    if (c.graded) tags += '<span class="rot-tag gr">' + esc(c.graded) + '</span>';
    if (c.natl)   tags += '<span class="rot-tag nat">' + esc(c.natl) + '</span>';

    info.innerHTML =
      '<div class="rot-year">' + esc(c.season) + '</div>' +
      '<div class="rot-set">' + esc(c.set) + (c.num ? ' · #' + esc(c.num) : '') + '</div>' +
      (tags ? '<div class="rot-tags">' + tags + '</div>' : '');

    thumbs.querySelectorAll('button').forEach(function (b, j) {
      b.classList.toggle('on', j === i);
      if (j === i) { b.setAttribute('aria-current', 'true'); } else { b.removeAttribute('aria-current'); }
    });
  }

  function go(n) { i = (n + F.length) % F.length; paint(); }

  document.getElementById('rotPrev').addEventListener('click', function () { go(i - 1); });
  document.getElementById('rotNext').addEventListener('click', function () { go(i + 1); });
  thumbs.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-i]') : null;
    if (b) go(+b.getAttribute('data-i'));
  });

  // arrow keys, but only while the carousel has focus — otherwise they'd
  // hijack arrow keys for the whole page
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
  });

  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1));
    x0 = null;
  }, { passive: true });

  paint();
})();
