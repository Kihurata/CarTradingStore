import { generateStatsPDF } from '../../../src/utils/pdfGenerator';
import PDFDocument from 'pdfkit';

jest.mock('pdfkit');

describe('PDFGenerator Utils', () => {
  /*
  [Description]: Kiểm tra xem hàm generateStatsPDF có tạo ra một Buffer PDF chứa dữ liệu thống kê chính xác hay không.
  [Pre-condition]: Thư viện pdfkit (PDFDocument) được mock thành công để không tạo file thật.
  [Data Test]: mockData = { period: '10/2023', totalListings: 10, approvedListings: 5, totalReports: 2 }
  [Steps]: 
    1. Mock instance của PDFDocument (các hàm on, end, text, fontSize...).
    2. Gọi hàm generateStatsPDF với dữ liệu giả lập.
  [Expected Result]: 
    - Kết quả trả về là một Buffer.
    - Hàm text của PDFDocument được gọi để ghi tiêu đề.
    - Hàm end được gọi để kết thúc file.
  */
  it('should generate a PDF buffer with correct stats', async () => {
    const mockData = {
      period: '10/2023',
      totalListings: 10,
      approvedListings: 5,
      totalReports: 2,
    };

    const mockDocInstance: any = {
      // Giả lập sự kiện 'data' và 'end' để resolve promise
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

    // Kiểm tra kết quả là Buffer và chứa nội dung đã mock
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toContain('PDF Content');
    
    // Kiểm tra nội dung chính (ví dụ: tiêu đề) có được ghi vào document hay không
    expect(mockDocInstance.text).toHaveBeenCalledWith(expect.stringContaining('Báo cáo Thống kê Autorizz'), 100, 100);
    
    // Đảm bảo hàm end() đã được gọi để kết thúc document
    expect(mockDocInstance.end).toHaveBeenCalled();
  });
});