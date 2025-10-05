"use client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
        <Link href="/" className="font-bold text-blue-600">oto<span className="text-gray-900">.com</span></Link>
        <div className="flex-1 max-w-xl">
          <Input placeholder="Tìm nhanh: hãng, mẫu xe, từ khóa..." />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/new"><Button size="sm">Đăng tin</Button></Link>
          <Link href="/login"><Button size="sm" variant="outline">Đăng nhập</Button></Link>
        </div>
      </div>
    </header>
  );
}
