// api/v1/public/[...path].js
export default async function handler(req, res) {
  const { path = [] } = req.query;
  const tail = Array.isArray(path) ? path.join('/') : String(path || '');
  const url = `https://openapi.blofin.com/api/v1/public/${tail}`;

  try {
    const upstream = await fetch(url, {
      method: req.method || 'GET',
      headers: {
        // forward only safe headers
        'content-type': 'application/json'
      }
    });

    // pass through status (200 expected from /time)
    res.status(upstream.status);

    // try to proxy JSON (if upstream returned text/html by mistake, just forward the text)
    const ct = upstream.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await upstream.json();
      res.json(data);
    } else {
      const text = await upstream.text();
      res.setHeader('content-type', ct || 'text/plain');
      res.send(text);
    }
  } catch (err) {
    res.status(502).json({ ok: false, error: 'proxy_failed', message: String(err) });
  }
}
