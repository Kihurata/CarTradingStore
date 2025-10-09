"use client";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

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

const TYPES = ["Sedan", "SUV", "MPV", "Bán tải", "Hatchback"];

export default function PopularBodyTypesSection() {
  const [tab, setTab] = useState<string>(TYPES[0]);

  const { data, isLoading } = useSWR<ListingsResponse>(
    `/listings?status=approved&limit=10&body_type=${encodeURIComponent(tab)}`,
    api
  );

  const items: ListingItem[] = data?.data ?? [];

  return (
    <section>
      <h2 className="text-lg font-semibold mb-1">
        TIN BÁN XE CŨ ĐƯỢC TÌM KIẾM PHỔ BIẾN
      </h2>
      <p className="text-sm text-slate-600 mb-2">
        Tổng hợp các tin đăng bán xe cũ được tìm kiếm phổ biến trên Oto.com.vn
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b pb-2">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`px-3 py-1.5 text-sm ${
              tab === type
                ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                : "text-slate-600 hover:text-blue-600"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Danh sách xe */}
      <div className="mt-3 rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 p-4">
            {((isLoading ? Array.from({ length: 10 }) : items) as ListingItem[]).map(
              (it: ListingItem, i: number) => (
                <Card key={it?.id ?? i} item={it} skeleton={isLoading} />
              )
            )}
          </div>
        </div>
        <div className="px-4 pb-3">
          <Link
            href={`/listings?body_type=${encodeURIComponent(tab)}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Xem chi tiết tin bán xe {tab} »
          </Link>
        </div>
      </div>
    </section>
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
          />
        )}
      </div>
      <div className="p-3">
        <div className="line-clamp-1 text-[13px] font-medium">{item.title}</div>
        <div className="mt-1 font-semibold text-blue-600">
          {item.price_vnd.toLocaleString("vi-VN")} ₫
        </div>
        <div className="mt-1 text-[12px] text-blue-600 hover:underline">
          Xem chi tiết »
        </div>
      </div>
    </Link>
  );
}
