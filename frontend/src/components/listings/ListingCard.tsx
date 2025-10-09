"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Listing } from "@/src/types/listing";

export function ListingCard({ data }: { data: Listing }) {
  return (
    <Link
      href={`/listings/${data.id}`}
      className="flex gap-4 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow p-3"
    >
      <div className="relative w-44 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {data.thumbnail_url ? (
          <Image
            src={data.thumbnail_url}
            alt={data.title}
            fill
            className="object-cover"
            sizes="176px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
          oto.com.vn
        </div>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-[15px] font-medium text-gray-900 line-clamp-2 mb-1">
          {data.title}
        </h3>

        <div className="flex items-center gap-4 text-[13px] text-gray-600 mb-1">
          <span>• {data.mileage?.toLocaleString()} km</span>
          <span>• Máy xăng</span>
        </div>

        <div className="flex items-center gap-4 text-[13px] text-gray-600">
          <span>• Số tự động</span>
          <span>• Xe cũ</span>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end py-1 min-w-[200px]">
        <div className="text-right">
          <div className="text-[20px] font-bold text-red-600 mb-2">
            {(data.price_vnd / 1_000_000).toLocaleString()} triệu
          </div>

          <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
            <span className="text-gray-700">Thuý tùng Tây Nguyên</span>
          </div>

          <div className="flex items-center gap-1 text-[13px] text-gray-600 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>Đắk Lắk</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[13px] text-gray-700">
              <Phone className="w-3.5 h-3.5" />
              <span>0705555114</span>
            </div>
            <button className="px-4 py-1.5 border border-gray-300 rounded text-[13px] hover:bg-gray-50 transition-colors">
              📞 Gọi ngay
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
