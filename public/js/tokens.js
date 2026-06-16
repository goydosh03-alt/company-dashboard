(function () {
  const sections = [...document.querySelectorAll('.tk-section')];
  if (!sections.length) return;

  // each group: title + desc + a REAL primitive→semantic→component chain for that token type
  const TK = {
    'tk-color':       { t: 'Color', d: 'Brand primitives and the semantic roles that map to them.', p: 'red/500 = #e5484d', s: 'color/accent → red/500', c: 'button/bg → color/accent' },
    'tk-type':        { t: 'Typography', d: 'The type scale — sizes, weights and line-heights.', p: 'size/16 · weight/650', s: 'text/title → 16/650', c: 'card/title → text/title' },
    'tk-spacing':     { t: 'Spacing', d: 'A 4px base scale for padding, gaps and margins.', p: 'space/4 = 16px', s: 'space/stack → space/4', c: 'card/gap → space/stack' },
    'tk-radius':      { t: 'Radius', d: 'Corner radii from subtle to fully rounded.', p: 'radius/lg = 14px', s: 'radius/card → radius/lg', c: 'card/corner → radius/card' },
    'tk-shadows':     { t: 'Shadows · Elevation', d: 'Elevation levels for cards, popovers and modals.', p: '0 4 14 · ink 10%', s: 'elevation/md → that', c: 'card/shadow → elevation/md' },
    'tk-motion':      { t: 'Motion', d: 'Durations and easing curves for transitions.', p: 'duration/base = 200ms', s: 'motion/hover → fast', c: 'button/transition → motion/hover' },
    'tk-breakpoints': { t: 'Breakpoints', d: 'Min-width breakpoints used across layouts.', p: 'bp/lg = 1024px', s: 'bp/lg → 1024', c: 'layout/sidebar → ≥ bp/lg' },
    'tk-icons':       { t: 'Iconography', d: 'Material Symbols — sizes, weight and usage.', p: 'size/24 · weight/400', s: 'icon/default → 24', c: 'button/icon → icon/default' },
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
      if ($('tierP')) $('tierP').textContent = m.p;
      if ($('tierS')) $('tierS').textContent = m.s;
      if ($('tierC')) $('tierC').textContent = m.c;
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
