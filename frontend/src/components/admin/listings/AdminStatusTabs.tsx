// src/components/admin/listings/AdminStatusTabs.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Tab = { label: string; value: "all" | "approved" | "pending" | "rejected" | "draft" };

const TABS: Tab[] = [
  { label: "PHÊ DUYỆT",  value: "pending"  },
  { label: "ĐANG BÁN",   value: "approved" },
  { label: "KHÔNG DUYỆT",value: "rejected" },
  { label: "NHÁP",       value: "draft"    },
];

export default function AdminStatusTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = (searchParams.get("status") || "all").toLowerCase();

  const hrefFor = (value: Tab["value"]) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (value === "all") qs.delete("status");
    else qs.set("status", value);
    qs.delete("page"); // đổi tab -> về page 1
    const q = qs.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  return (
    <div className="mb-6 flex items-center gap-14">
      {TABS.map((t) => {
        const active = current === t.value; // 👈 chỉ underline khi trùng đúng value
        return (
          <Link
            key={t.value}
            href={hrefFor(t.value)}
            className={`relative pb-2 text-[16px] md:text-[18px] font-extrabold uppercase tracking-wide ${
              active ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {active && (
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 block h-[3px] w-20 bg-[#3B6A84] rounded" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
