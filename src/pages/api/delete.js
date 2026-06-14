import { list, del } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

// POST /api/delete?id=  → permanently removes the plugin (zip + metadata) from Blob
export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    if (!id) return json({ error: 'Missing id' }, 400);

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const { blobs } = await list({ prefix: 'meta/', ...t });
    for (const b of blobs) {
      const meta = await (await fetch(b.url)).json();
      if (meta.id === id) {
        const targets = [b.url];           // the metadata json
        if (meta.url) targets.push(meta.url); // the uploaded .zip
        await del(targets, t);
        return json({ ok: true, deleted: targets.length });
      }
    }
    return json({ error: 'Plugin not found' }, 404);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
