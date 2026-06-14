export const prerender = false;

export async function GET() {
  const t = process.env.BLOB_READ_WRITE_TOKEN || '';
  return new Response(JSON.stringify({
    hasToken: !!t,
    length: t.length,
    startsWithRw: t.startsWith('vercel_blob_rw_'),
    hasNewline: /\r|\n/.test(t),
    storeId: process.env.BLOB_STORE_ID ? 'set' : 'missing',
  }), { headers: { 'content-type': 'application/json' } });
}
