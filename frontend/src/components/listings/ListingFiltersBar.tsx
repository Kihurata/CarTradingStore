"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type SortValue = "newest" | "price_asc" | "price_desc" | "most_viewed";

export default function ListingFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialSort = (searchParams.get("sort") as SortValue | null) ?? "newest";

  const [searchText, setSearchText] = useState(initialQ);
  const [sort, setSort] = useState<SortValue>(initialSort);

  const updateUrl = (changes: { q?: string; sort?: SortValue; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (changes.q !== undefined) {
      const q = changes.q.trim();
      if (q) params.set("q", q);
      else params.delete("q");
    }

    if (changes.sort !== undefined) {
      if (changes.sort) params.set("sort", changes.sort);
      else params.delete("sort");
    }

    if (changes.page !== undefined) {
      if (changes.page > 1) params.set("page", String(changes.page));
      else params.delete("page");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // tìm kiếm thì reset về page 1
    updateUrl({ q: searchText, page: 1 });
  };

  const handleSortChange = (value: SortValue) => {
    setSort(value);
    // đổi sort cũng reset về page 1
    updateUrl({ sort: value, page: 1 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      {/* Search */}
      <div className="flex w-full gap-2 md:w-2/3">
        <input
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          placeholder="Tìm theo tên xe, hãng, model, địa điểm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md text-black border border-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-100"
        >
          Tìm
        </button>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 md:w-1/3 md:justify-end">
        <span className="text-sm text-gray-500">Sắp xếp:</span>
        <select
          className="w-44 rounded-md border border-gray-300 px-2 py-2 text-sm"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as SortValue)}
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="most_viewed">Nhiều lượt xem</option>
        </select>
      </div>
    </form>
  );
}
