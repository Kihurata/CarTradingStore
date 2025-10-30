// src/components/layout/AdminNavbar.tsx
"use client";

import { BaseNavbar } from "../layout/BaseNavbar";

export function AdminNavbar() {
  return (
    <BaseNavbar
      links={[
        { href: "/admin/listings", label: "THÔNG TIN ĐĂNG BÁN XE" },
        { href: "/admin/users", label: "NGƯỜI DÙNG" },
      ]}
    />
  );
}
