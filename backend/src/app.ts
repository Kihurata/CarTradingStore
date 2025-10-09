
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import pool from "./config/database";
import logger from "./utils/logger";

const app: Application = express();

// Thêm cookieParser
app.use(cookieParser());

// CORS cho frontend (local + Docker)
app.use(
  cors({
    origin: [
      "http://localhost:3000", // frontend local
      "http://frontend:3000",  // frontend trong docker
    ],
    credentials: true, // cho phép gửi cookie và auth header
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes); 

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