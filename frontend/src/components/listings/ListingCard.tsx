"use client";
import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/src/types/listing";

export function ListingCard({ data }: { data: Listing }) {
  return (
    <Link
      href={`/listings/${data.id}`}
      className="block border rounded-xl overflow-hidden hover:shadow"
    >
      <div className="relative h-40 bg-slate-100">
        {data.thumbnail_url && (
          <Image
            src={data.thumbnail_url}
            alt={data.title}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 25vw"
          />
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-slate-600">
          {data.brand} • {data.year}
        </div>
        <div className="font-medium line-clamp-2 min-h-[3rem]">
          {data.title}
        </div>
        <div className="mt-1 font-semibold text-blue-600">
          {(data.price_vnd / 1_000_000).toLocaleString()} triệu
        </div>
      </div>
    </Link>
  );
}
