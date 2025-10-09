// src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/database";
import { sendResetEmail } from "../utils/email";
import logger from "../utils/logger";


/**
 * -----------------------------
 * Đăng ký tài khoản người dùng
 * -----------------------------
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body ?? {};

    // 1) Validate đơn giản
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Thiếu email / password / confirmPassword" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu tối thiểu 6 ký tự" });
    }

    // 2) Check email tồn tại
    const exist = await pool.query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
    if (exist.rowCount && exist.rowCount > 0) {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }

    // 3) Băm mật khẩu
    const passwordHash = await bcrypt.hash(password, 10);

    // 4) Tạo user (DB tự gen id bằng gen_random_uuid())
    const inserted = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email`,
      [email, passwordHash, name ?? email.split("@")[0], phone ?? null]
    );
    const user = inserted.rows[0];

    // 5) Tạo token trả về cho FE (tuỳ bạn có muốn login luôn sau sign-up)
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user });
  } catch (err: any) {
    // Bắt lỗi unique_violation của Postgres (mã 23505) nếu rơi vào race condition
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
export const login = async (req: import("express").Request, res: import("express").Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Thiếu email hoặc mật khẩu" });
    }

    // Tìm user theo email
    const result = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = $1 LIMIT 1",
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

    // Tạo JWT (tuỳ bạn đang để SECRET ở đâu)
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    // Chuẩn hoá dữ liệu trả về cho frontend
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    // Log nội bộ rồi trả JSON 500 chuẩn
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
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    await sendResetEmail(email, rows[0].id);
    res.json({ success: true, message: "Email khôi phục đã được gửi" });
  } catch (err: any) {
    logger?.error(`Forgot password error: ${err.message}`);
    res.status(500).json({ error: "Lỗi máy chủ khi gửi email khôi phục" });
  }
};

/**
 * -----------------------------
 * Reset mật khẩu
 * -----------------------------
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);
    res.json({ success: true, message: "Đặt lại mật khẩu thành công" });
  } catch (err: any) {
    logger?.error(`Reset password error: ${err.message}`);
    res.status(500).json({ error: "Lỗi máy chủ khi đặt lại mật khẩu" });
  }
};

/**
 * -----------------------------
 * Đăng xuất người dùng
 * -----------------------------
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.json({ success: true, message: "Đăng xuất thành công" });
};