// app/api/admin/users/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  console.log("BFF RAW COOKIE:", req.headers.get("cookie"));

  const base = process.env.INTERNAL_API_BASE;
  if (!base) {
    return NextResponse.json({ error: "INTERNAL_API_BASE is not set" }, { status: 500 });
  }

  const target = `${base}/api/admin/users${qs}`;

  const res = await fetch(target, {
    headers: {
      cookie: req.headers.get("cookie") ?? "", // ✅ QUAN TRỌNG
    },
    cache: "no-store",
  });

  const body = await res.text();

  return new NextResponse(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
