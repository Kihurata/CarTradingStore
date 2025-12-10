import request from 'supertest';
import express from 'express';
import axios from 'axios';
import apiProxyRoutes from '../../../src/routes/apiProxyRoutes';

// ✅ Mock Axios
jest.mock('axios');
// ✅ SỬA: Ép kiểu axios về jest.Mock để TS không báo lỗi
const mockedAxios = axios as unknown as jest.Mock;

const app = express();
app.use(express.json());
app.use('/api', apiProxyRoutes);

describe('Unit Test: API Proxy Routes', () => {
  afterEach(() => jest.clearAllMocks());

  it('should forward request to internal API and return data', async () => {
    const mockResponse = {
      status: 200,
      data: { result: 'Success from Internal API' }
    };
    
    // ✅ Axios được gọi như 1 function: axios({ ... })
    mockedAxios.mockResolvedValue(mockResponse);

    const res = await request(app).get('/api/some-service');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ result: 'Success from Internal API' });
    
    // Verify axios called with correct config
    expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/some-service'),
      method: 'GET'
    }));
  });

  it('should handle axios error (e.g., 500 from internal API)', async () => {
    const mockError = {
      message: 'Internal Server Error',
      response: { status: 500, data: 'Error detail' },
      config: { url: 'http://localhost:4000/error-path' }
    };
    
    // ✅ SỬA: mockRejectedValue trên instance mock
    mockedAxios.mockRejectedValue(mockError);

    const res = await request(app).get('/api/error-path');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Proxy request failed');
  });
});