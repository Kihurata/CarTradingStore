import type { ReactNode } from "react";
import "../globals.css";

import { AdminNavbar } from "@/src/components/layout/AdminNavbar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar riêng cho admin */}
      <AdminNavbar />

      {/* Nội dung trang admin */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {children}
      </main>
    </div>
  );
}
