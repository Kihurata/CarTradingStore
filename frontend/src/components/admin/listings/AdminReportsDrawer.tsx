"use client";
import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export type BackendStatus =
  | "new" | "reviewing" | "accepted" | "rejected" | "dismissed" | "resolved"
  | "valid" | "invalid"; // phòng khi BE đã migrate

export type ReportCard = {
  id: string;
  type: string;            // "wrong_info" | "spam" | "image" | "other" ...
  note: string | null;
  status: BackendStatus;
  created_at: string;      // ISO string
  reporter_name?: string | null;
  reporter_phone?: string | null;
};

type UiStatus = "new" | "reviewing" | "valid" | "invalid" | "resolved";

// Map BE status -> UI status (đã chốt)
const toUiStatus = (s: BackendStatus): UiStatus => {
  switch (s) {
    case "accepted":
    case "valid":
      return "valid";
    case "rejected":
    case "dismissed":
    case "invalid":
      return "invalid";
    case "resolved":
      return "resolved";
    case "reviewing":
      return "reviewing";
    case "new":
    default:
      return "new";
  }
};

const statusBadgeClass: Record<UiStatus, string> = {
  new:        "bg-gray-100 text-gray-700",
  reviewing:  "bg-gray-100 text-gray-700",
  valid:      "bg-emerald-100 text-emerald-700",
  invalid:    "bg-rose-100 text-rose-700",
  resolved:   "bg-blue-100 text-blue-700",
};

const humanType = (t: string) => {
  switch (t) {
    case "wrong_info": return "Thông tin sai";
    case "spam":       return "Spam / Quảng cáo";
    case "image":      return "Hình ảnh không phù hợp";
    default:           return "Khác";
  }
};

export default function AdminReportsDrawer({
  listingId,
  open,
  onClose,
  items = [],
  loading = false,
  error = "",
  onAction, // (id, action) => void; action: 'valid' | 'invalid' | 'resolved'
  showFooterLink = true,
}: {
  listingId: string;
  open: boolean;
  onClose: () => void;
  items?: ReportCard[];
  loading?: boolean;
  error?: string;
  onAction?: (reportId: string, action: "valid" | "invalid" | "resolved") => void;
  showFooterLink?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform
        ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b">
          <h3 className="font-semibold">Báo cáo vi phạm</h3>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" /> Đóng
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded border p-3 animate-pulse">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-56 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && <p className="text-red-600">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-gray-600">Chưa có báo cáo cho tin này.</p>
          )}

          {!loading && !error && items.map((r) => {
            const ui = toUiStatus(r.status);
            const showApproveReject = ui === "new" || ui === "reviewing";
            const showResolved = ui === "valid";
            const statusLabel = ui; // nếu muốn Việt hoá: { new: "mới", ... }

            return (
              <div key={r.id} className="rounded border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{humanType(r.type)}</div>
                    {r.note && <p className="text-sm text-gray-700 mt-1">{r.note}</p>}
                    <div className="mt-2 text-xs text-gray-500">
                      {r.reporter_name ? <>Người báo cáo: <span className="text-gray-700">{r.reporter_name}</span></> : null}
                      {r.reporter_phone ? <> {r.reporter_name ? " · " : ""}SĐT: <span className="text-gray-700">{r.reporter_phone}</span></> : null}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-0.5 rounded ${statusBadgeClass[ui]}`}>
                    {statusLabel}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </div>

                {(showApproveReject || showResolved) && (
                  <div className="mt-3 flex items-center gap-2">
                    {showApproveReject && (
                      <>
                        <button
                          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => onAction?.(r.id, "valid")}
                        >
                          Hợp lệ
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => onAction?.(r.id, "invalid")}
                        >
                          Không hợp lệ
                        </button>
                      </>
                    )}
                    {showResolved && (
                      <button
                        className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                        onClick={() => onAction?.(r.id, "resolved")}
                      >
                        Đã xử lý
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showFooterLink && (
          <div className="border-t p-3 text-right">
            <Link
              href={`/admin/listings/${listingId}/reports`}
              className="text-sm text-[#3B6A84] hover:underline"
            >
              Xem tất cả &nbsp;→
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}