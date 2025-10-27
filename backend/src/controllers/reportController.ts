import { Request, Response } from 'express';
import * as reportService from '../services/reportService';

export const createReport = async (req: Request, res: Response) => {
  try {
    const { listing_id, type, note, reporter_phone } = req.body;
    const reporter_id = (req as any).user?.id; // Từ authenticateToken nếu logged in

    // Debug log
    console.log('📨 Received report request:', { listing_id, type, reporter_id, reporter_phone });

    const newReport = await reportService.createReport({
      listing_id,
      reporter_id: reporter_id || undefined,
      reporter_phone: reporter_phone || undefined,
      type,
      note,
    });

    console.log('✅ Report created:', newReport.id);

    res.status(201).json({
      message: 'Report created successfully',
      id: newReport.id,
    });
  } catch (err) {
    console.error('❌ createReport error:', err);
    // Trả 400 cho validation error (user-friendly), 500 cho lỗi khác
    const status = err || err ? 400 : 500;
    res.status(status).json({ error: (err as Error).message });
  }
};