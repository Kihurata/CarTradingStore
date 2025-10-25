import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { Report, ReportType, ReportStatus } from '../models/report';
import { logAudit } from './auditService';

export async function createReport(data: {
  listing_id: string;
  reporter_id?: string | null;
  reporter_phone?: string | null;
  type: ReportType;
  note?: string | null;
}): Promise<Report> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validation
    if (!data.listing_id) throw new Error('Listing ID is required');
    if (!data.type || !Object.values(ReportType).includes(data.type)) {
      throw new Error('Invalid report type');
    }
    // Bắt buộc ít nhất một trong reporter_id hoặc reporter_phone (chống spam anonymous hoàn toàn rỗng)
    if (!data.reporter_id && !data.reporter_phone) {
      throw new Error('Either reporter_id or reporter_phone is required');
    }

    const reportId = uuidv4();

    const { rows: [newReport] } = await client.query(
      `
      INSERT INTO reports (
        id, listing_id, reporter_id, reporter_phone, type, note, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        reportId,
        data.listing_id,
        data.reporter_id || null,
        data.reporter_phone || null,
        data.type,
        data.note || null,
        ReportStatus.NEW,
      ]
    );

    await client.query('COMMIT');

    // Log audit (nếu có reporter_id)
    if (data.reporter_id) {
      await logAudit(data.reporter_id, 'report.create', 'report', reportId, { type: data.type });
    }

    return newReport as Report;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createReport error:', err);
    throw err;
  } finally {
    client.release();
  }
}