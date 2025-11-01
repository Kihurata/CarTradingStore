// app/admin/page.tsx
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan nhanh về bài đăng, người dùng và hoạt động gần đây.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/listings?status=pending"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Clock className="w-4 h-4" />
            Duyệt bài chờ
          </Link>
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3B6A84] text-white px-3 py-2 text-sm hover:opacity-90"
          >
            <FileText className="w-4 h-4" />
            Quản lý Listings
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <CardKPI
          icon={<Clock className="w-5 h-5" />}
          title="Bài chờ duyệt"
          value="—"
          trend="+12% tuần này"
          tone="amber"
          href="/admin/listings?status=pending"
        />
        <CardKPI
          icon={<CheckCircle className="w-5 h-5" />}
          title="Đã duyệt (hôm nay)"
          value="—"
          trend="+4 so với hôm qua"
          tone="emerald"
          href="/admin/listings?status=approved"
        />
        <CardKPI
          icon={<Users className="w-5 h-5" />}
          title="Người dùng mới"
          value="—"
          trend="Ổn định"
          tone="indigo"
          href="/admin/users"
        />
        <CardKPI
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Báo cáo vi phạm"
          value="—"
          trend="Cần xử lý"
          tone="rose"
          href="/admin/reports"
        />
      </section>

      {/* 2 cột nội dung */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pending gần đây */}
        <div className="xl:col-span-2 rounded-xl border bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Bài đăng chờ duyệt gần đây</h2>
            </div>
            <Link
              href="/admin/listings?status=pending"
              className="text-sm text-[#3B6A84] hover:underline inline-flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-medium px-4 py-2">Tiêu đề</th>
                  <th className="text-left font-medium px-4 py-2">Người bán</th>
                  <th className="text-left font-medium px-4 py-2">Giá</th>
                  <th className="text-left font-medium px-4 py-2">Ngày tạo</th>
                  <th className="text-right font-medium px-4 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700">
                          Duyệt
                        </button>
                        <button className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700">
                          Từ chối
                        </button>
                        <Link
                          href="/admin/listings?status=pending"
                          className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Khối tóm tắt & thao tác nhanh */}
        <div className="rounded-xl border bg-white">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900">Tổng quan nhanh</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tình trạng hệ thống & tác vụ thường dùng
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* “Ảnh” biểu đồ placeholder */}
            <div className="h-32 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/listings?status=rejected"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <AlertTriangle className="w-4 h-4 inline-block mr-2 text-rose-600" />
                Xem bài bị từ chối
              </Link>
              <Link
                href="/admin/listings"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                Tất cả bài đăng
              </Link>
              <Link
                href="/admin/users"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Quản lý người dùng
              </Link>
              <Link
                href="/admin/listings/create"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <PlusCircle className="w-4 h-4 inline-block mr-2" />
                Tạo listing mới
              </Link>
            </div>

            <div className="text-xs text-gray-500">
              Gợi ý: Kết nối dữ liệu thật để thay “—” ở thẻ KPI & bảng pending.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ====== small, reusable KPI card ====== */
function CardKPI({
  icon,
  title,
  value,
  trend,
  tone = "gray",
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  tone?: "amber" | "emerald" | "indigo" | "rose" | "gray";
  href?: string;
}) {
  const toneMap: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    gray: "bg-gray-50 text-gray-700 ring-gray-100",
  };

  const CardContent = (
    <div className="rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ring-8 ${toneMap[tone]}`}>
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        </div>
      </div>
      {trend && <div className="mt-2 text-xs text-gray-500">{trend}</div>}
    </div>
  );

  return href ? (
    <Link href={href} className="block">{CardContent}</Link>
  ) : (
    CardContent
  );
}
