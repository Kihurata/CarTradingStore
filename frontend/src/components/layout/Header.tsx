"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-[28px] font-bold text-[#0066CC] leading-none">oto</span>
          <span className="text-[20px] font-medium text-gray-700 leading-none">.com.vn</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/favorites"
            className="flex items-center justify-center w-9 h-9 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Yêu thích"
          >
            <Heart className="h-5 w-5 text-gray-600" />
          </Link>

          <Link
            href="/login"
            className="text-[15px] text-gray-700 hover:text-gray-900 whitespace-nowrap"
          >
            Đăng Nhập / Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}
