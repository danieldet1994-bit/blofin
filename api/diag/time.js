// api/diag/time.js
export default async function handler(req, res) {
  const upstream = "https://openapi.blofin.com/api/v1/public/time";
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    "accept": "application/json, text/plain, */*",
    "origin": "https://www.blofin.com",
    "referer": "https://www.blofin.com/",
  };
  const r = await fetch(upstream, { headers });
  const body = await r.text();
  res.status(200).json({
    upstream_status: r.status,
    upstream_headers: Object.fromEntries(r.headers),
    body_preview: body.slice(0, 500),
  });
}
