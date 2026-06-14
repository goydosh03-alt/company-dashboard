import { list, del } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

// POST /api/figma-delete?id=  → permanently removes a Figma-file card
export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    if (!id) return json({ error: 'Missing id' }, 400);

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const { blobs } = await list({ prefix: 'figma/', ...t });
    for (const b of blobs) {
      const meta = await (await fetch(b.url)).json();
      if (meta.id === id) {
        await del(b.url, t);
        return json({ ok: true });
      }
    }
    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
