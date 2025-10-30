// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    const BASE = "https://openapi.blofin.com";

    // Strip prefix and normalize
    const inUrl = new URL(req.url, "http://local");
    const tail = inUrl.pathname.replace(/^\/api\/v1\/public\/?/, "");
    const upstreamPath = `/api/v1/public/${tail}`.replace(/\/{2,}/g, "/");
    const upstreamUrl = `${BASE}${upstreamPath}${inUrl.search || ""}`;

    // ✅ Browser-like headers (Blofin expects these)
    const headers = {
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      Origin: "https://www.blofin.com",
      Referer: "https://www.blofin.com/",
      "Accept-Language": "en-GB,en;q=0.9",
      ...(req.headers["content-type"]
        ? { "Content-Type": req.headers["content-type"] }
        : {}),
    };

    const r = await fetch(upstreamUrl, { method: "GET", headers });
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
