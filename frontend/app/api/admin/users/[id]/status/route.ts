// app/api/admin/users/[id]/status/route.ts
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const backendBase =
    process.env.INTERNAL_API_BASE || "http://car-trading-backend:4000";

  const body = await req.text(); // forward raw body
  const cookieHeader = req.headers.get("cookie") ?? "";
  const contentType = req.headers.get("content-type") ?? "application/json";

  const res = await fetch(
    `${backendBase}/api/admin/users/${params.id}/status`,
    {
      method: "PATCH",
      headers: {
        cookie: cookieHeader,
        "content-type": contentType,
      },
      body,
      cache: "no-store",
    }
  );

  const resBody = await res.text();

  return new NextResponse(resBody, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
