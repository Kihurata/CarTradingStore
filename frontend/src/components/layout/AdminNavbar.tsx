// src/components/layout/AdminNavbar.tsx
"use client";

import { BaseNavbar } from "./BaseNavbar";

export function AdminNavbar() {
  return (
    <BaseNavbar
      links={[
        { href: "/admin/listings", label: "QUẢN LÝ BÀI ĐĂNG" },
        { href: "/admin/users", label: "NGƯỜI DÙNG" },
        { href: "/admin/reports", label: "BÁO CÁO VI PHẠM" },
      ]}
    />
  );
}
