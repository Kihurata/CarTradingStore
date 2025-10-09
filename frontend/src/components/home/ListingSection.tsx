"use client";

import useSWR from "swr";
import { api } from "@/lib/api"; // giữ helper fetch của bạn
import Link from "next/link";
import Image from "next/image";

type ListingCardDTO = {
  id: string;
  title: string;
  price_vnd: number;
  brand: string;
  model: string;
  year: number;
  thumbnail_url: string | null;
};

type ListingResp = {
  items: ListingCardDTO[];
  total: number;
};

export function ListingSection({
  title,
  endpoint, // ví dụ: "/listings?size=10" (BE tự filter status=approved)
}: { title: string; endpoint: string }) {
  const { data, isLoading, error } = useSWR(endpoint, (url) => api<ListingResp>(url));

  if (error) return <SectionWrapper title={title}><p className="py-10 text-center">Lỗi tải dữ liệu</p></SectionWrapper>;
  if (isLoading) return <SectionWrapper title={title}><SkeletonGrid /></SectionWrapper>;
  if (!data?.items?.length) return null;

  return (
    <SectionWrapper title={title}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.items.map((x) => (
          <Link key={x.id} href={`/listings/${x.id}`} className="block border rounded-xl overflow-hidden hover:shadow bg-white">
            <div className="relative h-40 bg-slate-100">
              {x.thumbnail_url && (
                <Image
                  src={x.thumbnail_url}
                  alt={x.title}
                  fill
                  sizes="(max-width:768px) 100vw, 20vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-600 capitalize">
                {x.brand} • {x.model} • {x.year}
              </div>
              <div className="font-medium line-clamp-2 min-h-[3rem]">{x.title}</div>
              <div className="mt-1 font-semibold text-blue-600">
                {formatVND(x.price_vnd)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}

function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <a href="/listings" className="text-sm text-blue-600 hover:underline">Xem tất cả</a>
      </div>
      {children}
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-52 rounded-xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function formatVND(n: number) {
  // hiển thị gọn: 865,000,000 ₫
  return n.toLocaleString("vi-VN") + " ₫";
}
