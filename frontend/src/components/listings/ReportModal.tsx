"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  listingId: string;
};

const REASONS = [
  "Lừa đảo",
  "Không liên lạc được",
  "Sai giá",
  "Tin bị trùng lặp",
  "Xe đã bán",
  "Thông tin không đúng",
];

export default function ReportModal({ open, onClose, listingId }: Props) {
  const [reason, setReason] = useState<string>("");
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Đóng khi bấm ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Click backdrop để đóng
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: gọi API thật của bạn. Dưới đây là ví dụ POST.
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          reason,
          content,
          phone,
        }),
      });
      alert("Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét sớm nhất.");
      setReason("");
      setContent("");
      setPhone("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gửi báo cáo thất bại, vui lòng thử lại.");
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
          <h2 id="report-title" className="text-2xl font-bold">
            Báo cáo vi phạm
          </h2>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
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
            const active = reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(active ? "" : r)}
                className={[
                  "px-4 py-2 rounded-full border transition",
                  active
                    ? "border-gray-900 text-gray-900 font-semibold"
                    : "border-gray-300 text-gray-700 hover:border-gray-400",
                ].join(" ")}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung"
            className="w-full min-h-[140px] rounded-lg border border-gray-300 px-4 py-3 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Số điện thoại"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
            inputMode="tel"
          />

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700"
              disabled={!reason && !content && !phone}
            >
              Gửi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
