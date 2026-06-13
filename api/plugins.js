import { list } from '@vercel/blob';

// GET /api/plugins  → array of uploaded plugin metadata (newest first)
export default async function handler(req, res) {
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const opts = { prefix: 'meta/' };
    if (token) opts.token = token;
    const { blobs } = await list(opts);
    const metas = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(b.url);
        return r.json();
      })
    );
    const visible = metas.filter((m) => m && !m.deleted);
    visible.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    res.status(200).json(visible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
