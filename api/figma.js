import { list, put } from '@vercel/blob';

// GET  /api/figma                                  → array of figma-file cards (newest first)
// POST /api/figma?name=&market=&link=&description= → create a card
export default async function handler(req, res) {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  const t = token ? { token } : {};
  try {
    if (req.method === 'POST') {
      const name = String(req.query.name || '').trim();
      const link = String(req.query.link || '').trim();
      if (!name || !link) { res.status(400).json({ error: 'Missing name or link' }); return; }
      const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      const meta = {
        id, name, link,
        market: String(req.query.market || 'Native'),
        description: String(req.query.description || ''),
        date: new Date().toISOString(),
      };
      await put(`figma/${id}.json`, JSON.stringify(meta), { access: 'public', contentType: 'application/json', addRandomSuffix: false, ...t });
      res.status(200).json({ ok: true, file: meta });
      return;
    }
    // GET
    const { blobs } = await list({ prefix: 'figma/', ...t });
    const metas = await Promise.all(blobs.map(async (b) => (await fetch(b.url)).json()));
    const visible = metas.filter((m) => m && !m.deleted);
    visible.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    res.status(200).json(visible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
