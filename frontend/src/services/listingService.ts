import { apiUrl } from "./http";
import { Listing } from "@/src/types/listing";

export async function getListings(): Promise<Listing[]> {
  const res = await fetch(apiUrl("/api/listings"), { cache: "no-store" });
  if (!res.ok) throw new Error("Lấy danh sách xe thất bại");
  const json = await res.json();
  return json.data as Listing[];
}

export async function getListing(id: string): Promise<Listing> {
  const res = await fetch(apiUrl(`/api/listings/${id}`), { cache: "no-store" });
  if (!res.ok) throw new Error("Lấy thông tin xe thất bại");
  const json = await res.json();
  return json.data as Listing;
}