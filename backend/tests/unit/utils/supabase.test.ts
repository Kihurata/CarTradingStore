import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Supabase Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  /*
  [Description]: Kiểm tra xem Supabase client có được khởi tạo chính xác bằng cách sử dụng các biến môi trường (URL và Khóa dịch vụ) hay không.
  [Pre-condition]: Thư viện @supabase/supabase-js được mock.
  [Data Test]: SUPABASE_URL='https://mock-url.supabase.co', SUPABASE_SERVICE_KEY='mock-service-key'
  [Steps]: 
    1. Gán giá trị giả lập cho biến môi trường (process.env).
    2. Sử dụng jest.isolateModules để require lại module supabase (kích hoạt khởi tạo).
  [Expected Result]: Hàm createClient được gọi với đúng URL và Key đã gán.
  */
  it('should initialize Supabase client with environment variables', () => {
    process.env.SUPABASE_URL = 'https://mock-url.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';

    // Sử dụng jest.isolateModules để tải lại module sau khi gán biến môi trường
    jest.isolateModules(() => {
      require('../../../src/utils/supabase');
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
  });
});