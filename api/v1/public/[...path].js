/ api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    const base = "https://openapi.blofin.com"; // Correct base URL

    // Normalize the requested path and remove accidental double slashes
    const inUrl = new URL(req.url, "http://localhost");
    const tail = inUrl.pathname.replace(/^\/api\/v1\/public\/?/, ""); // removes prefix
    const upstream = `${base}/api/v1/public/${tail}`.replace(/([^:]\/)\/+/g, "$1");

    const headers = {
      "user-agent": "curl/8.4.0 (+https://vercel.com edge)",
      accept: "application/json, text/plain, */*",
      ...(req.headers["content-type"]
        ? { "content-type": req.headers["content-type"] }
        : {}),
    };

    const r = await fetch(`${upstream}${inUrl.search}`, {
      method: req.method,
      headers,
    });

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
