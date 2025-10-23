// app/api/listings/route.ts

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  const target = `${process.env.INTERNAL_API_BASE}/api/listings${qs}`;

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

export async function POST(req: Request) {
  console.log("Incoming cookie:", req.headers.get("cookie"));
  const target = `${process.env.INTERNAL_API_BASE}/api/listings`;

  // Forward form-data body, cookie, và Content-Type (với boundary)
  const formData = await req.arrayBuffer();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const contentType = req.headers.get("content-type") ?? "";

  const res = await fetch(target, {
    method: "POST",
    body: formData,
    headers: {
      cookie: cookieHeader,
      ...(contentType ? { "content-type": contentType } : {}), // ✅ Forward Content-Type để multer parse đúng
    },
  });

  const resBody = await res.text();
  console.log("Proxy POST /listings response:", res.status, resBody); // log response
  return new Response(resBody, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}