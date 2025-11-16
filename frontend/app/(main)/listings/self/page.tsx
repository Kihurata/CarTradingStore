// app/listings/self/page.tsx
import { cookies } from "next/headers";
import { ListingCard } from "@/src/components/listings/ListingCard";
import Pagination from "@/src/components/listings/Pagination";
import type { Listing } from "@/src/types/listing";

export const dynamic = "force-dynamic";

type ListingsResponse = {
  data: Listing[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default async function SelfListingsPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const page =
    Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) || 1;
  const limit = 9;

  const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";
  const url = `${base}/api/listings/self?page=${page}&limit=${limit}`;

  // 👇 Lấy cookie của request hiện tại và forward qua header "Cookie"
  const cookieHeader = cookies().toString();

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (res.status === 401) {
    return (
      <main className="max-w-7xl mx-auto py-10 px-6">
        <p className="text-gray-600">Vui lòng đăng nhập để xem tin đăng của bạn.</p>
      </main>
    );
  }

  if (!res.ok) {
    return (
      <main className="max-w-7xl mx-auto py-10 px-6">
        <p className="text-red-600">Lỗi tải danh sách bài đăng cá nhân.</p>
      </main>
    );
  }

  const { data, meta } = (await res.json()) as ListingsResponse;

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-xl text-black font-semibold mb-6">TIN ĐĂNG CỦA BẠN</h1>

      {data.length === 0 ? (
        <p className="text-gray-600">Bạn chưa đăng tin nào.</p>
      ) : (
        <div className="space-y-4">
          {data.map((car) => (
            <ListingCard key={car.id} data={car} showStatus mode="self"/>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}
