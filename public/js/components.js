(function () {
  const $ = (id) => document.getElementById(id);

  // ---- component switch (sidebar) ----
  let COMP = {};
  try { COMP = JSON.parse($('compData').textContent); } catch (e) {}
  const sections = [...document.querySelectorAll('.comp-section')];
  const compLinks = document.querySelectorAll('.sub .s-item[data-comp]');
  function showComp(name) {
    sections.forEach((s) => s.classList.toggle('active', s.id === 'comp-' + name));
    const m = COMP[name]; if (m) {
      if ($('phTitle')) $('phTitle').textContent = m.t;
      if ($('phDesc')) $('phDesc').textContent = m.d;
      if ($('pageCrumb')) $('pageCrumb').textContent = '/ ' + m.t;
    }
    const pm = document.querySelector('.panel-main'); if (pm) pm.scrollTop = 0;
  }
  compLinks.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    compLinks.forEach((x) => x.classList.remove('active'));
    a.classList.add('active');
    showComp(a.dataset.comp);
  }));

  // ---- internal tabs (Overview / Anatomy / …) ----
  document.querySelectorAll('.ctabs').forEach((bar) => {
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.ctab'); if (!b) return;
      const sec = bar.closest('.comp-section');
      bar.querySelectorAll('.ctab').forEach((x) => x.classList.toggle('active', x === b));
      sec.querySelectorAll('.cpanel').forEach((p) => p.classList.toggle('active', p.dataset.panel === b.dataset.panel));
    });
  });

  // ---- Button playground ----
  if ($('btnPreview')) {
    const S = { variant: 'primary', size: 'md', icon: false, disabled: false };
    const classFor = () => 'btn btn-' + S.variant + (S.size !== 'md' ? ' btn-' + S.size : '');
    function render() {
      const icon = S.icon ? '<span class="material-symbols-outlined">add</span> ' : '';
      const dis = S.disabled ? ' disabled' : '';
      $('btnPreview').innerHTML = `<button class="${classFor()}"${dis}>${icon}Button</button>`;
      $('btnCode').textContent = `<button class="${classFor()}"${dis}>${S.icon ? '<span class="material-symbols-outlined">add</span> ' : ''}Button</button>`;
    }
    document.querySelectorAll('.pg .seg').forEach((seg) => seg.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
      S[seg.dataset.ctl] = b.dataset.v; render();
    }));
    document.querySelectorAll('.pg .tg').forEach((t) => t.addEventListener('click', () => { S[t.dataset.ctl] = !S[t.dataset.ctl]; t.classList.toggle('active', S[t.dataset.ctl]); render(); }));
    window.copyBtnCode = function () {
      navigator.clipboard && navigator.clipboard.writeText($('btnCode').textContent);
      const b = document.querySelector('.copy-btn'); if (b) { const old = b.innerHTML; b.innerHTML = '<span class="material-symbols-outlined">check</span> Copied'; setTimeout(() => (b.innerHTML = old), 1400); }
    };
    render();
  }
})();
