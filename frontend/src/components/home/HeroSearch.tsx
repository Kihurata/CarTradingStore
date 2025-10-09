"use client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/src/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const [brand, setBrand] = useState<string>();
  const [q, setQ] = useState("");
  const router = useRouter();

  const go = () => {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (q) p.set("q", q);
    router.push(`/listings?${p.toString()}`);
  };

  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-3 gap-3">
        <Select onValueChange={setBrand}>
          <SelectTrigger><SelectValue placeholder="Chọn hãng xe" /></SelectTrigger>
          <SelectContent>
            {["Toyota","Kia","Mazda","Ford","Honda","Hyundai"].map(h => (
              <SelectItem key={h} value={h.toLowerCase()}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Từ khóa (VD: Camry, Sportage…)" value={q} onChange={e=>setQ(e.target.value)} />
        <Button onClick={go}>Tìm kiếm</Button>
      </div>
    </section>
  );
}
