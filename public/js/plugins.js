(function () {
  const $ = (id) => document.getElementById(id);
  const upFile = $('upFile'), upDrop = $('upDrop'), ctx = $('ctxMenu'), reFile = $('reFile');
  if (!upFile) return; // page without the plugin UI

  let pickedFile = null, editId = null, menuId = null, reupId = null;
  const PLUGINS = {};

  window.openUpload = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); $('uploadOverlay').classList.add('open'); };
  window.closeUpload = function () { $('uploadOverlay').classList.remove('open'); };

  upFile.addEventListener('change', () => {
    pickedFile = upFile.files[0] || null;
    if (pickedFile) { upDrop.classList.add('has-file'); $('upDropTitle').textContent = pickedFile.name; $('upDropHint').textContent = (pickedFile.size / 1024 / 1024).toFixed(2) + ' MB'; }
  });
  upDrop.addEventListener('dragover', (e) => e.preventDefault());
  upDrop.addEventListener('drop', (e) => { e.preventDefault(); upFile.files = e.dataTransfer.files; upFile.dispatchEvent(new Event('change')); });

  function insertPlugin(name, by, url, filename, id) {
    const ini = (by || 'A')[0].toUpperCase();
    const dots = id ? `<button class="dots" onclick="openMenu(event,'${id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const grid = $('pluginGrid');
    if (grid) {
      const card = document.createElement('div'); card.className = 'pcard dyn'; if (id) card.dataset.id = id;
      card.innerHTML = `${dots}<div class="top"><div class="ic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div><h4></h4><span class="cat">New</span></div></div><p></p><div class="foot"><div class="by"><span class="av" style="background:#e5484d">${ini}</span> ${by} · v1.0</div><a class="sbtn solid" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span> Download</a></div>`;
      card.querySelector('h4').textContent = name; card.querySelector('p').textContent = filename;
      grid.prepend(card);
    }
    const list = $('pluginList');
    if (list) {
      const row = document.createElement('div'); row.className = 'prow dyn'; if (id) row.dataset.id = id;
      row.innerHTML = `<div class="pic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div class="info"><b></b><span></span></div><div class="by"><span class="av" style="background:#e5484d">${ini}</span></div><a class="dl" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span></a>${dots}`;
      row.querySelector('.info b').textContent = name; row.querySelector('.info span').textContent = filename; row.querySelector('.by').append(' ' + by);
      list.prepend(row);
    }
    if (id) PLUGINS[id] = { name, by, filename, url };
  }

  async function loadPlugins() {
    try {
      const r = await fetch('/api/plugins'); if (!r.ok) return;
      const arr = await r.json();
      document.querySelectorAll('.dyn').forEach((e) => e.remove());
      for (const k in PLUGINS) delete PLUGINS[k];
      arr.forEach((p) => insertPlugin(p.name, p.by, p.url, p.filename, p.id));
    } catch (e) { /* offline */ }
  }

  window.openMenu = function (e, id) { e.stopPropagation(); menuId = id; ctx.style.left = Math.min(e.clientX, window.innerWidth - 190) + 'px'; ctx.style.top = e.clientY + 'px'; ctx.classList.add('open'); };
  document.addEventListener('click', () => { if (ctx) ctx.classList.remove('open'); });
  window.menuEdit = function () { openEdit(menuId); };
  window.menuReupload = function () { reupId = menuId; reFile.click(); };
  window.menuDelete = function () { deletePlugin(menuId); };

  function openEdit(id) {
    const p = PLUGINS[id]; if (!p) return;
    editId = id; $('modalTitle').textContent = 'Edit plugin'; $('upName').value = p.name;
    const sel = $('upBy'); if (![...sel.options].some((o) => o.value === p.by)) sel.add(new Option(p.by, p.by)); sel.value = p.by;
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

  async function deletePlugin(id) {
    if (!confirm('Delete this plugin? It will be hidden (soft-delete).')) return;
    try {
      const r = await fetch('/api/delete?id=' + encodeURIComponent(id), { method: 'POST' });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Delete failed: ' + err.message); }
  }

  function resetFields() {
    pickedFile = null; upFile.value = ''; $('upName').value = ''; $('upBy').value = $('upBy').options[0].value;
    upDrop.classList.remove('has-file'); $('upDropTitle').textContent = 'Drop a .zip or click to browse'; $('upDropHint').textContent = 'Plugin archive (.zip)';
  }
  window.resetForm = function () { editId = null; $('modalTitle').textContent = 'Upload a plugin'; resetFields(); window.closeUpload(); };

  window.submitUpload = async function () {
    const name = $('upName').value.trim();
    const by = $('upBy').value.trim() || 'Anonymous';
    if (!name) { alert('Add a name'); return; }
    if (editId) {
      try {
        const q = new URLSearchParams({ id: editId, name, by }); if (pickedFile) q.set('filename', pickedFile.name);
        const r = await fetch('/api/update?' + q.toString(), { method: 'POST', body: pickedFile || '' });
        if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
        await loadPlugins();
      } catch (err) { alert('Edit failed: ' + err.message); }
      window.resetForm(); return;
    }
    if (!pickedFile) { alert('Add a .zip file'); return; }
    try {
      const q = new URLSearchParams({ name, by, filename: pickedFile.name });
      const r = await fetch('/api/upload?' + q.toString(), { method: 'POST', body: pickedFile });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await loadPlugins();
    } catch (err) { alert('Upload failed (' + err.message + ').'); }
    window.resetForm();
  };

  if (document.readyState !== 'loading') loadPlugins();
  else document.addEventListener('DOMContentLoaded', loadPlugins);
})();
