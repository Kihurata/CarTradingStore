// app/admin/listings/[id]/edit/page.tsx
"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Option = { id: number; name: string };
type ExistingImage = { id: string; public_url: string };

type ListingDetail = {
  id: string;
  title: string;
  price_vnd: number;
  brand_id: number;
  model_id: number;
  year: number;
  mileage_km: number;
  gearbox: string | null;
  fuel: string | null;
  body_type: string | null;
  seats: number | null;
  origin?: string;
  description: string | null;
  province_id: number | null;
  district_id: number | null;
  address_line: string | null;
  color_ext: string | null;
  color_int: string | null;
  video_url: string | null;
  images?: ExistingImage[];
};

export default function AdminEditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Select options
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);

  // Linked selects
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");

  // Images (existing + new)
  const MAX_FILES = 25;
  const MAX_SIZE_MB = 2;
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<Set<string>>(new Set());
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Color options (giống create)
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
  const getHexForColor = (value: string, colors: ColorOption[]) => {
    const c = colors.find(x => x.value === value);
    return c?.hex ? c.hex : (value.startsWith("#") && value.length === 7 ? value : "");
  };

  // Form state
  const [formData, setFormData] = useState({
    year: "",
    price_vnd: "",       // nhập theo “triệu”
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
    address_line: "",
    video_url: "",
  });

  // Helpers
  const priceTriệuText = useMemo(() => formData.price_vnd, [formData.price_vnd]);
  const isValidUrl = (v: string) => {
    if (!v) return false;
    try { new URL(v); return true; } catch { return false; }
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
      const isYT = u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be");
      if (!isYT) return null;
      let vid = "";
      if (u.hostname.includes("youtu.be")) vid = u.pathname.slice(1);
      else vid = u.searchParams.get("v") || "";
      if (!vid) return null;
      return `https://www.youtube.com/embed/${vid}`;
    } catch { return null; }
  };

  // Load selects
  useEffect(() => {
    (async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch("/api/locations/provinces"),
          fetch("/api/listings/brands"),
        ]);
        if (pRes.ok) {
          const p = await pRes.json();
          setProvinces(p.data || []);
        }
        if (bRes.ok) {
          const b = await bRes.json();
          setBrands(b.data || []);
        }
      } catch (e) {
        console.error("Load provinces/brands failed", e);
      }
    })();
  }, []);

  // Load listing detail
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/${id}`, { credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error(`Fetch detail failed: ${res.status}`);
        const json = await res.json();
        const detail: ListingDetail = json.data;

        // Prefill form
        setFormData({
          title: detail.title || "",
          price_vnd: detail.price_vnd ? String(Math.round(detail.price_vnd / 1_000_000)) : "",
          year: detail.year ? String(detail.year) : "",
          mileage_km: detail.mileage_km ? String(detail.mileage_km) : "",
          gearbox: detail.gearbox || "so-tu-dong",
          fuel: detail.fuel || "xang",
          body_type: detail.body_type || "",
          seats: detail.seats ? String(detail.seats) : "",
          origin: detail.origin || "trong-nuoc",
          description: detail.description || "",
          color_ext: detail.color_ext || "",
          color_int: detail.color_int || "",
          address_line: detail.address_line || "",
          video_url: detail.video_url || "",
        });

        // Set linked selects
        setProvinceId(detail.province_id || "");
        setDistrictId(detail.district_id || "");
        setBrandId(detail.brand_id || "");
        setModelId(detail.model_id || "");

        // Existing images
        setExistingImages(detail.images || []);
      } catch (e) {
        console.error(e);
        alert("Không tải được chi tiết tin.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load districts when provinceId changes
  useEffect(() => {
    if (!provinceId) { setDistricts([]); setDistrictId(""); return; }
    (async () => {
      try {
        const res = await fetch(`/api/locations/districts?province_id=${provinceId}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data.data || []);
        }
      } catch (e) { console.error(e); }
    })();
  }, [provinceId]);

  // Load models when brandId changes
  useEffect(() => {
    if (!brandId) { setModels([]); setModelId(""); return; }
    (async () => {
      try {
        const res = await fetch(`/api/listings/models?brand_id=${brandId}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.data || []);
        } else {
          setModels([]);
        }
      } catch (e) {
        console.error(e);
        setModels([]);
      }
    })();
  }, [brandId]);

  // new image cleanup
  useEffect(() => {
    return () => newImagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [newImagePreviews]);

  const onSelectNewImages = (files: FileList | null) => {
    if (!files) return;
    const next: File[] = [...newImages];
    const nextURLs: string[] = [...newImagePreviews];
    for (const f of Array.from(files)) {
      const isImg = f.type.startsWith("image/");
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024;
      if (!isImg || !okSize) continue;
      if (next.length + existingImages.length - deleteImageIds.size >= MAX_FILES) break;
      next.push(f);
      nextURLs.push(URL.createObjectURL(f));
    }
    setNewImages(next);
    setNewImagePreviews(nextURLs);
  };

  const removeNewImageAt = (idx: number) => {
    const next = newImages.slice();
    const nextURLs = newImagePreviews.slice();
    URL.revokeObjectURL(nextURLs[idx]);
    next.splice(idx, 1);
    nextURLs.splice(idx, 1);
    setNewImages(next);
    setNewImagePreviews(nextURLs);
  };

  const toggleDeleteExisting = (imgId: string) => {
    const next = new Set(deleteImageIds);
    if (next.has(imgId)) next.delete(imgId);
    else next.add(imgId);
    setDeleteImageIds(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    // validate sơ bộ
    const required = [
      { ok: !!brandId, name: "Hãng xe" },
      { ok: !!modelId, name: "Dòng xe" },
      { ok: !!formData.year, name: "Năm sản xuất" },
      { ok: !!formData.price_vnd, name: "Giá bán" },
      { ok: !!formData.mileage_km, name: "Số km đã đi" },
      { ok: !!formData.title.trim(), name: "Tiêu đề" },
      { ok: !!formData.description.trim(), name: "Mô tả" },
      { ok: !!formData.body_type, name: "Kiểu dáng" },
      { ok: !!provinceId, name: "Tỉnh/Thành" },
      { ok: !!districtId, name: "Quận/Huyện" },
      { ok: !!formData.address_line.trim(), name: "Địa chỉ người bán" },
    ];
    const miss = required.filter(r => !r.ok);
    if (miss.length) {
      alert(`Vui lòng điền đủ:\n${miss.map(m => `- ${m.name}`).join("\n")}`);
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("price_vnd", String(Number(formData.price_vnd) * 1_000_000));
      fd.append("brand_id", String(brandId));
      fd.append("model_id", String(modelId));
      fd.append("year", formData.year);
      fd.append("mileage_km", formData.mileage_km);
      fd.append("body_type", formData.body_type);
      fd.append("gearbox", formData.gearbox);
      fd.append("fuel", formData.fuel);
      fd.append("seats", formData.seats || "");
      fd.append("origin", formData.origin);
      fd.append("color_ext", getHexForColor(formData.color_ext, exteriorColors));
      fd.append("color_int", getHexForColor(formData.color_int, interiorColors));
      fd.append("description", formData.description);
      fd.append("province_id", String(provinceId));
      fd.append("district_id", String(districtId));
      fd.append("address_line", formData.address_line);

      if (formData.video_url) fd.append("video_url", formData.video_url);

      // ảnh mới
      newImages.forEach((f) => fd.append("images", f));

      // ảnh cần xoá
      if (deleteImageIds.size) {
        for (const delId of Array.from(deleteImageIds)) {
          fd.append("delete_image_ids[]", delId);
        }
      }

      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Đã lưu thay đổi.");
      router.push("/admin/listings");
    } catch (err: unknown) {
      console.error(err);
      alert("Lưu thay đổi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-gray-600">Đang tải dữ liệu…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* THÔNG TIN XE */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN XE</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Hãng xe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hãng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={brandId}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : "";
                        setBrandId(v); setModelId("");
                      }}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="">Chọn hãng xe</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    {isSubmitted && !brandId && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn hãng xe</p>}
                  </div>

                  {/* Dòng xe */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dòng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2 border rounded"
                      required
                      disabled={!brandId}
                    >
                      <option value="">{brandId ? "Chọn dòng xe" : "Chọn hãng xe trước"}</option>
                      {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    {isSubmitted && !modelId && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn dòng xe</p>}
                  </div>

                  {/* Năm SX */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm sản xuất<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={4}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value.replace(/[^0-9]/g, "") })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {isSubmitted && !formData.year && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập năm sản xuất</p>}
                  </div>

                  {/* Km đã đi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Km đã đi<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.mileage_km}
                      onChange={(e) => setFormData({ ...formData, mileage_km: e.target.value.replace(/[^0-9]/g, "") })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {isSubmitted && !formData.mileage_km && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập số km</p>}
                  </div>

                  {/* Xuất xứ + Màu */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium mb-1">Xuất xứ<span className="text-red-500">*</span></label>
                        <div className="flex gap-6 items-center">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio" name="origin" value="trong-nuoc"
                              checked={formData.origin === "trong-nuoc"}
                              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Trong nước</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio" name="origin" value="nhap-khau"
                              checked={formData.origin === "nhap-khau"}
                              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Nhập khẩu</span>
                          </label>
                        </div>
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
                            {exteriorColors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            <option value="other">Tự chọn…</option>
                          </select>
                          {(() => {
                            const c = exteriorColors.find(x => x.value === formData.color_ext && x.hex);
                            return c?.hex ? <span className="inline-block w-6 h-6 rounded border" style={{ background: c.hex }} /> : null;
                          })()}
                        </div>
                        {formData.color_ext === "other" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input type="color" onChange={(e) => setFormData({ ...formData, color_ext: e.target.value })} className="w-10 h-10 p-0 border rounded" />
                            <input type="text" placeholder="#RRGGBB" onChange={(e) => setFormData({ ...formData, color_ext: e.target.value.trim() })} className="px-3 py-2 border rounded w-36" />
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
                            {interiorColors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            <option value="other">Tự chọn…</option>
                          </select>
                          {(() => {
                            const c = interiorColors.find(x => x.value === formData.color_int && x.hex);
                            return c?.hex ? <span className="inline-block w-6 h-6 rounded border" style={{ background: c.hex }} /> : null;
                          })()}
                        </div>
                        {formData.color_int === "other" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input type="color" onChange={(e) => setFormData({ ...formData, color_int: e.target.value })} className="w-10 h-10 p-0 border rounded" />
                            <input type="text" placeholder="#RRGGBB" onChange={(e) => setFormData({ ...formData, color_int: e.target.value.trim() })} className="px-3 py-2 border rounded w-36" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hộp số */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
                    <select value={formData.gearbox} onChange={(e) => setFormData({ ...formData, gearbox: e.target.value })} className="w-full px-3 py-2 border rounded">
                      <option value="so-tu-dong">Số tự động</option>
                      <option value="so-san">Số sàn</option>
                      <option value="so-ban-tu-dong">Số bán tự động</option>
                    </select>
                  </div>

                  {/* Nhiên liệu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhiên liệu</label>
                    <select value={formData.fuel} onChange={(e) => setFormData({ ...formData, fuel: e.target.value })} className="w-full px-3 py-2 border rounded">
                      <option value="xang">Xăng</option>
                      <option value="dau">Dầu</option>
                      <option value="dien">Điện</option>
                      <option value="xang-dien">Xăng điện</option>
                    </select>
                  </div>

                  {/* Kiểu dáng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kiểu dáng<span className="text-red-500">*</span></label>
                    <select value={formData.body_type} onChange={(e) => setFormData({ ...formData, body_type: e.target.value })} className="w-full px-3 py-2 border rounded" required>
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
                    {isSubmitted && !formData.body_type && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn kiểu dáng</p>}
                  </div>

                  {/* Số chỗ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ</label>
                    <select value={formData.seats} onChange={(e) => setFormData({ ...formData, seats: e.target.value })} className="w-full px-3 py-2 border rounded">
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

              {/* GIÁ BÁN & MÔ TẢ */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">GIÁ BÁN & MÔ TẢ XE</h2>
                </div>
                <div className="space-y-4">
                  {/* Giá (triệu) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán<span className="text-red-500">*</span></label>
                    <div className="relative flex items-center border border-gray-300 rounded focus-within:border-gray-400">
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Nhập giá bán xe"
                        value={priceTriệuText}
                        onChange={(e) => setFormData({ ...formData, price_vnd: e.target.value.replace(/[^0-9]/g, "") })}
                        className="flex-1 px-3 py-2 border-none focus:outline-none focus:ring-0 pr-28 rounded"
                        required
                      />
                      <span className="absolute right-3 text-gray-700 text-sm pointer-events-none">TRIỆU VNĐ</span>
                    </div>
                    {isSubmitted && !formData.price_vnd && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Giá bán</p>}
                  </div>

                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {isSubmitted && !formData.title && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Tiêu đề</p>}
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả<span className="text-red-500">*</span></label>
                    <textarea
                      rows={8}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded resize-none"
                      required
                    />
                    <div className="flex justify-between mt-1">
                      {isSubmitted && !formData.description && <p className="text-xs text-red-500">⚠ Vui lòng nhập mô tả</p>}
                      <p className="text-xs text-gray-500">{formData.description.length}/3000</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* THÔNG TIN NGƯỜI BÁN */}
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-semibold text-blue-600">THÔNG TIN NGƯỜI BÁN</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ người bán<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.address_line}
                      onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                    {isSubmitted && !formData.address_line.trim() && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập địa chỉ</p>}
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành<span className="text-red-500">*</span></label>
                      <select
                        className="w-full px-3 py-2 border rounded"
                        value={provinceId}
                        onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}
                        required
                      >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {isSubmitted && !provinceId && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn tỉnh/thành</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện<span className="text-red-500">*</span></label>
                      <select
                        className="w-full px-3 py-2 border rounded"
                        value={districtId}
                        onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : "")}
                        disabled={!provinceId}
                        required
                      >
                        <option value="">{provinceId ? "Chọn quận/huyện" : "Chọn Tỉnh/Thành trước"}</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      {isSubmitted && !districtId && <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn quận/huyện</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* SUBMIT */}
              <div className="flex gap-4">
                <button type="button" className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50">
                  Xem trước
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#3B6A84] hover:opacity-90 disabled:bg-gray-400 text-white rounded font-medium">
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>

            {/* ẢNH & VIDEO */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-[16px] font-semibold text-blue-600 mb-4">ẢNH & VIDEO</h3>

                {/* ẢNH HIỆN CÓ */}
                {existingImages.length > 0 && (
                  <>
                    <p className="text-sm font-medium mb-2">Ảnh hiện có</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {existingImages.map((img) => {
                        const marked = deleteImageIds.has(img.id);
                        return (
                          <div key={img.id} className="relative group">
                            <div className="relative w-full h-24 rounded overflow-hidden">
                                <Image
                                src={img.public_url}
                                alt="Ảnh hiện có"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 33vw, 120px"
                                // ảnh trong grid nhỏ — không cần priority
                                />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleDeleteExisting(img.id)}
                              className={`absolute top-1 right-1 rounded text-xs px-2 py-1 ${marked ? "bg-green-600 text-white" : "bg-black/60 text-white"} `}
                            >
                              {marked ? "Hoàn tác" : "Xoá"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* THÊM ẢNH MỚI */}
                <div className="mb-4">
                  <label htmlFor="images" className="block border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50">
                    <div className="text-blue-500 text-4xl mb-2">+</div>
                    <p className="text-sm text-gray-600">
                      Thêm ảnh mới (tối đa {MAX_FILES}, mỗi ảnh ≤ {MAX_SIZE_MB}MB)
                    </p>
                  </label>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onSelectNewImages(e.target.files)}
                  />
                </div>
            
                {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {newImagePreviews.map((previewSrc, idx) => (
                    <div key={`${previewSrc}-${idx}`} className="relative group">
                        <div className="relative w-full h-24 rounded overflow-hidden">
                        <Image
                            src={previewSrc}                       // 👈 dùng previewSrc, KHÔNG phải img.public_url
                            alt={`Ảnh mới ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 120px"
                            unoptimized                             // 👈 cần cho blob/data URL
                        />
                        </div>

                        <button
                        type="button"
                        onClick={() => removeNewImageAt(idx)}
                        className="absolute top-1 right-1 rounded bg-black/60 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100"
                        >
                        Xoá
                        </button>
                    </div>
                    ))}
                </div>
                )}

                {/* VIDEO */}
                <h4 className="text-sm font-semibold text-gray-700 mt-4 mb-2">Video YouTube</h4>
                <input
                  type="url"
                  inputMode="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`w-full px-3 py-2 border rounded ${!formData.video_url || isValidUrl(formData.video_url) ? "border-gray-300" : "border-red-500"}`}
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value.trim() })}
                  onBlur={normalizeVideoUrlOnBlur}
                />
                <p className={`text-xs ${!formData.video_url || isValidUrl(formData.video_url) ? "text-gray-500" : "text-red-600"}`}>
                  {!formData.video_url || isValidUrl(formData.video_url) ? "Ví dụ: https://youtube.com/watch?v=..." : "URL không hợp lệ"}
                </p>

                {(() => {
                  const embed = formData.video_url ? getYouTubeEmbed(formData.video_url) : null;
                  if (!embed) return null;
                  return (
                    <div className="aspect-video w-full overflow-hidden rounded border mt-2">
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
