import { list } from '@vercel/blob';

// GET /api/plugins  → array of uploaded plugin metadata (newest first)
export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: 'meta/' });
    const metas = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(b.url);
        return r.json();
      })
    );
    metas.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    res.status(200).json(metas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
