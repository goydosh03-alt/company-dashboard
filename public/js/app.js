// Shared: turn data-go links into real navigation between pages
document.querySelectorAll('[data-go]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const s = (el.dataset.go || '').toLowerCase();
    window.location.href = s === 'home' ? '/' : '/' + s;
  });
});

// Shared custom dropdown (.dd) — reused on every page
window.ddToggle = function (e) {
  e.stopPropagation();
  const dd = e.currentTarget.closest('.dd');
  document.querySelectorAll('.dd.open').forEach((d) => { if (d !== dd) d.classList.remove('open'); });
  dd.classList.toggle('open');
};
window.ddPick = function (el) {
  const dd = el.closest('.dd'); const v = el.textContent.trim();
  dd.dataset.value = v; dd.querySelector('.dd-label').textContent = v; dd.classList.remove('open');
};
document.addEventListener('click', () => document.querySelectorAll('.dd.open').forEach((d) => d.classList.remove('open')));

// Sticky page header: offset under .ptop + show a line on scroll
(function () {
  const pm = document.querySelector('.panel-main');
  const ph = document.querySelector('.page-head');
  const ptop = document.querySelector('.ptop');
  if (!pm || !ph) return;
  if (ptop) ph.style.top = ptop.offsetHeight + 'px';
  pm.addEventListener('scroll', () => ph.classList.toggle('stuck', pm.scrollTop > 4));
})();

// L2 sort toggle: click the sub-head arrow → A→Z, click again → default
(function () {
  const icon = document.querySelector('.sub-head .material-symbols-outlined');
  const sub = icon && icon.closest('.sub');
  if (!sub) return;
  const original = [...sub.children].filter((c) => !c.classList.contains('sub-head'));
  const label = (a) => { let t = a.textContent; a.querySelectorAll('.material-symbols-outlined,.flag,.count').forEach((s) => { t = t.replace(s.textContent, ''); }); return t.trim().toLowerCase(); };
  let sorted = false;
  icon.style.cursor = 'pointer';
  icon.title = 'Sort A–Z';
  icon.addEventListener('click', () => {
    sorted = !sorted;
    original.forEach((el) => el.remove());
    if (sorted) {
      [...original].filter((c) => c.classList.contains('s-item')).sort((a, b) => label(a).localeCompare(label(b))).forEach((el) => sub.appendChild(el));
    } else {
      original.forEach((el) => sub.appendChild(el));
    }
    icon.textContent = sorted ? 'sort_by_alpha' : 'unfold_more';
  });
})();
