import { cookies } from "next/headers";
import Pagination from "@/src/components/listings/Pagination";
import type { Listing } from "@/src/types/listing";
import AdminListingCard from "@/src/components/admin/AdminListingCard";

// luôn refetch theo searchParams
export const dynamic = "force-dynamic";

type ListingsResponse = {
  data: Listing[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default async function AdminListingsPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const page =
    Number(Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page) || 1;
  const limit = 9;

  // status mặc định "all" để xem tất cả; chỉ gắn vào query khi khác "all"
  const status =
    (Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status) || "all";

  const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status !== "all") qs.set("status", status);

  const url = `${base}/api/listings?${qs.toString()}`;

  // Forward cookie (dù đang tắt guard, giữ cho sẵn tương thích sau này)
  const res = await fetch(url, {
    cache: "no-store",
    headers: { Cookie: cookies().toString() },
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
    <main className="max-w-7xl mx-auto py-10 px-6">
      {/* Tabs trạng thái */}
      <div className="mb-6 flex items-center gap-14">
        {[
          { label: "PHÊ DUYỆT TIN", value: "pending",  href: "?status=pending"  },
          { label: "ĐANG BÁN", value: "approved", href: "?status=approved" },
          { label: "KHÔNG DUYỆT", value: "rejected", href: "?status=rejected" },
          // Nếu có trang thống kê riêng, đổi href cho đúng (vd: /admin?tab=stats hoặc /admin/stats)
          { label: "THỐNG KÊ", value: "stats",    href: "/admin?tab=stats"  },
        ].map((t) => {
          const active = t.value === status; // underline khi tab khớp status
          const isStats = t.value === "stats";

          return (
            <a
              key={t.value}
              href={t.href}
              className="relative pb-2 text-[16px] md:text-[18px] font-extrabold uppercase tracking-wide text-gray-900 hover:text-gray-700"
            >
              {t.label}
              {/* Gạch chân xanh chỉ hiện khi active và không áp dụng cho tab 'Thống kê' */}
              {active && !isStats && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 block h-[3px] w-20 bg-[#3B6A84] rounded" />
              )}
            </a>
          );
        })}
      </div>


      {data.length === 0 ? (
        <p className="text-gray-600">Không có bài đăng nào.</p>
      ) : (
        <div className="space-y-4">
          {/* 👇 map tương tự như trang thường, chỉ đổi component card */}
          {data.map((car) => (
            <AdminListingCard key={car.id} data={car} />
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} />
    </main>
  );
}
