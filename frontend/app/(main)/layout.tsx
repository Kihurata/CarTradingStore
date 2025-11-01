// src/app/layout.tsx
import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/src/components/layout/Header";
import { UserNavbar } from "@/src/components/layout/UserNavbar";
import { Footer } from "@/src/components/layout/Footer";

export const metadata: Metadata = {
  title: "XeVip",
  description: "Chợ xe trực tuyến",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <UserNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}