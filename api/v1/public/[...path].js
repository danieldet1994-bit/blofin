// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    const inUrl = new URL(req.url, "http://localhost");
    const prefix = "/api/v1/public";
    let tail = inUrl.pathname.startsWith(prefix)
      ? inUrl.pathname.slice(prefix.length) // keep leading "/" if present
      : inUrl.pathname;
    if (!tail) tail = "/";

    const upstream = new URL(`https://openapi.blofin.com/api/v1/public${tail}`);
    upstream.search = inUrl.search; // preserve ?query

    // Headers that usually satisfy WAFs for public endpoints
    const headers = {
      // look like a browser
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      "cache-control": "no-cache",
      // some WAFs insist on a same-site-ish Origin/Referer
      "origin": "https://www.blofin.com",
      "referer": "https://www.blofin.com/",
      // pass through content-type on POST later if needed
      ...(req.headers["content-type"]
        ? { "content-type": req.headers["content-type"] }
        : {}),
    };

    const upstreamResp = await fetch(upstream.toString(), {
      method: "GET", // public endpoints are GET
      headers,
    });

    const text = await upstreamResp.text();

    // Try JSON; if not JSON, pass raw
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
