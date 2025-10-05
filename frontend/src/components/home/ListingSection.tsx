"use client";
import useSWR from "swr";
import { api } from "@/src/lib/api";
import { ListingCard } from "@/src/components/listing/ListingCard";

export function ListingSection({ title, endpoint }: { title: string; endpoint: string }) {
  const { data, isLoading } = useSWR(endpoint, (url) => api<{items:any[]}>(url));

  if (isLoading) return <div className="py-10 text-center">Đang tải…</div>;
  if (!data?.items?.length) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <a href="/listings" className="text-sm text-blue-600 hover:underline">Xem tất cả</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.items.slice(0, 10).map((x:any) => <ListingCard key={x.id} data={x} />)}
      </div>
    </section>
  );
}
