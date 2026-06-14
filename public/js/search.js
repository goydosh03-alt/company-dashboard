(function () {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('cmdkInput');
  const results = document.getElementById('cmdkResults');
  if (!overlay) return;

  // static index — pages and section items
  const STATIC = [
    { type: 'Page', title: 'Home', href: '/' },
    { type: 'Page', title: 'Plugins', href: '/plugins' },
    { type: 'Page', title: 'Tokens', href: '/tokens' },
    { type: 'Page', title: 'Components', href: '/components' },
    { type: 'Page', title: 'Guidelines', href: '/guidelines' },
    { type: 'Page', title: 'Figma', href: '/figma' },
    { type: 'Token', title: 'Colors', href: '/tokens' },
    { type: 'Token', title: 'Typography', href: '/tokens' },
    { type: 'Token', title: 'Radius', href: '/tokens' },
    { type: 'Token', title: 'Shadows', href: '/tokens' },
    { type: 'Token', title: 'Spacing', href: '/tokens' },
    { type: 'Component', title: 'Button', href: '/components' },
    { type: 'Component', title: 'Input', href: '/components' },
    { type: 'Component', title: 'Card', href: '/components' },
    { type: 'Component', title: 'Toggle', href: '/components' },
    { type: 'Component', title: 'Tabs', href: '/components' },
    { type: 'Component', title: 'Toast', href: '/components' },
    { type: 'Guideline', title: 'Foundations', href: '/guidelines' },
    { type: 'Guideline', title: 'Voice & Tone', href: '/guidelines' },
    { type: 'Guideline', title: 'Accessibility', href: '/guidelines' },
    { type: 'Guideline', title: 'Contribution', href: '/guidelines' },
  ];
  const ICON = { Page: 'description', Token: 'palette', Component: 'widgets', Guideline: 'menu_book', Plugin: 'extension', Figma: 'design_services' };

  let INDEX = STATIC.slice();
  let loaded = false;
  let active = 0, current = [];

  async function loadDynamic() {
    if (loaded) return; loaded = true;
    try {
      const [p, f] = await Promise.all([
        fetch('/api/plugins').then((r) => r.ok ? r.json() : []),
        fetch('/api/figma').then((r) => r.ok ? r.json() : []),
      ]);
      (p || []).forEach((x) => INDEX.push({ type: 'Plugin', title: x.name, sub: 'by ' + x.by, href: '/plugins' }));
      (f || []).forEach((x) => INDEX.push({ type: 'Figma', title: x.name, sub: x.market, href: '/figma' }));
    } catch (e) { /* offline */ }
  }

  window.openSearch = async function () {
    overlay.classList.add('open'); input.value = ''; input.focus();
    await loadDynamic();
    runSearch('');
  };
  window.closeSearch = function () { overlay.classList.remove('open'); };

  window.runSearch = function (q) {
    q = (q || '').trim().toLowerCase();
    current = q ? INDEX.filter((it) => it.title.toLowerCase().includes(q) || (it.sub || '').toLowerCase().includes(q)) : INDEX;
    active = 0;
    if (!current.length) { results.innerHTML = '<div class="cmdk-empty">No matches</div>'; return; }
    results.innerHTML = current.map((it, i) => `
      <a class="cmdk-item${i === 0 ? ' active' : ''}" href="${it.href}" data-i="${i}">
        <span class="material-symbols-outlined">${ICON[it.type] || 'chevron_right'}</span>
        <span class="cmdk-title">${it.title}${it.sub ? ` <em>${it.sub}</em>` : ''}</span>
        <span class="cmdk-type">${it.type}</span>
      </a>`).join('');
    [...results.querySelectorAll('.cmdk-item')].forEach((el) => {
      el.addEventListener('mousemove', () => setActive(+el.dataset.i));
    });
  };

  function setActive(i) {
    active = i;
    results.querySelectorAll('.cmdk-item').forEach((el, idx) => el.classList.toggle('active', idx === i));
  }

  document.addEventListener('keydown', (e) => {
    const isK = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
    if (isK) { e.preventDefault(); overlay.classList.contains('open') ? closeSearch() : openSearch(); return; }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeSearch();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(active + 1, current.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
    else if (e.key === 'Enter') { const it = current[active]; if (it) window.location.href = it.href; }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
})();
