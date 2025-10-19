// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/src/components/layout/Header";
import { Navbar } from "@/src/components/layout/Navbar";
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}