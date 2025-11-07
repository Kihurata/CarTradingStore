"use client";
import { Listing, ListingStatus } from "@/src/types/listing";
import ListingRow from "@/src/components/listings/ListingRow";
import { ShieldCheck, Edit3, RefreshCw, AlertTriangle, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
<<<<<<< Updated upstream
import { useState } from "react";

=======
import { useEffect, useRef, useState } from "react";
import AdminReportsDrawer, { ReportCard } from "@/src/components/admin/listings/AdminReportsDrawer";
import { getReportsForListing, updateReportStatus } from "@/src/services/reportService";
>>>>>>> Stashed changes
export default function AdminListingCard({
  data,
  imgPriority = false,
}: {
  data: Listing;
  imgPriority?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${data.id}/approve`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${data.id}/reject`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

<<<<<<< Updated upstream
  const handleEdit = () => router.push(`/admin/listings/${data.id}/edit`);
  const handleRefresh = () => router.refresh();
=======
  // example router
  const handleEdit = () => router.push(`/admin/listings/${data.id}`);

  // Cập nhật trạng thái từ dropdown (APPROVED)
  const changeStatus = async (next: ListingStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${data.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
      setOpenDropdown(false);
    }
  };

    // ====== Dropdown "Cập nhật trạng thái" ======
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

const [openReports, setOpenReports] = useState(false);
const [reports, setReports] = useState<ReportCard[]>([]);
const [reportsLoading, setReportsLoading] = useState(false);
const [reportsError, setReportsError] = useState("");

  useEffect(() => {
    if (!openDropdown) return;
    const onClickAway = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [openDropdown]);

useEffect(() => {
  if (!openReports) return;
  setReportsLoading(true);
  setReportsError("");
  getReportsForListing(data.id)
    .then(setReports)
    .catch((err) => setReportsError(err.message))
    .finally(() => setReportsLoading(false));
}, [openReports, data.id]);

>>>>>>> Stashed changes
  let RightButtons;
  if (data.status === ListingStatus.PENDING) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Duyệt
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Từ chối
        </button>
      </div>
    );
  } else if (data.status === ListingStatus.APPROVED) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
<<<<<<< Updated upstream
=======
        {/* Cập nhật trạng thái (dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenDropdown((v) => !v)}
            disabled={loading}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4" /> Cập nhật trạng thái
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-1 w-44 bg-white text-black border rounded-md shadow-lg z-10">
              <button
                onClick={() => changeStatus(ListingStatus.SOLD)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                Đã bán
              </button>
              {/* <button
                onClick={() => changeStatus(ListingStatus.HIDDEN)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                Lưu trữ
              </button> */}
            </div>
          )}
        </div>

        {/* Báo cáo vi phạm */}
        <button
          onClick={() => setOpenReports(true)}
          className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1.5 rounded text-sm hover:bg-amber-700"
        >
          <AlertTriangle className="w-4 h-4" /> Báo cáo vi phạm
        </button>

          <AdminReportsDrawer
          listingId={data.id}
          open={openReports}
          onClose={() => setOpenReports(false)}
          items={reports}
          loading={reportsLoading}
          error={reportsError}
          onAction={async (reportId, action) => {
            try {
              await updateReportStatus(reportId, action);
              // Refresh reports sau update mà không refresh toàn page
              const updated = await getReportsForListing(data.id);
              setReports(updated);
            } catch (err) {
              console.error(err);
              // Optional: Thêm toast error nếu bạn có thư viện toast, nhưng không bắt buộc
            }
          }}
        />

        {/* Chỉnh sửa */}
>>>>>>> Stashed changes
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          <Edit3 className="w-4 h-4" /> Chỉnh sửa
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 bg-gray-500 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4" /> Làm mới
        </button>
        <button
          disabled
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm cursor-default"
        >
          <ShieldCheck className="w-4 h-4" /> Đã duyệt
        </button>
      </div>
    );
  } else if (data.status === ListingStatus.REJECTED) {
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4" /> Đã từ chối
        </div>
      </div>
    );
  } else {
    // draft hoặc khác
    RightButtons = (
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1 bg-gray-400 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-500"
        >
          <Edit3 className="w-4 h-4" /> Chỉnh sửa
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <ListingRow
        data={data}
        rightArea={RightButtons}
        titleAsLink
        variant="admin"
        imgPriority={imgPriority}
      />
    </div>
  );
}
