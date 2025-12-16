// frontend/app/(main)/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Dùng đường dẫn tương đối để đi từ 'app/(main)/reset-password' sang 'src'
import { authService } from '../../../src/services/authService';

// Component chứa logic xử lý Search Params
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage('Lỗi: Token không tồn tại hoặc link không hợp lệ.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      setStatus('loading');
      // Gọi API reset password
      const res = await authService.resetPassword(token, password);
      
      if (res.success) {
        setStatus('success');
        setMessage('Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...');
        // Chờ 2 giây rồi chuyển về trang chủ/login
        setTimeout(() => {
          router.push('/?login=true'); // Hoặc đường dẫn login của bạn
        }, 2000);
      } else {
        setStatus('error');
        setMessage(res.error || 'Có lỗi xảy ra.');
      }
    } catch (error: any) {
      setStatus('error');
      // Lấy lỗi từ response API nếu có
      setMessage(error.message || 'Token hết hạn hoặc không hợp lệ.');
    }
  };

  if (!token) {
    return (
      <div className="text-red-500 text-center py-10">
        Link không hợp lệ (Thiếu token). Vui lòng kiểm tra lại email.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Đặt lại mật khẩu</h1>
      
      {status === 'success' ? (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4 text-center">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {status === 'error' && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {status === 'loading' ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
}

// Wrap component trong Suspense để tránh lỗi useSearchParams trong Next.js App Router
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <Suspense fallback={<div className="text-center">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
