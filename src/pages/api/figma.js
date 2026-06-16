import { list, put } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function GET() {
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const { blobs } = await list({ prefix: 'figma/', ...t });
    const metas = await Promise.all(blobs.map(async (b) => (await fetch(b.url)).json()));
    const visible = metas.filter((m) => m && !m.deleted).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return json(visible);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

export async function POST({ request }) {
  try {
    const url = new URL(request.url);
    const name = (url.searchParams.get('name') || '').trim();
    const link = (url.searchParams.get('link') || '').trim();
    if (!name || !link) return json({ error: 'Missing name or link' }, 400);

    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const meta = {
      id, name, link,
      type: url.searchParams.get('type') || 'Design System',
      market: url.searchParams.get('market') || 'Native',
      description: url.searchParams.get('description') || '',
      date: new Date().toISOString(),
    };
    await put(`figma/${id}.json`, JSON.stringify(meta), { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ...t });
    return json({ ok: true, file: meta });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
