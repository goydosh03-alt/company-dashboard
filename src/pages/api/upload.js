import { put } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const name = (url.searchParams.get('name') || '').trim();
    const by = (url.searchParams.get('by') || 'Anonymous').trim();
    const filename = (url.searchParams.get('filename') || 'plugin.zip').trim();
    if (!name) return json({ error: 'Missing name' }, 400);

    const buffer = Buffer.from(await request.arrayBuffer());
    if (buffer.length === 0) return json({ error: 'Empty file' }, 400);

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = await put(`plugins/${Date.now()}-${safe}`, buffer, { access: 'public', contentType: 'application/zip', ...t });

    const meta = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), name, by, filename, url: blob.url, date: new Date().toISOString() };
    await put(`meta/${meta.id}.json`, JSON.stringify(meta), { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ...t });
    return json({ ok: true, plugin: meta });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
