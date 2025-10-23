import { ListingCard } from "@/src/components/listings/ListingCard";
import Pagination from "@/src/components/listings/Pagination";
import type { Listing } from "@/src/types/listing";

// luôn refetch theo searchParams
export const dynamic = "force-dynamic";

type ListingsResponse = {
  data: Listing[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default async function ListingsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined>; }) {
  const page = Number(Array.isArray(searchParams?.page) ? searchParams?.page[0] : searchParams?.page) || 1;
  const limit = 9;

  const base = process.env.INTERNAL_API_BASE || "http://localhost:4000"; // dùng biến trong .env
  const url = `${base}/api/listings?status=approved&page=${page}&limit=${limit}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return <main className="max-w-7xl mx-auto py-10 px-6">Lỗi tải danh sách.</main>;
  }

  const { data, meta } = (await res.json()) as ListingsResponse;

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      {data.length === 0 ? (
        <p className="text-gray-600">Chưa có xe phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {data.map((car) => <ListingCard key={car.id} data={car} />)}
        </div>
      )}
      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}