import { list, put } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

// POST /api/figma-update?id=&name=&link=&type=&market=&description=
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
        ['name', 'link', 'type', 'market', 'description'].forEach((k) => {
          if (url.searchParams.has(k)) meta[k] = url.searchParams.get(k);
        });
        meta.updated = new Date().toISOString();
        await put(b.pathname, JSON.stringify(meta), { access: 'public', contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false, ...t });
        return json({ ok: true, file: meta });
      }
    }
    return json({ error: 'Not found' }, 404);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
