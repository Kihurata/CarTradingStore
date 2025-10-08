// src/utils/pdfGenerator.ts
import PDFDocument from 'pdfkit';

export async function generateStatsPDF(statsData: any, pool: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(25).text('Báo cáo Thống kê Autorizz', 100, 100);
    doc.text(`Thời gian: ${statsData.period || 'N/A'}`, 100, 150);
    doc.text(`Số bài đăng: ${statsData.totalListings || 0}`, 100, 180);
    doc.text(`Bài duyệt: ${statsData.approvedListings || 0}`, 100, 210);
    doc.text(`Báo cáo: ${statsData.totalReports || 0}`, 100, 240);

    doc.end();
  });
}