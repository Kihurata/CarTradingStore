// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/database";
import { sendResetEmail } from "../utils/email";
import { createPasswordResetToken, resetUserPassword } from "../services/userService";
import logger from "../utils/logger";
import crypto from "crypto";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

function setJwtCookie(res: Response, token: string) {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    path: "/",
  });
}

/**
 * -----------------------------
 * Đăng ký tài khoản người dùng
 * -----------------------------
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name, phone, address } = req.body ?? {};

    if (!email || !password || !confirmPassword || !phone || !address) {
      return res.status(400).json({
        error: "Thiếu email / password / confirmPassword / phone / address",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu tối thiểu 6 ký tự" });
    }
    if (!/^[0-9+\s\-().]{8,20}$/.test(phone)) {
      return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }

    const exist = await pool.query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
    if (exist.rowCount && exist.rowCount > 0) {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Lưu ý: user mới mặc định is_admin = false (DB nên default false)
    const inserted = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, address, is_admin`,
      [email, passwordHash, name ?? email.split("@")[0], phone ?? null, address ?? null]
    );

    const user = inserted.rows[0];

    // Sign token bằng DUY NHẤT JWT_SECRET (không fallback)
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: Boolean(user.is_admin) },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    setJwtCookie(res, token);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        is_admin: Boolean(user.is_admin),
      },
    });
  } catch (err: any) {
    const code = err?.code || err?.original?.code;
    if (code === "23505") {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }
    console.error("Register error:", err?.message || err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * -----------------------------
 * Đăng nhập người dùng
 * -----------------------------
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }

    const result = await pool.query(
      `SELECT id, name, email, phone, address, password_hash, is_admin
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: Boolean(user.is_admin) },
      getJwtSecret(),
      { expiresIn: "7d" }
    );
    console.log("LOGIN token (first 30):", token.slice(0, 30));
    console.log("LOGIN secret length:", process.env.JWT_SECRET?.length);
    console.log(
      "LOGIN secret sha256:",
      crypto.createHash("sha256").update(getJwtSecret()).digest("hex").slice(0, 12)
    );
    setJwtCookie(res, token);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        is_admin: Boolean(user.is_admin),
      },
    });
  } catch (err: any) {
    console.error("Login error:", err?.message || err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * -----------------------------
 * Quên mật khẩu
 * -----------------------------
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Vui lòng nhập email" });

    // Gọi hàm tạo token mới ở Service
    const token = await createPasswordResetToken(email);

    if (token) {
      // Chỉ gửi mail khi có token (email tồn tại)
      await sendResetEmail(email, token);
    }

    // Luôn trả về thành công để bảo mật (tránh dò email)
    res.json({ success: true, message: "Nếu email tồn tại, link reset đã được gửi." });
  } catch (err: any) {
    console.error(`Forgot password error: ${err.message}`);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

/**
 * -----------------------------
 * Reset mật khẩu
 * -----------------------------
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
    }

    // Gọi hàm reset ở Service
    const success = await resetUserPassword(token, newPassword);

    if (!success) {
      return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }

    res.json({ success: true, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (err: any) {
    console.error(`Reset password error: ${err.message}`);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

/**
 * -----------------------------
 * Đăng xuất người dùng
 * -----------------------------
 */
export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.json({ success: true, message: "Đăng xuất thành công" });
};
