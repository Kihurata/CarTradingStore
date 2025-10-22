export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  const target = `${process.env.INTERNAL_API_BASE}/api/listings/models${qs}`;

  const res = await fetch(target, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}