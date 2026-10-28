(function () {
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var current = root.dataset.theme || (media.matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  document.querySelectorAll('pre').forEach(function (pre) {
    var button = document.createElement('button');
    button.className = 'copy';
    button.type = 'button';
    button.textContent = 'Copy';
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(pre.querySelector('code').innerText).then(function () {
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = 'Copy'; }, 1500);
      });
    });
    pre.appendChild(button);
  });
})();

(function () {
  var targets = document.querySelectorAll('[data-stars]');
  if (!targets.length) return;
  fetch('https://api.github.com/repos/erkamyaman/capacitor-foldable')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (repo) {
      if (!repo || typeof repo.stargazers_count !== 'number') return;
      targets.forEach(function (el) { el.textContent = repo.stargazers_count; el.hidden = false; var wrap = el.closest('.gh-stars-count, .star-count'); if (wrap) wrap.hidden = false; });
    })
    .catch(function () {});
})();

(function () {
  var card = document.querySelector('.support-card');
  if (!card) return;
  var key = 'support-popup';
  var state = { seen: 0, until: 0 };
  try { state = JSON.parse(localStorage.getItem(key)) || state; } catch (e) {}
  if (state.until > Date.now()) return;

  setTimeout(function () {
    var overlay = document.createElement('div');
    overlay.className = 'support-overlay';
    var popup = document.createElement('div');
    popup.className = 'support-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-label', 'Support Capacitor Foldable');
    popup.innerHTML = '<button class="close" type="button" aria-label="Close">×</button>' +
      '<img class="logo" src="images/logo/logo.svg" alt="">' +
      '<h3>' + card.querySelector('h2').textContent + '</h3>' +
      '<p>Capacitor Foldable is free and open source. A star helps other developers find it, and sponsoring keeps it maintained as new foldables land.</p>';
    popup.appendChild(card.querySelector('.support-actions').cloneNode(true));
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    requestAnimationFrame(function () { overlay.classList.add('show'); });

    var onKey = function (event) { if (event.key === 'Escape') close(); };
    var close = function () {
      state.seen = (state.seen || 0) + 1;
      if (state.seen >= 2) state = { seen: 0, until: Date.now() + 7 * 24 * 60 * 60 * 1000 };
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); }, 250);
    };
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', function (event) { if (event.target === overlay) close(); });
    popup.querySelector('.close').addEventListener('click', close);
    popup.querySelectorAll('.support-actions a').forEach(function (a) { a.addEventListener('click', close); });
  }, 5000);
})();
