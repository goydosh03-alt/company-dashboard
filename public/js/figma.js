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

  const days = (n) => new Date(Date.now() - n * 86400000).toISOString();
  const SEED = [
    { name: 'Design System · Core', type: 'Design System', description: 'Components, tokens, patterns', link: '#', date: days(2) },
    { name: 'Components Library', type: 'Design System', description: 'All shared components', link: '#', date: days(9) },
    { name: 'Theme · Light', type: 'Themes', description: 'Light theme styles', link: '#', date: days(1) },
    { name: 'Theme · Dark', type: 'Themes', description: 'Dark theme styles', link: '#', date: days(1) },
    { name: 'Grid & Layout', type: 'Foundations', description: 'Spacing, grid, breakpoints', link: '#', date: days(14) },
    { name: 'Promo Banners', type: 'Marketing', description: 'Campaign banner sources', link: '#', date: days(4) },
    { name: 'Art / Illustrations', type: 'Marketing', description: 'Illustration library', link: '#', date: days(20) },
    { name: 'Sandbox · For Testing', type: 'Testing', description: 'Experiments & QA', link: '#', date: days(0) },
  ];

  let FILES = [], currentType = 'all', menuId = null, editId = null, delId = null, pickedCover = null;
  function setDD(id, v) { const dd = $(id); dd.dataset.value = v; dd.querySelector('.dd-label').textContent = v; }

  const slug = (t) => 'fc-' + (t || 'design system').toLowerCase().replace(/\s+/g, '-');
  function rel(iso) {
    if (!iso) return 'recently';
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 86400) return 'today';
    const d = Math.round(s / 86400);
    if (d < 30) return d + 'd ago';
    return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  function buildCard(f) {
    const real = f.link && f.link !== '#';
    const dots = f.id ? `<button class="dots" onclick="figMenu(event,'${f.id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const cover = f.cover
      ? `<div class="fcover" style="background-image:url('${f.cover}');background-size:cover;background-position:center"></div>`
      : `<div class="fcover ${slug(f.type)}"><span class="material-symbols-outlined">design_services</span></div>`;
    const open = real
      ? `<a class="sbtn solid" target="_blank" href="${f.link}">Open <span class="material-symbols-outlined">arrow_forward</span></a>`
      : `<span class="sbtn" style="opacity:.55;cursor:default">Demo</span>`;
    const el = document.createElement('div'); el.className = 'fcard'; if (f.id) el.dataset.id = f.id;
    el.innerHTML = `${dots}${cover}<div class="fbody"><h4></h4><div class="fdesc"></div>
      <div class="ffoot"><span class="fupdated"><span class="material-symbols-outlined">schedule</span> Updated ${rel(f.updated || f.date)}</span>${open}</div></div>`;
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

  // cover picker
  const fgCover = $('fgCover');
  fgCover.addEventListener('change', () => {
    pickedCover = fgCover.files[0] || null;
    $('fgDrop').classList.toggle('has-file', !!pickedCover);
    $('fgDropT').textContent = pickedCover ? pickedCover.name : 'Drop an image or click to browse';
  });
  function resetCover() { pickedCover = null; fgCover.value = ''; $('fgDrop').classList.remove('has-file'); $('fgDropT').textContent = 'Drop an image or click to browse'; }

  // add / edit
  window.openFigma = function () {
    editId = null; $('figModalTitle').textContent = 'Add Figma file';
    $('fgName').value = ''; $('fgLink').value = ''; $('fgDesc').value = '';
    setDD('fgType', (currentType !== 'all') ? currentType : 'Design System');
    resetCover();
    $('figmaOverlay').classList.add('open');
  };
  window.closeFigma = function () { $('figmaOverlay').classList.remove('open'); };

  window.submitFigma = async function () {
    const name = $('fgName').value.trim(), link = $('fgLink').value.trim();
    const type = ($('fgType').dataset.value || 'Design System'), description = $('fgDesc').value.trim();
    if (!name || !link) { alert('Add a name and a Figma link'); return; }
    const q = new URLSearchParams({ name, link, type, description });
    if (pickedCover) { q.set('coverName', pickedCover.name); q.set('coverType', pickedCover.type || 'image/png'); }
    const url = editId ? '/api/figma-update?id=' + encodeURIComponent(editId) + '&' + q : '/api/figma?' + q;
    try {
      const r = await fetch(url, { method: 'POST', body: pickedCover || '' });
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
    setDD('fgType', f.type || 'Design System');
    resetCover();
    $('figmaOverlay').classList.add('open');
  };
  window.figDelete = function () {
    if (!menuId) return; delId = menuId;
    const f = FILES.find((x) => x.id === delId);
    $('figDelName').textContent = f ? f.name : 'this file';
    $('figDelOverlay').classList.add('open');
  };
  window.figCloseDel = function () { $('figDelOverlay').classList.remove('open'); delId = null; };
  window.figConfirmDel = async function () {
    if (!delId) return;
    try { const r = await fetch('/api/figma-delete?id=' + encodeURIComponent(delId), { method: 'POST' }); if (!r.ok) throw new Error('HTTP ' + r.status); await load(); }
    catch (err) { alert('Delete failed: ' + err.message); }
    window.figCloseDel();
  };

  load();
  window.addEventListener('focus', load);
})();
