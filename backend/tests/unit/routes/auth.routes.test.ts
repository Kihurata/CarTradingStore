import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/authRoutes';
import * as authController from '../../../src/controllers/authController';

jest.mock('../../../src/controllers/authController');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Unit Test: Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
  [Description]: Kiểm tra route POST /register có gọi đúng controller authController.register hay không.
  [Pre-condition]: Route '/api/auth' đã được cấu hình vào app Express.
  [Data Test]: Method: POST, Path: '/api/auth/register', Body: {}
  [Steps]: 
    1. Mock authController.register trả về status 200.
    2. Gửi request POST đến '/api/auth/register'.
  [Expected Result]: Controller authController.register được gọi chính xác.
  */
  it('POST /register should call authController.register', async () => {
    (authController.register as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/register').send({});
    
    expect(authController.register).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route POST /login có gọi đúng controller authController.login hay không.
  [Pre-condition]: Route '/api/auth' đã được cấu hình vào app Express.
  [Data Test]: Method: POST, Path: '/api/auth/login', Body: {}
  [Steps]: 
    1. Mock authController.login trả về status 200.
    2. Gửi request POST đến '/api/auth/login'.
  [Expected Result]: Controller authController.login được gọi chính xác.
  */
  it('POST /login should call authController.login', async () => {
    (authController.login as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/login').send({});

    expect(authController.login).toHaveBeenCalled();
  });

  /*
  [Description]: Kiểm tra route POST /forgot-password có gọi đúng controller authController.forgotPassword hay không.
  [Pre-condition]: Route '/api/auth' đã được cấu hình vào app Express.
  [Data Test]: Method: POST, Path: '/api/auth/forgot-password', Body: {}
  [Steps]: 
    1. Mock authController.forgotPassword trả về status 200.
    2. Gửi request POST đến '/api/auth/forgot-password'.
  [Expected Result]: Controller authController.forgotPassword được gọi chính xác.
  */
  it('POST /forgot-password should call authController.forgotPassword', async () => {
    (authController.forgotPassword as jest.Mock).mockImplementation((req, res) => res.sendStatus(200));

    await request(app).post('/api/auth/forgot-password').send({});

    expect(authController.forgotPassword).toHaveBeenCalled();
  });
});