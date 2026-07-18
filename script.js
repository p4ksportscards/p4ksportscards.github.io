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

  document.querySelectorAll('.card.scan').forEach(function (card) {
    card.addEventListener('click', function () {
      var img = card.querySelector('img');
      overlayImg.src = card.getAttribute('data-full');
      overlayImg.alt = img ? img.alt : '';
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
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
