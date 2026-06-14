(function () {
  const $ = (id) => document.getElementById(id);
  const upFile = $('upFile'), upDrop = $('upDrop'), ctx = $('ctxMenu'), reFile = $('reFile');
  if (!upFile) return; // page without the plugin UI

  let pickedFile = null, editId = null, menuId = null, reupId = null, delId = null;
  const PLUGINS = {};

  // ---- custom "Uploaded by" dropdown ----
  const ddRoot = $('upBy');
  window.ddToggle = function (e) { e.stopPropagation(); ddRoot.classList.toggle('open'); };
  window.ddPick = function (el) { setUploader(el.textContent.trim()); ddRoot.classList.remove('open'); };
  function setUploader(name) { ddRoot.dataset.value = name; const l = ddRoot.querySelector('.dd-label'); if (l) l.textContent = name; }
  function getUploader() { return (ddRoot.dataset.value || '').trim(); }
  document.addEventListener('click', () => { if (ddRoot) ddRoot.classList.remove('open'); });

  window.openUpload = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); $('uploadOverlay').classList.add('open'); };
  window.closeUpload = function () { $('uploadOverlay').classList.remove('open'); };

  upFile.addEventListener('change', () => {
    pickedFile = upFile.files[0] || null;
    if (pickedFile) {
      upDrop.classList.add('has-file'); $('upDropTitle').textContent = pickedFile.name; $('upDropHint').textContent = (pickedFile.size / 1024 / 1024).toFixed(2) + ' MB';
      // auto-fill the name from the zip filename if empty (still editable)
      if (!$('upName').value.trim()) $('upName').value = pickedFile.name.replace(/\.zip$/i, '');
    }
  });
  upDrop.addEventListener('dragover', (e) => e.preventDefault());
  upDrop.addEventListener('drop', (e) => { e.preventDefault(); upFile.files = e.dataTransfer.files; upFile.dispatchEvent(new Event('change')); });

  function insertPlugin(name, by, url, filename, id, description) {
    const ini = (by || 'A')[0].toUpperCase();
    const sub = description || filename;
    const dots = id ? `<button class="dots" onclick="openMenu(event,'${id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const grid = $('pluginGrid');
    if (grid) {
      const card = document.createElement('div'); card.className = 'pcard dyn'; if (id) card.dataset.id = id;
      card.innerHTML = `${dots}<div class="top"><div class="ic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div><h4></h4><span class="cat">New</span></div></div><p></p><div class="foot"><div class="by"><span class="av" style="background:#e5484d">${ini}</span> ${by} · v1.0</div><a class="sbtn solid" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span> Download</a></div>`;
      card.querySelector('h4').textContent = name; card.querySelector('p').textContent = sub;
      grid.prepend(card);
    }
    const list = $('pluginList');
    if (list) {
      const row = document.createElement('div'); row.className = 'prow dyn'; if (id) row.dataset.id = id;
      row.innerHTML = `<div class="pic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div class="info"><b></b><span></span></div><div class="by"><span class="av" style="background:#e5484d">${ini}</span></div><a class="dl" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span></a>${dots}`;
      row.querySelector('.info b').textContent = name; row.querySelector('.info span').textContent = sub; row.querySelector('.by').append(' ' + by);
      list.prepend(row);
    }
    if (id) PLUGINS[id] = { name, by, filename, url, description: description || '' };
  }

  function updateEmpty() {
    const grid = $('pluginGrid'); if (grid) { const e = $('pluginEmpty'); if (e) e.style.display = grid.querySelector('.pcard') ? 'none' : 'block'; }
    const list = $('pluginList'); if (list) { const e = $('pluginListEmpty'); if (e) e.style.display = list.querySelector('.prow') ? 'none' : 'block'; }
  }

  async function loadPlugins() {
    try {
      const r = await fetch('/api/plugins');
      if (r.ok) {
        const arr = await r.json();
        document.querySelectorAll('.dyn').forEach((e) => e.remove());
        for (const k in PLUGINS) delete PLUGINS[k];
        arr.forEach((p) => insertPlugin(p.name, p.by, p.url, p.filename, p.id, p.description));
      }
    } catch (e) { /* offline */ }
    updateEmpty();
    flashFromQuery();
  }

  // highlight a card when arriving from global search (?hl=Name)
  function flashFromQuery() {
    const hl = new URLSearchParams(location.search).get('hl');
    if (!hl) return;
    const cards = document.querySelectorAll('#pluginGrid .pcard');
    for (const c of cards) {
      const h = c.querySelector('h4');
      if (h && h.textContent.trim() === hl) {
        c.scrollIntoView({ behavior: 'smooth', block: 'center' });
        c.classList.add('flash');
        setTimeout(() => c.classList.remove('flash'), 1700);
        break;
      }
    }
    history.replaceState(null, '', location.pathname);
  }

  window.filterPlugins = function (q) {
    q = (q || '').toLowerCase();
    document.querySelectorAll('#pluginGrid .pcard').forEach((c) => {
      const h = c.querySelector('h4'); const t = h ? h.textContent.toLowerCase() : '';
      c.style.display = t.includes(q) ? '' : 'none';
    });
  };

  // 3-dots menu opens to the LEFT of the click
  window.openMenu = function (e, id) {
    e.stopPropagation(); menuId = id;
    const w = 180;
    ctx.style.left = Math.max(8, e.clientX - w) + 'px';
    ctx.style.top = e.clientY + 'px';
    ctx.classList.add('open');
  };
  document.addEventListener('click', () => { if (ctx) ctx.classList.remove('open'); });
  window.menuEdit = function () { openEdit(menuId); };
  window.menuReupload = function () { reupId = menuId; reFile.click(); };
  window.menuDelete = function () {
    delId = menuId;
    const p = PLUGINS[delId];
    $('delName').textContent = p ? p.name : 'this plugin';
    $('deleteOverlay').classList.add('open');
  };
  window.closeDelete = function () { $('deleteOverlay').classList.remove('open'); delId = null; };

  function openEdit(id) {
    const p = PLUGINS[id]; if (!p) return;
    editId = id; $('modalTitle').textContent = 'Edit plugin'; $('upName').value = p.name;
    $('upDesc').value = p.description || '';
    setUploader(p.by);
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
    const btn = document.querySelector('#deleteOverlay .btn-danger');
    if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
    try {
      const r = await fetch('/api/delete?id=' + encodeURIComponent(id), { method: 'POST' });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Delete failed: ' + err.message); }
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    window.closeDelete();
  };

  function resetFields() {
    pickedFile = null; upFile.value = ''; $('upName').value = ''; $('upDesc').value = ''; setUploader('Oleksandr Hoidosh');
    upDrop.classList.remove('has-file'); $('upDropTitle').textContent = 'Drop a .zip or click to browse'; $('upDropHint').textContent = 'Plugin archive (.zip)';
  }
  window.resetForm = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); window.closeUpload(); };

  window.submitUpload = async function () {
    const name = $('upName').value.trim();
    const by = getUploader() || 'Anonymous';
    const description = $('upDesc').value.trim();
    if (!name) { alert('Add a name'); return; }
    if (editId) {
      try {
        const q = new URLSearchParams({ id: editId, name, by, description }); if (pickedFile) q.set('filename', pickedFile.name);
        const r = await fetch('/api/update?' + q.toString(), { method: 'POST', body: pickedFile || '' });
        if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
        await loadPlugins();
      } catch (err) { alert('Edit failed: ' + err.message); }
      window.resetForm(); return;
    }
    if (!pickedFile) { alert('Add a .zip file'); return; }
    try {
      const q = new URLSearchParams({ name, by, filename: pickedFile.name, description });
      const r = await fetch('/api/upload?' + q.toString(), { method: 'POST', body: pickedFile });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Upload failed (' + err.message + ').'); }
    window.resetForm();
  };

  if (document.readyState !== 'loading') loadPlugins();
  else document.addEventListener('DOMContentLoaded', loadPlugins);
})();
