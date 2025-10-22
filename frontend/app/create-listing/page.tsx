"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: number; name: string };

export default function CreateListingPage() {
  const router = useRouter();
  
  // States
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // THÊM STATES MỚI
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);

  const MAX_FILES = 25;
  const MAX_SIZE_MB = 2;

  // Color options
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

  const getHexForColor = (value: string, colors: ColorOption[]): string => {
    const color = colors.find(c => c.value === value);
    if (color && color.hex) return color.hex;
    return value.startsWith('#') && value.length === 7 ? value : '';
  };

  // Form data state
  const [formData, setFormData] = useState({
    year: "",
    price_vnd: "",
    mileage_km: "",
    gearbox: "so-tu-dong",
    fuel: "xang",
    body_type: "",
    seats: "",
    origin: "trong-nuoc",
    title: "",
    description: "",
    color_ext: "",
    color_int: "",
    seller_name: "",
    seller_phone: "",
    address_line: "",
    video_url: "",
  });

  // Image handlers
  const onSelectImages = (files: FileList | null) => {
    if (!files) return;

    const next: File[] = [...images];
    const nextURLs: string[] = [...imagePreviews];

    for (const f of Array.from(files)) {
      const isImg = f.type.startsWith("image/");
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024;
      if (!isImg || !okSize) continue;

      if (next.length >= MAX_FILES) break;
      next.push(f);
      nextURLs.push(URL.createObjectURL(f));
    }

    setImages(next);
    setImagePreviews(nextURLs);
  };

  const removeImageAt = (idx: number) => {
    const next = images.slice();
    const nextURLs = imagePreviews.slice();
    URL.revokeObjectURL(nextURLs[idx]);
    next.splice(idx, 1);
    nextURLs.splice(idx, 1);
    setImages(next);
    setImagePreviews(nextURLs);
  };

  // Load provinces, brands và user data
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await fetch("/api/listings/locations/provinces");
        if (res.ok) {
          const data = await res.json();
          setProvinces(data.data || []);
        }
      } catch (e) {
        console.error("Không tải được danh sách tỉnh/thành", e);
      }
    };

    const loadBrands = async () => {
      try {
        const res = await fetch("/api/listings/brands");
        if (res.ok) {
          const data = await res.json();
          setBrands(data.data || []);
        } else {
          console.error("Failed to load brands:", res.status);
        }
      } catch (e) {
        console.error("Không tải được danh sách hãng xe", e);
      }
    };

    const loadUserData = () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setFormData(prev => ({
              ...prev,
              seller_name: user.name || user.email || "",
              seller_phone: user.phone || "",
              address_line: user.address || "", // AUTO-FILL ĐỊA CHỈ TỪ USER
            }));
          } catch (err) {
            console.error("Error parsing stored user:", err);
          }
        }
      }
    };

    loadProvinces();
    loadBrands();
    loadUserData();
  }, []);

  // Load districts khi province thay đổi
  useEffect(() => {
    if (!provinceId) { 
      setDistricts([]); 
      setDistrictId(""); 
      return; 
    }
    
    const loadDistricts = async () => {
      try {
        const res = await fetch(`/api/listings/locations/districts?province_id=${provinceId}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.data || []);
        }
      } catch (e) {
        console.error("Không tải được quận/huyện", e);
      }
    };

    loadDistricts();
  }, [provinceId]);

  // Load models khi brand thay đổi
  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setModelId("");
      return;
    }

    const loadModels = async () => {
      try {
        const res = await fetch(`/api/listings/models?brand_id=${brandId}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.data || []);
        } else {
          console.error("Failed to load models:", res.status);
          setModels([]);
        }
      } catch (e) {
        console.error("Không tải được danh sách dòng xe", e);
        setModels([]);
      }
    };

    loadModels();
  }, [brandId]);

  // Cleanup image URLs
  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setIsLoading(true);

    // Validation
    const requiredFields = [
      { field: brandId, name: "Hãng xe" },
      { field: modelId, name: "Dòng xe" },
      { field: formData.year, name: "Năm sản xuất" },
      { field: formData.price_vnd, name: "Giá bán" },
      { field: formData.mileage_km, name: "Số km đã đi" },
      { field: formData.title.trim(), name: "Tiêu đề" },
      { field: formData.description.trim(), name: "Mô tả" },
      { field: formData.body_type, name: "Kiểu dáng" },
      { field: provinceId, name: "Tỉnh/Thành" },
      { field: districtId, name: "Quận/Huyện" },
      { field: formData.address_line.trim(), name: "Địa chỉ người bán" },
      { field: images.length > 0, name: "Ảnh xe" }
    ];

    const missingFields = requiredFields.filter(item => !item.field);
    if (missingFields.length > 0) {
      alert(`Vui lòng điền đầy đủ các trường bắt buộc:\n${missingFields.map(f => f.name).join('\n')}`);
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append các field theo đúng định dạng backend mong đợi
      formDataToSend.append("title", formData.title);
      formDataToSend.append("price_vnd", String(Number(formData.price_vnd) * 1_000_000));
      formDataToSend.append("brand_id", String(brandId));
      formDataToSend.append("model_id", String(modelId));
      formDataToSend.append("year", formData.year);
      formDataToSend.append("mileage_km", formData.mileage_km);
      formDataToSend.append("body_type", formData.body_type);
      formDataToSend.append("gearbox", formData.gearbox);
      formDataToSend.append("fuel", formData.fuel);
      formDataToSend.append("seats", formData.seats || "");
      formDataToSend.append("origin", formData.origin);
      formDataToSend.append("color_ext", getHexForColor(formData.color_ext, exteriorColors));
      formDataToSend.append("color_int", getHexForColor(formData.color_int, interiorColors));
      formDataToSend.append("description", formData.description);
      formDataToSend.append("province_id", String(provinceId));
      formDataToSend.append("district_id", String(districtId));
      formDataToSend.append("address_line", formData.address_line);
      
      if (formData.video_url) {
        formDataToSend.append("video_url", formData.video_url);
      }

      // Append images
      images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      console.log("🔄 Đang gửi dữ liệu...");

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Đăng tin thành công:", result);

      alert("Đăng tin thành công! Tin của bạn đang chờ duyệt.");
      router.push("/listings");
      
    } catch (error: any) {
      console.error("❌ Lỗi khi đăng tin:", error);
      alert(`Đăng tin thất bại: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (v: string) => {
    if (!v) return false;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };

  const normalizeVideoUrlOnBlur = () => {
    const v = formData.video_url?.trim();
    if (!v) return;
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(v)) {
      setFormData({ ...formData, video_url: `https://${v}` });
    }
  };

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
              {/* THÔNG TIN XE SECTION */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN XE</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* HÃNG XE - ĐÃ SỬA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hãng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={brandId}
                      onChange={(e) => {
                        const newBrandId = e.target.value ? Number(e.target.value) : "";
                        setBrandId(newBrandId);
                        setModelId("");
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    >
                      <option value="">Chọn hãng xe</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                    {isSubmitted && !brandId && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn hãng xe</p>
                    )}
                  </div>

                  {/* DÒNG XE - ĐÃ SỬA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dòng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                      disabled={!brandId}
                    >
                      <option value="">{brandId ? "Chọn dòng xe" : "Chọn hãng xe trước"}</option>
                      {models.map(model => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    {isSubmitted && !modelId && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn dòng xe</p>
                    )}
                  </div>

                  {/* NĂM SẢN XUẤT */}
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
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, year: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.year && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập năm sản xuất</p>
                    )}
                  </div>

                  {/* KM ĐÃ ĐI */}
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
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, mileage_km: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    {isSubmitted && !formData.mileage_km && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập số km đã đi</p>
                    )}
                  </div>

                  {/* XUẤT XỨ + MÀU NGOẠI THẤT + MÀU NỘI THẤT */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {/* XUẤT XỨ */}
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

                      {/* MÀU NGOẠI THẤT */}
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

                      {/* MÀU NỘI THẤT */}
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

                  {/* HỘP SỐ */}
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
                      <option value="so-ban-tu-dong">Số bán tự động</option>
                    </select>
                  </div>

                  {/* NHIÊN LIỆU */}
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
                      <option value="xang-dien">Xăng điện</option>
                    </select>
                  </div>

                  {/* KIỂU DÁNG */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kiểu dáng<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.body_type}
                      onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
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
                    {isSubmitted && !formData.body_type && (
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn kiểu dáng</p>
                    )}
                  </div>

                  {/* SỐ CHỖ */}
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
                      <option value="8">8 chỗ</option>
                      <option value="9">9 chỗ</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* GIÁ BÁN & MÔ TẢ XE SECTION */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">GIÁ BÁN & MÔ TẢ XE</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="space-y-4">
                  {/* GIÁ BÁN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá bán<span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center border border-gray-300 rounded focus-within:border-gray-400">
                      <input
                        type="tel"         
                        inputMode="numeric"  
                        placeholder="Nhập giá bán xe"
                        value={formData.price_vnd}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData({ ...formData, price_vnd: value });
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

                  {/* TIÊU ĐỀ */}
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

                  {/* MÔ TẢ */}
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
                      <p className="text-xs text-gray-500">{formData.description.length}/3000</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* THÔNG TIN NGƯỜI BÁN SECTION - ĐÃ SỬA ĐỊA CHỈ THÀNH READONLY */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN NGƯỜI BÁN</h2>
                  <button type="button" className="text-sm text-blue-600 hover:underline">
                    Thu gọn &gt;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* TÊN NGƯỜI BÁN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người bán<span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      readOnly
                      placeholder="Nhập tên người bán"
                      value={formData.seller_name}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-gray-100"
                      required
                    />
                  </div>

                  {/* SỐ ĐIỆN THOẠI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel" 
                      readOnly
                      value={formData.seller_phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-gray-100"
                      placeholder="0931353214"
                      required
                    />
                  </div>

                  {/* ĐỊA CHỈ NGƯỜI BÁN - READONLY VÀ LẤY TỪ USER */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ người bán<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Nhập địa chỉ người bán"
                      value={formData.address_line}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 bg-gray-100"
                      required
                    />
                    {isSubmitted && !formData.address_line.trim() && (
                        <p className="text-xs text-red-500 mt-1">⚠ Vui lòng cập nhật địa chỉ trong tài khoản</p>
                    )}
                  </div>

                  {/* TỈNH/THÀNH & QUẬN/HUYỆN */}
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

              {/* NÚT SUBMIT */}
              <div className="flex gap-4 relative z-10">
                <button
                  type="button"
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Xem trước tin đăng
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#5CB85C] hover:bg-[#4CAE4C] disabled:bg-gray-400 text-white rounded font-medium transition-colors"
                >
                  {isLoading ? "Đang đăng tin..." : "Đăng tin"}
                </button>
              </div>
            </div>

            {/* PHẦN ẢNH & VIDEO - GIỮ NGUYÊN */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg shadow p-6 sticky top-24 z-0">
                <h3 className="text-[16px] font-semibold text-blue-600 mb-4">ĐĂNG ẢNH & VIDEO XE</h3>

                {/* UPLOAD ẢNH */}
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

                {/* LỖI NẾU CHƯA CÓ ẢNH */}
                {isSubmitted && images.length === 0 && (
                  <p className="text-xs text-red-600 mb-3">⚠ Vui lòng thêm ít nhất 1 ảnh</p>
                )}

                {/* PREVIEW ẢNH ĐÃ CHỌN */}
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

                {/* HƯỚNG DẪN ẢNH */}
                <div className="bg-white rounded p-3 text-xs text-gray-600 space-y-2">
                  <p>* Đăng ít nhất 03 hình và tối đa 25 hình nội đô ngoại thất xe</p>
                  <p>* Dung lượng mỗi hình tối đa 2048KB</p>
                  <p>* Hình ảnh phù hợp được hệ thống cho tăng tối ưu để bán xe nhanh hơn, tiếp cận khách hàng dễ dàng hơn</p>
                  <p>* Vui lòng không trùng lặp tử có website</p>
                </div>

                {/* VIDEO */}
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Video giới thiệu sản phẩm</h4>
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
                                ${!formData.video_url || isValidUrl(formData.video_url) ? "border-gray-300" : "border-red-500"}`}
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value.trim() })}
                    onBlur={normalizeVideoUrlOnBlur}
                    aria-invalid={!!formData.video_url && !isValidUrl(formData.video_url)}
                  />

                  <p className={`text-xs ${!formData.video_url || isValidUrl(formData.video_url) ? "text-gray-500" : "text-red-600"}`}>
                    {!formData.video_url || isValidUrl(formData.video_url)
                      ? "Ví dụ: https://youtube.com/watch?v=..."
                      : "URL không hợp lệ"}
                  </p>

                  {/* PREVIEW YOUTUBE */}
                  {(() => {
                    const embed = formData.video_url ? getYouTubeEmbed(formData.video_url) : null;
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