(function () {
  if (!document.getElementById('tk-color')) return;

  const links = document.querySelectorAll('.sub .s-item[data-scroll]');
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.querySelector(a.dataset.scroll);
    if (t) { links.forEach((x) => x.classList.remove('active')); a.classList.add('active'); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));

  // highlight the section currently in view
  const map = {};
  links.forEach((a) => { const t = document.querySelector(a.dataset.scroll); if (t) map[t.id] = a; });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && map[en.target.id]) {
        links.forEach((x) => x.classList.remove('active'));
        map[en.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -70% 0px' });
  Object.keys(map).forEach((id) => obs.observe(document.getElementById(id)));

  window.openSync = () => document.getElementById('syncOverlay').classList.add('open');
  window.closeSync = () => document.getElementById('syncOverlay').classList.remove('open');
})();
