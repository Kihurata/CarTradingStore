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

  it('should initialize Supabase client with environment variables', () => {
    process.env.SUPABASE_URL = 'https://mock-url.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'mock-service-key';

    jest.isolateModules(() => {
      require('../../../src/utils/supabase');
    });

    expect(createClient).toHaveBeenCalledWith(
      'https://mock-url.supabase.co',
      'mock-service-key'
    );
  });
});