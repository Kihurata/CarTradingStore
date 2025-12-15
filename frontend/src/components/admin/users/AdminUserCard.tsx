"use client";

import React, { useTransition } from "react";
import { User, UserStatus } from "@/src/types/user";
import { useRouter } from "next/navigation";

type AdminUserCardProps = {
  user: User;
  onClick?: () => void;
  onViewListings?: (user: User) => void;
};

export default function AdminUserCard({ user, onClick, onViewListings }: AdminUserCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { name, phone, address, status, total_listings } = user;

  // Map label hiển thị theo UserStatus
  const statusLabel: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: "Đang hoạt động",
    [UserStatus.LOCKED]: "Đã khóa",
    [UserStatus.INACTIVE]: "Ngưng hoạt động",
  };

  const statusClass: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [UserStatus.LOCKED]: "bg-red-50 text-red-700 border-red-200",
    [UserStatus.INACTIVE]: "bg-gray-50 text-gray-600 border-gray-200",
  };

  // 👉 Toggle status ngay trong Client Component
  const toggleStatus = async () => {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    const nextStatus =
      status === UserStatus.LOCKED ? UserStatus.ACTIVE : UserStatus.LOCKED;

    await fetch(`${base}/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    // 🔄 refresh lại UI sau khi cập nhật
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* LEFT: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
          {name?.trim()
            ? name.trim().split(" ").slice(-1)[0].charAt(0).toUpperCase()
            : "U"}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">
            {name || "Chưa có tên"}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
            <span>{phone || "Chưa có số điện thoại"}</span>
            <span className="hidden sm:inline-block text-gray-300">•</span>
            <span className="truncate max-w-[220px]">
              {address || "Chưa cập nhật địa chỉ"}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Stats + Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-gray-500">Tổng số bài đăng</p>
          <p className="text-base font-semibold text-gray-900">{total_listings}</p>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass[status]}`}
        >
          {statusLabel[status]}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onViewListings?.(user);
            }}
          >
            Xem bài đăng
          </button>

          {/* NÚT KHÓA / MỞ KHÓA */}
          <button
            type="button"
            disabled={isPending}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-90 
              ${
                status === UserStatus.LOCKED
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                  : "border-red-600 text-red-700 bg-red-50"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleStatus();
            }}
          >
            {status === UserStatus.LOCKED ? "Mở khóa" : "Khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
