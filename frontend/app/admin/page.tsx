// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatPriceVND } from "@/lib/formatCurrency";
import {
  CheckCircle,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

interface DashboardStats {
  pending_count: number;
  approved_today: number;
  new_users_today: number;
  pending_reports: number;
  recent_pending: {
    id: string;
    title: string;
    price_vnd: number;
    seller_name: string | null;
    created_at: string;
  }[];
}

export default function AdminHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api<{ data: DashboardStats }>(`/admin/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

const handleApprove = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/approve`, { method: "POST" });
      if (res.ok) {
        setStats((prev) => {
          if (!prev) return prev;
          const currentApproved = Number(prev.approved_today) || 0;
          return {
            ...prev,
            pending_count: Math.max(0, prev.pending_count - 1),
            approved_today: currentApproved + 1,
            recent_pending: prev.recent_pending.filter((l) => l.id !== listingId),
          };
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (listingId: string) => {
    setActionLoading(listingId);
    try {
      const res = await fetch(`/api/listings/${listingId}/reject`, { method: "POST" });
      if (res.ok) {
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pending_count: Math.max(0, prev.pending_count - 1),
            recent_pending: prev.recent_pending.filter((l) => l.id !== listingId),
          };
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
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
          value={loading ? "..." : stats?.pending_count?.toString() || "0"}
          trend="+12% tuần này"
          tone="amber"
          href="/admin/listings?status=pending"
        />
        <CardKPI
          icon={<CheckCircle className="w-5 h-5" />}
          title="Đã duyệt (hôm nay)"
          value={loading ? "..." : stats?.approved_today?.toString() || "0"}
          trend="+4 so với hôm qua"
          tone="emerald"
          href="/admin/listings?status=approved"
        />
        <CardKPI
          icon={<Users className="w-5 h-5" />}
          title="Người dùng mới"
          value={loading ? "..." : stats?.new_users_today?.toString() || "0"}
          trend="Ổn định"
          tone="indigo"
          href="/admin/users"
        />
        <CardKPI
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Báo cáo vi phạm"
          value={loading ? "..." : stats?.pending_reports?.toString() || "0"}
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
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
                          <button className="px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700">
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : stats?.recent_pending && stats.recent_pending.length > 0 ? (
                  stats.recent_pending.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900">{listing.title}</td>
                      <td className="px-4 py-2 text-gray-700">{listing.seller_name || "—"}</td>
                      <td className="px-4 py-2 text-gray-700">{formatPriceVND(listing.price_vnd)}</td>
                      <td className="px-4 py-2 text-gray-600 text-sm">
                        {new Date(listing.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Từ chối
                          </button>
                          <Link
                            href={`/admin/listings/${listing.id}`}
                            className="px-2 py-1 text-xs rounded border hover:bg-gray-50 inline-block"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Không có bài chờ duyệt
                    </td>
                  </tr>
                )}
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
              ✅ Dữ liệu thực tế từ database
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface CardKPIProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend: string;
  tone: "amber" | "emerald" | "indigo" | "rose";
  href?: string;
}

/* ====== small, reusable KPI card ====== */
function CardKPI({ icon, title, value, trend, tone, href }: CardKPIProps) {
  const toneClasses = {
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    rose: "bg-rose-50 text-rose-700",
  };

  const content = (
    <div className={`rounded-xl border p-4 ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs opacity-60 mt-1">{trend}</p>
        </div>
        <div className="text-xl opacity-50">{icon}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}