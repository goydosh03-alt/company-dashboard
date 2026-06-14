import { list, put } from '@vercel/blob';

// POST /api/figma-delete?id=   → soft-delete a figma-file card
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const id = String(req.query.id || '');
    if (!id) { res.status(400).json({ error: 'Missing id' }); return; }

    const { blobs } = await list({ prefix: 'figma/', ...t });
    for (const b of blobs) {
      const meta = await (await fetch(b.url)).json();
      if (meta.id === id) {
        meta.deleted = true;
        meta.deletedAt = new Date().toISOString();
        await put(b.pathname, JSON.stringify(meta), { access: 'public', contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false, ...t });
        res.status(200).json({ ok: true });
        return;
      }
    }
    res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
