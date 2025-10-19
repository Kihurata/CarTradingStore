import { Router, Request, Response } from "express";
import axios, { AxiosError } from "axios";

const router = Router();

router.all("/*", async (req: Request, res: Response) => {
  try {
    const baseURL = process.env.INTERNAL_API_BASE || "http://localhost:4000";

    // ⚙️ Giữ nguyên prefix /api khi proxy
    const targetURL = `${baseURL}/api${req.path}`;

    console.log("🔍 Proxying request:", req.method, "→", targetURL);

    const headers: Record<string, string> = {
      "Content-Type": req.headers["content-type"] || "application/json",
    };

    if (req.headers.authorization)
      headers["Authorization"] = req.headers.authorization;
    if (req.headers.cookie) headers["Cookie"] = req.headers.cookie;

    const response = await axios({
      method: req.method as any,
      url: targetURL,
      data: req.body,
      headers,
      withCredentials: true,
      validateStatus: () => true,
    });

    // ✅ Debug log ngay trong response gửi về frontend
    res.status(response.status).json({
      debug: {
        proxyMethod: req.method,
        proxyTarget: targetURL,
        backendStatus: response.status,
      },
      data: response.data,
    });
  } catch (error: any) {
    const err = error as AxiosError;
    console.error("❌ Proxy error:", err.message);

    res.status(err.response?.status || 500).json({
      error: "Proxy request failed",
      message: err.message,
      target: err.config?.url,
    });
  }
});

export default router;
