"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const goToPage = (p: number) => {
    // chặn out-of-range
    if (p < 1 || p > totalPages || p === page) return;

    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page"); // URL sạch ở trang 1
    } else {
      params.set("page", String(p));
    }
    const url = `${pathname}?${params.toString()}`;
    router.push(url, { scroll: true }); // scroll về đầu trang
  };

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        className="px-4 py-2 bg-gray-400 rounded disabled:opacity-50"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        ← Trước
      </button>

      <span className="font-medium text-black" aria-live="polite">
        Trang {page} / {totalPages}
      </span>

      <button
        className="px-4 py-2 bg-gray-400 rounded disabled:opacity-50"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        Sau →
      </button>
    </div>
  );
}
