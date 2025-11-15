import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const listing_id = url.searchParams.get('listing_id');
  if (!listing_id) return NextResponse.json({ error: 'Missing listing_id' }, { status: 400 });

  const target = `${process.env.INTERNAL_API_BASE}/api/reports?listing_id=${listing_id}`;
  const cookieHeader = req.headers.get('cookie') ?? '';

  const res = await fetch(target, {
    method: 'GET',
    headers: { cookie: cookieHeader },
  });
  const resBody = await res.text();
  console.log('Proxy GET /reports response:', res.status, resBody);
  return new Response(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const target = `${process.env.INTERNAL_API_BASE}/api/reports`;
  const body = await req.text();
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

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/'); // /api/reports/:reportId/status
  const reportId = segments[segments.length - 2]; // Lấy :reportId trước /status
  if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });

  const target = `${process.env.INTERNAL_API_BASE}/api/reports/${reportId}/status`;
  const body = await req.text();
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
  console.log('Proxy PATCH /reports/:reportId/status response:', res.status, resBody);
  return new Response(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
}