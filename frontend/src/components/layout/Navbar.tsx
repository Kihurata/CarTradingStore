"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/listings"
            className="text-[13px] font-semibold text-gray-800 hover:text-gray-600 tracking-wide uppercase"
          >
            Ô TÔ CŨ
          </Link>
          <Link
            href="/news"
            className="text-[13px] font-semibold text-gray-800 hover:text-gray-600 tracking-wide uppercase"
          >
            TIN TỨC
          </Link>
        </div>

        <button
          onClick={() => router.push("/create-listing")}
          className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors uppercase tracking-wide"
        >
          ĐĂNG TIN
        </button>
      </div>
    </nav>
  );
}
