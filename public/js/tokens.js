(function () {
  const sections = [...document.querySelectorAll('.tk-section')];
  if (!sections.length) return;
  const links = document.querySelectorAll('.sub .s-item[data-scroll]');
  const crumb = document.getElementById('pageCrumb');

  function show(sel) {
    sections.forEach((s) => s.classList.toggle('active', '#' + s.id === sel));
    const t = document.querySelector(sel);
    if (t && crumb) { const h = t.querySelector('.sec-title h3'); crumb.textContent = '/ ' + (h ? h.textContent.trim() : ''); }
    const pm = document.querySelector('.panel-main'); if (pm) pm.scrollTop = 0;
  }

  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    links.forEach((x) => x.classList.remove('active'));
    a.classList.add('active');
    show(a.dataset.scroll);
  }));

  window.openSync = () => document.getElementById('syncOverlay').classList.add('open');
  window.closeSync = () => document.getElementById('syncOverlay').classList.remove('open');
})();
