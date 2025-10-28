// src/components/admin/AdminListingCard.tsx
"use client";
import { Listing } from "@/src/types/listing";
import ListingRow from "@/src/components/listings/ListingRow";
import { ShieldCheck, Edit3, RefreshCw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminListingCard({ data }: { data: Listing }) {
  const router = useRouter();

  const RightButtons = (
    <div className="flex flex-col gap-2 items-end">
      <button
        className="text-black px-3 py-1.5 rounded-lg text-[13px] border bg-white hover:bg-gray-100 inline-flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          // TODO: gọi API duyệt
        }}
      >
        <ShieldCheck className="w-4 h-4" /> Duyệt
      </button>

      <button
        className="text-black px-3 py-1.5 rounded-lg text-[13px] border bg-white hover:bg-gray-100 inline-flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          router.push(`/admin/listings/${data.id}/edit`);
        }}
      >
        <Edit3 className="w-4 h-4" /> Chỉnh sửa
      </button>

      <button
        className="text-black px-3 py-1.5 rounded-lg text-[13px] border bg-white hover:bg-gray-100 inline-flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          // TODO: mở modal cập nhật trạng thái
        }}
      >
        <RefreshCw className="w-4 h-4" /> Cập nhật trạng thái
      </button>

      <button
        className="text-black px-3 py-1.5 rounded-lg text-[13px] border bg-white hover:bg-gray-100 inline-flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          router.push(`/admin/reports?listingId=${data.id}`);
        }}
      >
        <AlertTriangle className="w-4 h-4" /> Xem vi phạm
      </button>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Admin: KHÔNG bọc toàn card bằng Link để nút hoạt động độc lập.
         Nếu muốn tiêu đề có link, ListingRow đã hỗ trợ titleAsLink */}
      <ListingRow data={data} rightArea={RightButtons} titleAsLink variant="admin" />
    </div>
  );
}
