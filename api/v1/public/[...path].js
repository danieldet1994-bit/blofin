// api/v1/public/[...path].js
// Simple public forwarder to Blofin public API.
// Example: /api/v1/public/time  ->  https://openapi.blofin.com/api/v1/public/time

export const config = { runtime: 'nodejs' }; // or 'edge' if you prefer

const BLOFIN_ROOT = 'https://openapi.blofin.com/api/v1/public';

export default async function handler(req, res) {
  try {
    // Build the tail path after /api/v1/public/
    const url = new URL(req.url, 'http://localhost'); // base only to parse
    const tail = url.pathname.replace(/^\/api\/v1\/public\/?/, ''); // e.g. "time" or "ticker/24hr"

    if (!tail) {
      res.status(400).json({ ok: false, error: 'Missing path after /public/' });
      return;
    }

    const blofinUrl = `${BLOFIN_ROOT}/${tail}${url.search || ''}`;

    const fetchRes = await fetch(blofinUrl, {
      method: req.method,
      headers: { 'accept': 'application/json' },
      // No body for GET (most public endpoints are GET)
    });

    // Pass through status & JSON
    const text = await fetchRes.text();
    // Try to return JSON; if not JSON, return as text
    try {
      const json = JSON.parse(text);
      res.status(fetchRes.status).json(json);
    } catch {
      res.status(fetchRes.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
