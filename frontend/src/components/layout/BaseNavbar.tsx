// src/components/layout/BaseNavbar.tsx
"use client";

import Link from "next/link";

interface BaseNavbarProps {
  links: { href: string; label: string }[];
  rightButtons?: React.ReactNode;
}

export function BaseNavbar({ links, rightButtons }: BaseNavbarProps) {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold text-gray-800 hover:text-gray-600 tracking-wide uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">{rightButtons}</div>
      </div>
    </nav>
  );
}
