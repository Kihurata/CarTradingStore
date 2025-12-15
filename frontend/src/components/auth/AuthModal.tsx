"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Thêm: import useRouter
import { X } from "lucide-react";
import { api } from "@/lib/api";

// --- thêm/đổi TYPE Ở ĐẦU FILE ---
type User = {
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  address?: string;
  is_admin?: boolean; // Thêm: is_admin
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
  const router = useRouter(); // Thêm: hook router
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Quen mat khau
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);


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

      // ✅ Gửi đủ cả confirmPassword + phone + address
      await api("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword, phone, address }),
      });

      alert("🎉 Đăng ký thành công! Hãy đăng nhập.");
      setActiveTab("login");
      // Reset fields sau register (tùy chọn)
      setPhone(""); 
      setAddress(""); 
      setPassword(""); 
      setConfirmPassword("");
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
        localStorage.setItem("user", JSON.stringify(user)); // Bây giờ user có is_admin
        // 🚨 XÓA phần set cookie - backend đã set rồi
      }
      if (onAuthSuccess) {
        onAuthSuccess(user.name || user.email);
      }

      alert("✅ Đăng nhập thành công!");
      onClose();

      // Thêm: Kiểm tra is_admin và redirect nếu true (thay reload)
      if (user.is_admin) {
        router.push('/admin'); // Redirect đến /admin nếu admin
      } else {
        window.location.reload(); // Giữ reload cho user thường (hoặc thay bằng router.refresh() nếu muốn client-side)
      }
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

const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setForgotLoading(true);

  try {
    await api("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });

    alert("✅ Đã gửi hướng dẫn cấp lại mật khẩu về email (nếu email tồn tại).");
    setShowForgot(false);
    setForgotEmail("");
  } catch (err: unknown) {
    console.error("Forgot password error:", err);
    let msg = "Cấp lại mật khẩu thất bại!";
    if (err instanceof Error) msg = err.message;
    alert(msg);
  } finally {
    setForgotLoading(false);
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
            data-testid="auth-login-email-input"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
            required
          />
          
          <input
            type="password"
            placeholder="Mật khẩu *"
            value={password}
            data-testid="auth-login-password-input"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
            required
          />
          {activeTab === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}
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
            data-testid="auth-login-submit-btn"
            className="w-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-[16px] font-semibold py-3 rounded transition-colors"
          >
            {loading
              ? "Đang xử lý..."
              : activeTab === "register"
              ? "Đăng ký"
              : "Đăng nhập"}
          </button>
        </form>
        {showForgot && (
        <div className="absolute inset-0 bg-white rounded-lg p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Quên mật khẩu</h3>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Đóng quên mật khẩu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Gmail / Email *"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 text-black focus:outline-none focus:border-gray-400"
              required
            />

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[16px] font-semibold py-3 rounded transition-colors"
            >
              {forgotLoading ? "Đang gửi..." : "Xác nhận"}
            </button>

            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full border border-gray-300 text-gray-700 text-[16px] font-semibold py-3 rounded hover:bg-gray-50 transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </form>
        </div>
      )}

      </div>
    </div>
  );
}