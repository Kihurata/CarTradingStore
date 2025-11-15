import { apiUrl } from "./http";
import { ReportCard } from "@/src/components/admin/listings/AdminReportsDrawer"; // Import type từ component drawer để khớp định dạng

export async function getReportsForListing(listingId: string): Promise<ReportCard[]> {
  const res = await fetch(apiUrl(`reports?listing_id=${listingId}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Lấy báo cáo thất bại");
  const json = await res.json();
  return json.data as ReportCard[]; // Backend sẽ trả { data: [...] }
}

export async function updateReportStatus(reportId: string, status: "valid" | "invalid" | "resolved"): Promise<void> {
  const res = await fetch(apiUrl(`reports/${reportId}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
}