"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // ← dùng instance axios/fetch của bạn
type Option = { id: number; name: string };

export default function CreateListingPage() {
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [provinceId, setProvinceId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");

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
    hangXe: "",
    dongXe: "",
    dongXeDung: "",
    tinhTrang: "xe-cu",
    xuatXu: "trong-nuoc",
    namSanXuat: "",
    dienKy: "",
    hopSo: "so-tu-dong",
    nhienLieu: "xang",
    kieuDang: "",
    soChoNgoi: "",
    giaBan: "",
    tieuDe: "",
    moTa: "",
    tenNguoiBan: "",
    soDienThoai: "",
    diaChiNguoiBan: "",
    noiVanXe: "",
    quanHuyen: "",
    videoUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      value={formData.hangXe}
                      onChange={(e) => setFormData({ ...formData, hangXe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    >
                      <option value="">Chọn hãng xe</option>
                      <option value="toyota">Toyota</option>
                      <option value="honda">Honda</option>
                      <option value="mazda">Mazda</option>
                      <option value="ford">Ford</option>
                    </select>
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập hãng xe</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dòng xe<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.dongXe}
                      onChange={(e) => setFormData({ ...formData, dongXe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    >
                      <option value="">Chọn dòng xe</option>
                    </select>
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập dòng xe</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Năm sản xuất<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập số km đã đi"
                      value={formData.namSanXuat}
                      onChange={(e) => setFormData({ ...formData, namSanXuat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex gap-8 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="xuatXu"
                          value="trong-nuoc"
                          checked={formData.xuatXu === "trong-nuoc"}
                          onChange={(e) => setFormData({ ...formData, xuatXu: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Trong nước</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="xuatXu"
                          value="nhap-khau"
                          checked={formData.xuatXu === "nhap-khau"}
                          onChange={(e) => setFormData({ ...formData, xuatXu: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Nhập khẩu</span>
                      </label>
                    </div>
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn xuất xứ</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hộp số
                    </label>
                    <select
                      value={formData.hopSo}
                      onChange={(e) => setFormData({ ...formData, hopSo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="so-tu-dong">Số tự động</option>
                      <option value="so-san">Số sàn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhiên liệu
                    </label>
                    <select
                      value={formData.nhienLieu}
                      onChange={(e) => setFormData({ ...formData, nhienLieu: e.target.value })}
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
                      value={formData.kieuDang}
                      onChange={(e) => setFormData({ ...formData, kieuDang: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                    >
                      <option value="">Chọn kiểu dáng xe</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số chỗ
                    </label>
                    <select
                      value={formData.soChoNgoi}
                      onChange={(e) => setFormData({ ...formData, soChoNgoi: e.target.value })}
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
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập giá bán xe"
                        value={formData.giaBan}
                        onChange={(e) => setFormData({ ...formData, giaBan: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        required
                      />
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        TRIỆU VNĐ
                      </button>
                    </div>
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Giá bán</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ngắn gọn, dễ đọc, tô khéo quan trọng gây chú ý"
                      value={formData.tieuDe}
                      onChange={(e) => setFormData({ ...formData, tieuDe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập Tiêu đề</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="- Mô tả chi tiết về xe&#10;- Tình trạng sơ thẩm của xe&#10;- Tình trạng pháp lý của xe&#10;- Thông tin về bảo hiểm xe&#10;- Tình trạng giấy tờ..."
                      value={formData.moTa}
                      onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400 resize-none"
                      required
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-red-500">⚠ Vui lòng nhập mô tả</p>
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
                      type="text"
                      placeholder="Nhập tên người bán"
                      value={formData.tenNguoiBan}
                      onChange={(e) => setFormData({ ...formData, tenNguoiBan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập tên người bán</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
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
                      value={formData.diaChiNguoiBan}
                      onChange={(e) => setFormData({ ...formData, diaChiNguoiBan: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      required
                    />
                    <p className="text-xs text-red-500 mt-1">⚠ Vui lòng nhập địa chỉ người bán</p>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi bán xe<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        value={provinceId}
                        onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : "")}
                        required
                      >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn tỉnh/thành</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quận/Huyện<span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        value={districtId}
                        onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : "")}
                        disabled={!provinceId}
                        required
                      >
                        <option value="">{provinceId ? "Chọn quận/huyện" : "Chọn Tỉnh/Thành trước"}</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-red-500 mt-1">⚠ Vui lòng chọn quận/huyện</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                >
                  Xem trước tin đăng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#5CB85C] hover:bg-[#4CAE4C] text-white rounded font-medium transition-colors"
                >
                  Đăng tin
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg shadow p-6 sticky top-24">
                <h3 className="text-[16px] font-semibold text-blue-600 mb-4">ĐĂNG ẢNH & VIDEO XE</h3>

                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-4">
                  <div className="text-blue-500 text-4xl mb-2">+</div>
                  <p className="text-sm text-gray-600">Thêm ảnh</p>
                </div>

                <p className="text-xs text-red-500 mb-3">⚠ Vui lòng nhập dòng xe</p>

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