// src/components/admin/listings/AdminReportsDrawer.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: string;
  type: string;         // ví dụ: "spam", "thông tin sai", ...
  note: string | null;
  status: "open" | "valid" | "invalid" | "resolved";
  reporter_name?: string | null;
  created_at: string;
};

export default function AdminReportsDrawer({
  listingId,
  open,
  onClose,
}: {
  listingId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports?listingId=${listingId}`, { cache: "no-store" });
        const json = await res.json();
        setItems(json.data || []);
      } catch {
        setError("Không tải được báo cáo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, listingId]);

  const updateStatus = async (id: string, status: Report["status"]) => {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // refresh list
    const res = await fetch(`/api/reports?listingId=${listingId}`, { cache: "no-store" });
    const json = await res.json();
    setItems(json.data || []);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"} `}
      aria-hidden={!open}
    >
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* panel phải */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <h3 className="font-semibold">Báo cáo vi phạm</h3>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Đóng</button>
        </div>

        <div className="p-4 space-y-3">
          {loading && <p className="text-gray-500">Đang tải…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && items.length === 0 && (
            <p className="text-gray-600">Chưa có báo cáo cho tin này.</p>
          )}

          {items.map((r) => (
            <div key={r.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{r.type}</div>
                <span className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              {r.note && <p className="text-sm text-gray-700 mt-1">{r.note}</p>}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{r.status}</span>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "valid")}
                    className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Hợp lệ
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "invalid")}
                    className="text-xs px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Không hợp lệ
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "resolved")}
                    className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                  >
                    Đã xử lý
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-3 text-right">
          <Link
            href={`/admin/listings/${listingId}/reports`}
            className="text-sm text-[#3B6A84] hover:underline"
          >
            Xem tất cả &nbsp;→
          </Link>
        </div>
      </aside>
    </div>
  );
}
