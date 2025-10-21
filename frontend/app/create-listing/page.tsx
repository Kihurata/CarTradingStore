"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // ← dùng instance axios/fetch của bạn
type Option = { id: number; name: string };

export default function CreateListingPage() {
  // Provinces & Districts
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  // Brands & Models
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  // --- state ảnh ---
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Thêm state này gần các state khác của bạn
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- config nhỏ ---
  const MAX_FILES = 25;
  const MAX_SIZE_MB = 2;

  // --- xử lý chọn ảnh ---
  const onSelectImages = (files: FileList | null) => {
    if (!files) return;

    const next: File[] = [...images];
    const nextURLs: string[] = [...imagePreviews];

    for (const f of Array.from(files)) {
      const isImg = f.type.startsWith("image/");
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024;
      if (!isImg || !okSize) continue; // bỏ file không hợp lệ

      if (next.length >= MAX_FILES) break;
      next.push(f);
      nextURLs.push(URL.createObjectURL(f));
    }

    setImages(next);
    setImagePreviews(nextURLs);
  };

  // --- xoá 1 ảnh ---
  const removeImageAt = (idx: number) => {
    const next = images.slice();
    const nextURLs = imagePreviews.slice();
    URL.revokeObjectURL(nextURLs[idx]);
    next.splice(idx, 1);
    nextURLs.splice(idx, 1);
    setImages(next);
    setImagePreviews(nextURLs);
  };
  // Color ext và color int
  type ColorOption = { value: string; label: string; hex: string };

  const exteriorColors: ColorOption[] = [
    { value: "white",  label: "Trắng",   hex: "#FFFFFF" },
    { value: "black",  label: "Đen",     hex: "#000000" },
    { value: "silver", label: "Bạc",     hex: "#C0C0C0" },
    { value: "grey",   label: "Xám",     hex: "#808080" },
    { value: "red",    label: "Đỏ",      hex: "#C1121F" },
    { value: "blue",   label: "Xanh dương", hex: "#1D4ED8" },
    { value: "green",  label: "Xanh lá", hex: "#15803D" },
    { value: "brown",  label: "Nâu",     hex: "#8B4513" },
    { value: "beige",  label: "Be",      hex: "#F5F5DC" },
    { value: "gold",   label: "Vàng cát",hex: "#D4AF37" },
    { value: "other",  label: "Khác…",   hex: "" },
  ];

  const interiorColors: ColorOption[] = [
    { value: "black",  label: "Đen",    hex: "#000000" },
    { value: "beige",  label: "Be",     hex: "#F5F5DC" },
    { value: "brown",  label: "Nâu",    hex: "#8B4513" },
    { value: "grey",   label: "Xám",    hex: "#808080" },
    { value: "white",  label: "Trắng",  hex: "#FFFFFF" },
    { value: "other",  label: "Khác…",  hex: "" },
  ];

  // (tuỳ chọn) dọn URL khi unmount
  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);



  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ data: Option[] }>("/locations/provinces");
        setProvinces(res.data);
      } catch (e) {
        console.error("Không tải được danh sách tỉnh/thành", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!provinceId) { setDistricts([]); setDistrictId(""); return; }
    (async () => {
      try {
        const res = await api<{ data: Option[] }>(`/locations/districts?province_id=${provinceId}`);
        setDistricts(res.data);
        setDistrictId("");
      } catch (e) {
        console.error("Không tải được quận/huyện", e);
      }
    })();
  }, [provinceId]);

  const [formData, setFormData] = useState({
    brand_id: "", 
    model_id: "",
    year: "",           // was: year
    price_vnd: "",      // was: price_vnd (nhập triệu → nhân 1_000_000 khi submit)
    mileage_km: "",     // giữ nguyên (đã khớp DB)
    gearbox: "so-tu-dong", // was: gearbox (TEXT)
    fuel: "xang",       // was: fuel (TEXT)
    body_type: "",      // was: body_type (TEXT)
    seats: "",          // was: seats
    origin: "trong-nuoc",  // was: origin
    title: "",          // was: title
    description: "",    // was: description
    color_ext: "",    
    color_int: "",
    // Địa chỉ chuẩn hoá
    address_line: "",   // was: address_line
    // Quận/huyện, Tỉnh/thành
    province_id: "", 
    district_id: "",
    // Video (thêm mới)
    videoUrl: "",      // nếu DB là camelCase thì vẫn OK vì ta submit cả videoUrl bên dưới
  });
  

  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitted(true); // <-- ĐÁNH DẤU LÀ ĐÃ BẤM SUBMIT

  // ✅ Kiểm tra TẤT CẢ các trường bắt buộc
  if (
    !brandId ||
    !modelId ||
    !formData.year ||
    !formData.price_vnd ||
    !formData.title.trim() ||
    !formData.description.trim() ||
    !provinceId ||
    !districtId ||
    images.length === 0
  ) {
    return;
  }

  const form = new FormData();
  form.append("brand_id", brandId ? String(brandId) : "");
  form.append("model_id", modelId ? String(modelId) : "");
  form.append("year", formData.year || "");
  form.append("price_vnd", formData.price_vnd ? String(Number(formData.price_vnd) * 1_000_000) : "0");
  form.append("gearbox", formData.gearbox || "");
  form.append("fuel", formData.fuel || "");
  form.append("body_type", formData.body_type || "");
  form.append("seats", formData.seats || "");
  form.append("origin", formData.origin || "");
  form.append("description", formData.description || "");
  form.append("title", formData.title || ""); // Đảm bảo không null
  form.append("address_line", formData.address_line || "");
  form.append("province_id", provinceId ? String(provinceId) : "");
  form.append("district_id", districtId ? String(districtId) : "");
  images.forEach((file) => form.append("images", file));

  // Lấy token từ localStorage để gửi qua cookie header (giữ nguyên phần này)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const cookieHeader = token ? `jwt=${token}` : "";

  try {
    console.log("FormData title:", formData.title); // Log để debug
    console.log("Token from localStorage for submit:", token ? token.substring(0, 20) + "..." : "none");
    const res = await fetch("/api/listings", {
      method: "POST",
      body: form,
      credentials: "include",
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    alert("Đăng tin thành công!");
  } catch (err: any) {
    console.error("❌ Lỗi khi đăng tin:", err);
    alert("Đăng tin thất bại!");
  }
};

  /* helper: kiểm tra URL hợp lệ */
  const isValidUrl = (v: string) => {
    if (!v) return false;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };
  /* 👇 helper: thêm https:// nếu thiếu khi blur */
  const normalizeVideoUrlOnBlur = () => {
    const v = formData.videoUrl?.trim();
    if (!v) return;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(v)) {
      setFormData({ ...formData, videoUrl: `https://${v}` });
    }
  };
   /* helper: lấy link nhúng YouTube nếu có */
  const getYouTubeEmbed = (v: string) => {
    try {
      const u = new URL(v);
      const isYouTube = u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (!isYouTube) return null;
      let id = "";
      if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
      else id = u.searchParams.get("v") || "";
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    } catch {
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">


      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN XE</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hãng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    >
                      <option value="">Chọn hãng xe</option>
                      <option value="toyota">Toyota</option>
                      <option value="honda">Honda</option>
                      <option value="mazda">Mazda</option>
                      <option value="ford">Ford</option>
                    </select>
                    {isSubmitted && !formData.brand_id && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập hãng xe</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dòng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.model_id}
                      onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    >
                      <option value="">Chọn dòng xe</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Coupe">Coupe</option>
                    </select>
                    {isSubmitted && !formData.model_id && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập dòng xe</p>
                    )}
                    
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm sản xuất<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"           
                      inputMode="numeric"  
                      maxLength={4}        
                      placeholder="Nhập năm sản xuất"
                      value={formData.year}
                      onChange={(e) => {
                        // --- Thêm: Chỉ cho phép nhập số ---
                        const value = e.target.value;
                        // Loại bỏ bất kỳ ký tự nào không phải là số (0-9)
                        const numericValue = value.replace(/[^0-9]/g, ''); 
                        setFormData({ ...formData, year: numericValue });
                        // ------------------------------------
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.year && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập năm sản xuất</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Km đã đi<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"           
                      inputMode="numeric"  
                      maxLength={6}        
                      placeholder="Nhập số km đã đi"
                      value={formData.mileage_km}
                      onChange={(e) => {
                        // --- Thêm: Chỉ cho phép nhập số ---
                        const value = e.target.value;
                        // Loại bỏ bất kỳ ký tự nào không phải là số (0-9)
                        const numericValue = value.replace(/[^0-9]/g, ''); 
                        setFormData({ ...formData, mileage_km: numericValue });
                        // ------------------------------------
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.mileage_km && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập số km đã đi</p>
                    )}
                  </div>
                  {/* Hàng: Xuất xứ + Màu ngoại thất + Màu nội thất */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {/* Xuất xứ */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Xuất xứ<span className="text-red-500">*</span></label>
                        <div className="flex gap-6 items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="origin"
                              value="trong-nuoc"
                              checked={formData.origin === "trong-nuoc"}
                              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Trong nước</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="origin"
                              value="nhap-khau"
                              checked={formData.origin === "nhap-khau"}
                              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Nhập khẩu</span>
                          </label>
                        </div>
                        {isSubmitted && !formData.origin && (
                          <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn xuất xứ</p>
                        )}
                      </div>

                      {/* Màu ngoại thất */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Màu ngoại thất</label>
                        <div className="flex items-center gap-2">
                          <select
                            className="w-full px-3 py-2 border rounded"
                            value={formData.color_ext || ""}
                            onChange={(e) => setFormData({ ...formData, color_ext: e.target.value })}
                          >
                            <option value="">Chọn màu</option>
                            {exteriorColors.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                            <option value="other">Tự chọn…</option>
                          </select>
                          {/* preview */}
                          {(() => {
                            const c = exteriorColors.find(x => x.value === formData.color_ext && x.hex);
                            return c?.hex ? <span className="inline-block w-6 h-6 rounded border" style={{ background: c.hex as string }} /> : null;
                          })()}
                        </div>

                        {formData.color_ext === "other" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="color"
                              onChange={(e) => setFormData({ ...formData, color_ext: e.target.value })}
                              className="w-10 h-10 p-0 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="#RRGGBB"
                              onChange={(e) => setFormData({ ...formData, color_ext: e.target.value.trim() })}
                              className="px-3 py-2 border rounded w-36"
                            />
                          </div>
                        )}
                      </div>

                      {/* Màu nội thất */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Màu nội thất</label>
                        <div className="flex items-center gap-2">
                          <select
                            className="w-full px-3 py-2 border rounded"
                            value={formData.color_int || ""}
                            onChange={(e) => setFormData({ ...formData, color_int: e.target.value })}
                          >
                            <option value="">Chọn màu</option>
                            {interiorColors.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                            <option value="other">Tự chọn…</option>
                          </select>
                          {/* preview */}
                          {(() => {
                            const c = interiorColors.find(x => x.value === formData.color_int && x.hex);
                            return c?.hex ? <span className="inline-block w-6 h-6 rounded border" style={{ background: c.hex as string }} /> : null;
                          })()}
                        </div>

                        {formData.color_int === "other" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="color"
                              onChange={(e) => setFormData({ ...formData, color_int: e.target.value })}
                              className="w-10 h-10 p-0 border rounded"
                            />
                            <input
                              type="text"
                              placeholder="#RRGGBB"
                              onChange={(e) => setFormData({ ...formData, color_int: e.target.value.trim() })}
                              className="px-3 py-2 border rounded w-36"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hộp số
                    </label>
                    <select
                      value={formData.gearbox}
                      onChange={(e) => setFormData({ ...formData, gearbox: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="so-tu-dong">Số tự động</option>
                      <option value="so-san">Số sàn</option>
                      <option value="so-san">Số hỗn hợp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhiên liệu
                    </label>
                    <select
                      value={formData.fuel}
                      onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="xang">Xăng</option>
                      <option value="dau">Dầu</option>
                      <option value="dien">Điện</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kiểu dáng
                    </label>
                    <select
                      value={formData.body_type}
                      onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="">Chọn kiểu dáng xe</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Pick-up Truck/ Xe bán tải">Pick-up Truck/ Xe bán tải</option>
                      <option value="CUV">CUV</option>
                      <option value="MPV">MPV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Truck/ Xe tải">Truck/ Xe tải</option>
                      <option value="Sport Car">Sport Car</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Van/Minivan">Van/Minivan</option>
                      <option value="Minibus">Minibus</option>
                      <option value="Kiểu dáng khác">Kiểu dáng khác</option>
                                                            
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số chỗ
                    </label>
                    <select
                      value={formData.seats}
                      onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="">Chọn số chỗ</option>
                      <option value="2">2 chỗ</option>
                      <option value="4">4 chỗ</option>
                      <option value="5">5 chỗ</option>
                      <option value="7">7 chỗ</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">GIÁ BÁN & MÔ TẢ XE</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá bán<span className="text-red-500">*</span>
                    </label>
                    {/* Sử dụng một div bọc ngoài để chứa label và input */}

                  <div className="relative flex items-center border border-red-500 rounded">
                    <input
                      type="tel"         
                      inputMode="numeric"  
                      placeholder="Nhập giá bán xe"
                      value={formData.price_vnd}
                      onChange={(e) => {
                        // --- Thay đổi: Chỉ cho phép nhập số ---
                        const value = e.target.value;
                        // Loại bỏ bất kỳ ký tự nào không phải là số (0-9)
                        const numericValue = value.replace(/[^0-9]/g, ''); 
                        setFormData({ ...formData, price_vnd: numericValue });
                        // ----------------------------------------
                      }}
                      className="
                        flex-1          
                        px-3 py-2       
                        border-none     
                        focus:outline-none 
                        focus:ring-0    
                        pr-28           
                        rounded         
                      "
                      required
                    />
                    <span className="absolute right-3 text-gray-700 text-sm pointer-events-none">
                      TRIỆU VNĐ
                    </span>
                  </div>
                  {isSubmitted && !formData.price_vnd && (
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Giá bán</p>
                  )}
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ngắn gọn, dễ đọc, tô khéo quan trọng gây chú ý"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.title && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Tiêu đề</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="- Mô tả chi tiết về xe&#10;- Tình trạng sơ thẩm của xe&#10;- Tình trạng pháp lý của xe&#10;- Thông tin về bảo hiểm xe&#10;- Tình trạng giấy tờ..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 resize-none"
                      required
                    />
                    <div className="flex justify-between mt-1">
                      {isSubmitted && !formData.description && (
                        <p className="text-xs text-red-500">⚠ Vui lòng nhập mô tả</p>
                      )}
                      <p className="text-xs text-gray-500">0/3000</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN NGƯỜI BÁN</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người bán<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" readOnly
                      placeholder="Nhập tên người bán"
                      // value={formData.tenNguoiBan}
                      // onChange={(e) => setFormData({ ...formData, tenNguoiBan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel" readOnly
                      // value={formData.soDienThoai}
                      // onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      placeholder="0931353214"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ người bán<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ người bán"
                      value={formData.address_line}
                      onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.address_line.trim() && (
                        <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập địa chỉ người bán</p>
                    )}
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi bán xe<span className="text-red-500">*</span>
                      </label>
                      <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                            value={provinceId}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : "";
                              setProvinceId(value);
                              setFormData({
                                ...formData,
                                province_id: value ? provinces.find(p => p.id === value)?.name || "" : "",
                              });
                            }}
                            required
                          >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {isSubmitted && !provinceId && (
                        <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn tỉnh/thành</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện<span className="text-red-500">*</span>
                      </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                            value={districtId}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : "";
                              setDistrictId(value);
                              setFormData({
                                ...formData,
                                district_id: value ? districts.find(d => d.id === value)?.name || "" : "",
                              });
                            }}
                            disabled={!provinceId}
                            required
                          >

                        <option value="">{provinceId ? "Chọn quận/huyện" : "Chọn Tỉnh/Thành trước"}</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      {isSubmitted && !districtId && (
                        <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn quận/huyện</p>
                      )}
                     
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex gap-4 relative z-10">
                <button
                  type="button"
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Xem trước tin đăng
                </button>
                <button
                  type="submit"
                  onClick={() => setIsSubmitted(true)}
                  className="flex-1 py-3 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded font-medium transition-colors"
                >
                  Đăng tin
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg shadow p-6 sticky top-24 z-0">
                <h3 className="text-[16px] font-semibold text-blue-600 mb-4">ĐĂNG ẢNH & VIDEO XE</h3>

                {/* Upload ảnh */}
                <div className="mb-4">
                  <label
                    htmlFor="images"
                    className="block border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50"
                  >
                    <div className="text-blue-500 text-4xl mb-2">+</div>
                    <p className="text-sm text-gray-600">
                      Thêm ảnh (ít nhất 1, tối đa {MAX_FILES}, mỗi ảnh ≤ {MAX_SIZE_MB}MB)
                    </p>
                  </label>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onSelectImages(e.target.files)}
                  />
                </div>

                {/* Lỗi nếu chưa có ảnh */}
                {isSubmitted && images.length === 0 && (
                       <p className="text-xs text-red-600 mb-3">⚠ Vui lòng thêm ít nhất 1 ảnh</p>
                )}
                {/* Preview ảnh đã chọn */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative group">
                        <img src={src} alt={`Ảnh ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute top-1 right-1 rounded bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100"
                          aria-label="Xoá ảnh"
                        >
                          Xoá
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded p-3 text-xs text-gray-600 space-y-2">
                  <p>* Đăng ít nhất 03 hình và tối đa 25 hình nội đô ngoại thất xe</p>
                  <p>* Dung lượng mỗi hình tối đa 2048KB</p>
                  <p>* Hình ảnh phù hợp được hệ thống cho tăng tối ưu để bán xe nhanh hơn, tiếp cận khách hàng dễ dàng hơn</p>
                  <p>* Vui lòng không trùng lặp tử có website</p>
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Video giới thiệu sản phẩm</h4>
                {/* --- Nhập link video + xem trước --- */}
                <div className="mt-3 space-y-2">
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                    URL video (YouTube)
                  </label>
                  <input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:border-gray-400
                                text-black placeholder:text-gray-400
                                ${!formData.videoUrl || isValidUrl(formData.videoUrl) ? "border-gray-300" : "border-red-500"}`}
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value.trim() })}
                    onBlur={normalizeVideoUrlOnBlur}
                    aria-invalid={!!formData.videoUrl && !isValidUrl(formData.videoUrl)}
                  />

                  <p className={`text-xs ${!formData.videoUrl || isValidUrl(formData.videoUrl) ? "text-gray-500" : "text-red-600"}`}>
                    {!formData.videoUrl || isValidUrl(formData.videoUrl)
                      ? "Ví dụ: https://youtube.com/watch?v=..."
                      : "URL không hợp lệ"}
                  </p>

                  {/* Preview YouTube nếu hợp lệ */}
                  {(() => {
                    const embed = formData.videoUrl ? getYouTubeEmbed(formData.videoUrl) : null;
                    if (!embed) return null;
                    return (
                      <div className="aspect-video w-full overflow-hidden rounded border">
                        <iframe
                          src={embed}
                          title="Video giới thiệu"
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  })()}
                </div>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>Chèn link video giới thiệu sản phẩm từ Youtube nhằm tăng hiệu quả tin rao</p>
                  <p>Chịu trách nhiệm bản quyền nội dung</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}