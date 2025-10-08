"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onAuthSuccess?: (userName: string) => void;
}

export function AuthModal({ isOpen, onClose, defaultTab = "login", onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const userName = email.split("@")[0] || email.substring(0, 10);

    if (activeTab === "register") {
      console.log("Register:", { email, password, confirmPassword });
    } else {
      console.log("Login:", { email, password });
    }

    if (onAuthSuccess) {
      onAuthSuccess(userName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

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

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <input
            type="text"
            placeholder="Email hoặc Số điện thoại đăng nhập *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
            required
          />

          <input
            type="password"
            placeholder="Mật khẩu *"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
            required
          />

          {activeTab === "register" && (
            <input
              type="password"
              placeholder="Nhập lại mật khẩu *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-400"
              required
            />
          )}

          <button
            type="submit"
            className="w-full bg-[#5CB85C] hover:bg-[#4CAE4C] text-white text-[16px] font-semibold py-3 rounded transition-colors"
          >
            {activeTab === "register" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
