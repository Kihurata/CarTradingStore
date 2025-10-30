// src/components/listings/ListingCard.tsx
"use client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { Listing } from "@/src/types/listing";
import ListingRow from "./ListingRow";

export function ListingCard({ data }: { data: Listing }) {
  return (
    <Link
      href={`/listings/${data.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <ListingRow
        data={data}
        titleAsLink={false}
        // public: nút "Gọi ngay" ở cột phải
        rightArea={
          <button
            type="button"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border text-black font-medium bg-white hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={(e) => {
              e.preventDefault(); // tránh bị Link bao ngoài nuốt click
              // TODO: gọi tel: hoặc mở modal
            }}
          >
            <Phone className="w-4 h-4 text-black" />
            Gọi ngay
          </button>
        }
        variant="public"
      />
    </Link>
  );
}
