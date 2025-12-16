"use client";
import Link from "next/link";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Listing } from "@/src/types/listing";
import ListingRow from "./ListingRow";

type ListingCardProps = {
  data: Listing;
  showStatus?: boolean;
  mode?: "public" | "self";
};

export function ListingCard({ data, showStatus, mode = "public" }: ListingCardProps) {
  const router = useRouter();

  // ✅ Kiểm tra số điện thoại hợp lệ (VN: 10 chữ số)
  const isValidPhoneNumber = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    // Loại bỏ khoảng trắng, dấu gạch ngang, dấu cộng
    const cleaned = phone.replace(/[\s\-+()]/g, "");
    // Số điện thoại VN có 10 chữ số hoặc bắt đầu bằng +84 (12 ký tự)
    return /^\d{10}$/.test(cleaned) || /^\+84\d{9}$/.test(cleaned);
  };

  // ✅ Xử lý click nút gọi ngay
  const handleCallClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!data?.seller_phone) {
      alert("Người bán không có số điện thoại");
      return;
    }

    if (!isValidPhoneNumber(data.seller_phone)) {
      alert("Số điện thoại không hợp lệ");
      return;
    }

    // Chuẩn hóa số điện thoại (loại bỏ ký tự không cần thiết)
    const cleaned = data.seller_phone.replace(/[\s\-+()]/g, "");
    
    // Nếu là +84, chuyển sang 0
    let phoneForZalo = cleaned;
    if (cleaned.startsWith("84")) {
      phoneForZalo = "0" + cleaned.substring(2);
    } else if (cleaned.startsWith("+84")) {
      phoneForZalo = "0" + cleaned.substring(3);
    }

    // Mở Zalo
    const zaloUrl = `https://zalo.me/${phoneForZalo}`;
    window.open(zaloUrl, "_blank");
  };

  const rightArea =
    mode === "self" ? (
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border border-blue-600 text-blue-600 font-medium bg-white hover:bg-blue-50 cursor-pointer transition-colors"
        onClick={(e) => {
          e.preventDefault();
          router.push(`/listings/${data.id}/edit`);
        }}
      >
        Chỉnh sửa
      </button>
    ) : (
      <button
        type="button"
        disabled={!isValidPhoneNumber(data.seller_phone)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] border font-medium transition-colors
                  ${isValidPhoneNumber(data.seller_phone)
                    ? "border-black text-black bg-white hover:bg-gray-100 cursor-pointer"
                    : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"}`}
        onClick={handleCallClick}
        title={isValidPhoneNumber(data.seller_phone) ? "Gọi ngay" : "Số điện thoại không hợp lệ"}
      >
        <Phone className="w-4 h-4" />
        Gọi ngay
      </button>
    );

  return (
    <Link
      href={`/listings/${data.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <ListingRow
        data={data}
        titleAsLink={false}
        rightArea={rightArea}
        variant="public"
        showStatus={showStatus}
      />
    </Link>
  );
}
