(function () {
  const sections = [...document.querySelectorAll('.gl-section')];
  if (!sections.length) return;

  const GL = {
    'gl-overview': { t: 'Overview', d: 'Where the system’s thinking lives — principles, rules and accessibility.' },
    'gl-principles': { t: 'Principles', d: 'The values that guide every design decision in the system.' },
    'gl-rules': { t: 'Rules', d: 'Hard rules everyone follows across the system.' },
    'gl-usage': { t: 'Usage', d: 'How to apply the system day to day.' },
    'gl-a11y': { t: 'Accessibility', d: 'WCAG 2.1 AA baseline for everything we ship.' },
    'gl-contribution': { t: 'Contribution', d: 'How guidelines are written and proposed via GitHub.' },
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
