// src/components/layout/Navbar.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarFront } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="hover:text-blue-600 font-medium">
            Ô tô cũ
          </Link>
          <Link href="/news" className="hover:text-blue-600 font-medium">
            Tin tức
          </Link>
        </div>

        <Link href="/dashboard/new">
          <Button className="gap-2">
            <CarFront className="h-4 w-4" />
            Đăng tin
          </Button>
        </Link>
      </div>
    </nav>
  );
}
