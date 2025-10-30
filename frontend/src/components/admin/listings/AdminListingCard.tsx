"use client";
import { Listing, ListingStatus } from "@/src/types/listing";
import ListingRow from "@/src/components/listings/ListingRow";
import { ShieldCheck, Edit3, RefreshCw, AlertTriangle, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminListingCard({
  data,
  imgPriority = false,
}: {
  data: Listing;
  imgPriority?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/listings/${data.id}/approve`, { 
      method: "POST",
      credentials: "include" // Gửi cookie JWT cho auth admin
    });
    if (!res.ok) throw new Error(await res.text() || "Duyệt thất bại");
    router.refresh(); // Refresh list (di chuyển tab tự động nếu cần)
    alert("✅ Duyệt bài đăng thành công!");
  } catch (err) {
    console.error("Approve error:", err);
    alert("❌ Lỗi duyệt: " + (err as Error).message);
  } finally {
    setLoading(false);
  }
};

const handleReject = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/listings/${data.id}/reject`, { 
      method: "POST",
      credentials: "include" // Gửi cookie JWT
    });
    if (!res.ok) throw new Error(await res.text() || "Từ chối thất bại");
    router.refresh();
    alert("✅ Từ chối bài đăng thành công!");
  } catch (err) {
    console.error("Reject error:", err);
    alert("❌ Lỗi từ chối: " + (err as Error).message);
  } finally {
    setLoading(false);
  }
};

  const handleEdit = () => router.push(`/admin/listings/${data.id}/edit`);
  const handleRefresh = () => router.refresh();
  let RightButtons;
  if (data.status === ListingStatus.PENDING) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Duyệt
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Từ chối
        </button>
      </div>
    );
  } else if (data.status === ListingStatus.APPROVED) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          <Edit3 className="w-4 h-4" /> Chỉnh sửa
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
        <button
          disabled
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm cursor-default"
        >
          <ShieldCheck className="w-4 h-4" /> Đã duyệt
        </button>
      </div>
    );
  } else if (data.status === ListingStatus.REJECTED) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" /> Đã từ chối
        </div>
      </div>
    );
  } else {
    // draft hoặc khác
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 bg-gray-400 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-500"
        >
          <Edit3 className="w-4 h-4" /> Chỉnh sửa
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <ListingRow
        data={data}
        rightArea={RightButtons}
        titleAsLink
        variant="admin"
        imgPriority={imgPriority}
      />
    </div>
  );
}
