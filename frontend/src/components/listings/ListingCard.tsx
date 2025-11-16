"use client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Listing } from "@/src/types/listing";
import ListingRow from "./ListingRow";

type ListingCardProps = {
  data: Listing;
  showStatus?: boolean;
  mode?: "public" | "self";
};

export function ListingCard({ data, showStatus, mode = "public" }: ListingCardProps) {
  const router = useRouter();

  const rightArea =
    mode === "self" ? (
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border border-blue-600 text-blue-600 font-medium bg-white hover:bg-blue-50 cursor-pointer transition-colors"
        onClick={(e) => {
          e.preventDefault();
          router.push(`/listings/${data.id}/edit`);
        }}
      >
        Chỉnh sửa
      </button>
    ) : (
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border text-black font-medium bg-white hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={(e) => {
          e.preventDefault();
          // TODO: gọi tel: data.seller_phone
        }}
      >
        <Phone className="w-4 h-4 text-black" />
        Gọi ngay
      </button>
    );

  return (
    <Link
      href={`/listings/${data.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <ListingRow
        data={data}
        titleAsLink={false}
        rightArea={rightArea}
        variant="public"
        showStatus={showStatus}
      />
    </Link>
  );
}
