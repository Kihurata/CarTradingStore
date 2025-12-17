// src/components/layout/UserNavbar.tsx
"use client";

import { BaseNavbar } from "./BaseNavbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNavbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleCreateListing = () => {
    if (!isLoggedIn) return alert("Vui lòng đăng nhập để đăng tin");
    router.push("/create-listing");
  };

  const handleSelfListings = () => {
    if (!isLoggedIn) return alert("Vui lòng đăng nhập để xem tin đăng bán của bạn");
    router.push("/listings/self");
  };

  return (
    <BaseNavbar
      links={[
        { href: "/listings", label: "Ô TÔ CŨ" },
      ]}
      rightButtons={
        <>
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
        </>
      }
    />
  );
}
