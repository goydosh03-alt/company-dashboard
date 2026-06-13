// GET /api/health → safe diagnostic (does NOT leak the token, only prefix/length)
export default function handler(req, res) {
  const t = process.env.BLOB_READ_WRITE_TOKEN || '';
  res.status(200).json({
    hasToken: !!t,
    length: t.length,
    startsWithRw: t.startsWith('vercel_blob_rw_'),
    hasNewline: /\r|\n/.test(t),
    storeId: process.env.BLOB_STORE_ID ? 'set' : 'missing',
  });
}
