import request from 'supertest';
import express from 'express';
import axios from 'axios';
import apiProxyRoutes from '../../../src/routes/apiProxyRoutes';

// Giả lập Axios
jest.mock('axios');
// Ép kiểu axios về jest.Mock để sử dụng các hàm mock
const mockedAxios = axios as unknown as jest.Mock;

const app = express();
app.use(express.json());
app.use('/api', apiProxyRoutes);

describe('Unit Test: API Proxy Routes', () => {
  afterEach(() => jest.clearAllMocks());

  /*
  [Description]: Kiểm tra xem proxy có chuyển tiếp request đến API nội bộ và trả về dữ liệu thành công hay không.
  [Pre-condition]: Axios được mock trả về response thành công (200).
  [Data Test]: Method: GET, Path: '/api/some-service'
  [Steps]: 
    1. Mock Axios trả về object { status: 200, data: ... }.
    2. Gửi request GET đến '/api/some-service'.
  [Expected Result]: 
    - Axios được gọi với đúng URL và Method.
    - Response trả về status 200 và dữ liệu từ API nội bộ.
  */
  it('should forward request to internal API and return data', async () => {
    const mockResponse = {
      status: 200,
      data: { result: 'Success from Internal API' }
    };
    
    // Giả lập Axios trả về phản hồi thành công
    mockedAxios.mockResolvedValue(mockResponse);

    const res = await request(app).get('/api/some-service');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ result: 'Success from Internal API' });
    
    // Xác minh Axios được gọi với cấu hình đúng (URL và method GET)
    expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/some-service'),
      method: 'GET'
    }));
  });

  /*
  [Description]: Kiểm tra xem proxy có xử lý lỗi từ API nội bộ (ví dụ: lỗi 500) và trả về thông báo lỗi thích hợp hay không.
  [Pre-condition]: Axios mock gặp lỗi khi gọi API nội bộ.
  [Data Test]: Method: GET, Path: '/api/error-path'
  [Steps]: 
    1. Mock Axios ném ra lỗi (Rejected Value) với status 500.
    2. Gửi request GET đến '/api/error-path'.
  [Expected Result]: Response trả về status 500 và thông báo lỗi 'Proxy request failed'.
  */
  it('should handle axios error (e.g., 500 from internal API)', async () => {
    const mockError = {
      message: 'Internal Server Error',
      response: { status: 500, data: 'Error detail' },
      config: { url: 'http://localhost:4000/error-path' }
    };
    
    // Giả lập Axios thất bại (rejected value)
    mockedAxios.mockRejectedValue(mockError);

    const res = await request(app).get('/api/error-path');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Proxy request failed');
  });
});