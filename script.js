// Click a card to open the full-size scan in a lightbox; click anywhere or press Esc to close.
(function () {
  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<img alt=""><p class="lightbox-hint">tap anywhere to close</p>';
  document.body.appendChild(overlay);
  var overlayImg = overlay.querySelector('img');

  function close() {
    overlay.classList.remove('open');
    overlayImg.src = '';
    document.body.style.overflow = '';
  }

  function open(src, alt) {
    if (!src) return;
    overlayImg.src = src;
    overlayImg.alt = alt || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Shared so the checklist can open a scan too, rather than shipping a
  // second lightbox. Its rows are rendered on the fly, so it can't rely on
  // the load-time binding below.
  window.p4kLightbox = { open: open, close: close };

  document.querySelectorAll('.card.scan').forEach(function (card) {
    card.addEventListener('click', function () {
      var img = card.querySelector('img');
      open(card.getAttribute('data-full'), img ? img.alt : '');
    });
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  // ---- gallery: subcollection filters + show-more ----
  //
  // Galleries used to render every card at once. Lazy loading meant a visitor
  // only downloaded what they scrolled past, but the page still got very long —
  // one column on a phone, so 50 cards is about 20 screens. Showing a batch at
  // a time keeps that manageable however many cards a gallery ends up holding.
  var PAGE = 24;

  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card.scan'));
  var emptyNote = document.querySelector('.empty-note');
  var grid = document.querySelector('.card-grid');
  if (!cards.length || !grid) return;

  var filter = 'all';
  var shown = PAGE;
  var moreBtn = null;

  function matching() {
    return cards.filter(function (card) {
      if (filter === 'all') return true;
      return (card.getAttribute('data-cats') || '').split(' ').indexOf(filter) !== -1;
    });
  }

  function render() {
    var hits = matching();
    cards.forEach(function (c) { c.style.display = 'none'; });
    hits.slice(0, shown).forEach(function (c) { c.style.display = ''; });

    if (emptyNote && !emptyNote.classList.contains('coll-note')) {
      emptyNote.hidden = hits.length > 0;
    }
    if (moreBtn) {
      var left = hits.length - shown;
      moreBtn.hidden = left <= 0;
      moreBtn.textContent = left > 0
        ? 'show ' + Math.min(left, PAGE) + ' more' + (left > PAGE ? ' of ' + left : '')
        : '';
    }
  }

  if (cards.length > PAGE) {
    moreBtn = document.createElement('button');
    moreBtn.className = 'show-more';
    moreBtn.type = 'button';
    grid.parentNode.insertBefore(moreBtn, grid.nextSibling);
    moreBtn.addEventListener('click', function () { shown += PAGE; render(); });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('chip-active'); });
      chip.classList.add('chip-active');
      filter = chip.getAttribute('data-filter');
      shown = PAGE;          // a new filter starts from the top
      render();
    });
  });

  render();
})();
