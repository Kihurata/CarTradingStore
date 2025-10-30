// app/admin/listings/page.tsx
import type { Listing } from "@/src/types/listing";
import AdminListingCard from "@/src/components/admin/listings/AdminListingCard";
import Pagination from "@/src/components/listings/Pagination";
import AdminStatusTabs from "@/src/components/admin/listings/AdminStatusTabs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type ListingsResponse = {
  data: Listing[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // ✅ Next 15: searchParams là Promise → phải await
  const sp = await searchParams;

  const page =
    Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const limit = 9;

  // Lấy status (raw, lowercase) cho UI
  const statusRaw = (Array.isArray(sp.status) ? sp.status[0] : sp.status)?.toLowerCase() || "all";

  const statusAPIMap: Record<string, string> = {
    all: "all",
    approved: "approved", 
    pending: "pending",   
    rejected: "rejected", 
    draft: "draft",
  };
  const statusAPI = statusAPIMap[statusRaw] ?? "all";

  const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (statusAPI !== "all") qs.set("status", statusAPI);
  const url = `${base}/api/listings?${qs.toString()}`;

  // ✅ Next 15: cookies() là async → phải await và tự serialize
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(url, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });

  if (!res.ok) {
    return (
      <main className="max-w-7xl mx-auto py-10 px-6">
        Lỗi tải danh sách.
      </main>
    );
  }

  const { data, meta } = (await res.json()) as ListingsResponse;

  return (
    // (tuỳ chọn) buộc remount khi đổi status để chắc chắn re-render
    <main key={statusRaw} className="max-w-7xl mx-auto py-10 px-6">
      <AdminStatusTabs />

      {data.length === 0 ? (
        <p className="text-gray-600">Không có bài đăng nào.</p>
      ) : (
        <div className="space-y-4">
          {data.map((car, idx) => (
            <AdminListingCard key={car.id} data={car} imgPriority={idx === 0}/>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}
