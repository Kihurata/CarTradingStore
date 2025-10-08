// src/services/statsService.ts
import pool from '../config/database';

export async function getStats(period: 'day' | 'month' | 'year', dateFilter?: string) {
  let whereClause = '';
  const params: any[] = [];
  if (dateFilter) {
    whereClause = `WHERE DATE_TRUNC('${period}', created_at) = DATE_TRUNC('${period}', $1::timestamptz)`;
    params.push(dateFilter);
  }

  const totalListingsQuery = `SELECT COUNT(*)::int as total FROM listings ${whereClause}`;
  const approvedQuery = `SELECT COUNT(*)::int as approved FROM listings WHERE status = 'approved' ${whereClause}`;
  const reportsQuery = `SELECT COUNT(*)::int as total_reports FROM reports ${whereClause.replace('listings', 'reports')}`;

  const [totalRes, approvedRes, reportsRes] = await Promise.all([
    pool.query(totalListingsQuery, params),
    pool.query(approvedQuery, params),
    pool.query(reportsQuery, params)
  ]);

  return {
    period,
    totalListings: Number(totalRes.rows[0].total),
    approvedListings: Number(approvedRes.rows[0].approved),
    totalReports: Number(reportsRes.rows[0].total_reports),
    dateFilter,
  };
}