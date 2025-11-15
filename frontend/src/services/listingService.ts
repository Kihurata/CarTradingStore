import { apiUrl } from "./http";
import { Listing } from "@/src/types/listing";

export type GetListingsParams = {
  page?: number;
  limit?: number;
  status?: string;
  min_price?: number;
  max_price?: number;
  body_type?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "most_viewed";
};

export async function getListings(params: GetListingsParams = {}): Promise<Listing[]> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.min_price != null) searchParams.set("min_price", String(params.min_price));
  if (params.max_price != null) searchParams.set("max_price", String(params.max_price));
  if (params.body_type) searchParams.set("body_type", params.body_type);

  if (params.q && params.q.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();
  const url = queryString ? apiUrl(`listings?${queryString}`) : apiUrl("listings");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Lấy danh sách xe thất bại");

  const json = await res.json();
  return json.data as Listing[];
}

export async function getListing(id: string): Promise<Listing> {
  const res = await fetch(apiUrl(`listings/${id}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Lấy thông tin xe thất bại");
  const json = await res.json();
  return json.data as Listing;
}

export async function updateListing(id: string, formData: FormData): Promise<void> {
  const res = await fetch(apiUrl(`listings/${id}`), {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Cập nhật listing thất bại");
}