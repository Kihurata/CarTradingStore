export async function POST(req: Request) {
  console.log('Incoming cookie:', req.headers.get('cookie'));
  const target = `${process.env.INTERNAL_API_BASE}/api/reports`;

  const body = await req.text(); // Vì JSON, không arrayBuffer
  const cookieHeader = req.headers.get('cookie') ?? '';
  const contentType = req.headers.get('content-type') ?? '';

  const res = await fetch(target, {
    method: 'POST',
    body,
    headers: {
      cookie: cookieHeader,
      ...(contentType ? { 'content-type': contentType } : {}),
    },
  });

  const resBody = await res.text();
  console.log('Proxy POST /reports response:', res.status, resBody);
  return new Response(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}