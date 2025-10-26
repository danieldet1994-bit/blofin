// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    // Derive the tail path after /api/v1/public
    const inUrl = new URL(req.url, "http://localhost");
    const prefix = "/api/v1/public";
    let tail = inUrl.pathname.startsWith(prefix)
      ? inUrl.pathname.slice(prefix.length)
      : inUrl.pathname;
    if (!tail) tail = "/";

    // Build Blofin upstream URL
    const upstream = new URL(`https://openapi.blofin.com/api/v1/public${tail}`);
    upstream.search = inUrl.search; // preserve ?query

    // Emulate a real Chrome fetch from www.blofin.com
    const headers = {
      // Core
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      origin: "https://www.blofin.com",
      referer: "https://www.blofin.com/",

      // CORS-ish & Client Hints that many WAFs check
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      "sec-ch-ua":
        '"Chromium";v="125", "Not.A/Brand";v="24", "Google Chrome";v="125"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',

      // Often used by frontends hitting JSON APIs
      "x-requested-with": "XMLHttpRequest",

      // Pass through content-type only if the client set it
      ...(req.headers["content-type"]
        ? { "content-type": req.headers["content-type"] }
        : {})
    };

    // GET only (public endpoints)
    const r = await fetch(upstream.toString(), { method: "GET", headers });

    // Return JSON if possible; otherwise return raw text
    const text = await r.text();
    try {
      res.status(r.status).json(JSON.parse(text));
    } catch {
      res.status(r.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
