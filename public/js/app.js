// Shared: turn data-go links into real navigation between pages
document.querySelectorAll('[data-go]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const s = (el.dataset.go || '').toLowerCase();
    window.location.href = s === 'home' ? '/' : '/' + s;
  });
});
