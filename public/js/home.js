(async function () {
  const $ = (id) => document.getElementById(id);
  if (!$('statPlugins')) return; // only the home page

  function rel(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }

  try {
    const [p, f] = await Promise.all([
      fetch('/api/plugins').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/figma').then((r) => (r.ok ? r.json() : [])),
    ]);
    $('statPlugins').textContent = p.length;
    if ($('statFigma')) $('statFigma').textContent = f.length;
    if ($('qcPlugins')) $('qcPlugins').textContent = p.length + ' plugin' + (p.length === 1 ? '' : 's');

    const dates = [...p, ...f].map((x) => x.date).filter(Boolean).sort();
    const last = dates[dates.length - 1];
    if ($('statUpdate')) $('statUpdate').textContent = last ? rel(last) : '—';
    if ($('statUpdateSub')) $('statUpdateSub').textContent = last ? 'last upload' : 'no uploads yet';
  } catch (e) { /* offline */ }
})();
