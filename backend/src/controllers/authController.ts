// src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/database";
import { sendResetEmail } from "../utils/email";
import logger from "../utils/logger";

<<<<<<< Updated upstream
// Import uuid v4 đúng chuẩn TypeScript + CommonJS
import { v4 as uuidv4 } from "uuid";

=======
>>>>>>> Stashed changes
/**
 * -----------------------------
 * Đăng ký tài khoản người dùng
 * -----------------------------
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Mật khẩu xác nhận không khớp" });

    const derivedName = name || email.split("@")[0] || email.substring(0, 10);
    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const { rows } = await pool.query(
      `INSERT INTO users (id, email, password_hash, name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, email, passwordHash, derivedName, phone]
    );

<<<<<<< Updated upstream
    const token = jwt.sign(
      { id: rows[0].id, is_admin: false },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
=======
    // 5) Tạo token với payload khớp middleware (id thay vì sub, thêm is_admin: false)
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: false }, // Sửa payload để match JwtPayload
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    // Set cookie tự động (httpOnly: true để an toàn, maxAge match exp)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true nếu HTTPS production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
    });

    return res.status(201).json({ token, user });
  } catch (err: any) {
    // Bắt lỗi unique_violation của Postgres (mã 23505) nếu rơi vào race condition
    const code = err?.code || err?.original?.code;
    if (code === "23505") {
      return res.status(409).json({ error: "Email đã được sử dụng" });
    }
>>>>>>> Stashed changes

    const { password_hash, ...safeUser } = rows[0];
    safeUser.username = safeUser.name;

    logger?.info(`User registered: ${email}`);
    res.status(201).json({ success: true, user: safeUser });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Email đã tồn tại" });
    } else {
      logger?.error(`Register error: ${err.message}`);
      res.status(500).json({ error: "Lỗi máy chủ khi đăng ký" });
    }
  }
};

/**
 * -----------------------------
 * Đăng nhập người dùng
 * -----------------------------
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu yêu cầu' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // ✅ Tạo JWT token
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // ✅ Gửi cookie & JSON
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
=======
    // Tạo JWT (tuỳ bạn đang để SECRET ở đâu)
   const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email,
    name: user.name,
    isAdmin: user.is_admin 
  },
  process.env.JWT_SECRET || process.env.SECRET!,
  { expiresIn: '24h' }
);
=======
    // Tạo JWT với payload khớp middleware (id thay vì sub, thêm is_admin: false)
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: false }, // Sửa payload để match JwtPayload
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "7d" }
    );

    // Set cookie tự động (httpOnly: true để an toàn, maxAge match exp)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true nếu HTTPS production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
    });

>>>>>>> Stashed changes
    // Chuẩn hoá dữ liệu trả về cho frontend
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
>>>>>>> Stashed changes
    });

    // ✅ Xóa password_hash và chuẩn hóa user
    const { password_hash, ...safeUser } = user;
    safeUser.username = safeUser.name || email.split('@')[0];

    logger?.info(`User logged in: ${email}`);

    // ✅ Gửi về đúng format frontend đang đợi
    return res.status(200).json({
      token, // 👈 để frontend nhận được token
      user: safeUser, // 👈 để frontend hiển thị tên người dùng
    });
  } catch (err) {
    logger?.error(`Login error: ${err}`);
    res.status(500).json({ error: (err as Error).message });
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
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Đăng xuất thành công" });
};
