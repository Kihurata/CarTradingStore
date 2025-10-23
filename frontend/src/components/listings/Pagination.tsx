"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        className="px-4 py-2 bg-gray-400 rounded disabled:opacity-50"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
      >
        ← Trước
      </button>

      <span className="font-medium text-black">
        Trang {page} / {totalPages}
      </span>

      <button
        className="px-4 py-2 bg-gray-400 rounded disabled:opacity-50"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        Sau →
      </button>
    </div>
  );
}
