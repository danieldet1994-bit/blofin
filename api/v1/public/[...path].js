// api/v1/public/[...path].js
export default async function handler(req, res) {
  try {
    const BASE = "https://openapi.blofin.com";

    // Normalize: strip our prefix and ensure single slashes only
    const inUrl = new URL(req.url, "http://local");
    const tail = inUrl.pathname.replace(/^\/api\/v1\/public\/?/, ""); // e.g. "time"
    const upstreamPath = `/api/v1/public/${tail}`.replace(/\/{2,}/g, "/"); // no //

    // Build upstream URL (keeps any ?query=…)
    const upstreamUrl = `${BASE}${upstreamPath}${inUrl.search || ""}`;

    // Minimal, safe headers — do NOT forward cookies/origin/referer
    const headers = {
      Accept: "application/json",
      "User-Agent": "SkylineProxy/1.0 (+vercel)",
    };
    if (req.headers["content-type"])
      headers["Content-Type"] = req.headers["content-type"];

    const r = await fetch(upstreamUrl, {
      method: req.method,                  // GET for /time
      headers,
      // no body for public GETs
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
