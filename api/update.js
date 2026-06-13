import { list, put } from '@vercel/blob';

// POST /api/update?id=&name=&by=&filename=   body = (optional) new .zip bytes
// Edits metadata and/or replaces the plugin archive.
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Missing id' }); return; }

    // find the meta blob for this id
    const { blobs } = await list({ prefix: 'meta/', ...t });
    let target = null;
    for (const b of blobs) {
      const j = await (await fetch(b.url)).json();
      if (j.id === id) { target = { pathname: b.pathname, meta: j }; break; }
    }
    if (!target) { res.status(404).json({ error: 'Plugin not found' }); return; }

    const meta = target.meta;
    if (req.query.name) meta.name = String(req.query.name);
    if (req.query.by) meta.by = String(req.query.by);

    // optional re-upload: if a body was sent, store new zip and point to it
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const buffer = Buffer.concat(chunks);
    if (buffer.length > 0) {
      const filename = String(req.query.filename || meta.filename || 'plugin.zip');
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const zip = await put(`plugins/${Date.now()}-${safe}`, buffer, { access: 'public', contentType: 'application/zip', ...t });
      meta.url = zip.url;
      meta.filename = filename;
    }

    meta.updated = new Date().toISOString();
    await put(target.pathname, JSON.stringify(meta), { access: 'public', contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false, ...t });
    res.status(200).json({ ok: true, plugin: meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
