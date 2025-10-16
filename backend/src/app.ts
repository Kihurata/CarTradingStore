import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import pool from "./config/database";
import logger from "./utils/logger";
import apiProxyRoutes from "./routes/apiProxyRoutes";

const app: Application = express();

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://frontend:3000"],
    credentials: true,
  })
);

<<<<<<< Updated upstream
// Cho phép parse JSON & form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * -----------------------------
 * Định tuyến API
 * -----------------------------
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/listings", listingRoutes);

/**
 * -----------------------------
 * Route kiểm tra hệ thống
 * -----------------------------
 */
=======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check trước
>>>>>>> Stashed changes
app.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({
      status: "OK",
      message: "🚗 Backend CarTradingStore running!",
      db_time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: "ERROR",
      message: err instanceof Error ? err.message : String(err),
    });
  }
});


<<<<<<< Updated upstream
=======
// Các route nội bộ (chạy trực tiếp backend thật)
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);

app.use("/api", apiProxyRoutes);
// Global error handler
>>>>>>> Stashed changes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger?.error(`Global error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
  });

  res.status(500).json({
    error: "Lỗi server nội bộ",
    message: err.message,
  });
});

export default app;
