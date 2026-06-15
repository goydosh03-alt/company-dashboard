(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('btnPreview')) return;

  const S = { variant: 'primary', size: 'md', icon: false, disabled: false };

  function classFor() {
    let c = 'btn btn-' + S.variant;
    if (S.size !== 'md') c += ' btn-' + S.size;
    return c;
  }
  function render() {
    const icon = S.icon ? '<span class="material-symbols-outlined">add</span> ' : '';
    const dis = S.disabled ? ' disabled' : '';
    $('btnPreview').innerHTML = `<button class="${classFor()}"${dis}>${icon}Button</button>`;
    $('btnCode').textContent = `<button class="${classFor()}"${dis}>${S.icon ? '<span class="material-symbols-outlined">add</span> ' : ''}Button</button>`;
  }

  document.querySelectorAll('.pg .seg').forEach((seg) => {
    seg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      S[seg.dataset.ctl] = b.dataset.v; render();
    });
  });
  document.querySelectorAll('.pg .tg').forEach((t) => {
    t.addEventListener('click', () => { S[t.dataset.ctl] = !S[t.dataset.ctl]; t.classList.toggle('active', S[t.dataset.ctl]); render(); });
  });

  window.copyBtnCode = function () {
    const txt = $('btnCode').textContent;
    navigator.clipboard && navigator.clipboard.writeText(txt);
    const b = document.querySelector('.copy-btn');
    if (b) { const old = b.innerHTML; b.innerHTML = '<span class="material-symbols-outlined">check</span> Copied'; setTimeout(() => (b.innerHTML = old), 1400); }
  };

  render();
})();
