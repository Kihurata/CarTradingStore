// src/components/listings/ListingRow.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, UserRound } from "lucide-react";
import { Listing } from "@/src/types/listing";
import { ReactNode } from "react";
import { formatPriceVND } from "@/lib/formatCurrency";

type Props = {
  data: Listing;
  rightArea?: ReactNode;                 // cột nút/hành động (ngoài cùng bên phải)
  titleAsLink?: boolean;
  variant?: "public" | "admin";
  imgPriority?: boolean; 
  showStatus?: boolean;          // Mặc định false, chỉ dành cho admin
};

const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Nháp",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Đang bán",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Bị từ chối",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  sold: {
    label: "Đã bán",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  }
};


export default function ListingRow({
  data,
  rightArea,
  titleAsLink = true,
  variant = "public",
  imgPriority = false,
  showStatus = false,
}: Props) {
  const SellerInfo = (
    <div className="mt-3 text-[13px] text-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
          <UserRound className="w-4 h-4 text-gray-600" />
        </div>
        <span className="font-bold truncate max-w-[220px] md:max-w-[260px]">
          {data.seller_name || "Người bán"}
        </span>
      </div>
      <div className="flex items-center gap-1 text-gray-600 mt-1">
        <MapPin className="w-3.5 h-3.5" />
        <span className="truncate max-w-[260px]">
          {data.location_text || "Chưa cập nhật"}
        </span>
      </div>
      <div className="flex items-center gap-1 text-gray-700 mt-1">
        <Phone className="w-3.5 h-3.5" />
        <span>{data.seller_phone || "—"}</span>
      </div>
    </div>
  );

  const statusInfo =
  showStatus && data.status
    ? STATUS_STYLES[data.status] || {
        label: data.status,
        className: "bg-gray-100 text-gray-600 border-gray-200",
      }
    : null;
      
  const Price = (
    <div className="text-right">
      {statusInfo && (
        <div
          className={
            "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium mb-1 " +
            statusInfo.className
          }
        >
          {statusInfo.label}
        </div>
      )}
      <div className="text-[20px] font-bold text-red-600 leading-none">
        {formatPriceVND(data.price_vnd)}
      </div>
    </div>
  );

  // ============== PUBLIC ==============
  if (variant === "public") {
    return (
      <div className="flex items-start gap-4">
        {/* Cột 1: Ảnh */}
        <div className="relative w-56 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {data.thumbnail_url ? (
            <Image src={data.thumbnail_url} alt={data.title} fill className="object-cover" sizes="224px" priority={imgPriority} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Không có ảnh</div>
          )}
        </div>

        {/* Cột 2: Nội dung */}
        <div className="flex-1 min-w-0 pt-0.5">
          {titleAsLink ? (
            <Link href={`/listings/${data.id}`}>
              <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5 hover:underline">
                {data.title}
              </h3>
            </Link>
          ) : (
            <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">{data.title}</h3>
          )}

          <div className="text-[15px] text-gray-600 grid grid-cols-2 gap-x-6 gap-y-1">
            <span>• {data.mileage_km?.toLocaleString()} km</span>
            <span>• Máy xăng</span>
            <span>• Số tự động</span>
            <span>• Xe cũ</span>
          </div>
        </div>

        {/* Cột 3 (phải): Giá + seller + nút (public giữ nguyên logic cũ) */}
        <div className="min-w-[220px] flex flex-col items-end gap-2">
          <div className="text-right">
            {Price}
            {SellerInfo}
          </div>
          {rightArea}
        </div>
      </div>
    );
  }

  // ============== ADMIN: 3 cột mới + cột nút giữ nguyên ==============
  return (
    <div className="flex items-start gap-4">
      {/* Cột 1: Ảnh */}
      <div className="relative w-56 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {data.thumbnail_url ? (
          <Image src={data.thumbnail_url} alt={data.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 224px" priority={imgPriority}  />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Không có ảnh</div>
        )}
      </div>

      {/* Cột 2: Nội dung (tiêu đề + thông số) */}
      <div className="flex-1 min-w-0 pt-0.5">
        {titleAsLink ? (
          <Link href={`/listings/${data.id}`}>
            <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 leading-snug line-clamp-2 hover:underline">
              {data.title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-[16px] md:text-[18px] font-semibold text-gray-900 leading-snug line-clamp-2">
            {data.title}
          </h3>
        )}

        <div className="text-[15px] text-gray-600 grid grid-cols-2 gap-x-6 gap-y-1 mt-1">
          <span>• {data.mileage_km?.toLocaleString()} km</span>
          <span>• Máy xăng</span>
          <span>• Số tự động</span>
          <span>• Xe cũ</span>
        </div>
      </div>

      {/* Cột 3: GIÁ + seller info (mới thêm) */}
      <div className="min-w-[240px] flex flex-col items-end justify-start">
        {Price}
        {SellerInfo}
      </div>

      {/* Cột 4: Nút hành động (giữ nguyên) */}
      <div className="min-w-[220px] flex flex-col items-end gap-2">
        {rightArea}
      </div>
    </div>
  );
}
