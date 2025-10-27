"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    }
  }, []);

  const handleCreateListing = () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để đăng tin");
      return;
    }
    router.push("/create-listing");
  };

  const handleSelfListings= () => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để xem tin đăng bán của bạn");
      return;
    }
    router.push("/listings/self");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/listings"
            className="text-[13px] font-semibold text-gray-800 hover:text-gray-600 tracking-wide uppercase"
          >
            Ô TÔ CŨ
          </Link>
          <Link
            href="/news"
            className="text-[13px] font-semibold text-gray-800 hover:text-gray-600 tracking-wide uppercase"
          >
            TIN TỨC
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelfListings}
            className={`${
              isLoggedIn
                ? "bg-[#2F63B0] hover:bg-[#255390] cursor-pointer" 
                : "bg-gray-400 cursor-not-allowed"
            } text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors uppercase tracking-wide`}
          >
            TIN ĐĂNG BÁN
          </button>

          <button
            onClick={handleCreateListing}
            className={`${
              isLoggedIn 
                ? "bg-[#5CB85C] hover:bg-[#4CAE4C] cursor-pointer" 
                : "bg-gray-400 cursor-not-allowed"
            } text-white text-[13px] font-semibold px-5 py-2 rounded transition-colors uppercase tracking-wide`}
          >
            ĐĂNG TIN
          </button>
        </div>
      </div>
    </nav>
  );
}