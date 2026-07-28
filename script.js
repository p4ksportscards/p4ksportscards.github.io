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

  // Filter chips: show only cards tagged with the chosen subcollection.
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('.card.scan');
  var emptyNote = document.querySelector('.empty-note');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('chip-active'); });
      chip.classList.add('chip-active');
      var filter = chip.getAttribute('data-filter');
      var visible = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-cats') || '').split(' ');
        var show = filter === 'all' || cats.indexOf(filter) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (emptyNote) emptyNote.hidden = visible > 0;
    });
  });
})();
