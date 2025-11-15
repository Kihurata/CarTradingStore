import { ListingCard } from "@/src/components/listings/ListingCard";
import Pagination from "@/src/components/listings/Pagination";
import type { Listing } from "@/src/types/listing";
import ListingFiltersBar from "@/src/components/listings/ListingFiltersBar";

// luôn refetch theo searchParams
export const dynamic = "force-dynamic";

type ListingsResponse = {
  data: Listing[];
  meta: {
    page: number; 
    limit: number; 
    total: number; 
    totalPages: number 
  };
};

type ListingsPageProps = {
  // Next mới: searchParams là Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  // PHẢI await trước khi dùng
  const params = await searchParams;

  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const qParam = Array.isArray(params.q) ? params.q[0] : params.q;
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort;

  const page = Number(pageParam) || 1;
  const limit = 9;

  const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";

  // build query string: luôn có status/page/limit, optional q/sort
  const usp = new URLSearchParams();
  usp.set("status", "approved");
  usp.set("page", String(page));
  usp.set("limit", String(limit));

  if (qParam && qParam.toString().trim()) {
    usp.set("q", qParam.toString().trim());
  }

  if (sortParam) {
    usp.set("sort", sortParam.toString());
  }

  const url = `${base}/api/listings?${usp.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="max-w-7xl mx-auto py-10 px-6">
        Lỗi tải danh sách.
      </main>
    );
  }

  const { data, meta } = (await res.json()) as ListingsResponse;

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      {/* Thanh search + sort */}
      <ListingFiltersBar />

      {data.length === 0 ? (
        <p className="text-gray-600">Chưa có xe phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {data.map((car) => (
            <ListingCard key={car.id} data={car} />
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}
