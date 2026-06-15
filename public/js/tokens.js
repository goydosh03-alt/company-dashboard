(function () {
  const sections = [...document.querySelectorAll('.tk-section')];
  if (!sections.length) return;

  const TK = {
    'tk-color': { t: 'Color', d: 'Brand primitives and the semantic roles that map to them.' },
    'tk-type': { t: 'Typography', d: 'The type scale — sizes, weights and line-heights.' },
    'tk-spacing': { t: 'Spacing', d: 'A 4px base scale for padding, gaps and margins.' },
    'tk-radius': { t: 'Radius', d: 'Corner radii from subtle to fully rounded.' },
    'tk-shadows': { t: 'Shadows · Elevation', d: 'Elevation levels for cards, popovers and modals.' },
    'tk-motion': { t: 'Motion', d: 'Durations and easing curves for transitions.' },
    'tk-breakpoints': { t: 'Breakpoints', d: 'Min-width breakpoints used across layouts.' },
    'tk-icons': { t: 'Iconography', d: 'Material Symbols — sizes, weight and usage.' },
  };

  const links = document.querySelectorAll('.sub .s-item[data-scroll]');
  const $ = (id) => document.getElementById(id);

  function show(sel) {
    const id = sel.replace('#', '');
    sections.forEach((s) => s.classList.toggle('active', s.id === id));
    const m = TK[id]; if (m) {
      if ($('phTitle')) $('phTitle').textContent = m.t;
      if ($('phDesc')) $('phDesc').textContent = m.d;
      if ($('pageCrumb')) $('pageCrumb').textContent = '/ ' + m.t;
    }
    const pm = document.querySelector('.panel-main'); if (pm) pm.scrollTop = 0;
  }

  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    links.forEach((x) => x.classList.remove('active'));
    a.classList.add('active');
    show(a.dataset.scroll);
  }));

  window.openSync = () => $('syncOverlay').classList.add('open');
  window.closeSync = () => $('syncOverlay').classList.remove('open');
})();
