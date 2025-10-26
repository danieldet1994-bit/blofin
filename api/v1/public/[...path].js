// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    const inUrl = new URL(req.url, "http://localhost");
    const prefix = "/api/v1/public";
    let tail = inUrl.pathname.startsWith(prefix)
      ? inUrl.pathname.slice(prefix.length)
      : inUrl.pathname;
    if (!tail) tail = "/";

    const upstream = new URL(`https://openapi.blofin.com/api/v1/public${tail}`);
    upstream.search = inUrl.search;

    const headers = {
      // look like a normal browser hitting Blofin
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9",
      "cache-control": "no-cache",
      origin: "https://www.blofin.com",
      referer: "https://www.blofin.com/",
      ...(req.headers["content-type"]
        ? { "content-type": req.headers["content-type"] }
        : {})
    };

    const r = await fetch(upstream.toString(), { method: "GET", headers });
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
