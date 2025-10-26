// api/v1/public/[...path].js
// Forward any /api/v1/public/* call to Blofin public REST, preserving path+query.

export default async function handler(req, res) {
  try {
    // 1) Compute tail (path AFTER /api/v1/public)
    const urlIn = new URL(req.url, "http://localhost"); // base is ignored
    const prefix = "/api/v1/public";
    let tail = urlIn.pathname.startsWith(prefix)
      ? urlIn.pathname.slice(prefix.length) // keep leading '/' if present
      : urlIn.pathname;

    if (!tail || tail === "/") tail = "/"; // e.g. /api/v1/public -> /

    // 2) Build upstream URL (preserve query string)
    const upstream = new URL(`https://openapi.blofin.com/api/v1/public${tail}`);
    upstream.search = urlIn.search; // carry ?...

    // 3) Prepare headers (simple + friendly UA helps some CDNs)
    const headers = {
      accept: "application/json",
      "user-agent": "skyline-proxy/1.0 (+vercel)",
    };
    // If client sent Content-Type (for POST later), forward it
    const ct = req.headers["content-type"];
    if (ct) headers["content-type"] = ct;

    // 4) Forward
    const upstreamResp = await fetch(upstream.toString(), {
      method: req.method,
      headers,
    });

    const text = await upstreamResp.text();

    // 5) Try JSON first; if not JSON, pass through raw text with same status
    try {
      const json = JSON.parse(text);
      res.status(upstreamResp.status).json(json);
    } catch {
      res.status(upstreamResp.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
