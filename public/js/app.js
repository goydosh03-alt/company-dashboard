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
