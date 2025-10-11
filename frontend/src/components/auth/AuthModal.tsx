// frontend/src/components/auth/AuthModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
<<<<<<< Updated upstream
import { apiUrl } from "@/src/services/http";
=======

type User = {
  id?: string;
  name?: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};
>>>>>>> Stashed changes

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onAuthSuccess?: (userName: string) => void;
}

// Hàm set cookie
const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const cookieValue = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  document.cookie = cookieValue;
  console.log("🍪 Cookie set:", name);
};

// Hàm get cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
};

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        // ✅ Đăng ký
        await api("/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, confirmPassword }),
        });

        alert("🎉 Đăng ký thành công! Hãy đăng nhập.");
        setActiveTab("login");
        // Reset form
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

        console.log("🔐 Login successful - User:", user);
        console.log("🔐 Token received:", token);

        // QUAN TRỌNG: Lưu token vào CẢ localStorage VÀ cookie
        if (typeof window !== "undefined") {
          // 1. Lưu vào localStorage (cho frontend sử dụng)
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // 2. Lưu vào cookie (cho backend sử dụng)
          setCookie("jwt", token, 7); // Lưu 7 ngày
          
          // 3. Verify cookie đã được set
          const verifyCookie = getCookie("jwt");
          console.log("🍪 Cookie verification:", verifyCookie ? "SUCCESS" : "FAILED");
        }

        if (onAuthSuccess) {
          onAuthSuccess(user.name || user.email);
        }

        alert("✅ Đăng nhập thành công!");
        
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        // Đóng modal
        onClose();
      }
<<<<<<< Updated upstream

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
      const data = await api<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = data;
      if (!token || !user) throw new Error("Thiếu dữ liệu phản hồi từ server.");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (onAuthSuccess) {
        onAuthSuccess(user.name || user.email);
      }

      alert("✅ Đăng nhập thành công!");
      onClose();
    }
  } catch (err: any) {
    console.error("Auth error:", err);
    try {
      const parsed = JSON.parse(err.message);
      alert(parsed.error || "Đăng nhập/Đăng ký thất bại!");
    } catch {
      alert(err.message || "Đăng nhập/Đăng ký thất bại!");
    }
  } finally {
    setLoading(false);
  }
};
=======
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
>>>>>>> Stashed changes

  const handleClose = () => {
    // Reset form khi đóng modal
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab("login");
              setConfirmPassword(""); // Reset confirm password khi chuyển tab
            }}
            className={`flex-1 py-4 text-[17px] font-semibold transition-colors ${
              activeTab === "login"
                ? "text-gray-900 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setConfirmPassword(""); // Reset confirm password khi chuyển tab
            }}
            className={`flex-1 py-4 text-[17px] font-semibold transition-colors ${
              activeTab === "register"
                ? "text-gray-900 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email hoặc số điện thoại *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Mật khẩu *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              required
              minLength={6}
            />
          </div>

          {activeTab === "register" && (
            <div>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5CB85C] hover:bg-[#4CAE4C] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-[16px] font-semibold py-3 rounded transition-colors"
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
