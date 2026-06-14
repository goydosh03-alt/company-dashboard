(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('figmaGrid')) return;

  let FIGMA = [], market = 'Native';

  window.openFigma = function () { $('fgName').value = ''; $('fgLink').value = ''; $('fgDesc').value = ''; $('fgMarket').value = market; $('figmaOverlay').classList.add('open'); };
  window.closeFigma = function () { $('figmaOverlay').classList.remove('open'); };

  document.querySelectorAll('#figmaTabs .chip-btn').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('#figmaTabs .chip-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); market = b.dataset.market; render();
  }));

  async function load() { try { const r = await fetch('/api/figma'); if (!r.ok) return; FIGMA = await r.json(); render(); } catch (e) {} }

  function render() {
    const grid = $('figmaGrid');
    const list = FIGMA.filter((f) => f.market === market);
    grid.innerHTML = '';
    $('figmaEmpty').style.display = list.length ? 'none' : 'block';
    list.forEach((f) => {
      const el = document.createElement('div'); el.className = 'fcard';
      el.innerHTML = `<button class="dots" onclick="deleteFigma(event,'${f.id}')"><span class="material-symbols-outlined">delete</span></button><div class="fcover mk-${f.market}"></div><div class="fbody"><h4></h4><div class="fdesc"></div><div class="ffoot"><span class="fmkt">${f.market}</span><a class="sbtn solid" target="_blank" href="${f.link}"><span class="material-symbols-outlined">open_in_new</span> Open</a></div></div>`;
      el.querySelector('.fcover').textContent = f.name;
      el.querySelector('h4').textContent = f.name;
      el.querySelector('.fdesc').textContent = f.description || '';
      grid.appendChild(el);
    });
  }
  function setTab(m) { market = m; document.querySelectorAll('#figmaTabs .chip-btn').forEach((x) => x.classList.toggle('active', x.dataset.market === m)); }

  window.submitFigma = async function () {
    const name = $('fgName').value.trim(), mk = $('fgMarket').value, link = $('fgLink').value.trim(), description = $('fgDesc').value.trim();
    if (!name || !link) { alert('Add a name and a Figma link'); return; }
    try {
      const q = new URLSearchParams({ name, market: mk, link, description });
      const r = await fetch('/api/figma?' + q.toString(), { method: 'POST' });
      if (!r.ok) { let d = ''; try { d = (await r.json()).error || ''; } catch (e) {} throw new Error('HTTP ' + r.status + (d ? ' — ' + d : '')); }
      await load();
    } catch (err) { alert('Add failed: ' + err.message); }
    setTab(mk); render(); window.closeFigma();
  };

  window.deleteFigma = async function (e, id) {
    e.stopPropagation();
    if (!confirm('Delete this Figma file card?')) return;
    try { const r = await fetch('/api/figma-delete?id=' + encodeURIComponent(id), { method: 'POST' }); if (!r.ok) throw new Error('HTTP ' + r.status); await load(); }
    catch (err) { alert('Delete failed: ' + err.message); }
  };

  if (document.readyState !== 'loading') load();
  else document.addEventListener('DOMContentLoaded', load);
})();
