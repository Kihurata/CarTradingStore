import { generateStatsPDF } from '../../../src/utils/pdfGenerator';
import PDFDocument from 'pdfkit';

jest.mock('pdfkit');

describe('PDFGenerator Utils', () => {
  it('should generate a PDF buffer with correct stats', async () => {
    const mockData = {
      period: '10/2023',
      totalListings: 10,
      approvedListings: 5,
      totalReports: 2,
    };

    const mockDocInstance: any = {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('PDF Content'));
        }
        if (event === 'end') {
          callback();
        }
        return mockDocInstance;
      }),
      end: jest.fn(),
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
    };

    (PDFDocument as unknown as jest.Mock).mockImplementation(() => mockDocInstance);

    const result = await generateStatsPDF(mockData, {});

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toContain('PDF Content');
    expect(mockDocInstance.text).toHaveBeenCalledWith(expect.stringContaining('Báo cáo Thống kê Autorizz'), 100, 100);
    expect(mockDocInstance.end).toHaveBeenCalled();
  });
});