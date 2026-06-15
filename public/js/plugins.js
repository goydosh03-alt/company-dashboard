(function () {
  const $ = (id) => document.getElementById(id);
  const upFile = $('upFile'), upDrop = $('upDrop'), ctx = $('ctxMenu'), reFile = $('reFile');
  if (!upFile) return; // page without the plugin UI

  let pickedFile = null, editId = null, menuId = null, reupId = null, delId = null;
  const PLUGINS = {};
  let currentCat = 'all';

  // demo placeholders so each category looks alive (no id → no menu, no real file)
  const SEED = [
    { name: 'Color Sync', by: 'Mia Novak', description: 'Sync color styles to code', category: 'Styles' },
    { name: 'Shadow Kit', by: 'Leo Brandt', description: 'Elevation & shadow presets', category: 'Styles' },
    { name: 'Variable Bridge', by: 'Alex Carter', description: 'Map Figma variables to tokens', category: 'Variables' },
    { name: 'Mode Switcher', by: 'Nora Kim', description: 'Switch variable modes fast', category: 'Variables' },
    { name: 'Diff Viewer', by: 'Sam Rivers', description: 'Compare two versions of a frame', category: 'Comparison' },
    { name: 'Spec Compare', by: 'Mia Novak', description: 'Side-by-side component specs', category: 'Comparison' },
    { name: 'Lorem Filler', by: 'Leo Brandt', description: 'Realistic placeholder text', category: 'Text' },
    { name: 'Type Scale', by: 'Alex Carter', description: 'Generate a type ramp', category: 'Text' },
    { name: 'Contrast Check', by: 'Nora Kim', description: 'WCAG contrast audit', category: 'Analysis' },
    { name: 'Layer Counter', by: 'Sam Rivers', description: 'Audit layers & nesting', category: 'Analysis' },
    { name: 'Asset Export', by: 'Mia Novak', description: 'Batch export assets', category: 'Resources' },
    { name: 'Icon Pull', by: 'Leo Brandt', description: 'Import icon sets', category: 'Resources' },
  ];

  /* ---- generic custom dropdowns (#upBy, #upCat) ---- */
  window.ddToggle = function (e) {
    e.stopPropagation();
    const dd = e.currentTarget.closest('.dd');
    document.querySelectorAll('.dd.open').forEach((d) => { if (d !== dd) d.classList.remove('open'); });
    dd.classList.toggle('open');
  };
  window.ddPick = function (el) {
    const dd = el.closest('.dd'); const v = el.textContent.trim();
    dd.dataset.value = v; dd.querySelector('.dd-label').textContent = v; dd.classList.remove('open');
  };
  document.addEventListener('click', () => document.querySelectorAll('.dd.open').forEach((d) => d.classList.remove('open')));
  const getVal = (id) => ($(id).dataset.value || '').trim();
  function setVal(id, v) { const dd = $(id); dd.dataset.value = v; dd.querySelector('.dd-label').textContent = v; }

  window.openUpload = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); $('uploadOverlay').classList.add('open'); };
  window.closeUpload = function () { $('uploadOverlay').classList.remove('open'); };

  upFile.addEventListener('change', () => {
    pickedFile = upFile.files[0] || null;
    if (pickedFile) {
      upDrop.classList.add('has-file'); $('upDropTitle').textContent = pickedFile.name; $('upDropHint').textContent = (pickedFile.size / 1024 / 1024).toFixed(2) + ' MB';
      if (!$('upName').value.trim()) $('upName').value = pickedFile.name.replace(/\.zip$/i, '');
    }
  });
  upDrop.addEventListener('dragover', (e) => e.preventDefault());
  upDrop.addEventListener('drop', (e) => { e.preventDefault(); upFile.files = e.dataTransfer.files; upFile.dispatchEvent(new Event('change')); });

  function buildCard(p, cls) {
    const ini = (p.by || 'A')[0].toUpperCase();
    const dots = p.id ? `<button class="dots" onclick="openMenu(event,'${p.id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const real = p.url && p.url !== '#';
    const dl = real
      ? `<a class="sbtn solid" download="${p.filename || ''}" target="_blank" href="${p.url}"><span class="material-symbols-outlined">download</span> Download</a>`
      : `<span class="sbtn" style="opacity:.55;cursor:default"><span class="material-symbols-outlined">lock</span> Demo</span>`;
    const card = document.createElement('div');
    card.className = cls; card.dataset.category = p.category || 'Styles'; if (p.id) card.dataset.id = p.id;
    card.innerHTML = `${dots}<div class="top"><div class="ic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div><h4></h4><span class="cat"></span></div></div><p></p><div class="foot"><div class="by"><span class="av" style="background:#e5484d">${ini}</span> ${p.by} · v1.0</div>${dl}</div>`;
    card.querySelector('h4').textContent = p.name;
    card.querySelector('.cat').textContent = p.category || '—';
    card.querySelector('p').textContent = p.description || p.filename || '';
    return card;
  }

  function insertPlugin(p) {
    const grid = $('pluginGrid');
    if (grid) grid.prepend(buildCard(p, 'pcard dyn'));
    const list = $('pluginList');
    if (list) {
      const ini = (p.by || 'A')[0].toUpperCase();
      const dots = p.id ? `<button class="dots" onclick="openMenu(event,'${p.id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
      const row = document.createElement('div'); row.className = 'prow dyn'; if (p.id) row.dataset.id = p.id;
      row.innerHTML = `<div class="pic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div class="info"><b></b><span></span></div><div class="by"><span class="av" style="background:#e5484d">${ini}</span></div><a class="dl" download="${p.filename || ''}" target="_blank" href="${p.url}"><span class="material-symbols-outlined">download</span></a>${dots}`;
      row.querySelector('.info b').textContent = p.name; row.querySelector('.info span').textContent = p.description || p.filename || ''; row.querySelector('.by').append(' ' + p.by);
      list.prepend(row);
    }
    if (p.id) PLUGINS[p.id] = { name: p.name, by: p.by, filename: p.filename, url: p.url, description: p.description || '', category: p.category || 'Styles' };
  }

  function renderSeeds() {
    const grid = $('pluginGrid'); if (!grid) return;
    SEED.forEach((p) => grid.appendChild(buildCard(p, 'pcard seed')));
  }

  function applyFilter() {
    document.querySelectorAll('#pluginGrid .pcard').forEach((c) => {
      c.style.display = (currentCat === 'all' || c.dataset.category === currentCat) ? '' : 'none';
    });
    const grid = $('pluginGrid');
    if (grid) { const e = $('pluginEmpty'); if (e) e.style.display = grid.querySelector('.pcard:not([style*="display: none"])') ? 'none' : 'block'; }
  }

  function updateCounts() {
    const cards = [...document.querySelectorAll('#pluginGrid .pcard')];
    document.querySelectorAll('.sub .s-item[data-cat]').forEach((it) => {
      const cat = it.dataset.cat;
      const n = cat === 'all' ? cards.length : cards.filter((c) => c.dataset.category === cat).length;
      let c = it.querySelector('.count'); if (!c) { c = document.createElement('span'); c.className = 'count'; it.appendChild(c); }
      c.textContent = n;
    });
  }

  // category tabs in the sidebar
  document.querySelectorAll('.sub .s-item[data-cat]').forEach((it) => it.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sub .s-item[data-cat]').forEach((x) => x.classList.toggle('active', x === it));
    currentCat = it.dataset.cat; applyFilter();
  }));

  async function loadPlugins() {
    try {
      const r = await fetch('/api/plugins', { cache: 'no-store' });
      if (r.ok) {
        const arr = await r.json();
        document.querySelectorAll('.dyn').forEach((e) => e.remove());
        for (const k in PLUGINS) delete PLUGINS[k];
        arr.forEach((p) => insertPlugin(p));
      }
    } catch (e) { /* offline */ }
    updateCounts(); applyFilter();
    flashFromQuery();
    const list = $('pluginList'); if (list) { const e = $('pluginListEmpty'); if (e) e.style.display = list.querySelector('.prow') ? 'none' : 'block'; }
  }

  function flashFromQuery() {
    const hl = new URLSearchParams(location.search).get('hl'); if (!hl) return;
    for (const c of document.querySelectorAll('#pluginGrid .pcard')) {
      const h = c.querySelector('h4');
      if (h && h.textContent.trim() === hl) { c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1700); break; }
    }
    history.replaceState(null, '', location.pathname);
  }

  /* ---- context menu ---- */
  window.openMenu = function (e, id) { e.stopPropagation(); menuId = id; ctx.style.left = Math.max(8, e.clientX - 180) + 'px'; ctx.style.top = e.clientY + 'px'; ctx.classList.add('open'); };
  document.addEventListener('click', () => { if (ctx) ctx.classList.remove('open'); });
  window.menuEdit = function () { openEdit(menuId); };
  window.menuReupload = function () { reupId = menuId; reFile.click(); };
  window.menuDelete = function () { delId = menuId; const p = PLUGINS[delId]; $('delName').textContent = p ? p.name : 'this plugin'; $('deleteOverlay').classList.add('open'); };
  window.closeDelete = function () { $('deleteOverlay').classList.remove('open'); delId = null; };

  function openEdit(id) {
    const p = PLUGINS[id]; if (!p) return;
    editId = id; $('modalTitle').textContent = 'Edit plugin'; $('upName').value = p.name; $('upDesc').value = p.description || '';
    setVal('upCat', p.category || 'Styles'); setVal('upBy', p.by);
    upDrop.classList.remove('has-file'); $('upDropTitle').textContent = 'Drop a new .zip (optional)'; $('upDropHint').textContent = 'Leave empty to keep current file';
    pickedFile = null; upFile.value = ''; $('uploadOverlay').classList.add('open');
  }

  reFile.addEventListener('change', async (ev) => {
    const f = ev.target.files[0]; if (!f || !reupId) return;
    try {
      const q = new URLSearchParams({ id: reupId, filename: f.name });
      const r = await fetch('/api/update?' + q.toString(), { method: 'POST', body: f });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Re-upload failed: ' + err.message); }
    ev.target.value = ''; reupId = null;
  });

  window.confirmDelete = async function () {
    const id = delId; if (!id) return;
    try {
      const r = await fetch('/api/delete?id=' + encodeURIComponent(id), { method: 'POST' });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Delete failed: ' + err.message); }
    window.closeDelete();
  };

  function resetFields() {
    pickedFile = null; upFile.value = ''; $('upName').value = ''; $('upDesc').value = ''; setVal('upCat', 'Styles'); setVal('upBy', 'Alex Carter');
    upDrop.classList.remove('has-file'); $('upDropTitle').textContent = 'Drop a .zip or click to browse'; $('upDropHint').textContent = 'Plugin archive (.zip)';
  }
  window.resetForm = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); window.closeUpload(); };

  window.submitUpload = async function () {
    const name = $('upName').value.trim();
    const by = getVal('upBy') || 'Anonymous';
    const description = $('upDesc').value.trim();
    const category = getVal('upCat') || 'Styles';
    if (!name) { alert('Add a name'); return; }
    if (editId) {
      try {
        const q = new URLSearchParams({ id: editId, name, by, description, category }); if (pickedFile) q.set('filename', pickedFile.name);
        const r = await fetch('/api/update?' + q.toString(), { method: 'POST', body: pickedFile || '' });
        if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
        await loadPlugins();
      } catch (err) { alert('Edit failed: ' + err.message); }
      window.resetForm(); return;
    }
    if (!pickedFile) { alert('Add a .zip file'); return; }
    try {
      const q = new URLSearchParams({ name, by, filename: pickedFile.name, description, category });
      const r = await fetch('/api/upload?' + q.toString(), { method: 'POST', body: pickedFile });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Upload failed (' + err.message + ').'); }
    window.resetForm();
  };

  renderSeeds();
  if (document.readyState !== 'loading') loadPlugins();
  else document.addEventListener('DOMContentLoaded', loadPlugins);
  // auto-refresh when returning to the tab
  window.addEventListener('focus', () => loadPlugins());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loadPlugins(); });
})();
