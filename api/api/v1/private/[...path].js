/ api/v1/private/[...path].js
export default async function handler(req, res) {
  try {
    const base = "https://openapi.blofin.com";
    const inUrl = new URL(req.url, "http://localhost");
    const tail = inUrl.pathname.replace(/^\/api\/v1\/private\/?/, "");
    const upstream = `${base}/api/v1/private/${tail}`.replace(/([^:]\/)\/+/g, "$1");

    // Required Blofin authentication headers from your env (Vercel)
    const headers = {
      "ACCESS-KEY": process.env.BLOFIN_API_KEY,
      "ACCESS-SIGN": process.env.BLOFIN_API_SIGN,
      "ACCESS-TIMESTAMP": Date.now().toString(),
      "ACCESS-PASSPHRASE": process.env.BLOFIN_API_PASSPHRASE,
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": "SkylineProxy/1.0",
    };

    const body = ["POST", "PUT", "PATCH"].includes(req.method)
      ? JSON.stringify(req.body)
      : undefined;

    const r = await fetch(`${upstream}${inUrl.search}`, {
      method: req.method,
      headers,
      body,
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
