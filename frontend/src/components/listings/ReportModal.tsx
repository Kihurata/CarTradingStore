"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  listingId: string;
};

// Map label -> enum trong DB
const REASONS = [
  { label: "Lừa đảo", value: "fraud" },
  { label: "Không liên lạc được", value: "unreachable" },
  { label: "Sai giá", value: "wrong_price" },
  { label: "Tin bị trùng lặp", value: "duplicate" },
  { label: "Xe đã bán", value: "sold" },
  { label: "Thông tin không đúng", value: "incorrect_info" },
  { label: "Khác", value: "other" },
] as const;

export default function ReportModal({ open, onClose, listingId }: Props) {
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"] | "">("");
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const loadUserData = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      console.log("🔍 DEBUG - Stored user from localStorage:", storedUser);
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log("🔍 DEBUG - User phone from localStorage:", user.phone);
          setPhone(user.phone || "");
        } catch (err) {
          console.error("Error parsing stored user:", err);
        }
      } else {
        console.log("🔍 DEBUG - No user found in localStorage");
      }
    }
  };

  // Đóng khi bấm ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Load user data khi mở modal
  useEffect(() => {
    if (open) {
      console.log("🔍 DEBUG - Modal opened, loading user data...");
      loadUserData();
    }
  }, [open]);

  // Click backdrop để đóng
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const isVNPhone = (s: string) => {
    const cleaned = s.replace(/\s+/g, "");
    // đơn giản: 10–11 chữ số, bắt đầu 0 hoặc +84
    return /^((\+?84)|0)\d{9,10}$/.test(cleaned);
  };

  // Kiểm tra xem có user trong localStorage không
  const hasUser = typeof window !== "undefined" && !!localStorage.getItem("user");
  const needPhone = !hasUser; // Cần phone nếu không có user
  const hasValidPhone = phone.trim().length > 0 && isVNPhone(phone.trim());
  const isValid = !!reason && (!needPhone || hasValidPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const body = {
        listing_id: listingId,
        type: reason,                 // enum trong DB
        note: content.trim() || null, // khớp cột "note"
        reporter_phone: phone.trim() || null, // khớp cột "reporter_phone"
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      alert("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất.");
      setReason("");
      setContent("");
      setPhone("");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gửi báo cáo thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={onBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="report-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 id="report-title" className="text-2xl font-bold text-black">
            Báo cáo vi phạm
          </h2>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-black"
          >
            ×
          </button>
        </div>

        <p className="px-6 mt-2 text-center text-gray-600">
          Nếu tin rao này có bất cứ vấn đề gì, hãy báo cho chúng tôi để được hỗ trợ tốt hơn!
        </p>

        {/* Reasons */}
        <div className="px-6 mt-4 flex flex-wrap gap-3 justify-center">
          {REASONS.map((r) => {
            const active = reason === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(active ? "" : r.value)}
                className={[
                  "px-4 py-2 rounded-full border transition",
                  active
                    ? "border-gray-900 text-gray-900 font-semibold"
                    : "border-gray-300 text-gray-700 hover:border-gray-400",
                ].join(" ")}
                aria-pressed={active}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-3">
          {/* Gợi ý thêm: show input phụ khi chọn "Khác" */}
          {reason === "other" && (
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả vấn đề (bắt buộc khi chọn Khác)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              required
            />
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung thêm (không bắt buộc trừ khi chọn Khác)"
            className="w-full min-h-[140px] rounded-lg border border-gray-300 px-4 py-3 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />

          {/* Yêu cầu SĐT nếu ẩn danh */}
          <div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={needPhone ? "Số điện thoại (bắt buộc)" : "Số điện thoại (không bắt buộc)"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              inputMode="tel"
              required={needPhone}
              readOnly={hasUser && phone} // Readonly nếu có user và có số phone
            />
            {needPhone && phone && !isVNPhone(phone.trim()) && (
              <p className="mt-1 text-sm text-red-600">Số điện thoại chưa đúng định dạng.</p>
            )}
            {hasUser && !phone && (
              <p className="mt-1 text-sm text-gray-600">Không tìm thấy số điện thoại trong tài khoản.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              disabled={!isValid || loading}
            >
              {loading ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}