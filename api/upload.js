import { put } from '@vercel/blob';

// POST /api/upload?name=..&by=..&filename=..   body = raw .zip bytes
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const name = String(req.query.name || '').trim();
    const by = String(req.query.by || 'Anonymous').trim();
    const filename = String(req.query.filename || 'plugin.zip').trim();
    if (!name) { res.status(400).json({ error: 'Missing name' }); return; }

    // collect raw request body (the file bytes)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    if (buffer.length === 0) { res.status(400).json({ error: 'Empty file' }); return; }

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const zipOpts = { access: 'public', contentType: 'application/zip' };
    if (token) zipOpts.token = token;
    const blob = await put(`plugins/${Date.now()}-${safe}`, buffer, zipOpts);

    const meta = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name, by, filename,
      url: blob.url,
      date: new Date().toISOString(),
    };
    // store metadata as a small JSON blob so everyone can list it
    const metaOpts = { access: 'public', contentType: 'application/json' };
    if (token) metaOpts.token = token;
    await put(`meta/${meta.id}.json`, JSON.stringify(meta), metaOpts);

    res.status(200).json({ ok: true, plugin: meta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
