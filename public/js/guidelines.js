(function () {
  const sections = [...document.querySelectorAll('.gl-section')];
  if (!sections.length) return;

  const GL = {
    'gl-about': { t: 'About the system', d: 'What junoo.digital is, what it powers, and what it’s built from.' },
    'gl-brand': { t: 'Brand', d: 'The mark, brand colors and logo usage.' },
    'gl-a11y': { t: 'Accessibility', d: 'WCAG 2.1 AA baseline for everything we ship.' },
    'gl-layout': { t: 'Layout & Grid', d: 'Regions, grid rhythm and responsive rules shared by all products.' },
    'gl-interaction': { t: 'Interaction & States', d: 'One state model applied across every component.' },
    'gl-content': { t: 'Content & Voice', d: 'How we write — clear, concise, human.' },
    'gl-contribution': { t: 'Contribution', d: 'How foundations are written and proposed via GitHub.' },
  };
  const links = document.querySelectorAll('.sub .s-item[data-scroll]');
  const $ = (id) => document.getElementById(id);

  function show(id) {
    sections.forEach((s) => s.classList.toggle('active', s.id === id));
    links.forEach((x) => x.classList.toggle('active', x.dataset.scroll === '#' + id));
    const m = GL[id]; if (m) {
      if ($('phTitle')) $('phTitle').textContent = m.t;
      if ($('phDesc')) $('phDesc').textContent = m.d;
      if ($('pageCrumb')) $('pageCrumb').textContent = '/ ' + m.t;
    }
    const pm = document.querySelector('.panel-main'); if (pm) pm.scrollTop = 0;
  }

  links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); show(a.dataset.scroll.replace('#', '')); }));
  // overview topic cards
  document.querySelectorAll('[data-goto]').forEach((c) => c.addEventListener('click', (e) => { e.preventDefault(); show(c.dataset.goto); }));
})();
