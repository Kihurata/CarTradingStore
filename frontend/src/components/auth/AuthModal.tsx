"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";

// --- thêm/đổi TYPE Ở ĐẦU FILE ---
type User = {
  id?: string;
  name?: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onAuthSuccess?: (userName: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (activeTab === "register") {
      if (password !== confirmPassword) {
        alert("❌ Mật khẩu nhập lại không khớp!");
        setLoading(false);
        return;
      }

      // ✅ Gửi đủ cả confirmPassword
      await api("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      alert("🎉 Đăng ký thành công! Hãy đăng nhập.");
      setActiveTab("login");
    } else {
      // ✅ Đăng nhập
      const data = await api<AuthResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = data;
      if (!token || !user) throw new Error("Thiếu dữ liệu phản hồi từ server.");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Thêm: Lưu token vào cookie để middleware backend đọc (match req.cookies.jwt)
        document.cookie = `jwt=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure=false`; // 7 ngày, dev: secure=false
        console.log("New JWT cookie set from AuthModal:", token.substring(0, 20) + "...");
      }

      if (onAuthSuccess) {
        onAuthSuccess(user.name || user.email);
      }

      alert("✅ Đăng nhập thành công!");
      onClose();
    }
  } catch (err: unknown) {
    console.error("Auth error:", err);
    let msg = "Đăng nhập/Đăng ký thất bại!";
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message) as { error?: string };
        msg = parsed.error ?? err.message;
      } catch {
        msg = err.message;
      }
    }
    alert(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-4 text-[17px] font-semibold transition-colors ${
              activeTab === "login"
                ? "text-gray-900 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-4 text-[17px] font-semibold transition-colors ${
              activeTab === "register"
                ? "text-gray-900 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
            required
          />
          
          <input
            type="password"
            placeholder="Mật khẩu *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
            required
          />

          {activeTab === "register" && (
            <>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
                required
              />

              <input
                type="tel"
                placeholder="Số điện thoại *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
                required
                inputMode="tel"
                pattern="^[0-9+\s\-().]{8,20}$"
                title="Nhập số điện thoại hợp lệ (8–20 ký tự)"
              />

              <input
                type="text"
                placeholder="Địa chỉ *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
                required
              />  
          </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-[16px] font-semibold py-3 rounded transition-colors"
          >
            {loading
              ? "Đang xử lý..."
              : activeTab === "register"
              ? "Đăng ký"
              : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}