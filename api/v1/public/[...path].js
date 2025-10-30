// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    // Blofin public base
    const BASE = "https://openapi.blofin.com";

    // Normalize path: /api/v1/public/<tail>  ->  https://openapi.blofin.com/api/v1/public/<tail>
    const inUrl = new URL(req.url, "http://local");
    const tail = inUrl.pathname.replace(/^\/api\/v1\/public\/?/, "");
    const upstreamPath = `/api/v1/public/${tail}`.replace(/\/{2,}/g, "/");
    const upstreamUrl = `${BASE}${upstreamPath}${inUrl.search || ""}`;

    // --- Headers Blofin's WAF expects (browser-like) ---
    const headers = {
      // CORS/browser noise
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-GB,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Origin": "https://www.blofin.com",
      "Referer": "https://www.blofin.com/",
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      // carry content-type if present (rare for GET)
      ...(req.headers["content-type"]
        ? { "Content-Type": req.headers["content-type"] }
        : {}),
    };

    const r = await fetch(upstreamUrl, { method: "GET", headers });
    const text = await r.text();

    // Try to return JSON; otherwise pass raw
    try {
      res.status(r.status).json(JSON.parse(text));
    } catch {
      res.status(r.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
