// api/v1/public/[...path].js
// Simple proxy that forwards any /api/v1/public/... route to Blofin API.

export default async function handler(req, res) {
  try {
    const baseUrl = "https://openapi.blofin.com/api/v1/public";
    const tail = req.url.replace(/^\/api\/v1\/public\/?/, ""); // e.g. "time"
    const url = `${baseUrl}/${tail}`;

    const response = await fetch(url, {
      method: req.method,
      headers: { accept: "application/json" },
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      res.status(response.status).json(json);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
