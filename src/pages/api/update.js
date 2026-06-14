import { list, put } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    if (!id) return json({ error: 'Missing id' }, 400);

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};

    const { blobs } = await list({ prefix: 'meta/', ...t });
    let target = null;
    for (const b of blobs) {
      const j = await (await fetch(b.url)).json();
      if (j.id === id) { target = { pathname: b.pathname, meta: j }; break; }
    }
    if (!target) return json({ error: 'Plugin not found' }, 404);

    const meta = target.meta;
    if (url.searchParams.get('name')) meta.name = url.searchParams.get('name');
    if (url.searchParams.get('by')) meta.by = url.searchParams.get('by');
    if (url.searchParams.has('description')) meta.description = url.searchParams.get('description');

    const buffer = Buffer.from(await request.arrayBuffer());
    if (buffer.length > 0) {
      const filename = url.searchParams.get('filename') || meta.filename || 'plugin.zip';
      const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const zip = await put(`plugins/${Date.now()}-${safe}`, buffer, { access: 'public', contentType: 'application/zip', ...t });
      meta.url = zip.url; meta.filename = filename;
    }

    meta.updated = new Date().toISOString();
    await put(target.pathname, JSON.stringify(meta), { access: 'public', contentType: 'application/json', allowOverwrite: true, addRandomSuffix: false, ...t });
    return json({ ok: true, plugin: meta });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
