import { NextRequest } from 'next/server';

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').slice(-2, -1)[0]; // Lấy :id từ /api/listings/:id
  const target = `${process.env.INTERNAL_API_BASE}/api/listings/${id}`;
  const body = await req.blob(); // Vì multipart/form-data, dùng blob
  const cookieHeader = req.headers.get('cookie') ?? '';
  const contentType = req.headers.get('content-type') ?? '';

  const res = await fetch(target, {
    method: 'PATCH',
    body,
    headers: {
      cookie: cookieHeader,
      ...(contentType ? { 'content-type': contentType } : {}),
    },
  });

  const resBody = await res.text();
  console.log('Proxy PATCH /listings/:id response:', res.status, resBody);
  return new Response(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}