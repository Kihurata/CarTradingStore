// frontend/src/services/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Đăng nhập thất bại");
  }

  const data = await res.json();
  
  // Lưu token
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token');
  }
  return false;
}