"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";


interface ListingDetail {
  id: string;
  title: string;
  price_vnd: number;
  brand: string;
  model: string;
  year: number;
  mileage_km: number;
  gearbox: string;
  fuel: string;
  location_text: string;
  description?: string;
  seller_name?: string;
  seller_phone?: string;
  thumbnail_url?: string;
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api<{ data: ListingDetail }>(`/listings/${params.id}`);
        setCar(res.data);
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!car) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy xe này.</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Ảnh chính */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold mt-4 text-black">{car.title}</h1>
          <p className="text-red-600 text-xl font-bold mt-1">
            {car.price_vnd.toLocaleString("vi-VN")} ₫
          </p>
          <div className="relative w-full h-80 rounded-lg overflow-hidden border">
            {car.thumbnail_url ? (
              <Image src={car.thumbnail_url} alt={car.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="mt-4 border-t pt-4 space-y-1 text-sm text-black">
            <p>
              <strong>Năm sản xuất:</strong> {car.year}
            </p>
            <p>
              <strong>Km đã đi:</strong> {car.mileage_km?.toLocaleString("vi-VN") || 0} km
            </p>
            <p>
              <strong>Hộp số:</strong> {car.gearbox}
            </p>
            <p>
              <strong>Nhiên liệu:</strong> {car.fuel}
            </p>
            <p>
              <strong>Khu vực:</strong> {car.location_text}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {car.description || "Không có mô tả chi tiết."}
            </p>
          </div>
        </div>

        {/* Thông tin người bán */}
        <aside className="border rounded-lg p-4 bg-white shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-3 text-black">Liên hệ người bán</h2>
          <p className="text-gray-800 font-medium">
            {car.seller_name || "Người bán ẩn danh"}
          </p>
          <p className="text-gray-600 text-sm">{car.location_text}</p>
          <p className="text-gray-800 mt-3 font-semibold">
            ☎ {car.seller_phone || "Không có số điện thoại"}
          </p>
          <button className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">
            Gọi ngay
          </button>
        </aside>
      </div>
    </main>
  );
}
