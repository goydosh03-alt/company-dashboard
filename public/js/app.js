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

// Theme toggle (light ⇄ dark). Persists in localStorage; no-flash applied in <head>.
window.toggleTheme = function () {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (dark) { document.documentElement.removeAttribute('data-theme'); try { localStorage.setItem('theme', 'light'); } catch (e) {} }
  else { document.documentElement.setAttribute('data-theme', 'dark'); try { localStorage.setItem('theme', 'dark'); } catch (e) {} }
  syncThemeIcon();
};
function syncThemeIcon() {
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  var ic = btn.querySelector('.material-symbols-outlined');
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (ic) ic.textContent = dark ? 'light_mode' : 'dark_mode';
  btn.title = dark ? 'Switch to light' : 'Switch to dark';
}
syncThemeIcon();

// L2 sub-head: sticky line appears on scroll
(function () {
  const sub = document.querySelector('.sub');
  const head = sub && sub.querySelector('.sub-head');
  if (!sub || !head) return;
  sub.addEventListener('scroll', () => head.classList.toggle('scrolled', sub.scrollTop > 2));
})();

// L2 sort toggle: A→Z WITHIN each category (group labels stay); click again → default
(function () {
  const icon = document.querySelector('.sub-head .material-symbols-outlined');
  const firstItem = document.querySelector('.sub .s-item');
  const cont = firstItem && firstItem.parentElement; // the items wrapper inside .sub
  if (!icon || !cont) return;
  const original = [...cont.children];
  const label = (a) => { let t = a.textContent; a.querySelectorAll('.material-symbols-outlined,.flag,.count').forEach((s) => { t = t.replace(s.textContent, ''); }); return t.trim().toLowerCase(); };
  let sorted = false;
  icon.style.cursor = 'pointer';
  icon.title = 'Sort A–Z';
  icon.addEventListener('click', () => {
    sorted = !sorted;
    original.forEach((el) => el.remove());
    if (sorted) {
      // flat A→Z (group labels hidden while sorted)
      original.filter((c) => c.classList.contains('s-item')).sort((a, b) => label(a).localeCompare(label(b))).forEach((el) => cont.appendChild(el));
    } else {
      original.forEach((el) => cont.appendChild(el));
    }
    icon.classList.toggle('sorted-on', sorted);
  });
})();
