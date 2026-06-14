import { list } from '@vercel/blob';
export const prerender = false;

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export async function GET() {
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    const t = token ? { token } : {};
    const { blobs } = await list({ prefix: 'meta/', ...t });
    const metas = await Promise.all(blobs.map(async (b) => (await fetch(b.url)).json()));
    const visible = metas.filter((m) => m && !m.deleted).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return json(visible);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
