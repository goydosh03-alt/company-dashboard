
  /* ---------- Page routing + Overview config ---------- */
  const PAGES = {
    Home:       { crumb:'/ Overview', overview:null },
    Plugins:    { crumb:'/ Plugins', overview:[
      {icon:'apps',label:'All plugins',count:6,active:true},{icon:'star',label:'Featured'},
      {icon:'schedule',label:'Recently added'},{divider:'Categories'},
      {icon:'palette',label:'Tokens',count:2},{icon:'widgets',label:'Components',count:3},{icon:'image',label:'Assets',count:1}
    ]},
    Tokens:     { crumb:'/ Tokens', overview:[
      {icon:'format_color_fill',label:'Colors',active:true},{icon:'text_fields',label:'Typography'},
      {icon:'rounded_corner',label:'Radius'},{icon:'gradient',label:'Shadows'},{icon:'space_bar',label:'Spacing'}
    ]},
    Components: { crumb:'/ Components', overview:[
      {icon:'apps',label:'All',active:true},{icon:'smart_button',label:'Buttons'},{icon:'edit',label:'Inputs'},
      {icon:'crop_square',label:'Cards'},{icon:'menu',label:'Navigation'},{icon:'notifications',label:'Feedback'}
    ]},
    Guidelines: { crumb:'/ Guidelines', overview:[
      {icon:'foundation',label:'Foundations',active:true},{icon:'campaign',label:'Voice & Tone'},
      {icon:'accessibility_new',label:'Accessibility'},{icon:'volunteer_activism',label:'Contribution'}
    ]},
    GitHub:     { crumb:'/ GitHub', overview:null, external:'https://github.com/goydosh03-alt/company-dashboard' },
    Figma:      { crumb:'/ Figma', overview:null }
  };

  const items = document.querySelectorAll('.m-item');
  const subTitle = document.getElementById('subTitle');
  const subItems = document.getElementById('subItems');

  function buildOverview(section, cfg){
    subTitle.textContent = section;
    subItems.innerHTML = cfg.overview.map(it => {
      if(it.divider) return `<div class="s-label">${it.divider}</div>`;
      const count = it.count!=null ? `<span class="count">${it.count}</span>` : '';
      return `<a class="s-item ${it.active?'active':''}"><span class="material-symbols-outlined">${it.icon}</span> ${it.label} ${count}</a>`;
    }).join('');
  }

  function route(section){
    const cfg = PAGES[section]; if(!cfg) return;
    if(cfg.external){ window.open(cfg.external, '_blank'); return; }   // GitHub → open repo
    items.forEach(x => x.classList.toggle('active', x.dataset.section===section));
    document.getElementById('pageTitle').textContent = section;
    document.getElementById('pageCrumb').textContent = cfg.crumb;
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id==='page-'+section));
    if(cfg.overview){ document.body.classList.remove('home'); buildOverview(section, cfg); }
    else { document.body.classList.add('home'); }
    if(section==='Figma') loadFigma();
    document.querySelector('.panel-main').scrollTop = 0;
  }

  items.forEach(it => it.addEventListener('click', e => { e.preventDefault(); route(it.dataset.section); }));
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); route(el.dataset.go); }));

  /* ---------- Upload + manage (Vercel Blob) ---------- */
  let pickedFile = null, editId = null, menuId = null, reupId = null;
  const PLUGINS = {};
  const upFile = document.getElementById('upFile');
  const upDrop = document.getElementById('upDrop');
  const ctx = document.getElementById('ctxMenu');
  const reFile = document.getElementById('reFile');

  function openUpload(){ editId=null; document.getElementById('modalTitle').textContent='Upload a plugin'; resetFields(); document.getElementById('uploadOverlay').classList.add('open'); }
  function closeUpload(){ document.getElementById('uploadOverlay').classList.remove('open'); }

  upFile.addEventListener('change', () => {
    pickedFile = upFile.files[0] || null;
    if(pickedFile){ upDrop.classList.add('has-file');
      document.getElementById('upDropTitle').textContent = pickedFile.name;
      document.getElementById('upDropHint').textContent = (pickedFile.size/1024/1024).toFixed(2)+' MB'; }
  });
  upDrop.addEventListener('dragover', e => e.preventDefault());
  upDrop.addEventListener('drop', e => { e.preventDefault(); upFile.files = e.dataTransfer.files; upFile.dispatchEvent(new Event('change')); });

  function insertPlugin(name, by, url, filename, id){
    const ini = (by||'A')[0].toUpperCase();
    const dots = id ? `<button class="dots" onclick="openMenu(event,'${id}')"><span class="material-symbols-outlined">more_horiz</span></button>` : '';
    const card = document.createElement('div'); card.className='pcard dyn'; if(id) card.dataset.id=id;
    card.innerHTML = `${dots}<div class="top"><div class="ic c-red"><span class="material-symbols-outlined">deployed_code</span></div><div><h4></h4><span class="cat">New</span></div></div>
      <p></p><div class="foot"><div class="by"><span class="av" style="background:#e5484d">${ini}</span> ${by} · v1.0</div>
      <a class="sbtn solid" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span> Download</a></div>`;
    card.querySelector('h4').textContent = name; card.querySelector('p').textContent = filename;
    document.getElementById('pluginGrid').prepend(card);
    const row = document.createElement('div'); row.className='prow dyn'; if(id) row.dataset.id=id;
    row.innerHTML = `<div class="pic c-red"><span class="material-symbols-outlined">deployed_code</span></div>
      <div class="info"><b></b><span></span></div><div class="by"><span class="av" style="background:#e5484d">${ini}</span></div>
      <a class="dl" download="${filename}" target="_blank" href="${url}"><span class="material-symbols-outlined">download</span></a>${dots}`;
    row.querySelector('.info b').textContent = name; row.querySelector('.info span').textContent = filename;
    row.querySelector('.by').append(' '+by);
    document.getElementById('pluginList').prepend(row);
    if(id) PLUGINS[id] = { name, by, filename, url };
  }

  async function loadPlugins(){
    if(location.protocol === 'file:') return;
    try{
      const r = await fetch('/api/plugins'); if(!r.ok) return;
      const list = await r.json();
      document.querySelectorAll('.dyn').forEach(e => e.remove());
      for(const k in PLUGINS) delete PLUGINS[k];
      list.forEach(p => insertPlugin(p.name, p.by, p.url, p.filename, p.id));
    }catch(e){ /* offline / not deployed */ }
  }

  /* context menu */
  function openMenu(e, id){ e.stopPropagation(); menuId=id; ctx.style.left=Math.min(e.clientX, window.innerWidth-190)+'px'; ctx.style.top=e.clientY+'px'; ctx.classList.add('open'); }
  function closeMenu(){ ctx.classList.remove('open'); }
  document.addEventListener('click', closeMenu);
  function menuEdit(){ openEdit(menuId); }
  function menuReupload(){ reupId=menuId; reFile.click(); }
  function menuDelete(){ deletePlugin(menuId); }

  function openEdit(id){
    const p = PLUGINS[id]; if(!p) return;
    editId = id;
    document.getElementById('modalTitle').textContent = 'Edit plugin';
    document.getElementById('upName').value = p.name;
    const sel = document.getElementById('upBy');
    if(![...sel.options].some(o => o.value === p.by)) sel.add(new Option(p.by, p.by));
    sel.value = p.by;
    upDrop.classList.remove('has-file');
    document.getElementById('upDropTitle').textContent = 'Drop a new .zip (optional)';
    document.getElementById('upDropHint').textContent = 'Leave empty to keep current file';
    pickedFile = null; upFile.value='';
    document.getElementById('uploadOverlay').classList.add('open');
  }

  reFile.addEventListener('change', async (ev) => {
    const f = ev.target.files[0]; if(!f || !reupId) return;
    try{
      const q = new URLSearchParams({ id: reupId, filename: f.name });
      const r = await fetch('/api/update?' + q.toString(), { method:'POST', body: f });
      if(!r.ok){ let d=''; try{ d=(await r.json()).error||''; }catch(e){} throw new Error('HTTP '+r.status+(d?' — '+d:'')); }
      await loadPlugins();
    }catch(err){ alert('Re-upload failed: ' + err.message); }
    ev.target.value=''; reupId=null;
  });

  async function deletePlugin(id){
    if(!confirm('Delete this plugin? It will be hidden (soft-delete, can be restored).')) return;
    try{
      const r = await fetch('/api/delete?id=' + encodeURIComponent(id), { method:'POST' });
      if(!r.ok){ let d=''; try{ d=(await r.json()).error||''; }catch(e){} throw new Error('HTTP '+r.status+(d?' — '+d:'')); }
      await loadPlugins();
    }catch(err){ alert('Delete failed: ' + err.message); }
  }

  function resetFields(){
    pickedFile=null; upFile.value=''; document.getElementById('upName').value=''; document.getElementById('upBy').value='';
    upDrop.classList.remove('has-file');
    document.getElementById('upDropTitle').textContent='Drop a .zip or click to browse';
    document.getElementById('upDropHint').textContent='Plugin archive (.zip)';
  }
  function resetForm(){ editId=null; document.getElementById('modalTitle').textContent='Upload a plugin'; resetFields(); closeUpload(); }

  async function submitUpload(){
    const name = document.getElementById('upName').value.trim();
    const by = document.getElementById('upBy').value.trim() || 'Anonymous';
    if(!name){ alert('Add a name'); return; }

    // EDIT mode
    if(editId){
      try{
        const q = new URLSearchParams({ id: editId, name, by });
        if(pickedFile) q.set('filename', pickedFile.name);
        const r = await fetch('/api/update?' + q.toString(), { method:'POST', body: pickedFile || '' });
        if(!r.ok){ let d=''; try{ d=(await r.json()).error||''; }catch(e){} throw new Error('HTTP '+r.status+(d?' — '+d:'')); }
        await loadPlugins();
      }catch(err){ alert('Edit failed: ' + err.message); }
      resetForm(); return;
    }

    // CREATE mode
    if(!pickedFile){ alert('Add a .zip file'); return; }
    if(location.protocol === 'file:'){ insertPlugin(name, by, URL.createObjectURL(pickedFile), pickedFile.name); resetForm(); return; }
    try{
      const q = new URLSearchParams({ name, by, filename: pickedFile.name });
      const r = await fetch('/api/upload?' + q.toString(), { method:'POST', body: pickedFile });
      if(!r.ok){ let d=''; try{ d=(await r.json()).error||''; }catch(e){} throw new Error('HTTP '+r.status+(d?' — '+d:'')); }
      await loadPlugins();
    }catch(err){
      alert('Upload failed (' + err.message + '). Showing a local copy instead.');
      insertPlugin(name, by, URL.createObjectURL(pickedFile), pickedFile.name);
    }
    resetForm();
  }

  loadPlugins();   // load existing uploads on page open

  /* ---------- Figma files (market tabs + cards) ---------- */
  let FIGMA = [], figmaMarket = 'Native';
  function openFigma(){
    document.getElementById('fgName').value=''; document.getElementById('fgLink').value=''; document.getElementById('fgDesc').value='';
    document.getElementById('fgMarket').value = figmaMarket;
    document.getElementById('figmaOverlay').classList.add('open');
  }
  function closeFigma(){ document.getElementById('figmaOverlay').classList.remove('open'); }

  document.querySelectorAll('#figmaTabs .chip-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#figmaTabs .chip-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); figmaMarket = b.dataset.market; renderFigma();
  }));

  async function loadFigma(){
    if(location.protocol === 'file:'){ renderFigma(); return; }
    try{ const r = await fetch('/api/figma'); if(!r.ok) return; FIGMA = await r.json(); renderFigma(); }catch(e){ /* offline */ }
  }
  function renderFigma(){
    const grid = document.getElementById('figmaGrid');
    const list = FIGMA.filter(f => f.market === figmaMarket);
    grid.innerHTML = '';
    document.getElementById('figmaEmpty').style.display = list.length ? 'none' : 'block';
    list.forEach(f => {
      const el = document.createElement('div'); el.className = 'fcard';
      el.innerHTML = `<button class="dots" onclick="deleteFigma(event,'${f.id}')"><span class="material-symbols-outlined">delete</span></button>
        <div class="fcover mk-${f.market}"></div>
        <div class="fbody"><h4></h4><div class="fdesc"></div>
          <div class="ffoot"><span class="fmkt">${f.market}</span>
          <a class="sbtn solid" target="_blank" href="${f.link}"><span class="material-symbols-outlined">open_in_new</span> Open</a></div></div>`;
      el.querySelector('.fcover').textContent = f.name;   // cover shows the file name
      el.querySelector('h4').textContent = f.name;
      el.querySelector('.fdesc').textContent = f.description || '';
      grid.appendChild(el);
    });
  }
  function setFigmaTab(m){ figmaMarket = m; document.querySelectorAll('#figmaTabs .chip-btn').forEach(x => x.classList.toggle('active', x.dataset.market === m)); }

  async function submitFigma(){
    const name = document.getElementById('fgName').value.trim();
    const market = document.getElementById('fgMarket').value;
    const link = document.getElementById('fgLink').value.trim();
    const description = document.getElementById('fgDesc').value.trim();
    if(!name || !link){ alert('Add a name and a Figma link'); return; }
    if(location.protocol === 'file:'){ FIGMA.unshift({ id:'local'+Date.now(), name, market, link, description }); setFigmaTab(market); renderFigma(); closeFigma(); return; }
    try{
      const q = new URLSearchParams({ name, market, link, description });
      const r = await fetch('/api/figma?' + q.toString(), { method:'POST' });
      if(!r.ok){ let d=''; try{ d=(await r.json()).error||''; }catch(e){} throw new Error('HTTP '+r.status+(d?' — '+d:'')); }
      await loadFigma();
    }catch(err){ alert('Add failed: ' + err.message); }
    setFigmaTab(market); renderFigma(); closeFigma();
  }

  async function deleteFigma(e, id){
    e.stopPropagation();
    if(!confirm('Delete this Figma file card?')) return;
    try{
      const r = await fetch('/api/figma-delete?id=' + encodeURIComponent(id), { method:'POST' });
      if(!r.ok) throw new Error('HTTP '+r.status);
      await loadFigma();
    }catch(err){ alert('Delete failed: ' + err.message); }
  }
