"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, UserRound } from "lucide-react";
import { Listing } from "@/src/types/listing";

export function ListingCard({ data }: { data: Listing }) {
  return (
    <Link
      href={`/listings/${data.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        {/* Ảnh bên trái */}
        <div className="relative w-56 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {data.thumbnail_url ? (
            <Image
              src={data.thumbnail_url}
              alt={data.title}
              fill
              className="object-cover"
              sizes="224px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Không có ảnh
            </div>
          )}
        </div>

        {/* Thông tin giữa */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1.5">
            {data.title}
          </h3>
          <div className="text-[15px] text-gray-600 grid grid-cols-2 gap-x-6 gap-y-1">
            <span>• {data.mileage_km?.toLocaleString()} km</span>
            <span>• Máy xăng</span>
            <span>• Số tự động</span>
            <span>• Xe cũ</span>
          </div>
        </div>

        {/* Giá & liên hệ bên phải */}
        <div className="min-w-[220px] flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-[20px] font-bold text-red-600 mb-1">
              {(data.price_vnd / 1_000_000).toLocaleString()} triệu
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-700">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                <UserRound className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-bold mt-1 truncate max-w-[140px]">
                {data.seller_name || "Người bán"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[13px] text-gray-600 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[160px]">
                {data.location_text || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[13px] text-gray-700 mt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{data.seller_phone || "—"}</span>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border border-grey text-black font-medium bg-white hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <Phone className="w-4 h-4 text-black" />
            Gọi ngay
          </button>
        </div>
      </div>
    </Link>
  );
}