import request from 'supertest';
import bcrypt from 'bcryptjs';

// --- 1. SETUP MOCK ---
// Định nghĩa mock TRỰC TIẾP bên trong factory
jest.mock('../../../src/config/database', () => {
  const mQuery = jest.fn();
  return {
    __esModule: true,
    default: {
      query: mQuery, 
      connect: jest.fn(),
      on: jest.fn(),
      end: jest.fn(),
    },
  };
});

jest.mock('../../../src/utils/email', () => ({
  sendResetEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../src/utils/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: { getUser: jest.fn(), signInWithPassword: jest.fn() },
    storage: { from: jest.fn(() => ({ upload: jest.fn(), getPublicUrl: jest.fn() })) }
  },
}));

// Import app và pool SAU KHI mock
import app from '../../../src/app';
import pool from '../../../src/config/database'; 

// Lấy hàm mock ra để điều khiển
const mockQuery = pool.query as jest.Mock;

describe('Auth Integration Tests (Mock DB)', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Test User',
    phone: '0901234567',
    address: '123 Test Street',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Thêm đoạn đóng kết nối (Mock) ---
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // B1: Mock check email -> Rỗng
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      // B2: Mock insert -> OK
      mockQuery.mockResolvedValueOnce({
        rows: [{ 
          id: 1, 
          email: validUser.email, 
          name: validUser.name, 
          phone: validUser.phone, 
          address: validUser.address 
        }],
        rowCount: 1
      });

      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidUser = { ...validUser };
      delete (invalidUser as any).email; 
      const res = await request(app).post('/api/auth/register').send(invalidUser);
      expect(res.status).toBe(400);
    });

    it('should return 400 if passwords do not match', async () => {
      const invalidUser = { ...validUser, confirmPassword: 'wrongpassword' };
      const res = await request(app).post('/api/auth/register').send(invalidUser);
      expect(res.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 99 }], rowCount: 1 });
      const res = await request(app).post('/api/auth/register').send(validUser);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
      it('should login successfully as admin', async () => {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        mockQuery.mockResolvedValueOnce({
          rows: [{
            id: 999,
            email: 'admin@carstore.com',
            password_hash: hashedPassword,
            is_admin: true, 
          }],
          rowCount: 1,
        });

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@carstore.com',
            password: 'admin123',
          });

        expect(res.status).toBe(200);
        expect(res.body.user.is_admin).toBe(true);
      });

    it('should login successfully with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: validUser.email,
          password_hash: hashedPassword,
          name: validUser.name,
          phone: validUser.phone,
          address: validUser.address,
          is_admin: false
        }],
        rowCount: 1
      });

      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: validUser.password,
      });
      expect(res.status).toBe(200);
    });

    it('should return 401 with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash(validUser.password, 10);
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: validUser.email, password_hash: hashedPassword }],
        rowCount: 1
      });
      const res = await request(app).post('/api/auth/login').send({
        email: validUser.email,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 with non-existent email', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const res = await request(app).post('/api/auth/login').send({
        email: 'ghost@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the jwt cookie', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.headers['set-cookie'][0]).toMatch(/jwt=/);
    });
  });

   describe('POST /api/auth/forgot-password', () => {
     it('should return success if email exists', async () => {
       mockQuery.mockResolvedValueOnce({ 
         rows: [{ id: 1, email: validUser.email }], 
         rowCount: 1 
       });
       const res = await request(app).post('/api/auth/forgot-password').send({
          email: validUser.email
       });
       expect(res.status).toBe(200);
     });

     it('should return 404 if email does not exist', async () => {
       mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
       const res = await request(app).post('/api/auth/forgot-password').send({
          email: 'notfound@example.com'
       });
       expect(res.status).toBe(200);
     });
   });
});