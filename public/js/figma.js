(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('figmaGrid')) return;

  const TYPE_META = {
    all: { t: 'All files', d: 'Project files, grouped by type. Open quickly or add a new one.' },
    'Design System': { t: 'Design System', d: 'Core libraries, components and styles.' },
    'Themes': { t: 'Themes', d: 'Light, dark and brand theme files.' },
    'Foundations': { t: 'Foundations', d: 'Grid, layout and foundational specs.' },
    'Marketing': { t: 'Marketing', d: 'Promo, banners and art files.' },
    'Testing': { t: 'Testing', d: 'Sandboxes and experiments.' },
  };
  const FLAG = { Native: '📱', Kazakhstan: '🇰🇿', COM: '🇪🇺', Bangladesh: '🇧🇩', Africa: '🌍' };

  // demo placeholders (no id → no menu, link '#')
  const SEED = [
    { name: 'Design System · Core', type: 'Design System', market: 'Native', description: 'Components, tokens, patterns', link: '#' },
    { name: 'Components Library', type: 'Design System', market: 'COM', description: 'All shared components', link: '#' },
    { name: 'Theme · Light', type: 'Themes', market: 'COM', description: 'Light theme styles', link: '#' },
    { name: 'Theme · Dark', type: 'Themes', market: 'COM', description: 'Dark theme styles', link: '#' },
    { name: 'Grid & Layout', type: 'Foundations', market: 'Native', description: 'Spacing, grid, breakpoints', link: '#' },
    { name: 'Promo Banners', type: 'Marketing', market: 'Kazakhstan', description: 'Campaign banner sources', link: '#' },
    { name: 'Art / Illustrations', type: 'Marketing', market: 'Africa', description: 'Illustration library', link: '#' },
    { name: 'Sandbox · For Testing', type: 'Testing', market: 'Native', description: 'Experiments & QA', link: '#' },
  ];

  let FILES = [], currentType = 'all', menuId = null, editId = null;

  function slug(t) { return 'fc-' + (t || 'design system').toLowerCase().replace(/\s+/g, '-'); }

  function buildCard(f) {
    const real = f.link && f.link !== '#';
    const dots = f.id ? `<button class="dots" onclick="figMenu(event,'${f.id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const open = real
      ? `<a class="sbtn solid" target="_blank" href="${f.link}">Open <span class="material-symbols-outlined">arrow_forward</span></a>`
      : `<span class="sbtn" style="opacity:.55;cursor:default">Demo</span>`;
    const el = document.createElement('div'); el.className = 'fcard'; if (f.id) el.dataset.id = f.id;
    el.innerHTML = `${dots}<div class="fcover ${slug(f.type)}"><span class="material-symbols-outlined">design_services</span></div>
      <div class="fbody"><h4></h4><div class="fdesc"></div>
        <div class="ffoot"><span class="fmkt">${FLAG[f.market] || ''} ${f.market || ''}</span>${open}</div></div>`;
    el.querySelector('h4').textContent = f.name;
    el.querySelector('.fdesc').textContent = f.description || '';
    return el;
  }

  function render() {
    const grid = $('figmaGrid');
    const list = (currentType === 'all') ? FILES : FILES.filter((f) => f.type === currentType);
    grid.innerHTML = '';
    $('figmaEmpty').style.display = list.length ? 'none' : 'block';
    list.forEach((f) => grid.appendChild(buildCard(f)));
  }

  async function load() {
    let real = [];
    if (location.protocol !== 'file:') {
      try { const r = await fetch('/api/figma', { cache: 'no-store' }); if (r.ok) real = await r.json(); } catch (e) {}
    }
    FILES = [...real, ...SEED];
    render();
  }

  // sidebar type tabs
  document.querySelectorAll('.sub .s-item[data-cat]').forEach((it) => it.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sub .s-item[data-cat]').forEach((x) => x.classList.toggle('active', x === it));
    currentType = it.dataset.cat;
    const m = TYPE_META[currentType] || TYPE_META.all;
    if ($('phTitle')) $('phTitle').textContent = m.t;
    if ($('phDesc')) $('phDesc').textContent = m.d;
    if ($('pageCrumb')) $('pageCrumb').textContent = '/ ' + m.t;
    render();
  }));

  // add / edit modal
  window.openFigma = function () {
    editId = null; $('figModalTitle').textContent = 'Add Figma file';
    $('fgName').value = ''; $('fgLink').value = ''; $('fgDesc').value = '';
    $('fgType').value = (currentType !== 'all') ? currentType : 'Design System';
    $('fgMarket').value = 'Native';
    $('figmaOverlay').classList.add('open');
  };
  window.closeFigma = function () { $('figmaOverlay').classList.remove('open'); };

  window.submitFigma = async function () {
    const name = $('fgName').value.trim(), link = $('fgLink').value.trim();
    const type = $('fgType').value, market = $('fgMarket').value, description = $('fgDesc').value.trim();
    if (!name || !link) { alert('Add a name and a Figma link'); return; }
    const q = new URLSearchParams({ name, link, type, market, description });
    const url = editId ? '/api/figma-update?id=' + encodeURIComponent(editId) + '&' + q : '/api/figma?' + q;
    try {
      const r = await fetch(url, { method: 'POST' });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await load();
    } catch (err) { alert('Save failed: ' + err.message); }
    closeFigma();
  };

  // context menu
  const ctx = $('figCtx');
  window.figMenu = function (e, id) { e.stopPropagation(); menuId = id; ctx.style.left = Math.max(8, e.clientX - 180) + 'px'; ctx.style.top = e.clientY + 'px'; ctx.classList.add('open'); };
  document.addEventListener('click', () => ctx.classList.remove('open'));
  window.figEdit = function () {
    const f = FILES.find((x) => x.id === menuId); if (!f) return;
    editId = f.id; $('figModalTitle').textContent = 'Edit Figma file';
    $('fgName').value = f.name; $('fgLink').value = f.link; $('fgDesc').value = f.description || '';
    $('fgType').value = f.type || 'Design System'; $('fgMarket').value = f.market || 'Native';
    $('figmaOverlay').classList.add('open');
  };
  window.figDelete = async function () {
    if (!menuId || !confirm('Delete this Figma file card?')) return;
    try { const r = await fetch('/api/figma-delete?id=' + encodeURIComponent(menuId), { method: 'POST' }); if (!r.ok) throw new Error('HTTP ' + r.status); await load(); }
    catch (err) { alert('Delete failed: ' + err.message); }
  };

  load();
  window.addEventListener('focus', load);
})();
