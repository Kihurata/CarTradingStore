// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Heart, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    router.push(`/listings?${p.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 h-14 grid grid-cols-12 gap-3 items-center">
        {/* Logo */}
        <div className="col-span-3 sm:col-span-2">
          <Link href="/" className="inline-flex items-center gap-1 font-bold text-blue-600">
            <span className="text-2xl leading-none">oto</span>
            <span className="text-gray-900 text-xl leading-none">.com</span>
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="col-span-6 sm:col-span-7">
          <Input
            placeholder="Tìm: hãng, mẫu xe, từ khóa…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Tìm kiếm xe"
          />
        </form>

        {/* Actions: wishlist + auth */}
        <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-2">
          <Link href="/favorites" aria-label="Yêu thích" className="inline-flex">
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-1">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Button>
          </Link>

          <Link href="/register" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-1">
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </Button>
          </Link>

          {/* Mobile: chỉ hiện 2 icon auth */}
          <Link href="/login" className="sm:hidden inline-flex">
            <Button variant="outline" size="icon" aria-label="Đăng nhập">
              <LogIn className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register" className="sm:hidden inline-flex">
            <Button size="icon" aria-label="Đăng ký">
              <UserPlus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
