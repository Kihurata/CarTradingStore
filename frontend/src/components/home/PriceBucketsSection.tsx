"use client";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { formatPriceVND } from "@/lib/formatCurrency";

interface ListingItem {
  id: string;
  title: string;
  price_vnd: number;
  thumbnail_url?: string;
}

interface ListingsResponse {
  data: ListingItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ROWS = [
  { title: "XE Ô TÔ CŨ DƯỚI 300 TRIỆU", query: "min_price=0&max_price=300000000" },
  { title: "XE Ô TÔ CŨ 300-500 TRIỆU", query: "min_price=300000000&max_price=500000000" },
];

export default function PriceBucketsSection() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">TIN BÁN XE THEO KHOẢNG GIÁ</h2>
      <div className="space-y-6">
        {ROWS.map((row) => (
          <Row key={row.title} title={row.title} query={row.query} />
        ))}
      </div>
    </section>
  );
}

function Row({ title, query }: { title: string; query: string }) {
  const { data, isLoading } = useSWR<ListingsResponse>(
    `/listings?status=approved&limit=10&${query}`,
    api
  );

  const items: ListingItem[] = data?.data ?? [];

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between px-4 pt-3">
        <h3 className="text-sm font-semibold text-slate-700 uppercase">{title}</h3>
        <Link href={`/listings?${query}`} className="text-sm text-blue-600 hover:underline">
          Xem tất cả »
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 p-4">
          {((isLoading ? Array.from({ length: 8 }) : items) as ListingItem[]).map(
            (it: ListingItem, i: number) => (
              <Card key={it?.id ?? i} item={it} skeleton={isLoading} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ item, skeleton }: { item?: ListingItem; skeleton?: boolean }) {
  if (skeleton) return <div className="h-56 rounded-xl bg-slate-100 animate-pulse" />;
  if (!item) return null;

  return (
    <Link
      href={`/listings/${item.id}`}
      className="block border rounded-xl overflow-hidden hover:shadow"
    >
      <div className="relative h-40 bg-slate-100">
        {item.thumbnail_url && (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="220px"
            loading="eager"
          />
        )}
      </div>
      <div className="p-3">
        <div className="line-clamp-2 min-h-[3rem] text-black text-[15px] font-bold">{item.title}</div>
        <p className="font-bold text-black">{formatPriceVND(item.price_vnd)}</p>
        <div className="font-bold mt-1 text-[14px] text-blue-400 hover:underline">Xem chi tiết »</div>
      </div>
    </Link>
  );
}