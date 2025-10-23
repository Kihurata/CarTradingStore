"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ReportModal from "@/src/components/listings/ReportModal"; 
import Gallery from "@/src/components/listings/Gallery"; 
import { useParams } from "next/navigation"; 

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
  body_type: string;
  condition: string;
  origin: string;
  location_text: string;
  description?: string;
  seller_name?: string;
  seller_phone?: string;
  thumbnail_url?: string;
  images?: { id: string; public_url: string; position: number }[];
  created_at?: string;
}

export default function ListingDetailPage() {
  const [car, setCar] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [openReport, setOpenReport] = useState(false); 

  // ✅ Lấy id từ useParams() (client-safe)
  const params = useParams<{ id: string }>();
  const id = params?.id as string | undefined;

  useEffect(() => {
    if (!id) return; // chưa có id thì không fetch

    const fetchData = async () => {
      try {
        const res = await api<{ data: ListingDetail }>(`/listings/${id}`);
        setCar(res.data);
      } catch (err) {
        console.error("Failed to fetch listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  if (!car) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy xe này.</div>;
  }
  // Chuẩn hóa danh sách ảnh cho gallery
  const galleryImages = (() => {
    if (!car) return [];

    // Sắp xếp ảnh theo position, lọc bỏ ảnh lỗi
    const imgs = (car.images ?? [])
      .filter(it => !!it?.public_url)
      .sort((a, b) => a.position - b.position)
      .map(it => it.public_url);

    // Đảm bảo có thumbnail_url ở đầu danh sách (nếu chưa có)
    if (car.thumbnail_url && !imgs.includes(car.thumbnail_url)) {
      imgs.unshift(car.thumbnail_url);
    }

    return imgs;
  })();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Ảnh chính */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold mt-4 text-black">{car.title}</h1>
          <p className="text-red-600 text-xl font-bold mt-1">
            {car.price_vnd.toLocaleString("vi-VN")} ₫
          </p>
          {/* Bộ sưu tập ảnh */}
          <Gallery images={galleryImages} />
          {/* Tình trạng xe */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-3 text-black">Tình trạng xe</h2>

            {/* Chuẩn hoá dữ liệu để render */}
            {(() => {
              const leftSpecs = [
                { label: "Năm SX",     value: car.year?.toString() || "—" },
                { label: "Nhiên liệu", value: car.fuel || "—" },
                { label: "Kiểu dáng",  value: car.body_type || "—" }, // nếu có body_type
                { label: "Tình trạng", value: car.condition || "Xe cũ" },
              ];

              const rightSpecs = [
                { label: "Km đã đi",   value: car.mileage_km ? `${car.mileage_km.toLocaleString("vi-VN")} km` : "—" },
                { label: "Hộp số",     value: car.gearbox || "—" },
                { label: "Xuất xứ",    value: car.origin || "—" },
                { label: "Tỉnh thành", value: car.location_text || "—" },
              ];

              const SpecList = ({ items }: { items: {label: string; value: string}[] }) => (
                <ul className="divide-y rounded-lg border bg-white">
                  {items.map(({ label, value }) => (
                    <li key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-gray-600 font-medium">{label}:</span>
                      <span className="text-gray-900">{value}</span>
                    </li>
                  ))}
                </ul>
              );

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SpecList items={leftSpecs} />
                  <SpecList items={rightSpecs} />
                </div>
              );
            })()}
          </section>


          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-black">Mô tả</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {car.description || "Không có mô tả chi tiết."}
            </p>
          </div>

          {/* Thanh công cụ dưới mô tả */}
          <div className="flex flex-wrap items-center justify-between border-t border-gray-200 mt-6 pt-4 text-sm text-gray-600">
            {/* Nút báo cáo */}
            <button
              className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 transition"
              onClick={() => setOpenReport(true)} 
            >
              <span className="text-black font-semibold">⚠ Báo cáo tin vi phạm</span>
            </button>

            {/* Ngày đăng + lưu tin */}
            <div className="flex items-center gap-3 text-gray-500">
              <span>{new Date(car.created_at || Date.now()).toLocaleDateString("vi-VN")}</span>
              <span className="text-gray-300">|</span>
              <button
                className="flex items-center gap-1 text-gray-700 hover:text-black font-semibold"
                onClick={() => alert("Đã lưu tin!")}
              >
                <span>♡</span>
                <span>Lưu tin</span>
              </button>
            </div>
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
      <ReportModal open={openReport} onClose={() => setOpenReport(false)} listingId={car.id} />
    </main>
  );
}
