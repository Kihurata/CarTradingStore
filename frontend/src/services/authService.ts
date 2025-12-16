import { apiUrl } from './http'; // Import helper từ file http.ts có sẵn

export const authService = {
  // Hàm gọi API quên mật khẩu
  forgotPassword: async (email: string) => {
    const res = await fetch(apiUrl('/auth/forgot-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Hàm gọi API đặt lại mật khẩu
  resetPassword: async (token: string, newPassword: string) => {
    const res = await fetch(apiUrl('/auth/reset-password'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return res.json();
  }
};
